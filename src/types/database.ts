export interface Profile {
  id: string;
  full_name: string;
  student_id: string;
  avatar_url: string | null;
  grade: number;
  batch: string;
  phone: string;
  parent_name: string;
  parent_phone: string;
  address: string;
  role: 'student' | 'admin';
  created_at: string;
}

export interface Class {
  id: number;
  grade: number;
  description: string;
}

export interface Batch {
  id: number;
  name: string;
  grade: number;
  schedule: string;
  start_date: string;
  is_active: boolean;
}

export interface Exam {
  id: number;
  title: string;
  grade: number;
  chapter: string;
  exam_type: 'chapter' | 'model' | 'series';
  duration_minutes: number;
  total_marks: number;
  pass_marks: number;
  is_published: boolean;
  created_at: string;
}

export interface Question {
  id: number;
  exam_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'a' | 'b' | 'c' | 'd';
  marks: number;
  question_order: number;
}

export interface ExamAttempt {
  id: number;
  student_id: string;
  exam_id: number;
  started_at: string;
  submitted_at: string | null;
  time_taken_seconds: number | null;
  total_correct: number | null;
  total_wrong: number | null;
  obtained_marks: number | null;
  total_marks: number | null;
  percentage: number | null;
  is_passed: boolean | null;
  status: 'in_progress' | 'completed' | 'expired';
}

export interface StudentAnswer {
  id: number;
  attempt_id: number;
  question_id: number;
  selected_answer: 'a' | 'b' | 'c' | 'd' | null;
  is_correct: boolean | null;
  marks_obtained: number;
}

export interface Routine {
  id: number;
  title: string;
  grade: number;
  chapter: string;
  routine_type: 'class' | 'exam';
  date: string;
  start_time: string;
  end_time: string;
  description: string;
  created_at: string;
}

export interface Notice {
  id: number;
  title: string;
  content: string;
  pdf_url: string | null;
  is_important: boolean;
  published_at: string;
}

export interface StudyMaterial {
  id: number;
  title: string;
  grade: number;
  chapter: string;
  material_type: 'notes' | 'mcq' | 'pdf' | 'model';
  file_url: string;
  description: string;
  created_at: string;
}

export interface GalleryItem {
  id: number;
  image_url: string;
  caption: string;
  category: string;
  uploaded_at: string;
}

export interface Admission {
  id: number;
  student_name: string;
  grade: number;
  phone: string;
  parent_name: string;
  parent_phone: string;
  address: string;
  batch_id: number;
  status: 'pending' | 'approved' | 'rejected';
  applied_at: string;
}

export interface Result {
  id: number;
  student_id: string;
  exam_id: number;
  attempt_id: number;
  is_published: boolean;
  published_at: string | null;
}

export interface ExamWithQuestions extends Exam {
  questions: Question[];
}

export interface AttemptWithDetails extends ExamAttempt {
  exam: Exam;
  answers: StudentAnswer[];
}

export interface ResultWithDetails extends Result {
  exam: Exam;
  attempt: ExamAttempt;
  student: Profile;
}
