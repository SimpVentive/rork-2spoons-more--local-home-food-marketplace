-- Create seller_notifications table for notification tracking
CREATE TABLE IF NOT EXISTS seller_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Notification details
  type VARCHAR(100) NOT NULL CHECK (type IN ('order_placed', 'cod_pending', 'cod_confirmed', 'cod_denied', 'payment_received')),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,

  -- Data payload
  data JSONB,

  -- Delivery tracking
  sent_to_seller BOOLEAN DEFAULT true,
  sent_to_whatsapp BOOLEAN DEFAULT false,
  whatsapp_timestamp TIMESTAMP WITH TIME ZONE,
  whatsapp_message_id VARCHAR(255),

  -- Read status
  read_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX idx_seller_notifications_seller_id ON seller_notifications(seller_id);
CREATE INDEX idx_seller_notifications_order_id ON seller_notifications(order_id);
CREATE INDEX idx_seller_notifications_type ON seller_notifications(type);
CREATE INDEX idx_seller_notifications_read_at ON seller_notifications(read_at);
CREATE INDEX idx_seller_notifications_created_at ON seller_notifications(created_at DESC);
CREATE INDEX idx_seller_notifications_seller_read ON seller_notifications(seller_id, read_at);

-- Create function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notification_as_read(notification_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE seller_notifications
  SET read_at = NOW()
  WHERE id = notification_id AND read_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(seller_id_param UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM seller_notifications
    WHERE seller_id = seller_id_param AND read_at IS NULL
  );
END;
$$ LANGUAGE plpgsql;

-- Create view for recent notifications
CREATE OR REPLACE VIEW recent_notifications AS
SELECT
  id,
  seller_id,
  order_id,
  type,
  title,
  body,
  read_at IS NULL as is_unread,
  sent_to_whatsapp,
  created_at,
  EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600 as hours_ago
FROM seller_notifications
ORDER BY created_at DESC;
