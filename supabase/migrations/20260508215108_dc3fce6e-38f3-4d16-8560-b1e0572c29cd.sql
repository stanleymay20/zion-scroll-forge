
INSERT INTO storage.buckets (id, name, public) VALUES ('lecture-recordings', 'lecture-recordings', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own lecture recordings" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'lecture-recordings' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users view own lecture recordings" ON storage.objects
FOR SELECT USING (
  bucket_id = 'lecture-recordings' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users delete own lecture recordings" ON storage.objects
FOR DELETE USING (
  bucket_id = 'lecture-recordings' AND auth.uid()::text = (storage.foldername(name))[1]
);
