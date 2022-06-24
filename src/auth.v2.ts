import { CallParams } from '@fluencelabs/fluence';
import { AuthDef } from './_aqua/auth';
export class AuthV2 implements AuthDef {
    create: (username: string, callParams: CallParams<'username'>) => boolean | Promise<boolean>;
    get_pub_key: (callParams: CallParams<null>) => string | Promise<string>;
    receive_handshake: (prologue: number[], callParams: CallParams<'prologue'>) => number[] | Promise<number[]>;
    send_handshake: (peer: string, public_key: string, callParams: CallParams<'public_key' | 'peer'>) => number[] | Promise<number[]>;
    sign: (data: number[], callParams: CallParams<'data'>) => { error: string | null; signature: number[] | null; success: boolean; } | Promise<{ error: string | null; signature: number[] | null; success: boolean; }>;
    verify: (signature: number[], data: number[], callParams: CallParams<'data' | 'signature'>) => boolean | Promise<boolean>;
}