/**
 * Application Startup Script
 * 
 * Performs startup checks and validates environment configuration.
 * This should be called when the Next.js application starts.
 */

import { logger } from './logger';

let isInitialized = false;

/**
 * Initializes the SimpleClaw application.
 * Validates environment variables.
 */
export function initializeApp(): void {
  if (isInitialized) {
    logger.warn('Application already initialized');
    return;
  }

  logger.info('Initializing SimpleClaw application');

  try {
    // Validate environment variables
    validateEnvironment();

    isInitialized = true;
    logger.info('SimpleClaw application initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize application', error);
    throw error;
  }
}

/**
 * Validates required environment variables.
 * Throws an error if any required variables are missing.
 */
function validateEnvironment(): void {
  const required = [
    'DATABASE_URL',
    'DATABASE_AUTH_TOKEN',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'ENCRYPTION_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'CLERK_WEBHOOK_SECRET',
    'AKASH_CONSOLE_API_URL',
    'AKASH_API_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    const errorMessage = `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.\n' +
      'See .env.example for a complete list of required variables.';
    
    logger.error('Environment validation failed', { missingVars: missing });
    
    throw new Error(errorMessage);
  }

  logger.info('Environment variables validated');
}

/**
 * Shuts down the application gracefully.
 */
export function shutdownApp(): void {
  if (!isInitialized) {
    logger.warn('Application not initialized');
    return;
  }

  logger.info('Shutting down SimpleClaw application');

  try {
    isInitialized = false;
    logger.info('SimpleClaw application shut down successfully');
  } catch (error) {
    logger.error('Failed to shut down application', error);
    throw error;
  }
}

// Handle process termination signals
if (typeof process !== 'undefined') {
  process.on('SIGINT', () => {
    logger.info('Received SIGINT signal');
    shutdownApp();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    logger.info('Received SIGTERM signal');
    shutdownApp();
    process.exit(0);
  });
}
