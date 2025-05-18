# OP Explorer

 A web app to explore Optimism chains.

It's purpose is for me to explore all the pieces of the OP Stack. It's a reason for me to poke into all the functions of the contracts and other things like the format of the `extraData` field, etc. To that end it's scrappy code, written quickly with maximum delegation to AI (especially for the UI & design), and an unsustainable lack of tests. File an issue or submit a PR if you notice something broken.

Try it out: https://op-explorer.pauldowman.com/


# Help us build Optimism - we're hiring!

I'm hiring engineering roles for the Proofs team at OP Labs. Take a look at [our open roles](https://jobs.ashbyhq.com/oplabs), apply, and [get in touch with me](https://www.pauldowman.com/) if you have questions or to let me know you've applied.

## Running tests

1. Install dependencies with `npm install`.
2. Run the tests using `npm test`. This executes the Vitest suite in a jsdom environment.
   You can also run `npx vitest watch` to watch for changes during development.


 # To do

- [ ] Tests!
- [ ] Bridge info
- [ ] Things that involve sending txs
   - [ ] Prove withdrawals
   - [ ] Create dispute game claims
   - [ ] Create dispute games
