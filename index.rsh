'reach 0.1';

const [DEADLINE, sharedInterface] = [20, {
  showDeadline: Fun([UInt], Null)
}];

export const main = Reach.App(() => {
  const A = Participant('Alice', {
    // Specify Alice's interact interface here
    ...sharedInterface,
    decide: Fun([], Bool),
    bounty: UInt,
  });
  const B = Participant('Bob', {
    // Specify Bob's interact interface here
    ...sharedInterface,
    acceptQuest: Fun([UInt], Bool),
    showStatus: Fun([Bool], Null),
  });
  init();
  // The first one to publish deploys the contract
  A.only(() => {
    const bounty = declassify(interact.bounty);
  });
  A.publish(bounty).pay(bounty);
  commit();
  // The second one to publish always attaches
  B.only(() => {
    const consent = declassify(interact.acceptQuest(bounty));
  });
  B.publish(consent);
  commit();

  each([A, B], () => {
    interact.showDeadline(DEADLINE);
  });

  A.only(() => {
    const decision = declassify(interact.decide());
  });
  A.publish(decision);

  if (decision) {
    transfer(bounty).to(A);
    B.only(() => {
      interact.showStatus(decision);
    });
  } else {
    transfer(bounty).to(B);
    B.only(() => {
      interact.showStatus(decision);
    });
  }
  // write your program here
  commit();
  exit();
});
