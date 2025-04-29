export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      business_members: {
        Row: {
          business_id: string
          role: string | null
          user_id: string
        }
        Insert: {
          business_id: string
          role?: string | null
          user_id: string
        }
        Update: {
          business_id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_members_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          created_at: string
          id: string
          image_credits: number | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_credits?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_credits?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      channel_credentials: {
        Row: {
          business_id: string
          channel: string
          created_at: string
          id: string
          token_encrypted: Json | null
        }
        Insert: {
          business_id: string
          channel: string
          created_at?: string
          id?: string
          token_encrypted?: Json | null
        }
        Update: {
          business_id?: string
          channel?: string
          created_at?: string
          id?: string
          token_encrypted?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "channel_credentials_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
        }
        Relationships: []
      }
      distribution_jobs: {
        Row: {
          business_id: string
          channel: string
          content_id: string
          created_at: string
          error_message: string | null
          external_id: string | null
          id: string
          payload: Json | null
          scheduled_at: string
          status: string
        }
        Insert: {
          business_id: string
          channel: string
          content_id: string
          created_at?: string
          error_message?: string | null
          external_id?: string | null
          id?: string
          payload?: Json | null
          scheduled_at?: string
          status?: string
        }
        Update: {
          business_id?: string
          channel?: string
          content_id?: string
          created_at?: string
          error_message?: string | null
          external_id?: string | null
          id?: string
          payload?: Json | null
          scheduled_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "distribution_jobs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_distribution_jobs_content_id"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_images: {
        Row: {
          business_id: string | null
          created_at: string | null
          format: string | null
          id: string
          prompt: string | null
          size: string | null
          status: string | null
          style: Json | null
          url: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          format?: string | null
          id?: string
          prompt?: string | null
          size?: string | null
          status?: string | null
          style?: Json | null
          url?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          format?: string | null
          id?: string
          prompt?: string | null
          size?: string | null
          status?: string | null
          style?: Json | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_images_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      post_metrics: {
        Row: {
          business_id: string | null
          id: string
          metric_type: string | null
          post_id: string | null
          timestamp: string | null
          value: number | null
        }
        Insert: {
          business_id?: string | null
          id?: string
          metric_type?: string | null
          post_id?: string | null
          timestamp?: string | null
          value?: number | null
        }
        Update: {
          business_id?: string | null
          id?: string
          metric_type?: string | null
          post_id?: string | null
          timestamp?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "post_metrics_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          business_id: string | null
          caption: string | null
          created_at: string | null
          id: string
          image_id: string | null
          scheduled_at: string | null
          status: string | null
        }
        Insert: {
          business_id?: string | null
          caption?: string | null
          created_at?: string | null
          id?: string
          image_id?: string | null
          scheduled_at?: string | null
          status?: string | null
        }
        Update: {
          business_id?: string | null
          caption?: string | null
          created_at?: string | null
          id?: string
          image_id?: string | null
          scheduled_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "generated_images"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_id: string | null
          created_at: string
          email: string
          id: string
          is_approved: boolean
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          email: string
          id: string
          is_approved?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          email?: string
          id?: string
          is_approved?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      research_docs: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: string
          job_id: string | null
          title: string | null
          url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: string
          job_id?: string | null
          title?: string | null
          url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: string
          job_id?: string | null
          title?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_docs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "research_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      research_jobs: {
        Row: {
          business_id: string
          cost_usd: number | null
          created_at: string | null
          finished_at: string | null
          id: string
          prompt: string | null
          started_at: string | null
          status: string
          summary_md: string | null
          user_id: string
        }
        Insert: {
          business_id: string
          cost_usd?: number | null
          created_at?: string | null
          finished_at?: string | null
          id?: string
          prompt?: string | null
          started_at?: string | null
          status?: string
          summary_md?: string | null
          user_id: string
        }
        Update: {
          business_id?: string
          cost_usd?: number | null
          created_at?: string | null
          finished_at?: string | null
          id?: string
          prompt?: string | null
          started_at?: string | null
          status?: string
          summary_md?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_jobs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      research_results: {
        Row: {
          created_at: string | null
          id: number
          job_id: string | null
          note: string | null
          payload: Json | null
          step: Database["public"]["Enums"]["research_step"] | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          job_id?: string | null
          note?: string | null
          payload?: Json | null
          step?: Database["public"]["Enums"]["research_step"] | null
        }
        Update: {
          created_at?: string | null
          id?: never
          job_id?: string | null
          note?: string | null
          payload?: Json | null
          step?: Database["public"]["Enums"]["research_step"] | null
        }
        Relationships: [
          {
            foreignKeyName: "research_results_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "research_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          created_at: string
          id: string
          name: string
          prompt_stub: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          prompt_stub: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          prompt_stub?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_applications: {
        Row: {
          business_name: string
          created_at: string
          email: string
          id: string
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          business_name: string
          created_at?: string
          email: string
          id?: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          business_name?: string
          created_at?: string
          email?: string
          id?: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_business_jobs: {
        Row: {
          business_id: string | null
          id: string | null
          run_at: string | null
          status: string | null
        }
        Insert: {
          business_id?: string | null
          id?: never
          run_at?: string | null
          status?: string | null
        }
        Update: {
          business_id?: string | null
          id?: never
          run_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      approve_user_application: {
        Args:
          | { application_id: string }
          | { application_id: string; org_id?: string }
        Returns: Json
      }
      auto_approve_user: {
        Args: { email: string; business_name: string }
        Returns: Json
      }
      check_and_decrement_credits: {
        Args:
          | Record<PropertyKey, never>
          | { bid: string }
          | { bid: string; cost?: number }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_user_approved: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      application_status: "pending" | "approved" | "rejected"
      research_step:
        | "raw_serp"
        | "link_excerpt"
        | "competitor_meta"
        | "synthesis_md"
        | "error"
      user_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      application_status: ["pending", "approved", "rejected"],
      research_step: [
        "raw_serp",
        "link_excerpt",
        "competitor_meta",
        "synthesis_md",
        "error",
      ],
      user_role: ["admin", "user"],
    },
  },
} as const
