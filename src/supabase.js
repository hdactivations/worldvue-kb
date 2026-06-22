import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ntskylnweqfippwrurxy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50c2t5bG53ZXFmaXBwd3J1cnh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMjU1MDksImV4cCI6MjA5NzcwMTUwOX0.E6_dba1Tq5pltTdu_qSIicT-QZnFQ4nFYoOye2GF1hM'

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
