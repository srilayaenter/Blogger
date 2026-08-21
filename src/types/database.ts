/**
 * Ergonomic, hand-written aliases over src/lib/supabase/database.types.ts (the generated
 * types). Import from here in application code instead of indexing into `Database[...]`
 * directly -- this file is what should stay stable even if the generated file is regenerated
 * with slightly different internal shape.
 */

import type { Database } from "@/lib/supabase/database.types";

export type AdminUser = Database["public"]["Tables"]["admin_users"]["Row"];
export type AdminUserInsert = Database["public"]["Tables"]["admin_users"]["Insert"];
export type AdminUserUpdate = Database["public"]["Tables"]["admin_users"]["Update"];

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
export type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];

export type Recipe = Database["public"]["Tables"]["recipes"]["Row"];
export type RecipeInsert = Database["public"]["Tables"]["recipes"]["Insert"];
export type RecipeUpdate = Database["public"]["Tables"]["recipes"]["Update"];

export type Ingredient = Database["public"]["Tables"]["ingredients"]["Row"];
export type IngredientInsert = Database["public"]["Tables"]["ingredients"]["Insert"];
export type IngredientUpdate = Database["public"]["Tables"]["ingredients"]["Update"];

export type Instruction = Database["public"]["Tables"]["instructions"]["Row"];
export type InstructionInsert = Database["public"]["Tables"]["instructions"]["Insert"];
export type InstructionUpdate = Database["public"]["Tables"]["instructions"]["Update"];

export type RecipeCategory = Database["public"]["Tables"]["recipe_categories"]["Row"];

export type SourceScan = Database["public"]["Tables"]["source_scans"]["Row"];
export type SourceScanInsert = Database["public"]["Tables"]["source_scans"]["Insert"];
export type SourceScanUpdate = Database["public"]["Tables"]["source_scans"]["Update"];

export type ImportEvent = Database["public"]["Tables"]["import_events"]["Row"];
export type ImportEventInsert = Database["public"]["Tables"]["import_events"]["Insert"];
export type ImportEventUpdate = Database["public"]["Tables"]["import_events"]["Update"];

export type RecipeStatus = Database["public"]["Enums"]["recipe_status"];
export type RecipeDifficulty = Database["public"]["Enums"]["recipe_difficulty"];
export type ScanOcrStatus = Database["public"]["Enums"]["scan_ocr_status"];
export type AdminRole = Database["public"]["Enums"]["admin_role"];
export type SourceScanReviewStatus = Database["public"]["Enums"]["source_scan_review_status"];
export type ImportEventStatus = Database["public"]["Enums"]["import_event_status"];

/**
 * A recipe row with its child rows attached -- the shape most read paths actually want, once
 * queries.ts (future stage) joins them. Not a database view, just an application-level type.
 */
export type RecipeWithDetails = Recipe & {
  ingredients: Ingredient[];
  instructions: Instruction[];
  categories: Category[];
};
