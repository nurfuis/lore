/**
 * catalog: Represents the loaded project data structure.
 *
 * @typedef {Object} catalog
 * @property {Object} lore - Lore data for the project.
 *   @property {Object} lore.main - Main lore library.
 *     @property {Object} lore.main.data - The actual lore data loaded from the main library file.
 *     @property {string} lore.main.path - Path to the main lore library file (lib.json).
 *   @property {Object} lore.temp - Temporary lore data (might contain unsaved changes).
 *     @property {Object} [lore.temp.data] - Data loaded from the temporary library file, can be undefined if no temporary data exists.
 *     @property {string} lore.temp.path - Path to the temporary lore library file (lib.temp.json).
 *   @property {Object} lore.backup - Backup of the main lore data.
 *     @property {Object} lore.backup.data - The backed-up lore data loaded from the backup file.
 *     @property {string} lore.backup.path - Path to the backup lore library file (e.g., lib.1710806009709.bak.json).
 * @property {Object} sprites - Data related to the project's sprites.
 *   @property {Object} sprites.data - Object containing references to sprite image files.
 *     @property {Object} sprites.data.sprite - An object containing key-value pairs where keys are references to sprites and values are their details.
 *   @property {string} sprites.path - Path to the JSON file containing sprite data (sprites.json).
 *   @property {string} sprites.directory - Path to the directory containing the actual sprite image files.
 * @property {Object} templates - Project's lore entry templates.
 *   @property {Object} templates.data - The actual template data.
 *     @property {Object[]} templates.data.[sectionName] - Array containing template definitions for specific sections (e.g., world, creature, item).
 *   @property {string} templates.path - Path to the JSON file containing template data (templates.json).
 */
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
if (require("electron-squirrel-startup")) {
  app.quit();
}
const { APP_ICON, DEV, DIST } = require("./main/settings/appConfiguration");
const {
  SPRITES_KEY,
  PREVIEWS_KEY,
  _DIR,
  _BACKUP_DIR,
  _ASSETS_DIR,
  _SPRITES_DIR,
  _PREVIEWS_DIR,
  SPRITE_LIBRARY,
  TEMPLATES_FILE,
  LORE_LIBRARY,
  LORE_LIBRARY_TEMP,
  LORE_LIBRARY_BAK,
} = require("./main/settings/directoryConfiguration");
const { DEFAULT_TEMPLATES } = require("./main/settings/templatesConfiguration");
const { removeExtension } = require("./main/utils/removeExtension");
const { cycleBackgrounds } = require("./main/menu/cycleBackgrounds");
const { toggleTheme } = require("./main/menu/toggleTheme");

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = true;

app.setAppUserModelId("Lore");

const userMode = DEV;

const root = getRoot(userMode);

function getRoot(userMode) {
  console.log("User mode:", userMode);

  if (userMode === DEV && DEV != undefined) {
    return `${process.env.INIT_CWD}`;
  } else if (userMode === DIST) {
    return `${app.getPath("userData")}`;
  } else {
    console.error("Undetected user mode, quitting app...:", userMode);
    app.quit();
  }
}

const appIcon = path.join(root, APP_ICON);

const DEFAULT_WINDOW_OPTIONS = {
  width: 900,
  height: 600,
  icon: appIcon,
  webPreferences: {
    preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
  },
};

app.on("ready", () => {
  const mainWindow = new BrowserWindow(DEFAULT_WINDOW_OPTIONS);

  createWindow(mainWindow);

  ipcMain.on("load:lore-data-project-directory", (event) => {
    const isLoaded = loadLoreCatalog();

    event.returnValue = isLoaded;

    console.log("Loading catalog data...", isLoaded);
  });

  function loadLoreCatalog() {
    console.log("Loading...");

    const catalogData = new Library().initializeProjectDirectories(root);

    const catalog = new Catalog(userMode, root, catalogData);

    mainWindow.webContents.send("send:catalog-data", catalog);
    mainWindow.webContents.send("send:current-directory", root);
    return true;
  }
});

