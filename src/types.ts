export interface Connection {
  connectionType: string;
  target: string;
  namespace: string;
  createdAt: string;
  alias: string;
}

export type Connections = Connection[];

export enum Blockchain {
  ETH = 'ETH',
}

export interface CyberConnectStore {
  outboundLink: Connections;
}

export interface ConfigBase {
  namespace: string;
  env?: keyof typeof Env;
  provider: any;
  signingMessageEntity?: string;
}

export interface ConfigEth {
  chain?: Blockchain.ETH;
  chainRef?: never;
}

export type Config = ConfigBase & ConfigEth;

export enum Env {
  STAGING = 'STAGING',
  PRODUCTION = 'PRODUCTION',
}

export interface Endpoint {
  cyberConnectSchema?: string;
  cyberConnectApi: string;
}

export type OperationName =
  | 'follow'
  | 'like'
  | 'report'
  | 'watch'
  | 'vote'
  | 'unfollow'
  | BiConnectionType
  | 'ack_notifications'
  | 'ack_all_notifications';

export enum ConnectionType {
  FOLLOW = 'FOLLOW',
  LIKE = 'LIKE',
  REPORT = 'REPORT',
  WATCH = 'WATCH',
  VOTE = 'VOTE',
}

export interface Operation {
  name: OperationName;
  from: string;
  to: string;
  namespace: string;
  network: Blockchain;
  alias?: string;
  timestamp: number;
  connectionType?: ConnectionType;
}

export interface NotificationOperation {
  name: OperationName;
  from: string;
  namespace: string;
  network: Blockchain;
  timestamp: number;
  notificationIds?: string[];
}

export enum BiConnectionType {
  INIT = 'INIT',
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT',
  TERMINATE = 'TERMINATE',
  BLOCK = 'BLOCK',
  UNBLOCK = 'UNBLOCK',
}

// Mutation input types

export interface RegisterSigningKeyInput {
  address: string;
  message: string;
  signature: string;
}

export interface UpdateConnectionInput {
  fromAddr: string;
  toAddr: string;
  namespace: string;
  signature: string;
  operation: string;
  signingKey: string;
  alias?: string;
  network: string;
  type?: ConnectionType;
}

export interface BatchUpdateConnectionInput {
  fromAddr: string;
  signingInputs: {
    toAddr: string;
    signature: string;
    operation: string;
  }[];
  namespace: string;
  signingKey: string;
  network: Blockchain;
  type?: ConnectionType;
}

export interface BiConnectInput {
  fromAddr: string;
  toAddr: string;
  namespace: string;
  signature: string;
  operation: string;
  signingKey: string;
  network: string;
  type?: ConnectionType;
  instruction: BiConnectionType;
}

export interface AckNotificationsInput {
  address: string;
  namespace: string;
  signature: string;
  operation: string;
  signingKey: string;
  network: string;
  notificationIds: string[];
}

export interface AckAllNotificationsInput {
  address: string;
  namespace: string;
  signature: string;
  operation: string;
  signingKey: string;
  network: string;
  timestamp: string;
}

export interface UnfollowRequest {
  address: string;
  handle: string;
  message: string;
  signingKey: string;
  signature: string;
}
export interface FollowRequest {
  address: string;
  handle: string;
  message: string;
  signingKey: string;
  signature: string;
}

export interface PublishPostRequest {
  authorAddress: string;
  message: string;
  signature: string;
  signingKey: string;
  authorHandle: string;
}

export interface PublishCommentRequest {
  authorHandle: string;
  authorAddress: string;
  message: string;
  signature: string;
  signingKey: string;
}

export interface ReactRequest {
  address: string;
  message: string;
  signingKey: string;
  signature: string;
  contentID: string;
}

export type ReactType = 'like' | 'dislike' | 'cancel';

export type FollowOperation = 'follow' | 'unfollow';
export type LikeOperation = 'like' | 'dislike' | 'cancel';
export type PostOperation = 'post' | 'unpost';
export type CommentOperation = 'comment';

interface BaseMessage {
  op: FollowOperation | LikeOperation | PostOperation | CommentOperation;
  address: string;
  ts: number;
  handle: string;
}

export interface FollowMessage extends BaseMessage {
  op: FollowOperation;
}

export interface LikeMessage extends Omit<BaseMessage, 'handle'> {
  op: LikeOperation;
  target: string;
}

export interface PostMessage extends BaseMessage {
  op: PostOperation;
  title: string;
  body: string;
  chainId: number;
}

export interface CommentMessage extends BaseMessage {
  target: string;
  title: string;
  body: string;
  chainId: number;
}

export interface Content {
  title: string;
  body: string;
  author: string;
  id?: string;
}
