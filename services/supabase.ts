
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mgplwaowwhxybvhiahej.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_lDfYZI1tfWttZTKYjzV8DQ_NlhL-LIJ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
