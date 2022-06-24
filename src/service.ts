import { FluencePeer, PeerConfig } from '@fluencelabs/fluence';
import { krasnodar } from '@fluencelabs/fluence-network-environment';
import { registerSig } from '@fluencelabs/fluence/dist/internal/_aqua/services';
import { Auth } from './auth';
import { handshake, registerAuth } from './_aqua/auth';
export class AuthService extends FluencePeer {
    override async start(config?: PeerConfig | undefined): Promise<void> {
        await super.start({
            "connectTo": krasnodar[0]
        });
        
        console.log("--------------------")
        console.log("PeerId: ", this.getStatus().peerId);
        console.log("Realy peer: ", this.getStatus().relayPeerId);
        
        registerAuth(this, new Auth());
    }
        
    async DoHandshake(peer: string) {
        try {
            console.log("call handshake");
            const result = await handshake(this, peer);
            console.log(result);
        } catch (err) {
            console.log(err);
        }
    }
}