import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { NextResponse } from 'next/server';

import { scoreQuestion, type ScoreDetail } from '@/lib/scoring';
import { loadLocalScoringRecords, type ScoringRecord } from '@/lib/tests';
import { getSupabaseAdmin, hasSupabaseCredentials } from '@/lib/supabaseAdmin';

function isSafeTestId(testId: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(testId);
}

interface SubmissionPayload {
  answers?: Record<string, unknown>;
}

function sanitizeForFilename(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, '_');
}

function stringifyForCsv(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

function toCsvValue(value: unknown): string {
  const raw = stringifyForCsv(value);
  const escaped = raw.replace(/"/g, '""');
  return /[",\n\r]/.test(raw) ? `"${escaped}"` : escaped;
}

function createCsvLine(values: unknown[]): string {
  return values.map(toCsvValue).join(',');
}

async function persistSubmissionCsv(
  testId: string,
  submissionId: string | null,
  details: ScoreDetail[],
  answers: Record<string, unknown>
): Promise<string> {
  const resultsDir = path.join(process.cwd(), 'tests', testId, 'results');
  await mkdir(resultsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const submissionSlug = submissionId ? `submission-${sanitizeForFilename(submissionId)}` : 'submission-local';
  const fileName = `${timestamp}--${submissionSlug}.csv`;
  const filePath = path.join(resultsDir, fileName);

  const header = createCsvLine([
    'submission_id',
    'question_id',
    'user_answer',
    'is_correct',
    'score',
    'max_score',
    'correct_answer',
  ]);

  const rows = details.map((detail) =>
    createCsvLine([
      submissionId ?? '',
      detail.qId,
      answers[detail.qId] ?? '',
      detail.isCorrect ? 'true' : 'false',
      detail.score,
      detail.maxScore,
      detail.correctAnswer ?? '',
    ])
  );

  await writeFile(filePath, [header, ...rows].join('\n'), 'utf-8');
  return filePath;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ testId: string }> }
) {
  const { testId } = await context.params;
  if (!isSafeTestId(testId)) {
    return NextResponse.json({ error: 'Invalid test id' }, { status: 400 });
  }

  let payload: SubmissionPayload;
  try {
    payload = (await request.json()) as SubmissionPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const rawAnswers = payload.answers ?? {};
  if (typeof rawAnswers !== 'object' || Array.isArray(rawAnswers)) {
    return NextResponse.json({ error: 'Answers must be an object keyed by q_id' }, { status: 400 });
  }
  const answers = rawAnswers as Record<string, unknown>;

  const supabaseConfigured = hasSupabaseCredentials();
  const supabase = getSupabaseAdmin();
  let scoringRecords: ScoringRecord[] | null = null;
  let supabaseOperational = false;

  if (supabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('q_id, q_type, correct_json')
        .eq('test_id', testId);

      if (!error && data) {
        scoringRecords = data.map((row) => ({ qId: row.q_id, qType: row.q_type, correctJson: row.correct_json }));
        supabaseOperational = true;
      }
    } catch {
      supabaseOperational = false;
    }
  }

  if (!scoringRecords || scoringRecords.length === 0) {
    scoringRecords = await loadLocalScoringRecords(testId);
    if (!scoringRecords || scoringRecords.length === 0) {
      return NextResponse.json({ error: 'No scoring data available for this test.' }, { status: 404 });
    }
  }

  const details = scoringRecords.map((record) => scoreQuestion(record, answers[record.qId]));
  const totalScore = details.reduce((sum, detail) => sum + detail.score, 0);
  const maxScore = details.reduce((sum, detail) => sum + detail.maxScore, 0);
  const answeredCount = Object.values(answers).filter((value) => value !== undefined && value !== null && value !== '').length;

  let submissionId: string | null = null;
  const warnings: string[] = [];

  if (supabaseOperational && supabase) {
    try {
      const { data: submissionData, error: submissionError } = await supabase
        .from('submissions')
        .insert({ test_id: testId })
        .select('submission_id')
        .single();

      if (submissionError) {
        warnings.push('Unable to persist submission metadata to Supabase.');
      } else {
        submissionId = submissionData?.submission_id ?? null;
        if (submissionId) {
          const payloadRows = details.map((detail) => ({
            submission_id: submissionId,
            q_id: detail.qId,
            answer_json: answers[detail.qId] ?? null,
            score: detail.score,
            max_score: detail.maxScore,
          }));

          if (payloadRows.length > 0) {
            const { error: answersError } = await supabase.from('submission_answers').insert(payloadRows);
            if (answersError) {
              warnings.push('Unable to persist question-level scoring to Supabase.');
            }
          }
        }
      }
    } catch {
      warnings.push('Unexpected Supabase error while saving submission.');
    }
  } else if (supabaseConfigured) {
    warnings.push('Supabase is configured but unreachable; results were scored locally only.');
  } else {
    warnings.push('Supabase credentials are not configured; results were scored locally only.');
  }

  const perQuestion = Object.fromEntries(
    details.map((detail) => [
      detail.qId,
      {
        score: detail.score,
        maxScore: detail.maxScore,
        isCorrect: detail.isCorrect,
        correctAnswer: detail.correctAnswer ?? null,
      },
    ])
  );

  try {
    await persistSubmissionCsv(testId, submissionId, details, answers);
  } catch {
    warnings.push('Unable to save a local CSV copy of the submission results.');
  }

  return NextResponse.json({
    testId,
    submissionId,
    totalScore,
    maxScore,
    answered: answeredCount,
    questionCount: details.length,
    warnings,
    perQuestion,
  });
}
