// PM2 ecosystem config — groups services under the `mobile-services` namespace
module.exports = {
  apps: [
    {
      name: 'api-gateway',
      script: 'dist/apps/api-gateway/main.js',
      exec_mode: 'fork',
      instances: 1,
      namespace: 'mobile-services',
      autorestart: true,
      env_production: {
        NODE_ENV: 'production',
        REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
        REDIS_PORT: process.env.REDIS_PORT || 6379,
        API_GATEWAY_PORT: process.env.API_GATEWAY_PORT || 5007,
        USER_SERVICE_PORT: process.env.USER_SERVICE_PORT || 3001,
        CHARTER_SERVICE_PORT: process.env.CHARTER_SERVICE_PORT || 3004,
        DIRECT_CHARTER_SERVICE_PORT: process.env.DIRECT_CHARTER_SERVICE_PORT || 3009,
        YACHT_SERVICE_PORT: process.env.YACHT_SERVICE_PORT || 3007,
        EXPERIENCE_SERVICE_PORT: process.env.EXPERIENCE_SERVICE_PORT || 3008,
        LOCATION_SERVICE_PORT: process.env.LOCATION_SERVICE_PORT || 3006,
        COMMUNICATION_SERVICE_PORT: process.env.COMMUNICATION_SERVICE_PORT || 3005,
        BOOKING_SERVICE_PORT: process.env.BOOKING_SERVICE_PORT || 3002,
        PAYMENT_SERVICE_PORT: process.env.PAYMENT_SERVICE_PORT || 3003
      }
    },
    {
      name: 'user-service',
      script: 'dist/apps/user-service/main.js',
      exec_mode: 'fork',
      instances: 1,
      namespace: 'mobile-services',
      autorestart: true,
      env_production: {
        NODE_ENV: 'production',
        USER_SERVICE_PORT: process.env.USER_SERVICE_PORT || 3001
      }
    },
    {
      name: 'charter-service',
      script: 'dist/apps/charter-service/main.js',
      exec_mode: 'fork',
      instances: 1,
      namespace: 'mobile-services',
      autorestart: true,
      env_production: {
        NODE_ENV: 'production',
        CHARTER_SERVICE_PORT: process.env.CHARTER_SERVICE_PORT || 3004
      }
    },
    {
      name: 'direct-charter-service',
      script: 'dist/apps/direct-charter-service/main.js',
      exec_mode: 'fork',
      instances: 1,
      namespace: 'mobile-services',
      autorestart: true,
      env_production: {
        NODE_ENV: 'production',
        DIRECT_CHARTER_SERVICE_PORT: process.env.DIRECT_CHARTER_SERVICE_PORT || 3009
      }
    },
    {
      name: 'yacht-service',
      script: 'dist/apps/yacht-service/main.js',
      exec_mode: 'fork',
      instances: 1,
      namespace: 'mobile-services',
      autorestart: true,
      env_production: {
        NODE_ENV: 'production',
        YACHT_SERVICE_PORT: process.env.YACHT_SERVICE_PORT || 3007
      }
    },
    {
      name: 'experience-service',
      script: 'dist/apps/experience-service/main.js',
      exec_mode: 'fork',
      instances: 1,
      namespace: 'mobile-services',
      autorestart: true,
      env_production: {
        NODE_ENV: 'production',
        EXPERIENCE_SERVICE_PORT: process.env.EXPERIENCE_SERVICE_PORT || 3008
      }
    },
    {
      name: 'booking-service',
      script: 'dist/apps/booking-service/main.js',
      exec_mode: 'fork',
      instances: 1,
      namespace: 'mobile-services',
      autorestart: true,
      env_production: {
        NODE_ENV: 'production',
        BOOKING_SERVICE_PORT: process.env.BOOKING_SERVICE_PORT || 3002
      }
    },
    {
      name: 'payment-service',
      script: 'dist/apps/payment-service/main.js',
      exec_mode: 'fork',
      instances: 1,
      namespace: 'mobile-services',
      autorestart: true,
      env_production: {
        NODE_ENV: 'production',
        PAYMENT_SERVICE_PORT: process.env.PAYMENT_SERVICE_PORT || 3003
      }
    },
    {
      name: 'communication-service',
      script: 'dist/apps/communication-service/main.js',
      exec_mode: 'fork',
      instances: 1,
      namespace: 'mobile-services',
      autorestart: true,
      env_production: {
        NODE_ENV: 'production',
        COMMUNICATION_SERVICE_PORT: process.env.COMMUNICATION_SERVICE_PORT || 3005
      }
    },
    {
      name: 'location-service',
      script: 'dist/apps/location-service/main.js',
      exec_mode: 'fork',
      instances: 1,
      namespace: 'mobile-services',
      autorestart: true,
      env_production: {
        NODE_ENV: 'production',
        LOCATION_SERVICE_PORT: process.env.LOCATION_SERVICE_PORT || 3006
      }
    }
    ,
    {
      name: 'uptime-kuma',
      script: '/opt/uptime-kuma/server/server.js',
      exec_mode: 'fork',
      instances: 1,
      namespace: 'monitoring',
      autorestart: true,
      env_production: { NODE_ENV: 'production', PORT: process.env.UPTIME_KUMA_PORT || 4000 }
    }
  ]
};
