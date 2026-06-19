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
        API_GATEWAY_PORT: process.env.API_GATEWAY_PORT || 5007
      }
    },
    {
      name: 'user-service',
      script: 'dist/apps/user-service/main.js',
      exec_mode: 'fork',
      instances: 1,
      namespace: 'mobile-services',
      autorestart: true,
      env_production: { NODE_ENV: 'production' }
    },
    {
      name: 'charter-service',
      script: 'dist/apps/charter-service/main.js',
      exec_mode: 'fork',
      instances: 1,
      namespace: 'mobile-services',
      autorestart: true,
      env_production: { NODE_ENV: 'production' }
    },
    {
      name: 'direct-charter-service',
      script: 'dist/apps/direct-charter-service/main.js',
      exec_mode: 'fork',
      instances: 1,
      namespace: 'mobile-services',
      autorestart: true,
      env_production: { NODE_ENV: 'production' }
    },
    {
      name: 'yacht-service',
      script: 'dist/apps/yacht-service/main.js',
      exec_mode: 'fork',
      instances: 1,
      namespace: 'mobile-services',
      autorestart: true,
      env_production: { NODE_ENV: 'production' }
    },
    {
      name: 'experience-service',
      script: 'dist/apps/experience-service/main.js',
      exec_mode: 'fork',
      instances: 1,
      namespace: 'mobile-services',
      autorestart: true,
      env_production: { NODE_ENV: 'production' }
    },
    {
      name: 'booking-service',
      script: 'dist/apps/booking-service/main.js',
      exec_mode: 'fork',
      instances: 1,
      namespace: 'mobile-services',
      autorestart: true,
      env_production: { NODE_ENV: 'production' }
    },
    {
      name: 'payment-service',
      script: 'dist/apps/payment-service/main.js',
      exec_mode: 'fork',
      instances: 1,
      namespace: 'mobile-services',
      autorestart: true,
      env_production: { NODE_ENV: 'production' }
    },
    {
      name: 'communication-service',
      script: 'dist/apps/communication-service/main.js',
      exec_mode: 'fork',
      instances: 1,
      namespace: 'mobile-services',
      autorestart: true,
      env_production: { NODE_ENV: 'production' }
    },
    {
      name: 'location-service',
      script: 'dist/apps/location-service/main.js',
      exec_mode: 'fork',
      instances: 1,
      namespace: 'mobile-services',
      autorestart: true,
      env_production: { NODE_ENV: 'production' }
    }
    ,
    {
      name: 'uptime-kuma',
      script: '/opt/uptime-kuma/server/server.js',
      exec_mode: 'fork',
      instances: 1,
      namespace: 'monitoring',
      autorestart: true,
      env_production: { NODE_ENV: 'production', PORT: 4000 }
    }
  ]
};
