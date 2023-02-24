import { endpoints } from './network';
import {
  follow,
  registerSigningKey,
  unfollow,
  publish,
  like as likeQuery,
  dislike as dislikeQuery,
  cancelLike,
} from './queries';
import { ConnectError, ErrorCode } from './error';
import {
  Blockchain,
  Config,
  Endpoint,
  FollowRequest,
  UnfollowRequest,
  PublishRequest,
  ReactType,
  ReactRequest,
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
  chainId: number;

  constructor(config: Config) {
    const { provider, namespace, env, chainRef, chain, signingMessageEntity } =
      config;

    if (!namespace) {
      throw new ConnectError(ErrorCode.EmptyNamespace);
    }

    this.chainId = env === Env.PRODUCTION ? 56 : 97;
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

  private async retryFollow(address: string, handle: string) {
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

      if (resp?.data?.follow.status !== 'SUCCESS') {
        throw new ConnectError(
          ErrorCode.GraphqlError,
          'retry failed' + resp?.data?.follow.status,
        );
      }
    } catch (e: any) {
      throw new ConnectError(ErrorCode.GraphqlError, e.message || e);
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

      if (resp?.data?.follow.status === 'MESSAGE_EXPIRED') {
        await this.retryFollow(address, handle);
      } else if (resp?.data?.follow.status !== 'SUCCESS') {
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

  async createPost(post: { title: string; body: string }, handle: string) {
    return await this.publish(post, handle, '');
  }

  async updatePost(
    post: { title: string; body: string },
    handle: string,
    id: string,
  ) {
    return await this.publish(post, handle, id);
  }

  async like(postId: string) {
    try {
      const params = await this.getReactParams(postId, 'like');
      const resp = await likeQuery(params, this.endpoint.cyberConnectApi);

      if (resp?.data?.like.status === 'SUCCESS') {
        return resp?.data?.like.status;
      }

      if (resp?.data?.like.status === 'INVALID_SIGNATURE') {
        await clearSigningKey();

        throw new ConnectError(ErrorCode.GraphqlError, resp?.data?.like.status);
      }

      if (resp?.data?.like.status !== 'SUCCESS') {
        throw new ConnectError(ErrorCode.GraphqlError, resp?.data?.like.status);
      }
    } catch (e: any) {
      throw new ConnectError(ErrorCode.GraphqlError, e.message || e);
    }
  }

  async dislike(postId: string) {
    try {
      const params = await this.getReactParams(postId, 'dislike');
      const resp = await dislikeQuery(params, this.endpoint.cyberConnectApi);

      if (resp?.data?.dislike.status === 'SUCCESS') {
        return resp?.data?.dislike.status;
      }

      if (resp?.data?.dislike.status === 'INVALID_SIGNATURE') {
        await clearSigningKey();

        throw new ConnectError(
          ErrorCode.GraphqlError,
          resp?.data?.dislike.status,
        );
      }

      if (resp?.data?.dislike.status !== 'SUCCESS') {
        throw new ConnectError(
          ErrorCode.GraphqlError,
          resp?.data?.dislike.status,
        );
      }
    } catch (e: any) {
      throw new ConnectError(ErrorCode.GraphqlError, e.message || e);
    }
  }

  async cancelReaction(postId: string) {
    try {
      const params = await this.getReactParams(postId, 'cancel');
      const resp = await cancelLike(params, this.endpoint.cyberConnectApi);

      if (resp?.data?.cancelLike.status === 'SUCCESS') {
        return resp?.data?.cancelLike.status;
      }

      if (resp?.data?.cancelLike.status === 'INVALID_SIGNATURE') {
        await clearSigningKey();

        throw new ConnectError(
          ErrorCode.GraphqlError,
          resp?.data?.dislike.status,
        );
      }

      if (resp?.data?.cancelLike.status !== 'SUCCESS') {
        throw new ConnectError(
          ErrorCode.GraphqlError,
          resp?.data?.dislike.status,
        );
      }
    } catch (e: any) {
      throw new ConnectError(ErrorCode.GraphqlError, e.message || e);
    }
  }

  private async getReactParams(postId: string, operation: ReactType) {
    try {
      this.address = await this.getAddress();
      await this.authWithSigningKey();

      const message = {
        op: operation,
        address: this.address,
        postId,
        ts: Date.now(),
      };

      const signature = await signWithSigningKey(
        JSON.stringify(message),
        this.address,
      );
      const publicKey = await getPublicKey(this.address);

      const params: ReactRequest = {
        address: this.address,
        postId,
        message: JSON.stringify(message),
        signature,
        signingKey: publicKey,
      };

      return params;
    } catch (e: any) {
      throw new ConnectError(ErrorCode.GraphqlError, e.message || e);
    }
  }

  private async publish(
    post: { title: string; body: string },
    handle: string = '',
    id: string,
  ) {
    try {
      this.address = await this.getAddress();
      await this.authWithSigningKey();

      const content = JSON.stringify({
        title: post.title,
        body: post.body,
        address: this.address,
        ts: Date.now(),
        chainId: this.chainId,
        handle,
      });

      const signature = await signWithSigningKey(content, this.address);
      const publicKey = await getPublicKey(this.address);

      const params: { id: string; input: PublishRequest } = {
        id: id,
        input: {
          author: this.address,
          content: content,
          signature,
          signingKey: publicKey,
          handle,
        },
      };

      const resp = await publish(params, this.endpoint.cyberConnectApi);

      if (resp?.data?.publish.status === 'SUCCESS') {
        return resp?.data?.publish;
      }

      if (resp?.data?.publish.status === 'INVALID_SIGNATURE') {
        await clearSigningKey();

        throw new ConnectError(
          ErrorCode.GraphqlError,
          resp?.data?.follow.status,
        );
      }

      if (resp?.data?.publish.status !== 'SUCCESS') {
        throw new ConnectError(
          ErrorCode.GraphqlError,
          resp?.data?.follow.status,
        );
      }
    } catch (e: any) {
      throw new ConnectError(ErrorCode.GraphqlError, e.message || e);
    }
  }
}

export default CyberConnect;
