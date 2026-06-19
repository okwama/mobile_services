-- Adminer 5.4.1 MySQL 8.0.43-0ubuntu0.22.04.2 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

DROP TABLE IF EXISTS `adminNotifications`;
CREATE TABLE `adminNotifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `target` enum('citAdmin','superadmin','companyAdmin','agent','vehicleCompanyAdmin','yachtCompanyAdmin') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `read` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `agent_details`;
CREATE TABLE `agent_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `adminId` int NOT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `imagePublicIdUrl` varchar(255) DEFAULT NULL,
  `licenseUrl` varchar(255) DEFAULT NULL,
  `licensePublicIdUrl` varchar(255) DEFAULT NULL,
  `agreementFormUrl` varchar(255) DEFAULT NULL,
  `agreementFormPublicIdUrl` varchar(255) DEFAULT NULL,
  `idPassportNumber` varchar(255) DEFAULT NULL,
  `mobileNumber` varchar(255) DEFAULT NULL,
  `aocNumber` varchar(255) DEFAULT NULL,
  `companyName` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `adminId` (`adminId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `aircraft_amenities`;
CREATE TABLE `aircraft_amenities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aircraftId` int DEFAULT NULL,
  `amenityId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `aircraftId` (`aircraftId`),
  KEY `amenityId` (`amenityId`),
  CONSTRAINT `aircraft_amenities_ibfk_1` FOREIGN KEY (`aircraftId`) REFERENCES `aircrafts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `aircraft_amenities_ibfk_2` FOREIGN KEY (`amenityId`) REFERENCES `amenities` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `aircraft_blockouts`;
CREATE TABLE `aircraft_blockouts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aircraftId` int NOT NULL COMMENT 'Reference to the aircraft that is being blocked.',
  `companyId` int NOT NULL COMMENT 'The company that owns the aircraft and is creating the block.',
  `startDateTime` datetime NOT NULL COMMENT 'The precise start date and time of the blockout period.',
  `endDateTime` datetime NOT NULL COMMENT 'The precise end date and time of the blockout period.',
  `type` enum('BOOKING','MAINTENANCE') NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `aircraftId` (`aircraftId`),
  KEY `companyId` (`companyId`),
  CONSTRAINT `aircraft_blockouts_ibfk_1` FOREIGN KEY (`aircraftId`) REFERENCES `aircrafts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `aircraft_blockouts_ibfk_2` FOREIGN KEY (`companyId`) REFERENCES `charters_companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


SET NAMES utf8mb4;

DROP TABLE IF EXISTS `aircraft_calendar`;
CREATE TABLE `aircraft_calendar` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aircraftId` int NOT NULL,
  `companyId` int NOT NULL,
  `startDateTime` datetime NOT NULL,
  `endDateTime` datetime NOT NULL,
  `eventType` enum('available','booked','maintenance','blocked') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'available',
  `bookingId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `originAirport` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `destinationAirport` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `passengerCount` int DEFAULT NULL,
  `totalPrice` decimal(10,2) DEFAULT NULL,
  `pricePerHour` decimal(10,2) DEFAULT NULL,
  `repositioningCost` decimal(10,2) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_aircraft_time` (`aircraftId`,`startDateTime`,`endDateTime`),
  KEY `idx_event_type` (`eventType`),
  KEY `idx_booking` (`bookingId`),
  KEY `companyId` (`companyId`),
  KEY `idx_aircraft_calendar_search` (`aircraftId`,`startDateTime`,`endDateTime`,`eventType`),
  KEY `idx_aircraft_calendar_availability` (`eventType`,`startDateTime`,`endDateTime`),
  CONSTRAINT `aircraft_calendar_ibfk_1` FOREIGN KEY (`aircraftId`) REFERENCES `aircrafts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `aircraft_calendar_ibfk_2` FOREIGN KEY (`companyId`) REFERENCES `charters_companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `aircraft_images`;
CREATE TABLE `aircraft_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aircraftId` int NOT NULL,
  `category` varchar(50) NOT NULL,
  `url` text NOT NULL,
  `publicId` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `aircraftId` (`aircraftId`),
  KEY `idx_aircraft_images_aircraft_id` (`aircraftId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `aircraft_type_image_placeholders`;
CREATE TABLE `aircraft_type_image_placeholders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('helicopter','fixedWing','jet','glider','seaplane','ultralight','balloon','tiltrotor','gyroplane','airship') NOT NULL,
  `placeholderImageUrl` varchar(255) NOT NULL COMMENT 'Full URL to the placeholder image',
  `placeholderImagePublicId` varchar(255) NOT NULL COMMENT 'Cloud storage public ID (e.g., Cloudinary public_id)',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `aircrafts`;
CREATE TABLE `aircrafts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `companyId` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `registrationNumber` varchar(20) NOT NULL,
  `type` enum('helicopter','fixedWing','jet','glider','seaplane','ultralight','balloon','tiltrotor','gyroplane','airship') NOT NULL,
  `model` varchar(100) DEFAULT NULL,
  `manufacturer` varchar(100) DEFAULT NULL,
  `yearManufactured` int DEFAULT NULL,
  `capacity` int NOT NULL,
  `isAvailable` tinyint NOT NULL DEFAULT '1',
  `maintenanceStatus` enum('operational','maintenance','out_of_service') NOT NULL DEFAULT 'operational',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `pricePerHour` decimal(10,2) DEFAULT NULL,
  `cruiseSpeedKnots` int DEFAULT NULL,
  `baseAirport` varchar(100) DEFAULT NULL COMMENT 'Specific airport or airstrip where the aircraft is stationed',
  `baseCity` varchar(100) DEFAULT NULL COMMENT 'City or town associated with the base airport',
  `aircraftTypeImagePlaceholderId` int DEFAULT NULL,
  `serviceType` enum('cargo','medical') DEFAULT NULL COMMENT 'Specifies if the aircraft is for cargo, medical, or null for normal charters',
  `maxLuggageCapacity` int DEFAULT NULL COMMENT 'Maximum allowed luggage per passenger in kilograms',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_f07333b2229059cc039b6bc2c8` (`registrationNumber`),
  KEY `idx_aircrafts_company_id` (`companyId`),
  KEY `idx_aircrafts_type` (`type`),
  KEY `idx_aircrafts_is_available` (`isAvailable`),
  KEY `idx_aircrafts_maintenance_status` (`maintenanceStatus`),
  KEY `idx_aircrafts_available_maintenance` (`isAvailable`,`maintenanceStatus`),
  KEY `idx_aircrafts_type_available` (`type`,`isAvailable`),
  KEY `idx_aircrafts_complete` (`companyId`,`type`,`isAvailable`,`maintenanceStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `amenities`;
CREATE TABLE `amenities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `backup_logs`;
CREATE TABLE `backup_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` enum('success','failed','running') NOT NULL,
  `backup_size` bigint DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `duration_seconds` int DEFAULT NULL,
  `error_message` text,
  `r2_url` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `booking_timeline`;
CREATE TABLE `booking_timeline` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bookingId` varchar(255) NOT NULL,
  `eventType` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `oldValue` varchar(255) DEFAULT NULL,
  `newValue` varchar(255) DEFAULT NULL,
  `metadata` longtext,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `bookingId` (`bookingId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `charter_booking_stops`;
CREATE TABLE `charter_booking_stops` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `stop_name` varchar(255) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `datetime` datetime DEFAULT NULL,
  `stop_order` int NOT NULL DEFAULT '1',
  `location_type` enum('airport','city','custom') DEFAULT 'custom',
  `location_code` varchar(50) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  CONSTRAINT `charter_booking_stops_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `charter_bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `charter_bookings`;
CREATE TABLE `charter_bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` varchar(255) NOT NULL COMMENT 'ID of the user who made the booking',
  `companyId` int NOT NULL,
  `aircraftId` int DEFAULT NULL COMMENT 'ID of the aircraft if it is a direct charter',
  `bookingType` enum('direct','deal','experience') NOT NULL COMMENT 'Determines whether it is a direct charter, deal, or experience',
  `dealId` int DEFAULT NULL COMMENT 'ID of the deal if it is a deal booking',
  `experienceTemplateId` int DEFAULT NULL,
  `totalPrice` decimal(10,2) DEFAULT NULL COMMENT 'Total price of the booking including tax',
  `taxType` varchar(50) DEFAULT NULL COMMENT 'e.g., VAT, GST, Sales Tax, etc.',
  `taxAmount` decimal(10,2) DEFAULT NULL COMMENT 'Tax amount for the booking',
  `subtotal` decimal(10,2) DEFAULT NULL COMMENT 'Subtotal of the booking before tax',
  `bookingStatus` enum('pending','priced','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
  `paymentStatus` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  `referenceNumber` varchar(50) NOT NULL,
  `specialRequirements` text,
  `adminNotes` text COMMENT 'Notes or feedback from the admin regarding this booking',
  `originName` varchar(255) DEFAULT NULL COMMENT 'Name of the origin',
  `originLatitude` decimal(10,7) DEFAULT NULL,
  `originLongitude` decimal(10,7) DEFAULT NULL,
  `destinationName` varchar(255) DEFAULT NULL COMMENT 'Name of the destination',
  `destinationLatitude` decimal(10,7) DEFAULT NULL COMMENT 'Latitude of the destination',
  `destinationLongitude` decimal(10,7) DEFAULT NULL COMMENT 'Longitude of the destination',
  `departureDateTime` datetime DEFAULT NULL COMMENT 'Scheduled departure date and time of the flight if its a direct charter null if its a deal or experience',
  `estimatedFlightHours` decimal(5,2) DEFAULT NULL COMMENT 'Estimated duration of the flight in hours',
  `distanceNm` decimal(10,2) DEFAULT NULL,
  `estimatedArrivalTime` datetime DEFAULT NULL COMMENT 'Estimated arrival date and time of the flight',
  `createdAt` datetime NOT NULL,
  `totalAdults` int DEFAULT '0' COMMENT 'Number of adult passengers for the booking',
  `totalChildren` int DEFAULT '0' COMMENT 'Number of child passengers for the booking',
  `onboardDining` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Indicates if onboard dining is included in the booking',
  `updatedAt` datetime NOT NULL,
  `baseAircraftCost` decimal(10,2) DEFAULT NULL COMMENT 'Base cost of renting the aircraft (before extra charges)',
  `handlingFee` decimal(10,2) DEFAULT NULL COMMENT 'Airport handling fee',
  `airportCharge` decimal(10,2) DEFAULT NULL COMMENT 'Airport landing/parking/passenger charges',
  `thirdPartyCharge` decimal(10,2) DEFAULT NULL COMMENT 'Charges from third-party vendors (e.g., catering, limo)',
  `fuelCharge` decimal(10,2) DEFAULT NULL COMMENT 'Fuel surcharge',
  PRIMARY KEY (`id`),
  UNIQUE KEY `referenceNumber` (`referenceNumber`),
  KEY `userId` (`userId`),
  KEY `companyId` (`companyId`),
  KEY `aircraftId` (`aircraftId`),
  KEY `dealId` (`dealId`),
  KEY `experienceScheduleId` (`experienceTemplateId`),
  CONSTRAINT `charter_bookings_experienceTemplateId_fk` FOREIGN KEY (`experienceTemplateId`) REFERENCES `experience_templates` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `charter_bookings_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `charter_bookings_ibfk_2` FOREIGN KEY (`companyId`) REFERENCES `charters_companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `charter_bookings_ibfk_3` FOREIGN KEY (`aircraftId`) REFERENCES `aircrafts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `charter_bookings_ibfk_4` FOREIGN KEY (`dealId`) REFERENCES `charter_deals` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `charter_deal_amenities`;
CREATE TABLE `charter_deal_amenities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dealId` int DEFAULT NULL,
  `amenityId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `dealId` (`dealId`),
  KEY `amenityId` (`amenityId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `charter_deals`;
CREATE TABLE `charter_deals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `companyId` int NOT NULL,
  `aircraftId` int NOT NULL,
  `originName` varchar(255) NOT NULL,
  `originLatitude` decimal(10,7) NOT NULL,
  `originLongitude` decimal(10,7) NOT NULL,
  `destinationName` varchar(255) NOT NULL,
  `destinationLatitude` decimal(10,7) NOT NULL,
  `destinationLongitude` decimal(10,7) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `pricePerSeat` decimal(10,2) NOT NULL,
  `discountPerSeat` int DEFAULT '0',
  `taxType` varchar(255) DEFAULT NULL COMMENT 'Type of tax applied to the deal',
  `taxAmount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT 'Tax amount applied to the deal',
  `total` decimal(10,2) NOT NULL COMMENT 'Total amount of the deal',
  `availableSeats` int NOT NULL,
  `estimatedFlightTimeMinutes` int NOT NULL COMMENT 'Estimated flight time in minutes',
  `turnaroundBufferMinutes` int DEFAULT '30' COMMENT 'Buffer time after landing before aircraft is available again',
  `pilotId` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `fixedRouteId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pilotId` (`pilotId`),
  KEY `fixedRouteId` (`fixedRouteId`),
  KEY `idx_charter_deals_company_id` (`companyId`),
  KEY `idx_charter_deals_aircraft_id` (`aircraftId`),
  KEY `idx_charter_deals_date` (`date`),
  KEY `idx_charter_deals_origin_destination` (`originName`,`destinationName`),
  KEY `idx_charter_deals_company_date` (`companyId`,`date`),
  KEY `idx_charter_deals_aircraft_date` (`aircraftId`,`date`),
  KEY `idx_charter_deals_complete` (`companyId`,`aircraftId`,`date`,`availableSeats`),
  CONSTRAINT `charter_deals_ibfk_1` FOREIGN KEY (`companyId`) REFERENCES `charters_companies` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `charter_deals_ibfk_2` FOREIGN KEY (`aircraftId`) REFERENCES `aircrafts` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `charter_deals_ibfk_3` FOREIGN KEY (`pilotId`) REFERENCES `pilots` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `charter_deals_ibfk_4` FOREIGN KEY (`fixedRouteId`) REFERENCES `fixed_routes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `charter_passengers`;
CREATE TABLE `charter_passengers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `age` int DEFAULT NULL,
  `nationality` varchar(100) DEFAULT NULL,
  `id_passport_number` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_user` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  CONSTRAINT `charter_passengers_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `charter_bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `charters_admins`;
CREATE TABLE `charters_admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(255) NOT NULL,
  `middleName` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `isDefaultPassword` tinyint(1) NOT NULL DEFAULT '1',
  `role` enum('citAdmin','superadmin','companyAdmin','agent','vehicleCompanyAdmin','yachtCompanyAdmin') DEFAULT 'citAdmin',
  `companyId` int DEFAULT NULL,
  `agentDetailsId` int DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `vehicleCompanyId` int DEFAULT NULL COMMENT 'Reference to vehicle company for vehicle admins',
  `yachtCompanyId` int DEFAULT NULL COMMENT 'Reference to yacht company for yacht admins',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`),
  KEY `companyId` (`companyId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `charters_companies`;
CREATE TABLE `charters_companies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `companyName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `contactPersonFirstName` varchar(255) NOT NULL,
  `contactPersonLastName` varchar(255) NOT NULL,
  `mobileNumber` varchar(255) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `country` varchar(255) NOT NULL,
  `licenseNumber` varchar(255) NOT NULL,
  `license` varchar(255) DEFAULT NULL,
  `licensePublicId` varchar(255) DEFAULT NULL,
  `logoPublicId` varchar(255) DEFAULT NULL,
  `onboardedBy` varchar(255) NOT NULL,
  `adminId` int NOT NULL,
  `status` enum('pendingReview','active','inactive','rejected','draft') NOT NULL DEFAULT 'draft',
  `agreementForm` varchar(255) DEFAULT NULL,
  `agreementFormPublicId` varchar(255) DEFAULT NULL,
  `approvedBy` varchar(255) DEFAULT NULL,
  `approvedAt` datetime DEFAULT NULL,
  `reviewRemarks` text,
  `revenueShareRate` decimal(5,2) NOT NULL DEFAULT '0.00',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_charters_companies_status` (`status`),
  KEY `idx_charters_companies_name` (`companyName`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `commission_payout_transactions`;
CREATE TABLE `commission_payout_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `transactionId` varchar(255) NOT NULL COMMENT 'Stripe PaymentIntent ID or Charge ID',
  `amount` decimal(10,2) NOT NULL COMMENT 'Total transaction amount paid',
  `currency` varchar(10) NOT NULL DEFAULT 'usd' COMMENT 'Currency of the transaction',
  `status` enum('succeeded','pending','failed','refunded') NOT NULL DEFAULT 'pending' COMMENT 'Status of the transaction',
  `paymentMethod` varchar(255) DEFAULT NULL COMMENT 'Card, wallet, or other payment method used',
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin COMMENT 'Extra data from Stripe (customer email, last4, etc.)',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `companyId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transactionId` (`transactionId`),
  CONSTRAINT `commission_payout_transactions_chk_1` CHECK (json_valid(`metadata`))
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `commissions`;
CREATE TABLE `commissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bookingId` int NOT NULL COMMENT 'ID of the booking this commission is for',
  `companyId` int NOT NULL COMMENT 'ID of the company that owes this commission',
  `bookingTotal` decimal(10,2) NOT NULL COMMENT 'Original booking total amount',
  `taxAmount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT 'Tax amount deducted from booking total',
  `revenueShareRate` decimal(5,2) NOT NULL COMMENT 'Commission rate as percentage (e.g., 15.00 for 15%)',
  `commissionAmount` decimal(10,2) NOT NULL COMMENT 'Calculated commission amount: (bookingTotal - taxAmount) * revenueShareRate / 100',
  `status` enum('pending','owed','paid','cancelled') NOT NULL DEFAULT 'pending' COMMENT 'Current status of this commission',
  `paidAt` datetime DEFAULT NULL COMMENT 'Date when commission was paid by company',
  `transactionId` varchar(255) DEFAULT NULL COMMENT 'Transaction ID for the payment, can be null if not paid yet',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `bookingId` (`bookingId`),
  KEY `companyId` (`companyId`),
  CONSTRAINT `commissions_ibfk_1` FOREIGN KEY (`bookingId`) REFERENCES `charter_bookings` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `commissions_ibfk_2` FOREIGN KEY (`companyId`) REFERENCES `charters_companies` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `company_payment_accounts`;
CREATE TABLE `company_payment_accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `companyId` int NOT NULL,
  `paymentProvider` enum('stripe','mpesa','paystack') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `accountType` enum('express','custom','standard') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'express',
  `accountId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `paystackSubaccountId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `accountStatus` enum('pending','active','suspended','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `verificationStatus` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `country` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `capabilities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `requirements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `businessProfile` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `bankAccountInfo` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `onboardingUrl` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dashboardUrl` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lastPayoutDate` datetime DEFAULT NULL,
  `totalPayouts` decimal(15,2) NOT NULL DEFAULT '0.00',
  `pendingBalance` decimal(15,2) NOT NULL DEFAULT '0.00',
  `availableBalance` decimal(15,2) NOT NULL DEFAULT '0.00',
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_account_id` (`accountId`),
  KEY `idx_company_provider` (`companyId`,`paymentProvider`),
  KEY `idx_account_status` (`accountStatus`),
  KEY `idx_is_active` (`isActive`),
  KEY `idx_company_payment_accounts_created_at` (`createdAt`),
  KEY `idx_company_payment_accounts_updated_at` (`updatedAt`),
  CONSTRAINT `fk_company_payment_accounts_company` FOREIGN KEY (`companyId`) REFERENCES `charters_companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `company_payment_accounts_chk_1` CHECK (json_valid(`capabilities`)),
  CONSTRAINT `company_payment_accounts_chk_2` CHECK (json_valid(`requirements`)),
  CONSTRAINT `company_payment_accounts_chk_3` CHECK (json_valid(`businessProfile`)),
  CONSTRAINT `company_payment_accounts_chk_4` CHECK (json_valid(`bankAccountInfo`)),
  CONSTRAINT `company_payment_accounts_chk_5` CHECK (json_valid(`metadata`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `device_tokens`;
CREATE TABLE `device_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `player_id` varchar(255) NOT NULL,
  `device_type` enum('android','ios','web') NOT NULL,
  `device_model` varchar(255) DEFAULT NULL,
  `os_version` varchar(50) DEFAULT NULL,
  `app_version` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_active_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_player_id` (`player_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_user_active` (`user_id`,`is_active`),
  KEY `idx_device_active_updated` (`is_active`,`updated_at`),
  CONSTRAINT `fk_device_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Stores OneSignal player IDs for push notifications';


DROP TABLE IF EXISTS `drivers`;
CREATE TABLE `drivers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `idNumber` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `imagePublicId` varchar(255) DEFAULT NULL,
  `rate` float NOT NULL DEFAULT '0',
  `companyId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `companyId` (`companyId`),
  CONSTRAINT `drivers_ibfk_1` FOREIGN KEY (`companyId`) REFERENCES `vehicle_companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `experience_images`;
CREATE TABLE `experience_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `experienceId` int NOT NULL,
  `imageSlot` varchar(50) NOT NULL COMMENT 'eg: image1, image2, image3 etc.',
  `url` text NOT NULL,
  `publicId` varchar(255) NOT NULL,
  `sortOrder` int DEFAULT '0' COMMENT 'For controlling display sequence',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `experienceId` (`experienceId`),
  CONSTRAINT `experience_images_ibfk_1` FOREIGN KEY (`experienceId`) REFERENCES `experience_templates` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `experience_schedules`;
CREATE TABLE `experience_schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `experienceId` int NOT NULL,
  `companyId` int NOT NULL,
  `aircraftId` int DEFAULT NULL,
  `startTime` datetime NOT NULL,
  `endTime` datetime DEFAULT NULL,
  `priceUnit` enum('per_person','per_group','per_hour','per_flight') DEFAULT 'per_person',
  `taxType` varchar(255) DEFAULT '0' COMMENT 'Type of tax applied (e.g., VAT, GST, Service Tax, etc.)',
  `taxAmount` decimal(10,2) DEFAULT '0.00' COMMENT 'Tax amount for the experience',
  `subTotal` decimal(10,2) NOT NULL COMMENT 'Amount before tax',
  `total` decimal(10,2) NOT NULL COMMENT 'Amount after tax',
  `durationMinutes` int NOT NULL COMMENT 'Total experience duration in minutes',
  `seatsAvailable` int NOT NULL COMMENT 'Number of seats available',
  `status` enum('scheduled','cancelled','completed') NOT NULL DEFAULT 'scheduled',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `experienceId` (`experienceId`),
  KEY `companyId` (`companyId`),
  KEY `aircraftId` (`aircraftId`),
  CONSTRAINT `experience_schedules_ibfk_1` FOREIGN KEY (`experienceId`) REFERENCES `experience_templates` (`id`),
  CONSTRAINT `experience_schedules_ibfk_2` FOREIGN KEY (`companyId`) REFERENCES `charters_companies` (`id`),
  CONSTRAINT `experience_schedules_ibfk_3` FOREIGN KEY (`aircraftId`) REFERENCES `aircrafts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `experience_templates`;
CREATE TABLE `experience_templates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `companyId` int DEFAULT NULL,
  `yachtCompanyId` int DEFAULT NULL,
  `title` varchar(100) NOT NULL COMMENT 'Experience title',
  `description` text NOT NULL COMMENT 'Experience description',
  `category` enum('scenic_flights','aerial_safaris','luxury_transfers','special_occasions','adventure_access','flight_training','sunrise_flights','champagne_flights','wildlife_ballooning','festival_flights','romantic_flights','private_group_flights','island_hopping','sunset_cruises','luxury_events','snorkeling_trips','fishing_expeditions','coastal_exploration') NOT NULL DEFAULT 'scenic_flights',
  `experienceType` enum('aircraft','balloon','yachts') NOT NULL,
  `country` varchar(100) NOT NULL,
  `city` varchar(100) NOT NULL,
  `locationName` varchar(150) DEFAULT NULL COMMENT 'E.g., Maasai Mara National Reserve, Diani Beach, Wilson Airport',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `termsConditions` text,
  `taxType` varchar(255) DEFAULT NULL COMMENT 'Type of tax applied (e.g., VAT, GST, Service Tax, etc.)',
  `taxAmount` decimal(10,2) DEFAULT '0.00' COMMENT 'Tax amount for the experience',
  `serviceFee` decimal(10,2) NOT NULL DEFAULT '3.87' COMMENT 'Service fee applied per experience booking',
  `subTotal` decimal(10,2) NOT NULL COMMENT 'Amount before tax',
  `total` decimal(10,2) NOT NULL COMMENT 'Amount after tax',
  `childPrice` decimal(10,2) DEFAULT NULL COMMENT 'Child price for balloon or yacht experiences',
  `durationMinutes` int NOT NULL COMMENT 'Total experience duration in minutes',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `companyId` (`companyId`),
  CONSTRAINT `experience_templates_ibfk_1` FOREIGN KEY (`companyId`) REFERENCES `charters_companies` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `experience_templates` (`id`, `companyId`, `yachtCompanyId`, `title`, `description`, `category`, `experienceType`, `country`, `city`, `locationName`, `isActive`, `termsConditions`, `taxType`, `taxAmount`, `serviceFee`, `subTotal`, `total`, `childPrice`, `durationMinutes`, `createdAt`, `updatedAt`) VALUES
(2,	11,	NULL,	'Nairobi Skyline Helicopter Tour',	'15-minute helicopter ride over Nairobi\'s most iconic landmarks including the CBD, KICC, and Nairobi National Park.',	'scenic_flights',	'aircraft',	'Kenya',	'Nairobi',	'Nairobi city',	1,	'Maximum weight per passenger: 120kg. Children under 5 not permitted. Flights subject to weather conditions. 24-hour cancellation policy.',	'VAT',	300.00,	3.87,	1000.00,	1300.00,	NULL,	200,	'2025-08-18 07:26:28',	'2025-09-30 09:36:57'),
(3,	11,	NULL,	'Mount Kenya Scenic Helicopter Flight',	'Enjoy a breathtaking aerial tour around Mount Kenya, Africa\'s second-highest peak. Witness glaciers, alpine lakes, and wildlife from the comfort of a private helicopter.',	'scenic_flights',	'aircraft',	'Kenya',	'Nanyuki',	'Mount Kenya National Park',	1,	'Flights are subject to weather conditions. Passengers must carry valid identification.',	'VAT',	320.00,	3.87,	2000.00,	2320.00,	NULL,	360,	'2025-08-18 11:24:54',	'2025-09-30 09:45:30'),
(4,	11,	NULL,	'Lake Turkana Helicopter Adventure',	'Soar over Kenya’s wild north and witness the breathtaking Jade Sea from above. This exclusive helicopter safari takes you across volcanic landscapes, crocodile-infested Central Island, and the surreal desert beauty of Lake Turkana. Perfect for thrill-seekers and photographers.',	'scenic_flights',	'aircraft',	'Kenya',	'Marsabit',	'Lake Turkana & Central Island',	1,	'Subject to weather conditions. Minimum booking of 2 passengers.',	NULL,	0.00,	3.87,	2000.00,	2000.00,	NULL,	120,	'2025-08-19 06:55:34',	'2025-09-30 08:46:12'),
(5,	11,	NULL,	'Helicopter Safari over Maasai Mara',	'Experience the breathtaking Maasai Mara from the sky. Fly over vast savannahs, witness the Great Migration, and land at secluded spots inaccessible by road. Perfect for wildlife photography and a unique safari adventure.',	'scenic_flights',	'aircraft',	'Kenya',	'Narok',	'Maasai Mara',	1,	'Flights are subject to weather conditions. Minimum of 2 passengers per booking. Children under 12 must be accompanied by an adult. Wildlife sightings cannot be guaranteed.',	'VAT',	300.00,	3.87,	4000.00,	4300.00,	NULL,	300,	'2025-08-19 08:41:13',	'2025-09-30 08:38:47'),
(6,	43,	NULL,	'Serengeti National Park',	'A visit to the Serengeti National Park in Tanzania‚ will give you the opportunity to view some of the most amazing animals in the world.',	'scenic_flights',	'aircraft',	'Tanzania, United Republic of',	'Serengeti',	'Tanzania',	1,	'',	NULL,	0.00,	3.87,	0.00,	0.00,	NULL,	0,	'2025-08-21 09:05:42',	'2025-08-21 09:05:42'),
(7,	43,	NULL,	'Gorilla Trekking',	'Experience an intimate encounter with mountain gorillas in Volcanoes National Park.',	'scenic_flights',	'aircraft',	'Rwanda',	'Kigali',	'Volcanoes National Park',	1,	'',	NULL,	0.00,	3.87,	0.00,	0.00,	NULL,	0,	'2025-08-21 09:10:42',	'2025-08-21 09:10:42'),
(8,	17,	NULL,	'Amboseli Elephant Swamps',	'A scenic flight over the Amboseli elephant swamps reveals a breathtaking tapestry where lush, green wetlands meet the arid savannah. Elephants wade gracefully through shimmering mountain spring waters, casting long shadows in the golden light. The towering peak of Mount Kilimanjaro looms in the distance, its snow-capped summit contrasting with the vibrant landscape below, creating a sense of wonder and timeless beauty.',	'scenic_flights',	'aircraft',	'Kenya',	'Nairobi',	'Amboseli',	1,	'',	NULL,	0.00,	3.87,	0.00,	0.00,	NULL,	0,	'2025-09-16 10:40:25',	'2025-09-16 10:40:25'),
(9,	17,	NULL,	'Samburu Ewaso Ng\'iro River ',	'A low-level scenic flight along the Ewaso Ng\'iro River in Samburu unveils a stunning panorama of winding waters cutting through the arid landscape. The river\'s emerald banks are alive with wildlife, from elephants drinking on the riverbank, to graceful giraffes browsing nearby acacia trees. The contrast between the lush riverine oasis and the surrounding rugged terrain adds to the enchantment, capturing the raw beauty and vibrant life of Kenya\'s untamed wilderness.',	'scenic_flights',	'aircraft',	'Kenya',	'Nairobi',	'Samburu',	1,	'',	NULL,	0.00,	3.87,	0.00,	0.00,	NULL,	0,	'2025-09-16 10:49:32',	'2025-09-16 10:49:32'),
(10,	17,	NULL,	'Masai Mara Extended Game Flight',	'Game viewing over the Masai Mara offers a mesmerizing bird\'s-eye view of one of Africa\'s most iconic landscapes. Add extra minutes to with an extended game viewing flight and glide above the vast golden plains, as the spectacle of wildlife unfolds below—herds of wildebeest, zebras, and antelopes dot the savannah, while clusters of elephants and solitary lions roam freely. The Mara River winds its way through the landscape, its banks teeming with hippos and crocodiles. No matter the time of day, the sun bathes the land in warm hues, casting long shadows across the rolling hills and acacia-dotted grasslands, evoking a sense of timelessness and wonder.',	'scenic_flights',	'aircraft',	'Kenya',	'Nairobi',	'Masai Mara',	1,	'',	NULL,	0.00,	3.87,	0.00,	0.00,	NULL,	0,	'2025-09-16 10:52:14',	'2025-09-16 10:52:14'),
(11,	17,	NULL,	'Mt. Kenya Scenic Flight',	'Any flight to the north of Kenya offers the opportunity to reveal the majestic beauty of Africa’s second-highest peak. The jagged, glacier-capped summits pierce the sky, surrounded by lush forests and alpine meadows. As you circle the mountain, you catch glimpses of cascading waterfalls and the shimmering tarns nestled in high valleys. The contrast between the rugged cliffs and the soft, misty clouds adds to the mountain\'s mystical allure, creating a truly awe-inspiring experience. This flight is entirely weather dependent.',	'scenic_flights',	'aircraft',	'Kenya',	'Nairobi',	'Mt. Kenya',	1,	'',	NULL,	0.00,	3.87,	0.00,	0.00,	NULL,	0,	'2025-09-16 11:03:45',	'2025-09-16 11:03:45'),
(12,	17,	NULL,	'The Southern Flamingo Lakes',	'The southern soda lakes of Magadi and Natron are home to 75% of the 3.2 million lesser Flamingo. A scenic flight over the sister lakes unveils a dazzling spectacle where shimmering pink flocks blanket the vivid waters. The soda lakes’ brilliant colors—rich reds and deep blues—contrast with the arid landscape, creating a surreal, almost otherworldly scene. Flamingos gather in vast numbers, painting the lake\'s surface with life and motion, while the rugged volcanic terrain and salt-crusted shores add to the enchantment of this natural wonder. Add extra minutes to your Masai Mara private charter or extend and add this amazing flight to link Amboseli and Masai Mara on your private charter flight.',	'scenic_flights',	'aircraft',	'Kenya',	'Nairobi',	' Magadi & Natron',	1,	'',	NULL,	0.00,	3.87,	0.00,	0.00,	NULL,	0,	'2025-09-16 11:05:44',	'2025-09-16 11:05:44'),
(13,	17,	NULL,	' Amboseli & the Flamingo Lakes',	'The flight from Amboseli to Lake Natron offers a captivating journey over diverse landscapes. Departing from the shadow of Mount Kilimanjaro, the route traverses the vast, open plains and golden savannahs of southern Kenya. As you head toward the Great Rift Valley, the scenery shifts to dramatic escarpments and volcanic hills. Approaching Lake Natron, the view transforms into a surreal mosaic of red and pink waters, with the lake\'s mirror-like surface dotted by thousands of flamingos. The rugged terrain and scattered Maasai villages below add a touch of cultural richness to this breathtaking aerial adventure.',	'scenic_flights',	'aircraft',	'Kenya',	'Nairobi',	'Amboseli',	1,	'',	NULL,	0.00,	3.87,	0.00,	0.00,	NULL,	0,	'2025-09-16 11:10:52',	'2025-09-16 11:10:52'),
(14,	17,	NULL,	'Lake Bogoria Scenic Flight',	'Lake Bogoria is the mothership of Flamingo lined lakes in the Great Rift Valley and never disappoints. Ideally located en-route between the Masai Mara and Laikipia, a scenic flight across Lake Bogoria reveals a stunning blend of vibrant colors and natural beauty. The deep blue waters contrast with the white salt crusts along the shore, while plumes of steam rise from hot springs and geysers, adding a mystical touch. Thousands of pink flamingos gather along the shoreline, creating a striking spectacle against the rugged backdrop of surrounding hills. The lake’s serene surface reflects the sky, capturing the essence of this unique, enchanting landscape.',	'scenic_flights',	'aircraft',	'Kenya',	'Nairobi',	'Great Rift Valley',	1,	'',	NULL,	0.00,	3.87,	0.00,	0.00,	NULL,	0,	'2025-09-16 11:16:41',	'2025-09-16 11:16:41'),
(15,	17,	NULL,	'Lakes & Volcanoes of the Great Rift Valley',	'The Great Rift Valley unveils a stunning landscape of contrasts and nowhere more so than in Kenya. The deep blue waters of the ribbon lakes, fringed with pink flamingos, stand out against the arid surroundings. Towering volcanoes, some with smoking craters and others extinct, punctuate the horizon, while lush green forests cling to the steep eastern escarpment. The shifting colors of alkaline lakes, rugged volcanic cones, and vast savannahs below create a mesmerizing tapestry, showcasing the dramatic beauty and geological wonders of this ancient and dynamic landscape. An ideal addition to private charter flights linking the Masai Mara and northern Kenya.',	'scenic_flights',	'aircraft',	'Kenya',	'Nairobi',	'The Great Rift Valley',	1,	'',	NULL,	0.00,	3.87,	0.00,	0.00,	NULL,	0,	'2025-09-16 11:18:35',	'2025-09-16 11:18:35'),
(16,	17,	NULL,	'Suguta Valley & the Jade Sea',	'A scenic flight over the Suguta Valley is an otherworldly experience, revealing a rugged landscape of dramatic beauty. Flying past the towering Cathedral Rock, you see its spire-like formations rising from the valley floor. Below, the valley\'s soda lakes shimmer with the pink hues of thousands of flamingos. As you approach the Tele Volcano, its dark, craggy slopes contrast sharply with the surrounding arid plains. The Nabiyotum Crater appears like a massive, ancient amphitheater, its steep walls encircling a deep turquoise lake. Finally, the Jade Sea—Lake Turkana—stretches out before you, its vivid green waters merging with the horizon, creating a breathtaking finale to the flight. On this scenic flight, we will stop half way for breakfast and a rest stop. Rarely do we have a dry eye on this scenic flight… it is a magical experience.',	'scenic_flights',	'aircraft',	'Kenya',	'Nairobi',	'Turkana',	1,	'',	NULL,	0.00,	3.87,	0.00,	0.00,	NULL,	0,	'2025-09-16 11:21:52',	'2025-09-16 11:21:52'),
(17,	17,	NULL,	'Suguta Valley & Elephants of Reteti',	'A scenic flight over the Suguta Valley reveals one of Kenya’s most dramatic landscapes—a vast, desolate expanse of sand dunes, lava flows, and ancient lake beds. The valley’s deep gorges and ochre-hued cliffs contrast with the shimmering blue of seasonal lakes, creating a surreal and untouched beauty. Over the active Teleki Volcano, the Von Honel barrier and as the flight continues north, Lake Turkana, the Jade Sea, emerges on the horizon, its turquoise waters stretching endlessly against the volcanic terrain. Circle the Naboyotam cinder cone and her the emerald green lava lake before landing for a picnic breakfast on a remote desert airstrip. Southbound, follow the Milgis Valley, a lifeline of greenery winding through the arid Samburu heartland, where herds of elephants and pastoralist settlements dot the riverbanks. The final descent brings you to the Reteti Elephant Sanctuary, nestled in the Mathews Range, where young rescued elephants find refuge in a landscape of rolling hills and acacia forests—a fitting conclusion to an extraordinary aerial journey.',	'scenic_flights',	'aircraft',	'Kenya',	'Nairobi',	'Milgis Valley',	1,	'',	NULL,	0.00,	3.87,	0.00,	0.00,	NULL,	0,	'2025-09-16 11:24:19',	'2025-09-16 11:24:19'),
(18,	17,	NULL,	'Serengeti Extended Scenic Flight',	'An extended scenic flight over the Serengeti Game Reserve offers a breathtaking perspective of one of Africa’s most iconic wildlife habitats. As you soar above the vast golden plains, herds of wildebeest and zebras dot the landscape, while predators like lions and cheetahs lie in wait under the shade of acacia trees. The winding rivers and seasonal wetlands glisten in the sun, attracting flocks of birds and large mammals. The shifting patterns of the savannah, combined with the distant Ngorongoro Crater, create a stunning mosaic of nature, immersing you in the wild beauty of this UNESCO World Heritage site.',	'scenic_flights',	'aircraft',	'Kenya',	'Nairobi',	'Serengeti',	1,	'',	NULL,	0.00,	3.87,	0.00,	0.00,	NULL,	0,	'2025-09-16 11:26:09',	'2025-09-16 11:26:09'),
(19,	17,	NULL,	'Serengeti to Lake Manyara Extended Scenic Flight',	'A scenic flight from the Serengeti to Lake Manyara reveals a mesmerizing transition between two distinct ecosystems. As you ascend, the vast golden plains of the Serengeti unfold below, alive with roaming wildlife—wildebeest and zebras traveling in majestic herds, and the occasional lion lounging in the shade. As you approach Lake Manyara, the landscape transforms into lush greenery, with the shimmering lake coming into view, framed by the dramatic Rift Valley escarpment. The lake itself is a sanctuary for thousands of flamingos, whose vibrant pink hues contrast beautifully with the deep blue waters. This flight encapsulates the diverse beauty of Tanzania\'s wildlife and landscapes, making it an unforgettable journey.',	'scenic_flights',	'aircraft',	'Kenya',	'Nairobi',	'Serengeti',	1,	'',	NULL,	0.00,	3.87,	0.00,	0.00,	NULL,	0,	'2025-09-16 11:27:55',	'2025-09-16 11:27:55'),
(20,	17,	NULL,	'Vipingo & Kilifi Scenic Local Fun Flight',	'\nVipingo & Kilifi scenic local fun flight\nX\n\nA short, fun scenic flight from Vipingo to Kilifi Creek is the perfect way to experience Kenya\'s stunning coastal beauty from above. Departing from the serenity of Vipingo airstrip, the shimmering Indian Ocean greets you, its turquoise waters contrasting beautifully with the lush green landscape. The journey north reveals the charming coastline, dotted with pristine white beaches and the occasional dhow gliding across the waves. Within minutes, the spectacular Kilifi Creek comes into view, its emerald-green waters winding inland like a painter’s brushstroke. From above, you can see the intricate network of mangroves hugging the creek’s edges, and the gentle ripples created by small fishing boats navigating its calm waters.',	'scenic_flights',	'aircraft',	'Kenya',	'Nairobi',	'Vipingo & Kilifi',	1,	'',	NULL,	0.00,	3.87,	0.00,	0.00,	NULL,	0,	'2025-09-16 13:22:17',	'2025-09-16 13:44:21'),
(21,	17,	NULL,	'Mombasa Island Scenic Flight',	'Breathtaking views of Kenya’s vibrant coastal jewel and second city, where history, culture, and natural beauty converge. The shimmering turquoise waters of the Indian Ocean stretch endlessly, contrasting with the white sands of the surrounding palm fringed beaches. Spot the iconic Fort Jesus, a UNESCO World Heritage Site, its ancient walls standing proudly as a reminder of Mombasa\'s storied past. The narrow streets of the Old Town reveal a patchwork of Swahili, Arab, and colonial architecture, their rooftops glowing in the tropical sun. To the south, the bustling Kilindini Harbour, one of Africa\'s largest ports, a hive of activity with cargo ships and traditional Swahili dhows navigating the waters. The creeks and estuaries that weave around the island add a lush, green contrast to the urban sprawl.',	'scenic_flights',	'aircraft',	'Kenya',	'Nairobi',	'Mombasa',	1,	'',	NULL,	0.00,	3.87,	0.00,	0.00,	NULL,	0,	'2025-09-16 13:30:34',	'2025-09-16 13:43:57'),
(22,	17,	NULL,	'Southcoast Kisite & Shimoni Scenic Flight',	'A scenic flight along Kenya\'s southern coastline to Shimoni and Kisite Marine Park, is a mesmerizing blend of coastal beauty, marine wonders, and cultural heritage. The sundazling white of sister beaches, Tiwi and Diani stretch below, meeting the azure waters of the Indian Ocean. Further south a mosaic of palm-fringed shores, mangrove forests, and turquoise lagoons, punctuated by traditional Swahili dhow sails gliding gracefully. The historical trading and fishing town of Shimoni offers a glimpse of its Swahili and Arab influence, a gateway to the Kisite Mpunguti Marine Park, where sparkling reefs teem with marine life and pods of dolphins often dance in the clear waters.',	'scenic_flights',	'aircraft',	'Kenya',	'Nairobi',	'Southcoast',	1,	'',	NULL,	0.00,	3.87,	0.00,	0.00,	NULL,	0,	'2025-09-16 13:32:10',	'2025-09-16 13:44:40'),
(23,	17,	NULL,	'Kilifi, Arabuko Sokoke & Sabaki Scenic Flight',	'Capture the stunning contrasts of Kenya’s coastal landscapes, where marine, forest, and riverine ecosystems converge in breathtaking harmony. The vivid blues of the Indian Ocean merge with the emerald-green waters of Kilifi creek, small dugout fishing canoes dotting the lush winding mangroves and sandy shores. Continuing inland, East Africa’s largest coastal forest, the sprawling Arabuko Sokoke Forest. From the air, the forest stretches endlessly, its dense green canopy standing in stark contrast to the surrounding coastal terrain. The forest is a haven for rare species and a living mosaic of indigenous trees and hidden wildlife trails. Flying further north onto the Sabaki River, winding east where freshwater meets the Indian Ocean. The riverbanks are alive with hippos basking in the shallows, their massive forms visible even from above. The interplay of golden sands, rushing water, and deep blue ocean creates a dramatic, unforgettable vista.',	'scenic_flights',	'aircraft',	'Kenya',	'Nairobi',	'Kilifi',	1,	'',	NULL,	0.00,	3.87,	0.00,	0.00,	NULL,	0,	'2025-09-16 13:33:41',	'2025-09-16 13:33:41'),
(24,	17,	NULL,	'Beach & Bush Scenic Flight ',	'A breathtaking journey from beach to bush, that showcases the striking contrasts between Kenya’s coastal paradise and its untamed wilderness. Pristine white beaches and turquoise waters of the Indian Ocean come alive, lined with swaying palm trees and occasional fishing villages. Fly over the enchanting Kilifi Creek, where mangroves and aquamarine waters blend into a picture-perfect coastal haven. Fly inland over the Arabuko Sokoke Forest, a verdant canopy that is East Africa’s largest coastal forest. The dense greenery is a sharp contrast to the shimmering coastal waters, home to rare birds, butterflies, and forest elephants. Undulating treetops stretch as far as the eye can see, a hidden gem of biodiversity. To the north, lies Malindi, where modernity meets Swahili heritage. Its sandy shores are fringed by coral reefs, and the Gedi Ruins lie nearby, an ancient reminder of the region’s rich history. Turning inland, the landscape transforms dramatically to reveal the rich red savannah of Tsavo East National Park, one of Kenya’s largest and wildest reserves. From the air, you might spot red-dusted elephants, giraffes, and herds of buffalo roaming freely in the golden landscape. This scenic journey offering a unique perspective on the country\'s natural diversity.',	'scenic_flights',	'aircraft',	'Kenya',	'Nairobi',	'Tsavo East',	1,	'',	NULL,	0.00,	3.87,	0.00,	0.00,	NULL,	0,	'2025-09-16 13:35:37',	'2025-09-16 13:44:57'),
(25,	17,	NULL,	'Vipingo to Lamu Scenic Flight',	'Flying north, the Indian Ocean coastline transforms into pristine stretches of sand interspersed with small fishing villages and coral atolls. The shimmering creeks and secluded coves of Kilifi and Malindi come into view, adding a touch of tropical magic. As you near Lamu, Kenya’s oldest continually inhabited town, the timeless beauty of this UNESCO World Heritage Site becomes apparent. Its labyrinthine streets, ancient Swahili architecture, and bustling waterfront paint a picture of rich history and culture. Flying at low altitude, the stunning interplay of ocean, land, and sky offers an unforgettable perspective on Kenya\'s coastal treasures, culminating in the timeless charm of Lamu.',	'scenic_flights',	'aircraft',	'Kenya',	'Nairobi',	'Vipingo',	1,	'',	NULL,	0.00,	3.87,	0.00,	0.00,	NULL,	0,	'2025-09-16 13:37:07',	'2025-09-16 13:45:15'),
(26,	17,	NULL,	'Malindi to Lamu Scenic Flight',	'\nMalindi to Lamu scenic flight\nX\n\nThis quick flight is a delightful way to appreciate the scenic contrasts of beach, water, and greenery, leaving you with unforgettable memories of Kenya’s coastline in all its splendor. the coastline transforms into pristine stretches of sand interspersed with fishing villages and coral atolls. As you near Lamu, Kenya’s oldest continually inhabited town, the timeless beauty of this UNESCO World Heritage Site becomes apparent. Its labyrinthine streets, ancient Swahili architecture, and bustling waterfront paint a picture of rich history and culture. Flying at low altitude, the stunning interplay of ocean, land, and sky offers an unforgettable perspective on Kenya\'s coastal treasures, culminating in the timeless charm of Lamu.',	'scenic_flights',	'aircraft',	'Kenya',	'Nairobi',	'Malindi',	1,	'',	NULL,	0.00,	3.87,	0.00,	0.00,	NULL,	0,	'2025-09-16 13:38:46',	'2025-09-16 13:45:30'),
(27,	17,	NULL,	'Diani to Lamu Scenic Flight',	'A scenic flight from Diani to Lamu offers a stunning aerial journey along Kenya’s coastline. Taking off from Diani’s palm-fringed beaches, the turquoise waters of the Indian Ocean stretch endlessly, with white sandbanks and coral reefs visible below. Flying north, the route passes over the winding creeks and mangrove forests of Kilifi and Tana River Delta, where shifting sandbars create mesmerizing patterns. Approaching Lamu, the sight of traditional dhows sailing through the archipelago’s azure waters adds a timeless charm, before touching down on Manda Island, the gateway to Lamu’s historic Swahili culture.',	'scenic_flights',	'aircraft',	'Kenya',	'Nairobi',	'Diani',	1,	'',	NULL,	0.00,	3.87,	0.00,	0.00,	NULL,	0,	'2025-09-16 13:40:22',	'2025-09-16 13:45:46'),
(29,	17,	3,	'Watamu Full Day Tour',	'Experience the magic of the Indian Ocean with our Watamu Safari Blue Tour - a full-day ocean adventure filled with excitement, beauty, and cultural charm! Sail on a traditional wooden dhow across the crystal-clear turquoise waters of Watamu Marine Park, famous for its vibrant coral reefs and colorful marine life.\\n\\nActivities Include:\\n\\n- Snorkeling among tropical fish and coral gardens\\n- Swimming in natural lagoons and sandbanks\\n- Delicious Swahili seafood lunch served fresh on the dhow\\n- Traditional coastal dances and cultural entertainment\\n- Relaxing on pristine white beaches\\n- Viewing of mangroves, birds, and marine life along the creeks\\n- Enjoying the breathtaking beauty of Mida Creek and the Shimo la Tewa views\\n\\nThis unforgettable ocean safari blends adventure, relaxation, and Kenyan coastal culture into one perfect day!',	'coastal_exploration',	'yachts',	'Kenya',	'Kilifi',	'Watamu',	1,	'term and condition',	NULL,	0.00,	3.87,	600.00,	603.87,	NULL,	480,	'2025-10-14 11:42:34',	'2025-10-14 14:21:44'),
(31,	17,	3,	'Mombasa - Watamu',	'Inclusive\n\n- Transport pick-up and drop-off\n\n- Park entry fees\n\n- Glass-bottom ride\n\n- Snorkeling\n\n- Guide or instructor\n\n- Lunch (seafood, chicken, Swahili dishes, fruits, and vegetables)\n\n- Bottle of water\n\n- Traditional dancing and cultural experiences\n\n- Swimming\n\n  Exclusive\n\n- Extra seafood (e.g. platter, calamari, octopus, lobsters, prawns)\n\n- Tips\n\n- Scuba diving',	'coastal_exploration',	'yachts',	'Kenya',	'Mombasa',	'Mombasa',	1,	'Terms and Conditions',	NULL,	0.00,	3.87,	50.00,	53.87,	NULL,	120,	'2025-10-14 14:52:52',	'2025-10-14 15:45:55'),
(32,	17,	3,	'Dhow Cruze',	'Dhow cruise \n- Sun set \n- Sunset view\n-  Dhow cruise ride\n-  Music\n-  Cultural entertainment\n-  Snacks\n-  Coconut juice\n-  2hrs 30 mins duration',	'coastal_exploration',	'yachts',	'Kenya',	'Mombasa',	'Mombasa',	1,	'Terms and Condition',	NULL,	0.00,	3.87,	30.00,	33.87,	NULL,	120,	'2025-10-14 15:20:48',	'2025-10-14 15:20:48'),
(33,	17,	3,	' Quad Biking at Mambrui Sand Dunes ',	'Unleash your adventurous spirit in the breathtaking landscapes of Kilifi with our exhilarating quad biking experience. Picture yourself conquering rugged terrains, traversing sandy beaches, and exploring lush coastal desert sand dunes, all while enjoying the rush of adrenaline that comes with riding a powerful quad bike.',	'coastal_exploration',	'yachts',	'Kenya',	'Kilifi',	'Kilifi',	1,	'',	NULL,	0.00,	3.87,	30.00,	33.87,	NULL,	20,	'2025-10-14 15:42:19',	'2025-10-30 14:06:10'),
(34,	17,	6,	'Sundowner Safaris',	'Sundowner Safari:\nEnjoy a stunning 2-hour sunset beach safari across the ocean, passing the historic Vasco da Gama Pillar.\n\nIncludes: snacks, alcoholic beverages, soft drinks and fresh mineral water. Minimum 3 guests.\n\nPackage: Ksh4,000 per adult & Ksh2,000 per child under l2yrs.\n\nA minimum of 3 guests is required-if fewer, please see our pricing for 2 guests.',	'coastal_exploration',	'yachts',	'Kenya',	'Malindi',	'Malindi',	1,	'Terms and Condition',	NULL,	0.00,	3.87,	40.00,	43.87,	NULL,	120,	'2025-10-15 08:27:51',	'2025-10-15 10:13:23'),
(35,	17,	6,	'Snarkeling Safaris',	'Embark on a half-day ocean adventure to Malindi Marine Park for an exciting snorkeling experience, dolphin encounters, and turtle watching safari.\n\nincludes: fresh water, fruit platter, soft drinks. Minimum: 3 guests\n\nPackage: Ksh4,000 per adult & Ksh2,000 per child under 12yrs\n\nA minimum of 3 guests is required-if fewer, please see our pricing for 2 guests.',	'coastal_exploration',	'yachts',	'Kenya',	'Malindi',	'Malindi',	1,	'',	NULL,	0.00,	3.87,	40.00,	43.87,	NULL,	120,	'2025-10-15 08:32:47',	'2025-10-15 10:11:54'),
(36,	17,	6,	'Sardinia Due Safari',	'Enjoy a full day of sailing, snorkeling, swimming, dolphin & turtle watching, a seafood BBQ on the dhow, and beach relaxation.\n\nIncludes: BBQ lunch with prawns & lobster, alcoholic beverages, soft drinks, & fresh mineral water. Minimum 3 guests\n\nPackage: Ksh10,000 per adult & Ksh5,000 per child under 12yrs\n\nA minimum of 3 guests is required-if fewer, please see our pricing for 2 guests.',	'coastal_exploration',	'yachts',	'Kenya',	'Malindi',	'Malindi',	1,	'',	NULL,	0.00,	3.87,	110.00,	113.87,	NULL,	120,	'2025-10-15 08:36:44',	'2025-10-15 10:12:40'),
(37,	17,	6,	'Golden Hour Sail',	'2 Hours Golden Hour Sail: \nMeet at 16:30 and set sail on your golden hour voyage. Return to shore by 6:30 PM as the sun dips below the horizon.\n\nGolden Hour on the Waves\nSail into the golden horizon on a breathtaking sunset dhow safari, gliding past the iconic Vasco da Gama Pillar as the sky paints a masterpiece over the ocean.\n\nSeaside Bites\nSavour freshly prepared snacks as you sail the open sea. Kindly inform the Sailing Coordinator of any food allergies in advance.\n\nDrinks on Deck\nStay refreshed on board with a selection of drinks-sip on alcoholic beverages, soft drinks, and bottled mineral water as the sun dips below the horizon, raise a glass and savour the perfect sundowner moment.',	'coastal_exploration',	'yachts',	'Kenya',	'Malindi',	'Malindi',	1,	'',	NULL,	0.00,	3.87,	50.00,	53.87,	NULL,	120,	'2025-10-15 09:58:56',	'2025-10-15 09:58:56'),
(38,	17,	6,	'Full day Sailing',	'Sailing the Day Away\nRendezvous at 9 AM, settle park fees, then embark on your voyage. Return to shore by 3:00-3:30 PM.\n\nAqua Adventures\nImmerse yourself in the wonders of the ocean\n-snorkel, swim amongst the fishes, glide alongside dolphins and turtles, and dive into crystal-clear waters for the ultimate sea adventure. Drop anchor at Sardinia Due for a delightful lunch.\n\nFlavours of the Ocean\nAs you explore the sea, your crew will grill a seafood BBQ on deck-featuring lobster, prawn curry, octopus, and fish with rice. Kindly inform the Sailing Coordinator of any seafood allergies in advance.\n\nStay refreshed on board with a selection of drinks-sip on alcoholic beverages, soft drinks, and bottled mineral water as you sail the open sea.',	'coastal_exploration',	'yachts',	'Kenya',	'Malindi',	'Malindi',	1,	'',	NULL,	0.00,	3.87,	110.00,	113.87,	NULL,	120,	'2025-10-15 10:25:37',	'2025-10-15 10:34:30'),
(39,	17,	3,	'Wasini Island rates from Mombasa per person',	'Full day trip to Wasini island . Pick up from your hotel in Mombasa, drive to the harbor to board the vessel to Wasini Island.\n\nINCLUSIVE \n-  Pick up and drop off\n-  Park Entry fees \n-  Dhow boat ride\n-  Dolphin spotting \n-  Snorkeling \n-  Snorkeling gears\n-  Guide or instructor \n- Lunch ( seafood , Swahili dish, vegetables , fruits , chicken)\n\nExclusive \n-  Extra seafood e.g platas , calamari, octopus, \n-  Tips \n-  Scuba diving\n',	'coastal_exploration',	'yachts',	'Kenya',	'Mombasa',	'Mombasa',	1,	'terms and condition',	NULL,	0.00,	3.87,	100.00,	103.87,	60.00,	120,	'2025-10-15 10:34:34',	'2025-10-30 14:05:55'),
(40,	17,	5,	'Day Trip to Tumbatu Island',	'Tumbatu Island is an island located in Fumba ward of Kaskazini A District in Unguja North Region, Tanzania. In Zanzibar Archipelago, Tumbatu is the third-largest island, after Pemba and Unguja island.\n\nITENERARY\n9 am: Jump on one of our dhows\n10 am-3 pm: We spend the day around Tumbatu:\n• Snorkeling (sometimes you can spot turtles here!)\n• Enjoy an delicious seafood lunch ar\n• Get off on the beach at Tumbatu in high tide and take a walk on the empty beautiful beach\n3 pm: We head back to Zanzibar. We enjoy fresh fruits and the magical sunset from the boat\n\nINCLUDED\n• Snorkeling equipment & life jackets\n• Seafood lunch (rice, salad, coconut sauce, lobster, chicken, calamari and tuna fish)\n• Fresh fruits, juice, soda and water\n\nEXTRA (on request)\n• Transport\n• GoPro $30/day\n• Birthday cake & balloons $30\n• Wine $20/bottle & beer $5/each\n• Drone videos/pictures\n',	'coastal_exploration',	'yachts',	'Tanzania, United Republic of',	'Zanzibar',	'Zanzibar',	1,	'',	NULL,	0.00,	3.87,	270.00,	273.87,	60.00,	120,	'2025-10-15 11:26:56',	'2025-10-27 08:34:49'),
(41,	17,	5,	'Day Trip to Pungume Island',	'Pungume Island is a protected island located in Fumba ward of Mjini District in Mjini Magharibi Region, Tanzania. The largest of the Menai Bay islands, the island is composed of limestone and is a part of the Menai Bay Marine Conservation Area. \n\nITINERARY\n9 am: Jump on one of our dhows\nHighlights during the day:\n• Get off on the crystal clear sandbank\n• Be lucky to spot dolphins\n• Enjoy an delicious seafood lunch cooked onboard coc\n• Amazing snorkeling\n• Stop in small wild creeks and the mangroves if the tide allows.\n4 pm: We start to sail back to Kizimkazi\n\nINCLUDED\n• Snorkeling equipment and life jackets\n• Seafood lunch\n• Fresh fruits, soda and water\n\nEXTRAS (on request)\n• Transport\n• Wine $30/bottle & Beer $5/each\n• Birthday cake & balloons $30',	'coastal_exploration',	'yachts',	'Tanzania, United Republic of',	'Zanzibar',	'Zanzibar',	1,	'',	NULL,	0.00,	3.87,	270.00,	273.87,	60.00,	120,	'2025-10-15 11:53:01',	'2025-10-27 08:36:53'),
(42,	17,	5,	'Mnemba Island',	'Mnemba Island is a private, luxury island off the northeast coast of Zanzibar, Tanzania, renowned for its beautiful turquoise waters, white sand beaches, and vibrant coral reefs. It is a popular destination for snorkeling, diving, and swimming with dolphins, and it is also a protected marine area that is a vital nesting site for sea turtles.  \n\nINCLUDED\n• Snorkeling equipment & life jackets\n• Seafood lunch (rice, salad, coconut sauce lobster, chicken, calamari and tuna fish)\n• Fruits, snacks, juice, soda and water\n\nEXTRAS (on request)\n• Transport\n• GoPro $30/day\n• Birthday cake & balloons $30\n• Wine $20/bottle & beer $5/each\n• Clear kayak $60\n• Drone videos/pictures\n• Mnemba special area ($25/person for 1h)\n\nITINERARY\n9 am: Jump on one of our dhows. Look out to see the dolphins on the way\n11am - 4pm: Spend the day around Mnemba:\n• Snorkeling a\n• Enjoy an delicious seafood lunch ox\n• Get off on the sandbank or blue lagoon (depending on the tide)\n4 pm: We raise up our sailing and slowly sail back to Zanzibar We eniov fresh fruits and the magical sunset from the boat\n6.30 pm: We drop you off in Kendwa',	'coastal_exploration',	'yachts',	'Tanzania, United Republic of',	'Zanzibar',	'Zanzibar',	1,	'',	NULL,	0.00,	3.87,	270.00,	273.87,	60.00,	120,	'2025-10-15 12:22:39',	'2025-10-27 08:33:07'),
(43,	17,	5,	'Romantic Sunset Cruze',	'Romantic Sunset Cruise\n\nITINERARY\nThe best way to admire the beautifully African sunset is from a traditional Dhow while enjoying our delicious seafood & chicken dinner (we have vegeterian alternative).\nThis private trip is all about having a romantic and relaxed evening while being surrounded by the sound of the waves with the wind blowing in the sail and the beautifully colours of the sunset in front of the boat C\nWe sail along the coast of Nungwi and Kendwa, starting around 5 pm and back after sunset.\n\nINCLUDED\n• Seafood lunch rice, salad, coconut sauce, lobster, chicken, calamari and tuna fish)\n• Fresh fruits, soft drinks and water\n• Life jackets\n\nEXTRAS (on request)\n• Transport\n• Birthday cake & balloons $30\n• Wine $20/bottle & beer $5/each\n• Drone pictures/videos\nSnacks\n2 people: $90/p\n3 people: $80/p\n4+ people: $70/p',	'coastal_exploration',	'yachts',	'Tanzania, United Republic of',	'Zanzibar',	'Zanzibar',	1,	'',	NULL,	0.00,	3.87,	120.00,	123.87,	60.00,	12,	'2025-10-15 12:48:29',	'2025-10-27 08:31:43'),
(44,	17,	5,	'Hidden sandbank with sea food lunch',	'ITINERARY\n9 am: The short boat trip to a beautiful and quiet sandbank starts (30 min) o\n9.30 am: Reaching the sandbank. You will swim and just enjoy the crystal clear water. A lot of time for pictures & While we prepare the seafood lunch.\n2 pm: After lunch we start to head back.\nOn the way we stop by a small snorkeling reef (if wanted)\n3 pm: We start the Stone Town your (if booked). You will learn about the history and culture of Zanzibar.\nThere is also enough time for shopping souvenirs or spices etc\n\nINCLUDED\n• Seafood lunch\n• Water, soda & fruits\n• Private guide\n• All entrences\n• Boat rides\n• Snorkeling equipment\n\nEXTRAS (on request)\n• Transport\n• Wine $20/bottle & beer\n$5/each\n• Birthday cake & balloons $30\n• Drone pictures/videos\n\nNote: This is not a dhow boat.\nYou spend the day on the sandbank, and not on a dhow',	'coastal_exploration',	'yachts',	'Tanzania, United Republic of',	'Zanzibar',	'Zanzibar',	1,	'',	NULL,	0.00,	3.87,	165.00,	168.87,	60.00,	120,	'2025-10-15 13:14:49',	'2025-10-27 08:29:07'),
(45,	17,	4,	'Priavate  Boat Trip to Wasini Island',	' Private Wasini Island Boat Trip 1 – 9 Pax\n\nIncludes: Dolphin spotting • Guided snorkeling • Snorkeling gear • Life jackets • Water, soda, fruits, Swahili snacks • Personal guiding from me for a smooth and memorable trip\n\n Lunch Buffet (1,500 pp) – Coconut rice, coconut sauce, potato, chapati, seaweed, cassava + choice of crab/fish/chicken/vegetarian\n\n SEAFOOD EXTRAS\n-  Lobster w/ garlic & ginger – 2,000\n-  Calamari or Octopus – fried, grilled, or coconut sauce – 2,000\n-  Shrimps/Calamari – fried or grilled – 2,000\n-  Seafood Platter (crab, lobster, octopus, calamari, prawns) – 6,500',	'coastal_exploration',	'yachts',	'Kenya',	'Diani',	'Diani',	1,	'',	NULL,	0.00,	3.87,	187.00,	190.87,	NULL,	120,	'2025-10-15 14:04:06',	'2025-10-27 08:21:32'),
(46,	17,	4,	'Wasini Island Full Day Experience',	'Enjoy an unforgettable day with dolphin watching, snorkeling, island exploration & a delicious Swahili seafood lunch.\n\n- Transportation Msa/Diani-Wasini(Return)\n-  Marine Park entrance fee\n-  Breakfast on board\n-  Boat ride with life jackets provided\n-  Dolphin & Whale watching\n-  Snorkeling with full gear + my personal assistance & guidance in the water (even for non-swimmers)\n- Drinks & fresh fruits on the boat\n- Traditional Seafood lunch (octopus, crab, fish, rice, chapati, coconut sauces & more)\n-  Island village tour & cultural experience\n-  Personal service: I’ll be with you throughout the trip , guiding, assisting, and sharing deep insights about the marine park, dolphins & Wasini culture\n\n\nITINERARY\n\n- Full day expedition tour\n',	'coastal_exploration',	'yachts',	'Kenya',	'Diani',	'Diani',	1,	'',	NULL,	0.00,	3.87,	60.00,	63.87,	50.00,	120,	'2025-10-15 14:28:51',	'2025-10-27 08:20:41'),
(47,	NULL,	3,	'Mombasa marine park glass boat ride ',	'Mombasa Marine Park, located off the stunning coast of Kenya, is renowned for its rich biodiversity and vibrant coral reefs. One of the most immersive ways to experience this underwater paradise is through a glass-bottom boat tour. This unique adventure allows you to explore the breathtaking marine life without getting wet!\n\nINCLUSIVE\n- Park Entry Fees\n- Snorkeling\n- Snorkeling gears\n- Guide\n- Glassbottom boat ride\n- Live saver jacket\n- Swimming\n\n\n\n\n\n',	'coastal_exploration',	'yachts',	'Kenya',	'Mombasa',	'Mombasa',	1,	'',	NULL,	0.00,	3.87,	255.00,	258.87,	NULL,	120,	'2025-10-27 11:34:40',	'2025-10-27 11:34:40'),
(48,	46,	NULL,	'Ndutu - Fly from December to March',	'Between December and March, the migrating herds return to the nutrient-rich Ndutu short grass plains for their calving season. A safari from the sky is the perfect place to witness one of nature’s most awe-inspiring spectacles.',	'scenic_flights',	'balloon',	'Tanzania, United Republic of',	'Serengeti',	'Tanzania',	1,	'',	NULL,	0.00,	3.87,	659.00,	662.87,	NULL,	120,	'2025-10-28 13:05:53',	'2025-10-30 06:17:00'),
(49,	46,	NULL,	'Kogatende - Fly from June to November',	'The famous Mara River crossing begins around June and comes to a halt in November. It is considered the final perilous crossover as the herds attempt to make their way to this area where the water is reliable and the grass plentiful.',	'scenic_flights',	'balloon',	'Tanzania, United Republic of',	'Serengeti',	'Serengeti',	1,	'',	NULL,	0.00,	3.87,	659.00,	662.87,	NULL,	120,	'2025-10-28 13:15:39',	'2025-10-28 13:54:52'),
(50,	46,	NULL,	'Tarangire - Fly All Year Long',	'Enjoy a serene morning flight over this majestic park as you gaze down upon utopian baobab trees that tower up to 100 feet high. As you soar the skies of Tarangire, you may even spot some unbelievably majestic beautiful leopards and the famous herds of elephants.',	'scenic_flights',	'balloon',	'Tanzania, United Republic of',	'Serengeti',	'Tarangile National Park',	1,	'',	NULL,	0.00,	3.87,	605.00,	608.87,	NULL,	120,	'2025-10-28 13:28:53',	'2025-10-30 06:17:36'),
(51,	46,	NULL,	'Singita Grumeti - Fly All Year Long',	'Fly All Year Long\nAn unsuspected oasis hidden to the North-West of the Serengeti, the Singita Grumeti Game Reserve is a well-kept secret among safari lovers. The remoteness of the site and the limited number of visitors and developments in the area have left the reserve almost completely untamed and unaffected by the touch of man. It is a peaceful Eden where the animals live wild and free to roam the broken savanna far from the throngs of tourists pouring into national parks every year.',	'scenic_flights',	'balloon',	'Tanzania, United Republic of',	'Serengeti',	'Serengeti',	1,	'',	NULL,	0.00,	3.87,	4739.00,	4742.87,	NULL,	120,	'2025-10-28 13:38:43',	'2025-10-28 14:11:31'),
(52,	46,	NULL,	'Kirawira - Fly From May to  August',	'Around June, some of the wildebeest will have reached and congregated around the Grumeti River in Kirawira – Serengeti’s Western Corridor. At this point, the migration is halted or slowed down as the channels of the river prove difficult to cross giving plenty of opportunities to spot the herds on the plains and riverbanks.',	'scenic_flights',	'balloon',	'Tanzania, United Republic of',	'Serengeti',	'Serengeti',	1,	'',	NULL,	0.00,	3.87,	659.00,	662.87,	NULL,	120,	'2025-10-28 13:53:36',	'2025-10-28 14:08:34'),
(53,	46,	NULL,	'Seronera -  Fly All Year Long',	'Seronera is an all year round game-viewing capital with an impressive population of bovids and predators which remain even after the spectacular hordes of blue wildebeests and zebras have migrated north. The endlessly changing landscape explains the diversity of the wildlife to be seen during your Serengeti Central Safari from the sky.',	'scenic_flights',	'balloon',	'Tanzania, United Republic of',	'Serengeti',	'Serengeti',	1,	'',	NULL,	0.00,	3.87,	659.00,	662.87,	NULL,	120,	'2025-10-28 14:06:17',	'2025-10-30 06:16:18'),
(54,	45,	NULL,	'Celebration Safaris',	'If you\'re planning a safari in Africa for your honeymoon or another special celebration, elevate your experience with a balloon safari. This extraordinary adventure provides breathtaking views, unforgettable moments, and a touch of thrill as you drift gently above some of Tanzania’s most stunning landscapes.\r\n\r\nYour experience includes:\r\n- Collection from your camp or lodge in the area (early!)\r\n- Transfer to the launch site for a sunrise take-off\r\n- Wonderful flight of approximately 1 hour, gently floating over the Serengeti\r\n- Celebrate with a champagne toast on landing and ‘full English’ breakfast under an acacia tree.\r\n - Return you to your safari guide at around 09.45 at the Seronera Visitors Centre (or some other mutually agreed location to continue with your safari).',	'scenic_flights',	'balloon',	'Tanzania, United Republic of',	'Serengeti',	'Serengeti',	1,	'',	NULL,	0.00,	3.87,	659.00,	662.87,	NULL,	120,	'2025-10-28 14:39:50',	'2025-10-30 07:15:46'),
(55,	50,	NULL,	'3 Days Fly in Luxury Enjoyable Honeymoon Safari From Zanzibar',	'Fly- in Safari from Zanzibar to Seronera airstrip inside Serengeti National Park Enjoy an Unforgettable 3 days 2 nights luxury enjoyable honeymoon Safari\n\nITENENARY\n\nDay 1: Zanzibar – Central Serengeti National Park.\n- Accommodation: Serengeti Serena Safari Lodge\n\nDay 2: Serengeti – Ngorongoro Highlands.\n- Accommodation: Ngorongoro Serena Safari Lodge\n\nDay 3: Ngorongoro Crater – Zanzibar\n- Enjoy a picnic lunch by the hippo pool before ascending the crater walls and driving back to the airstrip for your return flight to Zanzibar.\n\nPrice Includes:\n- Professional Safari guide\n- Accommodation in Arusha before Safari\n- All nights’ accommodation during safari\n- Private transportation in a 4 x 4 Toyota Land cruiser with pop up roofs\n- Park Entry Fees, VAT inclusive\n- Unlimited (pure) drinking water during safari\n- Meals (as specified per each day of tour)\n- Airport Transfers\n\nPrice Excludes:\n- International flights\n- All items of a personal nature\n- Gratuities for safari guide (tipping guideline $20 pp per day)\n- Travel insurance\n- Visa fees',	'scenic_flights',	'aircraft',	'Tanzania, United Republic of',	'Zanzibar',	'Zanzibar',	1,	'',	NULL,	0.00,	3.87,	2365.00,	2368.87,	NULL,	120,	'2025-10-28 15:11:59',	'2025-10-28 15:11:59'),
(56,	50,	NULL,	'5 Days The Great Migration Fly in Safari from Zanzibar',	'Embark on a mesmerizing 5-day adventure through Tanzania’s iconic landscapes with our Great Wildebeest Migration Fly-In Safari.\nEnjoy thrilling game drives, where expert guides will enhance your experience with fascinating insights into the behaviours of these magnificent creatures.\n\nAfter two exhilarating days in the Serengeti, explore the breathtaking Ngorongoro Crater, often dubbed the “Garden of Eden,” home to a rich variety of wildlife. Conclude your adventure at Lake Manyara National Park, known for its stunning landscapes and tree-climbing lions.\n\nThis itinerary offers options for budget, midrange, and luxury accommodations, ensuring a comfortable and memorable experience tailored to your preferences.\n\nDay 1: Arrival in Arusha\n\nWelcome to Tanzania! Upon your arrival at Kilimanjaro International Airport, you’ll be greeted and transferred to your accommodation in Arusha.\n- Accommodation: Arusha Farm House or similar\nMeals: Dinner\n\nDay 2 & 3: Serengeti National Park\n\nAfter an early breakfast, embark on a scenic drive to Serengeti National Park, renowned for its iconic big cats.\n- Accommodation: Safari Haven or similar/ Tented Camp\nMeals: Breakfast, Lunch & Dinner\n\nDay 4: Ngorongoro Crater\nAfter breakfast, travel to the stunning Ngorongoro Crater, often referred to as the “Garden of Eden.” Descend into the crater, where a diverse array of wildlife awaits.\n- Accommodation :Farm of Dreams Lodge or similar  Meals :Breakfast, Lunch &  Dinner\n\nDay 5: Tarangire National Parks & Departure\nOn your final day, visit Tarangire National Park, famous for a beautiful landscape of acacia woodland and giant baobab trees. The park is home to large herds of elephants, lions, giraffes, and over 400 bird species.\n\n- Depending on your flight schedule, enjoy a farewell dinner and reminisce about your unforgettable safari experiences before transferring to the airport for departure.',	'scenic_flights',	'aircraft',	'Tanzania, United Republic of',	'Zanzibar',	'Zanzibar',	1,	'',	NULL,	0.00,	3.87,	2059.00,	2062.87,	NULL,	120,	'2025-10-28 15:35:57',	'2025-10-28 15:35:57'),
(57,	51,	NULL,	'Experience The World From The Sky',	'We are here in Serengeti National Park to provide you with stunning and exciting hot air balloon rides for breathtaking views and witness all of the wild Animals directly from the sky.\nCome and make memories in Our Hot Air Balloons As we take you up in the sky All over Serengeti Plains.',	'scenic_flights',	'balloon',	'Tanzania, United Republic of',	'Zanzibar',	'Zanzibar',	1,	'',	NULL,	0.00,	3.87,	659.00,	662.87,	NULL,	120,	'2025-10-28 16:05:53',	'2025-10-30 06:12:43');

DROP TABLE IF EXISTS `locations`;
CREATE TABLE `locations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(15) DEFAULT NULL,
  `iata_code` varchar(3) DEFAULT NULL,
  `icao_code` varchar(10) DEFAULT NULL,
  `country` varchar(100) NOT NULL,
  `municipality` varchar(255) DEFAULT NULL,
  `type` enum('airport','city','region') NOT NULL DEFAULT 'city',
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `elevation_ft` int DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `source` enum('google','ourairports','osm','manual') DEFAULT 'google',
  `last_verified` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_location` (`name`,`country`),
  UNIQUE KEY `idx_unique_code` (`code`),
  KEY `idx_locations_type` (`type`),
  KEY `idx_locations_country` (`country`),
  KEY `idx_locations_coordinates` (`latitude`,`longitude`),
  KEY `idx_locations_search` (`name`,`code`,`country`),
  KEY `idx_locations_iata` (`iata_code`),
  KEY `idx_locations_icao` (`icao_code`),
  KEY `idx_locations_source` (`source`),
  KEY `idx_locations_verified` (`last_verified`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `monetary_transactions_view`;
CREATE TABLE `monetary_transactions_view` (
  `id` varchar(255) DEFAULT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  `booking_id` varchar(255) DEFAULT NULL,
  `transaction_type` enum('deposit','withdrawal','payment','refund','bonus','fee','loyalty_earned','loyalty_redeemed','loyalty_expired','loyalty_adjustment') DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `currency` varchar(3) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `balance_before` decimal(10,2) DEFAULT NULL,
  `balance_after` decimal(10,2) DEFAULT NULL,
  `payment_method` enum('card','mpesa','wallet','loyalty_points') DEFAULT NULL,
  `payment_reference` varchar(255) DEFAULT NULL,
  `status` enum('pending','completed','failed','cancelled') DEFAULT NULL,
  `metadata` longtext,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `completed_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `passengers`;
CREATE TABLE `passengers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `age` int DEFAULT NULL,
  `nationality` varchar(100) DEFAULT NULL,
  `id_passport_number` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_user` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  KEY `idx_passengers_is_user` (`is_user`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiresAt` datetime NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `used` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_code` (`code`),
  KEY `idx_expires` (`expiresAt`),
  KEY `idx_used_expires` (`used`,`expiresAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` varchar(255) NOT NULL,
  `booking_id` varchar(255) DEFAULT NULL,
  `bookingId` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `company_id` int DEFAULT NULL,
  `paymentMethod` enum('card','mpesa','wallet','paystack') NOT NULL,
  `totalAmount` decimal(10,2) NOT NULL,
  `platformFee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `companyAmount` decimal(10,2) NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'USD',
  `transactionId` varchar(255) DEFAULT NULL,
  `paymentStatus` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
  `paymentGatewayResponse` text,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `payment_method` enum('card','mpesa','wallet','paystack') NOT NULL DEFAULT 'card',
  `payment_status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
  `platform_fee` decimal(10,2) DEFAULT '0.00',
  `company_amount` decimal(10,2) DEFAULT '0.00',
  `transaction_id` varchar(255) DEFAULT NULL,
  `payment_gateway_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `bookingId` (`bookingId`),
  KEY `userId` (`userId`),
  KEY `payment_status` (`paymentStatus`),
  KEY `idx_payments_booking_id` (`booking_id`),
  KEY `idx_payments_user_id` (`userId`),
  KEY `idx_payments_company_id` (`company_id`),
  KEY `idx_payments_status` (`paymentStatus`),
  CONSTRAINT `payments_chk_1` CHECK (json_valid(`payment_gateway_response`))
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `pilots`;
CREATE TABLE `pilots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `idNumber` varchar(255) NOT NULL,
  `licenseNumber` varchar(255) NOT NULL,
  `licenseExpiry` datetime NOT NULL,
  `medicalExpiry` datetime NOT NULL,
  `licenseDocumentUrl` varchar(255) DEFAULT NULL,
  `licenseDocumentPublicId` varchar(255) DEFAULT NULL,
  `medicalDocumentUrl` varchar(255) DEFAULT NULL,
  `medicalDocumentPublicId` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `rate` float NOT NULL DEFAULT '0',
  `imagePublicId` varchar(255) DEFAULT NULL,
  `companyId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `companyId` (`companyId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `refresh_tokens`;
CREATE TABLE `refresh_tokens` (
  `tokenHash` varchar(500) NOT NULL COMMENT 'SHA-256 hash of the refresh token',
  `userId` varchar(255) NOT NULL COMMENT 'Foreign key to users table',
  `expiresAt` datetime NOT NULL COMMENT 'Token expiration timestamp',
  `revoked` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Whether token has been revoked',
  `revokedAt` datetime DEFAULT NULL COMMENT 'When token was revoked',
  `revokedReason` varchar(100) DEFAULT NULL COMMENT 'Reason for revocation',
  `deviceId` varchar(100) DEFAULT NULL COMMENT 'Unique device identifier',
  `deviceName` varchar(200) DEFAULT NULL COMMENT 'Human-readable device name',
  `ipAddress` varchar(45) DEFAULT NULL COMMENT 'IP address when token was created',
  `userAgent` text COMMENT 'User agent string',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Token creation timestamp',
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  `lastUsedAt` datetime DEFAULT NULL COMMENT 'Last time token was used',
  `usageCount` int NOT NULL DEFAULT '0' COMMENT 'Number of times token was used',
  PRIMARY KEY (`tokenHash`),
  KEY `idx_userId` (`userId`),
  KEY `idx_userId_revoked` (`userId`,`revoked`),
  KEY `idx_expiresAt_revoked` (`expiresAt`,`revoked`),
  KEY `idx_deviceId` (`deviceId`),
  KEY `idx_cleanup` (`expiresAt`,`revoked`),
  KEY `idx_active_tokens` (`userId`,`revoked`,`expiresAt`),
  CONSTRAINT `fk_refresh_tokens_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Stores refresh tokens for JWT authentication with revocation support';


DROP TABLE IF EXISTS `transaction_ledger`;
CREATE TABLE `transaction_ledger` (
  `id` int NOT NULL AUTO_INCREMENT,
  `transactionId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `parentTransactionId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `companyId` int DEFAULT NULL,
  `userId` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `bookingId` int DEFAULT NULL,
  `transactionType` enum('payment_received','platform_fee','company_payout','refund','chargeback','adjustment','transfer') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `paymentProvider` enum('stripe','mpesa','paypal','bank_transfer','paystack') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `providerTransactionId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` enum('USD','KES','EUR','GBP') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `exchangeRate` decimal(10,6) NOT NULL DEFAULT '1.000000',
  `baseAmount` decimal(15,2) NOT NULL,
  `fee` decimal(15,2) NOT NULL DEFAULT '0.00',
  `tax` decimal(15,2) NOT NULL DEFAULT '0.00',
  `netAmount` decimal(15,2) NOT NULL,
  `status` enum('pending','processing','completed','failed','cancelled','reversed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `providerMetadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `errorMessage` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `processedAt` datetime DEFAULT NULL,
  `settledAt` datetime DEFAULT NULL,
  `reversedAt` datetime DEFAULT NULL,
  `reversalReason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ipAddress` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userAgent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `isReconciled` tinyint(1) NOT NULL DEFAULT '0',
  `reconciledAt` datetime DEFAULT NULL,
  `reconciliationNotes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_transaction_id` (`transactionId`),
  KEY `idx_parent_transaction` (`parentTransactionId`),
  KEY `idx_company_created` (`companyId`,`createdAt`),
  KEY `idx_provider_created` (`paymentProvider`,`createdAt`),
  KEY `idx_type_created` (`transactionType`,`createdAt`),
  KEY `idx_status_created` (`status`,`createdAt`),
  KEY `idx_booking_id` (`bookingId`),
  KEY `idx_user_id` (`userId`),
  KEY `idx_provider_transaction` (`paymentProvider`,`providerTransactionId`),
  KEY `idx_created_at` (`createdAt`),
  KEY `idx_updated_at` (`updatedAt`),
  KEY `idx_reconciled` (`isReconciled`),
  KEY `idx_transaction_ledger_amount` (`amount`),
  KEY `idx_transaction_ledger_currency` (`currency`),
  KEY `idx_transaction_ledger_base_amount` (`baseAmount`),
  KEY `idx_transaction_ledger_processed_at` (`processedAt`),
  KEY `idx_transaction_ledger_settled_at` (`settledAt`),
  CONSTRAINT `fk_transaction_ledger_company` FOREIGN KEY (`companyId`) REFERENCES `charters_companies` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_transaction_ledger_parent` FOREIGN KEY (`parentTransactionId`) REFERENCES `transaction_ledger` (`transactionId`) ON DELETE SET NULL,
  CONSTRAINT `transaction_ledger_ibfk_1` FOREIGN KEY (`bookingId`) REFERENCES `charter_bookings` (`id`),
  CONSTRAINT `transaction_ledger_chk_1` CHECK (json_valid(`metadata`)),
  CONSTRAINT `transaction_ledger_chk_2` CHECK (json_valid(`providerMetadata`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `user_event_summary`;
CREATE TABLE `user_event_summary` (
  `user_id` varchar(255) DEFAULT NULL,
  `total_events` bigint DEFAULT NULL,
  `flight_events` bigint DEFAULT NULL,
  `reminders` bigint DEFAULT NULL,
  `personal_events` bigint DEFAULT NULL,
  `upcoming_events` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `user_events`;
CREATE TABLE `user_events` (
  `id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `booking_id` varchar(255) DEFAULT NULL,
  `type` enum('flight','reminder','personal') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `event_date` datetime NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `is_all_day` tinyint(1) DEFAULT '0',
  `location` varchar(255) DEFAULT NULL,
  `reminder_minutes` int DEFAULT '60',
  `reminder_sent` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_user_events_booking` (`booking_id`),
  KEY `idx_user_events_user_date` (`user_id`,`event_date`),
  KEY `idx_user_events_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `user_file_summary`;
CREATE TABLE `user_file_summary` (
  `user_id` varchar(255) DEFAULT NULL,
  `total_files` bigint DEFAULT NULL,
  `receipts` bigint DEFAULT NULL,
  `tickets` bigint DEFAULT NULL,
  `boarding_passes` bigint DEFAULT NULL,
  `favorite_files` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `user_files`;
CREATE TABLE `user_files` (
  `id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `booking_id` varchar(255) DEFAULT NULL,
  `type` enum('receipt','ticket','invoice','boarding_pass','itinerary','other') NOT NULL,
  `name` varchar(255) NOT NULL,
  `url` text NOT NULL,
  `public_id` varchar(255) NOT NULL,
  `file_size` int DEFAULT NULL,
  `file_format` varchar(10) DEFAULT NULL,
  `is_favorite` tinyint(1) DEFAULT '0',
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_user_files_booking` (`booking_id`),
  KEY `idx_user_files_user_type` (`user_id`,`type`),
  KEY `idx_user_files_favorite` (`is_favorite`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `user_profile`;
CREATE TABLE `user_profile` (
  `user_id` varchar(255) NOT NULL,
  `seat_preference` enum('window','aisle','any') DEFAULT 'any',
  `meal_preference` text,
  `special_assistance` text,
  `email_notifications` tinyint(1) DEFAULT '1',
  `sms_notifications` tinyint(1) DEFAULT '1',
  `push_notifications` tinyint(1) DEFAULT '1',
  `marketing_emails` tinyint(1) DEFAULT '1',
  `profile_visible` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `data_sharing` tinyint(1) DEFAULT '0',
  `location_tracking` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`user_id`),
  KEY `idx_user_profile_visible` (`profile_visible`),
  KEY `idx_user_profile_data_sharing` (`data_sharing`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `user_trips`;
CREATE TABLE `user_trips` (
  `id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `booking_id` varchar(255) NOT NULL,
  `status` enum('upcoming','completed','cancelled') NOT NULL,
  `rating` int DEFAULT NULL,
  `review` text,
  `review_date` timestamp NULL DEFAULT NULL,
  `photos` text,
  `videos` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_user_trips_booking` (`booking_id`),
  KEY `idx_user_trips_user_status` (`user_id`,`status`),
  KEY `idx_user_trips_rating` (`rating`),
  KEY `idx_user_trips_created` (`created_at`),
  CONSTRAINT `user_trips_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `country_code` varchar(5) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `nationality` varchar(100) DEFAULT NULL,
  `language` varchar(50) DEFAULT 'en',
  `currency` varchar(20) DEFAULT 'USD',
  `timezone` varchar(50) DEFAULT 'UTC',
  `theme` enum('light','dark','auto') DEFAULT 'auto',
  `profile_image_url` text,
  `profile_image_public_id` varchar(255) DEFAULT NULL,
  `loyalty_points` int NOT NULL DEFAULT '0',
  `loyalty_tier` enum('bronze','silver','gold','platinum') DEFAULT 'bronze',
  `wallet_balance` decimal(10,2) NOT NULL DEFAULT '0.00',
  `is_active` tinyint NOT NULL DEFAULT '1',
  `email_verified` tinyint NOT NULL DEFAULT '0',
  `phone_verified` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `password` varchar(255) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deletion_reason` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_97672ac88f789774dd47f7c8be` (`email`),
  UNIQUE KEY `IDX_17d1817f241f10a3dbafb169fd` (`phone_number`),
  KEY `idx_users_loyalty_tier` (`loyalty_tier`),
  KEY `idx_users_loyalty_points` (`loyalty_points`),
  KEY `idx_users_deleted_at` (`deleted_at`),
  KEY `idx_users_is_active` (`is_active`),
  KEY `users_loyalty_points` (`loyalty_points`),
  KEY `users_loyalty_tier` (`loyalty_tier`),
  KEY `users_is_active` (`is_active`),
  KEY `users_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `vehicle_companies`;
CREATE TABLE `vehicle_companies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `companyName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `contactPersonFirstName` varchar(255) NOT NULL,
  `contactPersonLastName` varchar(255) NOT NULL,
  `mobileNumber` varchar(255) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `logoPublicId` varchar(255) DEFAULT NULL,
  `country` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `onboardedBy` varchar(255) NOT NULL,
  `adminId` int NOT NULL,
  `status` enum('pendingReview','active','inactive','rejected','draft') NOT NULL DEFAULT 'draft',
  `licenseDocument` varchar(255) DEFAULT NULL,
  `licenseDocumentPublicId` varchar(255) DEFAULT NULL,
  `agreementForm` varchar(255) DEFAULT NULL,
  `agreementFormPublicId` varchar(255) DEFAULT NULL,
  `approvedBy` varchar(255) DEFAULT NULL,
  `approvedAt` datetime DEFAULT NULL,
  `reviewRemarks` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `vehicle_images`;
CREATE TABLE `vehicle_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicleId` int NOT NULL,
  `url` text NOT NULL,
  `publicId` varchar(255) NOT NULL,
  `imageSlot` varchar(50) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `vehicleId` (`vehicleId`),
  CONSTRAINT `vehicle_images_ibfk_1` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `vehicles`;
CREATE TABLE `vehicles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `companyId` int NOT NULL,
  `name` varchar(100) NOT NULL COMMENT 'Display name for the vehicle (e.g., "Executive Sedan")',
  `registrationNumber` varchar(20) NOT NULL COMMENT 'License plate number',
  `type` enum('sedan','suv','luxury','minivan','limousine','executive_van','coach','electric','hybrid','motorcycle') NOT NULL,
  `make` varchar(100) NOT NULL COMMENT 'Vehicle brand (e.g., Mercedes-Benz)',
  `model` varchar(100) NOT NULL COMMENT 'Vehicle model (e.g., S-Class)',
  `year` int NOT NULL,
  `capacity` int NOT NULL COMMENT 'Passenger capacity including driver',
  `luggageCapacity` int NOT NULL DEFAULT '2' COMMENT 'Number of standard suitcases',
  `isAvailable` tinyint(1) NOT NULL DEFAULT '1',
  `pricePerDay` decimal(10,2) DEFAULT NULL COMMENT 'Optional daily pricing',
  `description` text COMMENT 'Description of the vehicle',
  `maintenanceStatus` enum('operational','maintenance','out_of_service') DEFAULT 'operational',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `registrationNumber` (`registrationNumber`),
  KEY `companyId` (`companyId`),
  CONSTRAINT `vehicles_ibfk_1` FOREIGN KEY (`companyId`) REFERENCES `vehicle_companies` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Ground transportation vehicles for chauffer services';


DROP TABLE IF EXISTS `wallet_transactions`;
CREATE TABLE `wallet_transactions` (
  `id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `booking_id` varchar(255) DEFAULT NULL,
  `transaction_type` enum('deposit','withdrawal','payment','refund','bonus','fee','loyalty_earned','loyalty_redeemed','loyalty_expired','loyalty_adjustment') NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `points_amount` int NOT NULL DEFAULT '0',
  `currency` varchar(3) DEFAULT 'USD',
  `description` varchar(255) NOT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `balance_before` decimal(10,2) NOT NULL DEFAULT '0.00',
  `balance_after` decimal(10,2) NOT NULL DEFAULT '0.00',
  `points_before` int NOT NULL DEFAULT '0',
  `points_after` int NOT NULL DEFAULT '0',
  `payment_method` enum('card','mpesa','wallet','loyalty_points') DEFAULT NULL,
  `payment_reference` varchar(255) DEFAULT NULL,
  `status` enum('pending','completed','failed','cancelled') DEFAULT 'pending',
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_wallet_user_type` (`user_id`,`transaction_type`),
  KEY `idx_wallet_status` (`status`),
  KEY `idx_wallet_created` (`created_at`),
  KEY `idx_wallet_booking` (`booking_id`),
  KEY `idx_wallet_payment_method` (`payment_method`),
  KEY `idx_wallet_expires` (`expires_at`),
  KEY `idx_wallet_loyalty` (`transaction_type`),
  CONSTRAINT `wallet_transactions_chk_1` CHECK (json_valid(`metadata`))
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `yacht_amenities`;
CREATE TABLE `yacht_amenities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `yacht_amenity`;
CREATE TABLE `yacht_amenity` (
  `id` int NOT NULL AUTO_INCREMENT,
  `yachtId` int NOT NULL,
  `amenityId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `yachtId` (`yachtId`),
  KEY `amenityId` (`amenityId`),
  CONSTRAINT `yacht_amenity_ibfk_1` FOREIGN KEY (`yachtId`) REFERENCES `yachts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `yacht_amenity_ibfk_2` FOREIGN KEY (`amenityId`) REFERENCES `yacht_amenities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `yacht_images`;
CREATE TABLE `yacht_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `yachtId` int NOT NULL,
  `category` varchar(50) NOT NULL,
  `url` text NOT NULL,
  `publicId` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `yachtId` (`yachtId`),
  CONSTRAINT `yacht_images_ibfk_1` FOREIGN KEY (`yachtId`) REFERENCES `yachts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `yacht_type_image_placeholders`;
CREATE TABLE `yacht_type_image_placeholders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('dhows','yachts','boat','raft') NOT NULL,
  `placeholderImageUrl` varchar(255) NOT NULL COMMENT 'Full URL to the placeholder image',
  `placeholderImagePublicId` varchar(255) NOT NULL COMMENT 'Cloud storage public ID (e.g., Cloudinary public_id)',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `yachts`;
CREATE TABLE `yachts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `companyId` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('dhows','yachts','boat','raft') NOT NULL,
  `description` text COMMENT 'Additional details or description about the yacht',
  `capacity` int NOT NULL,
  `isAvailable` tinyint(1) DEFAULT '1',
  `pricePerHour` decimal(10,2) DEFAULT NULL,
  `pricePerDay` decimal(10,2) DEFAULT NULL,
  `maintenanceStatus` enum('operational','maintenance','out_of_service') DEFAULT 'operational',
  `location` varchar(100) DEFAULT NULL COMMENT 'General location e.g., Baobab, Malindi Marine Park',
  `city` varchar(100) DEFAULT NULL COMMENT 'City associated with the yacht location',
  `yachtTypeImagePlaceholderId` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `companyId` (`companyId`),
  KEY `yachtTypeImagePlaceholderId` (`yachtTypeImagePlaceholderId`),
  CONSTRAINT `yachts_ibfk_1` FOREIGN KEY (`companyId`) REFERENCES `yachts_companies` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `yachts_ibfk_2` FOREIGN KEY (`yachtTypeImagePlaceholderId`) REFERENCES `yacht_type_image_placeholders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `yachts_companies`;
CREATE TABLE `yachts_companies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `companyName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `contactPersonFirstName` varchar(255) NOT NULL,
  `contactPersonLastName` varchar(255) NOT NULL,
  `mobileNumber` varchar(255) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `country` varchar(255) NOT NULL,
  `licenseNumber` varchar(255) NOT NULL,
  `logoPublicId` varchar(255) DEFAULT NULL,
  `onboardedBy` varchar(255) NOT NULL,
  `adminId` int NOT NULL,
  `status` enum('pendingReview','active','inactive','rejected','draft') NOT NULL DEFAULT 'draft',
  `agreementForm` varchar(255) DEFAULT NULL,
  `agreementFormPublicId` varchar(255) DEFAULT NULL,
  `license` varchar(255) DEFAULT NULL,
  `licensePublicId` varchar(255) DEFAULT NULL,
  `approvedBy` varchar(255) DEFAULT NULL,
  `approvedAt` datetime DEFAULT NULL,
  `reviewRemarks` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 2025-11-05 16:29:33 UTC