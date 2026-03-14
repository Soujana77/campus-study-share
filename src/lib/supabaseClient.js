import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hgnizkqkfqhtjpypwwxw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhnbml6a3FrZnFodGpweXB3d3h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTkxNzYsImV4cCI6MjA4ODYzNTE3Nn0.-JUg7faY9Jw4EWUzRyLLA4HSOMzpiEpy_BBXoRjXibY";

export const supabase = createClient(supabaseUrl, supabaseKey);