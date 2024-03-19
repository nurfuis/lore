
export class Sprites {
  constructor() {}

  get(filename) {
    console.log(this.list)

    const imageData = request.getImage(filename);
    const base64Data = btoa(String.fromCharCode.apply(null, imageData)); // Convert Uint8Array to base64
    return `data:image/png;base64,${base64Data}`; // src
  }
  save(file) {
    window.electronAPI.saveImage(file.path);
  }
}
