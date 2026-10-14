# 🗄️ Database Migrations - Multi-Pickup & COD Feature

**Status:** Phase 5 - Complete Migration Suite  
**Date:** October 13, 2026  
**Database:** Supabase (PostgreSQL)

---

## 📋 MIGRATION OVERVIEW

This migration suite adds complete support for:
- ✅ Multiple pickup locations per listing
- ✅ Cash on Delivery (COD) payment method
- ✅ Seller earnings tracking
- ✅ COD confirmation workflow
- ✅ Seller notifications

**Total Migrations:** 5 files  
**Total New Tables:** 4  
**Total Updated Tables:** 1 (orders)

---

## 🚀 QUICK START

### Option 1: Supabase Dashboard (Recommended)
1. Go to Supabase Dashboard → SQL Editor
2. Run migrations in order: `001` → `005`
3. Verify tables and views created

### Option 2: Supabase CLI
```bash
# If using Supabase CLI
supabase migration push
```

### Option 3: psql (Direct PostgreSQL)
```bash
# Connect to your Supabase database
psql "postgresql://[user]:[password]@[host]:[port]/[database]"

# Run migrations in order
\i migrations/001_create_pickup_locations.sql
\i migrations/002_create_seller_earnings.sql
\i migrations/003_create_cod_confirmations.sql
\i migrations/004_create_seller_notifications.sql
\i migrations/005_update_orders_for_cod.sql
```

---

## 📊 MIGRATION DETAILS

### Migration 001: Pickup Locations
**File:** `001_create_pickup_locations.sql`  
**Creates:** `pickup_locations` table

#### Table Structure:
```
id (UUID) - Primary key
listing_id (UUID) - Foreign key to listings
type (VARCHAR) - home, custom, restaurant, other
name (VARCHAR) - Location name
street, city, state, zip_code, country - Address components
full_address (TEXT) - Complete formatted address
latitude, longitude (DECIMAL) - GPS coordinates
google_maps_url (TEXT) - Google Maps link
pickup_time_start, pickup_time_end (TIME) - Availability window
instructions (TEXT) - Special pickup instructions
is_available (BOOLEAN) - Availability status
created_at, updated_at - Timestamps
```

#### Indexes:
- `idx_pickup_locations_listing_id` - Fast listing lookup
- `idx_pickup_locations_available` - Filter available locations

#### Triggers:
- Auto-update `updated_at` on record changes

#### Sample Query:
```sql
-- Get all pickup locations for a listing
SELECT * FROM pickup_locations 
WHERE listing_id = '123e4567-e89b-12d3-a456-426614174000'
AND is_available = true;
```

---

### Migration 002: Seller Earnings
**File:** `002_create_seller_earnings.sql`  
**Creates:** `seller_earnings` table + `seller_earnings_summary` view

#### Table Structure:
```
id (UUID) - Primary key
seller_id (UUID) - Foreign key to users
order_id (UUID) - Foreign key to orders
amount (DECIMAL) - Earning amount (₹)
payment_method (VARCHAR) - cod, prepaid
status (VARCHAR) - pending, credited, failed
buyer_id (UUID) - Denormalized buyer ID
dish_name (VARCHAR) - Denormalized dish name
confirmation_deadline (TIMESTAMP) - COD confirmation deadline
credited_at (TIMESTAMP) - When amount was credited
failure_reason (VARCHAR) - Reason if failed
created_at, updated_at - Timestamps
```

#### Indexes:
- `idx_seller_earnings_seller_id` - Fast seller lookup
- `idx_seller_earnings_status` - Filter by status
- `idx_seller_earnings_payment_method` - Filter by method
- `idx_seller_earnings_seller_status` - Combined queries

#### Views:
- `seller_earnings_summary` - Monthly earnings breakdown by seller

#### Sample Queries:
```sql
-- Get seller's total earnings (last 30 days)
SELECT * FROM seller_earnings_summary 
WHERE seller_id = 'seller_123';

-- Get all pending earnings for a seller
SELECT * FROM seller_earnings 
WHERE seller_id = 'seller_123' AND status = 'pending';

-- Get COD vs Prepaid breakdown
SELECT payment_method, COUNT(*), SUM(amount)
FROM seller_earnings
WHERE seller_id = 'seller_123'
GROUP BY payment_method;
```

---

### Migration 003: COD Confirmations
**File:** `003_create_cod_confirmations.sql`  
**Creates:** `cod_confirmations` table + views & functions

