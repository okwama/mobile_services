// Message Pattern Commands for Inter-Service Communication

// User Service Messages
export const USER_SERVICE_PATTERNS = {
  GET_USER: { cmd: 'get_user' },
  GET_USER_PROFILE: { cmd: 'get_user_profile' },
  VALIDATE_USER: { cmd: 'validate_user' },
  UPDATE_USER: { cmd: 'update_user' },
  GET_WALLET_BALANCE: { cmd: 'get_wallet_balance' },
};

// Charter Service Messages
export const CHARTER_SERVICE_PATTERNS = {
  GET_CHARTER_DEALS: { cmd: 'get_charter_deals' },
  GET_CHARTER_DEAL: { cmd: 'get_charter_deal' },
  FILTER_CHARTER_DEALS: { cmd: 'filter_charter_deals' },
  CHECK_AVAILABILITY: { cmd: 'check_availability' },
  RESERVE_AIRCRAFT: { cmd: 'reserve_aircraft' },
  RELEASE_AIRCRAFT: { cmd: 'release_aircraft' },
  GET_AMENITIES: { cmd: 'get_amenities' },
  GET_EXPERIENCES: { cmd: 'get_experiences' },
};

// Booking Service Messages
export const BOOKING_SERVICE_PATTERNS = {
  CREATE_BOOKING: { cmd: 'create_booking' },
  GET_BOOKING: { cmd: 'get_booking' },
  GET_USER_BOOKINGS: { cmd: 'get_user_bookings' },
  UPDATE_BOOKING_STATUS: { cmd: 'update_booking_status' },
  CANCEL_BOOKING: { cmd: 'cancel_booking' },
};

// Payment Service Messages
export const PAYMENT_SERVICE_PATTERNS = {
  INITIALIZE_PAYMENT: { cmd: 'initialize_payment' },
  VERIFY_PAYMENT: { cmd: 'verify_payment' },
  GET_PAYMENT: { cmd: 'get_payment' },
  CALCULATE_COMMISSION: { cmd: 'calculate_commission' },
  DISTRIBUTE_COMMISSION: { cmd: 'distribute_commission' },
};

// Communication Service Messages (Events)
export const COMMUNICATION_EVENTS = {
  SEND_EMAIL: 'send.email',
  SEND_SMS: 'send.sms',
  USER_REGISTERED: 'user.registered',
  BOOKING_CONFIRMED: 'booking.confirmed',
  PAYMENT_RECEIVED: 'payment.received',
  PAYMENT_FAILED: 'payment.failed',
};

// Location Service Messages
export const LOCATION_SERVICE_PATTERNS = {
  SEARCH_LOCATIONS: { cmd: 'search_locations' },
  GET_LOCATION: { cmd: 'get_location' },
  GET_ROUTE_INFO: { cmd: 'get_route_info' },
};

