import * as SignalClient from '@signalapp/libsignal-client';
import { hash } from './util';

export type Stores = {address: SignalClient.ProtocolAddress, identitykeys: InMemoryIdentityKeyStore, sessions: InMemorySessionStore, preKeys: InMemoryPreKeyStore, preKeysSigned: InMemorySignedPreKeyStore, bundle: SignalClient.PreKeyBundle};

export class InMemorySessionStore extends SignalClient.SessionStore {
    private state = new Map<string, Buffer>();
    async saveSession(name: SignalClient.ProtocolAddress, record: SignalClient.SessionRecord): Promise<void> {
        const idx = name.name() + "::" + name.deviceId();
        Promise.resolve(this.state.set(idx, record.serialize()));
    }
    getSession(name: SignalClient.ProtocolAddress): Promise<SignalClient.SessionRecord | null> {
        const idx = name.name() + '::' + name.deviceId();
        const serialized = this.state.get(idx);
        if (serialized) {
          return Promise.resolve(
            SignalClient.SessionRecord.deserialize(serialized)
          );
        } else {
          return Promise.resolve(null);
        }
    }
    async getExistingSessions(addresses: SignalClient.ProtocolAddress[]): Promise<SignalClient.SessionRecord[]> {
        return addresses.map(address => {
            const idx = address.name() + '::' + address.deviceId();
            const serialized = this.state.get(idx);
            if (!serialized) {
              throw 'no session for ' + idx;
            }
            return SignalClient.SessionRecord.deserialize(serialized);
          });
    }
}

class InMemoryIdentityKeyStore extends SignalClient.IdentityKeyStore {
    private idKeys = new Map();
    private localRegistrationId: number;
    private identityKey: SignalClient.PrivateKey;
  
    constructor(localRegistrationId?: number) {
      super();
      this.identityKey = SignalClient.PrivateKey.generate();
      this.localRegistrationId = localRegistrationId ?? 5;
    }
  
    async getIdentityKey(): Promise<SignalClient.PrivateKey> {
        return Promise.resolve(this.identityKey);
    }
    async getLocalRegistrationId(): Promise<number> {
        return Promise.resolve(this.localRegistrationId);
    }
    saveIdentity(name: SignalClient.ProtocolAddress, key: SignalClient.PublicKey): Promise<boolean> {
        const idx = name.name() + "::" + name.deviceId();
        const seen = this.idKeys.has(idx);
        if(seen) {
            const currentKey = this.idKeys.get(idx);
            const changed = currentKey.compare(key) != 0;
            this.idKeys.set(idx, key);
            return Promise.resolve(changed);
        }

        this.idKeys.set(idx, key);
        return Promise.resolve(false);
    }

    isTrustedIdentity(name: SignalClient.ProtocolAddress, key: SignalClient.PublicKey, direction: SignalClient.Direction): Promise<boolean> {
        const idx = name.name() + "::" + name.deviceId();
        if(this.idKeys.has(idx)) {
            const currentKey = this.idKeys.get(idx);
            return Promise.resolve(currentKey.compare(key) == 0);
        } else {
            return Promise.resolve(true);
        }
    }
    getIdentity(name: SignalClient.ProtocolAddress): Promise<SignalClient.PublicKey | null> {
        const idx = name.name() + "::" + name.deviceId();
        if(this.idKeys.has(idx)) {
            return Promise.resolve(this.idKeys.get(idx));
        } else {
            return Promise.resolve(null);
        }
    }
}

export class InMemoryPreKeyStore extends SignalClient.PreKeyStore {
    private state = new Map();
    async savePreKey(id: number, record: SignalClient.PreKeyRecord): Promise<void> {
        Promise.resolve(this.state.set(id, record.serialize()));
    }
    getPreKey(id: number): Promise<SignalClient.PreKeyRecord> {
        return Promise.resolve(SignalClient.PreKeyRecord.deserialize(this.state.get(id)));
    }
    removePreKey(id: number): Promise<void> {
        this.state.delete(id);
        return Promise.resolve();
    }
}

class InMemorySignedPreKeyStore extends SignalClient.SignedPreKeyStore {
    private state = new Map();
    async saveSignedPreKey(
      id: number,
      record: SignalClient.SignedPreKeyRecord
    ): Promise<void> {
      Promise.resolve(this.state.set(id, record.serialize()));
    }
    async getSignedPreKey(id: number): Promise<SignalClient.SignedPreKeyRecord> {
      return Promise.resolve(
        SignalClient.SignedPreKeyRecord.deserialize(this.state.get(id))
      );
    }
  }
  

export class InMemorySenderKeyStore extends SignalClient.SenderKeyStore {
    private state = new Map();
    async saveSenderKey(sender: SignalClient.ProtocolAddress, distributionId: string, record: SignalClient.SenderKeyRecord): Promise<void> {
        const idx = distributionId + "::" + sender.name() + "::" + sender.deviceId();
        Promise.resolve(this.state.set(idx, record));
    }
    getSenderKey(sender: SignalClient.ProtocolAddress, distributionId: string): Promise<SignalClient.SenderKeyRecord | null> {
        const idx = distributionId + "::" + sender.name() + "::" + sender.deviceId();
        if(this.state.has(idx)) {
            return Promise.resolve(this.state.get(idx));
        } else {
            return Promise.resolve(null);
        }
    }
}


export class Signal {
    public identityKeys;
    public sessions;
    public preKeys;
    public preKeysSigned;

