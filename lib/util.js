"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hash = exports.PeerIdToNumber = exports.StringToProtocolAddress = exports.ProtocolAddressToString = void 0;
const libsignal_client_1 = require("@signalapp/libsignal-client");
const crypto_1 = require("crypto");
function ProtocolAddressToString(address) {
    return `${address.name()}::${address.deviceId()}`;
}
exports.ProtocolAddressToString = ProtocolAddressToString;
function StringToProtocolAddress(string) {
    const args = string.split("::");
    return libsignal_client_1.ProtocolAddress.new(args[0], Number(args[1]));
}
exports.StringToProtocolAddress = StringToProtocolAddress;
/**
 * Get a unique number from Peer ID;
 * @param peerId string - The peer id to converte;
 * @returns number - A number representing the peer id;
 */
function PeerIdToNumber(peerId) {
    const string = hash(peerId); // Hash the peerId to ensure it's unique;
    return Number("1" // ensure the number never start by a 0
        + Array.from(Buffer.from(string, "base64").valueOf().values() // converte the hash to a buffer of number;
        ).map(el => el < 100 ? String("0" + el) : String(el)) // get an array of string ["0xx"] || ["xxx"];
            .join("").slice(0, 11)); // return a number;
}
exports.PeerIdToNumber = PeerIdToNumber;
/**
 * Hash a string;
 * @param string - The string to hash
 * @returns hash
 */
function hash(string) {
    const h = crypto_1.createHash("md5");
    return h.update(string).digest("hex");
}
exports.hash = hash;
