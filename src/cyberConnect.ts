import { endpoints } from './network';
import {
  follow as followQuery,
  registerSigningKey,
  unfollow as unfollowQuery,
  publishPost as publishPostQuery,
  publishComment as publishCommentQuery,
  like as likeQuery,
  dislike as dislikeQuery,
  cancelLike,
  createFollowTypedMessage,
  createPublishPostTypedMessage,
  createPublishCommentTypedMessage,
  createLikeTypedMessage,
} from './queries';
import { ConnectError, ErrorCode } from './error';
import {
  Blockchain,
  Config,
  Endpoint,
  FollowRequest,
  UnfollowRequest,
  PublishPostRequest,
  PublishCommentRequest,
  LikeOperation,
  ReactRequest,
  LikeMessage,
  PostMessage,
  CommentMessage,
  Content,
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

    this.chainId = env === Env.STAGING ? 97 : 56;
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
      clearSigningKeyByAddress(this.address);
      throw new Error('User cancel the sign process');
    }
  }

  private async retryFollow(handle: string, ts: number) {
    try {
      const params = await this.getFollowRequestParams(handle, ts);
      const resp = await followQuery(params, this.endpoint.cyberConnectApi);

      if (resp?.data?.follow.status !== 'SUCCESS') {
        throw new ConnectError(
          ErrorCode.GraphqlError,
          'Retry follow with ts from server failed:' +
            resp?.data?.follow.status,
        );
      }
    } catch (e: any) {
      throw new ConnectError(ErrorCode.GraphqlError, e.message || e);
    }
  }

  private getHandleWithoutSuffix(handle: string) {
    return handle.split('.')[0];
  }

  private async getFollowRequestParams(handle: string, ts?: number) {
    this.address = await this.getAddress();
    await this.authWithSigningKey();

    const input = {
      address: this.address,
      handle: handle,
      operation: 'FOLLOW',
    } as const;

    const res = await createFollowTypedMessage(
      input,
      this.endpoint.cyberConnectApi,
    );

    const message = res.data.createFollowTypedMessage.message;

    const signature = await signWithSigningKey(message, this.address);
    const publicKey = await getPublicKey(this.address);

    const params: FollowRequest = {
      address: this.address,
      handle,
      message,
      signature,
      signingKey: publicKey,
    };

    return params;
  }

  async follow(handle: string) {
    try {
      const params = await this.getFollowRequestParams(handle);

      const resp = await followQuery(params, this.endpoint.cyberConnectApi);

      if (resp?.data?.follow.status === 'INVALID_SIGNATURE') {
        await clearSigningKey();

        throw new ConnectError(
          ErrorCode.GraphqlError,
          resp?.data?.follow.status,
        );
      }

      if (resp?.data?.follow.status === 'MESSAGE_EXPIRED') {
        await this.retryFollow(handle, resp?.data?.follow.tsInServer);
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

  private async getUnfollowRequestParams(handle: string, ts?: number) {
    this.address = await this.getAddress();
    await this.authWithSigningKey();

    const input = {
      address: this.address,
      handle: handle,
      operation: 'UNFOLLOW',
    } as const;

    const res = await createFollowTypedMessage(
      input,
      this.endpoint.cyberConnectApi,
    );

    const message = res.data.createFollowTypedMessage.message;

    const signature = await signWithSigningKey(message, this.address);
    const publicKey = await getPublicKey(this.address);

    const params: UnfollowRequest = {
      address: this.address,
      handle,
      message,
      signature,
      signingKey: publicKey,
    };

    return params;
  }

  private async retryUnfollow(handle: string, ts: number) {
    const params = await this.getUnfollowRequestParams(handle, ts);
    const resp = await unfollowQuery(params, this.endpoint.cyberConnectApi);

    if (resp?.data?.unfollow.status !== 'SUCCESS') {
      throw new ConnectError(
        ErrorCode.GraphqlError,
        'Retry unfollow with ts from server failed:' +
          resp?.data?.unfollow.status,
      );
    }
  }

  async unfollow(handle: string) {
    try {
      const params = await this.getUnfollowRequestParams(handle);
      const resp = await unfollowQuery(params, this.endpoint.cyberConnectApi);

      if (resp?.data?.unfollow.status === 'INVALID_SIGNATURE') {
        await clearSigningKey();

        throw new ConnectError(
          ErrorCode.GraphqlError,
          resp?.data?.unfollow.status,
        );
      }

      if (resp?.data?.unfollow.status === 'MESSAGE_EXPIRED') {
        await this.retryUnfollow(handle, resp?.data?.unfollow.tsInServer);
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

  async createPost(content: Omit<Content, 'id'>) {
    return await this.publishPost(content);
  }

  async updatePost(id: string, content: Content) {
    return await this.publishPost({ ...content, id });
  }

  private async retryLike(contentId: string, ts: number) {
    const params = await this.getReactParams(contentId, 'like', ts);
    const resp = await likeQuery(params, this.endpoint.cyberConnectApi);

    if (resp?.data?.like.status !== 'SUCCESS') {
      throw new ConnectError(
        ErrorCode.GraphqlError,
        'Retry with ts from server failed: ' + resp?.data?.like.status,
      );
    }
  }

  async like(contentId: string) {
    try {
      const params = await this.getReactParams(contentId, 'like');
      const resp = await likeQuery(params, this.endpoint.cyberConnectApi);

      if (resp?.data?.like.status === 'SUCCESS') {
        return resp?.data?.like;
      }

      if (resp?.data?.like.status === 'INVALID_SIGNATURE') {
        await clearSigningKey();

        throw new ConnectError(ErrorCode.GraphqlError, resp?.data?.like.status);
      }

      if (resp?.data?.like.status === 'MESSAGE_EXPIRED') {
        await this.retryLike(contentId, resp?.data?.like.tsInServer);
      }

      if (resp?.data?.like.status !== 'SUCCESS') {
        throw new ConnectError(ErrorCode.GraphqlError, resp?.data?.like.status);
      }
    } catch (e: any) {
      throw new ConnectError(ErrorCode.GraphqlError, e.message || e);
    }
  }

  private async retryDislike(contentId: string, ts: number) {
    const params = await this.getReactParams(contentId, 'dislike', ts);
    const resp = await dislikeQuery(params, this.endpoint.cyberConnectApi);

    if (resp?.data?.dislike.status !== 'SUCCESS') {
      throw new ConnectError(
        ErrorCode.GraphqlError,
        'Retry dislike with ts from server failed: ' +
          resp?.data?.dislike.status,
      );
    }
  }

  async dislike(contentId: string) {
    try {
      const params = await this.getReactParams(contentId, 'dislike');
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

      if (resp?.data?.dislike.status === 'MESSAGE_EXPIRED') {
        await this.retryDislike(contentId, resp?.data?.dislike.tsInServer);
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

  private async retryCancelReaction(contentId: string, ts: number) {
    const params = await this.getReactParams(contentId, 'cancel', ts);
    const resp = await cancelLike(params, this.endpoint.cyberConnectApi);

    if (resp?.data?.cancelLike.status !== 'SUCCESS') {
      throw new ConnectError(
        ErrorCode.GraphqlError,
        'Retry cancel like with fs from server failed: ' +
          resp?.data?.dislike.status,
      );
    }
  }

  async cancelReaction(contentId: string) {
    try {
      const params = await this.getReactParams(contentId, 'cancel');
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

      if (resp?.data?.cancelLike.status === 'MESSAGE_EXPIRED') {
        await this.retryCancelReaction(
          contentId,
          resp?.data?.cancelLike.tsInServer,
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

  private async getReactParams(
    contentId: string,
    operation: LikeOperation,
    ts?: number,
  ) {
    try {
      this.address = await this.getAddress();
      await this.authWithSigningKey();

      const input = {
        address: this.address,
        contentID: contentId,
        operation: operation.toUpperCase() as 'LIKE' | 'DISLIKE' | 'CANCEL',
      } as const;

      const res = await createLikeTypedMessage(
        input,
        this.endpoint.cyberConnectApi,
      );

      const message = res.data.createLikeTypedMessage.message;

      const signature = await signWithSigningKey(message, this.address);
      const publicKey = await getPublicKey(this.address);

      const params: ReactRequest = {
        address: this.address,
        contentID: contentId,
        message,
        signature,
        signingKey: publicKey,
      };

      return params;
    } catch (e: any) {
      throw new ConnectError(ErrorCode.GraphqlError, e.message || e);
    }
  }

  private async getCommentParams(
    content: Content,
    targetContentId: string,
    ts?: number,
  ) {
    this.address = await this.getAddress();
    await this.authWithSigningKey();

    const input = {
      address: this.address,
      targetContentID: targetContentId,
      title: content.title,
      body: content.body,
      handle: this.getHandleWithoutSuffix(content.author),
    } as const;

    const res = await createPublishCommentTypedMessage(
      input,
      this.endpoint.cyberConnectApi,
    );

    const message = res.data.createPublishCommentTypedMessage.message;

    const signature = await signWithSigningKey(message, this.address);
    const publicKey = await getPublicKey(this.address);

    const params: {
      contentId?: string;
      input: PublishCommentRequest;
      targetContentId: string;
    } = {
      contentId: content.id,
      targetContentId,
      input: {
        authorAddress: this.address,
        authorHandle: content.author,
        message,
        signature,
        signingKey: publicKey,
      },
    };

    return params;
  }

  private async retryPublishComment(
    content: Content,
    targetContentId: string,
    ts: number,
  ) {
    const params = await this.getCommentParams(content, targetContentId, ts);

    const resp = await publishCommentQuery(
      params,
      this.endpoint.cyberConnectApi,
    );

    if (resp?.data?.publishComment.status !== 'SUCCESS') {
      throw new ConnectError(
        ErrorCode.GraphqlError,
        'Retry comment with ts from server failed: ' +
          resp?.data?.publishComment.status,
      );
    }
  }

  private async publishComment(targetContentId: string, content: Content) {
    try {
      const params = await this.getCommentParams(content, targetContentId);

      const resp = await publishCommentQuery(
        params,
        this.endpoint.cyberConnectApi,
      );

      if (resp?.data?.publishComment.status === 'SUCCESS') {
        return resp?.data?.publishComment;
      }

      if (resp?.data?.publishComment.status === 'INVALID_SIGNATURE') {
        await clearSigningKey();

        throw new ConnectError(
          ErrorCode.GraphqlError,
          resp?.data?.publishComment.status,
        );
      }

      if (resp?.data?.publishComment.status === 'MESSAGE_EXPIRED') {
        await this.retryPublishComment(
          content,
          targetContentId,
          resp?.data?.publishComment.tsInServer,
        );
      }

      if (resp?.data?.publishComment.status !== 'SUCCESS') {
        throw new ConnectError(
          ErrorCode.GraphqlError,
          resp?.data?.publishComment.status,
        );
      }
    } catch (e: any) {
      throw new ConnectError(ErrorCode.GraphqlError, e.message || e);
    }
  }

  async createComment(targetContentId: string, content: Content) {
    return await this.publishComment(targetContentId, content);
  }

  async updateComment(id: string, targetContentId: string, content: Content) {
    return await this.publishComment(targetContentId, { ...content, id });
  }

  private async getPublishPostParams(content: Content, ts?: number) {
    this.address = await this.getAddress();
    await this.authWithSigningKey();

    const input = {
      address: this.address,
      handle: this.getHandleWithoutSuffix(content.author),
      title: content.title,
      body: content.body,
    } as const;

    const res = await createPublishPostTypedMessage(
      input,
      this.endpoint.cyberConnectApi,
    );

    const message = res.data.createPublishPostTypedMessage.message;

    const signature = await signWithSigningKey(message, this.address);
    const publicKey = await getPublicKey(this.address);

    const params: { contentId?: string; input: PublishPostRequest } = {
      contentId: content.id,
      input: {
        authorAddress: this.address,
        message,
        signature,
        signingKey: publicKey,
        authorHandle: content.author,
      },
    };

    return params;
  }

  private async retryPublishPost(content: Content, ts: number) {
    const params = await this.getPublishPostParams(content, ts);
    const resp = await publishPostQuery(params, this.endpoint.cyberConnectApi);

    if (resp?.data?.publishPost.status !== 'SUCCESS') {
      throw new ConnectError(
        ErrorCode.GraphqlError,
        'Retry publish with ts from server failed: ' +
          resp?.data?.publishPost.status,
      );
    }
  }

  private async publishPost(content: Content) {
    try {
      const params = await this.getPublishPostParams(content);
      const resp = await publishPostQuery(
        params,
        this.endpoint.cyberConnectApi,
      );

      if (resp?.data?.publishPost.status === 'SUCCESS') {
        return resp?.data?.publishPost;
      }

      if (resp?.data?.publishPost.status === 'INVALID_SIGNATURE') {
        await clearSigningKey();

        throw new ConnectError(
          ErrorCode.GraphqlError,
          resp?.data?.publishPost.status,
        );
      }

      if (resp?.data?.publishPost.status === 'MESSAGE_EXPIRED') {
        await this.retryPublishPost(
          content,
          resp?.data?.publishPost.tsInServer,
        );
        return;
      }

      if (resp?.data?.publishPost.status !== 'SUCCESS') {
        throw new ConnectError(
          ErrorCode.GraphqlError,
          resp?.data?.publishPost.status,
        );
      }
    } catch (e: any) {
      throw new ConnectError(ErrorCode.GraphqlError, e.message || e);
    }
  }
}

export default CyberConnect;
