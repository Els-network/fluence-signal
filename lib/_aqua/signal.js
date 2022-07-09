"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSignal = void 0;
const v3_1 = require("@fluencelabs/fluence/dist/internal/compilerSupport/v3");
function registerSignal(...args) {
    v3_1.registerService(args, {
        "defaultServiceId": "signal",
        "functions": {
            "tag": "labeledProduct",
            "fields": {
                "create": {
                    "tag": "arrow",
                    "domain": {
                        "tag": "labeledProduct",
                        "fields": {
                            "username": {
                                "tag": "scalar",
                                "name": "string"
                            }
                        }
                    },
                    "codomain": {
                        "tag": "unlabeledProduct",
                        "items": [
                            {
                                "tag": "struct",
                                "name": "Identity",
                                "fields": {
                                    "preKeyPublic": {
                                        "tag": "array",
                                        "type": {
                                            "tag": "scalar",
                                            "name": "u8"
                                        }
                                    },
                                    "username": {
                                        "tag": "scalar",
                                        "name": "string"
                                    },
                                    "registrationId": {
                                        "tag": "scalar",
                                        "name": "u8"
                                    },
                                    "identityKey": {
                                        "tag": "array",
                                        "type": {
                                            "tag": "scalar",
                                            "name": "u8"
                                        }
                                    },
                                    "signedPreKeyId": {
                                        "tag": "scalar",
                                        "name": "u8"
                                    },
                                    "preKeyId": {
                                        "tag": "option",
                                        "type": {
                                            "tag": "scalar",
                                            "name": "u8"
                                        }
                                    },
                                    "id": {
                                        "tag": "scalar",
                                        "name": "string"
                                    },
                                    "signedPreKeyPublic": {
                                        "tag": "array",
                                        "type": {
                                            "tag": "scalar",
                                            "name": "u8"
                                        }
                                    },
                                    "signedPreKeySignature": {
                                        "tag": "array",
                                        "type": {
                                            "tag": "scalar",
                                            "name": "u8"
                                        }
                                    }
                                }
                            }
                        ]
                    }
                },
                "decrypt": {
                    "tag": "arrow",
                    "domain": {
                        "tag": "labeledProduct",
                        "fields": {
                            "data": {
                                "tag": "array",
                                "type": {
                                    "tag": "scalar",
                                    "name": "u8"
                                }
                            },
                            "from": {
                                "tag": "scalar",
                                "name": "string"
                            }
                        }
                    },
                    "codomain": {
                        "tag": "unlabeledProduct",
                        "items": [
                            {
                                "tag": "struct",
                                "name": "DecryptionResult",
                                "fields": {
                                    "content": {
                                        "tag": "option",
                                        "type": {
                                            "tag": "array",
                                            "type": {
                                                "tag": "scalar",
                                                "name": "u8"
                                            }
                                        }
                                    },
                                    "error": {
                                        "tag": "option",
                                        "type": {
                                            "tag": "scalar",
                                            "name": "string"
                                        }
                                    },
                                    "success": {
                                        "tag": "scalar",
                                        "name": "bool"
                                    }
                                }
                            }
                        ]
                    }
                },
                "encrypt": {
                    "tag": "arrow",
                    "domain": {
                        "tag": "labeledProduct",
                        "fields": {
                            "data": {
                                "tag": "array",
                                "type": {
                                    "tag": "scalar",
                                    "name": "u8"
                                }
                            },
                            "to": {
                                "tag": "scalar",
                                "name": "string"
                            },
                            "identity": {
                                "tag": "option",
                                "type": {
                                    "tag": "struct",
                                    "name": "Identity",
                                    "fields": {
                                        "preKeyPublic": {
                                            "tag": "array",
                                            "type": {
                                                "tag": "scalar",
                                                "name": "u8"
                                            }
                                        },
                                        "username": {
                                            "tag": "scalar",
                                            "name": "string"
                                        },
                                        "registrationId": {
                                            "tag": "scalar",
                                            "name": "u8"
                                        },
                                        "identityKey": {
                                            "tag": "array",
                                            "type": {
                                                "tag": "scalar",
                                                "name": "u8"
                                            }
                                        },
                                        "signedPreKeyId": {
                                            "tag": "scalar",
                                            "name": "u8"
                                        },
                                        "preKeyId": {
                                            "tag": "option",
                                            "type": {
                                                "tag": "scalar",
                                                "name": "u8"
                                            }
                                        },
                                        "id": {
                                            "tag": "scalar",
                                            "name": "string"
                                        },
                                        "signedPreKeyPublic": {
                                            "tag": "array",
                                            "type": {
                                                "tag": "scalar",
                                                "name": "u8"
                                            }
                                        },
                                        "signedPreKeySignature": {
                                            "tag": "array",
                                            "type": {
                                                "tag": "scalar",
                                                "name": "u8"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "codomain": {
                        "tag": "unlabeledProduct",
                        "items": [
                            {
                                "tag": "struct",
                                "name": "EncryptionResult",
                                "fields": {
                                    "content": {
                                        "tag": "option",
                                        "type": {
                                            "tag": "array",
                                            "type": {
                                                "tag": "scalar",
                                                "name": "u8"
                                            }
                                        }
                                    },
                                    "error": {
                                        "tag": "option",
                                        "type": {
                                            "tag": "scalar",
                                            "name": "string"
                                        }
                                    },
                                    "success": {
                                        "tag": "scalar",
                                        "name": "bool"
                                    }
                                }
                            }
                        ]
                    }
                },
                "get_identity": {
                    "tag": "arrow",
                    "domain": {
                        "tag": "nil"
                    },
                    "codomain": {
                        "tag": "unlabeledProduct",
                        "items": [
                            {
                                "tag": "struct",
                                "name": "Identity",
                                "fields": {
                                    "preKeyPublic": {
                                        "tag": "array",
                                        "type": {
                                            "tag": "scalar",
                                            "name": "u8"
                                        }
                                    },
                                    "username": {
                                        "tag": "scalar",
                                        "name": "string"
                                    },
                                    "registrationId": {
                                        "tag": "scalar",
                                        "name": "u8"
                                    },
                                    "identityKey": {
                                        "tag": "array",
                                        "type": {
                                            "tag": "scalar",
                                            "name": "u8"
                                        }
                                    },
                                    "signedPreKeyId": {
                                        "tag": "scalar",
                                        "name": "u8"
                                    },
                                    "preKeyId": {
                                        "tag": "option",
                                        "type": {
                                            "tag": "scalar",
                                            "name": "u8"
                                        }
                                    },
                                    "id": {
                                        "tag": "scalar",
                                        "name": "string"
                                    },
                                    "signedPreKeyPublic": {
                                        "tag": "array",
                                        "type": {
                                            "tag": "scalar",
                                            "name": "u8"
                                        }
                                    },
                                    "signedPreKeySignature": {
                                        "tag": "array",
                                        "type": {
                                            "tag": "scalar",
                                            "name": "u8"
                                        }
                                    }
                                }
                            }
                        ]
                    }
                },
                "get_username": {
                    "tag": "arrow",
                    "domain": {
                        "tag": "nil"
                    },
                    "codomain": {
                        "tag": "unlabeledProduct",
                        "items": [
                            {
                                "tag": "scalar",
                                "name": "string"
                            }
                        ]
                    }
                },
                "register_identity": {
                    "tag": "arrow",
                    "domain": {
                        "tag": "labeledProduct",
                        "fields": {
                            "identity": {
                                "tag": "struct",
                                "name": "Identity",
                                "fields": {
                                    "preKeyPublic": {
                                        "tag": "array",
                                        "type": {
                                            "tag": "scalar",
                                            "name": "u8"
                                        }
                                    },
                                    "username": {
                                        "tag": "scalar",
                                        "name": "string"
                                    },
                                    "registrationId": {
                                        "tag": "scalar",
                                        "name": "u8"
                                    },
                                    "identityKey": {
                                        "tag": "array",
                                        "type": {
                                            "tag": "scalar",
                                            "name": "u8"
                                        }
                                    },
                                    "signedPreKeyId": {
                                        "tag": "scalar",
                                        "name": "u8"
                                    },
                                    "preKeyId": {
                                        "tag": "option",
                                        "type": {
                                            "tag": "scalar",
                                            "name": "u8"
                                        }
                                    },
                                    "id": {
                                        "tag": "scalar",
                                        "name": "string"
                                    },
                                    "signedPreKeyPublic": {
                                        "tag": "array",
                                        "type": {
                                            "tag": "scalar",
                                            "name": "u8"
                                        }
                                    },
                                    "signedPreKeySignature": {
                                        "tag": "array",
                                        "type": {
                                            "tag": "scalar",
                                            "name": "u8"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "codomain": {
                        "tag": "unlabeledProduct",
                        "items": [
                            {
                                "tag": "struct",
                                "name": "RegisterResult",
                                "fields": {
                                    "error": {
                                        "tag": "option",
                                        "type": {
                                            "tag": "scalar",
                                            "name": "string"
                                        }
                                    },
                                    "success": {
                                        "tag": "scalar",
                                        "name": "bool"
                                    }
                                }
                            }
                        ]
                    }
                },
                "set_username": {
                    "tag": "arrow",
                    "domain": {
                        "tag": "labeledProduct",
                        "fields": {
                            "username": {
                                "tag": "scalar",
                                "name": "string"
                            }
                        }
                    },
                    "codomain": {
                        "tag": "nil"
                    }
                },
                "sign": {
                    "tag": "arrow",
                    "domain": {
                        "tag": "labeledProduct",
                        "fields": {
                            "data": {
                                "tag": "array",
                                "type": {
                                    "tag": "scalar",
                                    "name": "u8"
                                }
                            }
                        }
                    },
                    "codomain": {
                        "tag": "unlabeledProduct",
                        "items": [
                            {
                                "tag": "struct",
                                "name": "SignResult",
                                "fields": {
                                    "error": {
                                        "tag": "option",
                                        "type": {
                                            "tag": "scalar",
                                            "name": "string"
                                        }
                                    },
                                    "signature": {
                                        "tag": "option",
                                        "type": {
                                            "tag": "array",
                                            "type": {
                                                "tag": "scalar",
                                                "name": "u8"
                                            }
                                        }
                                    },
                                    "success": {
                                        "tag": "scalar",
                                        "name": "bool"
                                    }
                                }
                            }
                        ]
                    }
                },
                "verify": {
                    "tag": "arrow",
                    "domain": {
                        "tag": "labeledProduct",
                        "fields": {
                            "signature": {
                                "tag": "array",
                                "type": {
                                    "tag": "scalar",
                                    "name": "u8"
                                }
                            },
                            "data": {
                                "tag": "array",
                                "type": {
                                    "tag": "scalar",
                                    "name": "u8"
                                }
                            }
                        }
                    },
                    "codomain": {
                        "tag": "unlabeledProduct",
                        "items": [
                            {
                                "tag": "scalar",
                                "name": "bool"
                            }
                        ]
                    }
                },
                "verify_for": {
                    "tag": "arrow",
                    "domain": {
                        "tag": "labeledProduct",
                        "fields": {
                            "signature": {
                                "tag": "array",
                                "type": {
                                    "tag": "scalar",
                                    "name": "u8"
                                }
                            },
                            "data": {
                                "tag": "array",
                                "type": {
                                    "tag": "scalar",
                                    "name": "u8"
                                }
                            },
                            "id": {
                                "tag": "scalar",
                                "name": "string"
                            }
                        }
                    },
                    "codomain": {
                        "tag": "unlabeledProduct",
                        "items": [
                            {
                                "tag": "scalar",
                                "name": "bool"
                            }
                        ]
                    }
                }
            }
        }
    });
}
exports.registerSignal = registerSignal;
// Functions
