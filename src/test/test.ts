import { Signal } from '../signal';
async function main() {
    const a = await new Signal().build();
    const b = await new Signal().build();

    const result = await a.send("Heyy !", b.address, b.preKeyBundle);
    await b.receive(result!, a.address);

}

main();