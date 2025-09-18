#!/usr/bin/env bash
set -euo pipefail

PACK_ROOT="tests/IELTS_Test_1"

echo "Creating directories..."
mkdir -p "${PACK_ROOT}/assets/listening"
mkdir -p "${PACK_ROOT}/assets/images"
mkdir -p "${PACK_ROOT}/passages"

echo "Creating placeholder media targets..."
# Drop your real files later:
#   assets/listening/track_1.mp3
#   assets/listening/track_2.mp3
#   assets/listening/track_3.mp3
#   assets/listening/track_4.mp3
#   assets/images/farm_map.jpg
#   assets/images/falkirk_wheel_diagram.jpg
touch "${PACK_ROOT}/assets/listening/.keep"
touch "${PACK_ROOT}/assets/images/.keep"

echo "Writing reading passages markdown stubs..."
cat > "${PACK_ROOT}/passages/reading_1.md" << 'EOF'
# Crop-growing skyscrapers
(Paste the passage text in logical reading order here. The app will render it in two columns per layout config.)
EOF

cat > "${PACK_ROOT}/passages/reading_2.md" << 'EOF'
# The Falkirk Wheel
(Paste the passage text. Keep logical reading order; UI handles 2-column styling.)
EOF

cat > "${PACK_ROOT}/passages/reading_3.md" << 'EOF'
# Reducing the Effects of Climate Change
(Paste the passage text. Use headings for paragraphs A–H if you want explicit anchors.)
EOF

