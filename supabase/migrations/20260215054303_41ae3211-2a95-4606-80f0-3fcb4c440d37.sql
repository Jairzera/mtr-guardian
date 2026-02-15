-- Add origin column to distinguish marketplace vs descarte MTRs
ALTER TABLE public.waste_manifests 
ADD COLUMN origin text NOT NULL DEFAULT 'descarte' 
CHECK (origin IN ('descarte', 'marketplace'));