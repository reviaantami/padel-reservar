-- Add slug column to articles table
ALTER TABLE articles ADD COLUMN slug text;

-- Create a function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title text)
RETURNS text AS $$
BEGIN
  -- Convert to lowercase and replace spaces and special chars with hyphens
  RETURN lower(regexp_replace(
    regexp_replace(
      regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),  -- Remove special characters except spaces and hyphens
      '\s+', '-', 'g'),                                   -- Replace spaces with hyphens
    '-+', '-', 'g'));                                     -- Replace multiple hyphens with single hyphen
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically generate slug from title
CREATE OR REPLACE FUNCTION articles_slug_trigger()
RETURNS trigger AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_article_slug
  BEFORE INSERT OR UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION articles_slug_trigger();

-- Generate slugs for existing articles
UPDATE articles SET slug = generate_slug(title) WHERE slug IS NULL;