app.on("window-all-closed", () => {
  try {
    saveChanges({ reason: "exit" });
    function saveChanges({ reason }) {
      const mainFile = path.join(root, _DIR, LORE_LIBRARY);
      const tempFile = path.join(root, _DIR, LORE_LIBRARY_TEMP);

      try {
        fs.copyFileSync(tempFile, mainFile);
        console.log("Saved data to main file...", mainFile);

        fs.unlinkSync(tempFile);
        console.log("Temporary file removed...", tempFile);

        showSavedNotification();
        function showSavedNotification() {
          new Notification({
            title: "Changes Saved",
            body: "Your lore data has been successfully saved.",
            icon: appIcon,
          }).show();
        }
      } catch (error) {
        console.error("No changes to save.");
        if (reason == "save") {
          showNoDataSavedNotification();
          function showNoDataSavedNotification() {
            new Notification({
              title: "No Changes Detected",
              body: "There were no changes to save in your lore data.",
              icon: appIcon,
            }).show();
          }
        }
      }
    }
  } catch (error) {
    console.error("No data to write. Goodbye.");
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    const mainWindow = new BrowserWindow(DEFAULT_WINDOW_OPTIONS);
    createWindow(mainWindow);
  }
});

class Library {
  constructor() {}
  initializeProjectDirectories(root) {
    console.log("Process started from:", root);
    console.log("Initializing project directories...");

    const userAppDataPath = root;
    console.log("User Data Path:", userAppDataPath);

    const projectDataDirectory = this.tryMakeDirectory(userAppDataPath, _DIR);
    console.log("Initialized project data directory:", projectDataDirectory);

    const backupDirectory = this.tryMakeDirectory(
      projectDataDirectory,
      _BACKUP_DIR
    );
    console.log("Initialized backup directory:", backupDirectory);

    const assetsDirectory = this.tryMakeDirectory(
      projectDataDirectory,
      _ASSETS_DIR
    );
    console.log("Initialized assets directory:", assetsDirectory);

    const spritesDirectory = this.tryMakeDirectory(
      assetsDirectory,
      _SPRITES_DIR
    );
    console.log("Initialized sprites directory", spritesDirectory);

    const previewsPath = this.tryMakeDirectory(spritesDirectory, _PREVIEWS_DIR);
    console.log("Initialized previews directory", previewsPath);

    // Directories are ready, load the project data
    const loreFiles = this.readProjectData(projectDataDirectory);

    return loreFiles;
  }
  readProjectData(projectDataDirectory) {
    const sprites = this.readSprites(projectDataDirectory);
    const templates = this.readTemplates(projectDataDirectory);
    const lore = this.readLore(projectDataDirectory, templates);

    return { lore, sprites, templates };
  }
  readSprites(projectDataDirectory) {
    const spritesLibraryFile = projectDataDirectory + SPRITE_LIBRARY;
    console.log("Reading sprites file...");
    let results;
    try {
      results = JSON.parse(fs.readFileSync(spritesLibraryFile, "utf-8"));
      console.log("Success");
    } catch (err) {
      console.error("Error loading sprites data:", err);
      results = this.newSpritesManifest(spritesLibraryFile);
    }
    return {
      data: results,
      path: spritesLibraryFile,
      directory: projectDataDirectory + _ASSETS_DIR + _SPRITES_DIR,
    };
  }
  newSpritesManifest(spritesLibraryFile) {
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
  readTemplates(projectDataDirectory) {
    const templatesFile = projectDataDirectory + TEMPLATES_FILE;
    console.log("Reading templates file...");
    let results;
    try {
      results = JSON.parse(fs.readFileSync(templatesFile, "utf-8"));
      console.log("Success");
    } catch (err) {
      console.error("Error loading template data:", err);
      const preset = DEFAULT_TEMPLATES;
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
  readLore(projectDataDirectory, templates) {
    console.log("Reading lore file...");

    const fileSet = {
      main: {
        data: undefined,
        path: path.join(projectDataDirectory, LORE_LIBRARY),
      },
      temp: {
        data: undefined,
        path: path.join(projectDataDirectory, LORE_LIBRARY_TEMP),
      },
      backup: {
        data: undefined,
        path: path.join(projectDataDirectory, _BACKUP_DIR, LORE_LIBRARY_BAK),
      },
    };
    try {
      fileSet.main.data = JSON.parse(
        fs.readFileSync(fileSet.main.path, "utf-8")
      );
      console.log("Success");
    } catch (err) {
      if (err.code === "ENOENT") {
        console.log("No main file found, making new library", templates.data);
        const newLibrary = { dateId: Date.now() };
        fileSet.main.data = this.fillMissingLoreEntries(
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
              return;
            }
            console.log("Lore library created successfully.");
          }
        );
      } else {
        console.error("Error loading lore data.");
        return;
      }
    }
    try {
      fileSet.temp.data = JSON.parse(
        fs.readFileSync(fileSet.temp.path, "utf-8")
      );
      console.log("Unsuccesful shutdown detected.");
      this.resolveBadShutdown();
    } catch (err) {
      if (err.code === "ENOENT") {
        console.log("Checking last shutdown...");
      } else {
        console.error("Error reading temp file.");
      }
    }
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
  fillMissingLoreEntries(loreData, templates) {
    const filledLoreData = Object.assign({}, loreData);

    for (const key in templates) {
      if (!filledLoreData.hasOwnProperty(key)) {
        filledLoreData[key] = {};
        console.log("Key added to lore library:", key);
      }
    }
    return filledLoreData;
  }
  resolveBadShutdown() {
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
              fs.copyFileSync(
                catalog.information.lore.temp.path,
                catalog.information.lore.main.path
              );
              fs.unlinkSync(catalog.information.lore.temp.path);
              console.log("Temp data overwritten to main file.");
              resolve(true);
            } else if (choice.response === 1) {
              fs.unlinkSync(catalog.information.lore.temp.path);
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
  tryMakeDirectory(baseDirectory, directoryName) {
    const fullDirectoryPath = path.join(baseDirectory, directoryName);
    if (!fs.existsSync(fullDirectoryPath)) {
      console.log("Make directory:", fullDirectoryPath);
      fs.mkdirSync(fullDirectoryPath);
    }
    return fullDirectoryPath;
  }
}

class Catalog {
  #userMode = userMode;
  #root = root;

  constructor(userMode, root, catalogData) {
    this.information = catalogData;

    this.#userMode = userMode
    this.#root = root;

    ipcMain.on("path:sprites-preview", (event, fileKey) => {
      if (this.#userMode === DEV) {
        const relativeFilePath = path.join(
          "../data/assets/sprites",
          this.information.sprites.data.sprite[fileKey].preview
        );

        event.returnValue = relativeFilePath;
        console.log("Sending data...", relativeFilePath);
      } else if (this.#userMode === DIST) {
        const filePath = path.join(
          this.#root,
          _DIR,
          _ASSETS_DIR,
          _SPRITES_DIR,
          this.information.sprites.data.sprite[fileKey].preview
        );

        event.returnValue = filePath;
        console.log("Sending data...", filePath);
      }
    });

    ipcMain.on("lore-data-save", (event, data) => {
      const filename = this.information.lore.temp.path;

      console.log("Writing changes to temp:", filename);

      fs.writeFile(filename, JSON.stringify(data), (err) => {
        if (err) {
          console.error("Error saving lore:", err);
          event.sender.send("save-failed");
        } else {
          event.sender.send("save-success", filename);
          this.information.lore.temp.data = data;
          console.log("Lore saved to temp file successfully.");
        }
      });
    });

    ipcMain.on("templates-save", (event, data) => {
      if (!data) {
        console.error("Invalid data format: Missing templates section");
        event.sender.send("save-failed", "Invalid data format");
        return;
      }

      const templateData = (this.information.templates.data.template = data);
      fs.writeFile(
        this.information.templates.path,
        JSON.stringify(templateData),
        (err) => {
          if (err) {
            console.error("Error saving templates:");
            event.sender.send("save-failed", "Error saving templates");
          } else {
            console.log("Templates saved successfully!");
            event.sender.send("save-success");
          }
        }
      );
    });

    ipcMain.on("save:lore-image", (event, filePath) => {
      saveImageData(event, filePath);
      async function saveImageData(event, sourceFilePath) {
        console.log("Saving image data...");

        if (!(await isFileAccessible(sourceFilePath))) {
          console.error("Source file not found:", sourceFilePath);
          return;
        }

        const filename = path.basename(sourceFilePath);
        const newImageFilePath = path.join(
          this.information.sprites.directory,
          filename
        );

        const imageData = fs.readFileSync(sourceFilePath);

        if (this.#userMode === DIST) {
          if (!(await writeImageData(newImageFilePath, imageData))) {
            return;
          }
        }

        if (
          !(await updateSpriteReferences(removeExtension(filename), filename))
        ) {
          return;
        }

        console.log("Image saved successfully!", newImageFilePath);
        console.log(
          "Sprites data updated with full-size image reference:",
          removeExtension(filename)
        );

        if (this.#userMode === DEV) {
          event.returnValue = path.join("../data/assets/sprites", filename);
        } else if (this.#userMode === DIST) {
          event.returnValue = path.join(this.#root, "/data/assets/sprites", filename);
        }
      }
      async function updateSpriteReferences(fileIndex, filename) {
        this.information.sprites.data[SPRITES_KEY][fileIndex] = {};
        this.information.sprites.data[SPRITES_KEY][fileIndex][PREVIEWS_KEY] =
          filename;

        try {
          await fs.promises.writeFile(
            this.information.sprites.path,
            JSON.stringify(this.information.sprites.data)
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
    });
  }
}

function createWindow(mainWindow) {
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
