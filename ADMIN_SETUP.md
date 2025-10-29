# Admin Account Setup Instructions

To create the admin account for the Attendance Management System, follow these steps:

## Method 1: Using the Application (Recommended)

1. Start your application
2. Go to the Admin Portal (`/admin` route)
3. Click on "First time? Create admin account" at the bottom of the login form
4. Enter the following details:
   - Email: `kummithagopalreddy854@gmail.com`
   - Password: `Reddy@123`
5. Click "Create Account"
6. After successful creation, switch back to login mode and login with those credentials

## Method 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Click "Add User" or "Invite User"
4. Enter the following details:
   - Email: `kummithagopalreddy854@gmail.com`
   - Password: `Reddy@123`
5. Click "Create User"

## Enabling Password Security (Optional but Recommended)

To enable leaked password protection in Supabase:

1. Go to your Supabase Dashboard
2. Navigate to Authentication > Providers
3. Scroll down to "Password Settings"
4. Enable "Leaked Password Protection"
5. This will check passwords against HaveIBeenPwned.org to prevent use of compromised passwords

## Admin Login Credentials

Once the account is created, use these credentials to login:

- **Email**: kummithagopalreddy854@gmail.com
- **Password**: Reddy@123

## Important Notes

- The admin account has full access to:
  - Add students manually
  - Record daily attendance
  - Upload Excel/CSV files with bulk attendance data
  - View all registered students

- Students can view their attendance by entering their roll number at `/student` route
- No authentication is required for students to view their records

- For production use, consider:
  - Enabling leaked password protection in Supabase
  - Using stronger passwords with uppercase, lowercase, numbers, and special characters
  - Enabling email confirmation if needed
