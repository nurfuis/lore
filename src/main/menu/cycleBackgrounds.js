// const fs = require('fs');
// const path = require("path");

// let currentBackgroundIndex = 0;
// const backgroundPath = '/data/assets/images/backgrounds';

// function cycleBackgrounds(mainWindow, projectPath) {
//   const files = fs.readdirSync(path.join(projectPath, backgroundPath), (err, files) => {
//     if (err) {
//       console.error('Error reading background files:', err);
//       return;
//     }
//     return files;
//   });

//   const backgroundImages = files.filter((file) => /\.(jpg|png)$/.test(file));

//   if (backgroundImages.length === 0) {
//     console.warn('No background images found in specified directory.');
//     return;
//   }
//   currentBackgroundIndex =
//     (currentBackgroundIndex + 1) % backgroundImages.length;
//   const currentBackground = path.join(backgroundImages[currentBackgroundIndex]);
//   const script = `
//     document.body.style.backgroundImage = "url('../${backgroundPath}/${currentBackground}')";
//   `;
//   mainWindow.webContents.executeJavaScript(script);
// }
// exports.cycleBackgrounds = cycleBackgrounds;

// function setRandomBackground(mainWindow, projectPath) {
//   const backgroundPath = '/data/assets/images/backgrounds';
//   const fullPath = path.join(projectPath, backgroundPath);

//   fs.readdirSync(fullPath, (err, files) => {
//     if (err) {
//       console.error('Error reading background files:', err);
//       return;
//     }

//     const backgroundImages = files.filter((file) => /\.(jpg|png)$/.test(file));

//     if (backgroundImages.length === 0) {
//       console.warn('No background images found in specified directory.');
//       return;
//     }

//     // Get a random index within the valid image count
//     const randomIndex = Math.floor(Math.random() * backgroundImages.length);
//     const currentBackground = path.join(backgroundImages[randomIndex]);
//     const script = `
//       document.body.style.backgroundImage = "url('../${backgroundPath}/${currentBackground}')";
//     `;
//     mainWindow.webContents.executeJavaScript(script);
//   });
// }

// exports.setRandomBackground = setRandomBackground;
const fs = require('fs');
const path = require("path");

let currentBackgroundIndex = 0;
let hasInitialized = false; // Track if the background has been set initially
const backgroundPath = '/data/assets/images/backgrounds';

function cycleBackgrounds(mainWindow, projectPath) {
  const files = fs.readdirSync(path.join(projectPath, backgroundPath), (err, files) => {
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

  if (!hasInitialized) {
    // Set a random background for the first load
    currentBackgroundIndex = Math.floor(Math.random() * backgroundImages.length);
    hasInitialized = true; // Mark as initialized
  } else {
    // Cycle to the next background normally
    currentBackgroundIndex = (currentBackgroundIndex + 1) % backgroundImages.length;
  }

  const currentBackground = path.join(backgroundImages[currentBackgroundIndex]);
  const script = `
    document.body.style.backgroundImage = "url('../${backgroundPath}/${currentBackground}')";
  `;
  mainWindow.webContents.executeJavaScript(script);
}

exports.cycleBackgrounds = cycleBackgrounds;
