export class Image {
  constructor() {}

  get(filename) {
    console.log();
    const imageData = electronAPI.getImage(filename);
    const base64Data = btoa(String.fromCharCode.apply(null, imageData)); // Convert Uint8Array to base64
    return `data:image/png;base64,${base64Data}`; // src
  }

  save(file) {
    electronAPI.saveImage(file.path);
  }
}
