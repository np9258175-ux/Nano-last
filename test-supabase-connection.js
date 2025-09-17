// Test the script for Supabase connection
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testSupabaseConnection() {
  console.log('🔍 Test Supabase connection...\n');

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

  // 2. Create a Supabase client
  console.log('2. Create Supabase client:');
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase client was created successfully');
    console.log('');

    // 3. Test users table access
    console.log('3. Test users table access:');
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1);

      if (usersError) {
        console.error('❌ users table access failed:', usersError);
        console.error('Error details:', {
          message: usersError.message,
          details: usersError.details,
          hint: usersError.hint,
          code: usersError.code
        });
      } else {
        console.log('✅ users table access was successful');
        console.log('Return data:', usersData);
      }
      console.log('');

    } catch (error) {
      console.error('❌ users table access exception:', error);
      console.log('');
    }

    // 4. Test history table access
    console.log('4. Test history table access:');
    try {
      const { data: historyData, error: historyError } = await supabase
        .from('history')
        .select('*')
        .limit(1);

      if (historyError) {
        console.error('❌ History table access failed:', historyError);
        console.error('Error details:', {
          message: historyError.message,
          details: historyError.details,
          hint: historyError.hint,
          code: historyError.code
        });
      } else {
        console.log('✅ history table access was successful');
        console.log('Return data:', historyData);
      }
      console.log('');

    } catch (error) {
      console.error('❌ history table access exception:', error);
      console.log('');
    }

    // 5. Test user insertion
    console.log('5. Test user insertion:');
    const testUserId = 'test_user_' + Date.now();
    const testEmail = 'test@example.com';
    
    try {
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .upsert({
          id: testUserId,
          email: testEmail,
          name: 'Test User',
          created_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
        .select();

      if (insertError) {
        console.error('❌ User insert failed:', insertError);
        console.error('Error details:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        });
      } else {
        console.log('✅ User insertion successfully');
        console.log('Inserted data:', insertData);
        
        // Clean up test data
        const { error: deleteError } = await supabase
          .from('users')
          .delete()
          .eq('id', testUserId);
        
        if (deleteError) {
          console.error('⚠️ Failed to clean up test data:', deleteError);
        } else {
          console.log('✅ Test data cleaned successfully');
        }
      }
      console.log('');

    } catch (error) {
      console.error('❌ User insertion exception:', error);
      console.log('');
    }

    // 6. Test history insertion
    console.log('6. Test history insert:');
    try {
      const { data: historyInsertData, error: historyInsertError } = await supabase
        .from('history')
        .insert({
          user_id: testUserId,
          type: 'test',
          prompt: 'Test prompt',
          result_image: 'test_image',
          created_at: new Date().toISOString()
        })
        .select();

      if (historyInsertError) {
        console.error('❌ History insert failed:', historyInsertError);
        console.error('Error details:', {
          message: historyInsertError.message,
          details: historyInsertError.details,
          hint: historyInsertError.hint,
          code: historyInsertError.code
        });
      } else {
        console.log('✅ History insertion successfully');
        console.log('Insert data:', historyInsertData);
        
        // Clean up test data
        const { error: deleteError } = await supabase
          .from('history')
          .delete()
          .eq('user_id', testUserId);
        
        if (deleteError) {
          console.error('⚠️ Failed to clean up test data:', deleteError);
        } else {
          console.log('✅ Test data cleaned successfully');
        }
      }
      console.log('');

    } catch (error) {
      console.error('❌ History insertion exception:', error);
      console.log('');
    }

  } catch (error) {
    console.error('❌ Supabase client creation failed:', error);
    return;
  }

  console.log('🔍 Supabase connection test completed');
}

// Run the test
testSupabaseConnection().catch(console.error);