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
  namespace: 'CyberConnect',
  env: Env.Production,
  provider: provider,
  signingMessageEntity: 'CyberConnect' || your entity,
});
```

- `namespace` - Your applciation name.
- `env` - (optional) Env decides the endpoints. Now we have `staging` and `production`. (The default value is `Env.Production`).
- `provider` - The corresponding provider of the given chain.
- `signingMessageEntity` - (optional) Use to describe the entity users sign their message with. Users will see it when authorizing in the wallet `I authorize ${signingMessageEntity} from this device using signing key:`. The default entity is `CyberConnect`.

### Follow

```ts
cyberConnect.follow(address, handle);
```

- `address` - Current signed in wallet address.
- `handle` - The target handle.

### Unfollow

```ts
cyberConnect.unfollow(address, handle);
```

- `address` - Current signed in wallet address.
- `handle` - The target handle.

### Create post

```ts
cyberConnect.createPost(post);
```

**Parameters**

- `post: Post` - post content

```ts
type Post = {
  title: string;
  body: string;
};
```

**Return**

- `response: PublishResponse` - publish response

```ts
type PublishResponse = {
  status: Status;
  id: string;
  arweaveTxHash: string;
};

enum Status {
  SUCCESS,
  INVALID_ADDRESS,
  INVALID_ID,
  RATE_LIMITED,
  NOT_FOUND,
  ALREADY_EXISTED,
  INVALID_MESSAGE,
  INVALID_SIGNATURE,
  MESSAGE_EXPIRED,
  INVALID_SIGNING_KEY,
}
```

### Update post

```ts
cyberConnect.updatePost(post, id);
```

**Parameters**

- `post: Post` - post content

```ts
type Post = {
  title: string;
  body: string;
};
```

- `id: string` - target post id

**Return**

- `response: PublishResponse` - publish response

```ts
type PublishResponse = {
  status: Status;
  id: string;
  arweaveTxHash: string;
};

enum Status {
  SUCCESS,
  INVALID_ADDRESS,
  INVALID_ID,
  RATE_LIMITED,
  NOT_FOUND,
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
