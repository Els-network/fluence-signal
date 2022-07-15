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
/**
 * Stores sessions in memory by default;
 * @see https://signal.org/docs/ for more information
 */
export declare class InMemorySessionStore extends SignalClient.SessionStore {
    private state;
    saveSession(name: SignalClient.ProtocolAddress, record: SignalClient.SessionRecord): Promise<void>;
    getSession(name: SignalClient.ProtocolAddress): Promise<SignalClient.SessionRecord | null>;
    getExistingSessions(addresses: SignalClient.ProtocolAddress[]): Promise<SignalClient.SessionRecord[]>;
}
/**
 * Stores identities in memory by default;
 * @see https://signal.org/docs/ for more information
 */
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
/**
 * Stores Prekeys in memory by default;
 * @see https://signal.org/docs/ for more information
 */
export declare class InMemoryPreKeyStore extends SignalClient.PreKeyStore {
    private state;
    savePreKey(id: number, record: SignalClient.PreKeyRecord): Promise<void>;
    getPreKey(id: number): Promise<SignalClient.PreKeyRecord>;
    removePreKey(id: number): Promise<void>;
}
/**
 * Stores Signed Prekeys in memory by default;
 * @see https://signal.org/docs/ for more information
 */
declare class InMemorySignedPreKeyStore extends SignalClient.SignedPreKeyStore {
    private state;
    saveSignedPreKey(id: number, record: SignalClient.SignedPreKeyRecord): Promise<void>;
    getSignedPreKey(id: number): Promise<SignalClient.SignedPreKeyRecord>;
}
/**
* Stores sender keys in memory by default; Used for groups in signal;
* It is not used in this version;
* @TODO implement groups;
* @see https://signal.org/docs/ for more information
*/
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
    bundle: SignalClient.PreKeyBundle;
    address: SignalClient.ProtocolAddress;
    private static stores;
    static setStore(store: Stores): void;
    private constructor();
    /**
     * Initialize the signal logger.
     * @param maxLevel
     * @param callback
     */
    static initLogger(maxLevel: SignalClient.LogLevel, callback: (level: SignalClient.LogLevel, target: string, file: string | null, line: number | null, message: string) => void): void;
    /**
     * Create a new identity;
     * @param id device id;
     * @param stores stores defined like ahead
     * @returns Signal;
     */
    static create(id: number, stores?: Stores): Promise<Signal>;
    static login(stores?: Stores): Promise<Signal>;
    static sync_device(): Promise<void>;
    /**
     * Encrypt a message using libsignal
     * @param message Buffer - the message to encrypt;
     * @param address The address of the identity
     * @param preKeyBundle optional pre-key bundle to etablished a new session
     * @returns Buffer containing the encrypted message
     */
    encrypt(message: Buffer, address: SignalClient.ProtocolAddress, preKeyBundle: SignalClient.PreKeyBundle | null): Promise<Buffer>;
    /**
     * Decrypt a message using libsignal;
     * @param msg message received
     * @param address address of the sender
     * @returns
     */
    decrypt(msg: Buffer, address: SignalClient.ProtocolAddress): Promise<Buffer>;
    /**
     * Sign a message using the identity keys
     * @param message to sign
     * @returns Buffer signed
     */
    sign(message: Buffer): Promise<Buffer>;
    /**
     * Verify the signature using the identity keys
     * @param message plain text message
     * @param sig signature of the message
     * @returns
     */
    verify(message: Buffer, sig: Buffer): Promise<boolean>;
    /**
     * Verify a signature for a trust remote peer;
     * @param message plain text
     * @param signature signature
     * @param address address of the remote peer;
     * @returns boolean
     */
    verifyFor(message: Buffer, signature: Buffer, address: SignalClient.ProtocolAddress): Promise<boolean | undefined>;
    /**
     * Register a trust remote peer identity;
     * @param address of the remote peer;
     * @param key public key of the remote peer;
     * @returns void
     */
    register_user(address: SignalClient.ProtocolAddress, key: Buffer): Promise<boolean>;
}
export {};
