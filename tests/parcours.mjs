import {randomUUID} from 'node:crypto';
process.env.ESCALE_TEST_SESSION='e2e-'+randomUUID();
await import('./parcours-scenario.mjs');
