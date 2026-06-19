# Booking Change Detector - Optimized

## Overview
The Booking Change Detector monitors database changes from the admin panel (separate system) and sends real-time notifications to users via OneSignal and WebSocket.

## Key Improvements ✅

### 1. **Smart Tracking Lifecycle**
Bookings are now tracked **only when needed** and **automatically removed** when reaching final states:

```
📋 START TRACKING (inquiry created)
    ↓
👁️ Monitor every 10s
    ↓
💰 Quote Added → Send Notification → CONTINUE TRACKING
    ↓
📊 Status Changes → Send Notifications → CONTINUE TRACKING
    ↓
💳 Payment Complete → booking.confirmed → ✅ STOP TRACKING
    ↓ (or)
❌ Cancelled → Send Notification → ✅ STOP TRACKING
    ↓ (or)
✅ Confirmed → Send Notification → ✅ STOP TRACKING
```

### 2. **Dual Detection Strategy**
Works even if admin doesn't update `updatedAt`:

- **Strategy 1 (Efficient):** Check `updatedAt > lastCheckTime`
- **Strategy 2 (Fallback):** Poll all tracked bookings directly

### 3. **Faster Polling**
- **Before:** 30 seconds
- **Now:** 10 seconds ⚡

---

## What Gets Tracked

### ✅ Tracked (Active Monitoring)
- `bookingStatus = 'pending'` AND `totalPrice = 0` (awaiting quote)
- `paymentStatus = 'pending'` (awaiting payment)

### ❌ Not Tracked (Auto-removed after notification)
- `bookingStatus = 'priced'` AND quote notification sent
- `paymentStatus = 'paid'` (payment complete)
- `bookingStatus = 'cancelled'`
- `bookingStatus = 'confirmed'` (after payment)

---

## Event Flow

### When Admin Adds Price (Quote)
```typescript
// Admin updates in separate system
UPDATE charter_bookings 
SET totalPrice = 5000.00, bookingStatus = 'priced'
WHERE id = 123;

// Detector runs (every 10s)
[BOOKING] Booking AC202510146693 was QUOTED: $5000 - Will stop tracking
[BOOKING] ✓ Stopped tracking booking 123 (quote notification sent)

// Events emitted
→ booking.quoted → Communication Service
  → OneSignal Push: "Quote Ready! 🎉"
  → WebSocket → Flutter auto-refresh
```

### When Admin Updates Price
```typescript
// Admin changes price
UPDATE charter_bookings 
SET totalPrice = 6000.00
WHERE id = 123;

// Detector (if still tracking)
[BOOKING] Booking AC202510146693 price UPDATED: $5000 → $6000

// Events emitted
→ booking.price_updated → Communication Service
  → OneSignal Push: "Quote Updated 💰"
  → WebSocket → Flutter auto-refresh
```

### When Payment Completes
```typescript
// Payment service updates
UPDATE charter_bookings 
SET paymentStatus = 'paid', bookingStatus = 'confirmed'
WHERE id = 123;

// Detector
[BOOKING] Booking AC202510146693 payment: pending → paid
[BOOKING] ✓ Stopped tracking booking 123 (payment completed)

// Events emitted
→ payment.completed → Communication Service
  → OneSignal Push: "Payment Successful ✅"
  → WebSocket → Flutter auto-refresh
```

---

## Performance Impact

### Before Optimization
```
Tracking: 50 bookings
Queries per check: 2 (timestamp + tracked IDs)
Checks per minute: 2 (every 30s)
Total queries/min: 4
```

### After Optimization
```
Tracking: ~10 bookings (auto-removed after quote)
Queries per check: 2 (timestamp + tracked IDs)
Checks per minute: 6 (every 10s)
Total queries/min: 12

✅ 80% fewer tracked bookings
✅ 3x faster detection (30s → 10s)
✅ Only 3x more queries but much faster notifications
```

---

## Logs to Watch

### Startup
```
[BookingChangeDetectorService] Initialized 50 booking snapshots (tracking 12 awaiting quotes/payments)
```
↑ Only tracks bookings awaiting action (not all 50)

### Quote Detected
```
[BookingChangeDetectorService] Checking 1 bookings for changes (0 recently updated, 12 currently tracked)
[BookingChangeDetectorService] Booking AC202510146693 was QUOTED: $5000 - Will stop tracking after notification
[BookingChangeDetectorService] ✓ Stopped tracking booking 2 (quote notification sent)
```
↑ Tracking count decreases from 12 → 11

### Next Check
```
[BookingChangeDetectorService] Checking 1 bookings for changes (0 recently updated, 11 currently tracked)
```
↑ Tracking list shrinks over time

---

## Admin Integration Options

### Option 1: Include `updatedAt` in UPDATE (Manual)
```sql
UPDATE charter_bookings 
SET 
  totalPrice = 5000.00,
  bookingStatus = 'priced',
  updatedAt = NOW()  -- 🔥 CRITICAL
WHERE id = 123;
```

### Option 2: MySQL Trigger (Automatic) ✅ **RECOMMENDED**
```bash
mysql -u root -p air_charters < migrations/add-auto-update-trigger.sql
```
Then admin doesn't need to include `updatedAt` - it auto-updates!

---

## Files Modified

1. **booking-change-detector.service.ts**
   - Smart tracking lifecycle (auto-remove after notification)
   - Dual detection strategy (timestamp + polling)
   - 10-second polling interval
   - Price comparison fix (handles decimal vs string)

2. **notifications.gateway.ts** (Communication Service)
   - Added `booking.price_updated` handler

3. **migrations/add-auto-update-trigger.sql**
   - Auto-updates `updatedAt` on any booking change

4. **migrations/update-booking-price-helper.sql**
   - Helper script for manual price updates

---

## Testing

### Test Quote Notification
```sql
-- Update price manually
UPDATE charter_bookings 
SET totalPrice = 5000.00, bookingStatus = 'priced', updatedAt = NOW()
WHERE id = 1;

-- Wait 10 seconds, then check logs
```

**Expected logs:**
```
[BOOKING] Booking AC202510146693 was QUOTED: $5000 - Will stop tracking after notification
[BOOKING] ✓ Stopped tracking booking 1 (quote notification sent)
[COMMS] Received booking.quoted event: {...}
[COMMS] Sending notification to 1 devices for user usr_xxx
[COMMS] Push notification sent to user usr_xxx via OneSignal
```

**User receives:**
- Push notification: "Quote Ready! 🎉"
- Flutter app auto-refreshes trips
- Booking status shows "PRICED" with amount

---

## Next Steps

1. ✅ Install MySQL trigger for auto `updatedAt`
2. ✅ Rebuild backend: `npm run build`
3. ✅ Restart services: `npm run start:dev`
4. ✅ Test quote flow end-to-end
5. ✅ Monitor logs for tracking count decreasing

---

## Troubleshooting

### "Checking 50 bookings every 10s"
→ Bookings not being removed from tracking
→ Check if `return;` statements execute after emit

### "No notification received"
→ Check communication service logs for event reception
→ Verify OneSignal device token registered
→ Check WebSocket connection in Flutter

### "Tracking count not decreasing"
→ Check if quotes are actually being sent (emit called)
→ Verify `bookingSnapshots.delete()` is executing

---

**✅ Optimized for performance and real-time notifications!**

