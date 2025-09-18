import type { ScoringRecord } from '@/lib/tests';

export interface ScoreDetail {
  qId: string;
  score: number;
  maxScore: number;
  isCorrect: boolean;
  correctAnswer?: unknown;
  receivedAnswer: unknown;
  message?: string;
}

interface TextComparisonConfig {
  case_insensitive?: boolean;
  trim?: boolean;
  punctuation_insensitive?: boolean;
}

function normalizeText(value: string, config: TextComparisonConfig): string {
  let normalized = config.trim === false ? value : value.trim();
  if (config.case_insensitive) {
    normalized = normalized.toLowerCase();
  }
  if (config.punctuation_insensitive) {
    normalized = normalized.replace(/[^\p{L}\p{N}\s]/gu, '');
  }
  return normalized.replace(/\s+/g, ' ');
}

function compareTextAnswer(answer: unknown, correctJson: unknown): ScoreDetail {
  const maxScore = 1;
  const configSource =
    typeof correctJson === 'object' && correctJson !== null ? (correctJson as Record<string, unknown>) : {};
  const config: TextComparisonConfig = {
    case_insensitive: Boolean(configSource['case_insensitive']),
    trim: configSource['trim'] === false ? false : true,
    punctuation_insensitive: Boolean(configSource['punctuation_insensitive']),
  };
  const acceptedRaw = Array.isArray(configSource['accepted']) ? (configSource['accepted'] as unknown[]) : [];
  const accepted = acceptedRaw.filter((item): item is string => typeof item === 'string');
  const receivedAnswer = typeof answer === 'string' ? answer : '';
  if (!receivedAnswer) {
    return {
      qId: '',
      score: 0,
      maxScore,
      isCorrect: false,
      correctAnswer: accepted,
      receivedAnswer: answer ?? null,
    };
  }
  const normalizedAnswer = normalizeText(receivedAnswer, config);
  const normalizedAccepted = accepted.map((option) => normalizeText(option, config));
  const isCorrect = normalizedAccepted.includes(normalizedAnswer);
  return {
    qId: '',
    score: isCorrect ? maxScore : 0,
    maxScore,
    isCorrect,
    correctAnswer: accepted,
    receivedAnswer,
  };
}

function compareLetter(answer: unknown, expected: unknown): ScoreDetail {
  const maxScore = 1;
  const expectedValue = typeof expected === 'string' ? expected.trim().toUpperCase() : undefined;
  const received = typeof answer === 'string' ? answer.trim().toUpperCase() : '';
  const isCorrect = Boolean(expectedValue) && received === expectedValue;
  return {
    qId: '',
    score: isCorrect ? maxScore : 0,
    maxScore,
    isCorrect,
    correctAnswer: expectedValue,
    receivedAnswer: answer ?? null,
  };
}

function compareLabel(answer: unknown, expected: unknown): ScoreDetail {
  const maxScore = 1;
  const expectedValue = typeof expected === 'string' ? expected.toUpperCase() : undefined;
  let received: string | undefined;
  if (typeof answer === 'string') {
    received = answer.toUpperCase();
  }
  const isCorrect = Boolean(expectedValue) && received === expectedValue;
  return {
    qId: '',
    score: isCorrect ? maxScore : 0,
    maxScore,
    isCorrect,
    correctAnswer: expectedValue,
    receivedAnswer: answer ?? null,
  };
}

function compareChoice(answer: unknown, expectedIndex: unknown): ScoreDetail {
  const maxScore = 1;
  const index = typeof expectedIndex === 'number' ? expectedIndex : Number.NaN;
  const receivedIndex = typeof answer === 'number' ? answer : typeof answer === 'string' ? Number.parseInt(answer, 10) : Number.NaN;
  const isCorrect = Number.isInteger(index) && Number.isInteger(receivedIndex) && index === receivedIndex;
  return {
    qId: '',
    score: isCorrect ? maxScore : 0,
    maxScore,
    isCorrect,
    correctAnswer: typeof index === 'number' && Number.isInteger(index) ? index : null,
    receivedAnswer: answer ?? null,
  };
}

export function scoreQuestion(record: ScoringRecord, answer: unknown): ScoreDetail {
  const correctData =
    typeof record.correctJson === 'object' && record.correctJson !== null
      ? (record.correctJson as Record<string, unknown>)
      : {};

  switch (record.qType) {
    case 'mcq_single': {
      const result = compareChoice(answer, correctData['correct_option_index']);
      return { ...result, qId: record.qId };
    }
    case 'map_labeling': {
      const result = compareLetter(answer, correctData['correct_letter']);
      return { ...result, qId: record.qId };
    }
    case 'paragraph_match': {
      const result = compareLabel(answer, correctData['correct_paragraph']);
      return { ...result, qId: record.qId };
    }
    case 'match_list': {
      const result = compareLabel(answer, correctData['correct_label']);
      return { ...result, qId: record.qId };
    }
    case 'true_false_not_given': {
      const result = compareLabel(answer, correctData['label']);
      return { ...result, qId: record.qId };
    }
    default: {
      const result = compareTextAnswer(answer, correctData);
      return { ...result, qId: record.qId };
    }
  }
}
