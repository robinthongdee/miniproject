// supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://iqrariamhbtihwhqauvy.supabase.co' 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxcmFyaWFtaGJ0aWh3aHFhdXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODc0NjgsImV4cCI6MjA5MDQ2MzQ2OH0.ebSVHsSrV1S9ibtuT1LmfMJBi5on4FIT0xhGbi0PBO0' 

export const supabase = createClient(supabaseUrl, supabaseKey)