import { CallParams, FluencePeer } from '@fluencelabs/fluence';
import { Signal, Stores } from './signal';
import { AuthDef } from './_aqua/auth';
import on from "await-handler";

function onlyOwner(peer: FluencePeer, callParams: CallParams<null>) {
    return callParams.initPeerId === peer.getStatus().peerId;
}
export class Auth implements AuthDef {

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
    
    get_identity(callParams: CallParams<null>): { deviceId: number; id: string; identityKey: number[]; preKeyId: number | null; preKeyPublic: number[]; registrationId: number; signedPreKeyId: number; signedPreKeyPublic: number[]; signedPreKeySignature: number[]; username: string; } {
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
            id: this.currentId!
        } 
    };

    private stores: Stores | undefined;
    constructor(peer: FluencePeer, stores?: Stores) {
        this.peer = peer;
        this.stores = stores
    }

    async create(username: string, callParams: CallParams<'username'>): Promise<{ deviceId: number; id: string; identityKey: number[]; preKeyId: number | null; preKeyPublic: number[]; registrationId: number; signedPreKeyId: number; signedPreKeyPublic: number[]; signedPreKeySignature: number[]; username: string; }> {
        if(!onlyOwner(this.peer, callParams)) throw new Error("Not owner");
        if(this.stores) Signal.setStore(this.stores)
        const identity = await Signal.create(username, 1);
        this.currentUser = identity;
        this.currentUsername = username;
        this.currentId = "fds";
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
            id: this.currentId
        } 
    }

    async sign(data: number[], callParams: CallParams<'data'>): Promise<{ error: string | null; signature: number[] | null; success: boolean; }> {
        if(!onlyOwner(this.peer, callParams)) throw new Error("Not Owner");
        const [err, result] = await on(this.currentUser!.sign(data.toString()));
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
        const [err, result] = await on(this.currentUser!.receive(data, from))
        return {
            content: result ? Array.from(result): [],
            error: err ? err.toString() : "",
            success: result ? true : false
        }
    }

    async encrypt(data: number[], id: string, callParams: CallParams<'data' | 'id'>): Promise<{ content: number[] | null; error: string | null; success: boolean; }> {
        if(!onlyOwner(this.peer, callParams)) throw new Error("Not Owner");
        const [err, result] = await on(this.currentUser!.send(data, id));
        return {
            content: result ? Array.from(result): [],
            error: err ? err.toString() : "",
            success: result ? true : false
        }

    };
}
