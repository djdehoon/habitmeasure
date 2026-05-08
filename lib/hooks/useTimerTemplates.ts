"use client";

import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { TimerTemplate, TimerTemplatePayload } from "@/lib/utils/timerHelpers";

type Result<T> = { data: T | null; error: string | null };

export function useTimerTemplates() {
  const getAuthenticatedUserId = useCallback(async (): Promise<Result<string>> => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return { data: null, error: error.message };
    }

    if (!user) {
      return { data: null, error: "Geen ingelogde gebruiker gevonden." };
    }

    return { data: user.id, error: null };
  }, []);

  const listTemplates = useCallback(async (): Promise<Result<TimerTemplate[]>> => {
    const userResult = await getAuthenticatedUserId();
    if (!userResult.data) return { data: null, error: userResult.error };

    const { data, error } = await supabase
      .from("timer_templates")
      .select("*")
      .eq("user_id", userResult.data)
      .order("created_at", { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: (data as TimerTemplate[]) ?? [], error: null };
  }, [getAuthenticatedUserId]);

  const getTemplate = useCallback(
    async (templateId: string): Promise<Result<TimerTemplate>> => {
      const userResult = await getAuthenticatedUserId();
      if (!userResult.data) return { data: null, error: userResult.error };

      const { data, error } = await supabase
        .from("timer_templates")
        .select("*")
        .eq("id", templateId)
        .eq("user_id", userResult.data)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data as TimerTemplate, error: null };
    },
    [getAuthenticatedUserId],
  );

  const createTemplate = useCallback(
    async (payload: Omit<TimerTemplatePayload, "user_id">): Promise<Result<TimerTemplate>> => {
      const userResult = await getAuthenticatedUserId();
      if (!userResult.data) return { data: null, error: userResult.error };

      const { data, error } = await supabase
        .from("timer_templates")
        .insert([{ ...payload, user_id: userResult.data }])
        .select("*")
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data as TimerTemplate, error: null };
    },
    [getAuthenticatedUserId],
  );

  const updateTemplate = useCallback(
    async (templateId: string, payload: Omit<TimerTemplatePayload, "user_id">): Promise<Result<TimerTemplate>> => {
      const userResult = await getAuthenticatedUserId();
      if (!userResult.data) return { data: null, error: userResult.error };

      const { data, error } = await supabase
        .from("timer_templates")
        .update(payload)
        .eq("id", templateId)
        .eq("user_id", userResult.data)
        .select("*")
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data as TimerTemplate, error: null };
    },
    [getAuthenticatedUserId],
  );

  const deleteTemplate = useCallback(
    async (templateId: string): Promise<Result<true>> => {
      const userResult = await getAuthenticatedUserId();
      if (!userResult.data) return { data: null, error: userResult.error };

      const { error } = await supabase
        .from("timer_templates")
        .delete()
        .eq("id", templateId)
        .eq("user_id", userResult.data);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: true, error: null };
    },
    [getAuthenticatedUserId],
  );

  return {
    getAuthenticatedUserId,
    listTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}
