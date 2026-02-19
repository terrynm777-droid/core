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
          content: string;
          author_id: string;
          created_at: string;
        };
        Insert: {
          content: string;
          author_id: string;
          created_at?: string;
        };
        Update: {
          content?: string;
        };
        Relationships: [];
      };

      portfolio_snapshots: {
        Row: {
          id: string;
          user_id: string;
          total_value: number | null;
          currency: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          total_value?: number | null;
          currency?: string | null;
          created_at?: string;
        };
        Update: {
          total_value?: number | null;
          currency?: string | null;
        };
        Relationships: [];
      };

      portfolio_holdings: {
        Row: {
          id: string;
          portfolio_id: string;
          symbol: string;
          amount: number;
          currency: string | null;
        };
        Insert: {
          portfolio_id: string;
          symbol: string;
          amount: number;
          currency?: string | null;
        };
        Update: {
          symbol?: string;
          amount?: string | number; // if you want strict: change back to number
          currency?: string | null;
        };
        Relationships: [];
      };

      portfolios: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          is_public?: boolean;
        };
        Relationships: [];
      };

      post_comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          body: string;
          created_at: string;
          parent_comment_id: string | null;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          body: string;
          created_at?: string;
          parent_comment_id?: string | null;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          body?: string;
          created_at?: string;
          parent_comment_id?: string | null;
        };
        Relationships: [];
      };
    };

    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};