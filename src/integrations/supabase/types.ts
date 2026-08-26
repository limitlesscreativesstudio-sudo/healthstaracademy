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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      agent_actions: {
        Row: {
          action_type: string
          agent: string
          applied_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          payload: Json
          requires_approval: boolean
          run_id: string | null
          status: string
        }
        Insert: {
          action_type: string
          agent: string
          applied_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          payload?: Json
          requires_approval?: boolean
          run_id?: string | null
          status?: string
        }
        Update: {
          action_type?: string
          agent?: string
          applied_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          payload?: Json
          requires_approval?: boolean
          run_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_actions_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "agent_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_config: {
        Row: {
          agent: string
          auto_publish: boolean
          updated_at: string
        }
        Insert: {
          agent: string
          auto_publish?: boolean
          updated_at?: string
        }
        Update: {
          agent?: string
          auto_publish?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      agent_conversations: {
        Row: {
          agent: string
          created_at: string
          id: string
          session_token: string | null
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agent: string
          created_at?: string
          id?: string
          session_token?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agent?: string
          created_at?: string
          id?: string
          session_token?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      agent_findings: {
        Row: {
          agent: string
          created_at: string
          detail: string | null
          id: string
          resolved_at: string | null
          resolved_by: string | null
          run_id: string | null
          severity: string
          status: string
          suggested_fix: string | null
          target_id: string | null
          target_table: string | null
          title: string
        }
        Insert: {
          agent: string
          created_at?: string
          detail?: string | null
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          run_id?: string | null
          severity?: string
          status?: string
          suggested_fix?: string | null
          target_id?: string | null
          target_table?: string | null
          title: string
        }
        Update: {
          agent?: string
          created_at?: string
          detail?: string | null
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          run_id?: string | null
          severity?: string
          status?: string
          suggested_fix?: string | null
          target_id?: string | null
          target_table?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_findings_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "agent_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_job_state: {
        Row: {
          job_name: string
          last_error: string | null
          last_run_at: string | null
          lease_until: string | null
          status: string
          updated_at: string
        }
        Insert: {
          job_name: string
          last_error?: string | null
          last_run_at?: string | null
          lease_until?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          job_name?: string
          last_error?: string | null
          last_run_at?: string | null
          lease_until?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      agent_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          parts: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          parts?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          parts?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "agent_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_runs: {
        Row: {
          agent: string
          cost_credits: number | null
          finished_at: string | null
          id: string
          metadata: Json | null
          started_at: string
          status: string
          summary: string | null
        }
        Insert: {
          agent: string
          cost_credits?: number | null
          finished_at?: string | null
          id?: string
          metadata?: Json | null
          started_at?: string
          status?: string
          summary?: string | null
        }
        Update: {
          agent?: string
          cost_credits?: number | null
          finished_at?: string | null
          id?: string
          metadata?: Json | null
          started_at?: string
          status?: string
          summary?: string | null
        }
        Relationships: []
      }
      assignments: {
        Row: {
          allowed_attempts: number
          anonymous_grading: boolean
          available_from: string | null
          available_until: string | null
          course_id: string
          created_at: string
          display_grade_as: string
          due_at: string | null
          group_name: string
          id: string
          instructions: string | null
          is_group_assignment: boolean
          module_item_id: string | null
          omit_from_final_grade: boolean
          online_entry_options: string[]
          peer_reviews: boolean
          points: number
          published: boolean
          rubric_id: string | null
          submission_type: string
          title: string
          updated_at: string
        }
        Insert: {
          allowed_attempts?: number
          anonymous_grading?: boolean
          available_from?: string | null
          available_until?: string | null
          course_id: string
          created_at?: string
          display_grade_as?: string
          due_at?: string | null
          group_name?: string
          id?: string
          instructions?: string | null
          is_group_assignment?: boolean
          module_item_id?: string | null
          omit_from_final_grade?: boolean
          online_entry_options?: string[]
          peer_reviews?: boolean
          points?: number
          published?: boolean
          rubric_id?: string | null
          submission_type?: string
          title: string
          updated_at?: string
        }
        Update: {
          allowed_attempts?: number
          anonymous_grading?: boolean
          available_from?: string | null
          available_until?: string | null
          course_id?: string
          created_at?: string
          display_grade_as?: string
          due_at?: string | null
          group_name?: string
          id?: string
          instructions?: string | null
          is_group_assignment?: boolean
          module_item_id?: string | null
          omit_from_final_grade?: boolean
          online_entry_options?: string[]
          peer_reviews?: boolean
          points?: number
          published?: boolean
          rubric_id?: string | null
          submission_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_rubric_id_fkey"
            columns: ["rubric_id"]
            isOneToOne: false
            referencedRelation: "rubrics"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          course_id: string
          created_at: string
          id: string
          session_date: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          session_date: string
          status: string
          student_id: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          session_date?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string | null
          changed_at: string
          changed_by: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
        }
        Insert: {
          action?: string | null
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
        }
        Update: {
          action?: string | null
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
        }
        Relationships: []
      }
      auth_audit_log: {
        Row: {
          created_at: string
          email: string | null
          event_type: string
          id: string
          metadata: Json | null
          path: string | null
          required_role: string | null
          user_agent: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          path?: string | null
          required_role?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          path?: string | null
          required_role?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      blog_drafts: {
        Row: {
          agent: string
          body_markdown: string
          category: string | null
          created_at: string
          hero_image_alt: string | null
          hero_image_url: string | null
          id: string
          meta_description: string | null
          published_at: string | null
          read_time: string | null
          scheduled_for: string | null
          slug: string
          status: string
          target_city: string | null
          target_keyword: string | null
          title: string
          tldr: string | null
          updated_at: string
        }
        Insert: {
          agent?: string
          body_markdown: string
          category?: string | null
          created_at?: string
          hero_image_alt?: string | null
          hero_image_url?: string | null
          id?: string
          meta_description?: string | null
          published_at?: string | null
          read_time?: string | null
          scheduled_for?: string | null
          slug: string
          status?: string
          target_city?: string | null
          target_keyword?: string | null
          title: string
          tldr?: string | null
          updated_at?: string
        }
        Update: {
          agent?: string
          body_markdown?: string
          category?: string | null
          created_at?: string
          hero_image_alt?: string | null
          hero_image_url?: string | null
          id?: string
          meta_description?: string | null
          published_at?: string | null
          read_time?: string | null
          scheduled_for?: string | null
          slug?: string
          status?: string
          target_city?: string | null
          target_keyword?: string | null
          title?: string
          tldr?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      career_jobs: {
        Row: {
          active: boolean
          created_at: string
          id: string
          is_partner: boolean
          last_refreshed_at: string
          location: string
          org: string
          posted: string | null
          source: string
          tags: Json
          title: string
          type: string
          url: string
          wage: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          is_partner?: boolean
          last_refreshed_at?: string
          location: string
          org: string
          posted?: string | null
          source?: string
          tags?: Json
          title: string
          type: string
          url: string
          wage?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          is_partner?: boolean
          last_refreshed_at?: string
          location?: string
          org?: string
          posted?: string | null
          source?: string
          tags?: Json
          title?: string
          type?: string
          url?: string
          wage?: string | null
        }
        Relationships: []
      }
      clinical_attendance: {
        Row: {
          clinical_site: string
          clock_in_at: string | null
          clock_in_lat: number | null
          clock_in_lng: number | null
          clock_out_at: string | null
          clock_out_lat: number | null
          clock_out_lng: number | null
          course_id: string
          created_at: string
          hours: number
          hours_worked: number | null
          id: string
          notes: string | null
          session_type: string
          shift_date: string
          student_user_id: string
          updated_at: string
          verified: boolean
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          clinical_site: string
          clock_in_at?: string | null
          clock_in_lat?: number | null
          clock_in_lng?: number | null
          clock_out_at?: string | null
          clock_out_lat?: number | null
          clock_out_lng?: number | null
          course_id: string
          created_at?: string
          hours?: number
          hours_worked?: number | null
          id?: string
          notes?: string | null
          session_type?: string
          shift_date?: string
          student_user_id: string
          updated_at?: string
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          clinical_site?: string
          clock_in_at?: string | null
          clock_in_lat?: number | null
          clock_in_lng?: number | null
          clock_out_at?: string | null
          clock_out_lat?: number | null
          clock_out_lng?: number | null
          course_id?: string
          created_at?: string
          hours?: number
          hours_worked?: number | null
          id?: string
          notes?: string | null
          session_type?: string
          shift_date?: string
          student_user_id?: string
          updated_at?: string
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      clinical_hours: {
        Row: {
          activity_summary: string | null
          clinical_site: string
          course_id: string
          created_at: string
          hours: number
          id: string
          shift_date: string
          student_user_id: string
          supervisor_name: string | null
          updated_at: string
          verified: boolean
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          activity_summary?: string | null
          clinical_site: string
          course_id: string
          created_at?: string
          hours: number
          id?: string
          shift_date: string
          student_user_id: string
          supervisor_name?: string | null
          updated_at?: string
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          activity_summary?: string | null
          clinical_site?: string
          course_id?: string
          created_at?: string
          hours?: number
          id?: string
          shift_date?: string
          student_user_id?: string
          supervisor_name?: string | null
          updated_at?: string
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      cna_skills: {
        Row: {
          active: boolean
          category: string
          cdph_module: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          position: number
          required_for_certification: boolean
          updated_at: string
        }
        Insert: {
          active?: boolean
          category: string
          cdph_module?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          position?: number
          required_for_certification?: boolean
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          cdph_module?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          position?: number
          required_for_certification?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      cohort_deadline_reminders: {
        Row: {
          cohort_id: string
          email: string
          id: string
          milestone_days: number
          sent_at: string
        }
        Insert: {
          cohort_id: string
          email: string
          id?: string
          milestone_days: number
          sent_at?: string
        }
        Update: {
          cohort_id?: string
          email?: string
          id?: string
          milestone_days?: number
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohort_deadline_reminders_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      cohorts: {
        Row: {
          capacity: number
          clinical_site: string | null
          created_at: string
          enrollment_deadline: string | null
          id: string
          is_template: boolean
          min_to_run: number | null
          name: string
          notes: string | null
          paid_in_full_link: string | null
          payment_plan_link: string | null
          program_id: string | null
          program_type: string | null
          start_date: string
          status: string
          template_source_id: string | null
          updated_at: string
        }
        Insert: {
          capacity?: number
          clinical_site?: string | null
          created_at?: string
          enrollment_deadline?: string | null
          id?: string
          is_template?: boolean
          min_to_run?: number | null
          name?: string
          notes?: string | null
          paid_in_full_link?: string | null
          payment_plan_link?: string | null
          program_id?: string | null
          program_type?: string | null
          start_date: string
          status?: string
          template_source_id?: string | null
          updated_at?: string
        }
        Update: {
          capacity?: number
          clinical_site?: string | null
          created_at?: string
          enrollment_deadline?: string | null
          id?: string
          is_template?: boolean
          min_to_run?: number | null
          name?: string
          notes?: string | null
          paid_in_full_link?: string | null
          payment_plan_link?: string | null
          program_id?: string | null
          program_type?: string | null
          start_date?: string
          status?: string
          template_source_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohorts_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cohorts_template_source_id_fkey"
            columns: ["template_source_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_facts: {
        Row: {
          attribute: string
          confidence: string
          created_at: string
          id: string
          last_verified_at: string
          school_id: string
          source_url: string | null
          updated_at: string
          value_numeric: number | null
          value_text: string | null
        }
        Insert: {
          attribute: string
          confidence?: string
          created_at?: string
          id?: string
          last_verified_at?: string
          school_id: string
          source_url?: string | null
          updated_at?: string
          value_numeric?: number | null
          value_text?: string | null
        }
        Update: {
          attribute?: string
          confidence?: string
          created_at?: string
          id?: string
          last_verified_at?: string
          school_id?: string
          source_url?: string | null
          updated_at?: string
          value_numeric?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_facts_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "competitor_schools"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_pages: {
        Row: {
          body_markdown: string
          competitor_id: string
          created_at: string
          faq: Json | null
          hero_image_alt: string | null
          hero_image_url: string | null
          id: string
          meta_description: string | null
          published_at: string | null
          slug: string
          status: string
          title: string
          tldr: string | null
          updated_at: string
        }
        Insert: {
          body_markdown: string
          competitor_id: string
          created_at?: string
          faq?: Json | null
          hero_image_alt?: string | null
          hero_image_url?: string | null
          id?: string
          meta_description?: string | null
          published_at?: string | null
          slug: string
          status?: string
          title: string
          tldr?: string | null
          updated_at?: string
        }
        Update: {
          body_markdown?: string
          competitor_id?: string
          created_at?: string
          faq?: Json | null
          hero_image_alt?: string | null
          hero_image_url?: string | null
          id?: string
          meta_description?: string | null
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          tldr?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitor_pages_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitor_schools"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_schools: {
        Row: {
          active: boolean
          city: string | null
          created_at: string
          description: string | null
          id: string
          is_hsa: boolean
          logo_url: string | null
          name: string
          slug: string
          state: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          active?: boolean
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_hsa?: boolean
          logo_url?: string | null
          name: string
          slug: string
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          active?: boolean
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_hsa?: boolean
          logo_url?: string | null
          name?: string
          slug?: string
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      course_invites: {
        Row: {
          accepted_at: string | null
          course_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          course_id: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          course_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_invites_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_nav_audit: {
        Row: {
          changed_by: string | null
          changed_by_email: string | null
          course_id: string
          created_at: string
          id: string
          new_order: Json | null
          new_visibility: Json | null
          old_order: Json | null
          old_visibility: Json | null
        }
        Insert: {
          changed_by?: string | null
          changed_by_email?: string | null
          course_id: string
          created_at?: string
          id?: string
          new_order?: Json | null
          new_visibility?: Json | null
          old_order?: Json | null
          old_visibility?: Json | null
        }
        Update: {
          changed_by?: string | null
          changed_by_email?: string | null
          course_id?: string
          created_at?: string
          id?: string
          new_order?: Json | null
          new_visibility?: Json | null
          old_order?: Json | null
          old_visibility?: Json | null
        }
        Relationships: []
      }
      course_sections: {
        Row: {
          course_id: string
          created_at: string
          end_at: string | null
          id: string
          name: string
          start_at: string | null
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          end_at?: string | null
          id?: string
          name: string
          start_at?: string | null
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          end_at?: string | null
          id?: string
          name?: string
          start_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_sections_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          code: string | null
          cohort_id: string | null
          color: string | null
          cover_image_url: string | null
          created_at: string
          default_view: string
          description: string | null
          end_at: string | null
          front_page_html: string
          home_page_type: string
          id: string
          image_url: string | null
          instructor_id: string
          license: string | null
          nav_order: Json
          nav_visibility: Json
          start_at: string | null
          status: string
          syllabus_html: string
          syllabus_name: string | null
          syllabus_show_summary: boolean
          syllabus_url: string | null
          term: string | null
          time_zone: string | null
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          code?: string | null
          cohort_id?: string | null
          color?: string | null
          cover_image_url?: string | null
          created_at?: string
          default_view?: string
          description?: string | null
          end_at?: string | null
          front_page_html?: string
          home_page_type?: string
          id?: string
          image_url?: string | null
          instructor_id: string
          license?: string | null
          nav_order?: Json
          nav_visibility?: Json
          start_at?: string | null
          status?: string
          syllabus_html?: string
          syllabus_name?: string | null
          syllabus_show_summary?: boolean
          syllabus_url?: string | null
          term?: string | null
          time_zone?: string | null
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          code?: string | null
          cohort_id?: string | null
          color?: string | null
          cover_image_url?: string | null
          created_at?: string
          default_view?: string
          description?: string | null
          end_at?: string | null
          front_page_html?: string
          home_page_type?: string
          id?: string
          image_url?: string | null
          instructor_id?: string
          license?: string | null
          nav_order?: Json
          nav_visibility?: Json
          start_at?: string | null
          status?: string
          syllabus_html?: string
          syllabus_name?: string | null
          syllabus_show_summary?: boolean
          syllabus_url?: string | null
          term?: string | null
          time_zone?: string | null
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
      discussion_audit: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          course_id: string | null
          created_at: string
          discussion_id: string | null
          id: string
          reply_id: string | null
          snapshot: Json | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          course_id?: string | null
          created_at?: string
          discussion_id?: string | null
          id?: string
          reply_id?: string | null
          snapshot?: Json | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          course_id?: string | null
          created_at?: string
          discussion_id?: string | null
          id?: string
          reply_id?: string | null
          snapshot?: Json | null
        }
        Relationships: []
      }
      discussion_replies: {
        Row: {
          author_id: string
          body: string
          created_at: string
          discussion_id: string
          id: string
          parent_reply_id: string | null
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          discussion_id: string
          id?: string
          parent_reply_id?: string | null
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          discussion_id?: string
          id?: string
          parent_reply_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussion_replies_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_replies_parent_reply_id_fkey"
            columns: ["parent_reply_id"]
            isOneToOne: false
            referencedRelation: "discussion_replies"
            referencedColumns: ["id"]
          },
        ]
      }
      discussions: {
        Row: {
          author_id: string
          body: string | null
          course_id: string
          created_at: string
          id: string
          locked: boolean
          pinned: boolean
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body?: string | null
          course_id: string
          created_at?: string
          id?: string
          locked?: boolean
          pinned?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string | null
          course_id?: string
          created_at?: string
          id?: string
          locked?: boolean
          pinned?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
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
          section_id: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string
          id?: string
          role?: string
          section_id?: string | null
          user_id: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string
          id?: string
          role?: string
          section_id?: string | null
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
          {
            foreignKeyName: "enrollments_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "course_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      gbp_posts: {
        Row: {
          agent: string
          body: string
          channel: string
          created_at: string
          cta_label: string | null
          cta_url: string | null
          id: string
          image_url: string | null
          published_at: string | null
          scheduled_for: string | null
          status: string
          title: string | null
          updated_at: string
        }
        Insert: {
          agent?: string
          body: string
          channel?: string
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          id?: string
          image_url?: string | null
          published_at?: string | null
          scheduled_for?: string | null
          status?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          agent?: string
          body?: string
          channel?: string
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          id?: string
          image_url?: string | null
          published_at?: string | null
          scheduled_for?: string | null
          status?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      grades: {
        Row: {
          assignment_id: string | null
          course_id: string
          created_at: string
          feedback: string | null
          graded_at: string
          graded_by: string | null
          id: string
          max_score: number
          quiz_attempt_id: string | null
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          assignment_id?: string | null
          course_id: string
          created_at?: string
          feedback?: string | null
          graded_at?: string
          graded_by?: string | null
          id?: string
          max_score?: number
          quiz_attempt_id?: string | null
          score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          assignment_id?: string | null
          course_id?: string
          created_at?: string
          feedback?: string | null
          graded_at?: string
          graded_by?: string | null
          id?: string
          max_score?: number
          quiz_attempt_id?: string | null
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grades_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      instructor_invites: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      job_pipeline: {
        Row: {
          certification_date: string | null
          certification_expires: string | null
          certification_number: string | null
          cohort_id: string | null
          created_at: string
          employer_city: string | null
          employer_name: string | null
          follow_up_date: string | null
          hire_date: string | null
          hourly_wage: number | null
          id: string
          job_search_status: string | null
          job_title: string | null
          notes: string | null
          placement_source: string | null
          portal_user_id: string | null
          shift_type: string | null
          stage: string
          state_exam_date: string | null
          state_exam_location: string | null
          state_exam_result: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          certification_date?: string | null
          certification_expires?: string | null
          certification_number?: string | null
          cohort_id?: string | null
          created_at?: string
          employer_city?: string | null
          employer_name?: string | null
          follow_up_date?: string | null
          hire_date?: string | null
          hourly_wage?: number | null
          id?: string
          job_search_status?: string | null
          job_title?: string | null
          notes?: string | null
          placement_source?: string | null
          portal_user_id?: string | null
          shift_type?: string | null
          stage?: string
          state_exam_date?: string | null
          state_exam_location?: string | null
          state_exam_result?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          certification_date?: string | null
          certification_expires?: string | null
          certification_number?: string | null
          cohort_id?: string | null
          created_at?: string
          employer_city?: string | null
          employer_name?: string | null
          follow_up_date?: string | null
          hire_date?: string | null
          hourly_wage?: number | null
          id?: string
          job_search_status?: string | null
          job_title?: string | null
          notes?: string | null
          placement_source?: string | null
          portal_user_id?: string | null
          shift_type?: string | null
          stage?: string
          state_exam_date?: string | null
          state_exam_location?: string | null
          state_exam_result?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: []
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
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          folder: string | null
          folder_id: string | null
          id: string
          mime_type: string | null
          modified_by: string | null
          name: string
          size_bytes: number | null
          storage_path: string | null
          storage_provider: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          drive_file_id?: string | null
          external_url?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          folder?: string | null
          folder_id?: string | null
          id?: string
          mime_type?: string | null
          modified_by?: string | null
          name: string
          size_bytes?: number | null
          storage_path?: string | null
          storage_provider?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          drive_file_id?: string | null
          external_url?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          folder?: string | null
          folder_id?: string | null
          id?: string
          mime_type?: string | null
          modified_by?: string | null
          name?: string
          size_bytes?: number | null
          storage_path?: string | null
          storage_provider?: string
          updated_at?: string
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
          {
            foreignKeyName: "lms_files_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "lms_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_folders: {
        Row: {
          course_id: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          parent_id: string | null
          position: number
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          parent_id?: string | null
          position?: number
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_folders_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lms_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "lms_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_pages: {
        Row: {
          body_html: string
          course_id: string
          created_at: string
          front_page: boolean
          id: string
          position: number
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          body_html?: string
          course_id: string
          created_at?: string
          front_page?: boolean
          id?: string
          position?: number
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          body_html?: string
          course_id?: string
          created_at?: string
          front_page?: boolean
          id?: string
          position?: number
          published?: boolean
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
          description: string | null
          file_name: string | null
          file_type: string | null
          file_url: string | null
          id: string
          indent: number
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
          description?: string | null
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          indent?: number
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
          description?: string | null
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          indent?: number
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
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_reminder_log: {
        Row: {
          channel: string
          id: string
          milestone_days: number
          pending_steps: Json | null
          sent_at: string
          user_id: string
        }
        Insert: {
          channel?: string
          id?: string
          milestone_days: number
          pending_steps?: Json | null
          sent_at?: string
          user_id: string
        }
        Update: {
          channel?: string
          id?: string
          milestone_days?: number
          pending_steps?: Json | null
          sent_at?: string
          user_id?: string
        }
        Relationships: []
      }
      outcome_criteria: {
        Row: {
          created_at: string
          criterion_id: string
          id: string
          outcome_id: string
        }
        Insert: {
          created_at?: string
          criterion_id: string
          id?: string
          outcome_id: string
        }
        Update: {
          created_at?: string
          criterion_id?: string
          id?: string
          outcome_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "outcome_criteria_criterion_id_fkey"
            columns: ["criterion_id"]
            isOneToOne: false
            referencedRelation: "rubric_criteria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outcome_criteria_outcome_id_fkey"
            columns: ["outcome_id"]
            isOneToOne: false
            referencedRelation: "outcomes"
            referencedColumns: ["id"]
          },
        ]
      }
      outcomes: {
        Row: {
          category: string | null
          course_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          mastery_threshold: number
          points_possible: number
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          course_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          mastery_threshold?: number
          points_possible?: number
          position?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          course_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          mastery_threshold?: number
          points_possible?: number
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outcomes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_enrollments: {
        Row: {
          accepted_at: string | null
          course_id: string
          email: string
          id: string
          invited_at: string
          invited_by: string | null
          role: string
          section: string | null
          status: string
        }
        Insert: {
          accepted_at?: string | null
          course_id: string
          email: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          role?: string
          section?: string | null
          status?: string
        }
        Update: {
          accepted_at?: string | null
          course_id?: string
          email?: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          role?: string
          section?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_conversation_participants: {
        Row: {
          archived: boolean
          conversation_id: string
          last_read_at: string | null
          starred: boolean
          user_id: string
        }
        Insert: {
          archived?: boolean
          conversation_id: string
          last_read_at?: string | null
          starred?: boolean
          user_id: string
        }
        Update: {
          archived?: boolean
          conversation_id?: string
          last_read_at?: string | null
          starred?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "portal_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_conversations: {
        Row: {
          course_id: string | null
          created_at: string
          created_by: string
          id: string
          last_message_at: string
          subject: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          created_by: string
          id?: string
          last_message_at?: string
          subject?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          last_message_at?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_conversations_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "portal_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          job_title: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          job_title?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          job_title?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          active: boolean
          code: string | null
          created_at: string
          id: string
          name: string
          regulating_body: string | null
          required_clinical_hours: number
          required_theory_hours: number
        }
        Insert: {
          active?: boolean
          code?: string | null
          created_at?: string
          id?: string
          name: string
          regulating_body?: string | null
          required_clinical_hours?: number
          required_theory_hours?: number
        }
        Update: {
          active?: boolean
          code?: string | null
          created_at?: string
          id?: string
          name?: string
          regulating_body?: string | null
          required_clinical_hours?: number
          required_theory_hours?: number
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json
          created_at: string
          id: string
          max_score: number | null
          quiz_id: string
          score: number | null
          started_at: string
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          id?: string
          max_score?: number | null
          quiz_id: string
          score?: number | null
          started_at?: string
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          max_score?: number | null
          quiz_id?: string
          score?: number | null
          started_at?: string
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: Json | null
          created_at: string
          id: string
          options: Json
          points: number
          position: number
          prompt: string
          question_type: string
          quiz_id: string
        }
        Insert: {
          correct_answer?: Json | null
          created_at?: string
          id?: string
          options?: Json
          points?: number
          position?: number
          prompt: string
          question_type?: string
          quiz_id: string
        }
        Update: {
          correct_answer?: Json | null
          created_at?: string
          id?: string
          options?: Json
          points?: number
          position?: number
          prompt?: string
          question_type?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          attempts_allowed: number
          course_id: string
          created_at: string
          due_at: string | null
          id: string
          instructions: string | null
          module_item_id: string | null
          published: boolean
          time_limit_minutes: number | null
          title: string
          total_points: number
          updated_at: string
        }
        Insert: {
          attempts_allowed?: number
          course_id: string
          created_at?: string
          due_at?: string | null
          id?: string
          instructions?: string | null
          module_item_id?: string | null
          published?: boolean
          time_limit_minutes?: number | null
          title: string
          total_points?: number
          updated_at?: string
        }
        Update: {
          attempts_allowed?: number
          course_id?: string
          created_at?: string
          due_at?: string | null
          id?: string
          instructions?: string | null
          module_item_id?: string | null
          published?: boolean
          time_limit_minutes?: number | null
          title?: string
          total_points?: number
          updated_at?: string
        }
        Relationships: []
      }
      rubric_criteria: {
        Row: {
          created_at: string
          description: string | null
          id: string
          levels: Json
          points: number
          position: number
          rubric_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          levels?: Json
          points?: number
          position?: number
          rubric_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          levels?: Json
          points?: number
          position?: number
          rubric_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "rubric_criteria_rubric_id_fkey"
            columns: ["rubric_id"]
            isOneToOne: false
            referencedRelation: "rubrics"
            referencedColumns: ["id"]
          },
        ]
      }
      rubric_scores: {
        Row: {
          assignment_id: string
          comment: string | null
          criterion_id: string
          graded_at: string
          graded_by: string | null
          id: string
          score: number
          user_id: string
        }
        Insert: {
          assignment_id: string
          comment?: string | null
          criterion_id: string
          graded_at?: string
          graded_by?: string | null
          id?: string
          score?: number
          user_id: string
        }
        Update: {
          assignment_id?: string
          comment?: string | null
          criterion_id?: string
          graded_at?: string
          graded_by?: string | null
          id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rubric_scores_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rubric_scores_criterion_id_fkey"
            columns: ["criterion_id"]
            isOneToOne: false
            referencedRelation: "rubric_criteria"
            referencedColumns: ["id"]
          },
        ]
      }
      rubrics: {
        Row: {
          course_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rubrics_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_definitions: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
          program_id: string | null
          sort_order: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
          program_id?: string | null
          sort_order?: number
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          program_id?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "skill_definitions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_signoffs: {
        Row: {
          id: string
          notes: string | null
          signed_off_at: string
          signed_off_by: string | null
          skill_id: string
          student_id: string
        }
        Insert: {
          id?: string
          notes?: string | null
          signed_off_at?: string
          signed_off_by?: string | null
          skill_id: string
          student_id: string
        }
        Update: {
          id?: string
          notes?: string | null
          signed_off_at?: string
          signed_off_by?: string | null
          skill_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_signoffs_signed_off_by_fkey"
            columns: ["signed_off_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_signoffs_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skill_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_signoffs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_onboarding_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          dismissed: boolean
          started_at: string
          steps: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          dismissed?: boolean
          started_at?: string
          steps?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          dismissed?: boolean
          started_at?: string
          steps?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      student_skill_signoffs: {
        Row: {
          attempts: number
          clinical_site: string | null
          course_id: string
          created_at: string
          evaluator_name: string | null
          evaluator_signature: string | null
          id: string
          notes: string | null
          photo_url: string | null
          signed_off_at: string | null
          signed_off_by: string | null
          skill_id: string
          status: string
          student_user_id: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          attempts?: number
          clinical_site?: string | null
          course_id: string
          created_at?: string
          evaluator_name?: string | null
          evaluator_signature?: string | null
          id?: string
          notes?: string | null
          photo_url?: string | null
          signed_off_at?: string | null
          signed_off_by?: string | null
          skill_id: string
          status?: string
          student_user_id: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          attempts?: number
          clinical_site?: string | null
          course_id?: string
          created_at?: string
          evaluator_name?: string | null
          evaluator_signature?: string | null
          id?: string
          notes?: string | null
          photo_url?: string | null
          signed_off_at?: string | null
          signed_off_by?: string | null
          skill_id?: string
          status?: string
          student_user_id?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_skill_signoffs_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "cna_skills"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          can_pass_background: boolean | null
          can_pay_fee: boolean | null
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
          portal_user_id: string | null
          provisioned_at: string | null
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
          can_pay_fee?: boolean | null
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
          portal_user_id?: string | null
          provisioned_at?: string | null
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
          can_pay_fee?: boolean | null
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
          portal_user_id?: string | null
          provisioned_at?: string | null
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
      submissions: {
        Row: {
          assignment_id: string
          body: string | null
          file_name: string | null
          file_url: string | null
          id: string
          submitted_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assignment_id: string
          body?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          submitted_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assignment_id?: string
          body?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          submitted_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_account_settings: {
        Row: {
          contact_methods: Json
          feature_flags: Json
          notification_prefs: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_methods?: Json
          feature_flags?: Json
          notification_prefs?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_methods?: Json
          feature_flags?: Json
          notification_prefs?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      get_quiz_questions_for_student: {
        Args: { _quiz_id: string }
        Returns: {
          id: string
          options: Json
          points: number
          position: number
          prompt: string
          question_type: string
          quiz_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_conversation_participant: {
        Args: { _convo: string; _user: string }
        Returns: boolean
      }
      is_enrolled_in: { Args: { _course_id: string }; Returns: boolean }
      is_instructor_of: { Args: { _course_id: string }; Returns: boolean }
      user_id_by_email: { Args: { _email: string }; Returns: string }
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
