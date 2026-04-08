-- ImmerseTrain Creator Platform schema (run in Supabase SQL Editor)

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  industry text,
  size_range text,
  owner_id text NOT NULL,
  plan text DEFAULT 'starter',
  logo_url text,
  created_at timestamptz DEFAULT now()
);

-- User profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text UNIQUE NOT NULL,
  full_name text,
  email text,
  org_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  role text DEFAULT 'owner' CHECK (role IN ('owner','admin','member')),
  onboarded boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Extend scenarios table
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organizations(id);
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS created_by text;
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft' CHECK (status IN ('draft','published','archived'));
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;

-- Video ingestion jobs (for YouTube/URL processing queue)
CREATE TABLE IF NOT EXISTS video_jobs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid REFERENCES organizations(id),
  created_by text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('upload','url','youtube')),
  source_url text,
  storage_path text,
  public_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','processing','complete','failed')),
  error_message text,
  file_size_bytes bigint,
  duration_seconds integer,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Scenario invitations (share training with specific people)
CREATE TABLE IF NOT EXISTS scenario_invites (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario_id uuid REFERENCES scenarios(id) ON DELETE CASCADE,
  org_id uuid REFERENCES organizations(id),
  invite_code text UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  max_uses integer DEFAULT 100,
  use_count integer DEFAULT 0,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- RLS policies (DEMO MODE)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON organizations FOR ALL USING (true);
CREATE POLICY "Allow all" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow all" ON video_jobs FOR ALL USING (true);
CREATE POLICY "Allow all" ON scenario_invites FOR ALL USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_org_id ON scenarios(org_id);
CREATE INDEX IF NOT EXISTS idx_video_jobs_org_id ON video_jobs(org_id);

