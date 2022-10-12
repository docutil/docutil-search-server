import { createHash } from 'crypto';
import { createReadStream, stat } from 'fs-extra';

export interface IndexRecord {
  block: string;
  id: string;
  path: string;
}

export function checksum(str: string): string {
  const hash = createHash('sha1');
  hash.write(str);
  return hash.digest('hex');
}

export async function checksumFile(path: string): Promise<string> {
  const fileStat = await stat(path);
  if (!fileStat.isFile) {
    throw new Error('not a file');
  }

  const hash = createHash('sha1');
  const reader = createReadStream(path);

  return new Promise(resolve => {
    hash.setEncoding('hex');
    reader.pipe(hash, { end: false });
    reader.on('end', () => {
      hash.end();
      const result = hash.read();
      resolve(result);
    });
  });
}

export interface SiteConfig {
  repoUrl: string;
  path: string;
  docPath: string;
}

export function getConfig(key: string): SiteConfig {
  throw new Error('TODO');
}
