export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      education_certificates: {
        Row: {
          certificate_code: string
          id: string
          issued_at: string
          level_id: string
          product_slug: string
          user_id: string
        }
        Insert: {
          certificate_code: string
          id?: string
          issued_at?: string
          level_id: string
          product_slug?: string
          user_id: string
        }
        Update: {
          certificate_code?: string
          id?: string
          issued_at?: string
          level_id?: string
          product_slug?: string
          user_id?: string
        }
        Relationships: []
      }
      education_course_certificates: {
        Row: {
          certificate_code: string
          id: string
          issued_at: string
          product_slug: string
          user_id: string
        }
        Insert: {
          certificate_code: string
          id?: string
          issued_at?: string
          product_slug: string
          user_id: string
        }
        Update: {
          certificate_code?: string
          id?: string
          issued_at?: string
          product_slug?: string
          user_id?: string
        }
        Relationships: []
      }
      education_lesson_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          lesson_slug: string
          level_id: string
          product_slug: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_slug: string
          level_id: string
          product_slug?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_slug?: string
          level_id?: string
          product_slug?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      education_lessons: {
        Row: {
          body_en: string | null
          body_ja: string | null
          created_at: string
          id: string
          is_published: boolean
          lesson_slug: string
          level_slug: string
          order_index: number
          product_id: string
          title_en: string
          title_ja: string
        }
        Insert: {
          body_en?: string | null
          body_ja?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          lesson_slug: string
          level_slug: string
          order_index?: number
          product_id: string
          title_en: string
          title_ja: string
        }
        Update: {
          body_en?: string | null
          body_ja?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          lesson_slug?: string
          level_slug?: string
          order_index?: number
          product_id?: string
          title_en?: string
          title_ja?: string
        }
        Relationships: [
          {
            foreignKeyName: "education_lessons_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "education_products"
            referencedColumns: ["id"]
          },
        ]
      }
      education_level_quiz_attempts: {
        Row: {
          answers: Json | null
          attempted_at: string
          id: string
          level_id: string
          passed: boolean
          product_slug: string
          score: number
          total: number
          user_id: string
        }
        Insert: {
          answers?: Json | null
          attempted_at?: string
          id?: string
          level_id: string
          passed?: boolean
          product_slug?: string
          score: number
          total: number
          user_id: string
        }
        Update: {
          answers?: Json | null
          attempted_at?: string
          id?: string
          level_id?: string
          passed?: boolean
          product_slug?: string
          score?: number
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      education_products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_free: boolean
          price_yen: number
          slug: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_free?: boolean
          price_yen?: number
          slug: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_free?: boolean
          price_yen?: number
          slug?: string
          title?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      holdings: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          portfolio_id: string
          symbol: string
          updated_at: string
          weight: number
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          portfolio_id: string
          symbol: string
          updated_at?: string
          weight?: number
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          portfolio_id?: string
          symbol?: string
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "holdings_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      link_previews: {
        Row: {
          description: string | null
          fetched_at: string | null
          image: string | null
          site_name: string | null
          title: string | null
          url: string
        }
        Insert: {
          description?: string | null
          fetched_at?: string | null
          image?: string | null
          site_name?: string | null
          title?: string | null
          url: string
        }
        Update: {
          description?: string | null
          fetched_at?: string | null
          image?: string | null
          site_name?: string | null
          title?: string | null
          url?: string
        }
        Relationships: []
      }
      news_items: {
        Row: {
          country: string | null
          created_at: string | null
          description: string | null
          id: number
          image: string | null
          lang: string | null
          published_at: string | null
          source: string | null
          title: string
          url: string
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          image?: string | null
          lang?: string | null
          published_at?: string | null
          source?: string | null
          title: string
          url: string
        }
        Update: {
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          image?: string | null
          lang?: string | null
          published_at?: string | null
          source?: string | null
          title?: string
          url?: string
        }
        Relationships: []
      }
      portfolio_holdings: {
        Row: {
          amount: number
          asset_type: string
          avg_cost: number | null
          created_at: string
          currency: string
          exchange: string | null
          id: string
          portfolio_id: string
          quantity: number
          symbol: string
          updated_at: string
        }
        Insert: {
          amount?: number
          asset_type?: string
          avg_cost?: number | null
          created_at?: string
          currency?: string
          exchange?: string | null
          id?: string
          portfolio_id: string
          quantity?: number
          symbol: string
          updated_at?: string
        }
        Update: {
          amount?: number
          asset_type?: string
          avg_cost?: number | null
          created_at?: string
          currency?: string
          exchange?: string | null
          id?: string
          portfolio_id?: string
          quantity?: number
          symbol?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_holdings_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_snapshots: {
        Row: {
          created_at: string
          day: string
          id: string
          total_usd: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          day: string
          id?: string
          total_usd?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          day?: string
          id?: string
          total_usd?: number
          user_id?: string | null
        }
        Relationships: []
      }
      portfolios: {
        Row: {
          base_currency: string
          created_at: string
          id: string
          is_public: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          base_currency?: string
          created_at?: string
          id?: string
          is_public?: boolean
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          base_currency?: string
          created_at?: string
          id?: string
          is_public?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          attachments: Json
          body: string
          created_at: string
          id: number
          parent_comment_id: number | null
          post_id: string
          user_id: string
        }
        Insert: {
          attachments?: Json
          body: string
          created_at?: string
          id?: number
          parent_comment_id?: number | null
          post_id: string
          user_id: string
        }
        Update: {
          attachments?: Json
          body?: string
          created_at?: string
          id?: number
          parent_comment_id?: number | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: number
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          attachments: Json | null
          author_id: string | null
          comments_count: number | null
          content: string
          created_at: string
          feed: string
          id: string
          title: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          attachments?: Json | null
          author_id?: string | null
          comments_count?: number | null
          content: string
          created_at?: string
          feed?: string
          id?: string
          title?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          attachments?: Json | null
          author_id?: string | null
          comments_count?: number | null
          content?: string
          created_at?: string
          feed?: string
          id?: string
          title?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          portfolio: Json | null
          portfolio_public: boolean
          trader_style: string | null
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          portfolio?: Json | null
          portfolio_public?: boolean
          trader_style?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          portfolio?: Json | null
          portfolio_public?: boolean
          trader_style?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      user_lesson_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          id: string
          last_viewed_at: string
          lesson_id: string
          score: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          last_viewed_at?: string
          lesson_id: string
          score?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          last_viewed_at?: string
          lesson_id?: string
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "education_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_product_access: {
        Row: {
          access_status: string
          granted_at: string
          id: string
          product_id: string
          source: string
          user_id: string
        }
        Insert: {
          access_status?: string
          granted_at?: string
          id?: string
          product_id: string
          source?: string
          user_id: string
        }
        Update: {
          access_status?: string
          granted_at?: string
          id?: string
          product_id?: string
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_product_access_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "education_products"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          ip: string | null
          referrer: string | null
          source: string
          stage: string
          status: string
          tags: Json
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip?: string | null
          referrer?: string | null
          source?: string
          stage?: string
          status?: string
          tags?: Json
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip?: string | null
          referrer?: string | null
          source?: string
          stage?: string
          status?: string
          tags?: Json
          user_agent?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      gen_username: { Args: { base: string }; Returns: string }
      run_portfolio_snapshot: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
