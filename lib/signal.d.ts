/// <reference types="node" />
import * as SignalClient from '@signalapp/libsignal-client';
export declare type Stores = {
    address: SignalClient.ProtocolAddress;
    identitykeys: InMemoryIdentityKeyStore;
    sessions: InMemorySessionStore;
    preKeys: InMemoryPreKeyStore;
    preKeysSigned: InMemorySignedPreKeyStore;
    bundle: SignalClient.PreKeyBundle;
};
export declare class InMemorySessionStore extends SignalClient.SessionStore {
    private state;
    saveSession(name: SignalClient.ProtocolAddress, record: SignalClient.SessionRecord): Promise<void>;
    getSession(name: SignalClient.ProtocolAddress): Promise<SignalClient.SessionRecord | null>;
    getExistingSessions(addresses: SignalClient.ProtocolAddress[]): Promise<SignalClient.SessionRecord[]>;
}
declare class InMemoryIdentityKeyStore extends SignalClient.IdentityKeyStore {
    private idKeys;
    private localRegistrationId;
    private identityKey;
    constructor(localRegistrationId?: number);
    getIdentityKey(): Promise<SignalClient.PrivateKey>;
    getLocalRegistrationId(): Promise<number>;
    saveIdentity(name: SignalClient.ProtocolAddress, key: SignalClient.PublicKey): Promise<boolean>;
    isTrustedIdentity(name: SignalClient.ProtocolAddress, key: SignalClient.PublicKey, direction: SignalClient.Direction): Promise<boolean>;
    getIdentity(name: SignalClient.ProtocolAddress): Promise<SignalClient.PublicKey | null>;
}
export declare class InMemoryPreKeyStore extends SignalClient.PreKeyStore {
    private state;
    savePreKey(id: number, record: SignalClient.PreKeyRecord): Promise<void>;
    getPreKey(id: number): Promise<SignalClient.PreKeyRecord>;
    removePreKey(id: number): Promise<void>;
}
declare class InMemorySignedPreKeyStore extends SignalClient.SignedPreKeyStore {
    private state;
    saveSignedPreKey(id: number, record: SignalClient.SignedPreKeyRecord): Promise<void>;
    getSignedPreKey(id: number): Promise<SignalClient.SignedPreKeyRecord>;
}
export declare class InMemorySenderKeyStore extends SignalClient.SenderKeyStore {
    private state;
    saveSenderKey(sender: SignalClient.ProtocolAddress, distributionId: string, record: SignalClient.SenderKeyRecord): Promise<void>;
    getSenderKey(sender: SignalClient.ProtocolAddress, distributionId: string): Promise<SignalClient.SenderKeyRecord | null>;
}
export declare class Signal {
    identityKeys: InMemoryIdentityKeyStore;
    sessions: InMemorySessionStore;
    preKeys: InMemoryPreKeyStore;
    preKeysSigned: InMemorySignedPreKeyStore;
    keysBundle: undefined | SignalClient.PreKeyBundle;
    bundle: SignalClient.PreKeyBundle;
    address: SignalClient.ProtocolAddress;
    private static stores;
    static setStore(store: Stores): void;
    private constructor();
    initLogger(maxLevel: SignalClient.LogLevel, callback: (level: SignalClient.LogLevel, target: string, file: string | null, line: number | null, message: string) => void): void;
    static create(id: number, stores?: Stores): Promise<Signal>;
    static login(stores?: Stores): Promise<Signal>;
    static sync_device(): Promise<void>;
    encrypt(message: Buffer, address: SignalClient.ProtocolAddress, preKeyBundle?: SignalClient.PreKeyBundle): Promise<Buffer>;
    decrypt(msg: Buffer, address: SignalClient.ProtocolAddress): Promise<Buffer>;
    sign(message: Buffer): Promise<Buffer>;
    verify(message: Buffer, sig: Buffer): Promise<boolean>;
    verifyFor(message: Buffer, signature: Buffer, address: SignalClient.ProtocolAddress): Promise<boolean | undefined>;
    register_user(address: SignalClient.ProtocolAddress, key: Buffer): Promise<boolean>;
}
export {};
