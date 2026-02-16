
# AttendancePro – Student Attendance Management System

## Overview
A professional, dashboard-style attendance management system with role-based access for Admins, Teachers, and Students. Built with React frontend and Lovable Cloud (Supabase) backend for authentication, database, and real-time data.

---

## User Roles & Access

### Admin
- Manage teachers and students (add, edit, remove)
- Create and manage classes/courses
- Assign teachers to classes
- View system-wide attendance reports and analytics
- Dashboard with overview stats (total students, attendance rate, etc.)

### Teacher
- Mark daily attendance for their assigned classes
- View attendance history for their classes
- Generate attendance reports (by date range, student, class)
- Dashboard with their classes' attendance summary

### Student
- View their own attendance record
- See attendance percentage per class
- Dashboard with personal attendance summary

---

## Pages & Features

### 1. Login Page
- Email/password authentication
- Role-based redirect after login (admin → admin dashboard, teacher → teacher dashboard, student → student dashboard)

### 2. Admin Dashboard
- Overview cards: total students, total teachers, overall attendance rate
- Quick links to manage classes, teachers, students
- Attendance trend chart (last 30 days)

### 3. Class Management (Admin)
- Create, edit, delete classes
- Assign teachers and enroll students to classes
- View class list with student count

### 4. User Management (Admin)
- Add/edit/remove teachers and students
- Table view with search and filters

### 5. Teacher Dashboard
- List of assigned classes with today's attendance status
- Quick "Mark Attendance" action per class

### 6. Mark Attendance Page (Teacher)
- Select class and date
- Student list with Present/Absent/Late toggle for each
- Bulk mark all present
- Submit attendance

### 7. Attendance Reports (Teacher & Admin)
- Filter by class, date range, student
- Table view with export option
- Attendance percentage summary

### 8. Student Dashboard
- Personal attendance percentage per class
- Calendar view showing present/absent days
- Recent attendance history list

---

## Database Structure
- **profiles** – user profile info (name, linked to auth)
- **user_roles** – role assignments (admin, teacher, student)
- **classes** – class/course info (name, description)
- **class_teachers** – teacher-to-class assignments
- **class_students** – student-to-class enrollments
- **attendance_records** – daily attendance entries (student, class, date, status)

---

## Design Style
- Professional dashboard layout with sidebar navigation
- Dark mode support
- Data-dense tables with search/filter capabilities
- Charts for attendance analytics (using Recharts)
- Clean card-based layout for dashboards
