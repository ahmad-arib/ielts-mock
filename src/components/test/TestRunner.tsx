'use client';

import Image from 'next/image';
import { useCallback, useMemo, useRef, useState } from 'react';

import type {
  ListeningSectionDefinition,
  NormalizedQuestion,
  ReadingSectionDefinition,
  SectionDefinition,
  TestDefinition,
} from '@/lib/tests';

import { MarkdownText } from './MarkdownText';

type AnswerValue = string | number | null;

type AnswersState = Record<string, AnswerValue>;

type QuestionFeedback = {
  score: number;
  maxScore: number;
  isCorrect: boolean;
  correctAnswer: unknown;
};

type SubmissionResult = {
  testId: string;
  submissionId: string | null;
  totalScore: number;
  maxScore: number;
  answered: number;
  questionCount: number;
  warnings: string[];
  perQuestion: Record<string, QuestionFeedback>;
};

type SectionProps = {
  section: SectionDefinition;
  answers: AnswersState;
  onChange: (qId: string, value: AnswerValue) => void;
  feedback: Record<string, QuestionFeedback> | undefined;
  audioControls?: { allowSeek?: boolean; showRemaining?: boolean };
};

type QuestionCardProps = {
  question: NormalizedQuestion;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  feedback?: QuestionFeedback;
};

type AudioPlayerProps = {
  src?: string;
  allowSeek?: boolean;
  showRemaining?: boolean;
};

function formatMinutes(minutes?: number): string | null {
  if (typeof minutes !== 'number' || Number.isNaN(minutes)) return null;
  if (minutes <= 0) return null;
  return `${minutes} minutes`;
}

function formatPercentage(total: number, max: number): string {
  if (!max) return '0%';
  return `${Math.round((total / max) * 1000) / 10}%`;
}

function AssetDisplay({ assets, sectionTitle }: { assets?: Record<string, string>; sectionTitle: string }) {
  if (!assets) return null;
  const entries = Object.entries(assets).filter(([, url]) => typeof url === 'string' && url.length > 0);
  if (entries.length === 0) return null;

  return (
    <div className="space-y-4">
      {entries.map(([key, url]) => {
        const displayName = key.replace(/_/g, ' ');
        if (/\.(png|jpe?g|webp|svg)$/i.test(url)) {
          return (
            <figure key={key} className="overflow-hidden rounded-xl border bg-white shadow-sm">
              <Image
                src={url}
                alt={`${sectionTitle} ${displayName}`}
                width={1600}
                height={1200}
                className="h-auto w-full object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={false}
                unoptimized
              />
              <figcaption className="border-t px-4 py-2 text-xs text-slate-600">Reference: {displayName}</figcaption>
            </figure>
          );
        }

        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-sky-600 underline"
          >
            View asset: {displayName}
          </a>
        );
      })}
    </div>
  );
}

function AudioPlayer({ src, allowSeek = true, showRemaining }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const lastAllowedTimeRef = useRef(0);
  const seekingLocked = allowSeek === false;

  const formatTime = useCallback((time: number) => {
    if (!Number.isFinite(time) || time < 0) return '00:00';
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, '0');
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const element = audioRef.current;
    if (!element) return;
    lastAllowedTimeRef.current = element.currentTime;
    setCurrentTime(element.currentTime);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const element = audioRef.current;
    if (!element) return;
    setDuration(element.duration);
  }, []);

  const handleSeeking = useCallback(() => {
    if (!seekingLocked) return;
    const element = audioRef.current;
    if (!element) return;
    const lastTime = lastAllowedTimeRef.current;
    if (Math.abs(element.currentTime - lastTime) > 0.4) {
      element.currentTime = lastTime;
    }
  }, [seekingLocked]);

  if (!src) return null;

  return (
    <div className="rounded-xl border bg-slate-50 p-4 shadow-sm">
      <audio
        ref={audioRef}
        controls
        preload="metadata"
        src={src}
        className="w-full"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onSeeking={handleSeeking}
        controlsList="nodownload"
      />
      {showRemaining && (
        <p className="mt-2 text-sm font-medium text-slate-600">
          Remaining: {formatTime(Math.max(duration - currentTime, 0))}
        </p>
      )}
    </div>
  );
}

