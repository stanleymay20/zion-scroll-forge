-- STUDENTS & APPLICATION SYSTEM
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  full_name text,
  email text,
  phone text,
  gender text,
  dob date,
  country text,
  address text,
  photo_url text,
  application_status text default 'pending',
  admission_letter_url text,
  created_at timestamptz default now()
);

create table if not exists student_documents (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  doc_type text,
  file_url text,
  verified boolean default false,
  uploaded_at timestamptz default now()
);

create table if not exists transcripts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id),
  course_id uuid references courses(id),
  grade text,
  score int,
  completed_at timestamptz,
  faculty text
);

create table if not exists graduations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id),
  ceremony_date date,
  certificate_url text,
  honors text
);

-- FACULTY SYSTEM
create table if not exists faculty_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  full_name text,
  title text,
  bio text,
  created_at timestamptz default now()
);

create table if not exists teaching_assignments (
  id uuid primary key default gen_random_uuid(),
  faculty_user_id uuid references auth.users(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  role text default 'instructor',
  created_at timestamptz default now()
);

-- LEARNING MATERIALS
create table if not exists learning_materials (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references course_modules(id) on delete cascade,
  kind text,
  title text,
  url text,
  meta jsonb,
  created_at timestamptz default now()
);

-- ASSIGNMENTS & GRADING
create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  module_id uuid references course_modules(id) on delete set null,
  title text,
  description text,
  type text,
  total_points int,
  due_at timestamptz,
  published boolean default false,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create table if not exists quiz_questions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references assignments(id) on delete cascade,
  kind text,
  prompt text,
  options text[] null,
  answer text,
  points int default 1,
  order_index int default 0
);

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references assignments(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  answers jsonb,
  file_url text,
  submitted_at timestamptz default now(),
  status text default 'submitted'
);

create table if not exists grades (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references submissions(id) on delete cascade,
  grader_user_id uuid references auth.users(id),
  score int,
  feedback text,
  rubric jsonb,
  graded_at timestamptz default now()
);

create table if not exists rubric_criteria (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references assignments(id) on delete cascade,
  label text,
  weight int default 1,
  description text
);

-- VIEWS
create or replace view student_gpa as
select
  s.id as student_id,
  round(avg(t.score)::numeric, 2) as gpa
from transcripts t
join students s on s.id = t.student_id
group by s.id;

create or replace view v_course_gradebook as
select 
  a.course_id,
  a.id as assignment_id,
  a.title as assignment_title,
  s.user_id as student_user_id,
  g.score,
  a.total_points,
  g.feedback,
  g.graded_at
from assignments a
left join submissions s on s.assignment_id = a.id
left join grades g on g.submission_id = s.id;

create or replace view v_grading_queue as
select 
  s.id as submission_id,
  s.assignment_id,
  a.title as assignment_title,
  a.course_id,
  s.user_id as student_user_id,
  s.submitted_at
from submissions s
join assignments a on a.id = s.assignment_id
left join grades g on g.submission_id = s.id
where g.id is null;

-- RLS POLICIES
alter table students enable row level security;
alter table student_documents enable row level security;
alter table transcripts enable row level security;
alter table graduations enable row level security;
alter table faculty_profiles enable row level security;
alter table teaching_assignments enable row level security;
alter table learning_materials enable row level security;
alter table assignments enable row level security;
alter table quiz_questions enable row level security;
alter table submissions enable row level security;
alter table grades enable row level security;
alter table rubric_criteria enable row level security;

-- Students
create policy "students read own record" on students for select using (auth.uid() = user_id);
create policy "students insert own record" on students for insert with check (auth.uid() = user_id);
create policy "students update own record" on students for update using (auth.uid() = user_id);
create policy "admin read all students" on students for select using (coalesce((auth.jwt() ->> 'role'),'') = 'admin');
create policy "admin update students" on students for update using (coalesce((auth.jwt() ->> 'role'),'') = 'admin');

-- Student documents
create policy "students manage own docs" on student_documents for all using (
  exists (select 1 from students where students.id = student_documents.student_id and students.user_id = auth.uid())
);
create policy "admin view all docs" on student_documents for select using (coalesce((auth.jwt() ->> 'role'),'') = 'admin');

