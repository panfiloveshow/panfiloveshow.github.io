import { existsSync } from 'node:fs';
import { readdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';

const distDir = 'dist';
const removed = [];

async function removeFile(path) {
  if (!existsSync(path)) return;
  await unlink(path);
  removed.push(path);
}

async function removeMatchingFiles(dir, predicate) {
  if (!existsSync(dir)) return;

  const entries = await readdir(dir, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        await removeMatchingFiles(path, predicate);
        return;
      }
      if (entry.isFile() && predicate(path)) {
        await removeFile(path);
      }
    }),
  );
}

await removeMatchingFiles(join(distDir, 'visual-kit'), (path) => path.endsWith('.png'));
await removeFile(join(distDir, 'sellico-marketplace-os-hero.png'));

if (removed.length > 0) {
  console.log(`pruned ${removed.length} legacy asset(s) from dist`);
}
