export function removeExtension(filename) {
  return filename.replace(/\.([^.]*)$/, '');
}
