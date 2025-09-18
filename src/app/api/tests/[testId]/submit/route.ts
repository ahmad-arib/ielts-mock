import { NextResponse } from 'next/server';

import { scoreQuestion } from '@/lib/scoring';
import { loadLocalScoringRecords, type ScoringRecord } from '@/lib/tests';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function isSafeTestId(testId: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(testId);
}

interface SubmissionPayload {
  answers?: Record<string, unknown>;
}

export async function POST(request: Request, { params }: { params: { testId: string } }) {
  const { testId } = params;
  if (!isSafeTestId(testId)) {
    return NextResponse.json({ error: 'Invalid test id' }, { status: 400 });
  }

  let payload: SubmissionPayload;
  try {
    payload = (await request.json()) as SubmissionPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const answers = payload.answers ?? {};
  if (typeof answers !== 'object' || Array.isArray(answers)) {
    return NextResponse.json({ error: 'Answers must be an object keyed by q_id' }, { status: 400 });
  }

  const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  let scoringRecords: ScoringRecord[] | null = null;
  let supabaseOperational = false;

  if (supabaseConfigured) {
    try {
      const { data, error } = await supabaseAdmin
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

  const details = scoringRecords.map((record) => scoreQuestion(record, (answers as Record<string, unknown>)[record.qId]));
  const totalScore = details.reduce((sum, detail) => sum + detail.score, 0);
  const maxScore = details.reduce((sum, detail) => sum + detail.maxScore, 0);
  const answeredCount = Object.values(answers).filter((value) => value !== undefined && value !== null && value !== '').length;

  let submissionId: string | null = null;
  const warnings: string[] = [];

  if (supabaseOperational) {
    try {
      const { data: submissionData, error: submissionError } = await supabaseAdmin
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
            answer_json: (answers as Record<string, unknown>)[detail.qId] ?? null,
            score: detail.score,
            max_score: detail.maxScore,
          }));

          if (payloadRows.length > 0) {
            const { error: answersError } = await supabaseAdmin.from('submission_answers').insert(payloadRows);
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
