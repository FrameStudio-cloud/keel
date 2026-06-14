import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const supabaseUrl = 'https://yphyvahluvxddkwhevwl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwaHl2YWhsdXZ4ZGRrd2hldndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2OTE4MzksImV4cCI6MjA5NTI2NzgzOX0.b9MOYYrFS0AnnTy6u96sqAePVkub9cUKH_ygEVfSSbw'

const supabase = createClient(supabaseUrl, supabaseKey)

const sql = readFileSync(resolve(__dirname, '..', 'supabase', 'migrations', '20260614_add_barcode_column.sql'), 'utf8')

const { data, error } = await supabase.rpc('exec_sql', { query: sql })
if (error) {
  console.error('exec_sql failed:', error)
  const { data: d2, error: e2 } = await supabase.rpc('pg_query', { query: sql })
  if (e2) {
    console.error('pg_query failed:', e2)
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ query: sql }),
    })
    console.log('rpc result:', res.status, await res.text())
  } else {
    console.log('pg_query OK:', d2)
  }
} else {
  console.log('exec_sql OK:', data)
}
