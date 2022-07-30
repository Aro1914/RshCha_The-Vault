import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
const stdlib = loadStdlib(process.env);

const startingBalance = stdlib.parseCurrency(100);

const accAlice = await stdlib.newTestAccount(stdlib.parseCurrency(6000));
const accBob = await stdlib.newTestAccount(startingBalance);
console.log('The Story of The Vault!');

console.log('Launching...');
const ctcAlice = accAlice.contract(backend);
const ctcBob = accBob.contract(backend, ctcAlice.getInfo());

const getBalance = async (who) => stdlib.formatCurrency((await stdlib.balanceOf(who)));

console.log(`Alice's initial balance is: ${await getBalance(accAlice)}`);
console.log(`Bob's initial balance is: ${await getBalance(accBob)}`);

const sharedInterface = () => ({
  showDeadline: (deadline) => {
    console.log(parseInt(deadline));
  }
});

const declareQuest = () => {
  console.log(`Alice announces a new quest - The Vault with a bounty of 5000 to whoever completes it`);
  return stdlib.parseCurrency(5000);
};
console.log('Starting backends...');
await Promise.all([
  backend.Alice(ctcAlice, {
    ...stdlib.hasRandom,
    ...sharedInterface(),
    bounty: declareQuest(),
    decide: () => {
      const decision = Math.floor(Math.random() * 2);
      const statement = [`fulfill the terms of the quest`, `go back on her words`];
      console.log(`Alice decided to ${statement[decision]}`);
      return decision ? true : false;
    }
    // implement Alice's interact object here
  }),
  backend.Bob(ctcBob, {
    ...stdlib.hasRandom,
    ...sharedInterface(),
    // implement Bob's interact object here
    acceptQuest: (price) => {
      console.log(`Bob accepts the terms of The Vault quest for ${stdlib.formatCurrency(price)}`);
      console.log(`Bob completes the quest valiantly`);
      return true;
    },
    showStatus: (aliceDecision) => {
      if (!aliceDecision) {
        console.log(`Bob rejoices`);
      } else {
        console.log(`Poor Bob`);
      }
    }
  }),
]);

console.log(`Alice's final balance is: ${await getBalance(accAlice)}`);
console.log(`Bob's final balance is: ${await getBalance(accBob)}`);

console.log('The End!');