#### Table Structure:
```
id (UUID) - Primary key
order_id (UUID) - Foreign key to orders (unique)
seller_id (UUID) - Foreign key to users
status (VARCHAR) - pending, confirmed, denied, expired
amount (DECIMAL) - Original amount
confirmed_amount (DECIMAL) - Amount confirmed by seller
pickup_time_end (TIMESTAMP) - When pickup window ends
confirmation_timeout_minutes (INTEGER) - Timeout after window (default 5)
confirmation_deadline (TIMESTAMP) - Calculated deadline
confirmed_at (TIMESTAMP) - When confirmed
denied_at (TIMESTAMP) - When denied
denial_reason (TEXT) - Reason for denial
popup_shown_at (TIMESTAMP) - When popup was shown
attempt_count (INTEGER) - Number of attempts to confirm
created_at, updated_at - Timestamps
```

#### Indexes:
- `idx_cod_confirmations_seller_id` - Fast seller lookup
- `idx_cod_confirmations_status` - Filter by status
- `idx_cod_confirmations_deadline` - Find urgent confirmations

#### Views:
- `pending_cod_confirmations` - Pending confirmations with urgency level
- Includes seconds remaining and urgency classification

#### Functions:
- `expire_old_cod_confirmations()` - Auto-expire old confirmations

#### Sample Queries:
```sql
-- Get pending COD confirmations for seller (urgent first)
SELECT * FROM pending_cod_confirmations 
WHERE seller_id = 'seller_123'
ORDER BY confirmation_deadline ASC;

-- Get all COD confirmations for an order
SELECT * FROM cod_confirmations 
WHERE order_id = 'order_123';

-- Get confirmation statistics
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
  SUM(CASE WHEN status = 'denied' THEN 1 ELSE 0 END) as denied,
  SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired
FROM cod_confirmations
WHERE seller_id = 'seller_123';
```

---

### Migration 004: Seller Notifications
**File:** `004_create_seller_notifications.sql`  
**Creates:** `seller_notifications` table + views & functions

#### Table Structure:
```
id (UUID) - Primary key
seller_id (UUID) - Foreign key to users
order_id (UUID) - Foreign key to orders
type (VARCHAR) - order_placed, cod_pending, cod_confirmed, cod_denied, payment_received
title (VARCHAR) - Notification title
body (TEXT) - Notification body
data (JSONB) - Additional data payload
sent_to_seller (BOOLEAN) - In-app notification sent
sent_to_whatsapp (BOOLEAN) - WhatsApp notification sent
whatsapp_timestamp (TIMESTAMP) - When WhatsApp was sent
whatsapp_message_id (VARCHAR) - WhatsApp message ID
read_at (TIMESTAMP) - When notification was read
created_at - Timestamp
```

#### Indexes:
- `idx_seller_notifications_seller_id` - Fast seller lookup
- `idx_seller_notifications_type` - Filter by notification type
- `idx_seller_notifications_read_at` - Find unread notifications
- `idx_seller_notifications_seller_read` - Combined queries

#### Views:
- `recent_notifications` - Recent notifications with unread status

#### Functions:
- `mark_notification_as_read(notification_id)` - Mark as read
- `get_unread_notification_count(seller_id)` - Count unread

#### Sample Queries:
```sql
-- Get unread notification count for seller
SELECT get_unread_notification_count('seller_123');

-- Get recent notifications for seller
SELECT * FROM recent_notifications 
WHERE seller_id = 'seller_123' 
AND is_unread = true;

-- Get all COD-related notifications
SELECT * FROM seller_notifications
WHERE seller_id = 'seller_123'
AND type LIKE 'cod_%'
ORDER BY created_at DESC;

-- Mark notification as read
SELECT mark_notification_as_read('notification_uuid');
```

---

### Migration 005: Update Orders Table
**File:** `005_update_orders_for_cod.sql`  
**Alters:** `orders` table

#### New Columns:
```
pickup_location_id (UUID) - Foreign key to pickup_locations
payment_method (VARCHAR) - prepaid, cod (default: prepaid)
cod_status (JSONB) - Structured COD status tracking
notification (JSONB) - Notification tracking
```

#### JSON Structure - cod_status:
```json
{
  "status": "pending|confirmed|denied|expired",
  "confirmedAmount": 250,
  "confirmationDeadline": "2026-10-13T15:35:00Z",
  "confirmedAt": "2026-10-13T15:30:00Z",
  "denialReason": "Buyer didn't show up"
}
```

#### JSON Structure - notification:
```json
{
  "sentToSeller": true,
  "sellerNotificationId": "uuid",
  "sentToWhatsApp": false,
  "whatsAppTimestamp": null
}
```

#### New Indexes:
- `idx_orders_pickup_location_id` - Fast location lookup
- `idx_orders_payment_method` - Filter by payment method
- `idx_orders_cod_status` - GIN index for JSONB queries
- `idx_orders_pending_cod` - Find pending COD orders

