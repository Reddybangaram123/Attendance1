import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tsmvyhkerfqvrmkxkuqs.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  try {
    const { data: existingUser } = await supabase.auth.admin.listUsers();

    const adminExists = existingUser?.users?.some(
      user => user.email === 'kummithagopalreddy854@gmail.com'
    );

    if (adminExists) {
      console.log('Admin user already exists!');
      return;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: 'kummithagopalreddy854@gmail.com',
      password: 'Reddy@123',
      email_confirm: true
    });

    if (error) {
      console.error('Error creating admin user:', error.message);
      return;
    }

    console.log('Admin user created successfully!');
    console.log('Email: kummithagopalreddy854@gmail.com');
    console.log('Password: Reddy@123');
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

createAdminUser();
