-- ================================================================
-- BOOKING PRICE UPDATE HELPER
-- ================================================================
-- Use this script to update booking prices manually in the database
-- This ensures the updatedAt timestamp is updated so the change
-- detector can pick up the change and send notifications
-- ================================================================

USE air_charters;

-- Example: Update a booking price and mark as PRICED
-- Replace the values in WHERE clause with actual booking ID or reference

-- Option 1: Update by booking ID
UPDATE charter_bookings 
SET 
  totalPrice = 5000.00,              -- Set your price here
  bookingStatus = 'priced',          -- Mark as priced
  updatedAt = NOW()                   -- CRITICAL: Update timestamp
WHERE id = 1;                         -- Replace with actual booking ID

-- Option 2: Update by reference number
-- UPDATE charter_bookings 
-- SET 
--   totalPrice = 5000.00,
--   bookingStatus = 'priced',
--   updatedAt = NOW()
-- WHERE referenceNumber = 'CHR_20250114_ABC123';

-- ================================================================
-- VERIFY THE UPDATE
-- ================================================================
-- Check the booking was updated correctly:
SELECT 
  id,
  referenceNumber,
  userId,
  totalPrice,
  bookingStatus,
  paymentStatus,
  updatedAt
FROM charter_bookings 
WHERE id = 1;  -- Replace with your booking ID

-- ================================================================
-- IMPORTANT NOTES:
-- ================================================================
-- 1. Always set updatedAt = NOW() when updating manually
-- 2. The booking change detector runs every 30 seconds
-- 3. Wait up to 30 seconds for notification to be sent
-- 4. Check logs for: "Booking XXX was QUOTED: $XXXX"
-- 5. User should receive push notification and WebSocket update
-- ================================================================

