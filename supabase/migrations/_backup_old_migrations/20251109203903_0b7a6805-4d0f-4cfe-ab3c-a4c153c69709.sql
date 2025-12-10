-- Fix function search path security issue with CASCADE
DROP FUNCTION IF EXISTS update_module_notes_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_module_notes_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER module_notes_updated_at
BEFORE UPDATE ON module_notes
FOR EACH ROW
EXECUTE FUNCTION update_module_notes_updated_at();