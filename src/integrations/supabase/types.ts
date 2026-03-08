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
      cdfs: {
        Row: {
          cdf_number: string
          created_at: string
          generator_id: string
          id: string
          issue_date: string
          pdf_url: string | null
          receiver_id: string
          status: string
          updated_at: string
        }
        Insert: {
          cdf_number: string
          created_at?: string
          generator_id: string
          id?: string
          issue_date: string
          pdf_url?: string | null
          receiver_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          cdf_number?: string
          created_at?: string
          generator_id?: string
          id?: string
          issue_date?: string
          pdf_url?: string | null
          receiver_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          created_at: string
          file_url: string
          id: string
          manifest_id: string
          received_date: string
          received_weight: number
          user_id: string
        }
        Insert: {
          created_at?: string
          file_url: string
          id?: string
          manifest_id: string
          received_date: string
          received_weight: number
          user_id: string
        }
        Update: {
          created_at?: string
          file_url?: string
          id?: string
          manifest_id?: string
          received_date?: string
          received_weight?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_manifest_id_fkey"
            columns: ["manifest_id"]
            isOneToOne: false
            referencedRelation: "waste_manifests"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          cnpj: string
          created_at: string
          endereco: string
          gov_api_token: string | null
          id: string
          phone: string
          plan: string
          razao_social: string
          responsavel: string
          subscription_status: string
          trial_start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cnpj?: string
          created_at?: string
          endereco?: string
          gov_api_token?: string | null
          id?: string
          phone?: string
          plan?: string
          razao_social?: string
          responsavel?: string
          subscription_status?: string
          trial_start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cnpj?: string
          created_at?: string
          endereco?: string
          gov_api_token?: string | null
          id?: string
          phone?: string
          plan?: string
          razao_social?: string
          responsavel?: string
          subscription_status?: string
          trial_start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      licenses: {
        Row: {
          created_at: string
          document_name: string
          expiration_date: string
          id: string
          issuing_body: string
          managed_company_id: string | null
          pdf_url: string | null
          updated_at: string
          user_id: string
          weight_limit_kg: number
          weight_used_kg: number
        }
        Insert: {
          created_at?: string
          document_name: string
          expiration_date: string
          id?: string
          issuing_body?: string
          managed_company_id?: string | null
          pdf_url?: string | null
          updated_at?: string
          user_id: string
          weight_limit_kg?: number
          weight_used_kg?: number
        }
        Update: {
          created_at?: string
          document_name?: string
          expiration_date?: string
          id?: string
          issuing_body?: string
          managed_company_id?: string | null
          pdf_url?: string | null
          updated_at?: string
          user_id?: string
          weight_limit_kg?: number
          weight_used_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "licenses_managed_company_id_fkey"
            columns: ["managed_company_id"]
            isOneToOne: false
            referencedRelation: "managed_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      managed_companies: {
        Row: {
          cnpj: string
          created_at: string
          id: string
          is_active: boolean
          last_activity_at: string | null
          owner_user_id: string
          razao_social: string
        }
        Insert: {
          cnpj?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_activity_at?: string | null
          owner_user_id: string
          razao_social?: string
        }
        Update: {
          cnpj?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_activity_at?: string | null
          owner_user_id?: string
          razao_social?: string
        }
        Relationships: []
      }
      marketplace_listings: {
        Row: {
          created_at: string
          id: string
          material: string
          price_per_kg: number | null
          quantity: number
          region: string
          status: string
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          material: string
          price_per_kg?: number | null
          quantity: number
          region?: string
          status?: string
          unit?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          material?: string
          price_per_kg?: number | null
          quantity?: number
          region?: string
          status?: string
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_metrics: {
        Row: {
          active_cnpjs: number
          api_calls: number
          created_at: string
          id: string
          managed_company_id: string | null
          mtrs_emitted: number
          period: string
          user_id: string
        }
        Insert: {
          active_cnpjs?: number
          api_calls?: number
          created_at?: string
          id?: string
          managed_company_id?: string | null
          mtrs_emitted?: number
          period: string
          user_id: string
        }
        Update: {
          active_cnpjs?: number
          api_calls?: number
          created_at?: string
          id?: string
          managed_company_id?: string | null
          mtrs_emitted?: number
          period?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_metrics_managed_company_id_fkey"
            columns: ["managed_company_id"]
            isOneToOne: false
            referencedRelation: "managed_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waste_codes_ibama: {
        Row: {
          class: string
          code: string
          created_at: string
          description: string
          id: string
          requires_special_transport: boolean
        }
        Insert: {
          class: string
          code: string
          created_at?: string
          description: string
          id?: string
          requires_special_transport?: boolean
        }
        Update: {
          class?: string
          code?: string
          created_at?: string
          description?: string
          id?: string
          requires_special_transport?: boolean
        }
        Relationships: []
      }
      waste_costs: {
        Row: {
          contract_reference: string | null
          cost_per_kg: number
          created_at: string
          id: string
          transport_cost: number
          updated_at: string
          user_id: string
          waste_class: string
        }
        Insert: {
          contract_reference?: string | null
          cost_per_kg?: number
          created_at?: string
          id?: string
          transport_cost?: number
          updated_at?: string
          user_id: string
          waste_class: string
        }
        Update: {
          contract_reference?: string | null
          cost_per_kg?: number
          created_at?: string
          id?: string
          transport_cost?: number
          updated_at?: string
          user_id?: string
          waste_class?: string
        }
        Relationships: []
      }
      waste_manifests: {
        Row: {
          cdf_id: string | null
          created_at: string
          destination_cnpj: string | null
          destination_company_name: string | null
          destination_cost: number | null
          destination_license: string | null
          destination_type: string
          driver_name: string | null
          expiration_date: string | null
          id: string
          mtr_number: string | null
          origin: string
          packaging: string | null
          pdf_url: string | null
          photo_url: string | null
          physical_state: string | null
          received_weight: number | null
          receiver_id: string | null
          rejection_reason: string | null
          status: string
          tracking_token: string | null
          transport_date: string | null
          transporter_name: string
          unit: string
          updated_at: string
          user_id: string
          vehicle_plate: string | null
          waste_class: string
          weight_kg: number
        }
        Insert: {
          cdf_id?: string | null
          created_at?: string
          destination_cnpj?: string | null
          destination_company_name?: string | null
          destination_cost?: number | null
          destination_license?: string | null
          destination_type: string
          driver_name?: string | null
          expiration_date?: string | null
          id?: string
          mtr_number?: string | null
          origin?: string
          packaging?: string | null
          pdf_url?: string | null
          photo_url?: string | null
          physical_state?: string | null
          received_weight?: number | null
          receiver_id?: string | null
          rejection_reason?: string | null
          status?: string
          tracking_token?: string | null
          transport_date?: string | null
          transporter_name: string
          unit?: string
          updated_at?: string
          user_id: string
          vehicle_plate?: string | null
          waste_class: string
          weight_kg: number
        }
        Update: {
          cdf_id?: string | null
          created_at?: string
          destination_cnpj?: string | null
          destination_company_name?: string | null
          destination_cost?: number | null
          destination_license?: string | null
          destination_type?: string
          driver_name?: string | null
          expiration_date?: string | null
          id?: string
          mtr_number?: string | null
          origin?: string
          packaging?: string | null
          pdf_url?: string | null
          photo_url?: string | null
          physical_state?: string | null
          received_weight?: number | null
          receiver_id?: string | null
          rejection_reason?: string | null
          status?: string
          tracking_token?: string | null
          transport_date?: string | null
          transporter_name?: string
          unit?: string
          updated_at?: string
          user_id?: string
          vehicle_plate?: string | null
          waste_class?: string
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "waste_manifests_cdf_id_fkey"
            columns: ["cdf_id"]
            isOneToOne: false
            referencedRelation: "cdfs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_user_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
      get_seller_contacts: {
        Args: { seller_ids: string[] }
        Returns: {
          phone: string
          razao_social: string
          user_id: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "generator" | "receiver" | "consultant" | "client_viewer"
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
      app_role: ["generator", "receiver", "consultant", "client_viewer"],
    },
  },
} as const
