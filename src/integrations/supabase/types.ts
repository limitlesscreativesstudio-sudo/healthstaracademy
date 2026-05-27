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
      assignments: {
        Row: {
          course_id: string
          created_at: string
          due_at: string | null
          id: string
          instructions: string | null
          module_item_id: string | null
          points: number
          published: boolean
          submission_type: string
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          due_at?: string | null
          id?: string
          instructions?: string | null
          module_item_id?: string | null
          points?: number
          published?: boolean
          submission_type?: string
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          due_at?: string | null
          id?: string
          instructions?: string | null
          module_item_id?: string | null
          points?: number
          published?: boolean
          submission_type?: string
          title?: string
          updated_at?: string
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
          hours_worked: number | null
          id: string
          notes: string | null
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
          hours_worked?: number | null
          id?: string
          notes?: string | null
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
          hours_worked?: number | null
          id?: string
          notes?: string | null
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
      cohorts: {
        Row: {
          capacity: number
          clinical_site: string | null
          created_at: string
          enrollment_deadline: string | null
          id: string
          min_to_run: number | null
          name: string
          notes: string | null
          paid_in_full_link: string | null
          payment_plan_link: string | null
          program_type: string | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          capacity?: number
          clinical_site?: string | null
          created_at?: string
          enrollment_deadline?: string | null
          id?: string
          min_to_run?: number | null
          name?: string
          notes?: string | null
          paid_in_full_link?: string | null
          payment_plan_link?: string | null
          program_type?: string | null
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          clinical_site?: string | null
          created_at?: string
          enrollment_deadline?: string | null
          id?: string
          min_to_run?: number | null
          name?: string
          notes?: string | null
          paid_in_full_link?: string | null
          payment_plan_link?: string | null
          program_type?: string | null
          start_date?: string
          status?: string
          updated_at?: string
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
          cover_image_url: string | null
          created_at: string
          default_view: string
          description: string | null
          end_at: string | null
          front_page_html: string
          home_page_type: string
          id: string
          instructor_id: string
          license: string | null
          nav_order: Json
          nav_visibility: Json
          start_at: string | null
          status: string
          syllabus_html: string
          syllabus_show_summary: boolean
          term: string | null
          time_zone: string | null
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          code?: string | null
          cohort_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          default_view?: string
          description?: string | null
          end_at?: string | null
          front_page_html?: string
          home_page_type?: string
          id?: string
          instructor_id: string
          license?: string | null
          nav_order?: Json
          nav_visibility?: Json
          start_at?: string | null
          status?: string
          syllabus_html?: string
          syllabus_show_summary?: boolean
          term?: string | null
          time_zone?: string | null
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          code?: string | null
          cohort_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          default_view?: string
          description?: string | null
          end_at?: string | null
          front_page_html?: string
          home_page_type?: string
          id?: string
          instructor_id?: string
          license?: string | null
          nav_order?: Json
          nav_visibility?: Json
          start_at?: string | null
          status?: string
          syllabus_html?: string
          syllabus_show_summary?: boolean
          term?: string | null
          time_zone?: string | null
          title?: string
          updated_at?: string
          visibility?: string
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
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          parent_id?: string | null
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
