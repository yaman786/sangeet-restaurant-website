/**
 * Environment variable validation utility
 * Validates that all required environment variables are set
 */
const validateEnvironment = () => {
  // Check for either DATABASE_URL or individual DB variables
  const hasDatabaseUrl = process.env.DATABASE_URL;
  const hasIndividualDbVars = process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME;

  if (!hasDatabaseUrl && !hasIndividualDbVars) {
    console.error('❌ Missing database configuration:');
    console.error('   Either provide DATABASE_URL or all of: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
    console.error('\nPlease check your environment variables.');
    process.exit(1);
  }

  // Validate JWT secret
  if (!process.env.JWT_SECRET) {
    console.error('❌ Missing required environment variable: JWT_SECRET');
    process.exit(1);
  }

  // Validate JWT secret length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  Warning: JWT_SECRET should be at least 32 characters long for security.');
  }

  // Log database connection type
  if (hasDatabaseUrl) {
    console.log('ℹ️  Using DATABASE_URL for database connection');
  } else if (hasIndividualDbVars) {
    console.log('ℹ️  Using individual database variables');
    if (process.env.DB_HOST && process.env.DB_HOST.includes('localhost')) {
      console.log('ℹ️  Using local database connection');
    }
  }

  console.log('✅ Environment validation passed');
};

module.exports = { validateEnvironment };
