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
    initLogger(maxLevel, callback) {
        SignalClient.initLogger(maxLevel, callback);
    }
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
    encrypt(message, address, preKeyBundle) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield this.sessions.getSession(address);
            if (!session) {
                yield SignalClient.processPreKeyBundle(preKeyBundle, address, this.sessions, this.identityKeys);
                const cipherText = yield SignalClient.signalEncrypt(message, address, this.sessions, this.identityKeys);
                const cipherTextR = SignalClient.PreKeySignalMessage.deserialize(cipherText.serialize());
                return cipherTextR.serialize();
            }
            else {
                const cipherText = yield SignalClient.signalEncrypt(message, address, this.sessions, this.identityKeys);
                const cipherTextR = SignalClient.SignalMessage.deserialize(cipherText.serialize());
                return cipherTextR.serialize();
            }
        });
    }
    decrypt(msg, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield this.sessions.getSession(address);
            if (!session) {
                const message = SignalClient.PreKeySignalMessage.deserialize(msg);
                const plainText = yield SignalClient.signalDecryptPreKey(message, address, this.sessions, this.identityKeys, this.preKeys, this.preKeysSigned);
                return plainText;
            }
            else {
                const message = SignalClient.SignalMessage.deserialize(msg);
                const plainText = yield SignalClient.signalDecrypt(message, address, this.sessions, this.identityKeys);
                return plainText;
            }
        });
    }
    sign(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = yield this.identityKeys.getIdentityKey();
            return id.sign(message);
        });
    }
    verify(message, sig) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.identityKeys.getIdentityKey()).getPublicKey().verify(message, sig);
        });
    }
    verifyFor(message, signature, address) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return (_a = (yield this.identityKeys.getIdentity(address))) === null || _a === void 0 ? void 0 : _a.verify(message, signature);
        });
    }
    register_user(address, key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.identityKeys.saveIdentity(address, SignalClient.PublicKey.deserialize(key));
        });
    }
}
exports.Signal = Signal;
