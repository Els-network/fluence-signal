"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Signal = exports.InMemorySenderKeyStore = exports.InMemoryPreKeyStore = exports.InMemorySessionStore = void 0;
const SignalClient = __importStar(require("@signalapp/libsignal-client"));
const util_1 = require("./util");
/**
 * Stores sessions in memory by default;
 * @see https://signal.org/docs/ for more information
 */
class InMemorySessionStore extends SignalClient.SessionStore {
    constructor() {
        super(...arguments);
        this.state = new Map();
    }
    saveSession(name, record) {
        return __awaiter(this, void 0, void 0, function* () {
            const idx = name.name() + "::" + name.deviceId();
            Promise.resolve(this.state.set(idx, record.serialize()));
        });
    }
    getSession(name) {
        const idx = name.name() + '::' + name.deviceId();
        const serialized = this.state.get(idx);
        if (serialized) {
            return Promise.resolve(SignalClient.SessionRecord.deserialize(serialized));
        }
        else {
            return Promise.resolve(null);
        }
    }
    getExistingSessions(addresses) {
        return __awaiter(this, void 0, void 0, function* () {
            return addresses.map(address => {
                const idx = address.name() + '::' + address.deviceId();
                const serialized = this.state.get(idx);
                if (!serialized) {
                    throw 'no session for ' + idx;
                }
                return SignalClient.SessionRecord.deserialize(serialized);
            });
        });
    }
}
exports.InMemorySessionStore = InMemorySessionStore;
/**
 * Stores identities in memory by default;
 * @see https://signal.org/docs/ for more information
 */
class InMemoryIdentityKeyStore extends SignalClient.IdentityKeyStore {
    constructor(localRegistrationId) {
        super();
        this.idKeys = new Map();
        this.identityKey = SignalClient.PrivateKey.generate();
        this.localRegistrationId = localRegistrationId !== null && localRegistrationId !== void 0 ? localRegistrationId : 5;
    }
    getIdentityKey() {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve(this.identityKey);
        });
    }
    getLocalRegistrationId() {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve(this.localRegistrationId);
        });
    }
    saveIdentity(name, key) {
        const idx = name.name() + "::" + name.deviceId();
        const seen = this.idKeys.has(idx);
        if (seen) {
            const currentKey = this.idKeys.get(idx);
            const changed = currentKey.compare(key) != 0;
            this.idKeys.set(idx, key);
            return Promise.resolve(changed);
        }
        this.idKeys.set(idx, key);
        return Promise.resolve(false);
    }
    isTrustedIdentity(name, key, direction) {
        const idx = name.name() + "::" + name.deviceId();
        if (this.idKeys.has(idx)) {
            const currentKey = this.idKeys.get(idx);
            return Promise.resolve(currentKey.compare(key) == 0);
        }
        else {
            return Promise.resolve(true);
        }
    }
    getIdentity(name) {
        const idx = name.name() + "::" + name.deviceId();
        if (this.idKeys.has(idx)) {
            return Promise.resolve(this.idKeys.get(idx));
        }
        else {
            return Promise.resolve(null);
        }
    }
}
/**
 * Stores Prekeys in memory by default;
 * @see https://signal.org/docs/ for more information
 */
class InMemoryPreKeyStore extends SignalClient.PreKeyStore {
    constructor() {
        super(...arguments);
        this.state = new Map();
    }
    savePreKey(id, record) {
        return __awaiter(this, void 0, void 0, function* () {
            Promise.resolve(this.state.set(id, record.serialize()));
        });
    }
    getPreKey(id) {
        return Promise.resolve(SignalClient.PreKeyRecord.deserialize(this.state.get(id)));
    }
    removePreKey(id) {
        this.state.delete(id);
        return Promise.resolve();
    }
}
exports.InMemoryPreKeyStore = InMemoryPreKeyStore;
/**
 * Stores Signed Prekeys in memory by default;
 * @see https://signal.org/docs/ for more information
 */
