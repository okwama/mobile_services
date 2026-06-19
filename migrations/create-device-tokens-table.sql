-- Migration: Create device_tokens table for OneSignal integration
-- This table stores OneSignal player IDs for each user device

USE air_charters;

-- Drop table if exists for clean migration
DROP TABLE IF EXISTS `device_tokens`;

CREATE TABLE `device_tokens` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(255) NOT NULL,
  `player_id` VARCHAR(255) NOT NULL,
  `device_type` ENUM('android', 'ios', 'web') NOT NULL,
  `device_model` VARCHAR(255) NULL,
  `os_version` VARCHAR(50) NULL,
  `app_version` VARCHAR(50) NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `last_active_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY `idx_player_id` (`player_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_user_active` (`user_id`, `is_active`),
  KEY `idx_device_active_updated` (`is_active`, `updated_at`),
  
  CONSTRAINT `fk_device_tokens_user` 
    FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 
COMMENT='Stores OneSignal player IDs for push notifications';

