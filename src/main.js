const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const { DEFAULT_TEMPLATES } = require("./app/constants");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}
let mainWindow;
const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });
  mainWindow.setMenuBarVisibility(false);
  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  function backup() {
    try {
      fs.copyFileSync(tempFile, mainFile);
      console.log("Saved data to main file:", mainFile);
      // TODO save an additional backup file with date
    } catch (error) {
      console.error(
        "Error saving data to main file: No data or temp file was created."
      );
    }

    try {
      fs.copyFileSync(tempFile, backupFile);
      console.log("Saved data to backup file:", backupFile);

      // files were saved and backed up so remove temp file
      fs.unlinkSync(tempFile);
      console.log("Temporary file removed:", tempFile);
    } catch (error) {
      console.error(
        "Error saving data to backup file: No data or temp file was created."
      );
    }
  }

  backup();

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

//* FILE SAVING *//
const USER_DIR = "/data";
const BACKUP_DIR = "/backup";
let USER_PATH;
let userDataPath;
let dataDirPath;
let backupPath;

function setupLoreDir() {
  userDataPath = USER_PATH;
  dataDirPath = userDataPath + USER_DIR;
  backupPath = dataDirPath + BACKUP_DIR;
  try {
    if (!fs.existsSync(dataDirPath)) {
      fs.mkdirSync(dataDirPath);
      console.log("creating", userDataPath + dataDirPath);
    }
  } catch (err) {
    console.error("Error creating data directory:", err);
  }
  try {
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath);
      console.log("creating", backupPath);
    }
  } catch (err) {
    console.error("Error creating backup directory:", err);
  }
}

const LORE_LIBRARY = "/lib.json"; // + VERSION
const LORE_LIBRARY_TEMP = "/lib.temp.json";
const LORE_LIBRARY_BAK = "/lib." + Date.now() + ".bak.json";

let mainFile;
let tempFile;
let backupFile;

let loreData = {};
let backupLoreData = {};

function readLoreFile() {
  mainFile = dataDirPath + LORE_LIBRARY;
  tempFile = dataDirPath + LORE_LIBRARY_TEMP;
  backupFile = dataDirPath + BACKUP_DIR + LORE_LIBRARY_BAK;

  // Check for existing library
  try {
    loreData = JSON.parse(fs.readFileSync(mainFile, "utf-8"));
  } catch (err) {
    console.error("Error loading lore data:", err);

    // NO Library! Setup a new library...
    console.log("No main file was found, making new library");
    loreData["dateId"] = Date.now();

    fs.writeFile(mainFile, JSON.stringify(loreData), (err) => {
      if (err) {
        console.error("Error saving library:", err);
      } else {
        console.log("Lore lib created successfully!");
      }
    });
  }

  // check for a temp file
  try {
    // Attempt to read the temp file (will throw error if file doesn't exist)
    loreData = JSON.parse(fs.readFileSync(tempFile, "utf-8"));
    console.log("Loaded lore data from temp file");
    console.error("Error shutting down:");

    // Display alert about unexpected shutdown and corrupted data
    dialog
      .showMessageBox({
        type: "error",
        title: "Unexpected Shutdown Detected",
        message:
          "The app encountered an error loading lore data. It appears there was an unexpected shutdown last time. Please inspect and resolve the corrupted temp file manually, then remove it to launch the app successfully.",
        buttons: ["OK"],
        noLink: true,
      })
      .then(() => {
        // Exit the application after the user acknowledges the alert
        app.quit();
      });
  } catch (err) {
    // Check if the error is due to a non-existent file (ENOENT)
    if (err.code === "ENOENT") {
      console.log("No temp file found. Starting fresh.");
      /*       fs.writeFile(tempFile, JSON.stringify(loreData), (err) => {
        if (err) {
          console.error("Error saving templates:", err);
        } else {
          console.log("Lore lib.temp created successfully!");
        }
      }); */
    }
  }
  // create a backup file
  fs.writeFile(backupFile, JSON.stringify(loreData), (err) => {
    if (err) {
      console.error("Error saving backup:");
    } else {
      console.log("Backup created successfully!", backupFile);
    }
  });
}

