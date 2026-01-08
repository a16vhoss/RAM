-- Migration: Add Communities Feature (Phase 10)
-- Description: Creates tables for pet communities, posts, comments, likes, and reports.

-- ============================================
-- 1. COMMUNITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.communities (
    community_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('species', 'breed')),
    species TEXT,  -- dog, cat, bird, exotic, other
    breed TEXT,    -- nullable, only for breed-type communities
    cover_image TEXT,
    member_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. COMMUNITY MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.community_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    community_id UUID NOT NULL REFERENCES public.communities(community_id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
    is_auto_joined BOOLEAN DEFAULT true,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(community_id, user_id)
);

-- ============================================
-- 3. COMMUNITY POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.community_posts (
    post_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    community_id UUID NOT NULL REFERENCES public.communities(community_id) ON DELETE CASCADE,
    user_id TEXT REFERENCES public.users(user_id) ON DELETE SET NULL,
    post_type TEXT DEFAULT 'general' CHECK (post_type IN ('general', 'question', 'tip', 'photo', 'alert')),
    content TEXT NOT NULL,
    media_urls JSONB DEFAULT '[]',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    is_reported BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. POST COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.post_comments (
    comment_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.community_posts(post_id) ON DELETE CASCADE,
    user_id TEXT REFERENCES public.users(user_id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. POST LIKES TABLE (prevent duplicates)
-- ============================================
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.community_posts(post_id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- ============================================
-- 6. POST REPORTS TABLE (moderation)
-- ============================================
CREATE TABLE IF NOT EXISTS public.post_reports (
    report_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.community_posts(post_id) ON DELETE CASCADE,
    reported_by TEXT REFERENCES public.users(user_id) ON DELETE SET NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_community_posts_community ON public.community_posts(community_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_members_user ON public.community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_community ON public.community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_communities_slug ON public.communities(slug);
CREATE INDEX IF NOT EXISTS idx_communities_species ON public.communities(species);

-- ============================================
-- 8. SEED DEFAULT SPECIES COMMUNITIES
-- ============================================
INSERT INTO public.communities (name, slug, type, species, description, cover_image) VALUES
('🐕 Perros', 'perros', 'species', 'Perro', 'Comunidad para todos los amantes de los perros. Comparte fotos, consejos y experiencias.', NULL),
('🐱 Gatos', 'gatos', 'species', 'Gato', 'Comunidad para todos los amantes de los gatos. Tips de cuidado, fotos y más.', NULL),
('🐦 Aves', 'aves', 'species', 'Ave', 'Comunidad para dueños de aves. Desde periquitos hasta loros.', NULL),
('🐹 Roedores', 'roedores', 'species', 'Roedor', 'Comunidad para hámsters, conejos, conejillos de indias y más.', NULL),
('🦎 Reptiles', 'reptiles', 'species', 'Reptil', 'Comunidad para dueños de reptiles y anfibios.', NULL),
('🐠 Peces', 'peces', 'species', 'Pez', 'Comunidad para acuaristas y amantes de los peces.', NULL),
('🐾 Otras Mascotas', 'otros', 'species', 'Otro', 'Comunidad para mascotas que no encajan en otras categorías.', NULL)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 9. FUNCTION: Auto-create breed community if not exists
-- ============================================
CREATE OR REPLACE FUNCTION get_or_create_breed_community(p_species TEXT, p_breed TEXT)
RETURNS UUID AS $$
DECLARE
    v_community_id UUID;
    v_slug TEXT;
BEGIN
    -- Generate slug from breed name
    v_slug := lower(regexp_replace(p_breed, '[^a-zA-Z0-9]', '-', 'g'));
    v_slug := regexp_replace(v_slug, '-+', '-', 'g');  -- Remove multiple dashes
    v_slug := trim(both '-' from v_slug);  -- Trim leading/trailing dashes
    
    -- Try to find existing community
    SELECT community_id INTO v_community_id
    FROM public.communities
    WHERE type = 'breed' AND breed = p_breed AND species = p_species;
    
    -- If not found, create it
    IF v_community_id IS NULL THEN
        INSERT INTO public.communities (name, slug, type, species, breed, description)
        VALUES (
            '🐾 ' || p_breed,
            v_slug || '-' || substr(md5(random()::text), 1, 4),  -- Add random suffix to avoid conflicts
            'breed',
            p_species,
            p_breed,
            'Comunidad para dueños de ' || p_breed || '. Comparte experiencias y consejos específicos de la raza.'
        )
        RETURNING community_id INTO v_community_id;
    END IF;
    
    RETURN v_community_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. FUNCTION: Update member count
-- ============================================
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.communities 
        SET member_count = member_count + 1 
        WHERE community_id = NEW.community_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.communities 
        SET member_count = member_count - 1 
        WHERE community_id = OLD.community_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for member count
DROP TRIGGER IF EXISTS trigger_update_member_count ON public.community_members;
CREATE TRIGGER trigger_update_member_count
AFTER INSERT OR DELETE ON public.community_members
FOR EACH ROW EXECUTE FUNCTION update_community_member_count();

-- ============================================
-- 11. FUNCTION: Update post count
-- ============================================
CREATE OR REPLACE FUNCTION update_community_post_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.communities 
        SET post_count = post_count + 1 
        WHERE community_id = NEW.community_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.communities 
        SET post_count = post_count - 1 
        WHERE community_id = OLD.community_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for post count
DROP TRIGGER IF EXISTS trigger_update_post_count ON public.community_posts;
CREATE TRIGGER trigger_update_post_count
AFTER INSERT OR DELETE ON public.community_posts
FOR EACH ROW EXECUTE FUNCTION update_community_post_count();

-- ============================================
-- 12. FUNCTION: Update likes count
-- ============================================
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.community_posts 
        SET likes_count = likes_count + 1 
        WHERE post_id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.community_posts 
        SET likes_count = likes_count - 1 
        WHERE post_id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for likes count
DROP TRIGGER IF EXISTS trigger_update_likes_count ON public.post_likes;
CREATE TRIGGER trigger_update_likes_count
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- ============================================
-- 13. FUNCTION: Update comments count
-- ============================================
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.community_posts 
        SET comments_count = comments_count + 1 
        WHERE post_id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.community_posts 
        SET comments_count = comments_count - 1 
        WHERE post_id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comments count
DROP TRIGGER IF EXISTS trigger_update_comments_count ON public.post_comments;
CREATE TRIGGER trigger_update_comments_count
AFTER INSERT OR DELETE ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();
