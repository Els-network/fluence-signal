import { CallParams, FluencePeer } from '@fluencelabs/fluence';
import { Signal, Stores } from './signal';
import on from "await-handler";

import { ProtocolAddress } from '@signalapp/libsignal-client';
import { nanoid } from "nanoid";
import { SignalDef } from './_aqua/signal';

export class SignalService implements SignalDef {

    public currentUser: Signal | undefined;
    public currentUsername: string | undefined;
    public currentId: string | undefined;
    
    public peer: FluencePeer;

    async get_username(callParams: CallParams<null>): Promise<string> {
        return this.currentUsername!
    };
    
    set_username(username: string, callParams: CallParams<'username'>): void | Promise<void> {
        if(onlyOwner(this.peer, callParams))
            this.currentUsername = username;
    };

    get_account_name(callParams: CallParams<null>): string | Promise<string> {
        return this.currentUsername!;
    };
    
    get_identity(callParams: CallParams<null>): { address: string; deviceId: number; id: string; identityKey: number[]; preKeyId: number | null; preKeyPublic: number[]; registrationId: number; signedPreKeyId: number; signedPreKeyPublic: number[]; signedPreKeySignature: number[]; username: string; } {
        return {
            registrationId: this.currentUser!.bundle.registrationId(),
            identityKey: Array.from(this.currentUser!.bundle.identityKey().serialize()),
            preKeyId: this.currentUser!.bundle.preKeyId(),
            signedPreKeyId: this.currentUser!.bundle.signedPreKeyId(),
            deviceId: this.currentUser!.bundle.deviceId(),
            preKeyPublic: Array.from(this.currentUser!.bundle.preKeyPublic()!.serialize()),
            signedPreKeyPublic: Array.from(this.currentUser!.bundle.signedPreKeyPublic().serialize()),
            signedPreKeySignature: Array.from(this.currentUser!.bundle.signedPreKeySignature()),
            username: this.currentUsername!,
            id: this.currentId!,
            address: ProtocolAddresToString(this.currentUser!.address),
        } 
    };

    constructor(peer: FluencePeer, stores?: Stores) {
        this.peer = peer;
        if(stores) Signal.setStore(stores);
    }

    async create(username: string, callParams: CallParams<'username'>): Promise<{ address: string; deviceId: number; id: string; identityKey: number[]; preKeyId: number | null; preKeyPublic: number[]; registrationId: number; signedPreKeyId: number; signedPreKeyPublic: number[]; signedPreKeySignature: number[]; username: string; }> {
        if(!onlyOwner(this.peer, callParams)) throw new Error("Not owner");
        const identity = await Signal.create(username, 1);
        this.currentUser = identity;
        this.currentUsername = username;
        this.currentId = nanoid();
        return {
            registrationId: this.currentUser.bundle.registrationId(),
            identityKey: Array.from(this.currentUser.bundle.identityKey().serialize()),
            preKeyId: this.currentUser.bundle.preKeyId(),
            signedPreKeyId: this.currentUser.bundle.signedPreKeyId(),
            deviceId: this.currentUser.bundle.deviceId(),
            preKeyPublic: Array.from(this.currentUser.bundle.preKeyPublic()!.serialize()),
            signedPreKeyPublic: Array.from(this.currentUser.bundle.signedPreKeyPublic().serialize()),
            signedPreKeySignature: Array.from(this.currentUser.bundle.signedPreKeySignature()),
            username: this.currentUsername,
            id: this.currentId,
            address: this.currentUsername + "::" + this.currentId
        } 
    }

    async sign(data: number[], callParams: CallParams<'data'>): Promise<{ error: string | null; signature: number[] | null; success: boolean; }> {
        if(!onlyOwner(this.peer, callParams)) throw new Error("Not Owner");
        const [err, result] = await on(this.currentUser!.sign(Buffer.from(data)));
        return {
            error: err ? err.toLocaleString() : err,
            signature: result ? Array.from(result) : [],
            success: result ? true: false
        }

    };
    
    async verify(signature: number[], data: number[], callParams: CallParams<'data' | 'signature'>): Promise<boolean> {
        return await this.currentUser!.verify(Buffer.from(signature), Buffer.from(data));
    };
    
    async decrypt(data: number[], from: string, callParams: CallParams<'data' | 'from'>):  Promise<{ content: number[] | null; error: string | null; success: boolean; }> {
        if(!onlyOwner(this.peer, callParams)) throw new Error("Not Owner");
        const [err, result] = await on(this.currentUser!.receive(Buffer.from(data), StringToProtocolAddress(from)));
        return {
            content: result ? Array.from(result): [],
            error: err ? err.toString() : "",
            success: result ? true : false
        }
    }

    async encrypt(data: number[], id: string, callParams: CallParams<'data' | 'id'>): Promise<{ content: number[] | null; error: string | null; success: boolean; }> {
        if(!onlyOwner(this.peer, callParams)) throw new Error("Not Owner");
        const [err, result] = await on(this.currentUser!.send(Buffer.from(data), StringToProtocolAddress(id)));
        return {
            content: result ? Array.from(result): [],
            error: err ? err.toString() : "",
            success: result ? true : false
        }

    };
}

function onlyOwner(peer: FluencePeer, callParams: CallParams<null>) {
    return callParams.initPeerId === peer.getStatus().peerId;
}

function ProtocolAddresToString(address: ProtocolAddress) {
    return `${address.name()}::${address.deviceId()}`
}

function StringToProtocolAddress(string: string) {
    const args = string.split("::");
    return ProtocolAddress.new(args[0], Number(args[1]));
}