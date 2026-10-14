-- Create cod_confirmations table for tracking COD workflow
CREATE TABLE IF NOT EXISTS cod_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Confirmation details
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'denied', 'expired')),

  -- Amount details
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  confirmed_amount DECIMAL(10, 2),

  -- Time tracking
  pickup_time_end TIMESTAMP WITH TIME ZONE NOT NULL,
  confirmation_timeout_minutes INTEGER NOT NULL DEFAULT 5,
  confirmation_deadline TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Confirmation/Denial details
  confirmed_at TIMESTAMP WITH TIME ZONE,
  denied_at TIMESTAMP WITH TIME ZONE,
  denial_reason TEXT,

  -- Attempt tracking
  popup_shown_at TIMESTAMP WITH TIME ZONE,
  attempt_count INTEGER DEFAULT 0 CHECK (attempt_count >= 0),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX idx_cod_confirmations_seller_id ON cod_confirmations(seller_id);
CREATE INDEX idx_cod_confirmations_order_id ON cod_confirmations(order_id);
CREATE INDEX idx_cod_confirmations_status ON cod_confirmations(status);
CREATE INDEX idx_cod_confirmations_deadline ON cod_confirmations(confirmation_deadline);
CREATE INDEX idx_cod_confirmations_seller_status ON cod_confirmations(seller_id, status);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_cod_confirmations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cod_confirmations_updated_at_trigger
BEFORE UPDATE ON cod_confirmations
FOR EACH ROW
EXECUTE FUNCTION update_cod_confirmations_updated_at();

-- Create view for pending COD confirmations
CREATE OR REPLACE VIEW pending_cod_confirmations AS
SELECT
  id,
  order_id,
  seller_id,
  amount,
  confirmation_deadline,
  EXTRACT(EPOCH FROM (confirmation_deadline - NOW())) as seconds_remaining,
  CASE
    WHEN confirmation_deadline < NOW() THEN 'expired'
    WHEN EXTRACT(EPOCH FROM (confirmation_deadline - NOW())) < 300 THEN 'urgent'
    ELSE 'normal'
  END as urgency
FROM cod_confirmations
WHERE status = 'pending'
ORDER BY confirmation_deadline ASC;

-- Create function to auto-expire old pending confirmations
CREATE OR REPLACE FUNCTION expire_old_cod_confirmations()
RETURNS void AS $$
BEGIN
  UPDATE cod_confirmations
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending' AND confirmation_deadline < NOW();
END;
$$ LANGUAGE plpgsql;
