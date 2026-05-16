/**
 * Auto-generated Supabase types placeholder.
 *
 * Run `pnpm --filter @brildesk/supabase gen:types` against a running
 * local Supabase instance to regenerate from the live schema.
 *
 * This hand-written version matches the 20250516000001_foundation migration
 * so that TypeScript consumers can build before the local DB is up.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: Database["public"]["Enums"]["user_role"];
          team_id: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: Database["public"]["Enums"]["user_role"];
          team_id?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: Database["public"]["Enums"]["user_role"];
          team_id?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          wa_contact_phone: string;
          wa_contact_name: string | null;
          status: Database["public"]["Enums"]["conversation_status"];
          priority: string;
          assigned_to_id: string | null;
          team_id: string | null;
          last_message_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wa_contact_phone: string;
          wa_contact_name?: string | null;
          status?: Database["public"]["Enums"]["conversation_status"];
          priority?: string;
          assigned_to_id?: string | null;
          team_id?: string | null;
          last_message_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wa_contact_phone?: string;
          wa_contact_name?: string | null;
          status?: Database["public"]["Enums"]["conversation_status"];
          priority?: string;
          assigned_to_id?: string | null;
          team_id?: string | null;
          last_message_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          direction: Database["public"]["Enums"]["message_direction"];
          body: string | null;
          media_url: string | null;
          media_type: string | null;
          wa_message_id: string | null;
          sender_type: Database["public"]["Enums"]["sender_type"];
          sender_id: string | null;
          status: Database["public"]["Enums"]["message_status"];
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          direction: Database["public"]["Enums"]["message_direction"];
          body?: string | null;
          media_url?: string | null;
          media_type?: string | null;
          wa_message_id?: string | null;
          sender_type: Database["public"]["Enums"]["sender_type"];
          sender_id?: string | null;
          status?: Database["public"]["Enums"]["message_status"];
          timestamp?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          direction?: Database["public"]["Enums"]["message_direction"];
          body?: string | null;
          media_url?: string | null;
          media_type?: string | null;
          wa_message_id?: string | null;
          sender_type?: Database["public"]["Enums"]["sender_type"];
          sender_id?: string | null;
          status?: Database["public"]["Enums"]["message_status"];
          timestamp?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      routing_rules: {
        Row: {
          id: string;
          team_id: string;
          type: Database["public"]["Enums"]["routing_type"];
          is_active: boolean;
          config: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          type?: Database["public"]["Enums"]["routing_type"];
          is_active?: boolean;
          config?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          type?: Database["public"]["Enums"]["routing_type"];
          is_active?: boolean;
          config?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      quick_replies: {
        Row: {
          id: string;
          title: string;
          body: string;
          team_id: string | null;
          created_by_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          body: string;
          team_id?: string | null;
          created_by_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          body?: string;
          team_id?: string | null;
          created_by_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          entity: string;
          entity_id: string;
          details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          entity: string;
          entity_id: string;
          details?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          entity?: string;
          entity_id?: string;
          details?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          name: string;
          color: string;
          team_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color?: string;
          team_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          team_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      conversation_tags: {
        Row: {
          conversation_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          conversation_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: {
          conversation_id?: string;
          tag_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      beta_signups: {
        Row: {
          id: string;
          email: string;
          company_name: string | null;
          team_size: string | null;
          use_case: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          company_name?: string | null;
          team_size?: string | null;
          use_case?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          company_name?: string | null;
          team_size?: string | null;
          use_case?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: "agent" | "manager" | "admin" | "superadmin";
      conversation_status: "open" | "waiting" | "resolved" | "closed";
      message_direction: "inbound" | "outbound";
      sender_type: "contact" | "agent" | "system";
      message_status: "sent" | "delivered" | "read" | "failed";
      routing_type: "round_robin" | "least_busy" | "manual";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

/** Convenience aliases */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertDto<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateDto<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
