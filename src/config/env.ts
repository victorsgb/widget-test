interface EnvConfig {
  SOCKET_SERVER_URL: string;
  API_URL: string;
  ADMIN_API_KEY: string;
}

// Parse environment variables with proper type conversion
export const env: EnvConfig = {
  SOCKET_SERVER_URL: import.meta.env.VITE_SOCKET_SERVER_URL as string,
  API_URL: import.meta.env.VITE_API_URL as string,
  ADMIN_API_KEY: import.meta.env.VITE_ADMIN_API_KEY as string,
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
