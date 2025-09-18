import path from 'node:path';
import { promises as fs } from 'node:fs';

import { DEFAULT_TEST_ID } from '@/config/tests';

const TESTS_ROOT = path.join(process.cwd(), 'tests');

export type QuestionOptionLabels = string[];

export interface NormalizedQuestion {
  qId: string;
  qType: string;
  promptMd: string;
  expected?: string;
  options?: string[];
  optionsLetters?: QuestionOptionLabels;
  optionsParagraphs?: QuestionOptionLabels;
  optionsLabels?: QuestionOptionLabels;
  extra?: Record<string, unknown>;
}

export interface ListeningSectionDefinition {
  sectionId: string;
  type: 'listening';
  title: string;
  instructionsMd?: string;
  audioSrc?: string;
  questions: NormalizedQuestion[];
  assets?: Record<string, string>;
}

export interface ReadingSectionDefinition {
  sectionId: string;
  type: 'reading';
  title: string;
  instructionsMd?: string;
  passageMd?: string;
  layout?: { columns?: number; readingOrder?: string };
  questions: NormalizedQuestion[];
  assets?: Record<string, string>;
}

export type SectionDefinition = ListeningSectionDefinition | ReadingSectionDefinition;

export interface TestTiming {
  listeningTotalMinutes?: number;
  readingTotalMinutes?: number;
  [key: string]: number | undefined;
}

export interface TestUiConstraints {
  audioControls?: { allowSeek?: boolean; showRemaining?: boolean };
  allowFlagQuestion?: boolean;
  palette?: string;
  [key: string]: unknown;
}

export interface TestDefinition {
  testId: string;
  title: string;
  timing?: TestTiming;
  uiConstraints?: TestUiConstraints;
  sections: SectionDefinition[];
}

interface RawQuestion {
  q_id: string;
  q_type: string;
  prompt_md?: string;
  expected?: string;
  options?: string[];
  options_letters?: string[];
  options_paragraphs?: string[];
  options_labels?: string[];
  extra?: Record<string, unknown>;
}

interface RawSection {
  section_id: string;
  type: 'listening' | 'reading';
  title: string;
  instructions_md?: string;
  audio_src?: string;
  passage_src_md?: string;
  layout?: { columns?: number; reading_order?: string };
  questions: RawQuestion[];
  assets?: Record<string, string>;
}

interface RawTestManifest {
  test_id: string;
  title: string;
  timing?: TestTiming;
  ui_constraints?: {
    audio_controls?: { allow_seek?: boolean; show_remaining?: boolean };
    allow_flag_question?: boolean;
    palette?: string;
    [key: string]: unknown;
  };
  sections: RawSection[];
}

export interface ScoringRecord {
  qId: string;
  qType: string;
  correctJson: unknown;
}

function sanitizeTestId(testId: string): string | null {
  if (!/^[A-Za-z0-9_-]+$/.test(testId)) {
    return null;
  }
  return testId;
}

function resolveAssetPath(testId: string, assetPath?: string): string | undefined {
  if (!assetPath) return undefined;
  const cleaned = assetPath.replace(/^\/?assets\/?/, '');
  return `/api/tests/${testId}/assets/${cleaned}`;
}

function mapQuestion(raw: RawQuestion): NormalizedQuestion {
  return {
    qId: raw.q_id,
    qType: raw.q_type,
    promptMd: raw.prompt_md ?? '',
    expected: raw.expected,
    options: raw.options,
    optionsLetters: raw.options_letters,
    optionsParagraphs: raw.options_paragraphs,
    optionsLabels: raw.options_labels,
    extra: raw.extra,
  };
}

function mapAssets(testId: string, assets?: Record<string, string>): Record<string, string> | undefined {
  if (!assets) return undefined;
  const mappedEntries = Object.entries(assets)
    .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
    .map(([key, value]) => [key, resolveAssetPath(testId, value)] as const)
    .filter(([, value]) => Boolean(value));

  if (!mappedEntries.length) return undefined;
  return Object.fromEntries(mappedEntries as [string, string][]);
}

async function readTestManifest(testId: string): Promise<RawTestManifest | null> {
  const safeTestId = sanitizeTestId(testId);
  if (!safeTestId) return null;
  const manifestPath = path.join(TESTS_ROOT, safeTestId, 'test.json');
  try {
    const file = await fs.readFile(manifestPath, 'utf-8');
    return JSON.parse(file) as RawTestManifest;
  } catch {
    return null;
  }
}

async function readPassage(testId: string, relativePath?: string): Promise<string | undefined> {
  if (!relativePath) return undefined;
  const safeTestId = sanitizeTestId(testId);
  if (!safeTestId) return undefined;
  const passagePath = path.join(TESTS_ROOT, safeTestId, relativePath);
  try {
    return await fs.readFile(passagePath, 'utf-8');
  } catch {
    return undefined;
  }
}

export async function getTestDefinition(testId: string): Promise<TestDefinition | null> {
  const manifest = await readTestManifest(testId);
  if (!manifest) return null;

  const normalizedSections: SectionDefinition[] = await Promise.all(
    manifest.sections.map(async (section) => {
      const base = {
        sectionId: section.section_id,
        title: section.title,
        instructionsMd: section.instructions_md,
        questions: section.questions.map(mapQuestion),
        assets: mapAssets(manifest.test_id, section.assets),
      };

      if (section.type === 'listening') {
        return {
          ...base,
          type: 'listening',
          audioSrc: resolveAssetPath(manifest.test_id, section.audio_src),
        } satisfies ListeningSectionDefinition;
      }

      const passageMd = await readPassage(manifest.test_id, section.passage_src_md);
      return {
        ...base,
        type: 'reading',
        passageMd,
        layout: section.layout
          ? {
              columns: section.layout.columns,
              readingOrder: section.layout.reading_order,
            }
          : undefined,
      } satisfies ReadingSectionDefinition;
    })
  );

  return {
    testId: manifest.test_id,
    title: manifest.title,
    timing: manifest.timing,
    uiConstraints: manifest.ui_constraints
      ? {
          audioControls: manifest.ui_constraints.audio_controls,
          allowFlagQuestion: manifest.ui_constraints.allow_flag_question,
          palette: manifest.ui_constraints.palette,
        }
      : undefined,
    sections: normalizedSections,
  };
}

export async function getTestIds(): Promise<string[]> {
  try {
    const entries = await fs.readdir(TESTS_ROOT, { withFileTypes: true });
    const ids = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((name) => sanitizeTestId(name))
      .sort();
    if (ids.length > 0) return ids;
  } catch {
    // fall through to default id
  }
  return [DEFAULT_TEST_ID];
}

export async function loadLocalScoringRecords(testId: string): Promise<ScoringRecord[] | null> {
  const manifest = await readTestManifest(testId);
  if (!manifest) return null;
  const safeTestId = sanitizeTestId(testId);
  if (!safeTestId) return null;
  const answersPath = path.join(TESTS_ROOT, safeTestId, 'answers.json');
  let answersRaw: Record<string, unknown>;
  try {
    const answersFile = await fs.readFile(answersPath, 'utf-8');
    answersRaw = JSON.parse(answersFile) as Record<string, unknown>;
  } catch {
    return null;
  }

  const records: ScoringRecord[] = [];
  for (const section of manifest.sections) {
    for (const question of section.questions) {
      const correctJson = answersRaw[question.q_id];
      if (typeof correctJson === 'undefined') continue;
      records.push({
        qId: question.q_id,
        qType: question.q_type,
        correctJson,
      });
    }
  }
  return records;
}
