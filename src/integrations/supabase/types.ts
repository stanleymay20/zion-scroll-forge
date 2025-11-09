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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          created_at: string | null
          description: string
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
          scrollcoin_reward: number | null
          xp_reward: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          icon: string
          id?: string
          name: string
          requirement_type: string
          requirement_value: number
          scrollcoin_reward?: number | null
          xp_reward?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
          scrollcoin_reward?: number | null
          xp_reward?: number | null
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          context_summary: string | null
          created_at: string | null
          faculty: string
          id: string
          learning_insights: Json | null
          messages: Json | null
          subject: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          context_summary?: string | null
          created_at?: string | null
          faculty: string
          id?: string
          learning_insights?: Json | null
          messages?: Json | null
          subject?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          context_summary?: string | null
          created_at?: string | null
          faculty?: string
          id?: string
          learning_insights?: Json | null
          messages?: Json | null
          subject?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_student_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      course_certificates: {
        Row: {
          certificate_url: string | null
          completion_date: string | null
          course_id: string
          created_at: string | null
          id: string
          scroll_badge_earned: boolean | null
          user_id: string
        }
        Insert: {
          certificate_url?: string | null
          completion_date?: string | null
          course_id: string
          created_at?: string | null
          id?: string
          scroll_badge_earned?: boolean | null
          user_id: string
        }
        Update: {
          certificate_url?: string | null
          completion_date?: string | null
          course_id?: string
          created_at?: string | null
          id?: string
          scroll_badge_earned?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      course_modules: {
        Row: {
          content: Json | null
          content_md: string | null
          course_id: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          material_url: string | null
          order_index: number | null
          quiz_data: Json | null
          title: string
        }
        Insert: {
          content?: Json | null
          content_md?: string | null
          course_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          material_url?: string | null
          order_index?: number | null
          quiz_data?: Json | null
          title: string
        }
        Update: {
          content?: Json | null
          content_md?: string | null
          course_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          material_url?: string | null
          order_index?: number | null
          quiz_data?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_reviews: {
        Row: {
          course_id: string
          created_at: string | null
          helpful_count: number | null
          id: string
          rating: number
          review_text: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          rating: number
          review_text?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string | null
          description: string | null
          duration: string | null
          faculty: string | null
          faculty_id: string | null
          id: string
          level: string | null
          price: number | null
          rating: number | null
          students: number | null
          tags: string[] | null
          title: string
          xr_enabled: boolean | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration?: string | null
          faculty?: string | null
          faculty_id?: string | null
          id?: string
          level?: string | null
          price?: number | null
          rating?: number | null
          students?: number | null
          tags?: string[] | null
          title: string
          xr_enabled?: boolean | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: string | null
          faculty?: string | null
          faculty_id?: string | null
          id?: string
          level?: string | null
          price?: number | null
          rating?: number | null
          students?: number | null
          tags?: string[] | null
          title?: string
          xr_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculties"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          course_id: string | null
          created_at: string | null
          id: string
          progress: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          progress?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          progress?: number | null
          updated_at?: string | null
          user_id?: string | null
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
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_student_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      faculties: {
        Row: {
          created_at: string | null
          dean_id: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          dean_id?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          dean_id?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      intervention_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          id: string
          message: string
          recommendations: Json | null
          resolved_at: string | null
          severity: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          id?: string
          message: string
          recommendations?: Json | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          id?: string
          message?: string
          recommendations?: Json | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intervention_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intervention_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_student_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "intervention_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      learning_patterns: {
        Row: {
          areas_for_growth: Json | null
          comprehension_level: string | null
          created_at: string | null
          engagement_score: number | null
          faculty: string
          id: string
          last_assessed: string | null
          learning_style: Json | null
          preferred_pace: string | null
          strengths: Json | null
          user_id: string | null
        }
        Insert: {
          areas_for_growth?: Json | null
          comprehension_level?: string | null
          created_at?: string | null
          engagement_score?: number | null
          faculty: string
          id?: string
          last_assessed?: string | null
          learning_style?: Json | null
          preferred_pace?: string | null
          strengths?: Json | null
          user_id?: string | null
        }
        Update: {
          areas_for_growth?: Json | null
          comprehension_level?: string | null
          created_at?: string | null
          engagement_score?: number | null
          faculty?: string
          id?: string
          last_assessed?: string | null
          learning_style?: Json | null
          preferred_pace?: string | null
          strengths?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_patterns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_patterns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_student_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "learning_patterns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      learning_progress: {
        Row: {
          completed: boolean | null
          id: string
          module_id: string | null
          quiz_score: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          id?: string
          module_id?: string | null
          quiz_score?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          id?: string
          module_id?: string | null
          quiz_score?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      module_notes: {
        Row: {
          application_notes: string | null
          created_at: string | null
          id: string
          module_id: string
          notes: string | null
          scripture_connections: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          application_notes?: string | null
          created_at?: string | null
          id?: string
          module_id: string
          notes?: string | null
          scripture_connections?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          application_notes?: string | null
          created_at?: string | null
          id?: string
          module_id?: string
          notes?: string | null
          scripture_connections?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_notes_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      prayer_journal: {
        Row: {
          created_at: string | null
          id: string
          request: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          request: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          request?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prayer_journal_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prayer_journal_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_student_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "prayer_journal_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          academic_profile: Json | null
          created_at: string | null
          email: string | null
          id: string
          role: string | null
          scrollcoin_balance: number | null
          spiritual_profile: Json | null
          updated_at: string | null
        }
        Insert: {
          academic_profile?: Json | null
          created_at?: string | null
          email?: string | null
          id: string
          role?: string | null
          scrollcoin_balance?: number | null
          spiritual_profile?: Json | null
          updated_at?: string | null
        }
        Update: {
          academic_profile?: Json | null
          created_at?: string | null
          email?: string | null
          id?: string
          role?: string | null
          scrollcoin_balance?: number | null
          spiritual_profile?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      prophetic_checkins: {
        Row: {
          acknowledged_lordship: boolean | null
          created_at: string | null
          id: string
          note: string | null
          user_id: string | null
        }
        Insert: {
          acknowledged_lordship?: boolean | null
          created_at?: string | null
          id?: string
          note?: string | null
          user_id?: string | null
        }
        Update: {
          acknowledged_lordship?: boolean | null
          created_at?: string | null
          id?: string
          note?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prophetic_checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prophetic_checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_student_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "prophetic_checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      scroll_analytics: {
        Row: {
          created_at: string | null
          event_payload: Json | null
          event_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_payload?: Json | null
          event_type: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_payload?: Json | null
          event_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      scroll_integrity_logs: {
        Row: {
          created_at: string | null
          hash: string
          id: string
          module: string
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          hash: string
          id?: string
          module: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          hash?: string
          id?: string
          module?: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: []
      }
      scrollcoin_bridge_log: {
        Row: {
          amount: number | null
          created_at: string | null
          direction: string | null
          id: string
          status: string | null
          tx_hash: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          direction?: string | null
          id?: string
          status?: string | null
          tx_hash?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          direction?: string | null
          id?: string
          status?: string | null
          tx_hash?: string | null
          user_id?: string
        }
        Relationships: []
      }
      spiritual_assessments: {
        Row: {
          assessment_type: string
          calling_insights: Json | null
          confidence_score: number | null
          created_at: string | null
          growth_areas: Json | null
          id: string
          scripture_references: Json | null
          spiritual_gifts: Json | null
          user_id: string | null
        }
        Insert: {
          assessment_type: string
          calling_insights?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          growth_areas?: Json | null
          id?: string
          scripture_references?: Json | null
          spiritual_gifts?: Json | null
          user_id?: string | null
        }
        Update: {
          assessment_type?: string
          calling_insights?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          growth_areas?: Json | null
          id?: string
          scripture_references?: Json | null
          spiritual_gifts?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spiritual_assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spiritual_assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_student_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "spiritual_assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      study_group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      study_group_messages: {
        Row: {
          created_at: string | null
          group_id: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_group_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      study_groups: {
        Row: {
          course_id: string | null
          created_at: string | null
          creator_id: string
          description: string | null
          id: string
          is_public: boolean | null
          max_members: number | null
          name: string
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          creator_id: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          max_members?: number | null
          name: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          creator_id?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          max_members?: number | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_groups_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_groups_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_student_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_stats: {
        Row: {
          courses_completed: number | null
          current_streak: number | null
          last_activity_date: string | null
          longest_streak: number | null
          total_scrollcoins: number | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          courses_completed?: number | null
          current_streak?: number | null
          last_activity_date?: string | null
          longest_streak?: number | null
          total_scrollcoins?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          courses_completed?: number | null
          current_streak?: number | null
          last_activity_date?: string | null
          longest_streak?: number | null
          total_scrollcoins?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number | null
          eth_address: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          balance?: number | null
          eth_address?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          balance?: number | null
          eth_address?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_student_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_user_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      leaderboard: {
        Row: {
          badges_earned: number | null
          courses_completed: number | null
          current_streak: number | null
          email: string | null
          longest_streak: number | null
          total_scrollcoins: number | null
          total_xp: number | null
          user_id: string | null
        }
        Relationships: []
      }
      v_admin_overview: {
        Row: {
          total_enrollments: number | null
          total_events: number | null
          total_prayers: number | null
          total_scrollcoin_earned: number | null
          total_scrollcoin_spent: number | null
          total_transactions: number | null
          total_users: number | null
          verified_modules: number | null
        }
        Relationships: []
      }
      v_faculty_analytics: {
        Row: {
          avg_completion: number | null
          avg_engagement: number | null
          faculty: string | null
          total_courses: number | null
          total_students: number | null
        }
        Relationships: []
      }
      v_scroll_analytics_daily: {
        Row: {
          day: string | null
          event_type: string | null
          total: number | null
        }
        Relationships: []
      }
      v_student_analytics: {
        Row: {
          active_alerts: number | null
          ai_interactions: number | null
          avg_progress: number | null
          email: string | null
          engagement_score: number | null
          enrolled_courses: number | null
          prayer_count: number | null
          spiritual_assessments: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      v_user_dashboard: {
        Row: {
          avg_progress: number | null
          balance: number | null
          courses_enrolled: number | null
          email: string | null
          prayers_answered: number | null
          total_prayers: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Functions: {
      earn_scrollcoin: {
        Args: { p_amount: number; p_desc: string; p_user_id: string }
        Returns: undefined
      }
      spend_scrollcoin: {
        Args: { p_amount: number; p_desc: string; p_user_id: string }
        Returns: undefined
      }
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
