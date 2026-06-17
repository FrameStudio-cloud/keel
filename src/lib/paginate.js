import { supabase } from "./supabase";

export async function paginateQuery({
  table,
  columns = "*",
  shopId,
  page = 0,
  pageSize = 50,
  orderBy = "created_at",
  ascending = false,
  searchTerm = "",
  searchColumns = [],
  extraFilters = [],
}) {
  let query = supabase.from(table).select(columns, { count: "exact" });

  query = query.eq("shop_id", shopId);

  if (searchTerm && searchColumns.length > 0) {
    const escaped = searchTerm.replace(/[%_]/g, "\\$&");
    const conditions = searchColumns.map(
      (col) => `${col}.ilike.%${escaped}%`
    );
    query = query.or(conditions.join(","));
  }

  for (const filter of extraFilters) {
    if (filter.not) {
      query = query.not(filter.column, filter.operator, filter.value);
    } else {
      query = query.eq(filter.column, filter.value);
    }
  }

  const from = page * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to).order(orderBy, { ascending });

  const { data, error, count } = await query;
  return { data, error, total: count ?? 0 };
}
