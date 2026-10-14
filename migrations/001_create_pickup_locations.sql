-- Create pickup_locations table for multi-location support
CREATE TABLE IF NOT EXISTS pickup_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('home', 'custom', 'restaurant', 'other')),
  name VARCHAR(255) NOT NULL,

  -- Address details
  street VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'India',
  full_address TEXT NOT NULL,

  -- GPS Coordinates
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,

  -- Google Maps link
  google_maps_url TEXT,

  -- Pickup time window
  pickup_time_start TIME NOT NULL,
  pickup_time_end TIME NOT NULL,

  -- Special instructions
  instructions TEXT,

  -- Status
  is_available BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on listing_id for fast queries
CREATE INDEX idx_pickup_locations_listing_id ON pickup_locations(listing_id);
CREATE INDEX idx_pickup_locations_available ON pickup_locations(is_available);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_pickup_locations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pickup_locations_updated_at_trigger
BEFORE UPDATE ON pickup_locations
FOR EACH ROW
EXECUTE FUNCTION update_pickup_locations_updated_at();
