// Supabase diagnostic script
// Used to debug history loading issues

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function diagnoseSupabase() {
  console.log('🔍 Start Supabase Diagnosis...\n');

  // 1. Check environment variables
  console.log('1. Check environment variables:');
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl) {
    console.error('❌ SUPABASE_URL not set');
    return;
  }
  if (!supabaseAnonKey) {
    console.error('❌ SUPABASE_ANON_KEY not set');
    return;
  }
  
  console.log('✅ SUPABASE_URL:', supabaseUrl);
  console.log('✅ SUPABASE_ANON_KEY:', supabaseAnonKey.substring(0, 20) + '...');
  console.log('');

  // 2. Test Supabase connection
  console.log('2. Test Supabase connection:');
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase client was created successfully');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('history')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection test failed:', error);
      return;
    }
    
    console.log('✅ Database connection test succeeded');
    console.log('');

  } catch (error) {
    console.error('❌ Supabase client creation failed:', error);
    return;
  }

  // 3. Check the database table structure
  console.log('3. Check the database table structure:');
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Check whether the history table exists
    const { data: tableInfo, error: tableError } = await supabase
      .from('history')
      .select('*')
      .limit(0);
    
    if (tableError) {
      console.error('❌ history table access failed:', tableError);
      console.log('💡 Possible reasons:');
      console.log(' - history table does not exist');
      console.log(' - insufficient permission');
      console.log(' - RLS (Row Level Security) policy issue');
      return;
    }
    
    console.log('✅ history table exists and is accessible');
    console.log('');

  } catch (error) {
    console.error('❌ Table structure check failed:', error);
    return;
  }

  // 4. Test the user ID format
  console.log('4. Test user ID format:');
  const testUserId = 'google_YmlsbGM4MTI4QGdtYWlsLmNvbQ'; // User ID from the error log
  console.log('Test User ID:', testUserId);
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Try to query the user's history
    const { data: historyData, error: historyError } = await supabase
      .from('history')
      .select('*')
      .eq('user_id', testUserId)
      .limit(5);
    
    if (historyError) {
      console.error('❌ Query failed:', historyError);
      console.log('💡 Possible problems:');
      console.log(' - User ID format is incorrect');
      console.log(' - database field type mismatch');
      console.log(' - RLS policy blocks access');
    } else {
      console.log('✅ Query Successfully');
      console.log('Return the number of records:', historyData?.length || 0);
      if (historyData && historyData.length > 0) {
        console.log('First record example:', {
          id: historyData[0].id,
          user_id: historyData[0].user_id,
          type: historyData[0].type,
          created_at: historyData[0].created_at
        });
      }
    }
    console.log('');

  } catch (error) {
    console.error('❌ User ID test failed:', error);
  }

  // 5. Check RLS policy
  console.log('5. RLS policy recommendations:');
  console.log('💡 If you encounter permission issues, please check the following RLS policies:');
  console.log('');
  console.log('-- Enable RLS');
  console.log('ALTER TABLE history ENABLE ROW LEVEL SECURITY;');
  console.log('');
  console.log('-- Allows users to view their own history');
  console.log('CREATE POLICY "Users can view own history" ON history');
  console.log(' FOR SELECT USING (auth.uid()::text = user_id);');
  console.log('');
  console.log('-- Allows the user to insert his or her history');
  console.log('CREATE POLICY "Users can insert own history" ON history');
  console.log(' FOR INSERT WITH CHECK (auth.uid()::text = user_id);');
  console.log('');
  console.log('-- Allows users to delete their own history');
  console.log('CREATE POLICY "Users can delete own history" ON history');
  console.log(' FOR DELETE USING (auth.uid()::text = user_id);');
  console.log('');

  // 6. Test and repair query
  console.log('6. Test the fixed query:');
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Use the fixed query method (add restrictions and error handling)
    const { data: fixedData, error: fixedError } = await supabase
      .from('history')
      .select('*')
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (fixedError) {
      console.error('❌ The query still fails after repair:', fixedError);
    } else {
      console.log('✅ Query successful after repair');
      console.log('Return the number of records:', fixedData?.length || 0);
    }
    console.log('');

  } catch (error) {
    console.error('❌ The query test failed after repair:', error);
  }

  console.log('🔍 Diagnosis is completed');
}

// Run diagnostics
diagnoseSupabase().catch(console.error);