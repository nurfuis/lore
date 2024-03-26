const fs = require("fs");
const path = require("path");

function setRandomBackground(mainWindow, projectPath) {
  const backgroundPath = "/data/assets/images/backgrounds";
  const fullPath = path.join(projectPath, backgroundPath);

  fs.readdirSync(fullPath, (err, files) => {
    if (err) {
      console.error("Error reading background files:", err);
      return;
    }

    const backgroundImages = files.filter((file) => /\.(jpg|png)$/.test(file));

    if (backgroundImages.length === 0) {
      console.warn("No background images found in specified directory.");
      return;
    }

    // Get a random index within the valid image count
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    const currentBackground = path.join(backgroundImages[randomIndex]);
    const script = `
      document.body.style.backgroundImage = "url('../${backgroundPath}/${currentBackground}')";
    `;

    mainWindow.webContents.executeJavaScript(script);
  });
}

exports.setRandomBackground = setRandomBackground;
