import { createClient } from "@supabase/supabase-js";

export type SecretNote = {
  id: string;
  mood: string;
  message: string;
  music_title: string | null;
  music_url: string | null;
  created_at: string;
};

type Database = {
  public: {
    Tables: {
      secret_notes: {
        Row: SecretNote;
        Insert: {
          id?: string;
          mood: string;
          message: string;
          music_title?: string | null;
          music_url?: string | null;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      claim_oldest_secret_note: {
        Args: Record<string, never>;
        Returns: SecretNote[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl as string, supabaseKey as string)
  : null;
