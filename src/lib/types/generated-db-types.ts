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
      contracts: {
        Row: {
          id: string
          created_at: string | null
          metadata: Json | null
          project: string | null
          abi: Json | null
          slug: string | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          metadata?: Json | null
          project?: string | null
          abi?: Json | null
          slug?: string | null
        }
        Update: {
          id?: string
          created_at?: string | null
          metadata?: Json | null
          project?: string | null
          abi?: Json | null
          slug?: string | null
        }
      }
      draft_expressions: {
        Row: {
          id: string
          created_at: string | null
          contract: string | null
          user_id: string
          raw_expression: string
          sharable_slug: string
          interpreter: string
          name: string
          notes: string
          contract_expression: string | null
          saved_context: Json | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          contract?: string | null
          user_id?: string
          raw_expression: string
          sharable_slug?: string
          interpreter: string
          name: string
          notes: string
          contract_expression?: string | null
          saved_context?: Json | null
        }
        Update: {
          id?: string
          created_at?: string | null
          contract?: string | null
          user_id?: string
          raw_expression?: string
          sharable_slug?: string
          interpreter?: string
          name?: string
          notes?: string
          contract_expression?: string | null
          saved_context?: Json | null
        }
      }
      interpreters: {
        Row: {
          id: string
          created_at: string | null
          metadata: Json
        }
        Insert: {
          id?: string
          created_at?: string | null
          metadata: Json
        }
        Update: {
          id?: string
          created_at?: string | null
          metadata?: Json
        }
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string
          full_name: string | null
          avatar_url: string | null
          website: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username: string
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          created_at: string | null
          name: string
          logo_url: string
        }
        Insert: {
          id?: string
          created_at?: string | null
          name: string
          logo_url: string
        }
        Update: {
          id?: string
          created_at?: string | null
          name?: string
          logo_url?: string
        }
      }
      wallets: {
        Row: {
          id: string
          linked_at: string | null
          address: string
          user_id: string | null
        }
        Insert: {
          id: string
          linked_at?: string | null
          address: string
          user_id?: string | null
        }
        Update: {
          id?: string
          linked_at?: string | null
          address?: string
          user_id?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_expression_by_slug: {
        Args: { slug: string }
        Returns: unknown
      }
      match_contracts_by_address: {
        Args: { contracts_array: string[] }
        Returns: {
          id: string
          metadata: Json
          contract_address: string
          name: string
          logo_url: string
          project_id: string
        }[]
      }
      match_interpreters_by_address: {
        Args: { interpreters_array: string[] }
        Returns: { id: string; metadata: Json; interpreteraddress: string }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
