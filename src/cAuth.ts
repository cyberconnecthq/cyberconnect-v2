import { Blockchain } from './types';
import { toUtf8Bytes } from '@ethersproject/strings';
import { hexlify } from '@ethersproject/bytes';
import { auth } from './queries';
import { C_ACCESS_TOKEN_KEY } from './constant';
import bs58 from 'bs58';
const msgToSign = 'Sign in to CyberConnect from this device';

export const personalSign = async (provider: any, address: string) => {
  if (provider.signMessage) {
    // return awat
    if (!provider.publicKey) {
      alert('wallet not connected');
    }
    if (!provider.signMessage)
      throw new Error('Wallet does not support message signing!');
    const message = new TextEncoder().encode(msgToSign);
    const signature = await provider.signMessage(message);
    return bs58.encode(signature);
  } else {
    return await provider.send('personal_sign', [
      hexlify(toUtf8Bytes(msgToSign)),
      address.toLowerCase(),
    ]);
  }
};

export const cAuth = async (
  provider: any,
  address: string,
  url: string,
  chain: Blockchain,
) => {
  if (window.localStorage.getItem(C_ACCESS_TOKEN_KEY)) {
    return window.localStorage.getItem(C_ACCESS_TOKEN_KEY);
  }
  const signature = await personalSign(provider, address);
  if (signature) {
    let sig;
    if (chain === Blockchain.ETH) {
      if (typeof signature == 'string') {
        sig = signature;
      } else if (signature.result) {
        sig = signature.result;
      } else {
        return;
      }
    } else {
      sig = signature;
    }
    const res = await auth({
      address,
      signature: sig,
      network: chain,
      url,
    });
    if (
      res.data &&
      res.data.auth.result === 'SUCCESS' &&
      res.data.auth.authToken
    ) {
      window?.localStorage?.setItem(
        C_ACCESS_TOKEN_KEY,
        res.data.auth.authToken,
      );
      return res;
    }
  }
};
