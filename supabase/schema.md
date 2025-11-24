# Database Schema - Course Sales SaaS

## Overview
This document describes the database schema for the course sales SaaS platform.

## Tables

### 1. profiles
Extends Supabase auth.users with additional user information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, REFERENCES auth.users(id) | User ID from Supabase Auth |
| email | text | NOT NULL | User email |
| full_name | text | | User's full name |
| avatar_url | text | | URL to user's avatar image |
| created_at | timestamptz | DEFAULT now() | Account creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

### 2. courses
Stores course information created by instructors.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Course ID |
| instructor_id | uuid | NOT NULL, REFERENCES profiles(id) ON DELETE CASCADE | Course creator/instructor |
| title | text | NOT NULL | Course title |
| description | text | | Course description |
| thumbnail_url | text | | URL to course thumbnail image |
| price | decimal(10,2) | NOT NULL, DEFAULT 0 | Course price in currency |
| is_published | boolean | NOT NULL, DEFAULT false | **Public visibility flag** |
| is_selling | boolean | NOT NULL, DEFAULT false | **Enable purchase button flag** |
| created_at | timestamptz | DEFAULT now() | Course creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

**Key Flags:**
- `is_published`: Controls whether the course is visible to students. Must be true for students to see the course.
- `is_selling`: Controls whether the "Purchase" button appears on the course landing page. When false, only manual invitation enrollment is possible.

### 3. sections
Organizes lessons into chapters/sections within a course.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Section ID |
| course_id | uuid | NOT NULL, REFERENCES courses(id) ON DELETE CASCADE | Parent course |
| title | text | NOT NULL | Section title |
| description | text | | Section description |
| order_index | integer | NOT NULL, DEFAULT 0 | Display order within course |
| created_at | timestamptz | DEFAULT now() | Section creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

### 4. lessons
Individual learning content units (video/text).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Lesson ID |
| section_id | uuid | NOT NULL, REFERENCES sections(id) ON DELETE CASCADE | Parent section |
| title | text | NOT NULL | Lesson title |
| content_type | text | NOT NULL, CHECK (content_type IN ('video', 'text')) | Type of content |
| video_url | text | | Video embed URL (YouTube, Vimeo, etc.) |
| text_content | text | | Markdown text content |
| order_index | integer | NOT NULL, DEFAULT 0 | Display order within section |
| duration_minutes | integer | | Estimated lesson duration |
| created_at | timestamptz | DEFAULT now() | Lesson creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

### 5. enrollments
Tracks which students have access to which courses (via purchase or invitation).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Enrollment ID |
| user_id | uuid | NOT NULL, REFERENCES profiles(id) ON DELETE CASCADE | Enrolled student |
| course_id | uuid | NOT NULL, REFERENCES courses(id) ON DELETE CASCADE | Enrolled course |
| enrollment_type | text | NOT NULL, CHECK (enrollment_type IN ('purchase', 'invitation')) | How access was granted |
| stripe_payment_id | text | | Stripe payment intent ID (if purchased) |
| invited_by | uuid | REFERENCES profiles(id) | Instructor who sent invitation (if invited) |
| enrolled_at | timestamptz | DEFAULT now() | Enrollment timestamp |

**Unique Constraint:** (user_id, course_id) - A user can only be enrolled once per course.

### 6. lesson_progress (Optional - for future enhancement)
Tracks student progress through lessons.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Progress record ID |
| user_id | uuid | NOT NULL, REFERENCES profiles(id) ON DELETE CASCADE | Student |
| lesson_id | uuid | NOT NULL, REFERENCES lessons(id) ON DELETE CASCADE | Lesson |
| completed | boolean | NOT NULL, DEFAULT false | Completion status |
| last_position | integer | | Last playback position (seconds) |
| completed_at | timestamptz | | Completion timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

**Unique Constraint:** (user_id, lesson_id)

## Row Level Security (RLS) Policies

### profiles
- **SELECT**: Public read access for basic profile info
- **INSERT**: Users can create their own profile on signup
- **UPDATE**: Users can only update their own profile

### courses
- **SELECT**: 
  - Public can view published courses (is_published = true) - basic info only
  - Instructors can view their own courses (all fields)
  - Enrolled students can view courses they have access to
- **INSERT**: Authenticated users can create courses
- **UPDATE**: Only course instructor can update
- **DELETE**: Only course instructor can delete

### sections
- **SELECT**: 
  - Public can view section titles for published courses
  - Enrolled students can view all section details
  - Instructors can view their own course sections
- **INSERT/UPDATE/DELETE**: Only course instructor

### lessons
- **SELECT**: 
  - Public can view lesson titles for published courses (content hidden)
  - Enrolled students can view full lesson content (video_url, text_content)
  - Instructors can view their own course lessons
- **INSERT/UPDATE/DELETE**: Only course instructor

### enrollments
- **SELECT**: Users can view their own enrollments, instructors can view enrollments for their courses
- **INSERT**: 
  - System (via Stripe webhook) for purchases
  - Course instructor for invitations
- **DELETE**: Course instructor can remove enrollments

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_published ON courses(is_published) WHERE is_published = true;
CREATE INDEX idx_sections_course ON sections(course_id, order_index);
CREATE INDEX idx_lessons_section ON lessons(section_id, order_index);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_unique ON enrollments(user_id, course_id);
```

## Workflow Examples

### Purchase Flow (is_selling = true)
1. Student views course landing page (LP)
2. Clicks "Purchase" button (visible because is_selling = true)
3. Redirected to Stripe Checkout
4. After payment, Stripe webhook creates enrollment record with type='purchase'
5. Student can now access learning player

### Invitation Flow (is_selling = false or true)
1. Instructor goes to course management
2. Enters student email in "Invite Student" form
3. System creates enrollment record with type='invitation'
4. Student can now access learning player (no payment required)

### Content Security
- Lesson titles are visible to everyone (for preview)
- Video URLs and text content are only accessible to enrolled students
- RLS policies enforce this at the database level
