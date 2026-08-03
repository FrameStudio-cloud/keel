import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { getShopId } from "../lib/shop";

async function invokeInbox(action, body) {
  const { data, error } = await supabase.functions.invoke(`whatsapp-inbox/${action}`, { body });
  if (error) {
    let message = error.message || "Something went wrong";
    if (error.context) {
      try {
        const ctx = await error.context.json();
        message = ctx?.error || message;
      } catch {
        /* keep default */
      }
    }
    throw new Error(message);
  }
  return data;
}

export function useWhatsAppConfig() {
  return useQuery({
    queryKey: ["whatsappConfig"],
    queryFn: async () => {
      const shopId = await getShopId();
      if (!shopId) return null;
      const { data } = await supabase
        .from("chat_config")
        .select("whatsapp_status, whatsapp_bot_number, whatsapp_bot_enabled")
        .eq("shop_id", shopId)
        .maybeSingle();
      return data || null;
    },
    staleTime: 30_000,
  });
}

export function useWhatsAppConversations() {
  return useQuery({
    queryKey: ["whatsappConversations"],
    queryFn: async () => {
      const shopId = await getShopId();
      if (!shopId) return [];
      const { data } = await supabase
        .from("whatsapp_conversations")
        .select("*")
        .eq("shop_id", shopId)
        .order("last_message_at", { ascending: false })
        .limit(200);
      return data || [];
    },
    staleTime: 10_000,
    refetchInterval: 5000,
  });
}

export function useWhatsAppMessages(conversationId) {
  return useQuery({
    queryKey: ["whatsappMessages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const shopId = await getShopId();
      if (!shopId) return [];
      const { data } = await supabase
        .from("whatsapp_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .eq("shop_id", shopId)
        .order("created_at", { ascending: true })
        .limit(500);
      return data || [];
    },
    staleTime: 10_000,
    refetchInterval: 5000,
    enabled: !!conversationId,
  });
}

export function useWhatsAppUnreadCount() {
  return useQuery({
    queryKey: ["whatsappUnread"],
    queryFn: async () => {
      const shopId = await getShopId();
      if (!shopId) return 0;
      const { data } = await supabase
        .from("whatsapp_conversations")
        .select("unread_count")
        .eq("shop_id", shopId)
        .limit(200);
      return (data || []).reduce((sum, c) => sum + (c.unread_count || 0), 0);
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useSendWhatsAppReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ customer_phone, body, image_url, caption }) =>
      invokeInbox("send", { customer_phone, body, image_url, caption }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsappConversations"] });
      queryClient.invalidateQueries({ queryKey: ["whatsappMessages"] });
      queryClient.invalidateQueries({ queryKey: ["whatsappUnread"] });
    },
  });
}

export function useShopProducts() {
  return useQuery({
    queryKey: ["whatsappProducts"],
    queryFn: async () => {
      const shopId = await getShopId();
      if (!shopId) return [];
      const { data } = await supabase
        .from("products")
        .select("id, name, price, stock, image, category, barcode")
        .eq("shop_id", shopId)
        .order("name", { ascending: true })
        .limit(200);
      return data || [];
    },
    staleTime: 60_000,
  });
}

export function useQuickReplies() {
  return useQuery({
    queryKey: ["whatsappQuickReplies"],
    queryFn: async () => {
      const shopId = await getShopId();
      if (!shopId) return [];
      const { data } = await supabase
        .from("chat_config")
        .select("quick_replies")
        .eq("shop_id", shopId)
        .maybeSingle();
      return data?.quick_replies || [];
    },
    staleTime: 30_000,
  });
}

export function useSaveQuickReplies() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (replies) => {
      const shopId = await getShopId();
      if (!shopId) throw new Error("No shop ID");
      const { error } = await supabase
        .from("chat_config")
        .upsert({ shop_id: shopId, quick_replies: replies }, { onConflict: "shop_id" });
      if (error) throw error;
      return replies;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsappQuickReplies"] });
    },
  });
}

export function useSetConversationMode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversation_id, mode }) =>
      invokeInbox(mode === "human" ? "takeover" : "resume", { conversation_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsappConversations"] });
      queryClient.invalidateQueries({ queryKey: ["whatsappUnread"] });
    },
  });
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversation_id) => invokeInbox("markread", { conversation_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsappConversations"] });
      queryClient.invalidateQueries({ queryKey: ["whatsappUnread"] });
    },
  });
}
