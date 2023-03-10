import {
  Blockchain,
  RegisterSigningKeyInput,
  UpdateConnectionInput,
  BatchUpdateConnectionInput,
  BiConnectInput,
  AckNotificationsInput,
  AckAllNotificationsInput,
  FollowRequest,
  UnfollowRequest,
  PublishPostRequest,
  PublishCommentRequest,
  ReactRequest,
  FollowTypedMessageInput,
  LikeTypedMessageInput,
  PublishPostTypedMessageInput,
  PublishCommentTypedMessageInput,
} from './types';

export type Query = 'connect' | 'disconnect';

export const cancelLikeSchema = (input: ReactRequest) => {
  return {
    operationName: 'cancelLike',
    query: `mutation cancelLike($input: CancelLikeRequest!) {
	          cancelLike(input: $input) {
                   status
		   tsInServer
		  }
    		}`,
    variables: { input },
  };
};

export const dislikeSchema = (input: ReactRequest) => {
  return {
    operationName: 'dislike',
    query: `mutation dislike($input: DislikeRequest!) {
	          dislike(input: $input) {
                   status
		   tsInServer
		  }
    		}`,
    variables: { input },
  };
};

export const likeSchema = (input: ReactRequest) => {
  return {
    operationName: 'like',
    query: `mutation like($input: LikeRequest!) {
	          like(input: $input) {
                   status
		   tsInServer
		  }
    		}`,
    variables: { input },
  };
};

export const publishCommentSchema = (params: {
  input: PublishCommentRequest;
  targetContentId: string;
  contentId?: string;
}) => {
  return {
    operationName: 'publishComment',
    query: `mutation publishComment($contentID: String, $targetContentID: String!, $input: PublishRequest!) {
	          publishComment(contentID: $contentID, targetContentID: $targetContentID, input: $input) {
		      status
		      contentID
		      arweaveTxHash
		      tsInServer
		  }
    }`,
    variables: {
      contentID: params?.contentId,
      targetContentID: params?.targetContentId,
      input: params.input,
    },
  };
};

export const publishPostSchema = (params: {
  input: PublishPostRequest;
  contentId?: string;
}) => {
  return {
    operationName: 'publishPost',
    query: `mutation publishPost($contentId: String, $input: PublishRequest!) {
	          publishPost(contentID: $contentId, input: $input) {
		      status
		      contentID
		      arweaveTxHash
		      tsInServer
		  }
    }`,
    variables: { contentId: params.contentId, input: params.input },
  };
};

export const registerSigningKeySchema = (input: RegisterSigningKeyInput) => {
  return {
    operationName: 'registerSigningKey',
    query: `mutation registerSigningKey($input:RegisterSigningKeyRequest!) {
      registerSigningKey(input: $input) {
	      status
      }
    }`,
    variables: { input },
  };
};

export const unfollowSchema = (input: UnfollowRequest) => {
  return {
    operationName: 'unfollow',
    query: `mutation unfollow($input: UnFollowRequest!) {
	          unfollow(input: $input) {
			  status
			  tsInServer
		  }
    }`,
    variables: { input },
  };
};

export const followSchema = (input: FollowRequest) => {
  return {
    operationName: 'follow',
    query: `mutation follow($input: FollowRequest!) {
	          follow(input: $input) {
			  status
			  tsInServer
		  }
    }`,
    variables: { input },
  };
};

export const connectQuerySchema = (input: UpdateConnectionInput) => {
  return {
    operationName: 'connect',
    query: `mutation connect($input: UpdateConnectionInput!) {connect(input: $input) {result}}`,
    variables: {
      input,
    },
  };
};

export const batchConnectQuerySchema = (input: BatchUpdateConnectionInput) => {
  return {
    operationName: 'batchConnect',
    query: `mutation batchConnect($input: BatchUpdateConnectionInput!) {
      batchConnect(input: $input) {
        result
        alreadyFollowed
        successFollowed
        failToFollow
      }
    }`,
    variables: {
      input,
    },
  };
};

