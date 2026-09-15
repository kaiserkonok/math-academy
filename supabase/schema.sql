-- Math Solution & Exam Center Mymensingh
-- Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  student_id TEXT UNIQUE,
  avatar_url TEXT,
  grade INTEGER CHECK (grade BETWEEN 5 AND 10),
  batch TEXT,
  phone TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  address TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
  id SERIAL PRIMARY KEY,
  grade INTEGER UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Batches table
CREATE TABLE IF NOT EXISTS batches (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  grade INTEGER,
  schedule TEXT,
  start_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exams table
CREATE TABLE IF NOT EXISTS exams (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  grade INTEGER NOT NULL,
  chapter TEXT,
  exam_type TEXT CHECK (exam_type IN ('chapter', 'model', 'series')) NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  total_marks INTEGER NOT NULL DEFAULT 25,
  pass_marks INTEGER NOT NULL DEFAULT 10,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) CHECK (correct_answer IN ('a','b','c','d')) NOT NULL,
  marks INTEGER DEFAULT 1,
  question_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exam Attempts table
CREATE TABLE IF NOT EXISTS exam_attempts (
  id SERIAL PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  time_taken_seconds INTEGER,
  total_correct INTEGER DEFAULT 0,
  total_wrong INTEGER DEFAULT 0,
  total_skipped INTEGER DEFAULT 0,
  obtained_marks INTEGER DEFAULT 0,
  total_marks INTEGER DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,
  is_passed BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Answers table
CREATE TABLE IF NOT EXISTS student_answers (
  id SERIAL PRIMARY KEY,
  attempt_id INTEGER REFERENCES exam_attempts(id) ON DELETE CASCADE NOT NULL,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  selected_answer CHAR(1) CHECK (selected_answer IN ('a','b','c','d')),
  is_correct BOOLEAN,
  marks_obtained INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Results table (published results)
CREATE TABLE IF NOT EXISTS results (
  id SERIAL PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE NOT NULL,
  attempt_id INTEGER REFERENCES exam_attempts(id) ON DELETE CASCADE NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, exam_id)
);

-- Routines table
CREATE TABLE IF NOT EXISTS routines (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  grade INTEGER,
  chapter TEXT,
  routine_type TEXT CHECK (routine_type IN ('class', 'exam')) NOT NULL,
  date DATE,
  start_time TIME,
  end_time TIME,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notices table
CREATE TABLE IF NOT EXISTS notices (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  pdf_url TEXT,
  is_important BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study Materials table
CREATE TABLE IF NOT EXISTS study_materials (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  grade INTEGER NOT NULL,
  chapter TEXT,
  material_type TEXT CHECK (material_type IN ('notes', 'mcq', 'pdf', 'model')) NOT NULL,
  file_url TEXT,
  description TEXT,
  file_size TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id SERIAL PRIMARY KEY,
  image_url TEXT NOT NULL,
  caption TEXT,
  category TEXT CHECK (category IN ('classroom', 'events', 'students', 'facilities')),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admissions table
CREATE TABLE IF NOT EXISTS admissions (
  id SERIAL PRIMARY KEY,
  student_name TEXT NOT NULL,
  grade INTEGER NOT NULL,
  phone TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  address TEXT,
  batch_id INTEGER REFERENCES batches(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_grade ON profiles(grade);
CREATE INDEX IF NOT EXISTS idx_exams_grade ON exams(grade);
CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_student_id ON exam_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam_id ON exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_attempt_id ON student_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_results_student_id ON results(student_id);
CREATE INDEX IF NOT EXISTS idx_results_exam_id ON results(exam_id);
CREATE INDEX IF NOT EXISTS idx_routines_grade ON routines(grade);
CREATE INDEX IF NOT EXISTS idx_study_materials_grade ON study_materials(grade);
CREATE INDEX IF NOT EXISTS idx_admissions_status ON admissions(status);

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile, admins can read all.
-- Role is server-assigned (see handle_new_user trigger below) and can never
-- be set or changed by the user themselves: INSERT forces role='student' and
-- UPDATE rejects any change to the role column.
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id AND role = 'student');

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = public.my_role());

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Classes & batches are public catalog data (used by registration/admission forms)
CREATE POLICY "Anyone can view classes" ON classes
  FOR SELECT USING (TRUE);

CREATE POLICY "Anyone can view batches" ON batches
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage classes" ON classes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage batches" ON batches
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Exams: Published exams are visible to all, admins can manage
CREATE POLICY "Anyone can view published exams" ON exams
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Admins can manage exams" ON exams
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Questions: the base table (which holds correct_answer) is admin-only.
-- Students read questions through the exam_questions_public view below,
-- which excludes the correct_answer column.
DROP POLICY IF EXISTS "Anyone can view questions for published exams" ON questions;

CREATE POLICY "Admins can manage questions" ON questions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Exam Attempts: Students can view their own, admins can view all
CREATE POLICY "Students can view own attempts" ON exam_attempts
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can create own attempts" ON exam_attempts
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own attempts" ON exam_attempts
  FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Admins can view all attempts" ON exam_attempts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Student Answers: Students can view their own, admins can view all
CREATE POLICY "Students can view own answers" ON student_answers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM exam_attempts WHERE id = attempt_id AND student_id = auth.uid())
  );

CREATE POLICY "Students can insert own answers" ON student_answers
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM exam_attempts WHERE id = attempt_id AND student_id = auth.uid())
  );

CREATE POLICY "Students can update own answers" ON student_answers
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM exam_attempts WHERE id = attempt_id AND student_id = auth.uid())
  );

