-- Hanubees Database Schema Setup
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/whfxrovgvulmhqkhumuz/sql/new

-- 1. Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'business', -- 'business' or 'person'
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bee_name TEXT NOT NULL UNIQUE,
  category TEXT,
  city TEXT,
  bio TEXT,
  logo_url TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  instagram TEXT,
  rating FLOAT DEFAULT 0,
  review_count INT DEFAULT 0,
  follower_count INT DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create data_entries table (LIVE FACTS + RICH CONTEXT)
CREATE TABLE IF NOT EXISTS data_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  source TEXT,
  tag TEXT, -- For RICH CONTEXT: 'about', 'portfolio', 'faq', 'offer'
  visibility TEXT DEFAULT 'public', -- 'public' or 'private'
  embedding vector(768), -- For semantic search
  is_live_fact BOOLEAN DEFAULT FALSE,
  info_type TEXT, -- For LIVE FACTS: 'pricing', 'hours', 'services', 'contact', 'policy'
  effective_date DATE,
  supersedes UUID REFERENCES data_entries(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  visitor_name TEXT,
  visitor_id TEXT,
  channel TEXT DEFAULT 'web',
  last_message_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user' or 'agent'
  content TEXT NOT NULL,
  is_important BOOLEAN DEFAULT FALSE,
  is_order BOOLEAN DEFAULT FALSE,
  fulfilled BOOLEAN DEFAULT FALSE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Create follows table (for v2 network)
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  followed_account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_account_id, followed_account_id)
);

-- 6. Create indexes
CREATE INDEX IF NOT EXISTS idx_accounts_slug ON accounts(slug);
CREATE INDEX IF NOT EXISTS idx_accounts_bee_name ON accounts(bee_name);
CREATE INDEX IF NOT EXISTS idx_data_entries_account ON data_entries(account_id);
CREATE INDEX IF NOT EXISTS idx_data_entries_live ON data_entries(account_id, is_live_fact, info_type) WHERE is_live_fact = TRUE;
CREATE INDEX IF NOT EXISTS idx_conversations_account ON conversations(account_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_account_id);

-- 7. Create HNSW vector index for semantic search
CREATE INDEX IF NOT EXISTS idx_data_entries_embedding ON data_entries USING hnsw (embedding vector_cosine_ops) WHERE embedding IS NOT NULL;

-- 8. Enable Row Level Security (RLS)
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies - Accounts
CREATE POLICY "Public business profiles are readable" ON accounts
  FOR SELECT USING (type = 'business' OR auth.uid()::text = user_id);

CREATE POLICY "Users can update own account" ON accounts
  FOR UPDATE USING (auth.uid()::text = user_id);

-- 10. RLS Policies - Data Entries
CREATE POLICY "Public data entries are readable" ON data_entries
  FOR SELECT USING (visibility = 'public' OR EXISTS (
    SELECT 1 FROM accounts WHERE accounts.id = data_entries.account_id
    AND accounts.user_id = auth.uid()::text
  ));

CREATE POLICY "Users can manage their own data" ON data_entries
  FOR ALL USING (EXISTS (
    SELECT 1 FROM accounts WHERE accounts.id = data_entries.account_id
    AND accounts.user_id = auth.uid()::text
  ));

-- 11. RLS Policies - Conversations & Messages (similar pattern)
CREATE POLICY "Users see their conversations" ON conversations
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM accounts WHERE accounts.id = conversations.account_id
    AND accounts.user_id = auth.uid()::text
  ));

CREATE POLICY "Anyone can start conversation" ON conversations
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users see conversation messages" ON messages
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM conversations c
    JOIN accounts a ON c.account_id = a.id
    WHERE c.id = messages.conversation_id
    AND (a.user_id = auth.uid()::text OR messages.role = 'user')
  ));

CREATE POLICY "Anyone can add messages" ON messages
  FOR INSERT WITH CHECK (TRUE);

-- 12. Done!
SELECT 'Hanubees schema created successfully!' as status;
