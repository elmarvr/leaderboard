export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string
          name: string
          created_at: string | null
          avatar_url: string | null
          score: number
        }
        Insert: {
          id?: string
          name: string
          created_at?: string | null
          avatar_url?: string | null
          score?: number
        }
        Update: {
          id?: string
          name?: string
          created_at?: string | null
          avatar_url?: string | null
          score?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
