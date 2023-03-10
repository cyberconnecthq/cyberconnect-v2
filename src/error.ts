import { DFLAG, C_ACCESS_TOKEN_KEY } from './constant';
export class ConnectError {
  code: ErrorCode;
  message: string;

  constructor(code: ErrorCode, message?: string) {
    this.code = code;
    this.message = message || errors[code];
    if (!DFLAG && window && window.localStorage) {
      delete window.localStorage[C_ACCESS_TOKEN_KEY];
    }
  }

  printError() {
    console.error(this.message);
  }
}

export enum ErrorCode {
  EmptyAppId = 'EmptyAppId',
  EmptyNamespace = 'EmptyNamespace',
  EmptyEthProvider = 'EmptyEthProvider',
  EmptyAuthProvider = 'EmptyAuthProvider',
  NetworkError = 'NetworkError',
  GraphqlError = 'GraphqlError',
  AuthProviderError = 'AuthProviderError',
  SignJwtError = 'SignJwtError',
  AppIdTooLong = 'AppIdTooLong',
}

const errors: { [key in ErrorCode]: string } = {
  AppIdTooLong: 'App id length can not be longer than 128',
  EmptyAppId: 'App id can not be empty',
  EmptyNamespace: 'Namespace can not be empty',
  EmptyEthProvider: 'Eth provider can not be empty',
  EmptyAuthProvider: 'Could not find authProvider',
  NetworkError: '',
  GraphqlError: '',
  AuthProviderError: '',
  SignJwtError: '',
};
