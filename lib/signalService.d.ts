import { CallParams, FluencePeer } from '@fluencelabs/fluence';
import { SignalDef } from './_aqua/signal';
import { Signal, Stores } from './signal';
/**
 * Service that enable Signal Client for encryption and decryption;
 */
export declare class SignalService implements SignalDef {
    user: Signal | undefined;
    username: string | undefined;
    id: string | undefined;
    peer: FluencePeer;
    get_username(callParams: CallParams<null>): Promise<string>;
    set_username(username: string, callParams: CallParams<'username'>): void | Promise<void>;
    get_identity(callParams: CallParams<null>): {
        id: string;
        username: string;
        registrationId: number;
        identityKey: number[];
        preKeyId: number | null;
        signedPreKeyId: number;
        preKeyPublic: number[];
        signedPreKeyPublic: number[];
        signedPreKeySignature: number[];
    };
    register_identity(identity: {
        id: string;
        identityKey: number[];
        preKeyId: number | null;
        preKeyPublic: number[];
        registrationId: number;
        signedPreKeyId: number;
        signedPreKeyPublic: number[];
        signedPreKeySignature: number[];
        username: string;
    }, callParams: CallParams<"identity">): Promise<{
        success: boolean;
        error: string | null;
    }>;
    constructor(peer: FluencePeer, stores?: Stores);
    create(username: string, callParams: CallParams<'username'>): Promise<{
        id: string;
        username: string;
        identityKey: number[];
        registrationId: number;
        preKeyId: number | null;
        signedPreKeyId: number;
        preKeyPublic: number[];
        signedPreKeyPublic: number[];
        signedPreKeySignature: number[];
    }>;
    sign(data: number[], callParams: CallParams<'data'>): Promise<{
        error: string | null;
        signature: number[] | null;
        success: boolean;
    }>;
    verify(signature: number[], data: number[], callParams: CallParams<'data' | 'signature'>): Promise<boolean>;
    verify_for(signature: number[], data: number[], address: string): Promise<boolean>;
    decrypt(data: number[], from: string, callParams: CallParams<'data' | 'from'>): Promise<{
        content: number[] | null;
        error: string | null;
        success: boolean;
    }>;
    encrypt(data: number[], to: string, identity: {
        id: string;
        identityKey: number[];
        preKeyId: number | null;
        preKeyPublic: number[];
        registrationId: number;
        signedPreKeyId: number;
        signedPreKeyPublic: number[];
        signedPreKeySignature: number[];
        username: string;
    } | null, callParams: CallParams<'data' | 'to'>): Promise<{
        content: number[] | null;
        error: string | null;
        success: boolean;
    }>;
}
