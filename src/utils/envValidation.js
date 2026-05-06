/**
 * Environment Variable Validation
 * Validates that required environment variables are set at startup
 */

const REQUIRED_ENV_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_APP_ID'
];

const OPTIONAL_ENV_VARS = [
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_MEASUREMENT_ID',
  'VITE_GEMINI_API_KEY',
  'VITE_GEMINI_MODEL'
];

export const validateEnvVars = () => {
  const missing = [];
  const warnings = [];

  // Check required variables
  REQUIRED_ENV_VARS.forEach(varName => {
    const value = import.meta.env[varName];
    if (!value || value === 'your_' + varName.toLowerCase().replace('vite_', '').replace('_', '_here') || 
        value === 'your_key_here' || value === 'your_firebase_api_key_here') {
      missing.push(varName);
    }
  });

  // Check optional variables
  OPTIONAL_ENV_VARS.forEach(varName => {
    const value = import.meta.env[varName];
    if (!value) {
      warnings.push(varName);
    }
  });

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => {
      console.error(`  - ${varName}`);
    });
    console.error('\nPlease set these in your .env file. See .env.example for reference.');
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Optional environment variables not set:');
    warnings.forEach(varName => {
      console.warn(`  - ${varName}`);
    });
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings
  };
};

// Run validation immediately on import
const validation = validateEnvVars();

if (!validation.isValid) {
  console.error('⚠️  Application may not function correctly due to missing environment variables.');
}

export default validation;
