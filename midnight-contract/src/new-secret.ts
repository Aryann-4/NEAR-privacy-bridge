// Generate a fresh bridge secret and print both domain-separated commitments.
// Use the NEAR commitment for `deposit` and the Midnight commitment for the
// relayer's `register` call. Keep the secret private.

import { randomBytes } from 'node:crypto';
import { nearCommitment, midnightCommitment, toHex } from './common.js';

const secret = randomBytes(32);
console.log(`secret:     ${toHex(secret)}`);
console.log(`near:       ${nearCommitment(secret)}`);
console.log(`midnight:   ${toHex(midnightCommitment(secret))}`);