export const disconnectQuerySchema = (input: UpdateConnectionInput) => {
  return {
    operationName: 'disconnect',
    query: `mutation disconnect($input: UpdateConnectionInput!) {disconnect(input: $input) {result}}`,
    variables: {
      input,
    },
  };
};

export const setAliasQuerySchema = (input: UpdateConnectionInput) => {
  return {
    operationName: 'alias',
    query: `mutation alias($input: UpdateConnectionInput!) {alias(input: $input) {result}}`,
    variables: {
      input,
    },
  };
};

export const bidirectionalConnectQuerySchema = (input: BiConnectInput) => {
  return {
    operationName: 'bidirectionalConnect',
    query: `mutation bidirectionalConnect($input: BiConnectInput!) {
      bidirectionalConnect(input: $input) {
        result
        message
      }
    }`,
    variables: {
      input,
    },
  };
};

export const ackNotificationsQuerySchema = (input: AckNotificationsInput) => {
  return {
    operationName: 'ackNotifications',
    query: `mutation ackNotifications($input: AckNotificationsInput!) {
      ackNotifications(input: $input) {
        result
      }
    }`,
    variables: {
      input,
    },
  };
};

export const ackAllNotificationsQuerySchema = (
  input: AckAllNotificationsInput,
) => {
  return {
    operationName: 'ackAllNotifications',
    query: `mutation ackAllNotifications($input: AckAllNotificationsInput!) {
      ackAllNotifications(input: $input) {
        result
      }
    }`,
    variables: {
      input,
    },
  };
};

export const authSchema = ({
  address,
  signature,
  network = Blockchain.ETH,
}: {
  address: string;
  signature: string;
  network: Blockchain;
}) => {
  return {
    operationName: 'auth',
    query: `mutation auth($address: String!, $signature: String!, $network: String) {
      auth(address: $address, signature: $signature, network: $network) {
        result
        authToken
      }
    }`,
    variables: { address, signature, network },
  };
};

export const createFollowTypedMessageSchema = (
  input: FollowTypedMessageInput,
) => {
  return {
    operationName: 'createFollowTypedMessage',
    query: `query createFollowTypedMessage($input: CreateFollowTypedMessageInput!) {
	          createFollowTypedMessage(input: $input) {
			  message
		  }
    		}`,
    variables: { input },
  };
};

export const createLikeTypedMessageSchema = (input: LikeTypedMessageInput) => {
  return {
    operationName: 'createLikeTypedMessage',
    query: `query createLikeTypedMessage($input: CreateLikeTypedMessageInput!) {
	          createLikeTypedMessage(input: $input) {
			  message
		  }
    		}`,
    variables: { input },
  };
};
export const createPublishPostTypedMessageSchema = (
  input: PublishPostTypedMessageInput,
) => {
  return {
    operationName: 'createPublishPostTypedMessage',
    query: `query createPublishPostTypedMessage($input: CreatePublishPostTypedMessageInput!) {
	          createPublishPostTypedMessage(input: $input) {
			  message
		  }
    		}`,
    variables: { input },
  };
};
export const createPublishCommentTypedMessageSchema = (
  input: PublishCommentTypedMessageInput,
) => {
  return {
    operationName: 'createPublishCommentTypedMessage',
    query: `query createPublishCommentTypedMessage($input: CreatePublishCommentTypedMessageInput!) {
	          createPublishCommentTypedMessage(input: $input) {
			  message
		  }
    		}`,
    variables: { input },
  };
};

export const querySchemas = {
  cancelLike: cancelLikeSchema,
  dislike: dislikeSchema,
  like: likeSchema,
  publishPost: publishPostSchema,
  publishComment: publishCommentSchema,
  follow: followSchema,
  unfollow: unfollowSchema,
  connect: connectQuerySchema,
  batchConnect: batchConnectQuerySchema,
  disconnect: disconnectQuerySchema,
  biConnect: bidirectionalConnectQuerySchema,
  auth: authSchema,
  setAlias: setAliasQuerySchema,
  registerSigningKey: registerSigningKeySchema,
  ackNotifications: ackNotificationsQuerySchema,
  ackAllNotifications: ackAllNotificationsQuerySchema,
  createFollowTypedMessage: createFollowTypedMessageSchema,
  createLikeTypedMessage: createLikeTypedMessageSchema,
  createPublishPostTypedMessage: createPublishPostTypedMessageSchema,
  createPublishCommentTypedMessage: createPublishCommentTypedMessageSchema,
};

