let currentBackgroundIndex = 0;
let hasInitialized = false; // Track if the background has been set initially

const backgroundImages = [
  "background0",
  "background1",
  "background2",
  "background3",
  "background4",
  "background5",
  "background6",
  "background7",
  "background8",
  "background9",
  "background10",
  "background11",
  "background12",
  "background13",
];
function cycleBackgrounds(mainWindow) {
  if (!hasInitialized) {
    // Set a random background for the first load
    currentBackgroundIndex = Math.floor(
      Math.random() * backgroundImages.length
    );
    const currentBackground = backgroundImages[currentBackgroundIndex];

    const initScript = `document.body.classList.add('${currentBackground}');`;
    mainWindow.webContents.executeJavaScript(initScript);

    hasInitialized = true; // Mark as initialized
  } else {
    // Cycle to the next background normally
    const removeBackground = backgroundImages[currentBackgroundIndex];

    currentBackgroundIndex =
      (currentBackgroundIndex + 1) % backgroundImages.length;

    const currentBackground = backgroundImages[currentBackgroundIndex];
    let script = `document.body.classList.remove('${removeBackground}');`;
    script += `document.body.classList.add('${currentBackground}');`;
    mainWindow.webContents.executeJavaScript(script);
  }
}

exports.cycleBackgrounds = cycleBackgrounds;
