import { runSeed } from "../lib/seed-categories-data";

runSeed()
  .then(() => {
    console.log("MAG sections and categories seeded.");
  })
  .catch(console.error)
  .finally(() => process.exit(0));