echo "Writing test.json..."
cat > "${PACK_ROOT}/test.json" << 'EOF'
{
  "test_id": "IELTS_Test_1",
  "title": "IELTS Practice Test 1",
  "timing": {
    "listening_total_minutes": 30,
    "reading_total_minutes": 60
  },
  "ui_constraints": {
    "audio_controls": { "allow_seek": false, "show_remaining": true },
    "allow_flag_question": true,
    "palette": "system"
  },
  "sections": [
    {
      "section_id": "listening_1",
      "type": "listening",
      "title": "Listening Section 1 (Q1–10)",
      "audio_src": "assets/listening/track_1.mp3",
      "instructions_md": "Complete the notes. Write **ONE WORD AND/OR A NUMBER** for each answer.",
      "questions": [
        { "q_id": "L1-Q1",  "q_type": "short_text", "expected": "one_word_or_number", "prompt_md": "Room and cost – the **_____ Room** – seats 100" },
        { "q_id": "L1-Q2",  "q_type": "short_text", "expected": "currency_number",     "prompt_md": "Cost of Main Hall for Saturday evening: £ **_____**" },
        { "q_id": "L1-Q3",  "q_type": "short_text", "expected": "one_word",            "prompt_md": "£250 deposit (**_____** payment is required)" },
        { "q_id": "L1-Q4",  "q_type": "short_text", "expected": "one_word",            "prompt_md": "Cost includes use of tables and chairs and also **_____**" },
        { "q_id": "L1-Q5",  "q_type": "short_text", "expected": "one_word",            "prompt_md": "Before the event – Will need a **_____** licence" },
        { "q_id": "L1-Q6",  "q_type": "short_text", "expected": "one_word",            "prompt_md": "Contact caretaker in advance to arrange **_____**" },
        { "q_id": "L1-Q7",  "q_type": "short_text", "expected": "one_word",            "prompt_md": "During the event – band should use the **_____** door" },
        { "q_id": "L1-Q8",  "q_type": "short_text", "expected": "one_word",            "prompt_md": "After the event – Need to know the **_____** for the cleaning cupboard" },
        { "q_id": "L1-Q9",  "q_type": "short_text", "expected": "one_word",            "prompt_md": "The **_____** must be washed and rubbish bagged" },
        { "q_id": "L1-Q10", "q_type": "short_text", "expected": "one_word",            "prompt_md": "All **_____** must be taken down; stack chairs/tables" }
      ],
      "scoring": { "method": "by_supabase", "points_per_question": 1 }
    },
    {
      "section_id": "listening_2",
      "type": "listening",
      "title": "Listening Section 2 (Q11–20)",
      "audio_src": "assets/listening/track_2.mp3",
      "instructions_md": "Q11–14: **ONE WORD** each. Q15–20: **Label the map**.",
      "questions": [
        { "q_id": "L2-Q11", "q_type": "short_text",   "expected": "one_word", "prompt_md": "Farm visit – do not harm any **_____**" },
        { "q_id": "L2-Q12", "q_type": "short_text",   "expected": "one_word", "prompt_md": "Do not touch any **_____**" },
        { "q_id": "L2-Q13", "q_type": "short_text",   "expected": "one_word", "prompt_md": "Wear **_____**" },
        { "q_id": "L2-Q14", "q_type": "short_text",   "expected": "one_word", "prompt_md": "Do not bring **_____** into the farm" },
        { "q_id": "L2-Q15", "q_type": "map_labeling", "expected": "letter",   "prompt_md": "Map: **Scarecrow**",             "options_letters": ["A","B","C","D","E","F","G","H","I"] },
        { "q_id": "L2-Q16", "q_type": "map_labeling", "expected": "letter",   "prompt_md": "Map: **Maze**",                  "options_letters": ["A","B","C","D","E","F","G","H","I"] },
        { "q_id": "L2-Q17", "q_type": "map_labeling", "expected": "letter",   "prompt_md": "Map: **Café**",                  "options_letters": ["A","B","C","D","E","F","G","H","I"] },
        { "q_id": "L2-Q18", "q_type": "map_labeling", "expected": "letter",   "prompt_md": "Map: **Black Barn**",            "options_letters": ["A","B","C","D","E","F","G","H","I"] },
        { "q_id": "L2-Q19", "q_type": "map_labeling", "expected": "letter",   "prompt_md": "Map: **Covered picnic area**",   "options_letters": ["A","B","C","D","E","F","G","H","I"] },
        { "q_id": "L2-Q20", "q_type": "map_labeling", "expected": "letter",   "prompt_md": "Map: **Fiddy House**",           "options_letters": ["A","B","C","D","E","F","G","H","I"] }
      ],
      "assets": { "map_image": "assets/images/farm_map.jpg" },
      "scoring": { "method": "by_supabase", "points_per_question": 1 }
    },
    {
      "section_id": "listening_3",
      "type": "listening",
      "title": "Listening Section 3 (Q21–30)",
      "audio_src": "assets/listening/track_3.mp3",
      "instructions_md": "Choose **A, B or C**.",
      "questions": [
        { "q_id": "L3-Q21", "q_type": "mcq_single", "options": ["A","B","C"], "prompt_md": "Students’ majors in Akira Miyake's study" },
        { "q_id": "L3-Q22", "q_type": "mcq_single", "options": ["A","B","C"], "prompt_md": "Aim of Miyake's study" },
        { "q_id": "L3-Q23", "q_type": "mcq_single", "options": ["A","B","C"], "prompt_md": "Female students were wrong to believe that…" },
        { "q_id": "L3-Q24", "q_type": "mcq_single", "options": ["A","B","C"], "prompt_md": "Writing topic asked of students" },
        { "q_id": "L3-Q25", "q_type": "mcq_single", "options": ["A","B","C"], "prompt_md": "Aim of the writing exercise" },
        { "q_id": "L3-Q26", "q_type": "mcq_single", "options": ["A","B","C"], "prompt_md": "What surprised the researchers" },
        { "q_id": "L3-Q27", "q_type": "mcq_single", "options": ["A","B","C"], "prompt_md": "Possible bias in results" },
        { "q_id": "L3-Q28", "q_type": "mcq_single", "options": ["A","B","C"], "prompt_md": "Design choice in their project" },
        { "q_id": "L3-Q29", "q_type": "mcq_single", "options": ["A","B","C"], "prompt_md": "Smolinsky’s finding" },
        { "q_id": "L3-Q30", "q_type": "mcq_single", "options": ["A","B","C"], "prompt_md": "Next step" }
      ],
      "scoring": { "method": "by_supabase", "points_per_question": 1 }
    },
    {
      "section_id": "listening_4",
      "type": "listening",
      "title": "Listening Section 4 (Q31–40)",
      "audio_src": "assets/listening/track_4.mp3",
      "instructions_md": "ONE WORD ONLY.",
      "questions": [
        { "q_id": "L4-Q31", "q_type": "short_text", "expected": "one_word", "prompt_md": "Targets for **_____**" },
        { "q_id": "L4-Q32", "q_type": "short_text", "expected": "one_word", "prompt_md": "Hotspots not always rich in **_____**" },
        { "q_id": "L4-Q33", "q_type": "short_text", "expected": "one_word", "prompt_md": "Higher temperatures at the **_____**" },
        { "q_id": "L4-Q34", "q_type": "short_text", "expected": "one_word", "prompt_md": "Sufficient **_____** in the water" },
        { "q_id": "L4-Q35", "q_type": "short_text", "expected": "one_word", "prompt_md": "Hotspots for marine **_____**" },
        { "q_id": "L4-Q36", "q_type": "short_text", "expected": "one_word", "prompt_md": "New species under the **_____**" },
        { "q_id": "L4-Q37", "q_type": "short_text", "expected": "one_word", "prompt_md": "Rate of **_____**" },
        { "q_id": "L4-Q38", "q_type": "short_text", "expected": "one_word", "prompt_md": "Make a distribution **_____**" },
        { "q_id": "L4-Q39", "q_type": "short_text", "expected": "one_word", "prompt_md": "Establish **_____** corridors" },
        { "q_id": "L4-Q40", "q_type": "short_text", "expected": "one_word", "prompt_md": "Catch fish only for **_____**" }
      ],
      "scoring": { "method": "by_supabase", "points_per_question": 1 }
    },
    {
      "section_id": "reading_1",
      "type": "reading",
      "title": "Reading Passage 1 – Crop-growing skyscrapers (Q1–13)",
      "passage_src_md": "passages/reading_1.md",
      "layout": { "columns": 2, "reading_order": "top_to_bottom_each_column" },
      "questions": [
        { "q_id": "R1-Q1",  "q_type": "sentence_completion", "expected": "no_more_than_two_words", "prompt_md": "Some food plants, including **_____**, are already grown indoors." },
        { "q_id": "R1-Q2",  "q_type": "sentence_completion", "expected": "no_more_than_two_words", "prompt_md": "Vertical farms located in **_____**." },
        { "q_id": "R1-Q3",  "q_type": "sentence_completion", "expected": "no_more_than_two_words", "prompt_md": "Methane to produce **_____**." },
        { "q_id": "R1-Q4",  "q_type": "sentence_completion", "expected": "no_more_than_two_words", "prompt_md": "Cut consumption of **_____**." },
        { "q_id": "R1-Q5",  "q_type": "sentence_completion", "expected": "no_more_than_two_words", "prompt_md": "Need **_____** light." },
        { "q_id": "R1-Q6",  "q_type": "sentence_completion", "expected": "no_more_than_two_words", "prompt_md": "Planting in moving **_____**." },
        { "q_id": "R1-Q7",  "q_type": "sentence_completion", "expected": "no_more_than_two_words", "prompt_md": "Most probable: grow on **_____**." },
        { "q_id": "R1-Q8",  "q_type": "true_false_not_given", "prompt_md": "Methods for predicting Earth's population have changed." },
        { "q_id": "R1-Q9",  "q_type": "true_false_not_given", "prompt_md": "Humans caused some land destruction." },
        { "q_id": "R1-Q10", "q_type": "true_false_not_given", "prompt_md": "Vertical farm crops depend on season." },
        { "q_id": "R1-Q11", "q_type": "true_false_not_given", "prompt_md": "Climate change damages crops." },
        { "q_id": "R1-Q12", "q_type": "true_false_not_given", "prompt_md": "Fertilisers will be needed in vertical farms." },
        { "q_id": "R1-Q13", "q_type": "true_false_not_given", "prompt_md": "Vertical farming reduces disease risk." }
      ],
      "scoring": { "method": "by_supabase", "points_per_question": 1 }
    },
    {
      "section_id": "reading_2",
      "type": "reading",
      "title": "Reading Passage 2 – The Falkirk Wheel (Q14–26)",
      "passage_src_md": "passages/reading_2.md",
      "layout": { "columns": 2, "reading_order": "top_to_bottom_each_column" },
      "assets": { "diagram_image": "assets/images/falkirk_wheel_diagram.jpg" },
      "questions": [
        { "q_id": "R2-Q14", "q_type": "true_false_not_given", "prompt_md": "Linked canals for the first time." },
        { "q_id": "R2-Q15", "q_type": "true_false_not_given", "prompt_md": "Initial opposition to design." },
        { "q_id": "R2-Q16", "q_type": "true_false_not_given", "prompt_md": "Assembled at manufacturing site first." },
        { "q_id": "R2-Q17", "q_type": "true_false_not_given", "prompt_md": "Only boat lift with hand-bolted sections." },
        { "q_id": "R2-Q18", "q_type": "true_false_not_given", "prompt_md": "Gondola weight varies by boat size." },
        { "q_id": "R2-Q19", "q_type": "true_false_not_given", "prompt_md": "Accounted for nearby ancient monument." },
        { "q_id": "R2-Q20", "q_type": "diagram_label", "expected": "one_word", "prompt_md": "Pair of **_____** lifted to shut out basin water." },
        { "q_id": "R2-Q21", "q_type": "diagram_label", "expected": "one_word", "prompt_md": "**_____** removed to enable rotation." },
        { "q_id": "R2-Q22", "q_type": "diagram_label", "expected": "one_word", "prompt_md": "Hydraulic motors drive the **_____**." },
        { "q_id": "R2-Q23", "q_type": "diagram_label", "expected": "one_word", "prompt_md": "Set of **_____** keeps gondolas upright." },
        { "q_id": "R2-Q24", "q_type": "diagram_label", "expected": "one_word", "prompt_md": "Boat moves onto the **_____** above." },
        { "q_id": "R2-Q25", "q_type": "diagram_label", "expected": "one_word", "prompt_md": "Tunnel beneath Roman **_____**." },
        { "q_id": "R2-Q26", "q_type": "diagram_label", "expected": "one_word", "prompt_md": "Remaining lift via pair of **_____**." }
      ],
      "scoring": { "method": "by_supabase", "points_per_question": 1 }
    },
    {
      "section_id": "reading_3",
      "type": "reading",
      "title": "Reading Passage 3 – Reducing the Effects of Climate Change (Q27–40)",
      "passage_src_md": "passages/reading_3.md",
      "layout": { "columns": 2, "reading_order": "top_to_bottom_each_column" },
      "questions": [
        { "q_id": "R3-Q27", "q_type": "paragraph_match", "prompt_md": "Project based on earlier natural phenomenon.", "options_paragraphs": ["A","B","C","D","E","F","G","H"] },
        { "q_id": "R3-Q28", "q_type": "paragraph_match", "prompt_md": "Example of successful use.", "options_paragraphs": ["A","B","C","D","E","F","G","H"] },
        { "q_id": "R3-Q29", "q_type": "paragraph_match", "prompt_md": "Common definition of geo-engineering.", "options_paragraphs": ["A","B","C","D","E","F","G","H"] },
        { "q_id": "R3-Q30", "q_type": "table_completion", "expected": "one_word", "prompt_md": "Spacecraft to create a **_____** reducing light." },
        { "q_id": "R3-Q31", "q_type": "table_completion", "expected": "one_word", "prompt_md": "Place **_____** in sea…" },
        { "q_id": "R3-Q32", "q_type": "table_completion", "expected": "one_word", "prompt_md": "…to encourage **_____** to form" },
        { "q_id": "R3-Q33", "q_type": "table_completion", "expected": "one_word", "prompt_md": "Aerosols create **_____**" },
        { "q_id": "R3-Q34", "q_type": "table_completion", "expected": "one_word", "prompt_md": "Fix strong **_____** to ice sheets" },
        { "q_id": "R3-Q35", "q_type": "table_completion", "expected": "one_word", "prompt_md": "**_____** reflect radiation" },
        { "q_id": "R3-Q36", "q_type": "table_completion", "expected": "one_word", "prompt_md": "Change direction of **_____**" },
        { "q_id": "R3-Q37", "q_type": "match_list", "prompt_md": "Effects may not be long-lasting.", "options_labels": ["A","B","C","D"] },
        { "q_id": "R3-Q38", "q_type": "match_list", "prompt_md": "Worth exploring the topic.",       "options_labels": ["A","B","C","D"] },
        { "q_id": "R3-Q39", "q_type": "match_list", "prompt_md": "May need to limit effectiveness.", "options_labels": ["A","B","C","D"] },
        { "q_id": "R3-Q40", "q_type": "match_list", "prompt_md": "Renewables research cannot be replaced.", "options_labels": ["A","B","C","D"] }
      ],
      "scoring": { "method": "by_supabase", "points_per_question": 1 }
    }
  ]
}
EOF

echo "Done. Pack created at: ${PACK_ROOT}"
echo "Now add media files under assets/, paste passage texts into passages/*.md, and seed Supabase answers keyed by (test_id, q_id)."