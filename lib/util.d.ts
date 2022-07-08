import { ProtocolAddress } from '@signalapp/libsignal-client';
export declare function ProtocolAddressToString(address: ProtocolAddress): string;
export declare function StringToProtocolAddress(string: string): ProtocolAddress;
/**
 * Get a unique number from Peer ID;
 * @param peerId string - The peer id to converte;
 * @returns number - A number representing the peer id;
 */
export declare function PeerIdToNumber(peerId: string): number;
/**
 * Hash a string;
 * @param string - The string to hash
 * @returns hash
 */
export declare function hash(string: string): string;
