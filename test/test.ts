import { createHash } from 'crypto';
/**
 * Get a unique number from Peer ID;
 * @param peerId string - The peer id to converte;
 * @returns number - A number representing the peer id;
 */
 function PeerIdToNumber(peerId: string): number {
    const string = hash(peerId); // Hash the peerId to ensure it's unique;
    return Number(
        "1" // ensure the number never start by a 0
        + Array.from(
            Buffer.from(string, "base64").valueOf().values() // converte the hash to a buffer of number;
        ).map(
            el => el < 100 ? String("0" + el) : String(el)) // get an array of string ["0xx"] || ["xxx"];
        .join("").slice(0, 11)
    ) // return a number;
}

/**
 * Hash a string;
 * @param string - The string to hash
 * @returns hash
 */
function hash(string: string): string {
    const h = createHash("md5");
    return h.update(string).digest("hex");
}
