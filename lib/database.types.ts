export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          bio: string | null;
          trader_style: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          bio?: string | null;
          trader_style?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          username?: string | null;
          display_name?: string | null;
          bio?: string | null;
          trader_style?: string | null;
          avatar_url?: string | null;
        };
        Relationships: [];
      };

      posts: {
        Row: {
          id: string;
          author_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          author_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          content?: string;
        };
        Relationships: [];
      };

      portfolios: {
        Row: { id: string; user_id: string; name: string; is_public: boolean; created_at: string };
        Insert: { user_id: string; name: string; is_public?: boolean; created_at?: string };
        Update: { name?: string; is_public?: boolean };
        Relationships: [];
      };

      portfolio_holdings: {
        Row: { id: string; portfolio_id: string; symbol: string; amount: number; currency: string; created_at: string };
        Insert: { portfolio_id: string; symbol: string; amount: number; currency?: string; created_at?: string };
        Update: { symbol?: string; amount?: number; currency?: string };
        Relationships: [];
      };

      portfolio_snapshots: {
        Row: { id: string; user_id: string; total_value: number | null; currency: string | null; created_at: string };
        Insert: { user_id: string; total_value?: number | null; currency?: string | null; created_at?: string };
        Update: { total_value?: number | null; currency?: string | null };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};