# Attendance Management System

A comprehensive attendance tracking web application built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

### Admin Portal
- Secure login authentication
- Manual attendance entry with date selection
- Excel/CSV file upload for bulk attendance import
- Add new students to the system
- View all registered students
- Subject-wise attendance tracking

### Student Portal
- Public access - no login required
- Search attendance by roll number
- View daily attendance by date
- Track overall attendance percentage
- Color-coded attendance status (green for ≥75%, red for <75%)
- Subject-wise attendance breakdown

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Processing**: SheetJS (xlsx)
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Database Schema

### Students Table
- `id`: UUID (Primary Key)
- `roll_no`: Text (Unique)
- `name`: Text
- `created_at`: Timestamp

### Attendance Records Table
- `id`: UUID (Primary Key)
- `roll_no`: Text (Foreign Key)
- `date`: Date
- `subject`: Text
- `status`: Text (Present/Absent)
- `created_at`: Timestamp
- `created_by`: UUID (Admin ID)

## Setup Instructions

### 1. Create Admin Account

**Option A: Using the HTML utility file (Recommended)**

1. Open `create_admin.html` in a web browser
2. It will automatically create the admin account
3. Check the page for success/error message

**Option B: Using Supabase Dashboard**

1. Go to your Supabase Dashboard
2. Navigate to Authentication → Users
3. Click "Add User"
4. Enter:
   - Email: kummithagopalreddy854@gmail.com
   - Password: Reddy@123
5. Click "Create User"

### 2. Admin Login

Once the account is created:

1. Navigate to `/admin` route
2. Login with:
   - **Email**: kummithagopalreddy854@gmail.com
   - **Password**: Reddy@123

## Usage Guide

### Admin Functions

#### Manual Attendance Entry
1. Select date
2. Choose student from dropdown
3. Enter subjects with Present/Absent status
4. Click "Save Attendance"

#### Excel/CSV Upload
1. Prepare file with columns: RollNo, Date, Subject, Status
2. Click "Upload Excel/CSV" tab
3. Select your file
4. Click "Upload"

**Excel Format Example:**
```
RollNo          Date        Subject             Status
21A91A01A1      2025-10-28  Maths              Present
21A91A01A1      2025-10-28  Physics            Absent
21A91A01A2      2025-10-28  Chemistry          Present
```

#### Add New Student
1. Click "Add New Student" button
2. Enter roll number and name
3. Click "Save Student"

### Student Functions

1. Navigate to `/student` route
2. Enter roll number in search box
3. View attendance records by date
4. Check overall attendance percentage

## Sample Data

The database includes sample students and attendance records:

**Students:**
- 21A91A01A1 - Gopal
- 21A91A01A2 - Priya
- 21A91A01A3 - Rajesh

**Sample Attendance:** Available for 2025-10-28 with 7 subjects each

## Security Features

- Row Level Security (RLS) enabled on all tables
- Admin authentication required for data modifications
- Public read access for student attendance viewing
- Password protection with Supabase Auth
- Secure API key management through environment variables

## Project Structure

```
src/
├── components/
│   ├── AdminLogin.tsx          # Admin authentication
│   ├── AdminDashboard.tsx      # Admin main interface
│   ├── ManualAttendance.tsx    # Manual entry form
│   ├── AttendanceUpload.tsx    # Excel/CSV upload
│   └── StudentAttendance.tsx   # Student viewer
├── lib/
│   └── supabase.ts            # Supabase client config
├── utils/
│   └── calculateAttendance.ts # Attendance calculations
├── App.tsx                    # Main app with routing
└── main.tsx                   # Entry point
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Notes

- Database is already set up with tables and sample data
- Admin account needs to be created using provided instructions
- Students don't need accounts to view their attendance
- Excel uploads are validated for correct format
- Overall attendance is highlighted green (≥75%) or red (<75%)

## Support

For issues or questions, refer to ADMIN_SETUP.md for detailed admin setup instructions.
