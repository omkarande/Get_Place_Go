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
      favorites: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          place_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          place_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          place_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      itineraries: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          places: string[] | null
          schedule: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          places?: string[] | null
          schedule?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          places?: string[] | null
          schedule?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      places: {
        Row: {
          address: string
          aesthetic_score: number | null
          area: Database["public"]["Enums"]["area"]
          average_rating: number | null
          cover_image_url: string | null
          created_at: string
          cuisine_type: string[] | null
          description: string | null
          google_place_id: string | null
          has_power_outlets: boolean | null
          has_wifi: boolean | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_group_friendly: boolean | null
          is_pet_friendly: boolean | null
          is_romantic: boolean | null
          is_work_friendly: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          noise_level: Database["public"]["Enums"]["noise_level"] | null
          price_range: Database["public"]["Enums"]["price_range"] | null
          primary_vibe: Database["public"]["Enums"]["vibe_category"] | null
          review_count: number | null
          slug: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          address: string
          aesthetic_score?: number | null
          area: Database["public"]["Enums"]["area"]
          average_rating?: number | null
          cover_image_url?: string | null
          created_at?: string
          cuisine_type?: string[] | null
          description?: string | null
          google_place_id?: string | null
          has_power_outlets?: boolean | null
          has_wifi?: boolean | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_group_friendly?: boolean | null
          is_pet_friendly?: boolean | null
          is_romantic?: boolean | null
          is_work_friendly?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          noise_level?: Database["public"]["Enums"]["noise_level"] | null
          price_range?: Database["public"]["Enums"]["price_range"] | null
          primary_vibe?: Database["public"]["Enums"]["vibe_category"] | null
          review_count?: number | null
          slug: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          address?: string
          aesthetic_score?: number | null
          area?: Database["public"]["Enums"]["area"]
          average_rating?: number | null
          cover_image_url?: string | null
          created_at?: string
          cuisine_type?: string[] | null
          description?: string | null
          google_place_id?: string | null
          has_power_outlets?: boolean | null
          has_wifi?: boolean | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_group_friendly?: boolean | null
          is_pet_friendly?: boolean | null
          is_romantic?: boolean | null
          is_work_friendly?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          noise_level?: Database["public"]["Enums"]["noise_level"] | null
          price_range?: Database["public"]["Enums"]["price_range"] | null
          primary_vibe?: Database["public"]["Enums"]["vibe_category"] | null
          review_count?: number | null
          slug?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          preferred_areas: Database["public"]["Enums"]["area"][] | null
          preferred_vibes: Database["public"]["Enums"]["vibe_category"][] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          preferred_areas?: Database["public"]["Enums"]["area"][] | null
          preferred_vibes?:
            | Database["public"]["Enums"]["vibe_category"][]
            | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          preferred_areas?: Database["public"]["Enums"]["area"][] | null
          preferred_vibes?:
            | Database["public"]["Enums"]["vibe_category"][]
            | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          content: string
          created_at: string
          detected_vibes: Database["public"]["Enums"]["vibe_category"][] | null
          embedding: string | null
          external_id: string | null
          id: string
          place_id: string
          rating: number | null
          sentiment_score: number | null
          source: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          detected_vibes?: Database["public"]["Enums"]["vibe_category"][] | null
          embedding?: string | null
          external_id?: string | null
          id?: string
          place_id: string
          rating?: number | null
          sentiment_score?: number | null
          source?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          detected_vibes?: Database["public"]["Enums"]["vibe_category"][] | null
          embedding?: string | null
          external_id?: string | null
          id?: string
          place_id?: string
          rating?: number | null
          sentiment_score?: number | null
          source?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      search_history: {
        Row: {
          created_at: string
          filters: Json | null
          id: string
          query: string
          results_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json | null
          id?: string
          query: string
          results_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json | null
          id?: string
          query?: string
          results_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_places_by_vibe: {
        Args: {
          filter_area?: Database["public"]["Enums"]["area"]
          filter_vibe?: Database["public"]["Enums"]["vibe_category"]
          match_count?: number
          query_embedding: string
        }
        Returns: {
          place_id: string
          place_name: string
          similarity: number
        }[]
      }
    }
    Enums: {
      area:
        | "baner"
        | "koregaon_park"
        | "viman_nagar"
        | "hinjewadi"
        | "kothrud"
        | "aundh"
        | "wakad"
        | "hadapsar"
        | "deccan"
        | "camp"
        | "kalyani_nagar"
        | "magarpatta"
        | "pune_all"
        | "pimpri_chinchwad"
      noise_level: "silent" | "quiet" | "moderate" | "lively" | "loud"
      price_range: "budget" | "moderate" | "premium" | "luxury"
      vibe_category:
        | "work_study"
        | "social_dating"
        | "food_experience"
        | "nightlife"
        | "fitness_wellness"
        | "arts_culture"
        | "outdoor_adventure"
        | "shopping"
        | "family_kids"
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
    Enums: {
      area: [
        "baner",
        "koregaon_park",
        "viman_nagar",
        "hinjewadi",
        "kothrud",
        "aundh",
        "wakad",
        "hadapsar",
        "deccan",
        "camp",
        "kalyani_nagar",
        "magarpatta",
        "pune_all",
        "pimpri_chinchwad",
      ],
      noise_level: ["silent", "quiet", "moderate", "lively", "loud"],
      price_range: ["budget", "moderate", "premium", "luxury"],
      vibe_category: [
        "work_study",
        "social_dating",
        "food_experience",
        "nightlife",
        "fitness_wellness",
        "arts_culture",
        "outdoor_adventure",
        "shopping",
        "family_kids",
      ],
    },
  },
} as const
