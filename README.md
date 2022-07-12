# Fluence Signal Service

Fluence is a peer-to-peer application platform which allows the creation of applications free of proprietary cloud providers or centralized APIs. Fluence provides a peer-to-peer development stack so that you can program p2p applications, workflows, and compose services, APIs without relying on centralized intermediaries. The Fluence stack is 100% open source and maintained and governed by a community of developers.
_https://doc.fluence.dev/marine-book/_

Documentiation: **https://doc.fluence.dev/docs/**

Main site: **https://fluence.network/**


## USAGE
**TS**
```ts
const peer = new FluencePeer();
const signal = new SignalService(peer, stores?); // stores is by default in memory. You could make your own implementation see the typescript stores interfaces;
registerSignal(peer, signal);
// And now the service is running on your peer !
```
**AQUA**
```
func sendMessage(peer: string, address: string, message: Message) -> bool:
    encrypted_message <- Signal.encrypt(peer, message)
    on peer:
        result <- Signal.decrypt(encrypted_message)
    <- result
```

## API
_Aqua service API:_
```
data Identity:
    id: Id
    username: string
    identityKey: []u8
    preKeyId: ?u8
    preKeyPublic: []u8 
    registrationId: u8 
    signedPreKeyId: u8 
    signedPreKeySignature: []u8 
    signedPreKeyPublic: []u8 

Signal.set_username(username: string) -- set the username of the user
Signal.get_username() -> string -- get the username of the user

Signal.create(username: string) -> Identity -- create a new identity

Signal.sign(data: Buffer) -> SignResult -- sign the data
Signal.verify(signature: Buffer, data: Buffer) -> bool -- verify the signature
Signal.verify_for(signature: Buffer, data: Buffer, id: Id) -> bool -- verify the signature for a remote trust peer
    
Signal.get_identity() -> Identity -- enable remote peer to get the public identity of the peer 
Signal.register_identity(identity: Identity) -> RegisterResult -- register a remote peer as a trust peer

Signal.encrypt(data: Buffer, to: Id, identity: ?Identity) -> EncryptionResult -- encrypt for a remote peer

Signal.decrypt(data: Buffer, from: Id) -> DecryptionResult -- decrypt data from a remote peer

-- Create a new  identity for a peer
func createIdentity() -> Identity:
    <- Signal.create(INIT_PEER_ID)

```

_Typescript stores interfaces:_
```ts
export declare abstract class SessionStore implements Native.SessionStore {
    abstract saveSession(name: ProtocolAddress, record: SessionRecord): Promise<void>;
    abstract getSession(name: ProtocolAddress): Promise<SessionRecord | null>;
    abstract getExistingSessions(addresses: ProtocolAddress[]): Promise<SessionRecord[]>;
}
export declare abstract class IdentityKeyStore implements Native.IdentityKeyStore {
    abstract getIdentityKey(): Promise<PrivateKey>;
    abstract getLocalRegistrationId(): Promise<number>;
    abstract saveIdentity(name: ProtocolAddress, key: PublicKey): Promise<boolean>;
    abstract isTrustedIdentity(name: ProtocolAddress, key: PublicKey, direction: Direction): Promise<boolean>;
    abstract getIdentity(name: ProtocolAddress): Promise<PublicKey | null>;
}
export declare abstract class PreKeyStore implements Native.PreKeyStore {
    abstract savePreKey(id: number, record: PreKeyRecord): Promise<void>;
    abstract getPreKey(id: number): Promise<PreKeyRecord>;
    abstract removePreKey(id: number): Promise<void>;
}
export declare abstract class SignedPreKeyStore implements Native.SignedPreKeyStore {
    abstract saveSignedPreKey(id: number, record: SignedPreKeyRecord): Promise<void>;
    abstract getSignedPreKey(id: number): Promise<SignedPreKeyRecord>;
}
export declare abstract class SenderKeyStore implements Native.SenderKeyStore {
    abstract saveSenderKey(sender: ProtocolAddress, distributionId: Uuid, record: SenderKeyRecord): Promise<void>;
    abstract getSenderKey(sender: ProtocolAddress, distributionId: Uuid): Promise<SenderKeyRecord | null>;
}

```
# Exemple
Basic encryption and decryption in aqua;
```
func send(from: Id, to: Identity, to_device: PeerId, message: Message):
    identity = to.identity
    msg <- Signal.encrypt(message, identity.id, ?[identity])
    on to_device:
        decrypt_msg <- Signal.decrypt(message, from)
```

More complexe scenario send with other services:
```
-- Messager service has to methode: send | receive
-- It is use to manage message sending and receiving over the network

-- Util.include_true() check for a given array if it include a true; In that case if a device receive the message, it return true; So if result don't include true, it's mean that no device received the message because of an error or the remote peer is offline;

-- Swarm is a service that run on a distant peer. It's in charge of keeping the messages receive by a peer during the time it was offline. Swarm.transfer is use to send a message to the swarm and then the swarm will send the message to the remote peer when it will back online.

data Account:
    identity: Identity
    swarms: []PeerId
    devices: []PeerId

func send(from: Id, to: Account, message: Message):
    identity = to.identity
    msg <- Signal.encrypt(message, identity.id, ?[identity])
    result: *bool
    for device <- to.devices:
            result <- Messager.send(device, from, identity.id, msg.content!)
    if Util.include_true(result) == false:
        swarm_array_length <- Util.array_lenght(to.swarms)
        if swarm_array_length < 2:
            on to.swarms[0]:
                Swarm.transfer(from, to.identity.id, msg.content!)
        otherwise:
            rand <- Random.get([ZERO], [swarm_array_length])
            on to.swarms[rand]:
                Swarm.transfer(from, to.identity.id, msg.content!)

```

A account based service over the signal service:
```
data Account:
    identity: Identity
    swarms: []PeerId
    devices: []PeerId

service Account("account"):
    get_account() -> Account -- get the account liked to the service
    create(username: string) -> Account -- create a new account and then liked it to the service
    
func account_create(username: string) -> Identity: -- private function use by the service
    <- Signal.create(username)

func account_decrypt(data: []u8, from: string) -> DecryptionResult: -- private function use by the service
    <- Signal.decrypt(data, from)

func registerIdentity(account: Account) -> bool:
    <- Signal.register_identity(account.identity)

func verify(data: Bytes, signature: Bytes, id: Id) -> bool:
    <- Signal.verify_for(signature, data, id)

func createAccount(username: string) -> Account: -- public function to call the service.create methode
    <- Account.create(username)

func getAccount(peer: ?string) -> Account: -- get the current account or an account on a remote peer
    result: *Account
    if peer != nil:
        on peer!:
            result <- Account.get_account()
    otherwise:
        result <- Account.get_account()
    <- result!0
```