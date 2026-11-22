import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(root, 'public/photos');
const outputRoot = path.join(root, 'public/photo-variants');
const writingRoot = path.join(root, 'public/writings');
const writingOutputRoot = path.join(root, 'public/writing-variants');
const metadataFile = path.join(root, 'photos/metadata.json');
const extensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const sizes = [480, 1600];

const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
const sources = [];

for (const entry of fs.readdirSync(sourceRoot, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
  const files = fs.readdirSync(path.join(sourceRoot, entry.name))
    .filter((file) => extensions.has(path.extname(file).toLowerCase()))
    .sort();

  for (const file of files) {
    const relative = `${entry.name}/${file}`;
    if (!metadata[relative]) {
      throw new Error(`Add dimensions and alt text for ${relative} to photos/metadata.json`);
    }
    sources.push({ slug: entry.name, file, relative, input: path.join(sourceRoot, entry.name, file) });
  }
}

const sourceKeys = new Set(sources.map(({ relative }) => relative));
const staleMetadata = Object.keys(metadata).filter((relative) => !sourceKeys.has(relative));
if (staleMetadata.length > 0) {
  throw new Error(`Remove metadata for photos that no longer exist: ${staleMetadata.join(', ')}`);
}

const handwritingSources = [];
if (fs.existsSync(writingRoot)) {
  for (const entry of fs.readdirSync(writingRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    const directory = path.join(writingRoot, entry.name);
    for (const file of fs.readdirSync(directory).sort()) {
      if (!['.png', '.jpg', '.jpeg'].includes(path.extname(file).toLowerCase())) continue;
      handwritingSources.push({ slug: entry.name, file, input: path.join(directory, file) });
    }
  }
}

const allSources = [...sources.map(({ input }) => input), ...handwritingSources.map(({ input }) => input)];
const filesToSanitize = allSources.filter((input) => {
  const fields = execFileSync('exiftool', [
    '-G1', '-s', '-EXIF:all', '-IPTC:all', '-XMP:all', '-GPS:all', input,
  ], { encoding: 'utf8' });
  return fields.split('\n').some((line) => line.trim() && !/\bOrientation\s*:/.test(line));
});
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'timforrer-photo-profiles-'));
const profiles = new Map();
for (const [index, input] of allSources.entries()) {
  const profile = execFileSync('exiftool', ['-ICC_Profile', '-b', input]);
  if (profile.length === 0) continue;
  const profileFile = path.join(tempRoot, `${index}.icc`);
  fs.writeFileSync(profileFile, profile);
  profiles.set(input, profileFile);
}

// Remove private metadata from source assets while retaining the non-sensitive
// orientation and color profile needed to render photos consistently.
if (filesToSanitize.length > 0) {
  execFileSync('exiftool', [
    '-q',
    '-all=',
    '-tagsfromfile', '@',
    '-Orientation',
    '-overwrite_original',
    ...filesToSanitize,
  ], { stdio: 'inherit' });
}

for (const [input, profileFile] of profiles) {
  execFileSync('exiftool', [`-ICC_Profile<=${profileFile}`, '-overwrite_original', input], {
    stdio: 'inherit',
  });
}

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.rmSync(writingOutputRoot, { recursive: true, force: true });

for (const { slug, file, input } of sources) {
  const outputDirectory = path.join(outputRoot, slug);
  fs.mkdirSync(outputDirectory, { recursive: true });

  for (const width of sizes) {
    const output = path.join(outputDirectory, `${file}.${width}.webp`);
    execFileSync('magick', [
      input,
      '-auto-orient',
      '-resize', `${width}x>`,
      '-quality', width === 480 ? '82' : '88',
      '-define', 'webp:method=6',
      '-strip',
      output,
    ], { stdio: 'inherit' });
    const profileFile = profiles.get(input);
    if (profileFile) {
      execFileSync('exiftool', [`-ICC_Profile<=${profileFile}`, '-overwrite_original', output], {
        stdio: 'inherit',
      });
    }
  }
}

for (const { slug, file, input } of handwritingSources) {
  const outputDirectory = path.join(writingOutputRoot, slug);
  fs.mkdirSync(outputDirectory, { recursive: true });
  const output = path.join(outputDirectory, `${file}.webp`);
  execFileSync('magick', [
    input,
    '-auto-orient',
    '-resize', '1600x>',
    '-define', 'webp:lossless=true',
    '-define', 'webp:method=6',
    '-strip',
    output,
  ], { stdio: 'inherit' });
  const profileFile = profiles.get(input);
  if (profileFile) {
    execFileSync('exiftool', [`-ICC_Profile<=${profileFile}`, '-overwrite_original', output], {
      stdio: 'inherit',
    });
  }
}

fs.rmSync(tempRoot, { recursive: true, force: true });
console.log(`Prepared ${sources.length} photos and ${handwritingSources.length} handwriting scans.`);
