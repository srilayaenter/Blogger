# Transliteration Policy — PDF-Sourced Recipes

Applies to the batch of 49 recipes imported from the scanned "cooking tips" PDF (see the
extraction and approval review in the project's task history — not reproduced here).

## What this is, and isn't

That PDF is Tamil-only; it contains no English text anywhere. The website's schema
(`src/types/recipe.ts`) requires `title_en`, every ingredient's `name_en`, and every
instruction's `instruction_en` to be non-empty strings — there is no nullable "English not
available" option for these three fields.

Per explicit instruction, the `_en` fields for this batch are **Romanized (transliterated)
Tamil — how the Tamil sounds spelled in Latin letters — not English translations.** No meaning
was added, no ingredient/quantity/step was inferred, and no attempt was made to phrase anything
the way an English recipe would naturally read. `இட்லி` becomes `Idli`; a full instruction
sentence is rendered word-for-word in the same order, not paraphrased or summarized.

**This is a stopgap, not a finished state.** These recipes need real English translation before
they should be considered done. Until that happens:
- `/ta/recipes/<slug>` pages read normally (genuine Tamil content).
- `/en/recipes/<slug>` pages for this batch will look like Romanized Tamil, not natural English
  — readable to someone who knows spoken Tamil, not a translation for an English-only reader.

## Conventions used

Common recurring words were kept consistent across all 49 recipes rather than transliterated
fresh each time (e.g. வெங்காயம் is always `Vengayam`, எண்ணெய் is always `Ennai`, தயார்
செய்யவும் is always `thayaar seyyavum`). Where the same Tamil word appears with minor spelling
variation in the source across different recipes (e.g. `கத்திரிக்காய்` vs `கத்தரிக்காய்`, both
unambiguously "brinjal"), one consistent transliteration was used for readability — the `_ta`
field always preserves the source's exact original spelling; only the `_en` rendering was
normalized.

Units that are themselves Tamil-script renderings of borrowed words (கிராம், கிலோ, மி.லி.) come
back out as their recognizable Latin form (`Grams`, `Kilo`, `ml`) since that's genuinely what
transliterating them produces, not a translation choice.

## What to do next

Replace `title_en`/`name_en`/`instruction_en` for these 49 recipes with real English translations
when that work happens, following `docs/translation-glossary.md` for ingredient-name consistency
with the rest of the site. Nothing else in these recipe files needs to change when that happens —
`title_ta`, ingredient/instruction `_ta` fields, quantities, and units are already final.
