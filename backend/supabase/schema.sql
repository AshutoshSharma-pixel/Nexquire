-- Nexquire Database Schema

-- Users Table (Profiles)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    age INTEGER,
    income NUMERIC,
    monthly_investable NUMERIC,
    goal TEXT, -- wealth creation / house / retirement / education / emergency
    knowledge_level TEXT, -- beginner / intermediate / expert
    risk_score INTEGER,
    broker TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolios Table
CREATE TABLE public.portfolios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    fund_name TEXT NOT NULL,
    amc TEXT NOT NULL,
    category TEXT NOT NULL,
    amount_invested NUMERIC NOT NULL,
    purchase_date DATE NOT NULL,
    current_value NUMERIC,
    units NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts Table
CREATE TABLE public.alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- geopolitical, political, market
    severity TEXT NOT NULL, -- 🔴 Act Now / 🟡 Watch / 🟢 Opportunity / ℹ️ FYI
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    affected_holdings JSONB,
    recommended_action TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SIPs Table
CREATE TABLE public.sips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    fund_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    frequency TEXT DEFAULT 'monthly',
    next_date DATE,
    status TEXT DEFAULT 'active', -- active/paused
    pause_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Watchlist Table
CREATE TABLE public.watchlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    fund_name TEXT NOT NULL,
    amc TEXT NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Set up RLS policies (User can only read/write their own data)
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own portfolio" ON public.portfolios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own portfolio" ON public.portfolios FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own portfolio" ON public.portfolios FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own portfolio" ON public.portfolios FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own alerts" ON public.alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own sips" ON public.sips FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own watchlist" ON public.watchlist FOR SELECT USING (auth.uid() = user_id);
