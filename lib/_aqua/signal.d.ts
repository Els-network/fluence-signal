/**
 *
 * This file is auto-generated. Do not edit manually: changes may be erased.
 * Generated by Aqua compiler: https://github.com/fluencelabs/aqua/.
 * If you find any bugs, please write an issue on GitHub: https://github.com/fluencelabs/aqua/issues
 * Aqua version: 0.7.3-319
 *
 */
import { FluencePeer } from '@fluencelabs/fluence';
import { CallParams } from '@fluencelabs/fluence/dist/internal/compilerSupport/v3';
export interface SignalDef {
    create: (username: string, callParams: CallParams<'username'>) => {
        id: string;
        identityKey: number[];
        preKeyId: number | null;
        preKeyPublic: number[];
        registrationId: number;
        signedPreKeyId: number;
        signedPreKeyPublic: number[];
        signedPreKeySignature: number[];
        username: string;
    } | Promise<{
        id: string;
        identityKey: number[];
        preKeyId: number | null;
        preKeyPublic: number[];
        registrationId: number;
        signedPreKeyId: number;
        signedPreKeyPublic: number[];
        signedPreKeySignature: number[];
        username: string;
    }>;
    decrypt: (data: number[], from: string, callParams: CallParams<'data' | 'from'>) => {
        content: number[] | null;
        error: string | null;
        success: boolean;
    } | Promise<{
        content: number[] | null;
        error: string | null;
        success: boolean;
    }>;
    encrypt: (data: number[], to: string, callParams: CallParams<'data' | 'to'>) => {
        content: number[] | null;
        error: string | null;
        success: boolean;
    } | Promise<{
        content: number[] | null;
        error: string | null;
        success: boolean;
    }>;
    get_identity: (callParams: CallParams<null>) => {
        id: string;
        identityKey: number[];
        preKeyId: number | null;
        preKeyPublic: number[];
        registrationId: number;
        signedPreKeyId: number;
        signedPreKeyPublic: number[];
        signedPreKeySignature: number[];
        username: string;
    } | Promise<{
        id: string;
        identityKey: number[];
        preKeyId: number | null;
        preKeyPublic: number[];
        registrationId: number;
        signedPreKeyId: number;
        signedPreKeyPublic: number[];
        signedPreKeySignature: number[];
        username: string;
    }>;
    get_username: (callParams: CallParams<null>) => string | Promise<string>;
    register_identity: (identity: {
        id: string;
        identityKey: number[];
        preKeyId: number | null;
        preKeyPublic: number[];
        registrationId: number;
        signedPreKeyId: number;
        signedPreKeyPublic: number[];
        signedPreKeySignature: number[];
        username: string;
    }, callParams: CallParams<'identity'>) => {
        error: string | null;
        success: boolean;
    } | Promise<{
        error: string | null;
        success: boolean;
    }>;
    set_username: (username: string, callParams: CallParams<'username'>) => void | Promise<void>;
    sign: (data: number[], callParams: CallParams<'data'>) => {
        error: string | null;
        signature: number[] | null;
        success: boolean;
    } | Promise<{
        error: string | null;
        signature: number[] | null;
        success: boolean;
    }>;
    verify: (signature: number[], data: number[], callParams: CallParams<'signature' | 'data'>) => boolean | Promise<boolean>;
    verify_for: (signature: number[], data: number[], id: string, callParams: CallParams<'signature' | 'data' | 'id'>) => boolean | Promise<boolean>;
}
export declare function registerSignal(service: SignalDef): void;
export declare function registerSignal(serviceId: string, service: SignalDef): void;
export declare function registerSignal(peer: FluencePeer, service: SignalDef): void;
export declare function registerSignal(peer: FluencePeer, serviceId: string, service: SignalDef): void;
