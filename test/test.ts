import { Signal } from '../src/signal';
import { PeerIdToNumber } from '../src/util';

(async () => {
    const account = await Signal.create(PeerIdToNumber("12D3KooWGqLRh7ephmoWyCYwRk7VHEquYsMPQpAuiWLLDyYVmHbk"));
    console.log(account);
})();