#### New Functions:
- `update_order_cod_status()` - Update COD status
- `get_pending_cod_orders()` - Get pending confirmations

#### Sample Queries:
```sql
-- Get all orders with COD
SELECT * FROM orders WHERE payment_method = 'cod';

-- Get orders waiting for COD confirmation
SELECT * FROM orders_with_cod_status 
WHERE cod_status = 'pending';

-- Update COD status to confirmed
SELECT update_order_cod_status(
  'order_uuid',
  'confirmed',
  250.00
);

-- Get pending COD orders for seller
SELECT * FROM get_pending_cod_orders('seller_uuid');
```

---

## ✅ VERIFICATION CHECKLIST

After running all migrations, verify:

```sql
-- 1. Check all new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('pickup_locations', 'seller_earnings', 'cod_confirmations', 'seller_notifications');

-- 2. Check orders table has new columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('pickup_location_id', 'payment_method', 'cod_status', 'notification');

-- 3. Check views exist
SELECT table_name FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN ('seller_earnings_summary', 'pending_cod_confirmations', 'recent_notifications', 'orders_with_cod_status');

-- 4. Check all indexes created
SELECT indexname FROM pg_indexes 
WHERE tablename IN ('pickup_locations', 'seller_earnings', 'cod_confirmations', 'seller_notifications', 'orders');
```

---

## 🔗 SERVICE INTEGRATION

Services are ready to use with these new tables:

### CODConfirmationService
- Reads from: `cod_confirmations`
- Writes to: `cod_confirmations`, `seller_notifications`
- Uses function: `expire_old_cod_confirmations()`

### EarningsService
- Reads from: `seller_earnings`, `seller_earnings_summary`
- Writes to: `seller_earnings`
- Uses view: `seller_earnings_summary`

### NotificationService
- Reads from: `seller_notifications`
- Writes to: `seller_notifications`, `seller_notifications`
- Uses function: `get_unread_notification_count()`

---

## 📝 MIGRATION NOTES

### Data Migration
If migrating from old structure:
```sql
-- Example: Migrate existing orders to use pickup_locations
UPDATE orders o
SET pickup_location_id = pl.id
FROM pickup_locations pl
WHERE pl.listing_id = o.listing_id
AND pl.type = 'home'
AND o.pickup_location_id IS NULL;
```

### Rollback Plan
If you need to rollback migrations:
```sql
-- Drop in reverse order
DROP VIEW IF EXISTS orders_with_cod_status CASCADE;
DROP FUNCTION IF EXISTS get_pending_cod_orders CASCADE;
DROP FUNCTION IF EXISTS update_order_cod_status CASCADE;
ALTER TABLE orders DROP COLUMN IF EXISTS notification;
ALTER TABLE orders DROP COLUMN IF EXISTS cod_status;
ALTER TABLE orders DROP COLUMN IF EXISTS payment_method;
ALTER TABLE orders DROP COLUMN IF EXISTS pickup_location_id;
DROP VIEW IF EXISTS recent_notifications CASCADE;
DROP FUNCTION IF EXISTS get_unread_notification_count CASCADE;
DROP FUNCTION IF EXISTS mark_notification_as_read CASCADE;
DROP TABLE IF EXISTS seller_notifications CASCADE;
DROP VIEW IF EXISTS pending_cod_confirmations CASCADE;
DROP FUNCTION IF EXISTS expire_old_cod_confirmations CASCADE;
DROP TABLE IF EXISTS cod_confirmations CASCADE;
DROP VIEW IF EXISTS seller_earnings_summary CASCADE;
DROP TABLE IF EXISTS seller_earnings CASCADE;
DROP TABLE IF EXISTS pickup_locations CASCADE;
```

---

## 🚀 NEXT STEPS

1. ✅ Run all 5 migrations
2. ✅ Verify tables and views
3. ✅ Update services to use real database
4. ✅ Replace mock data in components
5. ✅ Test complete workflow
6. ✅ Monitor performance with indexes

---

## 📞 SUPPORT

### Common Issues

**Q: Foreign key constraint error?**
A: Ensure parent tables (users, listings, orders) exist and IDs are valid.

**Q: JSON operations failing?**
A: Verify PostgreSQL version supports JSONB (9.4+). Supabase uses latest.

**Q: Performance issues?**
A: All indexes are created. Run ANALYZE if still slow:
```sql
ANALYZE pickup_locations;
ANALYZE seller_earnings;
ANALYZE cod_confirmations;
ANALYZE seller_notifications;
```

---

**Phase 5 Database Setup Complete!** 🎉

All migrations are production-ready and fully documented.
