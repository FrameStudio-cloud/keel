import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import localPosts from "../data/blog.json";

const FRAMESTUDIO_URL = import.meta.env.VITE_FRAMESTUDIO_SUPABASE_URL;
const FRAMESTUDIO_KEY = import.meta.env.VITE_FRAMESTUDIO_SUPABASE_ANON_KEY;

const client =
  FRAMESTUDIO_URL && FRAMESTUDIO_KEY
    ? createClient(FRAMESTUDIO_URL, FRAMESTUDIO_KEY, { auth: { persistSession: false } })
    : null;

let cache = null;
let inflight = null;

function normalize(row) {
  return {
    slug: row.slug,
    title: row.title,
    date: row.date,
    author: row.author,
    excerpt: row.excerpt,
    tags: Array.isArray(row.tags) ? row.tags : [],
    content: Array.isArray(row.content) ? row.content : [],
  };
}

export async function fetchFramestudioBlogs() {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      if (client) {
        const { data, error } = await client
          .from("blogs")
          .select("slug, title, date, author, excerpt, tags, content, published, site")
          .eq("published", true)
          .in("site", ["keel", "all"])
          .order("date", { ascending: false });
        if (!error && data && data.length > 0) {
          cache = data.map(normalize);
          return cache;
        }
      }
    } catch {
      // fall through to local cache
    }
    cache = localPosts;
    return localPosts;
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}

export function useFramestudioBlogs() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchFramestudioBlogs().then((result) => {
      if (!cancelled) {
        setPosts(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { posts, loading };
}
