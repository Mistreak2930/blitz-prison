-- Add missing columns to profiles table for user profile information
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS minecraft_username text,
ADD COLUMN IF NOT EXISTS discord_username text;