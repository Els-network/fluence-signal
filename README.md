# Fluence Signal Service

Fluence is a decentralized ecosystem that use services host by nodes as backend.
This service enable signal identity, handshake, encryption and decryption via libsignal. 

## USAGE
**TS**
```ts
const peer = new FluencePeer();
const signal = new Signal(peer);
registerSignal(peer, signal);
// And now the service is implemented !
```
**AQUA**
```
func sendMessage(address: string, message: Message) -> bool:
    encrypted_message <- Signal.encrypt(peer, message)
    for x in address.devices:
        on x
            result <- Messenger.receive(encrypted_message)
    <- result
```


## API
