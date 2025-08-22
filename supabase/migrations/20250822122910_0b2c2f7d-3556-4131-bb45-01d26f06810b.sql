-- First, expand the app_role enum to include new roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'dev';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'news_updater';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'announcements_manager';