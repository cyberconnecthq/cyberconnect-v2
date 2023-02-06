import { Env, Endpoint } from './types';

export const endpoints: { [key in Env]: Endpoint } = {
  STAGING: {
    cyberConnectApi: 'https://api.stg.cyberconnect.dev/',
  },
  PRODUCTION: {
    cyberConnectApi: 'https://api.cyberconnect.dev/',
  },
};
