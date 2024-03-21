const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Menu,
  Notification,
} = require("electron");
const fs = require("fs");
const path = require("path");

const { DEFAULT_TEMPLATES } = require("./app/constants");
const { removeExtension } = require("./app/utils/removeExtension");
const { cycleBackgrounds } = require("./main/cycleBackgrounds");
const { toggleTheme } = require("./main/toggleTheme");

if (require("electron-squirrel-startup")) {
  app.quit();
}
const { DEV, DIST } = { DEV: "devMode", DIST: "distMode" };
/* To work around keeping files in the root for development I have added
   this branch in a couple key locations. Most noteably, the root directory is 
   different. 

   I am in the midst of creating an API for images to prefix with the correct
   directory by requesting the data from main process.

   I spent considerable time learning the ins and outs of where files are being
   stored.

   The dev server is being run from .webpack/ and files included in the dist can access
   relative filepaths so long as those files are present in the project
   during the make process.

   During dev, adding new files will force a reload. I have not been able to work around this.

   In the dist, files are behaving now, as long as I use the app.getPath() to return the
   appropriate location. For files in the renderer, I will allow them the new API to
   access the correct path. Adding a new image during runtime with a relative path it tries
   to access it from the deeply nested and unavaileble arsar package that is built.
   */



const userMode = DIST;

//* ENV *//
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = true;

let root;

if (userMode === DEV) {
  root = process.env.INIT_CWD;
} else if (userMode === DIST) {
  root = `${app.getPath("userData")}`;
}

const appIcon = path.join(root, "/data/assets/lore-library-icon-ai-1.png");
app.setAppUserModelId("Lore");

//* WINDOW *//
let mainWindow;
app.on("ready", () => {
  createWindow();
});
app.on("window-all-closed", () => {
  try {
    saveChanges({ reason: "exit" });
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
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    icon: appIcon,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });
  const menu = Menu.buildFromTemplate([
    {
      label: "Cycle Backgrounds",
      click: () => {
        cycleBackgrounds(mainWindow, root);
      },
    },
    {
      label: "Toggle Theme",
      click: () => {
        toggleTheme(mainWindow);
      },
    },
  ]);

  Menu.setApplicationMenu(menu);
  mainWindow.setMenuBarVisibility(true);
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.webContents.openDevTools();
}

//* DIRECTORY SETUP *//
const _DIR = "/data";
const _BACKUP_DIR = "/backup";
const BACKUP_ID = "o.o";
const _ASSETS_DIR = "/assets";
const _SPRITES_DIR = "/sprites";
const _PREVIEWS_DIR = "/previews";
const SPRITES_KEY = "sprite";
const PREVIEWS_KEY = "preview";
const SPRITE_LIBRARY = "/sprites.json";
const TEMPLATES_FILE = "/templates.json";
const LORE_LIBRARY = "/lib.json";
const LORE_LIBRARY_TEMP = "/lib.temp.json";
const LORE_LIBRARY_BAK = "/lib." + BACKUP_ID + ".bak.json";

//* LORE LIBRARY CARD CATALOG *//
let catalog; // TODO phasing this global out
/**
 * Card Catalog: Represents the loaded project data structure.
 *
 * @typedef {Object} CardCatalog
 * @property {Object} lore - Lore data for the project.
 *   @property {Object} lore.main - Main lore library.
 *     @property {Object} lore.main.data - The actual lore data loaded from the main library file.
 *     @property {string} lore.main.path - Path to the main lore library file (lib.json).
 *   @property {Object} lore.temp - Temporary lore data (might contain unsaved changes).
 *     @property {Object} [lore.temp.data] - Data loaded from the temporary library file,
 *                                          can be undefined if no temporary data exists.
 *     @property {string} lore.temp.path - Path to the temporary lore library file (lib.temp.json).
 *   @property {Object} lore.backup - Backup of the main lore data.
 *     @property {Object} lore.backup.data - The backed-up lore data loaded from the backup file.
 *     @property {string} lore.backup.path - Path to the backup lore library file (e.g., lib.1710806009709.bak.json).
 * @property {Object} sprites - Data related to the project's sprites.
 *   @property {Object} sprites.data - Object containing references to sprite image files.
 *     @property {Object} sprites.data.sprite - An object containing key-value pairs where keys are
 *                                             likely references to sprites and values are their details.
 *   @property {string} sprites.path - Path to the JSON file containing sprite data (sprites.json).
 *   @property {string} sprites.directory - Path to the directory containing the actual sprite image files.
 * @property {Object} templates - Project's lore entry templates.
 *   @property {Object} templates.data - The actual template data.
 *     @property {Object[]} templates.data.[sectionName] - Array containing template definitions for
 *                                                         specific sections (e.g., world, creature, item).
 *   @property {string} templates.path - Path to the JSON file containing template data (templates.json).
 */

