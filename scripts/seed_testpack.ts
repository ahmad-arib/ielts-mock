// scripts/seed_testpack.ts
import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

type TestPack = {
  test_id: string;
  title: string;
  sections: Array<{
    section_id: string;
    type: string;
    title?: string;
    instructions_md?: string;
    audio_src?: string;
    passage_src_md?: string;
    layout?: any;
    assets?: any;
    questions: Array<{
      q_id: string;
      q_type: string;
      prompt_md?: string;
      options?: string[];
      options_letters?: string[];
      options_paragraphs?: string[];
      options_labels?: string[];
      expected?: string;
    }>;
  }>;
  timing?: any;
  ui_constraints?: any;
};

type AnswersByQid = Record<string, any>;

function readJson<T = any>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function writeFile(filePath: string, content: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function toCsv(rows: Array<Record<string, any>>): string {
  const headers = Object.keys(rows[0] || { q_id: "", correct_json: "" });
  const escape = (v: any) =>
    `"${String(v ?? "").replaceAll(`"`, `""`)}"`;
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ];
  return lines.join("\n");
}

async function main() {
  const testJsonPath = process.argv[2];
  const answersJsonPath = process.argv[3]; // optional

  if (!testJsonPath) {
    console.error("Usage: ts-node scripts/seed_testpack.ts <path/to/test.json> [path/to/answers.json]");
    process.exit(1);
  }

  const SUPABASE_URL = process.env.SUPABASE_URL!;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const pack = readJson<TestPack>(testJsonPath);
  const answers: AnswersByQid | null =
    answersJsonPath && fs.existsSync(answersJsonPath)
      ? readJson<AnswersByQid>(answersJsonPath)
      : null;

  console.log(`Seeding test: ${pack.test_id} from ${testJsonPath}`);

  // Upsert test metadata
  {
    const { error } = await supabase
      .from("tests")
      .upsert({ test_id: pack.test_id, title: pack.title, meta: {
        timing: pack.timing ?? null,
        ui_constraints: pack.ui_constraints ?? null
      }}, { onConflict: "test_id" });
    if (error) throw error;
  }

  // Collect questions and build templates if needed
  const templateRows: Array<{ q_id: string; correct_json: string }> = [];
  const sections = pack.sections;

  for (const s of sections) {
    for (const q of s.questions) {
      const extra: Record<string, any> = {
        section_type: s.type,
        instructions_md: s.instructions_md ?? null,
        audio_src: s.audio_src ?? null,
        passage_src_md: s.passage_src_md ?? null,
        layout: s.layout ?? null,
        assets: s.assets ?? null,
        options: q.options ?? null,
        options_letters: q.options_letters ?? null,
        options_paragraphs: q.options_paragraphs ?? null,
        options_labels: q.options_labels ?? null,
        expected: q.expected ?? null
      };

      const correct_json = answers ? (answers[q.q_id] ?? null) : null;
      if (!answers) {
        // Generate a blank template row
        templateRows.push({
          q_id: q.q_id,
          correct_json: JSON.stringify(
            guessBlankCorrectShape(q.q_type),
            null,
            0
          ),
        });
      }

      const { error } = await supabase.from("questions").upsert(
        {
          test_id: pack.test_id,
          q_id: q.q_id,
          section_id: s.section_id,
          q_type: q.q_type,
          prompt_md: q.prompt_md ?? null,
          extra,
          correct_json
        },
        { onConflict: "test_id,q_id" }
      );
      if (error) throw error;
    }
  }

  console.log(`Inserted/updated ${sections.reduce((n, s) => n + s.questions.length, 0)} questions.`);

  if (!answers) {
    // Write templates next to test.json
    const baseDir = path.dirname(testJsonPath);
    const templateJsonPath = path.join(baseDir, "answers_template.json");
    const templateCsvPath  = path.join(baseDir, "answers_template.csv");

    const templateObj: AnswersByQid = {};
    for (const row of templateRows) {
      templateObj[row.q_id] = JSON.parse(row.correct_json);
    }

    writeFile(templateJsonPath, JSON.stringify(templateObj, null, 2));
    writeFile(templateCsvPath, toCsv(templateRows));

    console.log(`No answers.json provided.`);
    console.log(`Created: ${templateJsonPath}`);
    console.log(`Created: ${templateCsvPath}`);
    console.log(`Fill these and re-run with: ts-node scripts/seed_testpack.ts <test.json> <answers.json>`);
  } else {
    console.log(`Merged answers from: ${answersJsonPath}`);
  }

  console.log("Done.");
}

function guessBlankCorrectShape(qType: string) {
  // Minimal shapes to guide answer authoring
  switch (qType) {
    case "short_text":
    case "sentence_completion":
    case "table_completion":
      return {
        accepted: ["<fill>"],
        case_insensitive: true,
        trim: true,
        punctuation_insensitive: true
      };
    case "true_false_not_given":
      return { label: "<TRUE|FALSE|NOT GIVEN>" };
    case "mcq_single":
      return { correct_option_index: 0 };
    case "map_labeling":
      return { correct_letter: "<A-I>" };
    case "diagram_label":
      return { accepted: ["<one_word>"] };
    case "paragraph_match":
      return { correct_paragraph: "<A-H>" };
    case "match_list":
      // e.g., mapping from q_id to one of A-D
      return { correct_label: "<A-D>" };
    case "image_annotation":
      // if you add this later
      return {
        correct_regions: [{ shape: "box", x: 0.1, y: 0.1, w: 0.2, h: 0.2 }],
        tolerance: { iou: 0.5 }
      };
    default:
      return {};
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});