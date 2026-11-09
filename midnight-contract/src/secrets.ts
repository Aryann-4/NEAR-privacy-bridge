// Local-only bridge secrets. Never commit this file.
//
// The relayer admin secret authorizes `register` on the Midnight contract.
// The demo user secret is used by the end-to-end demo; real users generate
// their own secret in the browser.

import * as fs from 'node:fs';
import * as path from 'node:path';
import { randomBytes } from 'node:crypto';

const SECRETS_FILE = '.bridge-secrets.json';

export interface BridgeSecrets {
  adminSecret?: string;
  demoUserSecret?: string;
  demoNearCommitment?: string;
  demoMidnightCommitment?: string;
}

function secretsPath(cwd = process.cwd()): string {
  return path.join(cwd, SECRETS_FILE);
}

export function loadSecrets(cwd = process.cwd()): BridgeSecrets {
  const file = secretsPath(cwd);
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as BridgeSecrets;
  } catch {
    return {};
  }
}

export function saveSecrets(secrets: BridgeSecrets, cwd = process.cwd()): void {
  const file = secretsPath(cwd);
  const tmp = `${file}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tmp, `${JSON.stringify(secrets, null, 2)}\n`, { mode: 0o600 });
  fs.renameSync(tmp, file);
}

function parseHex32(value: string, label: string): Uint8Array {
  const hex = value.trim().replace(/^0x/i, '');
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error(`${label} must be 32 bytes (64 hex characters)`);
  }
  return Uint8Array.from(Buffer.from(hex, 'hex'));
}

export function getOrCreateAdminSecret(cwd = process.cwd()): Uint8Array {
  const env = process.env.BRIDGE_ADMIN_SECRET;
  if (env) return parseHex32(env, 'BRIDGE_ADMIN_SECRET');

  const secrets = loadSecrets(cwd);
  if (secrets.adminSecret) {
    return parseHex32(secrets.adminSecret, 'stored admin secret');
  }

  const secret = randomBytes(32);
  secrets.adminSecret = secret.toString('hex');
  saveSecrets(secrets, cwd);
  return Uint8Array.from(secret);
}

export function getOrCreateDemoUserSecret(cwd = process.cwd()): Uint8Array {
  const env = process.env.BRIDGE_DEMO_SECRET;
  if (env) return parseHex32(env, 'BRIDGE_DEMO_SECRET');

  const secrets = loadSecrets(cwd);
  if (secrets.demoUserSecret) {
    return parseHex32(secrets.demoUserSecret, 'stored demo secret');
  }

  const secret = randomBytes(32);
  secrets.demoUserSecret = secret.toString('hex');
  saveSecrets(secrets, cwd);
  return Uint8Array.from(secret);
}

export function recordDemoCommitments(
  nearCommitment: string,
  midnightCommitment: string,
  cwd = process.cwd(),
): void {
  const secrets = loadSecrets(cwd);
  secrets.demoNearCommitment = nearCommitment;
  secrets.demoMidnightCommitment = midnightCommitment;
  saveSecrets(secrets, cwd);
}
