'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type {
  ListeningSectionDefinition,
  NormalizedQuestion,
  ReadingSectionDefinition,
  SectionDefinition,
  TestDefinition,
} from '@/lib/tests';

import InterestForm from '@/components/InterestForm';
import { MarkdownText } from './MarkdownText';

type AnswerValue = string | number | null;

type AnswersState = Record<string, AnswerValue>;

type SubmissionInfo = {
  submissionId: string | null;
  warnings: string[];
};

type SectionProps = {
  section: SectionDefinition;
  answers: AnswersState;
  onChange: (qId: string, value: AnswerValue) => void;
  audioControls?: { allowSeek?: boolean; showRemaining?: boolean };
};

type QuestionCardProps = {
  question: NormalizedQuestion;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
};

type AudioPlayerProps = {
  src?: string;
  allowSeek?: boolean;
  showRemaining?: boolean;
};
function resolveMinutes(value: number | undefined, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }
  return fallback;
}

function formatSectionMinutes(minutes?: number): string | null {
  if (typeof minutes !== 'number' || Number.isNaN(minutes)) return null;
  if (minutes <= 0) return null;
  return `${minutes} minutes`;
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '00:00';
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(safeSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${secs}`;
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
  const [hasStarted, setHasStarted] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const lastAllowedTimeRef = useRef(0);
  const seekingLocked = allowSeek === false;
  const hideNativeControls = seekingLocked;

  useEffect(() => {
    setDuration(0);
    setCurrentTime(0);
    lastAllowedTimeRef.current = 0;
    setHasStarted(false);
    setHasEnded(false);
    setPlaybackError(null);
  }, [src]);

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

  const requestPlayback = useCallback(() => {
    const element = audioRef.current;
    if (!element) return;
    setPlaybackError(null);
    void element.play().catch(() => {
      setPlaybackError('Unable to start playback. Please check your audio output settings.');
    });
  }, []);

  const handlePlay = useCallback(() => {
    setHasStarted(true);
    setHasEnded(false);
  }, []);

  const handlePause = useCallback(() => {
    const element = audioRef.current;
    if (!element) return;
    if (seekingLocked && hasStarted && !hasEnded) {
      void element.play().catch(() => {
        setPlaybackError('Playback was interrupted. Please keep the tab focused to continue listening.');
      });
    }
  }, [hasEnded, hasStarted, seekingLocked]);

  const handleEnded = useCallback(() => {
    setHasEnded(true);
  }, []);

  if (!src) return null;

  const remainingLabel = showRemaining ? (
    <p className={hideNativeControls ? 'text-sm font-medium text-slate-700' : 'mt-2 text-sm font-medium text-slate-600'}>
      Remaining: {formatTime(Math.max(duration - currentTime, 0))}
    </p>
  ) : null;

  const controlButtonLabel = !hasStarted ? 'Play recording' : hasEnded ? 'Playback finished' : 'Playing…';

  return (
    <div className="rounded-xl border bg-slate-50 p-4 shadow-sm">
      <audio
        ref={audioRef}
        controls={!hideNativeControls}
        preload="metadata"
        src={src}
        className={hideNativeControls ? 'hidden' : 'w-full'}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onSeeking={handleSeeking}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        controlsList="nodownload noplaybackrate"
      />
      {hideNativeControls ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={requestPlayback}
            disabled={hasStarted}
            className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {controlButtonLabel}
          </button>
          {remainingLabel}
        </div>
      ) : (
        remainingLabel
      )}
      {seekingLocked && (
        <p className="mt-3 text-xs text-slate-500">
          The recording can be played only once and cannot be paused or rewound.
        </p>
      )}
      {playbackError ? <p className="mt-2 text-xs font-semibold text-amber-600">{playbackError}</p> : null}
    </div>
  );
}

function QuestionCard({ question, value, onChange }: QuestionCardProps) {
  const helperList = useMemo(() => {
    if (question.qType === 'map_labeling') return question.optionsLetters;
    if (question.qType === 'paragraph_match') return question.optionsParagraphs;
    if (question.qType === 'match_list') return question.optionsLabels;
    return undefined;
  }, [question]);

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
                <span className="text-sm text-slate-800">
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
                <span className="text-sm font-medium text-slate-800">{option}</span>
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
          className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
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
          className="w-full rounded-lg border px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
        />
      );
    }
  }

  return (
    <div className="space-y-3 rounded-xl border px-4 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">{question.qId}</p>
          <MarkdownText content={question.promptMd} className="mt-1 space-y-1 text-sm text-slate-700" />
        </div>
      </div>
      {helperList && helperList.length > 0 && (
        <p className="text-xs text-slate-500">Choices: {helperList.join(', ')}</p>
      )}
      <div>{inputControl}</div>
    </div>
  );
}

function ListeningSectionView({ section, answers, onChange, audioControls }: SectionProps & { section: ListeningSectionDefinition }) {
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
          />
        ))}
      </div>
    </div>
  );
}

function ReadingSectionView({ section, answers, onChange }: SectionProps & { section: ReadingSectionDefinition }) {
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
            />
          ))}
        </div>
      </div>
    </div>
  );
}
export function TestRunner({ test }: { test: TestDefinition }) {
  const listeningSections = useMemo(
    () => test.sections.filter((section): section is ListeningSectionDefinition => section.type === 'listening'),
    [test.sections]
  );
  const readingSections = useMemo(
    () => test.sections.filter((section): section is ReadingSectionDefinition => section.type === 'reading'),
    [test.sections]
  );

  const hasListening = listeningSections.length > 0;
  const hasReading = readingSections.length > 0;

  const listeningMinutes = resolveMinutes(test.timing?.listeningTotalMinutes, 30);
  const readingMinutes = resolveMinutes(test.timing?.readingTotalMinutes, 60);
  const listeningTotalSeconds = Math.floor(listeningMinutes * 60);
  const readingTotalSeconds = Math.floor(readingMinutes * 60);

  const [answers, setAnswers] = useState<AnswersState>({});
  const [phase, setPhase] = useState<'listening' | 'reading'>(hasListening ? 'listening' : 'reading');
  const [listeningTimeLeft, setListeningTimeLeft] = useState(listeningTotalSeconds);
  const [readingTimeLeft, setReadingTimeLeft] = useState(readingTotalSeconds);
  const [listeningComplete, setListeningComplete] = useState(!hasListening);
  const [readingComplete, setReadingComplete] = useState(!hasReading);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionInfo, setSubmissionInfo] = useState<SubmissionInfo | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);

  const audioControls = test.uiConstraints?.audioControls;

  const listeningCompletedRef = useRef(listeningComplete);
  const readingCompletedRef = useRef(readingComplete);
  const submittingRef = useRef(false);

  useEffect(() => {
    setAnswers({});
    setPhase(hasListening ? 'listening' : 'reading');
    setListeningTimeLeft(listeningTotalSeconds);
    setReadingTimeLeft(readingTotalSeconds);
    setListeningComplete(!hasListening);
    setReadingComplete(!hasReading);
    listeningCompletedRef.current = !hasListening;
    readingCompletedRef.current = !hasReading;
    setError(null);
    setSubmissionInfo(null);
    setShowThankYou(false);
    setSubmitting(false);
    submittingRef.current = false;
  }, [
    test.testId,
    hasListening,
    hasReading,
    listeningTotalSeconds,
    readingTotalSeconds,
  ]);

  const handleChange = useCallback((qId: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  }, []);

  const submitAnswers = useCallback(async () => {
    if (submittingRef.current) return false;
    submittingRef.current = true;
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/tests/${test.testId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      const data = (await response.json().catch(() => ({}))) as Partial<SubmissionInfo> & { warnings?: unknown; error?: string };

      if (!response.ok) {
        throw new Error(data?.error ?? 'Unable to submit answers right now.');
      }

      const warnings = Array.isArray(data?.warnings)
        ? data.warnings.filter((warning): warning is string => typeof warning === 'string')
        : [];
      const submissionId = typeof data?.submissionId === 'string' ? data.submissionId : null;

      setSubmissionInfo({ submissionId, warnings });
      setShowThankYou(true);
      setReadingComplete(true);
      setListeningComplete(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error during submission.');
      return false;
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [answers, test.testId]);

  const handlePhaseComplete = useCallback(
    (completed: 'listening' | 'reading') => {
      if (completed === 'listening') {
        listeningCompletedRef.current = true;
        setListeningComplete(true);
        if (hasReading) {
          setPhase('reading');
        } else {
          readingCompletedRef.current = true;
          void submitAnswers();
        }
      } else {
        readingCompletedRef.current = true;
        void submitAnswers();
      }
    },
    [hasReading, submitAnswers]
  );

  useEffect(() => {
    if (showThankYou) return;
    if (phase !== 'listening') return;
    if (listeningCompletedRef.current) return;

    const timer = setInterval(() => {
      setListeningTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, showThankYou]);

  useEffect(() => {
    if (showThankYou) return;
    if (phase === 'listening' && listeningTimeLeft <= 0 && !listeningCompletedRef.current) {
      handlePhaseComplete('listening');
    }
  }, [phase, listeningTimeLeft, showThankYou, handlePhaseComplete]);

  useEffect(() => {
    if (showThankYou) return;
    if (phase !== 'reading') return;
    if (readingCompletedRef.current) return;

    const timer = setInterval(() => {
      setReadingTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, showThankYou]);

  useEffect(() => {
    if (showThankYou) return;
    if (phase === 'reading' && readingTimeLeft <= 0 && !readingCompletedRef.current) {
      handlePhaseComplete('reading');
    }
  }, [phase, readingTimeLeft, showThankYou, handlePhaseComplete]);

  const visibleSections = phase === 'listening' ? listeningSections : readingSections;
  const listeningDurationLabel = formatSectionMinutes(listeningMinutes);
  const readingDurationLabel = formatSectionMinutes(readingMinutes);

  const actionLabel = phase === 'listening' ? (hasReading ? 'Proceed to reading' : 'Submit test') : 'Submit test';
  const actionHandler = phase === 'listening' ? () => handlePhaseComplete('listening') : () => handlePhaseComplete('reading');

  if (!hasListening && !hasReading) {
    return (
      <div className="min-h-screen bg-slate-100 py-12">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
            <h1 className="text-2xl font-semibold text-slate-900">No sections available for this test.</h1>
            <p className="mt-3 text-sm text-slate-600">Please contact the administrator for assistance.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6">
        <header className="rounded-3xl bg-gradient-to-br from-sky-900 via-indigo-900 to-slate-900 p-10 text-white shadow-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-200">IELTS Try Out</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{test.title}</h1>
          <p className="mt-3 text-sm text-sky-100/90">
            This try out currently includes Listening and Reading sections. Writing & Speaking modules are being prepared.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div
              className={`rounded-2xl border p-5 ${
                !showThankYou && phase === 'listening'
                  ? 'border-white bg-white text-slate-900 shadow-lg'
                  : 'border-white/20 bg-white/10 text-sky-100'
              }`}
            >
              <p className="text-xs uppercase tracking-wide">Listening</p>
              <p className="mt-2 text-2xl font-semibold">{formatDuration(listeningTimeLeft)}</p>
              <p
                className={`mt-1 text-sm ${
                  !showThankYou && phase === 'listening' ? 'text-slate-600' : 'text-sky-200/80'
                }`}
              >
                Time remaining
              </p>
              {listeningDurationLabel && (
                <p className="mt-3 text-xs text-sky-200/70">Planned duration: {listeningDurationLabel}</p>
              )}
              {listeningComplete && (
                <p className="mt-3 text-xs font-semibold text-emerald-200">Completed</p>
              )}
            </div>
            <div
              className={`rounded-2xl border p-5 ${
                !showThankYou && phase === 'reading'
                  ? 'border-white bg-white text-slate-900 shadow-lg'
                  : 'border-white/20 bg-white/10 text-sky-100'
              }`}
            >
              <p className="text-xs uppercase tracking-wide">Reading</p>
              <p className="mt-2 text-2xl font-semibold">{formatDuration(readingTimeLeft)}</p>
              <p
                className={`mt-1 text-sm ${
                  !showThankYou && phase === 'reading' ? 'text-slate-600' : 'text-sky-200/80'
                }`}
              >
                Time remaining
              </p>
              {readingDurationLabel && (
                <p className="mt-3 text-xs text-sky-200/70">Planned duration: {readingDurationLabel}</p>
              )}
              {readingComplete && (
                <p className="mt-3 text-xs font-semibold text-emerald-200">Completed</p>
              )}
            </div>
          </div>
          {!showThankYou && (
            <p className="mt-6 text-sm text-sky-100">
              You are currently working on the {phase === 'listening' ? 'Listening' : 'Reading'} section.
              Time will automatically {phase === 'listening' ? 'move you to Reading' : 'submit the test'} when it expires.
            </p>
          )}
          {showThankYou && (
            <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-6 text-sm text-sky-50">
              Thank you for completing the try out. Scoring will be delivered by email shortly.
            </div>
          )}
        </header>

        {showThankYou ? (
          <>
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
              <h2 className="text-2xl font-semibold text-slate-900">Thank you for your submission!</h2>
              <p className="mt-3 text-sm text-slate-600">
                Your answers have been recorded. Our team will review them and share the result via email.
              </p>
              {submissionInfo?.submissionId && (
                <p className="mt-4 text-sm text-slate-600">
                  Confirmation ID: <span className="font-mono text-slate-900">{submissionInfo.submissionId}</span>
                </p>
              )}
              {submissionInfo?.warnings?.length ? (
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700 shadow-sm">
                  <h3 className="text-base font-semibold">Submission notes</h3>
                  <ul className="mt-3 space-y-2 list-disc pl-5">
                    {submissionInfo.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
            <section className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl shadow-slate-950/40">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
                <div className="lg:w-1/2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200 ring-1 ring-white/20">
                    Coming soon
                  </span>
                  <h3 className="mt-6 text-2xl font-semibold text-white sm:text-3xl">Writing & Speaking Try Out is in development</h3>
                  <p className="mt-4 text-sm text-slate-200">
                    We are preparing interactive Writing and Speaking tasks so you can complete the full IELTS experience. Join the early interest list and we will contact you as soon as the new try out launches.
                  </p>
                  <p className="mt-4 text-xs text-slate-300">All follow-ups happen through email—no WhatsApp numbers required.</p>
                </div>
                <div className="lg:w-1/2">
                  <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-200">
                    <h4 className="text-lg font-semibold">Want to be first in line?</h4>
                    <p className="mt-2 text-sm text-slate-600">
                      Leave your name and email so our team can contact you once the Writing & Speaking try out is live.
                    </p>
                    <InterestForm
                      className="mt-6"
                      inputClassName="bg-slate-50"
                      buttonClassName="bg-emerald-500 hover:bg-emerald-400 focus:ring-emerald-300"
                    />
                    <p className="mt-4 text-xs text-slate-500">
                      We will only use your email to share launch updates for the Writing & Speaking try out.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <>
            {visibleSections.map((section) => (
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
                      audioControls={audioControls}
                    />
                  ) : (
                    <ReadingSectionView section={section} answers={answers} onChange={handleChange} />
                  )}
                </div>
              </section>
            ))}

            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-lg">
              {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-600">
                  <p>
                    Time remaining for this section: <span className="font-semibold">{formatDuration(phase === 'listening' ? listeningTimeLeft : readingTimeLeft)}</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {phase === 'listening'
                      ? 'Finish the Listening tasks before moving on. The Reading section will open automatically when time runs out.'
                      : 'Submit your answers when you are satisfied. The test will submit automatically if time expires.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={actionHandler}
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Submitting…' : actionLabel}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