    public keysBundle: undefined | SignalClient.PreKeyBundle;

    public bundle: SignalClient.PreKeyBundle
    public address: SignalClient.ProtocolAddress;
    
    private static stores: Stores;
    static setStore(store: Stores): void {
        Signal.stores = store;
    }

    private constructor(stores?: Stores) {
        this.identityKeys = stores ? stores.identitykeys : Signal.stores.identitykeys;
        this.sessions = stores ? stores.sessions : Signal.stores.sessions;
        this.preKeys = stores ? stores.preKeys : Signal.stores.preKeys;
        this.preKeysSigned = stores ? stores.preKeysSigned : Signal.stores.preKeysSigned;
        this.bundle = stores ? stores.bundle : Signal.stores.bundle;
        this.address = stores ? stores.address : Signal.stores.address;
    }

    public static initLogger(maxLevel: SignalClient.LogLevel, callback: (level: SignalClient.LogLevel, target: string, file: string | null, line: number | null, message: string) => void): void {
        SignalClient.initLogger(
            maxLevel,
            callback
        );
    }

    static async create(id: number, stores?: Stores) {
        const identitykeys = Signal.stores ? Signal.stores.identitykeys : new InMemoryIdentityKeyStore();
        const sessions = Signal.stores ? Signal.stores.sessions : new InMemorySessionStore();
        const preKeys = Signal.stores ? Signal.stores.preKeys : new InMemoryPreKeyStore();
        const preKeysSigned = Signal.stores ? Signal.stores.preKeysSigned : new InMemorySignedPreKeyStore();
        
        const PreKey = SignalClient.PrivateKey.generate();
        const SPreKey = SignalClient.PrivateKey.generate();
        
        const indentityKey = await identitykeys.getIdentityKey();
        const address = SignalClient.ProtocolAddress.new(hash(indentityKey.serialize().toString()), id);
        const preKeySigned = indentityKey.sign(
            SPreKey.getPublicKey().serialize()
        );
        
        const registrationId = await identitykeys.getLocalRegistrationId();
        const PreKeyId = 31337;
	    const SignedPreKeyId = 22;

        const keysBundle =  SignalClient.PreKeyBundle.new(
            registrationId,
            address.deviceId(),
            PreKeyId,
            PreKey.getPublicKey(),
            SignedPreKeyId,
            SPreKey.getPublicKey(),
            preKeySigned,
            indentityKey.getPublicKey()
        );
        
        const record = SignalClient.PreKeyRecord.new(
            PreKeyId,
            indentityKey.getPublicKey(),
            PreKey
        );
        
        preKeys.savePreKey(PreKeyId, record);

        const PreKeySignedRecord = SignalClient.SignedPreKeyRecord.new(
            SignedPreKeyId,
            42,
            SPreKey.getPublicKey(),
            SPreKey,
            preKeySigned
        );

        preKeysSigned.saveSignedPreKey(SignedPreKeyId, PreKeySignedRecord);

        return new Signal(stores ? stores : {address, identitykeys, sessions, preKeys, preKeysSigned, bundle: keysBundle});
    }

    static async login(stores?: Stores) {
        return new Signal(stores);
    };

    static async sync_device() {}; //TODO

    async encrypt(message: Buffer, address: SignalClient.ProtocolAddress, preKeyBundle?:  SignalClient.PreKeyBundle) {
        const session = await this.sessions.getSession(address);
        if(!session) {
            await SignalClient.processPreKeyBundle(preKeyBundle!, address, this.sessions, this.identityKeys);
            const cipherText = await SignalClient.signalEncrypt(
                message,
                address,
                this.sessions, 
                this.identityKeys
            );
            const cipherTextR = SignalClient.PreKeySignalMessage.deserialize(cipherText.serialize());
            return cipherTextR.serialize();
        } else {
            const cipherText = await SignalClient.signalEncrypt(
                message,
                address,
                this.sessions, 
                this.identityKeys
            );
            const cipherTextR = SignalClient.SignalMessage.deserialize(cipherText.serialize());
            return cipherTextR.serialize();
        }
    }

    async decrypt(msg: Buffer, address: SignalClient.ProtocolAddress) {
        const session = await this.sessions.getSession(address);
        if(!session) {
            const message = SignalClient.PreKeySignalMessage.deserialize(msg);
            const plainText = await SignalClient.signalDecryptPreKey(
                message as SignalClient.PreKeySignalMessage, address, this.sessions, this.identityKeys, this.preKeys, this.preKeysSigned
            );
            return plainText;
        } else {
            const message = SignalClient.SignalMessage.deserialize(msg);
            const plainText = await SignalClient.signalDecrypt(
                message as SignalClient.SignalMessage, address, this.sessions, this.identityKeys
            );
            return plainText;
        }
    }

    async sign(message: Buffer) {
        const id = await this.identityKeys.getIdentityKey();
        return id.sign(message); 
    }

    async verify(message: Buffer, sig: Buffer) {
        return (await this.identityKeys.getIdentityKey()).getPublicKey().verify(message, sig);
    }

    async verifyFor(message: Buffer, signature: Buffer, address: SignalClient.ProtocolAddress) {
        return (await this.identityKeys.getIdentity(address))?.verify(message, signature);
    }

    async register_user(address: SignalClient.ProtocolAddress, key: Buffer) {
        return await this.identityKeys.saveIdentity(address, SignalClient.PublicKey.deserialize(key));
    }
}