ipcMain.on("load:lore-data-project-directory", (event) => {
  const sendCatalogSuccess = loreAppLoadProjectDirectory();
  event.returnValue = sendCatalogSuccess;
  console.log("Loading catalog data...", sendCatalogSuccess);
});

ipcMain.on("lore-data-save", (event, data) => {
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

ipcMain.on("save:lore-image", (event, filePath) => {
  saveImageData(event, filePath);
});

async function saveImageData(event, sourceFilePath) {
  console.log("Saving image data...");

  if (!(await isFileAccessible(sourceFilePath))) {
    console.error("Source file not found:", sourceFilePath);
    return;
  }

  const filename = path.basename(sourceFilePath);
  const newImageFilePath = path.join(catalog.sprites.directory, filename);

  const imageData = fs.readFileSync(sourceFilePath);

  if (userMode === DIST) {
    if (!(await writeImageData(newImageFilePath, imageData))) {
      return;
    }
  }

  if (!(await updateSpriteReferences(removeExtension(filename), filename))) {
    return;
  }

  console.log("Image saved successfully!", newImageFilePath);
  console.log(
    "Sprites data updated with full-size image reference:",
    removeExtension(filename)
  );

  if (userMode === DEV) {
    event.returnValue = path.join("../data/assets/sprites", filename);
  } else if (userMode === DIST) {
    event.returnValue = path.join(root, "/data/assets/sprites", filename);
  }
}
async function updateSpriteReferences(fileIndex, filename) {
  catalog.sprites.data[SPRITES_KEY][fileIndex] = {};
  catalog.sprites.data[SPRITES_KEY][fileIndex][PREVIEWS_KEY] = filename;

  try {
    await fs.promises.writeFile(
      catalog.sprites.path,
      JSON.stringify(catalog.sprites.data)
    );
    return true;
  } catch (err) {
    console.error("Error saving updated sprites data:", err);
    return false;
  }
}
async function writeImageData(filePath, imageData) {
  try {
    await fs.promises.writeFile(filePath, imageData);
    return true;
  } catch (err) {
    console.error("Error writing image data:", err);
    return false;
  }
}
async function isFileAccessible(filePath) {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

ipcMain.on("templates-save", (event, data) => {
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

//* SYSTEM COMMANDS *//

function loreAppLoadProjectDirectory() {
  console.log("Loading...");
  const catalogData = initializeProjectDirectories();
  catalog = catalogData;
  mainWindow.webContents.send("send:catalog-data", catalogData);
  mainWindow.webContents.send("send:current-directory", root);
  return true;
}
function saveChanges({ reason }) {
  try {
    // Copy the temporary data to the main file
    fs.copyFileSync(catalog.lore.temp.path, catalog.lore.main.path);
    console.log("Saved data to main file:", catalog.lore.main.path);

    // Files were saved and backed up, remove temporary file
    fs.unlinkSync(catalog.lore.temp.path);
    console.log("Temporary file removed:", catalog.lore.temp.path);

    showSavedNotification();
  } catch (error) {
    console.error("No changes to save.");
    if (reason == "save") {
      showNoDataSavedNotification();
    }
  }
}
function showSavedNotification() {
  new Notification({
    title: "Changes Saved",
    body: "Your lore data has been successfully saved.",
    icon: appIcon, // Replace with your app icon path
  }).show();
}
function showNoDataSavedNotification() {
  new Notification({
    title: "No Changes Detected",
    body: "There were no changes to save in your lore data.",
    icon: appIcon,
  }).show();
}
function resolveBadShutdown() {
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

//* LIBRARY BUILD SCRIPTS *//
function initializeProjectDirectories() {
  console.log("Process started from:", root);
  console.log("Initializing project directories...");

  const userAppDataPath = root;
  console.log("User Data Path:", userAppDataPath);

  const projectDataDirectory = tryMakeDirectory(userAppDataPath, _DIR);
  console.log("Initialized project data directory:", projectDataDirectory);

  const backupDirectory = tryMakeDirectory(projectDataDirectory, _BACKUP_DIR);
  console.log("Initialized backup directory:", backupDirectory);

  const assetsDirectory = tryMakeDirectory(projectDataDirectory, _ASSETS_DIR);
  console.log("Initialized assets directory:", assetsDirectory);

  const spritesDirectory = tryMakeDirectory(assetsDirectory, _SPRITES_DIR);
  console.log("Initialized sprites directory", spritesDirectory);

  const previewsPath = tryMakeDirectory(spritesDirectory, _PREVIEWS_DIR);
  console.log("Initialized previews directory", previewsPath);

  const loreFiles = readProjectData(projectDataDirectory);
  return loreFiles;
}
function tryMakeDirectory(baseDirectory, directoryName) {
  const fullDirectoryPath = path.join(baseDirectory, directoryName);
  if (!fs.existsSync(fullDirectoryPath)) {
    console.log("Make directory:", fullDirectoryPath);
    fs.mkdirSync(fullDirectoryPath);
  }
  return fullDirectoryPath;
}
function readProjectData(projectDataDirectory) {
  const sprites = readSprites(projectDataDirectory);
  const templates = readTemplates(projectDataDirectory);
  const lore = readLore(projectDataDirectory, templates);

  // loadSpriteData(sprites);
  return { lore, sprites, templates };

  function loadSpriteData(sprites) {
    for (const spriteName in sprites.data[SPRITES_KEY]) {
      const imagePath =
        sprites.directory +
        "/" +
        sprites.data[SPRITES_KEY][spriteName][PREVIEWS_KEY];
      fs.readFile(imagePath, (err, imageData) => {
        if (err) {
          console.error("Error reading image:", err);
        } else {
          const userData = app.getPath("userData") + "/images";
          // check if filename exists in the userData dir
          // write it to the userData dir if not exist

          console.log("Loading image:", userData, spriteName);
        }
      });
    }
  }
}
function readSprites(projectDataDirectory) {
  const spritesLibraryFile = projectDataDirectory + SPRITE_LIBRARY;
  console.log("Reading sprites file...");
  let results;
  try {
    results = JSON.parse(fs.readFileSync(spritesLibraryFile, "utf-8"));
    console.log("Success");
  } catch (err) {
    console.error("Error loading sprites data:", err);
    results = newSprites(spritesLibraryFile);
  }
  return {
    data: results,
    path: spritesLibraryFile,
    directory: projectDataDirectory + _ASSETS_DIR + _SPRITES_DIR,
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
function readTemplates(projectDataDirectory) {
  const templatesFile = projectDataDirectory + TEMPLATES_FILE;
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
function readLore(projectDataDirectory, templates) {
  console.log("Reading lore file...");

  const fileSet = {
    main: {
      data: undefined,
      path: projectDataDirectory + LORE_LIBRARY,
    },
    temp: {
      data: undefined,
      path: projectDataDirectory + LORE_LIBRARY_TEMP,
    },
    backup: {
      data: undefined,
      path: projectDataDirectory + _BACKUP_DIR + LORE_LIBRARY_BAK,
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
    resolveBadShutdown();
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log("Checking last shutdown...");
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
