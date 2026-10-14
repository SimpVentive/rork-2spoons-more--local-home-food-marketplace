# 🎯 Feature Plan: Multi-Pickup Locations + COD Workflow

**Status:** Planning & Implementation  
**Priority:** HIGH  
**Complexity:** MEDIUM-HIGH  
**Estimated Effort:** 8-10 hours

---

## 📋 REQUIREMENTS SUMMARY

### 1. **Multi-Pickup Locations**
- Sellers can add multiple pickup points for each listing
- Options: Home, Custom Address, Restaurant, etc.
- Each location includes:
  - Address (full details)
  - GPS coordinates (lat/long)
  - Google Maps link
  - Pickup time window
  - Availability status

### 2. **Cash on Delivery (COD) Workflow**
**Flow:**
1. Seller creates listing → Chooses COD payment
2. Sets pickup/delivery time window (e.g., 2:00 PM - 2:30 PM)
3. Buyer orders → Seller receives notification
4. ~5 minutes after time window closes → Popup asks:
   - "Has the dish been sold and have you received payment?"
   - Option to confirm or deny
5. If confirmed → Amount auto-credited to seller's wallet
6. Reflected in earnings dashboard

### 3. **Notification System**
- Buyer places order → Seller gets notification (WhatsApp ready)
- Real-time updates on order status
- Payment confirmation notification

---

## 🏗️ IMPLEMENTATION PLAN

### **Phase 1: Data Models & Database**

#### PickupLocation Type
```typescript
interface PickupLocation {
  id: string;
  listingId: string;
  type: 'home' | 'custom' | 'restaurant' | 'other';
  name: string; // e.g., "My House", "Downtown Office"
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    fullAddress: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  googleMapsUrl: string;
  pickupTimeStart: string; // HH:MM format
  pickupTimeEnd: string;
  instructions?: string; // "Ring bell twice", etc.
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Update FoodListing Type
```typescript
interface FoodListing {
  // ... existing fields
  pickupLocations: PickupLocation[]; // NEW
  paymentMethod: 'cod' | 'prepaid' | 'both'; // NEW
  codDetails?: {
    enabled: boolean;
    pickupTimeWindow: {
      start: string; // HH:MM
      end: string;
    };
    confirmationTimeout: number; // minutes (default: 5)
  };
}
```

#### Update Order Type
```typescript
interface Order {
  // ... existing fields
  paymentMethod: 'cod' | 'prepaid';
  pickupLocation: PickupLocation; // NEW
  codStatus?: {
    status: 'pending' | 'confirmed' | 'denied' | 'paid';
    confirmedAmount: number;
    confirmedAt?: Date;
    deniedReason?: string;
  };
  notification?: {
    sentToSeller: boolean;
    sentToWseller: boolean; // WhatsApp
    timestamp: Date;
  };
}
```

#### Earnings Type
```typescript
interface SellerEarnings {
  id: string;
  sellerId: string;
  orderId: string;
  amount: number;
  paymentMethod: 'cod' | 'prepaid';
  status: 'pending' | 'credited' | 'withdrawn';
  creditedAt?: Date;
  transactionId?: string;
  createdAt: Date;
}
```

---

### **Phase 2: UI Components**

#### 2.1 PickupLocationManager (In Listing Creation)
**Location:** `components/PickupLocationManager.tsx`

Features:
- Add/Edit/Delete pickup locations
- Google Maps integration (autocomplete address)
- Set pickup time window
- Preview on map
- Mark as primary location

```
┌─────────────────────────────────┐
│ Pickup Locations                │
├─────────────────────────────────┤
│ ☑ My House (Primary)            │
│   📍 123 Main St, City, 12345   │
│   🕐 2:00 PM - 2:30 PM          │
│   [Edit] [Delete]               │
├─────────────────────────────────┤
│ ○ Downtown Office               │
│   📍 456 Business Ave, City      │
│   🕐 3:00 PM - 3:30 PM          │
│   [Edit] [Delete]               │
├─────────────────────────────────┤
│ [+ Add Another Location]         │
└─────────────────────────────────┘
```

#### 2.2 PickupLocationForm (Add/Edit)
**Location:** `components/PickupLocationForm.tsx`

Features:
- Type selector (Home, Custom, Restaurant, etc.)
- Address input with Google Maps autocomplete
- GPS coordinates display
- Time window picker
- Special instructions
- Google Maps preview

#### 2.3 CODPaymentSetup (In Listing Creation)
**Location:** `components/CODPaymentSetup.tsx`

Features:
- Toggle COD on/off
- Set confirmation timeout (default: 5 min)
- Set pickup time window
- Preview flow diagram

#### 2.4 OrderPickupSelection (Buyer Side)
**Location:** `components/OrderPickupSelection.tsx`

Features:
- Show all available pickup locations
- Map view
- Details: address, time, instructions
- Select one location
- Google Maps link to get directions

#### 2.5 CODConfirmationPopup (Seller Side)
**Location:** `components/CODConfirmationPopup.tsx`

Features:
- Auto-triggers ~5 min after time window closes
- Question: "Has the dish been sold and received payment?"
- Pre-filled amount (not editable, just confirmation)
- Yes/No buttons
- Deny reason (if No)
- Success confirmation

#### 2.6 EarningsCard (Dashboard)
**Location:** `components/EarningsCard.tsx`

Features:
- Total earnings this month
- COD vs Prepaid breakdown
- Pending vs Credited
- Transaction list with statuses

---

### **Phase 3: Screens & Logic**

#### 3.1 Create Listing - Update
**File:** `app/create-listing.tsx`

Changes:
- Add PickupLocationManager component
- Add CODPaymentSetup component
- Validate at least one pickup location
- Store pickup locations with listing

#### 3.2 Order Details - New
**File:** `app/(tabs)/order/[id].tsx` (update)

Changes:
- Show selected pickup location with map
- Display payment method
- For sellers: Show COD confirmation status
- For buyers: Show order status, pickup details

#### 3.3 Seller Dashboard - Update
**File:** `app/(tabs)/account.tsx` (update)

Add: Earnings section showing:
- Total earnings
- Breakdown by payment type
- Transaction history
- Withdrawal options

#### 3.4 Home Screen - Update
**File:** `app/(tabs)/index.tsx` (update)

Add: COD confirmation notifications
- Badge showing pending confirmations
- Quick access to confirm

---

### **Phase 4: Business Logic**

#### 4.1 Timer & Popup Logic
```typescript
// Service: CODConfirmationService

