
-- Primeiro remove a coluna se ela existir
ALTER TABLE prayers DROP COLUMN IF EXISTS idade;

-- Depois adiciona a coluna novamente
ALTER TABLE prayers ADD COLUMN idade TEXT NOT NULL DEFAULT '';
