declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      REACT_APP_API_URL: string;
      // Add more environment variables as needed
    }
  }
}

// This export is needed to make this file a module
export {};

