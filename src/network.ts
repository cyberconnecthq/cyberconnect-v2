import { Env, Endpoint } from './types';

export const endpoints: { [key in Env]: Endpoint } = {
  STAGING: {
    cyberConnectApi: 'https://api.cyberconnect.dev/testnet/',
  },
  PRODUCTION: {
    cyberConnectApi: 'https://api.cyberconnect.dev/',
  },
};
