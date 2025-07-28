// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gsztedabulmsuakquxut.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzenRlZGFidWxtc3Vha3F1eHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2ODI3ODUsImV4cCI6MjA2OTI1ODc4NX0.MZmjJXJD5MDdTGm6VMaCrUJ9w6AICnbfq73fJi1f44Q';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
