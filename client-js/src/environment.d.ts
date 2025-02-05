declare global {
  namespace NodeJS {
    interface ProcessEnv {
      KEY_PATH: string;
      RPC_URL: string;
      PROGRAM_ID: string;
    }
  }
}

export {};