-- Results: Published results visible to students, admins can manage
CREATE POLICY "Students can view published results" ON results
  FOR SELECT USING (
    is_published = TRUE AND auth.uid() = student_id
  );

CREATE POLICY "Admins can manage results" ON results
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Routines: Visible to all authenticated users
CREATE POLICY "Anyone can view routines" ON routines
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage routines" ON routines
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Notices: Visible to all authenticated users
CREATE POLICY "Anyone can view notices" ON notices
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage notices" ON notices
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Study Materials: Visible to all authenticated users
CREATE POLICY "Anyone can view materials" ON study_materials
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage materials" ON study_materials
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Gallery: Visible to all
CREATE POLICY "Anyone can view gallery" ON gallery
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage gallery" ON gallery
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admissions: Users can insert, admins can manage
CREATE POLICY "Anyone can submit admission" ON admissions
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can manage admissions" ON admissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Settings: Admins only
CREATE POLICY "Admins can manage settings" ON settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Insert default classes
INSERT INTO classes (grade, description) VALUES
  (5, 'Foundation mathematics for Grade 5 students'),
  (6, 'Building strong mathematical fundamentals'),
  (7, 'Intermediate level mathematics'),
  (8, 'Advanced pre-secondary mathematics'),
  (9, 'Secondary school mathematics preparation'),
  (10, 'SSC examination preparation')
ON CONFLICT (grade) DO NOTHING;

-- Insert default batches
INSERT INTO batches (name, grade, schedule, start_date, is_active) VALUES
  ('Morning Batch', 5, 'Sat-Wed 9:00 AM - 11:00 AM', '2024-01-01', TRUE),
  ('Afternoon Batch', 5, 'Sat-Wed 2:00 PM - 4:00 PM', '2024-01-01', TRUE),
  ('Morning Batch', 6, 'Sat-Wed 9:00 AM - 11:00 AM', '2024-01-01', TRUE),
  ('Afternoon Batch', 6, 'Sat-Wed 2:00 PM - 4:00 PM', '2024-01-01', TRUE),
  ('Morning Batch', 7, 'Thu-Sat 9:00 AM - 12:00 PM', '2024-01-01', TRUE),
  ('Evening Batch', 7, 'Thu-Sat 5:00 PM - 8:00 PM', '2024-01-01', TRUE),
  ('Morning Batch', 8, 'Thu-Sat 9:00 AM - 12:00 PM', '2024-01-01', TRUE),
  ('Evening Batch', 8, 'Thu-Sat 5:00 PM - 8:00 PM', '2024-01-01', TRUE),
  ('Morning Batch', 9, 'Daily 6:00 AM - 9:00 AM', '2024-01-01', TRUE),
  ('Evening Batch', 9, 'Daily 4:00 PM - 7:00 PM', '2024-01-01', TRUE),
  ('Morning Batch', 10, 'Daily 6:00 AM - 9:00 AM', '2024-01-01', TRUE),
  ('Evening Batch', 10, 'Daily 4:00 PM - 7:00 PM', '2024-01-01', TRUE)
ON CONFLICT DO NOTHING;

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('site_name', '"Math Solution & Exam Center Mymensingh"'),
  ('site_description', '"Empowering students with mathematical excellence since 2015"'),
  ('contact_email', '"info@mathacademy.com"'),
  ('contact_phone', '"+8801XXXXXXXXX"'),
  ('contact_address', '"Station Road, Mymensingh, Bangladesh"'),
  ('facebook_url', '"https://facebook.com/mathacademy"'),
  ('current_academic_year', '"2024"'),
  ('current_semester', '"1st"')
ON CONFLICT (key) DO NOTHING;

-- Helper: current user's role, bypassing RLS to avoid policy recursion.
-- Used by the UPDATE policy to prove the role column was not changed.
CREATE OR REPLACE FUNCTION public.my_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Auto-create a student profile (with server-generated Student ID) whenever
-- a new auth user signs up. Registration details are passed as user metadata
-- by the signup endpoint. Role is ALWAYS 'student' here — privilege
-- escalation via crafted metadata is impossible by construction.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_sid TEXT;
  tries INT := 0;
  meta_grade INT;
BEGIN
  BEGIN
    meta_grade := (NEW.raw_user_meta_data->>'grade')::INT;
  EXCEPTION WHEN OTHERS THEN
    meta_grade := NULL;
  END;

  LOOP
    new_sid := 'MATH-' || EXTRACT(YEAR FROM NOW())::TEXT || '-'
      || LPAD((floor(random() * 9000) + 1000)::INT::TEXT, 4, '0');
    BEGIN
      INSERT INTO public.profiles (id, full_name, student_id, grade, batch, phone, parent_name, role, is_active)
      VALUES (
        NEW.id,
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), 'Student'),
        new_sid,
        meta_grade,
        NULLIF(NEW.raw_user_meta_data->>'batch', ''),
        NULLIF(NEW.raw_user_meta_data->>'phone', ''),
        NULLIF(NEW.raw_user_meta_data->>'parent_name', ''),
        'student',
        TRUE
      );
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      tries := tries + 1;
      IF tries > 10 THEN RAISE; END IF;
    END;
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Public question view: everything students need to TAKE an exam,
-- minus the correct_answer column. Served through PostgREST like a table.
CREATE OR REPLACE VIEW public.exam_questions_public AS
  SELECT
    q.id, q.exam_id, q.question_text,
    q.option_a, q.option_b, q.option_c, q.option_d,
    q.marks, q.question_order
  FROM public.questions q
  JOIN public.exams e ON e.id = q.exam_id
  WHERE e.is_published = TRUE;

GRANT SELECT ON public.exam_questions_public TO anon, authenticated;
