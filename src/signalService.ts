import { CallParams, FluencePeer } from '@fluencelabs/fluence';
import { SignalDef } from './_aqua/signal';
import { Signal, Stores } from './signal';
import { PreKeyBundle, PublicKey } from '@signalapp/libsignal-client';
import on from "await-handler";

import { hash, PeerIdToNumber, ProtocolAddressToString, StringToProtocolAddress } from './util';

function onlyOwner(peer: FluencePeer, callParams: CallParams<null>) {
    return callParams.initPeerId === peer.getStatus().peerId;
}

/**
 * Service that enable Signal Client for encryption and decryption; 
 */
export class SignalService implements SignalDef {

    public user: Signal | undefined; // current user login;
    public username: string | undefined; // current username
    public id: string | undefined;  // current id (called address with signal);
    
    public peer: FluencePeer;

    async get_username(callParams: CallParams<null>): Promise<string> {
        return this.username!
    };
    
    set_username(username: string, callParams: CallParams<'username'>): void | Promise<void> {
        if(onlyOwner(this.peer, callParams))
            this.username = username;
    };
    
    get_identity(callParams: CallParams<null>) {
        return {
            id: ProtocolAddressToString(this.user!.address), // turn signal address to string
            username: this.username!,
            registrationId: this.user!.bundle.registrationId(),
            identityKey: Array.from(this.user!.bundle.identityKey().serialize()),
            preKeyId: this.user!.bundle.preKeyId(),
            signedPreKeyId: this.user!.bundle.signedPreKeyId(),
            preKeyPublic: Array.from(this.user!.bundle.preKeyPublic()!.serialize()),
            signedPreKeyPublic: Array.from(this.user!.bundle.signedPreKeyPublic().serialize()),
            signedPreKeySignature: Array.from(this.user!.bundle.signedPreKeySignature()),
        } 
    };

    async register_identity(identity: { id: string; identityKey: number[]; preKeyId: number | null; preKeyPublic: number[]; registrationId: number; signedPreKeyId: number; signedPreKeyPublic: number[]; signedPreKeySignature: number[]; username: string; }, callParams: CallParams<"identity">): Promise<{success: boolean, error: string | null}> {
        const [err, res] = await on(this.user!.register_user(StringToProtocolAddress(identity.id), Buffer.from(identity.identityKey)));
        return {success: res!, error: err ? err?.toString() : null};
    }
    
    constructor(peer: FluencePeer, stores?: Stores) {
        this.peer = peer;
        if(stores) Signal.setStore(stores);
    }

    async create(username: string, callParams: CallParams<'username'>) {
        if(!onlyOwner(this.peer, callParams)) throw new Error("Not owner");
        this.username = username;
        const identity = await Signal.create(PeerIdToNumber(this.peer.getStatus().peerId!));
        this.user = identity;
        this.id = ProtocolAddressToString(this.user.address); // turn signal address to string
        return {
            id: ProtocolAddressToString(this.user.address), // turn signal address to string
            username: this.username,
            identityKey: Array.from(this.user.bundle.identityKey().serialize()), // create a Uint8Array from identity key
            registrationId: this.user.bundle.registrationId(),
            preKeyId: this.user.bundle.preKeyId(),
            signedPreKeyId: this.user.bundle.signedPreKeyId(),
            preKeyPublic: Array.from(this.user.bundle.preKeyPublic()!.serialize()), // create a Uint8Array from the prekeys
            signedPreKeyPublic: Array.from(this.user.bundle.signedPreKeyPublic().serialize()), // create a Uint8Array from the prekeys signed
            signedPreKeySignature: Array.from(this.user.bundle.signedPreKeySignature()),
        } 
    }

    /**
     * See Signal Sign methode in the signal.ts file;
     * @param data to sign
     * @param callParams fluence callParameters;
     */
    async sign(data: number[], callParams: CallParams<'data'>): Promise<{ error: string | null; signature: number[] | null; success: boolean; }> {
        if(!onlyOwner(this.peer, callParams)) throw new Error("Not Owner");
        const [err, result] = await on(this.user!.sign(Buffer.from(data)));
        return {
            error: err ? err.toLocaleString() : err,
            signature: result ? Array.from(result) : [],
            success: result ? true: false
        }

    };

    /**
     * See Signal Verify methode in the signal.ts file;
     */
    async verify(signature: number[], data: number[], callParams: CallParams<'data' | 'signature'>): Promise<boolean> {
        return await this.user!.verify(Buffer.from(signature), Buffer.from(data));
    };

    /**
     * See Signal Verify For methode in the signal.ts file;
     */
    async verify_for(signature: number[], data: number[], address: string) {
        const is_verify = await this.user!.verifyFor(Buffer.from(data), Buffer.from(signature), StringToProtocolAddress(address));
        return is_verify ? is_verify : false;
    }

    /**
     * See Signal decrypt methode in the signal.ts file;
     */
    async decrypt(data: number[], from: string, callParams: CallParams<'data' | 'from'>):  Promise<{ content: number[] | null; error: string | null; success: boolean; }> {
        if(!onlyOwner(this.peer, callParams)) throw new Error("Not Owner");
        const [err, result] = await on(this.user!.decrypt(Buffer.from(data), StringToProtocolAddress(from)));
        return {
            content: result ? Array.from(result): [],
            error: err ? err.toString() : "",
            success: result ? true : false
        }
    }

    /**
     * See Signal Encrypt methode in the signal.ts file;
     */
    async encrypt(data: number[], to: string, identity:{ id: string; identityKey: number[]; preKeyId: number | null; preKeyPublic: number[]; registrationId: number; signedPreKeyId: number; signedPreKeyPublic: number[]; signedPreKeySignature: number[]; username: string; } | null, callParams: CallParams<'data' | 'to'>): Promise<{ content: number[] | null; error: string | null; success: boolean; }> {
        if(!onlyOwner(this.peer, callParams)) throw new Error("Not Owner");
        const [err, result] = await on(this.user!.encrypt(
            Buffer.from(data),
            StringToProtocolAddress(to),
            identity ? 
            PreKeyBundle.new(
                identity.registrationId,
                StringToProtocolAddress(identity.id).deviceId(),
                identity.preKeyId,
                PublicKey.deserialize(Buffer.from(identity.preKeyPublic)),
                identity.signedPreKeyId,
                PublicKey.deserialize(Buffer.from(identity.signedPreKeyPublic)),
                Buffer.from(identity.signedPreKeySignature),
                PublicKey.deserialize(Buffer.from(identity.identityKey))
            ) : null
        ));
        return {
            content: result ? Array.from(result): [],
            error: err ? err.toString() : "",
            success: result ? true : false
        }

    };
}