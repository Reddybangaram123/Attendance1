# Attendance Management System

A comprehensive attendance tracking web application built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

### Admin Portal
- Secure login authentication
- **Three main sections**: Attendance, Manage Students, Analytics
- **Attendance Management**:
  - Manual attendance entry with date selection
  - Excel/CSV file upload for bulk attendance import
  - Subject-wise entry with Present/Absent status
- **Student Management**:
  - Year-wise organization (Year 1, 2, 3, 4)
  - Add individual students with year selection
  - Bulk upload students via CSV/Excel with year information
  - View and delete students by year
- **Analytics Dashboard**:
  - Subject-wise attendance percentage for each student
  - Overall attendance percentage (average of all subjects)
  - Year-wise analytics view
  - Color-coded attendance status (green ≥75%, yellow 50-74%, red <50%)
  - Export analytics to CSV

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
- `year`: Integer (1-4) - Academic year
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

### Admin Portal Navigation

The admin portal has three main sections:

#### 1. Attendance Tab
**Manual Entry:**
1. Select date and student from dropdowns
2. Enter subjects with Present/Absent status
3. Click "Save Attendance"

**Bulk Upload:**
1. Prepare CSV/Excel file with columns: RollNo, Date, Subject, Status
2. Click "Upload Excel/CSV" sub-tab
3. Select your file
4. Click "Upload"

**Excel Format Example:**
```
RollNo          Date        Subject             Status
21A91A01A1      2025-10-28  Maths              Present
21A91A01A1      2025-10-28  Physics            Absent
21A91A01A2      2025-10-28  Chemistry          Present
```

#### 2. Manage Students Tab
**Add Individual Students:**
1. Fill in Roll Number, Name, and Year
2. Click "Add Student"

**Bulk Upload Students:**
1. Prepare CSV/Excel file with columns: RollNo, Name, Year
2. Click file upload area or drag & drop
3. Preview the data in the table
4. Click "Upload X Students"

**Student Bulk Upload Format:**
```
RollNo           Name              Year
21A91A01A1       John Doe          1
21A91A01A2       Jane Smith        2
21A91A02A1       Bob Johnson       3
```

**View Students by Year:**
1. Click year tabs (Year 1, Year 2, Year 3, Year 4)
2. View all students in that year
3. Delete students using the delete icon

#### 3. Analytics Tab
**View Attendance Analytics:**
1. Select a year to view its analytics
2. View subject-wise attendance percentages for each student
3. See overall attendance percentage (average of all subjects)
4. Color-coded status indicators:
   - Green (≥75%): Good attendance
   - Yellow (50-74%): Fair attendance
   - Red (<50%): Low attendance
5. Export analytics to CSV using the Export button

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
│   ├── AdminLogin.tsx              # Admin authentication
│   ├── AdminDashboard.tsx          # Admin main interface with 3 tabs
│   ├── ManualAttendance.tsx        # Manual attendance entry form
│   ├── AttendanceUpload.tsx        # Excel/CSV attendance upload
│   ├── ManageStudents.tsx          # Year-wise student management
│   ├── StudentBulkUpload.tsx       # Bulk student upload via CSV/Excel
│   ├── AttendanceAnalytics.tsx     # Attendance analytics & percentages
│   └── StudentAttendance.tsx       # Student portal viewer
├── lib/
│   └── supabase.ts                # Supabase client config
├── utils/
│   └── calculateAttendance.ts     # Attendance calculations
├── App.tsx                        # Main app with routing
└── main.tsx                       # Entry point
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

## Key Features & Notes

### Year-Wise Organization
- Students are organized by academic year (Year 1-4)
- Each student must have a year assigned during creation
- Analytics can be filtered by year for better insights

### Attendance Analytics
- **Subject-wise percentages**: Shows attendance % for each subject separately
- **Overall percentage**: Calculated as the average of all subjects' attendance percentages
- Color-coded indicators help identify attendance trends quickly
- CSV export functionality for reports and record-keeping

### Bulk Operations
- Upload multiple students at once with year information
- Upload multiple attendance records in a single batch
- CSV/Excel format validation with preview before upload
- File format ensures data integrity

### Data Organization
- Database has built-in year column for scalability
- Sample data provided for testing (Year 1 students)
- Existing students are assigned to Year 1 by default
- All new uploads require year specification

## Support

For issues or questions, refer to ADMIN_SETUP.md for detailed admin setup instructions.
