import { AuthService } from "./service";

async function main() {
    const peer1 = new AuthService();
    const peer2 = new AuthService();

    await peer1.start();
    await peer2.start();

    await peer1.DoHandshake(peer2.getStatus().peerId!);
}

main();