//* HANDLE LORE REQUEST *//
ipcMain.on("request-lore-data", (event) => {
  // Respond to the synchronous request with the lore data
  event.returnValue = loreData;
});

//*HANDLE LORE SAVE *//
ipcMain.on("save-lore", (event, data) => {
  const filename = tempFile;

  // Write data to a JSON file
  fs.writeFile(filename, JSON.stringify(data), (err) => {
    if (err) {
      console.error("Error saving lore:", err);
      event.sender.send("save-failed"); // Send error message to renderer
    } else {
      console.log("Lore saved to temp file successfully!");
      event.sender.send("save-success", filename); // Send success message with filename

      // write data to loreData
      loreData = data;
    }
  });
});

// setup image saving
const ASSETS_PATH = "/assets";
const SPRITES_DIR = "/sprites";
const SPRITES_KEY = "sprite";
const PREVIEWS_DIR = "/previews";
const PREVIEWS_KEY = "preview";
const FULLSIZE_KEY = "full"
let assetsPath;
let spritesPath;
let previewsPath;

function setupSpritesDir() {
  assetsPath = dataDirPath + ASSETS_PATH;
  spritesPath = assetsPath + SPRITES_DIR;
  previewsPath = spritesPath + PREVIEWS_DIR;

  try {
    if (!fs.existsSync(assetsPath)) {
      fs.mkdirSync(assetsPath);
      console.log(`Created directory: ${assetsPath}`);
    }

    if (!fs.existsSync(spritesPath)) {
      fs.mkdirSync(spritesPath);
      console.log(`Created directory: ${spritesPath}`);
    }
    if (!fs.existsSync(previewsPath)) {
      fs.mkdirSync(previewsPath);
      console.log(`Created directory: ${previewsPath}`);
    }


  } catch (err) {
    console.error("Error creating directory:");
    // Optionally handle the error by exiting the application or notifying the user
  }
}

const SPRITE_LIBRARY = "/sprites.json";
let imageList;
let spritesData = {};

function readImageList() {
  imageList = dataDirPath + SPRITE_LIBRARY;
  console.log("image list", imageList);
  // Check for existing library and set value to contents or use defaults
  try {
    spritesData = JSON.parse(fs.readFileSync(imageList, "utf-8"));
  } catch (err) {
    console.error("Error loading sprites data:");
    spritesData[SPRITES_KEY] = {};
    fs.writeFile(imageList, JSON.stringify(spritesData), (err) => {
      if (err) {
        console.error("Error creating sprite list:");
      } else {
        console.log("Sprite list created succesfully!");
      }
    });
  }
}

//* HANDLE IMAGE REQUEST *//
ipcMain.on("request-image", (event, filename) => {
  // Respond to the synchronous request with the image data or error
  const imagePath = spritesData[SPRITES_KEY][filename][PREVIEWS_KEY]; //.preview
  console.log("requested image", imagePath);
  try {
    const image = fs.readFileSync(imagePath);
    event.returnValue = image;
  } catch (error) {
    console.error("Error loading image:", imagePath);
  }
});

