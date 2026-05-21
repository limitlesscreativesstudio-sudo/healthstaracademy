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
      cohorts: {
        Row: {
          capacity: number
          created_at: string
          id: string
          name: string
          paid_in_full_link: string | null
          payment_plan_link: string | null
          program_type: string | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          id?: string
          name?: string
          paid_in_full_link?: string | null
          payment_plan_link?: string | null
          program_type?: string | null
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          id?: string
          name?: string
          paid_in_full_link?: string | null
          payment_plan_link?: string | null
          program_type?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          code: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          instructor_id: string
          status: string
          term: string | null
          title: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          instructor_id: string
          status?: string
          term?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          instructor_id?: string
          status?: string
          term?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      enrollment_emails: {
        Row: {
          created_at: string
          email_type: string
          id: string
          metadata: Json | null
          sent_at: string
          status: string
          student_id: string
        }
        Insert: {
          created_at?: string
          email_type: string
          id?: string
          metadata?: Json | null
          sent_at?: string
          status?: string
          student_id: string
        }
        Update: {
          created_at?: string
          email_type?: string
          id?: string
          metadata?: Json | null
          sent_at?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_emails_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "admin_students_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_emails_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          course_id: string
          enrolled_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_announcements: {
        Row: {
          body: string
          course_id: string
          id: string
          posted_at: string
          posted_by: string | null
          title: string
        }
        Insert: {
          body: string
          course_id: string
          id?: string
          posted_at?: string
          posted_by?: string | null
          title: string
        }
        Update: {
          body?: string
          course_id?: string
          id?: string
          posted_at?: string
          posted_by?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_announcements_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_files: {
        Row: {
          course_id: string
          created_at: string
          drive_file_id: string | null
          external_url: string | null
          id: string
          mime_type: string | null
          name: string
          size_bytes: number | null
          storage_path: string | null
          storage_provider: string
          uploaded_by: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          drive_file_id?: string | null
          external_url?: string | null
          id?: string
          mime_type?: string | null
          name: string
          size_bytes?: number | null
          storage_path?: string | null
          storage_provider?: string
          uploaded_by?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          drive_file_id?: string | null
          external_url?: string | null
          id?: string
          mime_type?: string | null
          name?: string
          size_bytes?: number | null
          storage_path?: string | null
          storage_provider?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lms_files_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_pages: {
        Row: {
          body_html: string
          course_id: string
          created_at: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          body_html?: string
          course_id: string
          created_at?: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          body_html?: string
          course_id?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_pages_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      module_items: {
        Row: {
          content_ref: string | null
          created_at: string
          id: string
          item_type: string
          module_id: string
          position: number
          published: boolean
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          content_ref?: string | null
          created_at?: string
          id?: string
          item_type: string
          module_id: string
          position?: number
          published?: boolean
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          content_ref?: string | null
          created_at?: string
          id?: string
          item_type?: string
          module_id?: string
          position?: number
          published?: boolean
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "module_items_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          id: string
          position: number
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          position?: number
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          position?: number
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          can_pass_background: boolean | null
          cohort_id: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          enrollment_status: string
          first_name: string
          google_sheet_row: number | null
          has_diploma: boolean | null
          has_health_proof: boolean | null
          has_ssn: boolean | null
          has_transportation: boolean | null
          has_valid_id: boolean | null
          id: string
          is_over_18: boolean | null
          last_name: string
          needs_entrance_exam: boolean | null
          needs_parent_consent: boolean | null
          orientation_date: string | null
          payment_method: string | null
          payment_status: string
          phone: string | null
          qualification_notes: string | null
          qualification_status: string
          scrub_bottom_size: string | null
          scrub_top_size: string | null
          selected_cohort_date: string | null
          shipping_address: string | null
          updated_at: string
        }
        Insert: {
          can_pass_background?: boolean | null
          cohort_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          enrollment_status?: string
          first_name: string
          google_sheet_row?: number | null
          has_diploma?: boolean | null
          has_health_proof?: boolean | null
          has_ssn?: boolean | null
          has_transportation?: boolean | null
          has_valid_id?: boolean | null
          id?: string
          is_over_18?: boolean | null
          last_name: string
          needs_entrance_exam?: boolean | null
          needs_parent_consent?: boolean | null
          orientation_date?: string | null
          payment_method?: string | null
          payment_status?: string
          phone?: string | null
          qualification_notes?: string | null
          qualification_status?: string
          scrub_bottom_size?: string | null
          scrub_top_size?: string | null
          selected_cohort_date?: string | null
          shipping_address?: string | null
          updated_at?: string
        }
        Update: {
          can_pass_background?: boolean | null
          cohort_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          enrollment_status?: string
          first_name?: string
          google_sheet_row?: number | null
          has_diploma?: boolean | null
          has_health_proof?: boolean | null
          has_ssn?: boolean | null
          has_transportation?: boolean | null
          has_valid_id?: boolean | null
          id?: string
          is_over_18?: boolean | null
          last_name?: string
          needs_entrance_exam?: boolean | null
          needs_parent_consent?: boolean | null
          orientation_date?: string | null
          payment_method?: string | null
          payment_status?: string
          phone?: string | null
          qualification_notes?: string | null
          qualification_status?: string
          scrub_bottom_size?: string | null
          scrub_top_size?: string | null
          selected_cohort_date?: string | null
          shipping_address?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          processed: boolean | null
          source: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          payload: Json
          processed?: boolean | null
          source?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean | null
          source?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_students_view: {
        Row: {
          can_pass_background: boolean | null
          cohort_id: string | null
          cohort_name: string | null
          cohort_start_date: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          emails_sent_count: number | null
          enrollment_status: string | null
          first_name: string | null
          google_sheet_row: number | null
          has_diploma: boolean | null
          has_health_proof: boolean | null
          has_ssn: boolean | null
          has_transportation: boolean | null
          has_valid_id: boolean | null
          id: string | null
          is_over_18: boolean | null
          last_email_sent: string | null
          last_name: string | null
          needs_entrance_exam: boolean | null
          needs_parent_consent: boolean | null
          orientation_date: string | null
          payment_method: string | null
          payment_status: string | null
          phone: string | null
          qualification_notes: string | null
          qualification_status: string | null
          scrub_bottom_size: string | null
          scrub_top_size: string | null
          selected_cohort_date: string | null
          shipping_address: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_enrolled_in: { Args: { _course_id: string }; Returns: boolean }
      is_instructor_of: { Args: { _course_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user" | "student" | "instructor"
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
      app_role: ["admin", "user", "student", "instructor"],
    },
  },
} as const
