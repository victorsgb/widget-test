interface EnvConfig {
  API_URL: string;
}

// Parse environment variables with proper type conversion
export const env: EnvConfig = {
  API_URL: import.meta.env.VITE_API_URL as string,
};

// Validate required environment variables
const validateEnv = () => {
  const requiredVars = ['API_URL'];
  const missingVars = requiredVars.filter(
    (key) => !env[key as keyof EnvConfig]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
};

// Call validation in development mode
if (import.meta.env.DEV) {
  validateEnv();
}

export default env;