// When order is placed:
// 1. Calculate confirmation deadline = pickupTimeEnd + 5 minutes
// 2. Schedule check at deadline
// 3. If not yet confirmed, show popup

// Popup logic:
// - User clicks "Yes" → Show confirmation screen
// - User confirms amount → Update order status
// - Amount credited to seller wallet
// - Notification sent to buyer
```

#### 4.2 Notification Service
```typescript
// When order placed:
notificationService.notifySeller({
  type: 'new_order',
  orderId: order.id,
  buyerName: buyer.name,
  amount: order.totalAmount,
  pickupTime: order.pickupLocation.pickupTimeEnd,
  // Later: Send to WhatsApp
})
```

#### 4.3 Earnings Service
```typescript
// When COD confirmed:
earningsService.creditEarnings({
  sellerId: seller.id,
  orderId: order.id,
  amount: order.totalAmount,
  paymentMethod: 'cod',
  status: 'credited',
})

// Update seller's wallet balance
// Send notification to seller
```

---

### **Phase 5: Integration Points**

#### Supabase Tables (New)
```sql
-- Pickup Locations
CREATE TABLE pickup_locations (
  id UUID PRIMARY KEY,
  listing_id UUID REFERENCES food_listings(id),
  type VARCHAR(50),
  name VARCHAR(255),
  address JSONB,
  coordinates JSONB,
  google_maps_url TEXT,
  pickup_time_start VARCHAR(5),
  pickup_time_end VARCHAR(5),
  instructions TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Earnings
CREATE TABLE seller_earnings (
  id UUID PRIMARY KEY,
  seller_id UUID REFERENCES users(id),
  order_id UUID REFERENCES orders(id),
  amount DECIMAL(10,2),
  payment_method VARCHAR(50),
  status VARCHAR(50),
  credited_at TIMESTAMP,
  created_at TIMESTAMP
);

-- COD Status
CREATE TABLE cod_confirmations (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  seller_id UUID REFERENCES users(id),
  status VARCHAR(50),
  confirmed_amount DECIMAL(10,2),
  confirmed_at TIMESTAMP,
  confirmed_by_seller BOOLEAN,
  created_at TIMESTAMP
);
```

#### Update Orders Table
```sql
ALTER TABLE orders ADD COLUMN (
  payment_method VARCHAR(50),
  pickup_location_id UUID REFERENCES pickup_locations(id),
  cod_status VARCHAR(50)
);
```

---

## 🎯 WORKFLOW DIAGRAMS

### **COD Workflow (Seller)**
```
1. Create Listing
   ↓
2. Add Multiple Pickup Locations
   ↓
3. Enable COD + Set Time Window (e.g., 2:00 PM - 2:30 PM)
   ↓
4. Buyer Orders
   ↓
5. Seller Notification (WhatsApp ready)
   ↓
6. Pickup Time Window Passes
   ↓
7. ~5 Min After Window Closes → AUTO POPUP
   "Has dish been sold & payment received?"
   ↓
8a. Seller Confirms → Amount Credited to Wallet
8b. Seller Denies → Stays as Pending
   ↓
9. Reflect in Earnings Dashboard
```

### **Buyer Workflow**
```
1. Browse Listings
   ↓
2. Select Listing (with multiple pickup options)
   ↓
3. Choose Pickup Location (see map, address, time)
   ↓
4. Choose Payment (COD or Prepaid)
   ↓
5. Place Order
   ↓
6. Seller Gets Notification
   ↓
7. Pickup at Selected Location & Time
   ↓
8. Payment Made (COD) or Already Paid (Prepaid)
   ↓
9. Order Complete
```

---

## 🔧 TECHNICAL CONSIDERATIONS

### **Google Maps Integration**
- Use `react-native-maps` for map display
- Use Google Places API for address autocomplete
- Generate Maps URL for directions

### **Time Management**
- Store times in 24-hour format (HH:MM)
- Calculate timezones properly
- Use moment.js or date-fns for calculations

### **Notifications**
- Real-time: Firebase Cloud Messaging (FCM)
- WhatsApp: Twilio API (setup later)
- SMS fallback (optional)

### **State Management**
- Zustand store for earnings
- Zustand store for pending COD confirmations

### **Validation**
- At least one pickup location required
- Time window must be valid (end > start)
- Address must have valid coordinates
- Amount must be positive

---

## 📊 TESTING CHECKLIST

- [ ] Create listing with multiple pickup locations
- [ ] Select different pickup location when ordering
- [ ] COD confirmation popup appears after time window
- [ ] Confirm COD → Amount credited to earnings
- [ ] Deny COD → Stays pending
- [ ] Earnings dashboard shows transaction
- [ ] Map displays correctly with multiple pins
- [ ] Google Maps links work
- [ ] Address autocomplete works
- [ ] Time validation works
- [ ] Notifications sent to seller

---

## 🚀 IMPLEMENTATION TIMELINE

1. **Data Models** (1 hour) - Types, interfaces
2. **UI Components** (3 hours) - PickupLocationManager, Forms, Popups
3. **Business Logic** (2 hours) - Timers, notifications, earnings
4. **Screen Updates** (2 hours) - Create listing, order details
5. **Testing & Refinement** (1-2 hours)

**Total: 8-10 hours**

---

## 📝 NOTES

- WhatsApp integration scaffolded, to be connected later
- Google Maps API key needed (in env)
- Supabase migrations required
- Consider time zones (user's local time vs server time)
- Test with real pickup time windows

---

**Ready to implement? Let's build this feature!** 🚀
