-- ================================================================
-- AUTO-UPDATE TRIGGER FOR CHARTER_BOOKINGS
-- ================================================================
-- This trigger ensures updatedAt is ALWAYS updated when admin
-- modifies charter_bookings from their separate system
-- ================================================================

USE air_charters;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS charter_bookings_before_update;

-- Create trigger to auto-update updatedAt
DELIMITER $$

CREATE TRIGGER charter_bookings_before_update
BEFORE UPDATE ON charter_bookings
FOR EACH ROW
BEGIN
  -- Only update if the record actually changed
  IF NOT (
    NEW.totalPrice <=> OLD.totalPrice AND
    NEW.bookingStatus <=> OLD.bookingStatus AND
    NEW.paymentStatus <=> OLD.paymentStatus AND
    NEW.totalAdults <=> OLD.totalAdults AND
    NEW.totalChildren <=> OLD.totalChildren
  ) THEN
    SET NEW.updatedAt = NOW();
  END IF;
END$$

DELIMITER ;

-- ================================================================
-- TEST THE TRIGGER
-- ================================================================
-- Update a booking without specifying updatedAt:
-- UPDATE charter_bookings SET totalPrice = 5000.00 WHERE id = 1;
-- 
-- Verify updatedAt was auto-updated:
-- SELECT id, totalPrice, updatedAt FROM charter_bookings WHERE id = 1;
-- ================================================================

-- Show trigger was created successfully
SHOW TRIGGERS LIKE 'charter_bookings';