function QuestionCard({ question, value, onChange, feedback }: QuestionCardProps) {
  const helperList = useMemo(() => {
    if (question.qType === 'map_labeling') return question.optionsLetters;
    if (question.qType === 'paragraph_match') return question.optionsParagraphs;
    if (question.qType === 'match_list') return question.optionsLabels;
    return undefined;
  }, [question]);

  const renderCorrectAnswer = () => {
    if (!feedback || feedback.isCorrect) return null;
    const { correctAnswer } = feedback;
    if (correctAnswer === null || typeof correctAnswer === 'undefined') return null;

    if (Array.isArray(correctAnswer)) {
      if (correctAnswer.length === 0) return null;
      return correctAnswer.join(', ');
    }

    if (typeof correctAnswer === 'number' && question.qType === 'mcq_single') {
      const options = question.options ?? [];
      const optionText = options[correctAnswer];
      if (optionText) return optionText;
      return `Option ${correctAnswer + 1}`;
    }

    return String(correctAnswer);
  };

  const correctAnswerDisplay = renderCorrectAnswer();

  let inputControl: JSX.Element | null = null;

  switch (question.qType) {
    case 'mcq_single': {
      const options = question.options ?? [];
      inputControl = (
        <div className="grid gap-2">
          {options.map((option, idx) => {
            const id = `${question.qId}-${idx}`;
            return (
              <label
                key={id}
                htmlFor={id}
                className="flex items-start gap-3 rounded-xl border px-4 py-3 transition hover:border-sky-400"
              >
                <input
                  id={id}
                  type="radio"
                  name={question.qId}
                  value={idx}
                  checked={value === idx}
                  onChange={() => onChange(idx)}
                  className="mt-1 h-4 w-4"
                />
                <span className="text-sm text-slate-700">
                  <span className="font-semibold">{option}</span>
                </span>
              </label>
            );
          })}
        </div>
      );
      break;
    }
    case 'true_false_not_given': {
      const options = ['TRUE', 'FALSE', 'NOT GIVEN'];
      inputControl = (
        <div className="flex flex-wrap gap-3">
          {options.map((option) => {
            const id = `${question.qId}-${option}`;
            return (
              <label key={option} htmlFor={id} className="inline-flex items-center gap-2">
                <input
                  id={id}
                  type="radio"
                  name={question.qId}
                  value={option}
                  checked={value === option}
                  onChange={() => onChange(option)}
                  className="h-4 w-4"
                />
                <span className="text-sm font-medium text-slate-700">{option}</span>
              </label>
            );
          })}
        </div>
      );
      break;
    }
    case 'map_labeling':
    case 'paragraph_match':
    case 'match_list': {
      const options = helperList ?? [];
      inputControl = (
        <select
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange(event.target.value || null)}
          className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
      break;
    }
    default: {
      inputControl = (
        <input
          type="text"
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Type your answer"
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
        />
      );
    }
  }

  const badge = feedback ? (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        feedback.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
      }`}
    >
      {feedback.isCorrect ? 'Correct' : `Score ${feedback.score}/${feedback.maxScore}`}
    </span>
  ) : null;

  return (
    <div className="space-y-3 rounded-xl border px-4 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">{question.qId}</p>
          <MarkdownText content={question.promptMd} className="mt-1 space-y-1 text-sm text-slate-700" />
        </div>
        {badge}
      </div>
      {helperList && helperList.length > 0 && (
        <p className="text-xs text-slate-500">Choices: {helperList.join(', ')}</p>
      )}
      <div>{inputControl}</div>
      {correctAnswerDisplay && (
        <p className="text-xs text-slate-500">
          Correct answer: <span className="font-semibold">{correctAnswerDisplay}</span>
        </p>
      )}
    </div>
  );
}

function ListeningSectionView({ section, answers, onChange, feedback, audioControls }: SectionProps & { section: ListeningSectionDefinition }) {
  return (
    <div className="space-y-6">
      <MarkdownText content={section.instructionsMd} className="space-y-3 text-sm text-slate-600" />
      <AudioPlayer
        src={section.audioSrc}
        allowSeek={audioControls?.allowSeek}
        showRemaining={audioControls?.showRemaining}
      />
      <AssetDisplay assets={section.assets} sectionTitle={section.title} />
      <div className="space-y-4">
        {section.questions.map((question) => (
          <QuestionCard
            key={question.qId}
            question={question}
            value={answers[question.qId] ?? null}
            onChange={(value) => onChange(question.qId, value)}
            feedback={feedback?.[question.qId]}
          />
        ))}
      </div>
    </div>
  );
}

function ReadingSectionView({ section, answers, onChange, feedback }: SectionProps & { section: ReadingSectionDefinition }) {
  return (
    <div className="space-y-6">
      <MarkdownText content={section.instructionsMd} className="space-y-3 text-sm text-slate-600" />
      <div className="lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-8">
        <div className="rounded-2xl border bg-slate-50 p-6 shadow-inner">
          <MarkdownText
            content={section.passageMd}
            className="space-y-4 text-base leading-relaxed text-slate-800 lg:columns-2 lg:gap-8 [column-fill:balance]"
          />
        </div>
        <div className="mt-6 space-y-4 lg:mt-0">
          <AssetDisplay assets={section.assets} sectionTitle={section.title} />
          {section.questions.map((question) => (
            <QuestionCard
              key={question.qId}
              question={question}
              value={answers[question.qId] ?? null}
              onChange={(value) => onChange(question.qId, value)}
              feedback={feedback?.[question.qId]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TestRunner({ test }: { test: TestDefinition }) {
  const [answers, setAnswers] = useState<AnswersState>({});
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const audioControls = test.uiConstraints?.audioControls;

  const handleChange = useCallback((qId: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  }, []);

  const sectionFeedback = useMemo(() => result?.perQuestion ?? {}, [result]);

  const submitAnswers = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/tests/${test.testId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      const data = (await response.json().catch(() => ({}))) as Partial<SubmissionResult> & { error?: string };
      if (!response.ok || !data || typeof data.totalScore !== 'number') {
        throw new Error(data?.error ?? 'Unable to submit answers right now.');
      }
      setResult({
        testId: test.testId,
        submissionId: data.submissionId ?? null,
        totalScore: data.totalScore,
        maxScore: data.maxScore ?? 0,
        answered: data.answered ?? 0,
        questionCount: data.questionCount ?? 0,
        warnings: Array.isArray(data.warnings) ? data.warnings : [],
        perQuestion: data.perQuestion ?? {},
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error during submission.');
    } finally {
      setSubmitting(false);
    }
  }, [answers, test.testId]);

  const listeningTime = formatMinutes(test.timing?.listeningTotalMinutes);
  const readingTime = formatMinutes(test.timing?.readingTotalMinutes);

  return (
    <div className="min-h-screen bg-slate-100 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6">
        <header className="rounded-3xl bg-gradient-to-br from-sky-900 via-indigo-900 to-slate-900 p-10 text-white shadow-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-200">IELTS Mock Test</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{test.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-sky-100">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Test ID: {test.testId}
            </span>
            {listeningTime && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1">
                <span className="h-2 w-2 rounded-full bg-amber-300" />
                Listening ~ {listeningTime}
              </span>
            )}
            {readingTime && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1">
                <span className="h-2 w-2 rounded-full bg-sky-300" />
                Reading ~ {readingTime}
              </span>
            )}
          </div>
          {result && (
            <div className="mt-6 grid gap-4 rounded-2xl border border-white/20 bg-white/10 p-6 text-sm text-sky-50 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-sky-200">Overall score</p>
                <p className="mt-1 text-2xl font-semibold">
                  {result.totalScore} / {result.maxScore}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-sky-200">Percentage</p>
                <p className="mt-1 text-2xl font-semibold">{formatPercentage(result.totalScore, result.maxScore)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-sky-200">Answered</p>
                <p className="mt-1 text-2xl font-semibold">
                  {result.answered} / {result.questionCount}
                </p>
              </div>
            </div>
          )}
        </header>

        {result?.warnings?.length ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700 shadow-sm">
            <h2 className="text-base font-semibold">Submission notes</h2>
            <ul className="mt-3 space-y-2 list-disc pl-5">
              {result.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {test.sections.map((section) => (
          <section key={section.sectionId} className="rounded-3xl border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-200 px-6 py-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {section.type === 'listening' ? 'Listening' : 'Reading'}
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900">{section.title}</h2>
            </div>
            <div className="px-6 py-6">
              {section.type === 'listening' ? (
                <ListeningSectionView
                  section={section}
                  answers={answers}
                  onChange={handleChange}
                  feedback={sectionFeedback}
                  audioControls={audioControls}
                />
              ) : (
                <ReadingSectionView
                  section={section}
                  answers={answers}
                  onChange={handleChange}
                  feedback={sectionFeedback}
                />
              )}
            </div>
          </section>
        ))}

        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-lg">
          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
          {result && !error && (
            <p className="text-sm text-slate-600">
              Submission ID: <span className="font-mono">{result.submissionId ?? 'Not stored (local scoring only)'}</span>
            </p>
          )}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              You can update your answers and resubmit as needed. Only the latest attempt is saved when Supabase is available.
            </p>
            <button
              type="button"
              onClick={submitAnswers}
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : 'Submit answers'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