//* HANDLE IMAGE SAVE *//
ipcMain.on("save-image", (event, filePath) => {
  const filename = path.basename(filePath);
  const imagePath = `${spritesPath}/${filename}`;

  // Proceed with image saving
  fs.readFile(filePath, (err, imageData) => {
    if (err) {
      console.error("Error reading image file:", err);
      return; // Exit on failure
    }

    // Create a preview image (adjust width/height as needed)
    sharp(imageData)
      .resize(156, 156) // Adjust width and height for your preview size
      .toBuffer((err, previewData) => {
        if (err) {
          console.error("Error creating preview:", err);
          // Handle preview creation error (optional)
        } else {
          // Save the preview image
          const previewPath = `${spritesPath}/previews/${filename}`;
          fs.writeFile(previewPath, previewData, (err) => {
            if (err) {
              console.error("Error saving preview image:", err);
              // Handle preview save error (optional)
            } else {
              console.log("Preview image saved successfully!", previewPath);
            }
          });
        }
      });

    fs.writeFile(imagePath, imageData, (err) => {
      if (err) {
        console.error("Error saving image:");
      } else {
        console.log("Image saved successfully!", imagePath);
        // update sprites library entry for new file
        try {
          // add two entries, one for fullSize, another for preview
          spritesData[SPRITES_KEY][filename] = {};
          spritesData[SPRITES_KEY][filename][PREVIEWS_KEY] = `${previewsPath}/${filename}`;


          fs.writeFile(imageList, JSON.stringify(spritesData), (err) => {
            if (err) {
              console.error("Error saving updated sprites data:");
              event.sender.send("save-failed");
            } else {
              console.log("sprites data updated with image reference!");
              event.sender.send("save-success");
            }
          });
        } catch (err) {
          console.error("Error updating sprites data:");
          event.sender.send("save-failed");
        }
      }
    });
  });
});

const TEMPLATES_FILE = "/templates.json";
let templatesPath;
let templateData = {};

function fillMissingLoreEntries() {
  const filledLoreData = Object.assign({}, loreData); // Create a copy of loreData
  for (const key in templateData.template) {
    if (!filledLoreData.hasOwnProperty(key)) {
      filledLoreData[key] = {}; // Add missing key with an empty string value
    }
  }
  loreData = filledLoreData;
}

function readTemplateFile() {
  templatesPath = dataDirPath + TEMPLATES_FILE;
  // Check for existing library and set value to contents or use defaults
  try {
    templateData = JSON.parse(fs.readFileSync(templatesPath, "utf-8"));
  } catch (err) {
    console.error("Error loading template data:");
    const preset = DEFAULT_TEMPLATES; // Assuming you have default templates
    templateData.template = preset;
    // Write data to the templates file
    fs.writeFile(templatesPath, JSON.stringify(templateData), (err) => {
      if (err) {
        console.error("Error saving templates:");
      } else {
        console.log("Templates saved successfully!");
      }
    });
  }
  fillMissingLoreEntries();
}

//* HANDLE TEMPLATE REQUEST *//
ipcMain.on("request-templates", (event) => {
  // Respond to the synchronous request with the template data
  event.returnValue = templateData.template; // Only return templates section
});

//*HANDLE TEMPLATE SAVE *//
ipcMain.on("save-templates", (event, data) => {
  // Ensure data contains only the templates section
  if (!data) {
    console.error("Invalid data format: Missing templates section");
    event.sender.send("save-failed", "Invalid data format"); // Send error message
    return;
  }

  templateData.template = data;

  // Write data to the templates file
  fs.writeFile(templatesPath, JSON.stringify(templateData), (err) => {
    if (err) {
      console.error("Error saving templates:");
      event.sender.send("save-failed", "Error saving templates");
    } else {
      console.log("Templates saved successfully!");
      event.sender.send("save-success"); // Send success message

      // update templateData with only templates section
    }
  });
});

function loadLibraryData() {
  setupLoreDir();
  readLoreFile();
  setupSpritesDir();
  readImageList();
  readTemplateFile();
}

function openDialog() {
  dialog
    .showOpenDialog({ properties: ["openDirectory"] })
    .then((result) => {
      if (result.filePaths.length === 1) {
        USER_PATH = result.filePaths[0];
        mainWindow.setTitle(USER_PATH + ": Fey Brewster Lore Library");
        loadLibraryData();
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

ipcMain.on("open-file-dialog", () => {
  openDialog();
});
