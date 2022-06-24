// V1 / not working at all, stuck on the Noise object creation

import { CallParams, KeyPair } from '@fluencelabs/fluence';
import { AuthDef } from './_aqua/auth';
const Noise = require("noise-handshake");
const Cipher = require("noise-handshake/cipher");
const curve = require("noise-curve-ed");

export class Auth implements AuthDef {
    private keyPair: KeyPair | null;
    private username: string = "";
    private InMemoryStoreContacts = new InMemoryStoreContacts();
    constructor(keyPair?: KeyPair) {
        this.keyPair = null;
        if(keyPair) this.keyPair = keyPair;
        else Promise.resolve(KeyPair.randomEd25519()).then(k => this.keyPair = k);
    }

    receive_handshake(prologue: number[], callParams: CallParams<null>): number[] | Promise<number[]> {
        console.log("Receive handshake: ", prologue);
        const handshake = Handshake.get_handshake(callParams.initPeerId);
        console.log("Handshake: ", handshake);
        if(handshake) {
            handshake.receive(prologue.toString());
            this.InMemoryStoreContacts.store_contact("", new Cipher(handshake.noise.rx));
            return [];
        } else {
            const h = new Handshake(this.keyPair!, false, callParams.initPeerId);
            this.InMemoryStoreContacts.store_contact("", new Cipher(h.noise.tx));
            return h.receive(prologue.toString());
        }
    }
    send_handshake(peer: string, public_key: string, callParams: CallParams<'public_key'>): number[] | Promise<number[]> {
        console.log('send_handshake', peer, public_key, callParams);
        const handshake = new Handshake(this.keyPair!, true, public_key);
        Handshake.store_handshake(public_key, handshake);
        const prologue = handshake.send();
        console.log(prologue);
        return prologue;
    }
    get_pub_key(callParams: CallParams<null>): string | Promise<string> {
        console.log("get peer id;");
        return this.keyPair!.Libp2pPeerId.toString();
    }
    sign(data: number[], callParams: CallParams<'data'>): { error: string | null; signature: number[] | null; success: boolean; } | Promise<{ error: string | null; signature: number[] | null; success: boolean; }> {
        return { error: "not implemented", signature: null, success: false };
    }
    verify(signature: number[], data: number[], callParams: CallParams<'data' | 'signature'>): boolean | Promise<boolean> {
        return true;
    }
}

class Handshake {
    public noise;
    private prologue = Buffer.alloc(0);
    public is_initiator: boolean = false;
    constructor(keyPair: KeyPair, is_initiator: boolean, public_key?: string) {
        if(is_initiator && !public_key) throw new Error("Cannot initiate an handshake without the peer public key.");
        console.log("Start handshake");
        const keys = {publicKey: keyPair.Libp2pPeerId.pubKey, secretKey: keyPair.Libp2pPeerId.privKey};
        console.log(this.noise);
        this.noise = new Noise("SKLEN", is_initiator, keys, { curve });
        this.noise.initialise(this.prologue, public_key);
    }
    receive(prologue: string) {
        this.noise.recv(prologue);
        return this.noise.send();
    }

    send() {
        return this.noise.send();
    }

    static handshakes: Map<string, Handshake> = new Map();
    static get_handshake(id: string): Handshake | void{}
    static store_handshake(id: string, handshake: Handshake) {}
}
class InMemoryStoreContacts {
    contacts: Map<string, any> = new Map();
    get_contact(id: string): void | any {
        console.log("get_contact");
        return this.contacts.get(id);
    }
    store_contact(id: string, cipher: any): void {
        console.log("store_contact", cipher);
        this.contacts.set(id, cipher);
    }
}