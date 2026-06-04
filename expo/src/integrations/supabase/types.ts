/* eslint-disable */
// AUTO-GENERATED — DO NOT EDIT
// Run migrations to regenerate.

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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      complaints: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          description: string | null
          id: string
          listing_id: string | null
          order_id: string | null
          priority: string | null
          resolution: string | null
          resolved_at: string | null
          seller_id: string | null
          status: string | null
          title: string
          type: string | null
          updated_at: string | null
          user_email: string | null
          user_id: string
          user_name: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          listing_id?: string | null
          order_id?: string | null
          priority?: string | null
          resolution?: string | null
          resolved_at?: string | null
          seller_id?: string | null
          status?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id: string
          user_name?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          listing_id?: string | null
          order_id?: string | null
          priority?: string | null
          resolution?: string | null
          resolved_at?: string | null
          seller_id?: string | null
          status?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "complaints_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dish_notifications: {
        Row: {
          created_at: string | null
          cuisine_type: string | null
          dish_name: string | null
          email: string | null
          id: string
          is_active: boolean | null
          location: string | null
          phone: string | null
          route_type: string | null
          subcuisine_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          cuisine_type?: string | null
          dish_name?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          phone?: string | null
          route_type?: string | null
          subcuisine_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          cuisine_type?: string | null
          dish_name?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          phone?: string | null
          route_type?: string | null
          subcuisine_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dish_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
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
      food_listings: {
        Row: {
          address: string | null
          allergens: string[] | null
          available_from: string | null
          available_until: string | null
          created_at: string | null
          cuisine_type: string | null
          description: string | null
          dish_name: string
          id: string
          image: string | null
          ingredients: string[] | null
          is_active: boolean | null
          is_approved: boolean | null
          is_featured: boolean | null
          is_vegetarian: boolean | null
          location_lat: number | null
          location_lng: number | null
          order_count: number | null
          packaging: string | null
          pickup_time: string | null
          preparation_time: number | null
          price: number
          quantity: number | null
          rating: number | null
          remaining_quantity: number | null
          review_count: number | null
          seller_id: string
          seller_image: string | null
          seller_name: string
          seller_rating: number | null
          servings: number | null
          spice_level: string | null
          subcuisine_type: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          allergens?: string[] | null
          available_from?: string | null
          available_until?: string | null
          created_at?: string | null
          cuisine_type?: string | null
          description?: string | null
          dish_name: string
          id?: string
          image?: string | null
          ingredients?: string[] | null
          is_active?: boolean | null
          is_approved?: boolean | null
          is_featured?: boolean | null
          is_vegetarian?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          order_count?: number | null
          packaging?: string | null
          pickup_time?: string | null
          preparation_time?: number | null
          price: number
          quantity?: number | null
          rating?: number | null
          remaining_quantity?: number | null
          review_count?: number | null
          seller_id: string
          seller_image?: string | null
          seller_name: string
          seller_rating?: number | null
          servings?: number | null
          spice_level?: string | null
          subcuisine_type?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          allergens?: string[] | null
          available_from?: string | null
          available_until?: string | null
          created_at?: string | null
          cuisine_type?: string | null
          description?: string | null
          dish_name?: string
          id?: string
          image?: string | null
          ingredients?: string[] | null
          is_active?: boolean | null
          is_approved?: boolean | null
          is_featured?: boolean | null
          is_vegetarian?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          order_count?: number | null
          packaging?: string | null
          pickup_time?: string | null
          preparation_time?: number | null
          price?: number
          quantity?: number | null
          rating?: number | null
          remaining_quantity?: number | null
          review_count?: number | null
          seller_id?: string
          seller_image?: string | null
          seller_name?: string
          seller_rating?: number | null
          servings?: number | null
          spice_level?: string | null
          subcuisine_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          related_id: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          related_id?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_id?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          accepted_at: string | null
          buyer_id: string
          buyer_name: string | null
          buyer_phone: string | null
          cancelled_at: string | null
          completed_at: string | null
          created_at: string | null
          delivered_at: string | null
          delivery_address: string | null
          delivery_instructions: string | null
          delivery_method: string | null
          dish_name: string
          id: string
          is_rated: boolean | null
          listing_id: string
          listing_snapshot: Json | null
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          pickup_time: string | null
          quantity: number | null
          rating: number | null
          ready_at: string | null
          review_comment: string | null
          seller_address: string | null
          seller_id: string
          seller_name: string | null
          seller_phone: string | null
          status: string | null
          total_price: number
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          buyer_id: string
          buyer_name?: string | null
          buyer_phone?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_address?: string | null
          delivery_instructions?: string | null
          delivery_method?: string | null
          dish_name: string
          id?: string
          is_rated?: boolean | null
          listing_id: string
          listing_snapshot?: Json | null
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          pickup_time?: string | null
          quantity?: number | null
          rating?: number | null
          ready_at?: string | null
          review_comment?: string | null
          seller_address?: string | null
          seller_id: string
          seller_name?: string | null
          seller_phone?: string | null
          status?: string | null
          total_price: number
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          buyer_id?: string
          buyer_name?: string | null
          buyer_phone?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_address?: string | null
          delivery_instructions?: string | null
          delivery_method?: string | null
          dish_name?: string
          id?: string
          is_rated?: boolean | null
          listing_id?: string
          listing_snapshot?: Json | null
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          pickup_time?: string | null
          quantity?: number | null
          rating?: number | null
          ready_at?: string | null
          review_comment?: string | null
          seller_address?: string | null
          seller_id?: string
          seller_name?: string | null
          seller_phone?: string | null
          status?: string | null
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          allow_profile_display: boolean | null
          avatar_url: string | null
          created_at: string | null
          cuisine_types: string[] | null
          detour_preference: number | null
          email: string | null
          experience: string | null
          first_post_date: string | null
          free_posts_remaining: number | null
          home_to_office_route: Json | null
          id: string
          is_admin: boolean | null
          is_chef: boolean | null
          is_verified: boolean | null
          location_lat: number | null
          location_lng: number | null
          name: string | null
          office_address: string | null
          office_lat: number | null
          office_lng: number | null
          office_to_home_route: Json | null
          payment_methods: string[] | null
          phone: string | null
          post_count: number | null
          rating: number | null
          review_count: number | null
          routes_same_as_home_to_office: boolean | null
          subscription_expiry: string | null
          subscription_plan: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          allow_profile_display?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          cuisine_types?: string[] | null
          detour_preference?: number | null
          email?: string | null
          experience?: string | null
          first_post_date?: string | null
          free_posts_remaining?: number | null
          home_to_office_route?: Json | null
          id: string
          is_admin?: boolean | null
          is_chef?: boolean | null
          is_verified?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          name?: string | null
          office_address?: string | null
          office_lat?: number | null
          office_lng?: number | null
          office_to_home_route?: Json | null
          payment_methods?: string[] | null
          phone?: string | null
          post_count?: number | null
          rating?: number | null
          review_count?: number | null
          routes_same_as_home_to_office?: boolean | null
          subscription_expiry?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          allow_profile_display?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          cuisine_types?: string[] | null
          detour_preference?: number | null
          email?: string | null
          experience?: string | null
          first_post_date?: string | null
          free_posts_remaining?: number | null
          home_to_office_route?: Json | null
          id?: string
          is_admin?: boolean | null
          is_chef?: boolean | null
          is_verified?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          name?: string | null
          office_address?: string | null
          office_lat?: number | null
          office_lng?: number | null
          office_to_home_route?: Json | null
          payment_methods?: string[] | null
          phone?: string | null
          post_count?: number | null
          rating?: number | null
          review_count?: number | null
          routes_same_as_home_to_office?: boolean | null
          subscription_expiry?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          buyer_id: string
          buyer_image: string | null
          buyer_name: string | null
          comment: string | null
          created_at: string | null
          dish_name: string | null
          id: string
          listing_id: string
          order_id: string
          rating: number
          seller_id: string
          seller_name: string | null
        }
        Insert: {
          buyer_id: string
          buyer_image?: string | null
          buyer_name?: string | null
          comment?: string | null
          created_at?: string | null
          dish_name?: string | null
          id?: string
          listing_id: string
          order_id: string
          rating: number
          seller_id: string
          seller_name?: string | null
        }
        Update: {
          buyer_id?: string
          buyer_image?: string | null
          buyer_name?: string | null
          comment?: string | null
          created_at?: string | null
          dish_name?: string | null
          id?: string
          listing_id?: string
          order_id?: string
          rating?: number
          seller_id?: string
          seller_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      user_id: { Args: never; Returns: string }
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
