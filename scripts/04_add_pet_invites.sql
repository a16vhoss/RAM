-- Migration: Add Pet Invites Table
-- Description: Creates table to store temporary invite codes for Family Mode.

CREATE TABLE IF NOT EXISTS public.pet_invites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pet_id TEXT NOT NULL REFERENCES public.pets(pet_id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for pet_invites
ALTER TABLE public.pet_invites ENABLE ROW LEVEL SECURITY;

-- Creators can view and delete their own invites
CREATE POLICY "Users can manage invites they created"
ON public.pet_invites FOR ALL
USING (auth.uid() = created_by);

-- Anyone can read an invite if they have the code (for validation)
-- But we usually validate via a secure function with security definer if we want to be very strict,
-- or allow reading if we know the code.
-- Ideally, `SELECT` should be allowed if you know the code, but RLS applies to rows.
-- We can make a function for joining, so we might not need public select.
-- Let's allow owners of the pet to view invites too.
CREATE POLICY "Pet owners can view invites for their pets"
ON public.pet_invites FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.pet_owners
        WHERE pet_owners.pet_id = pet_invites.pet_id
        AND pet_owners.user_id = auth.uid()
    )
);
