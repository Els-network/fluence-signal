import * as SignalClient from '@signalapp/libsignal-client';

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

export class InMemorySignedPreKeyStore extends SignalClient.SignedPreKeyStore {
    private state = new Map();
    async saveSignedPreKey(id: number, record: SignalClient.SignedPreKeyRecord): Promise<void> {
        Promise.resolve(this.state.set(id, record.serialize()));
    }
    getSignedPreKey(id: number): Promise<SignalClient.SignedPreKeyRecord> {
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
    private keys = new InMemoryIdentityKeyStore();
    private sessions = new InMemorySessionStore();
    private preK = new InMemoryPreKeyStore();

    public address = SignalClient.ProtocolAddress.new("+564542", 1);
    private identityKey: any;

    private public_pre_key: any;
    private private_pre_key: any;

    public preKeySigned: any;
    public preKeyBundle: any;

    public registrationId: any;

    static async new() {
        
    }

    async build() {
        this.identityKey = Promise.all([this.keys.getIdentityKey()]);
        this.public_pre_key = SignalClient.PrivateKey.generate();
        this.private_pre_key = SignalClient.PrivateKey.generate();

        this.preKeySigned = this.identityKey.sign(
            this.private_pre_key.getPublicKey().serialize()
        );

        this.registrationId = this.keys.getLocalRegistrationId();
        const preKeyId = 31223;
        const preKeySignedId = 22;
        
        this.preKeyBundle = SignalClient.PreKeyBundle.new(
            this.registrationId,
            this.address.deviceId(),
            preKeyId,
            this.public_pre_key.getPublicKey(),
            this.preKeySigned,
            this.private_pre_key.getPublicKey(),
            this.preKeySigned,
            this.identityKey.getPublicKey(),
        )

        const prekeyrecord = SignalClient.PreKeyRecord.new(
            preKeyId,
            this.public_pre_key.getPublicKey(),
            this.public_pre_key
        )

        this.preK.savePreKey(preKeySignedId, prekeyrecord);

        return this;
    }
    static create() {

    }

    async send(message: string, address: SignalClient.ProtocolAddress, preKeyBundle?:  SignalClient.PreKeyBundle) {
        const session = this.sessions.getSession(address);

        if(!session) {
            await SignalClient.processPreKeyBundle(preKeyBundle!, address, this.sessions, this.keys);
            const cipherText = await SignalClient.signalEncrypt(
                Buffer.from(message),
                address,
                this.sessions, 
                this.keys
            )
            const cipherTextR = SignalClient.PreKeySignalMessage.deserialize(cipherText.serialize());
            return cipherTextR;
        }
    }

    async receive(message: SignalClient.PreKeySignalMessage, address: SignalClient.ProtocolAddress) {
        const session = this.sessions.getSession(address);
        if(!session) {
            const plainText = await SignalClient.signalDecryptPreKey(
                message, address, this.sessions, this.keys, this.preK, this.private_pre_key
            );
            console.log("Message received: ", plainText);
        }
    }
}