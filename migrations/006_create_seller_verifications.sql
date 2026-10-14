-- Create seller_verifications table for FSSAI and seller verification
CREATE TABLE IF NOT EXISTS seller_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  fssai_document_url TEXT NOT NULL,
  fssai_status TEXT NOT NULL DEFAULT 'pending' CHECK (fssai_status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  UNIQUE(seller_id) -- Only one active verification per seller
);

-- Create index for faster lookups
CREATE INDEX idx_seller_verifications_seller_id ON seller_verifications(seller_id);
CREATE INDEX idx_seller_verifications_status ON seller_verifications(fssai_status);
CREATE INDEX idx_seller_verifications_submitted_at ON seller_verifications(submitted_at DESC);

-- Add verification status to profiles table (for quick access)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fssai_status TEXT DEFAULT 'pending' CHECK (fssai_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fssai_verified_at TIMESTAMP WITH TIME ZONE;

-- Create view for pending verifications (used by admin)
CREATE OR REPLACE VIEW pending_seller_verifications AS
SELECT
  sv.id,
  sv.seller_id,
  p.name,
  p.email,
  p.phone,
  sv.fssai_document_url,
  sv.submitted_at,
  sv.fssai_status
FROM seller_verifications sv
JOIN profiles p ON sv.seller_id = p.id
WHERE sv.fssai_status = 'pending'
ORDER BY sv.submitted_at DESC;

-- Create function to auto-sync verification status to profiles table
CREATE OR REPLACE FUNCTION sync_seller_verification_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET fssai_status = NEW.fssai_status,
      fssai_verified_at = CASE WHEN NEW.fssai_status = 'approved' THEN NOW() ELSE NULL END,
      updated_at = NOW()
  WHERE id = NEW.seller_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-sync when verification status changes
DROP TRIGGER IF EXISTS trigger_sync_verification_status ON seller_verifications;
CREATE TRIGGER trigger_sync_verification_status
AFTER INSERT OR UPDATE ON seller_verifications
FOR EACH ROW
EXECUTE FUNCTION sync_seller_verification_status();

-- Enable RLS (Row Level Security)
ALTER TABLE seller_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own verification
CREATE POLICY "Users can view their own verification" ON seller_verifications
  FOR SELECT USING (auth.uid()::text = seller_id::text OR
                    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- RLS Policy: Only admins can update verification status
CREATE POLICY "Only admins can review verifications" ON seller_verifications
  FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
