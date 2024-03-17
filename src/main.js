const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const { DEFAULT_TEMPLATES } = require("./app/constants");

if (require("electron-squirrel-startup")) {
  app.quit();
}
let mainWindow;
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // mainWindow.webContents.openDevTools();
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  try {
    fs.copyFileSync(tempFile, mainFile);
    console.log("Saved data to main file:", mainFile);

    // files were saved and backed up so remove temp file
    fs.unlinkSync(tempFile);
    console.log("Temporary file removed:", tempFile);
  } catch (error) {
    console.error(
      "Error saving data to main file: No data or temp file was created."
    );
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

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
  // TODO offer an option to write the tempFile to main and set loreData with tempData or to quit and inspect manually
  try {
    const tempData = JSON.parse(fs.readFileSync(tempFile, "utf-8"));

    dialog
      .showMessageBox({
        type: "warning",
        title: "Temporary Data Found",
        message:
          "The app discovered a temporary file that might contain unsaved changes. What would you like to do?",
        buttons: [
          "Overwrite Main File",
          "Proceed and Delete Temp",
          "Exit to Inspect Manually",
        ],
        noLink: true,
      })
      .then((choice) => {
        if (choice.response === 0) {
          // Overwrite main file
          fs.copyFileSync(tempFile, mainFile);
          console.log("Temp data overwritten to main file.");
          loreData = tempData;
        } else if (choice.response === 1) {
          // Proceed and delete temp
          fs.unlinkSync(tempFile);
          console.log("Temporary file removed.");
        } else {
          // Exit to inspect manually
          console.log("Exiting for manual inspection.");
          app.quit();
        }
      });
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log("No temp file found. Starting fresh.");
    } else {
      console.error("Error reading temp file:", err);
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
  mainWindow.setTitle(USER_PATH + " : Lore Library");

  console.log("Checking for data library...");
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
const FULLSIZE_KEY = "full";
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
  // console.log("image list", imageList);
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
          spritesData[SPRITES_KEY][filename][
            PREVIEWS_KEY
          ] = `${previewsPath}/${filename}`;

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

function openDialog() {
  dialog
    .showOpenDialog({ properties: ["openDirectory"] })
    .then((result) => {
      if (result.filePaths.length === 1) {
        setUserDir(result.filePaths[0]);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

ipcMain.on("open-file-dialog", () => {
  openDialog();
});

function loadLibraryData() {
  setupLoreDir();
  readLoreFile();
  setupSpritesDir();
  readImageList();
  readTemplateFile();
  console.log("library was loaded");
}

const configPath = app.getPath("userData") + "/config.json";

async function createDefaultConfig(userPath) {
  try {
    const defaultConfig = { USER_PATH: userPath };

    await fs.promises.writeFile(
      configPath,
      JSON.stringify(defaultConfig, null, 2)
    );
    console.log("Config file created successfully.");
  } catch (err) {
    console.error("Error creating config file:", err);
  }
}

async function setUserDir(path) {
  try {
    if (fs.existsSync(configPath)) {
      const configData = JSON.parse(
        await fs.promises.readFile(configPath, "utf-8")
      );
      if (configData.USER_PATH !== path) {
        // Update if new path is different
        configData.USER_PATH = path;
        await fs.promises.writeFile(
          configPath,
          JSON.stringify(configData, null, 2)
        );
        console.log("Config file updated with new user path.");
        mainWindow.close();
        createWindow();  
      }
    } else {
      // Create config if it doesn't exist
      await createDefaultConfig(path);
    }

    USER_PATH = path; // Set global variable
    loadLibraryData();
  } catch (err) {
    console.error("Error handling configuration:", err);
  }
}
async function checkConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const configData = JSON.parse(
        await fs.promises.readFile(configPath, "utf-8")
      );
      if (configData.hasOwnProperty("USER_PATH")) {
        setUserDir(configData.USER_PATH);
        console.log("user dir: ", configData.USER_PATH);
      }
    } else {
      console.log("No config file found.");
    }
  } catch (err) {
    console.error("Error checking config file:", err);
  }
}
checkConfig();
