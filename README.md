# CyberConnect V2

## Getting started

### Installation

```sh
npm install @cyberlab/cyberconnect-v2
or
yarn add @cyberlab/cyberconnect-v2
```

### Basic usage

#### Init CyberConnect

```ts
import CyberConnect, {
  Env
} from '@cyberlab/cyberconnect-v2';

const cyberConnect = new CyberConnect({
  appId: 'cyberconnect',
  namespace: 'CyberConnect',
  env: Env.PRODUCTION,
  provider: provider,
  signingMessageEntity: 'CyberConnect' || your entity,
});
```

- `appId` - Your application id, can be any string less than 128 characters.
- `namespace` - Your applciation name.
- `env` - (optional) Env decides the endpoints. Now we have `STAGING` and `PRODUCTION`. (The default value is `Env.PRODUCTION`).
- `provider` - The corresponding provider of the given chain.
- `signingMessageEntity` - (optional) Use to describe the entity users sign their message with. Users will see it when authorizing in the wallet `I authorize ${signingMessageEntity} from this device using signing key:`. The default entity is `CyberConnect`.

#### Follow

```ts
cyberConnect.follow(handle);
```

- `handle` - The ccProfile handle to follow.

#### Unfollow

```ts
cyberConnect.unfollow(handle);
```

- `handle` - The ccProfile handle to unfollow.

### Like content

```ts
cyberConnect.like(id);
```

**Parameters**

- `id: string` - The content id to like which can the id of a post, comment or an essence.

**Return**

- `response: LikeResponse` - like response

```ts
type LikeResponse = {
  status: Status;
};

enum Status {
  SUCCESS,
  INVALID_PARAMS,
  RATE_LIMITED,
  TARGET_NOT_FOUND,
  ALREADY_DONE,
  INVALID_MESSAGE,
  INVALID_SIGNATURE,
  MESSAGE_EXPIRED,
}
```

### Dislike content

```ts
cyberConnect.dislike(id);
```

**Parameters**

- `id: string` - The content id to dislike which can the id of a post, comment or an essence.

**Return**

- `response: DislikeResponse` - dislike response

```ts
type DislikeResponse = {
  tsInServer: number;
  status: Status;
};

enum Status {
  SUCCESS,
  INVALID_PARAMS,
  RATE_LIMITED,
  TARGET_NOT_FOUND,
  ALREADY_DONE,
  INVALID_MESSAGE,
  INVALID_SIGNATURE,
  MESSAGE_EXPIRED,
}
```

### Cancel reaction

```ts
cyberConnect.cancelReaction(id);
```

**Parameters**

- `id: string` - The content id to cancel reaction on which can the id of a post, comment or an essence.

**Return**

- `response: CancelReactionResponse` - cancel reaction response

```ts
type CancelReactionResponse = {
  status: Status;
};

enum Status {
  SUCCESS,
  INVALID_PARAMS,
  RATE_LIMITED,
  TARGET_NOT_FOUND,
  ALREADY_DONE,
  INVALID_MESSAGE,
  INVALID_SIGNATURE,
  MESSAGE_EXPIRED,
}
```

### Creating post

```ts
cyberConnect.createPost(content);
```

**Parameters**

- `content: Content` - post content

```ts
interface Content {
  title: string;
  body: string;
  author: string; // The ccProfile handle of the author
}
```

**Return**

- `response: PublishResponse` - publish response

```ts
type PublishResponse = {
  status: Status;
  contentID: string;
  arweaveTxHash: string;
  tsInServer: number;
};

enum Status {
  SUCCESS,
  INVALID_PARAMS,
  RATE_LIMITED,
  HANDLE_NOT_FOUND,
  CONTENT_NOT_FOUND,
  TARGET_NOT_FOUND,
  NOT_PROFILE_OWNER,
  ALREADY_EXISTED,
  INVALID_MESSAGE,
  INVALID_SIGNATURE,
  MESSAGE_EXPIRED,
  INVALID_SIGNING_KEY,
}
```

### Updating post

```ts
cyberConnect.updatePost(id, content);
```

**Parameters**

- `id: string` - published post id
- `content: Content` - new post content

```ts
interface Content {
  title: string;
  body: string;
  author: string; // The ccProfile handle of the author
}
```

**Return**

- `response: PublishResponse` - publish response

```ts
type PublishResponse = {
  status: Status;
  contentID: string;
  arweaveTxHash: string;
  tsInServer: number;
};

enum Status {
  SUCCESS,
  INVALID_PARAMS,
  RATE_LIMITED,
  HANDLE_NOT_FOUND,
  CONTENT_NOT_FOUND,
  TARGET_NOT_FOUND,
  NOT_PROFILE_OWNER,
  ALREADY_EXISTED,
  INVALID_MESSAGE,
  INVALID_SIGNATURE,
  MESSAGE_EXPIRED,
  INVALID_SIGNING_KEY,
}
```

### Creating comment

```ts
cyberConnect.createComment(targetContentId, content);
```

**Parameters**

- `targetContentId: string` - target content id to comment on, which can be a post, an essence or a comment

- `content: Content` - comment content

```ts
interface Content {
  title: string;
  body: string;
  author: string; // The ccProfile handle of the author
}
```

**Return**

- `response: PublishResponse` - publish response

```ts
type PublishResponse = {
  status: Status;
  contentID: string;
  arweaveTxHash: string;
  tsInServer: number;
};

enum Status {
  SUCCESS,
  INVALID_PARAMS,
  RATE_LIMITED,
  HANDLE_NOT_FOUND,
  CONTENT_NOT_FOUND,
  TARGET_NOT_FOUND,
  NOT_PROFILE_OWNER,
  ALREADY_EXISTED,
  INVALID_MESSAGE,
  INVALID_SIGNATURE,
  MESSAGE_EXPIRED,
  INVALID_SIGNING_KEY,
}
```

### Updating comment

```ts
cyberConnect.updateComment(commentId,, targetContentId, content);
```

**Parameters**

- `commentId: string` - comment id to update
- `targetContentId: string` - target content id to comment on, which can be a post, an essence or a comment
- `content: Content` - new comment content

```ts
interface Content {
  title: string;
  body: string;
  author: string; // The ccProfile handle of the author
}
```

**Return**

- `response: PublishResponse` - publish response

```ts
type PublishResponse = {
  status: Status;
  contentID: string;
  arweaveTxHash: string;
  tsInServer: number;
};

enum Status {
  SUCCESS,
  INVALID_PARAMS,
  RATE_LIMITED,
  HANDLE_NOT_FOUND,
  CONTENT_NOT_FOUND,
  TARGET_NOT_FOUND,
  NOT_PROFILE_OWNER,
  ALREADY_EXISTED,
  INVALID_MESSAGE,
  INVALID_SIGNATURE,
  MESSAGE_EXPIRED,
  INVALID_SIGNING_KEY,
}
```

### Verify the proof

After creating or updating a post successfully, you can use `arweaveTxHash` to verify the proof, go to https://arweave.net/ + `arweaveTxHash`.

## Contributing

We are happy to accept small and large contributions, feel free to make a suggestion or submit a pull request.
