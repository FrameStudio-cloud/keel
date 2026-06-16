import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const customFetch = (...args) => {
  console.log("[FETCH] calling fetch:", args[0]?.slice(0, 80));
  return window.fetch(...args);
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: customFetch,
  },
});
