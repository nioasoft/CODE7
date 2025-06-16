// Supabase configuration
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hglgkoyfxnvkshcveclt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbGdrb3lmeG52a3NoY3ZlY2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNzcyMDEsImV4cCI6MjA2NTY1MzIwMX0.Cx5MY8kQhr07zcfRsQWwdHyouIyMeBTnsYrOjNqcnFU';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };