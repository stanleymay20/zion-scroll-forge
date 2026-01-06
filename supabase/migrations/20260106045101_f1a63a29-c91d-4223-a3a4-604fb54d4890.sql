-- Allow anonymous users to view courses for public browsing
DROP POLICY IF EXISTS "Anyone can view courses" ON public.courses;

CREATE POLICY "Public can view courses" 
ON public.courses 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Allow anonymous users to view faculties for public browsing
DROP POLICY IF EXISTS "Anyone can view faculties" ON public.faculties;

CREATE POLICY "Public can view faculties" 
ON public.faculties 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Allow anonymous users to view degree programs for public browsing
DROP POLICY IF EXISTS "Anyone can view degree_programs" ON public.degree_programs;
DROP POLICY IF EXISTS "Authenticated users can view degree programs" ON public.degree_programs;

CREATE POLICY "Public can view degree programs" 
ON public.degree_programs 
FOR SELECT 
TO anon, authenticated
USING (true);