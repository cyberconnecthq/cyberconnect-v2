import { Blockchain } from './types';
import bs58 from 'bs58';
import { hexlify } from '@ethersproject/bytes';
import { toUtf8Bytes } from '@ethersproject/strings';

export const encodeRpcMessage = (method: string, params?: any) => {
  return {
    jsonrpc: '2.0',
    id: 1,
    method,
    params,
  };
};

export const safeSend = (
  provider: any,
  method: string,
  params?: Array<any>,
): Promise<any> => {
  if (params == null) {
    params = [];
  }

  if (provider.request) {
    return provider.request({ method, params }).then(
      (response: any) => response,
      (error: any) => {
        throw error;
      },
    );
  } else if (provider.sendAsync || provider.send) {
    const sendFunc = (
      provider.sendAsync ? provider.sendAsync : provider.send
    ).bind(provider);
    const request = encodeRpcMessage(method, params);
    return new Promise((resolve, reject) => {
      sendFunc(request, (error: any, response: any) => {
        if (error) reject(error);

        if (response.error) {
          const error = new Error(response.error.message);
          (<any>error).code = response.error.code;
          (<any>error).data = response.error.data;
          reject(error);
        }

        resolve(response.result);
      });
    });
  } else {
    throw new Error(
      `Unsupported provider; provider must implement one of the following methods: send, sendAsync, request`,
    );
  }
};

export const getAddressByProvider = async (
  provider: any,
  chain: Blockchain,
) => {
  switch (chain) {
    case Blockchain.ETH: {
      // ethers Web3Provider
      if (typeof provider.getSigner === 'function') {
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        return address;
      }

      // ETH Provider
      const addresses = await safeSend(provider, 'eth_accounts');
      if (addresses && addresses[0]) {
        return addresses[0];
      } else {
        return '';
      }
    }
    default: {
      return '';
    }
  }
};

export const getSigningKeySignature = async (
  provider: any,
  chain: Blockchain,
  message: string,
  address: string,
) => {
  if (chain === Blockchain.ETH) {
    if (provider.isAuthereum) {
      return provider.signMessageWithSigningKey(message);
    }

    // ethers Web3Provider
    if (typeof provider.getSigner === 'function') {
      const signer = provider.getSigner();
      const signingKeySignature = await signer.signMessage(message);
      return signingKeySignature;
    }

    // ETH Provider
    const signingKeySignature = await safeSend(provider, 'personal_sign', [
      hexlify(toUtf8Bytes(message)),
      address,
    ]);

    return signingKeySignature;
  } else {
    return '';
  }
};
