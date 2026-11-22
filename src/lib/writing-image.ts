import fs from 'node:fs';
import path from 'node:path';

/** Map a public handwriting scan to its prepared, lossless WebP derivative. */
export function writingImagePath(source: string): string {
  return source.replace(/^\/writings\//, '/writing-variants/') + '.webp';
}

export function assertWritingImageVariants(sources: string[]): void {
  for (const source of sources) {
    const output = writingImagePath(source);
    const file = path.resolve(process.cwd(), 'public', output.slice(1));
    if (!fs.existsSync(file)) {
      throw new Error(`Missing prepared handwriting image ${output}; run npm run photos:prepare`);
    }
  }
}
