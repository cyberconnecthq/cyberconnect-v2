import { endpoints } from './network';
import { follow, registerSigningKey, unfollow } from './queries';
import { ConnectError, ErrorCode } from './error';
import {
  Blockchain,
  Config,
  Endpoint,
  FollowRequest,
  UnfollowRequest,
} from './types';
import { getAddressByProvider, getSigningKeySignature } from './utils';
import { Env } from '.';
import { C_ACCESS_TOKEN_KEY } from './constant';
import {
  clearSigningKey,
  getPublicKey,
  hasSigningKey,
  signWithSigningKey,
  clearSigningKeyByAddress,
} from './crypto';

class CyberConnect {
  address: string = '';
  namespace: string;
  endpoint: Endpoint;
  resolverRegistry: any;
  signature: string = '';
  chain: Blockchain = Blockchain.ETH;
  chainRef: string = '';
  provider: any = null;
  signingMessageEntity: string | undefined = '';

  constructor(config: Config) {
    const { provider, namespace, env, chainRef, chain, signingMessageEntity } =
      config;

    if (!namespace) {
      throw new ConnectError(ErrorCode.EmptyNamespace);
    }

    this.namespace = namespace;
    this.endpoint = endpoints[env || Env.PRODUCTION];
    this.chain = chain || Blockchain.ETH;
    this.chainRef = chainRef || '';
    this.provider = provider;
    this.signingMessageEntity = signingMessageEntity;
    delete window.localStorage[C_ACCESS_TOKEN_KEY];
  }

  async getAddress() {
    if (this.address) {
      return this.address;
    }
    return (this.address = await getAddressByProvider(
      this.provider,
      this.chain,
    ));
  }

  async authWithSigningKey() {
    if (await hasSigningKey(this.address)) {
      return;
    }

    const publicKey = await getPublicKey(this.address);
    const acknowledgement = `I authorize ${
      this.signingMessageEntity || 'CyberConnect'
    } from this device using signing key:\n`;
    const message = `${acknowledgement}${publicKey}`;

    this.address = await this.getAddress();
    try {
      const signingKeySignature = await getSigningKeySignature(
        this.provider,
        this.chain,
        message,
        this.address,
      );
      if (signingKeySignature) {
        const resp = await registerSigningKey({
          address: this.address,
          signature: signingKeySignature,
          message,
          url: this.endpoint.cyberConnectApi,
        });

        if (resp?.data?.registerSigningKey.status !== 'SUCCESS') {
          throw new ConnectError(
            ErrorCode.GraphqlError,
            resp?.data?.registerSigningKey.result,
          );
        }
      } else {
        throw new Error('signingKeySignature is empty');
      }
    } catch (e) {
      console.log('e', e);
      clearSigningKeyByAddress(this.address);
      throw new Error('User cancel the sign process');
    }
  }

  async follow(address: string, handle: string) {
    try {
      this.address = await this.getAddress();
      await this.authWithSigningKey();

      const message = {
        op: 'follow',
        address,
        handle: handle,
        ts: Date.now(),
      };

      const signature = await signWithSigningKey(
        JSON.stringify(message),
        this.address,
      );
      const publicKey = await getPublicKey(this.address);

      const params: FollowRequest = {
        address,
        handle,
        message: JSON.stringify(message),
        signature,
        signingKey: publicKey,
      };

      const resp = await follow(params, this.endpoint.cyberConnectApi);

      if (resp?.data?.follow.status === 'INVALID_SIGNATURE') {
        await clearSigningKey();

        throw new ConnectError(
          ErrorCode.GraphqlError,
          resp?.data?.follow.status,
        );
      }

      if (resp?.data?.follow.status !== 'SUCCESS') {
        throw new ConnectError(
          ErrorCode.GraphqlError,
          resp?.data?.follow.status,
        );
      }
    } catch (e: any) {
      throw new ConnectError(ErrorCode.GraphqlError, e.message || e);
    }
  }

  async unfollow(address: string, handle: string) {
    try {
      this.address = await this.getAddress();
      await this.authWithSigningKey();

      const message = {
        op: 'unfollow',
        address,
        handle: handle,
        ts: Date.now(),
      };

      const signature = await signWithSigningKey(
        JSON.stringify(message),
        this.address,
      );
      const publicKey = await getPublicKey(this.address);

      const params: UnfollowRequest = {
        address,
        handle,
        message: JSON.stringify(message),
        signature,
        signingKey: publicKey,
      };

      const resp = await unfollow(params, this.endpoint.cyberConnectApi);

      if (resp?.data?.unfollow.status === 'INVALID_SIGNATURE') {
        await clearSigningKey();

        throw new ConnectError(
          ErrorCode.GraphqlError,
          resp?.data?.unfollow.status,
        );
      }

      if (resp?.data?.unfollow.status !== 'SUCCESS') {
        throw new ConnectError(
          ErrorCode.GraphqlError,
          resp?.data?.unfollow.status,
        );
      }
    } catch (e: any) {
      throw new ConnectError(ErrorCode.GraphqlError, e.message || e);
    }
  }
}

export default CyberConnect;