export const request = async (url = '', data = {}) => {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(data),
  });

  return response.json();
};

export const handleQuery = (
  data: {
    query: string;
    variables: object;
    operationName: string;
  },
  url: string,
) => {
  return request(url, data);
};

export const registerSigningKey = ({
  address,
  message,
  signature,
  appId,
  url,
}: RegisterSigningKeyInput & { url: string }) => {
  const result = querySchemas['registerSigningKey']({
    address,
    message,
    signature,
    appId,
  });
  return handleQuery(result, url);
};

export const auth = ({
  address,
  signature,
  network = Blockchain.ETH,
  url,
}: {
  address: string;
  signature: string;
  network: Blockchain;
  url: string;
}) => {
  const result = querySchemas['auth']({
    address,
    signature,
    network,
  });
  return handleQuery(result, url);
};

export const createFollowTypedMessage = (
  input: FollowTypedMessageInput,
  url: string,
) => {
  const schema = querySchemas['createFollowTypedMessage'](input);
  return handleQuery(schema, url);
};

export const createLikeTypedMessage = (
  input: LikeTypedMessageInput,
  url: string,
) => {
  const schema = querySchemas['createLikeTypedMessage'](input);
  return handleQuery(schema, url);
};

export const createPublishPostTypedMessage = (
  input: PublishPostTypedMessageInput,
  url: string,
) => {
  const schema = querySchemas['createPublishPostTypedMessage'](input);
  return handleQuery(schema, url);
};

export const createPublishCommentTypedMessage = (
  input: PublishCommentTypedMessageInput,
  url: string,
) => {
  const schema = querySchemas['createPublishCommentTypedMessage'](input);
  return handleQuery(schema, url);
};

export const cancelLike = (input: ReactRequest, url: string) => {
  const schema = querySchemas['cancelLike'](input);
  return handleQuery(schema, url);
};

export const dislike = (input: ReactRequest, url: string) => {
  const schema = querySchemas['dislike'](input);
  return handleQuery(schema, url);
};

export const like = (input: ReactRequest, url: string) => {
  const schema = querySchemas['like'](input);
  return handleQuery(schema, url);
};

export const publishComment = (
  params: {
    input: PublishCommentRequest;
    contentId?: string;
    targetContentId: string;
  },
  url: string,
) => {
  const schema = querySchemas['publishComment'](params);
  return handleQuery(schema, url);
};

export const publishPost = (
  params: { input: PublishPostRequest; contentId?: string },
  url: string,
) => {
  const schema = querySchemas['publishPost'](params);
  return handleQuery(schema, url);
};

export const unfollow = (input: UnfollowRequest, url: string) => {
  const schema = querySchemas['unfollow'](input);
  return handleQuery(schema, url);
};

export const follow = (input: FollowRequest, url: string) => {
  const schema = querySchemas['follow'](input);
  return handleQuery(schema, url);
};

export const batchFollow = (input: BatchUpdateConnectionInput, url: string) => {
  const schema = querySchemas['batchConnect'](input);
  return handleQuery(schema, url);
};

export const setAlias = (input: UpdateConnectionInput, url: string) => {
  const schema = querySchemas['setAlias'](input);
  return handleQuery(schema, url);
};

export const biConnect = (input: BiConnectInput, url: string) => {
  const schema = querySchemas['biConnect'](input);
  return handleQuery(schema, url);
};

export const ackNotifications = (input: AckNotificationsInput, url: string) => {
  const schema = querySchemas['ackNotifications'](input);
  return handleQuery(schema, url);
};

export const ackAllNotifications = (
  input: AckAllNotificationsInput,
  url: string,
) => {
  const schema = querySchemas['ackAllNotifications'](input);
  return handleQuery(schema, url);
};
