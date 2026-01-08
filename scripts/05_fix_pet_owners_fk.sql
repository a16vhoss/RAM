
-- Migration: Fix pet_owners Foreign Key
-- Description: Changes the user_id FK to reference public.users instead of auth.users
-- Includes dynamic type checking to ensure compatibility with public.users schema.

DO $$ 
DECLARE 
    users_id_type text;
BEGIN
    -- 1. Drop existing constraint referring to auth.users
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'pet_owners_user_id_fkey') THEN
        ALTER TABLE public.pet_owners DROP CONSTRAINT pet_owners_user_id_fkey;
    END IF;

    -- 2. Check public.users.user_id type
    SELECT data_type INTO users_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'user_id' AND table_schema = 'public';

    RAISE NOTICE 'Detected public.users.user_id type: %', users_id_type;

    IF users_id_type = 'uuid' THEN
        -- If public.users uses UUID, ensure pet_owners uses UUID
        -- (It likely already is, but we ensure it)
        ALTER TABLE public.pet_owners ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
    ELSE
        -- If public.users uses TEXT (or anything else, assuming text-compatible), cast to TEXT
        ALTER TABLE public.pet_owners ALTER COLUMN user_id TYPE TEXT;
    END IF;

    -- 3. Add the new Foreign Key constraint to public.users
    ALTER TABLE public.pet_owners
    ADD CONSTRAINT pet_owners_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.users(user_id)
    ON DELETE CASCADE;

    RAISE NOTICE 'Successfully updated pet_owners Foreign Key to reference public.users';

END $$;
