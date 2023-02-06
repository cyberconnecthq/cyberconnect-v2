# CyberConnect V2

## Getting started

### Installation

```sh
npm install cyberconnect-v2
or
yarn add cyberconnect-v2
```

### Basic usage

#### Init CyberConnect

```ts
import CyberConnect, {
  Env
} from 'cyberconnect-v2';

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

#### Follow

```ts
cyberConnect.follow(address, handle);
```

- `address` - The target wallet address to follow.
- `handle` - The handle of the target wallet address.

#### Unfollow

```ts
cyberConnect.unfollow(address, handle);
```

- `address` - The target wallet address to follow.
- `handle` - The handle of the target wallet address.

## Contributing

We are happy to accept small and large contributions, feel free to make a suggestion or submit a pull request.
