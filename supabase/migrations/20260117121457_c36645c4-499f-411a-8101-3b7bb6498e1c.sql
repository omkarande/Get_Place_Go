-- Fix profiles table public exposure by requiring authentication for SELECT
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create new policy that only allows authenticated users to view profiles
CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);