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
      academic_terms: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          is_active: boolean | null
          name: string
          start_date: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          name: string
          start_date: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          name?: string
          start_date?: string
        }
        Relationships: []
      }
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
      adaptive_quiz_attempts: {
        Row: {
          completed_at: string | null
          difficulty_progression: Json
          id: string
          questions_presented: Json
          quiz_id: string
          score: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          difficulty_progression: Json
          id?: string
          questions_presented: Json
          quiz_id: string
          score: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          difficulty_progression?: Json
          id?: string
          questions_presented?: Json
          quiz_id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "adaptive_quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adaptive_quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          context_summary: string | null
          created_at: string | null
          faculty: string
          id: string
          institution_id: string | null
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
          institution_id?: string | null
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
          institution_id?: string | null
          learning_insights?: Json | null
          messages?: Json | null
          subject?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
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
      ai_tutor_common_questions: {
        Row: {
          category: string | null
          frequency: number
          id: string
          last_asked: string
          question: string
        }
        Insert: {
          category?: string | null
          frequency?: number
          id?: string
          last_asked?: string
          question: string
        }
        Update: {
          category?: string | null
          frequency?: number
          id?: string
          last_asked?: string
          question?: string
        }
        Relationships: []
      }
      ai_tutor_interactions: {
        Row: {
          created_at: string
          id: string
          institution_id: string | null
          interaction_type: string | null
          module_id: string | null
          question: string
          response: string
          response_time: number | null
          satisfaction_rating: number | null
          session_duration: number | null
          tutor_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          institution_id?: string | null
          interaction_type?: string | null
          module_id?: string | null
          question: string
          response: string
          response_time?: number | null
          satisfaction_rating?: number | null
          session_duration?: number | null
          tutor_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          institution_id?: string | null
          interaction_type?: string | null
          module_id?: string | null
          question?: string
          response?: string
          response_time?: number | null
          satisfaction_rating?: number | null
          session_duration?: number | null
          tutor_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tutor_interactions_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tutor_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          sender_type: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          sender_type: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          sender_type?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tutor_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_tutor_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tutor_sessions: {
        Row: {
          created_at: string | null
          ended_at: string | null
          id: string
          institution_id: string
          module_id: string | null
          satisfaction_rating: number | null
          started_at: string | null
          status: string | null
          total_messages: number | null
          tutor_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          ended_at?: string | null
          id?: string
          institution_id: string
          module_id?: string | null
          satisfaction_rating?: number | null
          started_at?: string | null
          status?: string | null
          total_messages?: number | null
          tutor_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          ended_at?: string | null
          id?: string
          institution_id?: string
          module_id?: string | null
          satisfaction_rating?: number | null
          started_at?: string | null
          status?: string | null
          total_messages?: number | null
          tutor_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tutor_sessions_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_tutor_sessions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_tutor_sessions_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "ai_tutors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_tutor_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ai_tutor_videos: {
        Row: {
          created_at: string
          description: string | null
          id: string
          institution_id: string | null
          module_id: string | null
          title: string
          tutor_id: string | null
          video_url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          institution_id?: string | null
          module_id?: string | null
          title: string
          tutor_id?: string | null
          video_url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          institution_id?: string | null
          module_id?: string | null
          title?: string
          tutor_id?: string | null
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tutor_videos_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tutors: {
        Row: {
          avatar_image_url: string | null
          created_at: string | null
          description: string | null
          faculty_id: string | null
          id: string
          institution_id: string | null
          is_online: boolean | null
          name: string
          personality_prompt: string | null
          specialty: string
          voice_id: string | null
        }
        Insert: {
          avatar_image_url?: string | null
          created_at?: string | null
          description?: string | null
          faculty_id?: string | null
          id?: string
          institution_id?: string | null
          is_online?: boolean | null
          name: string
          personality_prompt?: string | null
          specialty: string
          voice_id?: string | null
        }
        Update: {
          avatar_image_url?: string | null
          created_at?: string | null
          description?: string | null
          faculty_id?: string | null
          id?: string
          institution_id?: string | null
          is_online?: boolean | null
          name?: string
          personality_prompt?: string | null
          specialty?: string
          voice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_tutors_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_tutors_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          course_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_at: string | null
          id: string
          institution_id: string | null
          module_id: string | null
          published: boolean | null
          title: string | null
          total_points: number | null
          type: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          institution_id?: string | null
          module_id?: string | null
          published?: boolean | null
          title?: string | null
          total_points?: number | null
          type?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          institution_id?: string | null
          module_id?: string | null
          published?: boolean | null
          title?: string | null
          total_points?: number | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "assignments_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          title: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          title: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      conversation_members: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string | null
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_members_conversation_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_members_user_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          institution_id: string | null
          is_group: boolean | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          institution_id?: string | null
          is_group?: boolean | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          institution_id?: string | null
          is_group?: boolean | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_institution_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
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
      course_materials: {
        Row: {
          created_at: string | null
          id: string
          module_id: string | null
          title: string
          type: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          module_id?: string | null
          title: string
          type: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          module_id?: string | null
          title?: string
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_materials_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
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
          institution_id: string
          material_url: string | null
          order_index: number | null
          quiz_data: Json | null
          rewards_amount: number | null
          title: string
        }
        Insert: {
          content?: Json | null
          content_md?: string | null
          course_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          institution_id: string
          material_url?: string | null
          order_index?: number | null
          quiz_data?: Json | null
          rewards_amount?: number | null
          title: string
        }
        Update: {
          content?: Json | null
          content_md?: string | null
          course_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          institution_id?: string
          material_url?: string | null
          order_index?: number | null
          quiz_data?: Json | null
          rewards_amount?: number | null
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
          {
            foreignKeyName: "course_modules_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      course_offerings: {
        Row: {
          course_id: string | null
          created_at: string | null
          id: string
          term_id: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          term_id?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          term_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_offerings_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_offerings_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "academic_terms"
            referencedColumns: ["id"]
          },
        ]
      }
      course_recommendations: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          reason: string
          relevance_score: number
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          reason: string
          relevance_score: number
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          reason?: string
          relevance_score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_recommendations_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
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
          institution_id: string
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
          institution_id: string
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
          institution_id?: string
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
          {
            foreignKeyName: "courses_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      degree_programs: {
        Row: {
          created_at: string | null
          description: string | null
          duration: string | null
          faculty: string | null
          id: string
          level: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration?: string | null
          faculty?: string | null
          id?: string
          level?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: string | null
          faculty?: string | null
          id?: string
          level?: string | null
          title?: string
        }
        Relationships: []
      }
      devotional_completions: {
        Row: {
          completed_at: string | null
          devotional_id: string
          id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          devotional_id: string
          id?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          devotional_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "devotional_completions_devotional_fkey"
            columns: ["devotional_id"]
            isOneToOne: false
            referencedRelation: "devotionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devotional_completions_user_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      devotionals: {
        Row: {
          content: string
          created_at: string | null
          date: string
          id: string
          institution_id: string | null
          scripture_reference: string | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          date: string
          id?: string
          institution_id?: string | null
          scripture_reference?: string | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          date?: string
          id?: string
          institution_id?: string | null
          scripture_reference?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "devotionals_institution_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          course_id: string | null
          created_at: string | null
          id: string
          institution_id: string
          progress: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          institution_id: string
          progress?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          institution_id?: string
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
            foreignKeyName: "enrollments_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
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
          emblem_url: string | null
          faculty_code: string | null
          id: string
          institution_id: string
          key_scripture: string | null
          mission: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          dean_id?: string | null
          description?: string | null
          emblem_url?: string | null
          faculty_code?: string | null
          id?: string
          institution_id: string
          key_scripture?: string | null
          mission?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          dean_id?: string | null
          description?: string | null
          emblem_url?: string | null
          faculty_code?: string | null
          id?: string
          institution_id?: string
          key_scripture?: string | null
          mission?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "faculties_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty_profiles: {
        Row: {
          bio: string | null
          created_at: string | null
          full_name: string | null
          id: string
          title: string | null
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          title?: string | null
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faculty_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      fellowship_rooms: {
        Row: {
          created_at: string | null
          current_count: number | null
          description: string | null
          id: string
          institution_id: string
          is_active: boolean | null
          max_capacity: number | null
          name: string
        }
        Insert: {
          created_at?: string | null
          current_count?: number | null
          description?: string | null
          id?: string
          institution_id: string
          is_active?: boolean | null
          max_capacity?: number | null
          name: string
        }
        Update: {
          created_at?: string | null
          current_count?: number | null
          description?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean | null
          max_capacity?: number | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fellowship_rooms_institution_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_progress: {
        Row: {
          courses_created: number | null
          created_at: string | null
          current_stage: string
          estimated_time_remaining: string | null
          faculties_created: number | null
          id: string
          institution_id: string | null
          modules_created: number | null
          progress: number | null
          tutors_created: number | null
          updated_at: string | null
        }
        Insert: {
          courses_created?: number | null
          created_at?: string | null
          current_stage: string
          estimated_time_remaining?: string | null
          faculties_created?: number | null
          id?: string
          institution_id?: string | null
          modules_created?: number | null
          progress?: number | null
          tutors_created?: number | null
          updated_at?: string | null
        }
        Update: {
          courses_created?: number | null
          created_at?: string | null
          current_stage?: string
          estimated_time_remaining?: string | null
          faculties_created?: number | null
          id?: string
          institution_id?: string | null
          modules_created?: number | null
          progress?: number | null
          tutors_created?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generation_progress_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      grades: {
        Row: {
          feedback: string | null
          graded_at: string | null
          grader_user_id: string | null
          id: string
          rubric: Json | null
          score: number | null
          submission_id: string | null
        }
        Insert: {
          feedback?: string | null
          graded_at?: string | null
          grader_user_id?: string | null
          id?: string
          rubric?: Json | null
          score?: number | null
          submission_id?: string | null
        }
        Update: {
          feedback?: string | null
          graded_at?: string | null
          grader_user_id?: string | null
          id?: string
          rubric?: Json | null
          score?: number | null
          submission_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grades_grader_user_id_fkey"
            columns: ["grader_user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "grades_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "v_grading_queue"
            referencedColumns: ["submission_id"]
          },
        ]
      }
      graduations: {
        Row: {
          ceremony_date: string | null
          certificate_url: string | null
          honors: string | null
          id: string
          student_id: string | null
        }
        Insert: {
          ceremony_date?: string | null
          certificate_url?: string | null
          honors?: string | null
          id?: string
          student_id?: string | null
        }
        Update: {
          ceremony_date?: string | null
          certificate_url?: string | null
          honors?: string | null
          id?: string
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "graduations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_gpa"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "graduations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_members: {
        Row: {
          created_at: string | null
          id: string
          institution_id: string
          joined_at: string | null
          role: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          institution_id: string
          joined_at?: string | null
          role: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          institution_id?: string
          joined_at?: string | null
          role?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "institution_members_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      institutions: {
        Row: {
          accent_color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          plan: string | null
          primary_color: string | null
          settings: Json | null
          short_name: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          accent_color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          plan?: string | null
          primary_color?: string | null
          settings?: Json | null
          short_name?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          accent_color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          plan?: string | null
          primary_color?: string | null
          settings?: Json | null
          short_name?: string | null
          slug?: string
          updated_at?: string | null
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
      learning_analytics_daily: {
        Row: {
          avg_score: number | null
          completed_modules_count: number | null
          course_id: string | null
          created_at: string | null
          date: string
          enrollments_count: number | null
          id: string
          quiz_attempts: number | null
          user_id: string | null
        }
        Insert: {
          avg_score?: number | null
          completed_modules_count?: number | null
          course_id?: string | null
          created_at?: string | null
          date: string
          enrollments_count?: number | null
          id?: string
          quiz_attempts?: number | null
          user_id?: string | null
        }
        Update: {
          avg_score?: number | null
          completed_modules_count?: number | null
          course_id?: string | null
          created_at?: string | null
          date?: string
          enrollments_count?: number | null
          id?: string
          quiz_attempts?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_analytics_daily_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_analytics_daily_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      learning_goals: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_value: number | null
          deadline: string | null
          goal_type: string
          id: string
          status: string | null
          target_value: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          deadline?: string | null
          goal_type: string
          id?: string
          status?: string | null
          target_value: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          deadline?: string | null
          goal_type?: string
          id?: string
          status?: string | null
          target_value?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      learning_materials: {
        Row: {
          created_at: string | null
          id: string
          institution_id: string | null
          kind: string | null
          meta: Json | null
          module_id: string | null
          title: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          institution_id?: string | null
          kind?: string | null
          meta?: Json | null
          module_id?: string | null
          title?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          institution_id?: string | null
          kind?: string | null
          meta?: Json | null
          module_id?: string | null
          title?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_materials_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_materials_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
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
      live_sessions: {
        Row: {
          course_id: string
          created_at: string | null
          ended_at: string | null
          id: string
          institution_id: string
          module_id: string | null
          recording_url: string | null
          scheduled_end: string
          scheduled_start: string
          started_at: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          ended_at?: string | null
          id?: string
          institution_id: string
          module_id?: string | null
          recording_url?: string | null
          scheduled_end: string
          scheduled_start: string
          started_at?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          ended_at?: string | null
          id?: string
          institution_id?: string
          module_id?: string | null
          recording_url?: string | null
          scheduled_end?: string
          scheduled_start?: string
          started_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_sessions_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_sessions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      live_sessions_chat: {
        Row: {
          created_at: string | null
          id: string
          message: string
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_sessions_chat_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_sessions_chat_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_sessions_chat_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_student_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "live_sessions_chat_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      live_sessions_participants: {
        Row: {
          attendance_duration: number | null
          audio_enabled: boolean | null
          hand_raised: boolean | null
          id: string
          is_host: boolean | null
          joined_at: string | null
          left_at: string | null
          session_id: string
          user_id: string
          video_enabled: boolean | null
        }
        Insert: {
          attendance_duration?: number | null
          audio_enabled?: boolean | null
          hand_raised?: boolean | null
          id?: string
          is_host?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          session_id: string
          user_id: string
          video_enabled?: boolean | null
        }
        Update: {
          attendance_duration?: number | null
          audio_enabled?: boolean | null
          hand_raised?: boolean | null
          id?: string
          is_host?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          session_id?: string
          user_id?: string
          video_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "live_sessions_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_sessions_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_sessions_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_student_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "live_sessions_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      mentorship_requests: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          id: string
          institution_id: string
          mentor_id: string | null
          message: string | null
          status: string | null
          student_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          institution_id: string
          mentor_id?: string | null
          message?: string | null
          status?: string | null
          student_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          institution_id?: string
          mentor_id?: string | null
          message?: string | null
          status?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_requests_institution_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_requests_mentor_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "mentorship_requests_student_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_fkey"
            columns: ["sender_id"]
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
      module_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          course_id: string | null
          id: string
          module_id: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          course_id?: string | null
          id?: string
          module_id?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          course_id?: string | null
          id?: string
          module_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "module_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          channel_email: boolean | null
          channel_inapp: boolean | null
          channel_push: boolean | null
          course_updates: boolean | null
          created_at: string | null
          id: string
          spiritual_updates: boolean | null
          system_updates: boolean | null
          tutor_updates: boolean | null
          user_id: string
        }
        Insert: {
          channel_email?: boolean | null
          channel_inapp?: boolean | null
          channel_push?: boolean | null
          course_updates?: boolean | null
          created_at?: string | null
          id?: string
          spiritual_updates?: boolean | null
          system_updates?: boolean | null
          tutor_updates?: boolean | null
          user_id: string
        }
        Update: {
          channel_email?: boolean | null
          channel_inapp?: boolean | null
          channel_push?: boolean | null
          course_updates?: boolean | null
          created_at?: string | null
          id?: string
          spiritual_updates?: boolean | null
          system_updates?: boolean | null
          tutor_updates?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          id: string
          institution_id: string | null
          is_read: boolean | null
          metadata: Json | null
          related_id: string | null
          related_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          institution_id?: string | null
          is_read?: boolean | null
          metadata?: Json | null
          related_id?: string | null
          related_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          institution_id?: string | null
          is_read?: boolean | null
          metadata?: Json | null
          related_id?: string | null
          related_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      office_hours_bookings: {
        Row: {
          booked_at: string
          id: string
          notes: string | null
          slot_id: string
          status: string
          user_id: string
        }
        Insert: {
          booked_at?: string
          id?: string
          notes?: string | null
          slot_id: string
          status?: string
          user_id: string
        }
        Update: {
          booked_at?: string
          id?: string
          notes?: string | null
          slot_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "office_hours_bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "office_hours_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      office_hours_slots: {
        Row: {
          created_at: string
          day_of_week: string
          end_time: string
          id: string
          max_students: number
          start_time: string
          tutor_name: string
          tutor_specialty: string
        }
        Insert: {
          created_at?: string
          day_of_week: string
          end_time: string
          id?: string
          max_students?: number
          start_time: string
          tutor_name: string
          tutor_specialty: string
        }
        Update: {
          created_at?: string
          day_of_week?: string
          end_time?: string
          id?: string
          max_students?: number
          start_time?: string
          tutor_name?: string
          tutor_specialty?: string
        }
        Relationships: []
      }
      platform_owners: {
        Row: {
          created_at: string | null
          email: string | null
          note: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          note?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          note?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_owners_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
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
          current_institution_id: string | null
          email: string | null
          id: string
          role: string | null
          scrollcoin_balance: number | null
          scrollcoins: number | null
          spiritual_profile: Json | null
          updated_at: string | null
        }
        Insert: {
          academic_profile?: Json | null
          created_at?: string | null
          current_institution_id?: string | null
          email?: string | null
          id: string
          role?: string | null
          scrollcoin_balance?: number | null
          scrollcoins?: number | null
          spiritual_profile?: Json | null
          updated_at?: string | null
        }
        Update: {
          academic_profile?: Json | null
          created_at?: string | null
          current_institution_id?: string | null
          email?: string | null
          id?: string
          role?: string | null
          scrollcoin_balance?: number | null
          scrollcoins?: number | null
          spiritual_profile?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_institution_id_fkey"
            columns: ["current_institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
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
      quiz_questions: {
        Row: {
          answer: string | null
          assignment_id: string | null
          difficulty_rating: number | null
          id: string
          kind: string | null
          options: string[] | null
          order_index: number | null
          points: number | null
          prompt: string | null
        }
        Insert: {
          answer?: string | null
          assignment_id?: string | null
          difficulty_rating?: number | null
          id?: string
          kind?: string | null
          options?: string[] | null
          order_index?: number | null
          points?: number | null
          prompt?: string | null
        }
        Update: {
          answer?: string | null
          assignment_id?: string | null
          difficulty_rating?: number | null
          id?: string
          kind?: string | null
          options?: string[] | null
          order_index?: number | null
          points?: number | null
          prompt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_questions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "v_course_gradebook"
            referencedColumns: ["assignment_id"]
          },
        ]
      }
      quiz_submissions: {
        Row: {
          course_id: string | null
          id: string
          module_id: string | null
          score: number | null
          submitted_at: string | null
          total: number | null
          user_id: string | null
        }
        Insert: {
          course_id?: string | null
          id?: string
          module_id?: string | null
          score?: number | null
          submitted_at?: string | null
          total?: number | null
          user_id?: string | null
        }
        Update: {
          course_id?: string | null
          id?: string
          module_id?: string | null
          score?: number | null
          submitted_at?: string | null
          total?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string | null
          id: string
          institution_id: string | null
          module_id: string | null
          passing_score: number
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          institution_id?: string | null
          module_id?: string | null
          passing_score?: number
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          institution_id?: string | null
          module_id?: string | null
          passing_score?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_ledger: {
        Row: {
          amount: number
          created_at: string | null
          event_type: string
          id: string
          meta: Json | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          event_type: string
          id?: string
          meta?: Json | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          event_type?: string
          id?: string
          meta?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reward_ledger_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      reward_rules: {
        Row: {
          base_amount: number
          extra: Json | null
          key: string
        }
        Insert: {
          base_amount: number
          extra?: Json | null
          key: string
        }
        Update: {
          base_amount?: number
          extra?: Json | null
          key?: string
        }
        Relationships: []
      }
      rubric_criteria: {
        Row: {
          assignment_id: string | null
          description: string | null
          id: string
          label: string | null
          weight: number | null
        }
        Insert: {
          assignment_id?: string | null
          description?: string | null
          id?: string
          label?: string | null
          weight?: number | null
        }
        Update: {
          assignment_id?: string | null
          description?: string | null
          id?: string
          label?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rubric_criteria_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rubric_criteria_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "v_course_gradebook"
            referencedColumns: ["assignment_id"]
          },
        ]
      }
      scripture_memory: {
        Row: {
          id: string
          last_reviewed_at: string | null
          mastery_level: number | null
          memorized_at: string | null
          review_count: number | null
          user_id: string
          verse_reference: string
          verse_text: string
        }
        Insert: {
          id?: string
          last_reviewed_at?: string | null
          mastery_level?: number | null
          memorized_at?: string | null
          review_count?: number | null
          user_id: string
          verse_reference: string
          verse_text: string
        }
        Update: {
          id?: string
          last_reviewed_at?: string | null
          mastery_level?: number | null
          memorized_at?: string | null
          review_count?: number | null
          user_id?: string
          verse_reference?: string
          verse_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "scripture_memory_user_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
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
      scrollcoin_analytics_daily: {
        Row: {
          active_users: number | null
          created_at: string | null
          date: string
          id: string
          net_change: number | null
          top_sources: Json | null
          total_earned: number | null
          total_spent: number | null
        }
        Insert: {
          active_users?: number | null
          created_at?: string | null
          date: string
          id?: string
          net_change?: number | null
          top_sources?: Json | null
          total_earned?: number | null
          total_spent?: number | null
        }
        Update: {
          active_users?: number | null
          created_at?: string | null
          date?: string
          id?: string
          net_change?: number | null
          top_sources?: Json | null
          total_earned?: number | null
          total_spent?: number | null
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
      spiritual_analytics_daily: {
        Row: {
          answered_prayers: number | null
          avg_prayer_streak: number | null
          created_at: string | null
          date: string
          id: string
          total_prayers: number | null
          unique_prayer_users: number | null
        }
        Insert: {
          answered_prayers?: number | null
          avg_prayer_streak?: number | null
          created_at?: string | null
          date: string
          id?: string
          total_prayers?: number | null
          unique_prayer_users?: number | null
        }
        Update: {
          answered_prayers?: number | null
          avg_prayer_streak?: number | null
          created_at?: string | null
          date?: string
          id?: string
          total_prayers?: number | null
          unique_prayer_users?: number | null
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
      spiritual_metrics: {
        Row: {
          divine_score: number | null
          id: string
          ministry_readiness: number | null
          prayer_streak: number | null
          scripture_progress: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          divine_score?: number | null
          id?: string
          ministry_readiness?: number | null
          prayer_streak?: number | null
          scripture_progress?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          divine_score?: number | null
          id?: string
          ministry_readiness?: number | null
          prayer_streak?: number | null
          scripture_progress?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spiritual_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      student_applications: {
        Row: {
          created_at: string | null
          decision_notes: string | null
          education_background: string
          email: string
          full_name: string
          id: string
          institution_id: string
          motivation: string
          phone: string
          program_interest: string
          reference_info: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          spiritual_journey: string
          status: string | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          decision_notes?: string | null
          education_background: string
          email: string
          full_name: string
          id?: string
          institution_id: string
          motivation: string
          phone: string
          program_interest: string
          reference_info?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          spiritual_journey: string
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          decision_notes?: string | null
          education_background?: string
          email?: string
          full_name?: string
          id?: string
          institution_id?: string
          motivation?: string
          phone?: string
          program_interest?: string
          reference_info?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          spiritual_journey?: string
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_applications_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "student_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      student_documents: {
        Row: {
          doc_type: string | null
          file_url: string | null
          id: string
          student_id: string | null
          uploaded_at: string | null
          verified: boolean | null
        }
        Insert: {
          doc_type?: string | null
          file_url?: string | null
          id?: string
          student_id?: string | null
          uploaded_at?: string | null
          verified?: boolean | null
        }
        Update: {
          doc_type?: string | null
          file_url?: string | null
          id?: string
          student_id?: string | null
          uploaded_at?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "student_documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_gpa"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_learning_profiles: {
        Row: {
          created_at: string | null
          goals: string[] | null
          id: string
          learning_style: string
          preferred_pace: string
          strengths: string[] | null
          study_time_preference: Json | null
          updated_at: string | null
          user_id: string
          weaknesses: string[] | null
        }
        Insert: {
          created_at?: string | null
          goals?: string[] | null
          id?: string
          learning_style: string
          preferred_pace: string
          strengths?: string[] | null
          study_time_preference?: Json | null
          updated_at?: string | null
          user_id: string
          weaknesses?: string[] | null
        }
        Update: {
          created_at?: string | null
          goals?: string[] | null
          id?: string
          learning_style?: string
          preferred_pace?: string
          strengths?: string[] | null
          study_time_preference?: Json | null
          updated_at?: string | null
          user_id?: string
          weaknesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "student_learning_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      student_module_progress: {
        Row: {
          attempts: number | null
          completed_at: string | null
          id: string
          last_accessed: string | null
          mastery_level: number | null
          module_id: string
          status: string
          time_spent: number | null
          user_id: string
        }
        Insert: {
          attempts?: number | null
          completed_at?: string | null
          id?: string
          last_accessed?: string | null
          mastery_level?: number | null
          module_id: string
          status?: string
          time_spent?: number | null
          user_id: string
        }
        Update: {
          attempts?: number | null
          completed_at?: string | null
          id?: string
          last_accessed?: string | null
          mastery_level?: number | null
          module_id?: string
          status?: string
          time_spent?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_module_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_module_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          admission_letter_url: string | null
          application_status: string | null
          country: string | null
          created_at: string | null
          dob: string | null
          email: string | null
          full_name: string | null
          gender: string | null
          id: string
          phone: string | null
          photo_url: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          admission_letter_url?: string | null
          application_status?: string | null
          country?: string | null
          created_at?: string | null
          dob?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          phone?: string | null
          photo_url?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          admission_letter_url?: string | null
          application_status?: string | null
          country?: string | null
          created_at?: string | null
          dob?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          phone?: string | null
          photo_url?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard"
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
          institution_id: string | null
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
          institution_id?: string | null
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
          institution_id?: string | null
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
          {
            foreignKeyName: "study_groups_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      study_plans: {
        Row: {
          course_id: string
          created_at: string | null
          daily_schedule: Json
          id: string
          milestones: Json | null
          target_completion_date: string
          updated_at: string | null
          user_id: string
          weekly_hours: number
        }
        Insert: {
          course_id: string
          created_at?: string | null
          daily_schedule: Json
          id?: string
          milestones?: Json | null
          target_completion_date: string
          updated_at?: string | null
          user_id: string
          weekly_hours: number
        }
        Update: {
          course_id?: string
          created_at?: string | null
          daily_schedule?: Json
          id?: string
          milestones?: Json | null
          target_completion_date?: string
          updated_at?: string | null
          user_id?: string
          weekly_hours?: number
        }
        Relationships: [
          {
            foreignKeyName: "study_plans_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      submissions: {
        Row: {
          answers: Json | null
          assignment_id: string | null
          file_url: string | null
          id: string
          status: string | null
          submitted_at: string | null
          user_id: string | null
        }
        Insert: {
          answers?: Json | null
          assignment_id?: string | null
          file_url?: string | null
          id?: string
          status?: string | null
          submitted_at?: string | null
          user_id?: string | null
        }
        Update: {
          answers?: Json | null
          assignment_id?: string | null
          file_url?: string | null
          id?: string
          status?: string | null
          submitted_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "v_course_gradebook"
            referencedColumns: ["assignment_id"]
          },
          {
            foreignKeyName: "submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      system_analytics_daily: {
        Row: {
          active_users: number | null
          ai_messages: number | null
          ai_tutor_sessions: number | null
          created_at: string | null
          date: string
          id: string
          new_applications: number | null
          new_enrollments: number | null
        }
        Insert: {
          active_users?: number | null
          ai_messages?: number | null
          ai_tutor_sessions?: number | null
          created_at?: string | null
          date: string
          id?: string
          new_applications?: number | null
          new_enrollments?: number | null
        }
        Update: {
          active_users?: number | null
          ai_messages?: number | null
          ai_tutor_sessions?: number | null
          created_at?: string | null
          date?: string
          id?: string
          new_applications?: number | null
          new_enrollments?: number | null
        }
        Relationships: []
      }
      teaching_assignments: {
        Row: {
          course_id: string | null
          created_at: string | null
          faculty_user_id: string | null
          id: string
          role: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          faculty_user_id?: string | null
          id?: string
          role?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          faculty_user_id?: string | null
          id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teaching_assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teaching_assignments_faculty_user_id_fkey"
            columns: ["faculty_user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      testimonies: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          content: string
          created_at: string | null
          id: string
          institution_id: string | null
          status: string | null
          title: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          content: string
          created_at?: string | null
          id?: string
          institution_id?: string | null
          status?: string | null
          title: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          content?: string
          created_at?: string | null
          id?: string
          institution_id?: string | null
          status?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonies_institution_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonies_user_fkey"
            columns: ["user_id"]
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
      transcripts: {
        Row: {
          completed_at: string | null
          course_id: string | null
          faculty: string | null
          grade: string | null
          id: string
          score: number | null
          student_id: string | null
        }
        Insert: {
          completed_at?: string | null
          course_id?: string | null
          faculty?: string | null
          grade?: string | null
          id?: string
          score?: number | null
          student_id?: string | null
        }
        Update: {
          completed_at?: string | null
          course_id?: string | null
          faculty?: string | null
          grade?: string | null
          id?: string
          score?: number | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transcripts_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transcripts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_gpa"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "transcripts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
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
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
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
      virtual_labs: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          id: string
          resources_url: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          resources_url?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          resources_url?: string | null
          title?: string
        }
        Relationships: []
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
      xr_classrooms: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          institution_id: string | null
          media_url: string | null
          scheduled_time: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          institution_id?: string | null
          media_url?: string | null
          scheduled_time?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          institution_id?: string | null
          media_url?: string | null
          scheduled_time?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "xr_classrooms_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      ai_tutor_analytics: {
        Row: {
          avg_duration: number | null
          avg_satisfaction: number | null
          date: string | null
          total_interactions: number | null
        }
        Relationships: []
      }
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
      student_gpa: {
        Row: {
          gpa: number | null
          student_id: string | null
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
      v_course_gradebook: {
        Row: {
          assignment_id: string | null
          assignment_title: string | null
          course_id: string | null
          feedback: string | null
          graded_at: string | null
          score: number | null
          student_user_id: string | null
          total_points: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_user_id_fkey"
            columns: ["student_user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
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
      v_grading_queue: {
        Row: {
          assignment_id: string | null
          assignment_title: string | null
          course_id: string | null
          student_user_id: string | null
          submission_id: string | null
          submitted_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "v_course_gradebook"
            referencedColumns: ["assignment_id"]
          },
          {
            foreignKeyName: "submissions_user_id_fkey"
            columns: ["student_user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
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
      award_by_rule: {
        Args: {
          p_event: string
          p_meta?: Json
          p_user: string
          p_value?: number
        }
        Returns: undefined
      }
      award_scrollcoins: {
        Args: {
          p_amount: number
          p_event: string
          p_meta?: Json
          p_user: string
        }
        Returns: undefined
      }
      create_notification: {
        Args: {
          p_body: string
          p_metadata?: Json
          p_related_id?: string
          p_related_type?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      earn_scrollcoin: {
        Args: { p_amount: number; p_desc: string; p_user_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      spend_scrollcoin: {
        Args: { p_amount: number; p_desc: string; p_user_id: string }
        Returns: undefined
      }
      track_common_question: {
        Args: { p_category: string; p_question: string }
        Returns: undefined
      }
      user_has_institution_access: {
        Args: { p_institution_id: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "faculty" | "admin" | "superadmin"
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
      app_role: ["student", "faculty", "admin", "superadmin"],
    },
  },
} as const
