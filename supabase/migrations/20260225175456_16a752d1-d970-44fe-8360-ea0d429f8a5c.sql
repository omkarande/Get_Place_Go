-- Create storage bucket for place images
INSERT INTO storage.buckets (id, name, public) VALUES ('place-images', 'place-images', true);

-- Allow public read access
CREATE POLICY "Place images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'place-images');

-- Allow service role to upload (edge functions use service role)
CREATE POLICY "Service role can upload place images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'place-images');

CREATE POLICY "Service role can update place images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'place-images');
