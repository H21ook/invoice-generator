-- Create the invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id TEXT UNIQUE NOT NULL,
    edit_token_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    currency TEXT NOT NULL DEFAULT 'USD',
    locale TEXT NOT NULL DEFAULT 'en-US',
    issuer JSONB NOT NULL,
    customer JSONB NOT NULL,
    items JSONB NOT NULL,
    totals JSONB NOT NULL,
    notes TEXT,
    terms TEXT,
    issue_date DATE,
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add index for public_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_invoices_public_id ON public.invoices(public_id);

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function on update
DROP TRIGGER IF EXISTS tr_invoices_updated_at ON public.invoices;
CREATE TRIGGER tr_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security (RLS)
-- Since this is an anonymous app, we'll bypass RLS using the service role in route handlers.
-- However, we should still enable it to prevent direct public access if an anon key is leaked.
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- If we wanted some public read access, we could add a policy here.
-- For now, we'll keep it strictly managed by the backend service.
