
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

    -- 0. Drop dependent RLS policies (All of them)
    
    -- dependent on pet_owners.user_id:
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pet_owners' AND policyname = 'Users can view their own pet ownerships') THEN
        DROP POLICY "Users can view their own pet ownerships" ON public.pet_owners;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pet_owners' AND policyname = 'Owners can manage pet owners for their pets') THEN
        DROP POLICY "Owners can manage pet owners for their pets" ON public.pet_owners;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pets' AND policyname = 'Users can view pets they own') THEN
        DROP POLICY "Users can view pets they own" ON public.pets;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pets' AND policyname = 'Owners can update their pets') THEN
        DROP POLICY "Owners can update their pets" ON public.pets;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pets' AND policyname = 'Owners can delete their pets') THEN
        DROP POLICY "Owners can delete their pets" ON public.pets;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pet_invites' AND policyname = 'Pet owners can view invites for their pets') THEN
        DROP POLICY "Pet owners can view invites for their pets" ON public.pet_invites;
    END IF;

    -- dependent on pet_invites.created_by (checking just in case):
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pet_invites' AND policyname = 'Users can manage invites they created') THEN
        DROP POLICY "Users can manage invites they created" ON public.pet_invites;
    END IF;


    -- 1. Check public.users.user_id type
    SELECT data_type INTO users_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'user_id' AND table_schema = 'public';

    RAISE NOTICE 'Detected public.users.user_id type: %', users_id_type;

    -- ===========================
    -- Fix pet_owners.user_id
    -- ===========================
    
    -- Drop old FK
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'pet_owners_user_id_fkey') THEN
        ALTER TABLE public.pet_owners DROP CONSTRAINT pet_owners_user_id_fkey;
    END IF;

    -- Alter Column
    IF users_id_type = 'uuid' THEN
        ALTER TABLE public.pet_owners ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
    ELSE
        ALTER TABLE public.pet_owners ALTER COLUMN user_id TYPE TEXT;
    END IF;

    -- Add New FK
    ALTER TABLE public.pet_owners
    ADD CONSTRAINT pet_owners_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.users(user_id)
    ON DELETE CASCADE;


    -- ===========================
    -- Fix pet_invites.created_by (Wait, this also likely references auth.users currently)
    -- ===========================

    -- Drop old FK
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'pet_invites_created_by_fkey') THEN
        ALTER TABLE public.pet_invites DROP CONSTRAINT pet_invites_created_by_fkey;
    END IF;

    -- Alter Column
    IF users_id_type = 'uuid' THEN
        ALTER TABLE public.pet_invites ALTER COLUMN created_by TYPE UUID USING created_by::uuid;
    ELSE
        ALTER TABLE public.pet_invites ALTER COLUMN created_by TYPE TEXT;
    END IF;

    -- Add New FK
    ALTER TABLE public.pet_invites
    ADD CONSTRAINT pet_invites_created_by_fkey
    FOREIGN KEY (created_by)
    REFERENCES public.users(user_id)
    ON DELETE CASCADE;


    -- ===========================
    -- Recreate RLS Policies
    -- ===========================
    
    -- 1. pet_owners SELECT
    IF users_id_type = 'text' THEN
        EXECUTE 'CREATE POLICY "Users can view their own pet ownerships" ON public.pet_owners FOR SELECT USING (auth.uid()::text = user_id)';
    ELSE
        EXECUTE 'CREATE POLICY "Users can view their own pet ownerships" ON public.pet_owners FOR SELECT USING (auth.uid() = user_id)';
    END IF;

    -- 2. pet_owners ALL
    IF users_id_type = 'text' THEN
        EXECUTE 'CREATE POLICY "Owners can manage pet owners for their pets" ON public.pet_owners FOR ALL USING (EXISTS (SELECT 1 FROM public.pet_owners owners WHERE owners.pet_id = pet_owners.pet_id AND owners.user_id = auth.uid()::text))';
    ELSE
         EXECUTE 'CREATE POLICY "Owners can manage pet owners for their pets" ON public.pet_owners FOR ALL USING (EXISTS (SELECT 1 FROM public.pet_owners owners WHERE owners.pet_id = pet_owners.pet_id AND owners.user_id = auth.uid()))';
    END IF;

    -- 3. pets SELECT
    IF users_id_type = 'text' THEN
        EXECUTE 'CREATE POLICY "Users can view pets they own" ON public.pets FOR SELECT USING (EXISTS (SELECT 1 FROM public.pet_owners WHERE pet_owners.pet_id = pets.pet_id AND pet_owners.user_id = auth.uid()::text))';
    ELSE
        EXECUTE 'CREATE POLICY "Users can view pets they own" ON public.pets FOR SELECT USING (EXISTS (SELECT 1 FROM public.pet_owners WHERE pet_owners.pet_id = pets.pet_id AND pet_owners.user_id = auth.uid()))';
    END IF;

    -- 4. pets UPDATE
    IF users_id_type = 'text' THEN
        EXECUTE 'CREATE POLICY "Owners can update their pets" ON public.pets FOR UPDATE USING (EXISTS (SELECT 1 FROM public.pet_owners WHERE pet_owners.pet_id = pets.pet_id AND pet_owners.user_id = auth.uid()::text))';
    ELSE
        EXECUTE 'CREATE POLICY "Owners can update their pets" ON public.pets FOR UPDATE USING (EXISTS (SELECT 1 FROM public.pet_owners WHERE pet_owners.pet_id = pets.pet_id AND pet_owners.user_id = auth.uid()))';
    END IF;

    -- 5. pets DELETE
    IF users_id_type = 'text' THEN
        EXECUTE 'CREATE POLICY "Owners can delete their pets" ON public.pets FOR DELETE USING (EXISTS (SELECT 1 FROM public.pet_owners WHERE pet_owners.pet_id = pets.pet_id AND pet_owners.user_id = auth.uid()::text))';
    ELSE
        EXECUTE 'CREATE POLICY "Owners can delete their pets" ON public.pets FOR DELETE USING (EXISTS (SELECT 1 FROM public.pet_owners WHERE pet_owners.pet_id = pets.pet_id AND pet_owners.user_id = auth.uid()))';
    END IF;

    -- 6. pet_invites: Pet owners can view invites
    IF users_id_type = 'text' THEN
        EXECUTE 'CREATE POLICY "Pet owners can view invites for their pets" ON public.pet_invites FOR SELECT USING (EXISTS (SELECT 1 FROM public.pet_owners WHERE pet_owners.pet_id = pet_invites.pet_id AND pet_owners.user_id = auth.uid()::text))';
    ELSE
        EXECUTE 'CREATE POLICY "Pet owners can view invites for their pets" ON public.pet_invites FOR SELECT USING (EXISTS (SELECT 1 FROM public.pet_owners WHERE pet_owners.pet_id = pet_invites.pet_id AND pet_owners.user_id = auth.uid()))';
    END IF;

    -- 7. pet_invites: Creators can manage invites
    IF users_id_type = 'text' THEN
        EXECUTE 'CREATE POLICY "Users can manage invites they created" ON public.pet_invites FOR ALL USING (auth.uid()::text = created_by)';
    ELSE
        EXECUTE 'CREATE POLICY "Users can manage invites they created" ON public.pet_invites FOR ALL USING (auth.uid() = created_by)';
    END IF;

    RAISE NOTICE 'Successfully updated pet_owners Policy and FKs';


END $$;
