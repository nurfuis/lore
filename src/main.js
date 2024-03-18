const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const { DEFAULT_TEMPLATES } = require("./app/constants");
const { removeExtension } = require("./app/utils/removeExtension");

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

  mainWindow.webContents.openDevTools();
};

app.on("ready", () => {
  if (catalog.lore.temp.data) {
    handleTempFile()
      .then((tempFileHandledSuccessfully) => {
        if (tempFileHandledSuccessfully) {
          createWindow();
          console.log("Temp file handled successfully.");
        } else {
          console.warn("Quitting, user chose to exit for manual inspection.");
          app.quit();
        }
      })
      .catch((error) => {
        console.error("Unexpected error handling temporary file:", error);
        app.quit();
      });
  } else {
    createWindow();
  }
});

app.on("window-all-closed", () => {
  try {
    fs.copyFileSync(catalog.lore.temp.path, catalog.lore.main.path);
    console.log("Saved data to main file:", catalog.lore.main.path);

    // files were saved and backed up so remove temp file
    fs.unlinkSync(catalog.lore.temp.path);
    console.log("Temporary file removed:", catalog.lore.temp.path);
  } catch (error) {
    console.error("No data to write. Goodbye.");
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

const configFile = app.getPath("userData") + "/configLore.json";
checkConfig();
async function checkConfig() {
  try {
    if (fs.existsSync(configFile)) {
      const configData = JSON.parse(
        await fs.promises.readFile(configFile, "utf-8")
      );
      if (configData.hasOwnProperty("USER_PATH")) {
        console.log("User configured a directory: ", userPath);
        return configData.USER_PATH;
      }
    } else {
      writeConfig(app.getPath("userData"));
      console.log("New configuration.");
      return 
    }
  } catch (err) {
    console.error("Error checking config file:", err);
  }
}
async function writeConfig(path) {
  try {
    const defaultConfig = { USER_PATH: path };
    console.log(defaultConfig);
    await fs.promises.writeFile(
      configFile,
      JSON.stringify(defaultConfig, null, 2)
    );
    console.log("Config file updated.");
  } catch (err) {
    console.error("Error creating config file:", err);
  }
}

const _DIR = "/data";
const _BACKUP_DIR = "/backup";
const _ASSETS_DIR = "/assets";

const _SPRITES_DIR = "/sprites";
const _PREVIEWS_DIR = "/previews";

const SPRITES_KEY = "sprite";
const PREVIEWS_KEY = "preview";

const SPRITE_LIBRARY = "/sprites.json";
const TEMPLATES_FILE = "/templates.json";
const LORE_LIBRARY = "/lib.json";
const LORE_LIBRARY_TEMP = "/lib.temp.json";
const LORE_LIBRARY_BAK = "/lib." + Date.now() + ".bak.json";

//* LIBRARY CARD CATALOG *//
const catalog = initializeProjectDirectories();

function initializeProjectDirectories() {
  console.log("Initializing project directories...");

  const userAppDataPath = getUserDataPath();
  console.log("User Data Path:", userAppDataPath);

  const projectDataDirectory = createDirectoryIfNotExists(
    userAppDataPath,
    _DIR
  );
  console.log("Initialized project data directory:", projectDataDirectory);

  const backupDirectory = createDirectoryIfNotExists(
    projectDataDirectory,
    _BACKUP_DIR
  );
  console.log("Initialized backup directory:", backupDirectory);

  const assetsDirectory = createDirectoryIfNotExists(
    projectDataDirectory,
    _ASSETS_DIR
  );
  console.log("Initialized assets directory:", assetsDirectory);

  const spritesDirectory = createDirectoryIfNotExists(
    assetsDirectory,
    _SPRITES_DIR
  );
  console.log("Initialized sprites directory", spritesDirectory);

  const previewsPath = createDirectoryIfNotExists(
    spritesDirectory,
    _PREVIEWS_DIR
  );
  console.log("Initialized previews directory", previewsPath);

  const loreFiles = loadProjectData(projectDataDirectory);

  return loreFiles;
}
function getUserDataPath() {
  return app.getPath("userData");
}
function createDirectoryIfNotExists(baseDirectory, directoryName) {
  const fullDirectoryPath = path.join(baseDirectory, directoryName);
  if (!fs.existsSync(fullDirectoryPath)) {
    console.log("Attempting to create directory:", fullDirectoryPath);
    fs.mkdirSync(fullDirectoryPath);
  }
  return fullDirectoryPath;
}
function loadProjectData(__data) {
  const sprites = readSprites(__data);

  const templates = readTemplates(__data);

  const lore = readLore(__data, templates);

  return { lore, sprites, templates };
}
function readSprites(__data) {
  const spritesLibraryFile = __data + SPRITE_LIBRARY;
  console.log("Reading sprites file...");
  let results;
  try {
    results = JSON.parse(fs.readFileSync(spritesLibraryFile, "utf-8"));
    console.log("Success");
  } catch (err) {
    console.error("Error loading sprites data:", err);
    const resolution = newSprites(spritesLibraryFile);
    return {
      data: resolution,
      path: spritesLibraryFile,
      directory: __data + _ASSETS_DIR + _SPRITES_DIR,
    };
  }
  return {
    data: results,
    path: spritesLibraryFile,
    directory: __data + _ASSETS_DIR + _SPRITES_DIR,
  };
}
function newSprites(spritesLibraryFile) {
  let emptySpritesObject = {};
  emptySpritesObject[SPRITES_KEY] = {};
  fs.writeFile(
    spritesLibraryFile,
    JSON.stringify(emptySpritesObject),
    (err) => {
      if (err) {
        console.error("Error creating sprite list:", err);
      } else {
        console.log("Sprites library created succesfully.");
      }
    }
  );
  return emptySpritesObject;
}
function readTemplates(__data) {
  const templatesFile = __data + TEMPLATES_FILE;
  console.log("Reading templates file...");
  let results;
  try {
    results = JSON.parse(fs.readFileSync(templatesFile, "utf-8"));
    console.log("Success");
  } catch (err) {
    console.error("Error loading template data:", err);
    const preset = DEFAULT_TEMPLATES; // Assuming you have default templates
    results = preset;
    console.log("Creating new templates file.");
    fs.writeFile(templatesFile, JSON.stringify(results), (err) => {
      if (err) {
        console.error("Error saving templates:", err);
      } else {
        console.log("Templates saved successfully!");
      }
    });
  }
  return { data: results, path: templatesFile };
}
function fillMissingLoreEntries(loreData, templates) {
  const filledLoreData = Object.assign({}, loreData);
  for (const key in templates) {
    if (!filledLoreData.hasOwnProperty(key)) {
      filledLoreData[key] = {};
      console.log("Key added to lore library:", key);
    }
  }
  return filledLoreData;
}
function readLore(__data, templates) {
  console.log("Reading lore file...");

  const fileSet = {
    main: {
      data: undefined,
      path: __data + LORE_LIBRARY,
    },
    temp: {
      data: undefined,
      path: __data + LORE_LIBRARY_TEMP,
    },
    backup: {
      data: undefined,
      path: __data + _BACKUP_DIR + LORE_LIBRARY_BAK,
    },
  };
  // main
  try {
    fileSet.main.data = JSON.parse(fs.readFileSync(fileSet.main.path, "utf-8"));
    console.log("Success");
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log("No main file found, making new library", templates.data);
      const newLibrary = { dateId: Date.now() };
      fileSet.main.data = fillMissingLoreEntries(
        newLibrary,
        templates.data.template
      );
      console.log("main.data:", fileSet.main.data);
      fs.writeFile(
        fileSet.main.path,
        JSON.stringify(fileSet.main.data),
        (err) => {
          if (err) {
            console.error("Error saving library:", err);
            return; // Exit on error
          }
          console.log("Lore library created successfully.");
        }
      );
    } else {
      console.error("Error loading lore data.");
      return; // Exit on error
    }
  }
  // temp
  try {
    fileSet.temp.data = JSON.parse(fs.readFileSync(fileSet.temp.path, "utf-8"));
    console.log("Unsuccesful shutdown detected.");
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log("...");
    } else {
      console.error("Error reading temp file.");
    }
  }
  // backup
  console.log("Backing up loreData...");
  fs.writeFile(
    fileSet.backup.path,
    JSON.stringify(fileSet.main.data),
    (err) => {
      if (err) {
        console.error("Error saving backup:", err);
      } else {
        fileSet.backup.data = fileSet.main.data;
        console.log("Backup created successfully.", fileSet.backup.path);
      }
    }
  );
  return fileSet;
}
function handleTempFile() {
  return new Promise((resolve, reject) => {
    dialog
      .showMessageBox({
        type: "warning",
        title: "Temporary Data Found",
        message:
          "The Lore Library app discovered a temporary file that might contain unsaved changes. What would you like to do?",
        buttons: [
          "Overwrite Main File",
          "Proceed and Delete Temp",
          "Exit to Inspect Manually",
        ],
        noLink: true,
      })
      .then((choice) => {
        try {
          if (choice.response === 0) {
            // Overwrite main with temp
            fs.copyFileSync(catalog.lore.temp.path, catalog.lore.main.path);
            fs.unlinkSync(catalog.lore.temp.path);
            console.log("Temp data overwritten to main file.");
            resolve(true);
          } else if (choice.response === 1) {
            // Remove temp
            fs.unlinkSync(catalog.lore.temp.path);
            console.log("Temporary file removed.");
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (error) {
          reject(error);
        }
      });
  });
}

//* HANDLE LORE REQUEST *//
ipcMain.on("request-lore-data", (event) => {
  console.log("Checking for library data ...");
  console.log("Card Catalog:", catalog);
  if (catalog) {
    mainWindow.setTitle(catalog.lore.temp.path + ": Lore Library");
    event.returnValue = catalog.lore.main.data;
  }
});

//*HANDLE LORE SAVE *//
ipcMain.on("save-lore", (event, data) => {
  const filename = catalog.lore.temp.path;
  console.log("Writing changes to temp:", filename);
  fs.writeFile(filename, JSON.stringify(data), (err) => {
    if (err) {
      console.error("Error saving lore:", err);
      event.sender.send("save-failed");
    } else {
      event.sender.send("save-success", filename);
      catalog.lore.temp.data = data;
      console.log("Lore saved to temp file successfully.");
    }
  });
});

//* HANDLE IMAGE REQUEST *//
ipcMain.on("request-image", (event, fileIndex) => {
  console.log("Requested image fileIndex:", fileIndex);
  if (!catalog.sprites.data[SPRITES_KEY][fileIndex]) {
    console.log("Quitting, sprites list is corrupted.");
    app.quit();
  }

  const imagePath =
    catalog.sprites.directory +
    catalog.sprites.data[SPRITES_KEY][fileIndex][PREVIEWS_KEY];
  console.log("Image request recieved", imagePath);

  try {
    if (imagePath) {
      const image = fs.readFileSync(imagePath);
      event.returnValue = image;
    }
  } catch (error) {
    console.error("Error loading image");
  }
});

//* HANDLE IMAGE SAVE *//
ipcMain.on("save-image", (event, filePath) => {
  const filename = path.basename(filePath);
  const newImageFile = `${catalog.sprites.directory}/${filename}`;

  // Proceed with image saving
  fs.readFile(filePath, (err, imageData) => {
    if (err) {
      console.error("Error reading image file:", err);
      return; // Exit on failure
    }
    // Create a preview image (adjust width/height as needed)
    sharp(imageData)
      .resize(156, 156)
      .toBuffer((err, previewData) => {
        if (err) {
          console.error("Error creating preview:", err);
        } else {
          // Save the preview image
          const newImagePreview = `${catalog.sprites.directory}${_PREVIEWS_DIR}/${filename}`;
          fs.writeFile(newImagePreview, previewData, (err) => {
            if (err) {
              console.error("Error saving preview image:", err);
            } else {
              console.log("Preview image saved successfully!", newImagePreview);
            }
          });
        }
      });

    fs.writeFile(newImageFile, imageData, (err) => {
      if (err) {
        console.error("Error saving image:");
      } else {
        console.log("Image saved successfully!", newImageFile);
        try {
          // update catalog
          const fileIndex = removeExtension(filename);
          catalog.sprites.data[SPRITES_KEY][fileIndex] = {};
          catalog.sprites.data[SPRITES_KEY][fileIndex][
            PREVIEWS_KEY
          ] = `${_PREVIEWS_DIR}/${filename}`;

          fs.writeFile(
            catalog.sprites.path,
            JSON.stringify(catalog.sprites.data),
            (err) => {
              if (err) {
                console.error("Error saving updated sprites data:", err);
                event.sender.send("save-failed");
              } else {
                console.log(
                  "Sprites data updated with image reference:",
                  fileIndex
                );
                event.sender.send("save-success");
              }
            }
          );
        } catch (err) {
          console.error("Error updating sprites data:");
          event.sender.send("save-failed");
        }
      }
    });
  });
});

//* HANDLE TEMPLATE REQUEST *//
ipcMain.on("request-templates", (event) => {
  // Respond to the synchronous request with the template data
  if (catalog) {
    event.returnValue = catalog.templates.data.template;
  }
});

//*HANDLE TEMPLATE SAVE *//
ipcMain.on("save-templates", (event, data) => {
  // Ensure data contains only the templates section
  if (!data) {
    console.error("Invalid data format: Missing templates section");
    event.sender.send("save-failed", "Invalid data format"); // Send error message
    return;
  }

  const templateData = (catalog.templates.data.template = data);

  // Write data to the templates file
  fs.writeFile(catalog.templates.path, JSON.stringify(templateData), (err) => {
    if (err) {
      console.error("Error saving templates:");
      event.sender.send("save-failed", "Error saving templates");
    } else {
      console.log("Templates saved successfully!");
      event.sender.send("save-success"); // Send success message
    }
  });
});

ipcMain.on("open-file-dialog", () => {
  openDialog();
});

function openDialog() {
  dialog
    .showOpenDialog({ properties: ["openDirectory"] })
    .then((result) => {
      if (result.filePaths.length === 1) {

      }
    })
    .catch((err) => {
      console.log(err);
    });
}
