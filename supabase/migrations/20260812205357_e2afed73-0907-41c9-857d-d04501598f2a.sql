ALTER TABLE public.gbp_posts
  ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'gbp';

CREATE INDEX IF NOT EXISTS gbp_posts_channel_status_idx
  ON public.gbp_posts (channel, status, created_at DESC);