# 🛠️ Supabase Database Setup Guide

To connect your "Digital Heroes" platform to a real database, please follow these steps.

### Step 1: SQL Editor Configuration
Copy the script below and paste it into a **New Query** in your **Supabase SQL Editor**. Then click **Run**.

```sql
-- 1. Profiles Table (Main User Data)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  plan_id TEXT DEFAULT 'monthly',
  charity_id TEXT,
  charity_percent INTEGER DEFAULT 10,
  latest_scores JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'Active',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Charities Table (Cause Management)
CREATE TABLE IF NOT EXISTS public.charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  total_raised DECIMAL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Winners Table (Proof Verification & Status)
CREATE TABLE IF NOT EXISTS public.winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  draw_month TEXT NOT NULL,
  prize_amount TEXT NOT NULL,
  match_count INTEGER NOT NULL,
  proof_url TEXT,
  status TEXT DEFAULT 'Pending', -- Pending, Approved, Paid
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

-- 5. Policies (Allow users to read/write their own data)
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Everyone can view charities" ON public.charities FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Users can view their won winnings" ON public.winners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upload their own proof" ON public.winners FOR UPDATE USING (auth.uid() = user_id);

-- 6. Activity Logs Table (Audit Feed)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view activity logs" ON public.activity_logs FOR SELECT TO PUBLIC USING (true);
```

### Step 2: Storage Configuration
1. Go to **Storage** in your Supabase Dashboard.
2. Click **New Bucket**.
3. Name it **`proofs`**.
4. Set it to **Public** (important for viewing proof links).
5. Click **Save**.

### Step 3: Environment Variables
Ensure your `.env.local` contains the real keys from your **Settings > API** page:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-long-secret-key
```