class InMemorySignedPreKeyStore extends SignalClient.SignedPreKeyStore {
    constructor() {
        super(...arguments);
        this.state = new Map();
    }
    saveSignedPreKey(id, record) {
        return __awaiter(this, void 0, void 0, function* () {
            Promise.resolve(this.state.set(id, record.serialize()));
        });
    }
    getSignedPreKey(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve(SignalClient.SignedPreKeyRecord.deserialize(this.state.get(id)));
        });
    }
}
/**
* Stores sender keys in memory by default; Used for groups in signal;
* It is not used in this version;
* @TODO implement groups;
* @see https://signal.org/docs/ for more information
*/
class InMemorySenderKeyStore extends SignalClient.SenderKeyStore {
    constructor() {
        super(...arguments);
        this.state = new Map();
    }
    saveSenderKey(sender, distributionId, record) {
        return __awaiter(this, void 0, void 0, function* () {
            const idx = distributionId + "::" + sender.name() + "::" + sender.deviceId();
            Promise.resolve(this.state.set(idx, record));
        });
    }
    getSenderKey(sender, distributionId) {
        const idx = distributionId + "::" + sender.name() + "::" + sender.deviceId();
        if (this.state.has(idx)) {
            return Promise.resolve(this.state.get(idx));
        }
        else {
            return Promise.resolve(null);
        }
    }
}
exports.InMemorySenderKeyStore = InMemorySenderKeyStore;
class Signal {
    constructor(stores) {
        this.identityKeys = stores ? stores.identitykeys : Signal.stores.identitykeys;
        this.sessions = stores ? stores.sessions : Signal.stores.sessions;
        this.preKeys = stores ? stores.preKeys : Signal.stores.preKeys;
        this.preKeysSigned = stores ? stores.preKeysSigned : Signal.stores.preKeysSigned;
        this.bundle = stores ? stores.bundle : Signal.stores.bundle;
        this.address = stores ? stores.address : Signal.stores.address;
    }
    static setStore(store) {
        Signal.stores = store;
    }
    /**
     * Initialize the signal logger.
     * @param maxLevel
     * @param callback
     */
    static initLogger(maxLevel, callback) {
        SignalClient.initLogger(maxLevel, callback);
    }
    /**
     * Create a new identity;
     * @param id device id;
     * @param stores stores defined like ahead
     * @returns Signal;
     */
    static create(id, stores) {
        return __awaiter(this, void 0, void 0, function* () {
            const identitykeys = Signal.stores ? Signal.stores.identitykeys : new InMemoryIdentityKeyStore();
            const sessions = Signal.stores ? Signal.stores.sessions : new InMemorySessionStore();
            const preKeys = Signal.stores ? Signal.stores.preKeys : new InMemoryPreKeyStore();
            const preKeysSigned = Signal.stores ? Signal.stores.preKeysSigned : new InMemorySignedPreKeyStore();
            const PreKey = SignalClient.PrivateKey.generate();
            const SPreKey = SignalClient.PrivateKey.generate();
            const indentityKey = yield identitykeys.getIdentityKey();
            const address = SignalClient.ProtocolAddress.new(util_1.hash(indentityKey.serialize().toString()), id);
            const preKeySigned = indentityKey.sign(SPreKey.getPublicKey().serialize());
            const registrationId = yield identitykeys.getLocalRegistrationId();
            const PreKeyId = 31337;
            const SignedPreKeyId = 22;
            const keysBundle = SignalClient.PreKeyBundle.new(registrationId, address.deviceId(), PreKeyId, PreKey.getPublicKey(), SignedPreKeyId, SPreKey.getPublicKey(), preKeySigned, indentityKey.getPublicKey());
            const record = SignalClient.PreKeyRecord.new(PreKeyId, indentityKey.getPublicKey(), PreKey);
            preKeys.savePreKey(PreKeyId, record);
            const PreKeySignedRecord = SignalClient.SignedPreKeyRecord.new(SignedPreKeyId, 42, SPreKey.getPublicKey(), SPreKey, preKeySigned);
            preKeysSigned.saveSignedPreKey(SignedPreKeyId, PreKeySignedRecord);
            return new Signal(stores ? stores : { address, identitykeys, sessions, preKeys, preKeysSigned, bundle: keysBundle });
        });
    }
    static login(stores) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Signal(stores);
        });
    }
    ;
    static sync_device() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    ; //TODO
    /**
     * Encrypt a message using libsignal
     * @param message Buffer - the message to encrypt;
     * @param address The address of the identity
     * @param preKeyBundle optional pre-key bundle to etablished a new session
     * @returns Buffer containing the encrypted message
     */
    encrypt(message, address, preKeyBundle) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield this.sessions.getSession(address); // retreive the session with the peer;
            if (!session) {
                // start a new session if no session is find;
                yield SignalClient.processPreKeyBundle(preKeyBundle, address, this.sessions, this.identityKeys); // get remote peer identity information
                const cipherText = yield SignalClient.signalEncrypt(message, address, this.sessions, // store to put the session on; 
                this.identityKeys // store to put the remote peer identity information
                );
                const cipherTextR = SignalClient.PreKeySignalMessage.deserialize(cipherText.serialize()); // get a new PreKeySignalMessage based on the cipher text generate ahead; Require to etablish a new session with a remote peer;
                return cipherTextR.serialize(); // Serialize the PreKeySignalMessage to buffer in order to send;
            }
            else {
                // if a session is already established;
                const cipherText = yield SignalClient.signalEncrypt(message, address, this.sessions, // store to retrieve the session on; 
                this.identityKeys // store to retreive the remote peer identity information
                );
                const cipherTextR = SignalClient.SignalMessage.deserialize(cipherText.serialize()); // create a signal message based on the cipher text;
                return cipherTextR.serialize(); // Serialize the signal message to buffer in order to send;
            }
        });
    }
    /**
     * Decrypt a message using libsignal;
     * @param msg message received
     * @param address address of the sender
     * @returns
     */
    decrypt(msg, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield this.sessions.getSession(address);
            if (!session) {
                // if not session is established;
                const message = SignalClient.PreKeySignalMessage.deserialize(msg); // deserialize the message as a PreKeySignalMessage from the serialized message
                const plainText = yield SignalClient.signalDecryptPreKey(message, address, this.sessions, this.identityKeys, this.preKeys, this.preKeysSigned); // decrypt it;
                return plainText; //  return decipher text
            }
            else {
                const message = SignalClient.SignalMessage.deserialize(msg); // deserialize the message as a SignalMessage
                const plainText = yield SignalClient.signalDecrypt(message, address, this.sessions, this.identityKeys);
                return plainText; // return decipher text
            }
        });
    }
    /**
     * Sign a message using the identity keys
     * @param message to sign
     * @returns Buffer signed
     */
    sign(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = yield this.identityKeys.getIdentityKey();
            return id.sign(message);
        });
    }
    /**
     * Verify the signature using the identity keys
     * @param message plain text message
     * @param sig signature of the message
     * @returns
     */
    verify(message, sig) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.identityKeys.getIdentityKey()).getPublicKey().verify(message, sig);
        });
    }
    /**
     * Verify a signature for a trust remote peer;
     * @param message plain text
     * @param signature signature
     * @param address address of the remote peer;
     * @returns boolean
     */
    verifyFor(message, signature, address) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return (_a = (yield this.identityKeys.getIdentity(address))) === null || _a === void 0 ? void 0 : _a.verify(message, signature);
        });
    }
    /**
     * Register a trust remote peer identity;
     * @param address of the remote peer;
     * @param key public key of the remote peer;
     * @returns void
     */
    register_user(address, key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.identityKeys.saveIdentity(address, SignalClient.PublicKey.deserialize(key));
        });
    }
}
exports.Signal = Signal;
