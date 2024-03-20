const fs = require('fs');

let currentBackgroundIndex = 0;
const backgroundPath = '/data/assets/images/backgrounds/';
function cycleBackgrounds(mainWindow, root) {
  const files = fs.readdirSync(root + backgroundPath, (err, files) => {
    if (err) {
      console.error('Error reading background files:', err);
      return;
    }
    return files;
  });

  const backgroundImages = files.filter((file) => /\.(jpg|png)$/.test(file));

  if (backgroundImages.length === 0) {
    console.warn('No background images found in specified directory.');
    return;
  }
  currentBackgroundIndex =
    (currentBackgroundIndex + 1) % backgroundImages.length;
  const currentBackground = backgroundImages[currentBackgroundIndex];
  const script = `
    document.body.style.backgroundImage = "url('${backgroundPath}${currentBackground}')";
  `;
  mainWindow.webContents.executeJavaScript(script);
}
exports.cycleBackgrounds = cycleBackgrounds;
