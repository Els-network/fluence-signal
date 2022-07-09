"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalService = void 0;
const signal_1 = require("./signal");
const libsignal_client_1 = require("@signalapp/libsignal-client");
const await_handler_1 = __importDefault(require("await-handler"));
const util_1 = require("./util");
function onlyOwner(peer, callParams) {
    return callParams.initPeerId === peer.getStatus().peerId;
}
/**
 * Service that enable Signal Client for encryption and decryption;
 */
class SignalService {
    constructor(peer, stores) {
        this.peer = peer;
        if (stores)
            signal_1.Signal.setStore(stores);
    }
    get_username(callParams) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.username;
        });
    }
    ;
    set_username(username, callParams) {
        if (onlyOwner(this.peer, callParams))
            this.username = username;
    }
    ;
    get_identity(callParams) {
        return {
            id: util_1.ProtocolAddressToString(this.user.address),
            username: this.username,
            registrationId: this.user.bundle.registrationId(),
            identityKey: Array.from(this.user.bundle.identityKey().serialize()),
            preKeyId: this.user.bundle.preKeyId(),
            signedPreKeyId: this.user.bundle.signedPreKeyId(),
            preKeyPublic: Array.from(this.user.bundle.preKeyPublic().serialize()),
            signedPreKeyPublic: Array.from(this.user.bundle.signedPreKeyPublic().serialize()),
            signedPreKeySignature: Array.from(this.user.bundle.signedPreKeySignature()),
        };
    }
    ;
    register_identity(identity, callParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const [err, res] = yield await_handler_1.default(this.user.register_user(util_1.StringToProtocolAddress(identity.id), Buffer.from(identity.identityKey)));
            return { success: res, error: err ? err === null || err === void 0 ? void 0 : err.toString() : null };
        });
    }
    create(username, callParams) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!onlyOwner(this.peer, callParams))
                throw new Error("Not owner");
            this.username = username;
            const identity = yield signal_1.Signal.create(util_1.PeerIdToNumber(this.peer.getStatus().peerId));
            this.user = identity;
            this.id = util_1.ProtocolAddressToString(this.user.address);
            return {
                id: util_1.ProtocolAddressToString(this.user.address),
                username: this.username,
                identityKey: Array.from(this.user.bundle.identityKey().serialize()),
                registrationId: this.user.bundle.registrationId(),
                preKeyId: this.user.bundle.preKeyId(),
                signedPreKeyId: this.user.bundle.signedPreKeyId(),
                preKeyPublic: Array.from(this.user.bundle.preKeyPublic().serialize()),
                signedPreKeyPublic: Array.from(this.user.bundle.signedPreKeyPublic().serialize()),
                signedPreKeySignature: Array.from(this.user.bundle.signedPreKeySignature()),
            };
        });
    }
    sign(data, callParams) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!onlyOwner(this.peer, callParams))
                throw new Error("Not Owner");
            const [err, result] = yield await_handler_1.default(this.user.sign(Buffer.from(data)));
            return {
                error: err ? err.toLocaleString() : err,
                signature: result ? Array.from(result) : [],
                success: result ? true : false
            };
        });
    }
    ;
    verify(signature, data, callParams) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.user.verify(Buffer.from(signature), Buffer.from(data));
        });
    }
    ;
    verify_for(signature, data, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const is_verify = yield this.user.verifyFor(Buffer.from(data), Buffer.from(signature), util_1.StringToProtocolAddress(address));
            return is_verify ? is_verify : false;
        });
    }
    decrypt(data, from, callParams) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!onlyOwner(this.peer, callParams))
                throw new Error("Not Owner");
            const [err, result] = yield await_handler_1.default(this.user.decrypt(Buffer.from(data), util_1.StringToProtocolAddress(from)));
            return {
                content: result ? Array.from(result) : [],
                error: err ? err.toString() : "",
                success: result ? true : false
            };
        });
    }
    encrypt(data, to, identity, callParams) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!onlyOwner(this.peer, callParams))
                throw new Error("Not Owner");
            const [err, result] = yield await_handler_1.default(this.user.encrypt(Buffer.from(data), util_1.StringToProtocolAddress(to), identity ?
                libsignal_client_1.PreKeyBundle.new(identity.registrationId, util_1.StringToProtocolAddress(identity.id).deviceId(), identity.preKeyId, libsignal_client_1.PublicKey.deserialize(Buffer.from(identity.preKeyPublic)), identity.signedPreKeyId, libsignal_client_1.PublicKey.deserialize(Buffer.from(identity.signedPreKeyPublic)), Buffer.from(identity.signedPreKeySignature), libsignal_client_1.PublicKey.deserialize(Buffer.from(identity.identityKey))) : null));
            return {
                content: result ? Array.from(result) : [],
                error: err ? err.toString() : "",
                success: result ? true : false
            };
        });
    }
    ;
}
exports.SignalService = SignalService;
