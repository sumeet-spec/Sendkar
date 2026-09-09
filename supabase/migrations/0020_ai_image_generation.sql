-- AI-generated campaign header images
-- Stores the Supabase Storage public URL of the generated image so it can be
-- injected as the media component when the template is actually sent.
alter table templates add column if not exists header_image_url text;

-- Public storage bucket for AI-generated campaign images.
-- Created here as a policy stub; the bucket itself is created on first use
-- via the API route (storage.createBucket is idempotent).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('campaign-images', 'campaign-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- RLS: anyone can read public images; only service-role can insert/delete.
create policy "campaign_images_public_read" on storage.objects
  for select using (bucket_id = 'campaign-images');
