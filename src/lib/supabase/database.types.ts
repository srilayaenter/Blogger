/**
 * Hand-written to match supabase/migrations/0001_init.sql exactly, in the same shape the
 * Supabase CLI's `supabase gen types typescript` would produce. There is no live Supabase
 * project yet to generate this from (CLAUDE.md M1 is still pending), so this is authored by
 * hand for now.
 *
 * Regenerate this file from the real project once it exists, instead of hand-editing further:
 *   supabase gen types typescript --project-id <id> > src/lib/supabase/database.types.ts
 *
 * Do not import this file directly from application code -- import from src/types/database.ts,
 * which re-exports ergonomic aliases derived from this file (CLAUDE.md section 27).
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string;
          email: string;
          role: Database["public"]["Enums"]["admin_role"];
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: Database["public"]["Enums"]["admin_role"];
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: Database["public"]["Enums"]["admin_role"];
          created_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name_ta: string;
          name_en: string;
          description_ta: string | null;
          description_en: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_ta: string;
          name_en: string;
          description_ta?: string | null;
          description_en?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name_ta?: string;
          name_en?: string;
          description_ta?: string | null;
          description_en?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      recipes: {
        Row: {
          id: string;
          slug: string;
          title_ta: string;
          title_en: string;
          description_ta: string | null;
          description_en: string | null;
          source_page_number: number | null;
          prep_time_minutes: number | null;
          cook_time_minutes: number | null;
          total_time_minutes: number | null;
          servings: number | null;
          difficulty: Database["public"]["Enums"]["recipe_difficulty"] | null;
          featured_image_url: string | null;
          status: Database["public"]["Enums"]["recipe_status"];
          seo_title_ta: string | null;
          seo_title_en: string | null;
          seo_description_ta: string | null;
          seo_description_en: string | null;
          google_drive_source_file_id: string | null;
          created_by: string | null;
          updated_by: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title_ta: string;
          title_en: string;
          description_ta?: string | null;
          description_en?: string | null;
          source_page_number?: number | null;
          prep_time_minutes?: number | null;
          cook_time_minutes?: number | null;
          total_time_minutes?: number | null;
          servings?: number | null;
          difficulty?: Database["public"]["Enums"]["recipe_difficulty"] | null;
          featured_image_url?: string | null;
          status?: Database["public"]["Enums"]["recipe_status"];
          seo_title_ta?: string | null;
          seo_title_en?: string | null;
          seo_description_ta?: string | null;
          seo_description_en?: string | null;
          google_drive_source_file_id?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title_ta?: string;
          title_en?: string;
          description_ta?: string | null;
          description_en?: string | null;
          source_page_number?: number | null;
          prep_time_minutes?: number | null;
          cook_time_minutes?: number | null;
          total_time_minutes?: number | null;
          servings?: number | null;
          difficulty?: Database["public"]["Enums"]["recipe_difficulty"] | null;
          featured_image_url?: string | null;
          status?: Database["public"]["Enums"]["recipe_status"];
          seo_title_ta?: string | null;
          seo_title_en?: string | null;
          seo_description_ta?: string | null;
          seo_description_en?: string | null;
          google_drive_source_file_id?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipes_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipes_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_users";
            referencedColumns: ["id"];
          },
        ];
      };
      ingredients: {
        Row: {
          id: string;
          recipe_id: string;
          name_ta: string;
          name_en: string;
          quantity: string | null;
          unit_ta: string | null;
          unit_en: string | null;
          notes_ta: string | null;
          notes_en: string | null;
          display_order: number;
          is_uncertain: boolean;
          uncertainty_notes: string | null;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          name_ta: string;
          name_en: string;
          quantity?: string | null;
          unit_ta?: string | null;
          unit_en?: string | null;
          notes_ta?: string | null;
          notes_en?: string | null;
          display_order?: number;
          is_uncertain?: boolean;
          uncertainty_notes?: string | null;
        };
        Update: {
          id?: string;
          recipe_id?: string;
          name_ta?: string;
          name_en?: string;
          quantity?: string | null;
          unit_ta?: string | null;
          unit_en?: string | null;
          notes_ta?: string | null;
          notes_en?: string | null;
          display_order?: number;
          is_uncertain?: boolean;
          uncertainty_notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ingredients_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
        ];
      };
      instructions: {
        Row: {
          id: string;
          recipe_id: string;
          step_number: number;
          instruction_ta: string;
          instruction_en: string;
          image_url: string | null;
          display_order: number;
          is_uncertain: boolean;
          uncertainty_notes: string | null;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          step_number: number;
          instruction_ta: string;
          instruction_en: string;
          image_url?: string | null;
          display_order?: number;
          is_uncertain?: boolean;
          uncertainty_notes?: string | null;
        };
        Update: {
          id?: string;
          recipe_id?: string;
          step_number?: number;
          instruction_ta?: string;
          instruction_en?: string;
          image_url?: string | null;
          display_order?: number;
          is_uncertain?: boolean;
          uncertainty_notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "instructions_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
        ];
      };
      recipe_categories: {
        Row: {
          recipe_id: string;
          category_id: string;
        };
        Insert: {
          recipe_id: string;
          category_id: string;
        };
        Update: {
          recipe_id?: string;
          category_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_categories_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_categories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      source_scans: {
        Row: {
          id: string;
          recipe_id: string | null;
          page_number: number | null;
          image_url: string | null;
          google_drive_file_id: string;
          google_doc_id: string | null;
          ocr_provider: string | null;
          ocr_raw_text: string | null;
          ocr_status: Database["public"]["Enums"]["scan_ocr_status"];
          corrected_text_ta: string | null;
          review_status: Database["public"]["Enums"]["source_scan_review_status"];
          uploaded_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          recipe_id?: string | null;
          page_number?: number | null;
          image_url?: string | null;
          google_drive_file_id: string;
          google_doc_id?: string | null;
          ocr_provider?: string | null;
          ocr_raw_text?: string | null;
          ocr_status?: Database["public"]["Enums"]["scan_ocr_status"];
          corrected_text_ta?: string | null;
          review_status?: Database["public"]["Enums"]["source_scan_review_status"];
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          recipe_id?: string | null;
          page_number?: number | null;
          image_url?: string | null;
          google_drive_file_id?: string;
          google_doc_id?: string | null;
          ocr_provider?: string | null;
          ocr_raw_text?: string | null;
          ocr_status?: Database["public"]["Enums"]["scan_ocr_status"];
          corrected_text_ta?: string | null;
          review_status?: Database["public"]["Enums"]["source_scan_review_status"];
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "source_scans_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "source_scans_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "admin_users";
            referencedColumns: ["id"];
          },
        ];
      };
      import_events: {
        Row: {
          id: string;
          recipe_external_id: string;
          recipe_id: string | null;
          source_drive_file_id: string | null;
          source_google_doc_id: string | null;
          payload: Json;
          payload_hash: string;
          status: Database["public"]["Enums"]["import_event_status"];
          status_reason: string | null;
          received_at: string;
          processed_at: string | null;
        };
        Insert: {
          id?: string;
          recipe_external_id: string;
          recipe_id?: string | null;
          source_drive_file_id?: string | null;
          source_google_doc_id?: string | null;
          payload: Json;
          payload_hash: string;
          status?: Database["public"]["Enums"]["import_event_status"];
          status_reason?: string | null;
          received_at?: string;
          processed_at?: string | null;
        };
        Update: {
          id?: string;
          recipe_external_id?: string;
          recipe_id?: string | null;
          source_drive_file_id?: string | null;
          source_google_doc_id?: string | null;
          payload?: Json;
          payload_hash?: string;
          status?: Database["public"]["Enums"]["import_event_status"];
          status_reason?: string | null;
          received_at?: string;
          processed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "import_events_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      recipe_status: "draft" | "review" | "published" | "archived";
      recipe_difficulty: "easy" | "medium" | "hard";
      scan_ocr_status: "pending" | "processing" | "extracted" | "failed" | "corrected" | "verified";
      admin_role: "owner" | "editor";
      source_scan_review_status: "pending" | "approved";
      import_event_status: "received" | "applied" | "rejected" | "failed";
    };
    CompositeTypes: Record<string, never>;
  };
};
