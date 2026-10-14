-- Update orders table to support multi-pickup locations and COD
-- This migration adds new columns to the existing orders table

-- Add pickup_location_id column (foreign key to pickup_locations)
ALTER TABLE IF EXISTS orders
ADD COLUMN IF NOT EXISTS pickup_location_id UUID REFERENCES pickup_locations(id) ON DELETE SET NULL;

-- Add payment_method column
ALTER TABLE IF EXISTS orders
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'prepaid' CHECK (payment_method IN ('prepaid', 'cod'));

-- Add COD status JSON column
ALTER TABLE IF EXISTS orders
ADD COLUMN IF NOT EXISTS cod_status JSONB DEFAULT '{"status": "pending", "confirmedAmount": null, "confirmationDeadline": null, "confirmedAt": null, "denialReason": null}';

-- Add notification tracking columns
ALTER TABLE IF EXISTS orders
ADD COLUMN IF NOT EXISTS notification JSONB DEFAULT '{"sentToSeller": false, "sellerNotificationId": null, "sentToWhatsApp": false, "whatsAppTimestamp": null}';

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_orders_pickup_location_id ON orders(pickup_location_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_cod_status ON orders USING gin(cod_status);

-- Create index for orders waiting for COD confirmation
CREATE INDEX IF NOT EXISTS idx_orders_pending_cod ON orders(
  id
) WHERE payment_method = 'cod'
  AND cod_status->>'status' = 'pending'
  AND created_at > NOW() - INTERVAL '24 hours';

-- Create function to update COD status
CREATE OR REPLACE FUNCTION update_order_cod_status(
  order_id_param UUID,
  status_param VARCHAR(50),
  amount_param DECIMAL DEFAULT NULL,
  reason_param VARCHAR DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE orders
  SET cod_status = jsonb_set(
    cod_status,
    '{status}',
    to_jsonb(status_param)
  ) || CASE
    WHEN amount_param IS NOT NULL THEN jsonb_build_object('confirmedAmount', amount_param)
    WHEN reason_param IS NOT NULL THEN jsonb_build_object('denialReason', reason_param)
    ELSE '{}'::jsonb
  END || jsonb_build_object(
    'updatedAt', to_jsonb(NOW())
  ),
  updated_at = NOW()
  WHERE id = order_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create function to get orders pending COD confirmation
CREATE OR REPLACE FUNCTION get_pending_cod_orders(seller_id_param UUID)
RETURNS TABLE(
  id UUID,
  dish_name VARCHAR,
  buyer_name VARCHAR,
  amount DECIMAL,
  payment_method VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id,
    o.dish_name,
    u.name as buyer_name,
    o.total_amount as amount,
    o.payment_method,
    o.created_at
  FROM orders o
  JOIN users u ON o.buyer_id = u.id
  WHERE o.seller_id = seller_id_param
    AND o.payment_method = 'cod'
    AND o.cod_status->>'status' = 'pending'
  ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create view for order summary with COD details
CREATE OR REPLACE VIEW orders_with_cod_status AS
SELECT
  id,
  seller_id,
  buyer_id,
  dish_name,
  total_amount,
  payment_method,
  (cod_status->>'status')::VARCHAR as cod_status,
  (cod_status->>'confirmedAmount')::DECIMAL as confirmed_amount,
  (cod_status->>'confirmationDeadline')::TIMESTAMP as confirmation_deadline,
  (cod_status->>'confirmedAt')::TIMESTAMP as confirmed_at,
  (cod_status->>'denialReason')::VARCHAR as denial_reason,
  created_at,
  updated_at
FROM orders
WHERE payment_method = 'cod';