-- Transcripts
create policy "students view own transcript" on transcripts for select using (
  exists (select 1 from students where students.id = transcripts.student_id and students.user_id = auth.uid())
);
create policy "faculty insert transcripts" on transcripts for insert with check (
  coalesce((auth.jwt() ->> 'role'),'') in ('admin', 'faculty')
);

-- Graduations
create policy "view own graduation" on graduations for select using (
  exists (select 1 from students where students.id = graduations.student_id and students.user_id = auth.uid())
);
create policy "public view graduations" on graduations for select using (true);

-- Faculty
create policy "faculty read own profile" on faculty_profiles for select using (auth.uid() = user_id);
create policy "public view faculty" on faculty_profiles for select using (true);

-- Teaching assignments
create policy "faculty see own assignments" on teaching_assignments for select using (faculty_user_id = auth.uid());
create policy "admin manage assignments" on teaching_assignments for all using (coalesce((auth.jwt() ->> 'role'),'') = 'admin');

-- Materials
create policy "enrolled students read materials" on learning_materials for select using (
  exists (
    select 1 from course_modules m 
    join enrollments e on e.course_id = m.course_id 
    where m.id = learning_materials.module_id and e.user_id = auth.uid()
  )
  or exists (
    select 1 from course_modules m 
    join teaching_assignments t on t.course_id = m.course_id 
    where m.id = learning_materials.module_id and t.faculty_user_id = auth.uid()
  )
);

create policy "faculty insert materials" on learning_materials for insert with check (
  exists (
    select 1 from course_modules m 
    join teaching_assignments t on t.course_id = m.course_id 
    where m.id = learning_materials.module_id and t.faculty_user_id = auth.uid()
  )
);

-- Assignments
create policy "read assignments if enrolled or teaching" on assignments for select using (
  exists (select 1 from enrollments e where e.course_id = assignments.course_id and e.user_id = auth.uid())
  or exists (select 1 from teaching_assignments t where t.course_id = assignments.course_id and t.faculty_user_id = auth.uid())
);

create policy "faculty manage assignments" on assignments for all using (
  exists (select 1 from teaching_assignments t where t.course_id = assignments.course_id and t.faculty_user_id = auth.uid())
);

-- Quiz questions
create policy "read questions if enrolled or teaching" on quiz_questions for select using (
  exists (
    select 1 from assignments a 
    join enrollments e on e.course_id = a.course_id 
    where a.id = quiz_questions.assignment_id and e.user_id = auth.uid() and a.published = true
  )
  or exists (
    select 1 from assignments a 
    join teaching_assignments t on t.course_id = a.course_id 
    where a.id = quiz_questions.assignment_id and t.faculty_user_id = auth.uid()
  )
);

create policy "faculty manage questions" on quiz_questions for all using (
  exists (
    select 1 from assignments a 
    join teaching_assignments t on t.course_id = a.course_id 
    where a.id = quiz_questions.assignment_id and t.faculty_user_id = auth.uid()
  )
);

-- Submissions
create policy "students submit own" on submissions for insert with check (user_id = auth.uid());
create policy "students read own submissions" on submissions for select using (user_id = auth.uid());
create policy "faculty read course submissions" on submissions for select using (
  exists (
    select 1 from assignments a 
    join teaching_assignments t on t.course_id = a.course_id
    where a.id = submissions.assignment_id and t.faculty_user_id = auth.uid()
  )
);
create policy "faculty update submissions" on submissions for update using (
  exists (
    select 1 from assignments a 
    join teaching_assignments t on t.course_id = a.course_id
    where a.id = submissions.assignment_id and t.faculty_user_id = auth.uid()
  )
);

-- Grades
create policy "students read own grades" on grades for select using (
  exists (select 1 from submissions s where s.id = grades.submission_id and s.user_id = auth.uid())
);

create policy "faculty write grades" on grades for all using (
  exists (
    select 1 from submissions s 
    join assignments a on a.id = s.assignment_id
    join teaching_assignments t on t.course_id = a.course_id
    where s.id = grades.submission_id and t.faculty_user_id = auth.uid()
  )
);

-- Enable realtime
alter publication supabase_realtime add table students;
alter publication supabase_realtime add table submissions;
alter publication supabase_realtime add table grades;
alter publication supabase_realtime add table assignments;