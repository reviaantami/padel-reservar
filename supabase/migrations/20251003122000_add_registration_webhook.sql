-- Add registration webhook setting
INSERT INTO public.settings (key, value, created_at)
VALUES ('webhook_registration', '', NOW())
ON CONFLICT (key) DO NOTHING;