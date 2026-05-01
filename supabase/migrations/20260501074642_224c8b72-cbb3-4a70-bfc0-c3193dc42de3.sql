
DO $$
DECLARE
  c RECORD;
BEGIN
  FOR c IN SELECT id FROM public.courses LOOP
    PERFORM public.update_completion_seal('course', c.id);
  END LOOP;
END$$;
