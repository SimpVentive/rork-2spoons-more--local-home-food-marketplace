-- Create seller_earnings table for tracking earnings
CREATE TABLE IF NOT EXISTS seller_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Earning details
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cod', 'prepaid')),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'credited', 'failed')),

  -- Order details (denormalized for easy access)
  buyer_id UUID REFERENCES users(id),
  dish_name VARCHAR(255),

  -- Confirmation details
  confirmation_deadline TIMESTAMP WITH TIME ZONE,
  credited_at TIMESTAMP WITH TIME ZONE,

  -- Failure tracking
  failure_reason VARCHAR(255),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX idx_seller_earnings_seller_id ON seller_earnings(seller_id);
CREATE INDEX idx_seller_earnings_order_id ON seller_earnings(order_id);
CREATE INDEX idx_seller_earnings_status ON seller_earnings(status);
CREATE INDEX idx_seller_earnings_payment_method ON seller_earnings(payment_method);
CREATE INDEX idx_seller_earnings_created_at ON seller_earnings(created_at DESC);
CREATE INDEX idx_seller_earnings_seller_status ON seller_earnings(seller_id, status);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_seller_earnings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER seller_earnings_updated_at_trigger
BEFORE UPDATE ON seller_earnings
FOR EACH ROW
EXECUTE FUNCTION update_seller_earnings_updated_at();

-- Create view for seller earnings summary
CREATE OR REPLACE VIEW seller_earnings_summary AS
SELECT
  seller_id,
  COUNT(*) as total_transactions,
  SUM(amount) as total_amount,
  SUM(CASE WHEN status = 'credited' THEN amount ELSE 0 END) as credited_amount,
  SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
  COUNT(CASE WHEN status = 'credited' THEN 1 END) as credited_count,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN payment_method = 'cod' THEN 1 END) as cod_count,
  COUNT(CASE WHEN payment_method = 'prepaid' THEN 1 END) as prepaid_count,
  SUM(CASE WHEN payment_method = 'cod' THEN amount ELSE 0 END) as cod_amount,
  SUM(CASE WHEN payment_method = 'prepaid' THEN amount ELSE 0 END) as prepaid_amount,
  MAX(created_at) as last_earning_at
FROM seller_earnings
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY seller_id;
