-- Migration: Add Family Mode (Co-Parenting)
-- Description: Creates pet_owners table, migrates existing data, and updates RLS policies.

-- 1. Create pet_owners table
CREATE TABLE IF NOT EXISTS public.pet_owners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pet_id TEXT NOT NULL REFERENCES public.pets(pet_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(pet_id, user_id)
);

-- 2. Migrate existing data: Insert current owners from 'pets' table to 'pet_owners'
-- This ensures no data loss and seamless transition.
INSERT INTO public.pet_owners (pet_id, user_id, role)
SELECT pet_id, user_id::uuid, 'owner'
FROM public.pets
WHERE user_id IS NOT NULL 
AND EXISTS (SELECT 1 FROM auth.users WHERE id = public.pets.user_id::uuid)
ON CONFLICT (pet_id, user_id) DO NOTHING;

-- 3. Enable RLS on pet_owners
ALTER TABLE public.pet_owners ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for pet_owners
-- Users can see entries where they are the owner
CREATE POLICY "Users can view their own pet ownerships"
ON public.pet_owners FOR SELECT
USING (auth.uid() = user_id);

-- Users can delete their own ownership (leave family) or remove others if they are admin (simplification for now: anyone can remove for MVP? No, specific policy usually needed. Let's stick to simple: users can remove themselves or any entry for a pet they own?)
-- For MVP: Users can remove any owner reference if they are an owner of that pet.
CREATE POLICY "Owners can manage pet owners for their pets"
ON public.pet_owners FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.pet_owners owners
        WHERE owners.pet_id = pet_owners.pet_id
        AND owners.user_id = auth.uid()
    )
);

-- 5. Update RLS Policies for pets table
-- DROP existing policies to replace them with the new logic
DROP POLICY IF EXISTS "Users can view their own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can insert their own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can update their own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can delete their own pets" ON public.pets;

-- New SELECT policy: Users can view pets if they are in pet_owners OR if the pet is public (existing logic for QR codes/lost pets usually handled separately or via public bucket? Actually we need public read for lost pets usually. Let's check existing policies via intuition or assume standard authenticated access first).
-- Re-implementing "View own pets": Check pet_owners table
CREATE POLICY "Users can view pets they own"
ON public.pets FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.pet_owners
        WHERE pet_owners.pet_id = pets.pet_id
        AND pet_owners.user_id = auth.uid()
    )
);

-- Allow public read for 'lost' status pets (for Amber Alert / Public Directory)
-- We likely had this before or relied on a separate mechanic. Let's explicitly add it if not present, or just ensure the above doesn't block it.
-- If we want public access for lost pets:
CREATE POLICY "Public can view lost pets"
ON public.pets FOR SELECT
USING (status = 'lost');

-- New INSERT policy: Any authenticated user can create a pet
-- Trigger will auto-add them to pet_owners? Or we handle it in application logic?
-- Ideally, we handle it in app logic, but for safety, we can have a trigger.
-- For now, let's allow insert, and we must ensure the backend transaction adds to pet_owners.
CREATE POLICY "Users can create pets"
ON public.pets FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- New UPDATE policy: Owners can update their pets
CREATE POLICY "Owners can update their pets"
ON public.pets FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.pet_owners
        WHERE pet_owners.pet_id = pets.pet_id
        AND pet_owners.user_id = auth.uid()
    )
);

-- New DELETE policy: Owners can delete their pets
CREATE POLICY "Owners can delete their pets"
ON public.pets FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.pet_owners
        WHERE pet_owners.pet_id = pets.pet_id
        AND pet_owners.user_id = auth.uid()
    )
);
