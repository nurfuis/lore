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

const { defaultTemplates } = require("./main/settings/templatesConfiguration");

const { removeExtension } = require("./main/utils/removeExtension");

const { cycleBackgrounds } = require("./main/menu/cycleBackgrounds");
const { toggleTheme } = require("./main/menu/toggleTheme");

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = true;

app.setAppUserModelId("Lore");

const userMode = DEV;

const root = getRoot(userMode);

function getRoot(userMode) {
  console.log("User mode:", userMode);

  if (DEV && userMode === DEV) {
    return `${process.env.INIT_CWD}`;
  } else if (DIST && userMode === DIST) {
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

  ipcMain.on("load:lore-data-project-directory", async (event) => {
    const isLoaded = await loadLoreCatalog();

    event.returnValue = isLoaded;

    console.log("Catalog is loaded...", isLoaded);
  });

  async function loadLoreCatalog() {
    console.log("Loading...");

    const library = new Library();

    const information = await library.initializeProjectDirectories(root);

    const catalog = new Catalog(userMode, root, information);

    mainWindow.webContents.send("send:catalog-data", catalog);
    mainWindow.webContents.send("send:current-directory", root);

    return information;
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
  async initializeProjectDirectories(root) {
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
    const loreFiles = await this.readProjectData(projectDataDirectory);

    return loreFiles;
  }

  async readProjectData(projectDataDirectory) {
    const sprites = this.readSprites(projectDataDirectory);
    const templates = this.readTemplates(projectDataDirectory);
    const lore = await this.readLore(projectDataDirectory, templates);
    if (!!lore) {
      return { lore, sprites, templates };
    }
  }

  readSprites(projectDataDirectory) {
    const spritesLibraryFile = path.join(projectDataDirectory, SPRITE_LIBRARY);
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
      directory: path.join(projectDataDirectory, _ASSETS_DIR, _SPRITES_DIR),
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
    const templatesFile = path.join(projectDataDirectory, TEMPLATES_FILE);
    console.log("Reading templates file...");
    let results;
    try {
      results = JSON.parse(fs.readFileSync(templatesFile, "utf-8"));
      console.log("Success");
    } catch (err) {
      console.error("Error loading template data:", err);
      const preset = defaultTemplates;
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

  async readLore(projectDataDirectory, templates) {
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
      const result = await this.resolveBadShutdown(projectDataDirectory);
      console.log("Resolved bad shutdown with:", result);
      if (result === 0) {
        // temp data was overwritten to the main file...
        // restart the loading process or somethin?
        // for now just quit to protect data until
        // this is resolved correctly
        app.quit();
        return undefined;
      } else if (result === 1) {
        // old temp data was removed, set temp data to a copy of the main
        fileSet.temp.data = fileSet.main.data;
      } else {
        app.quit();
        console.log("The app should have or will be quitting...");
        return undefined;
      }
    } catch (err) {
      if (err.code === "ENOENT") {
        console.log("Last shutdown was good...");
        fileSet.temp.data = fileSet.main.data;
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

  resolveBadShutdown(projectDataDirectory) {
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
                path.join(projectDataDirectory, LORE_LIBRARY_TEMP),
                path.join(projectDataDirectory, LORE_LIBRARY)
              );
              fs.unlinkSync(path.join(projectDataDirectory, LORE_LIBRARY_TEMP));
              console.log("Temp data overwritten to main file.");
              resolve(choice.response);
            } else if (choice.response === 1) {
              fs.unlinkSync(path.join(projectDataDirectory, LORE_LIBRARY_TEMP));
              console.log("Temporary file removed.");

              resolve(choice.response);
            } else {
              resolve(2);
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

    this.#userMode = userMode;
    this.#root = root;

    ipcMain.on("path:sprites-preview", (event, fileKey) => {
      this.getSpritePreviewPath(fileKey, event);
    });

    ipcMain.on("save:lore-information", (event, data) => {
      this.saveLoreInformation(data, event);
    });

    ipcMain.on("save:templates-information", (event, data) => {
      this.saveTemplatesInformation(data, event);
    });

    ipcMain.on("save:lore-image", (event, filePath) => {
      this.saveLoreImage(event, filePath, this.information, this.#userMode);
    });

    ipcMain.on("information:template-fields", (event, templateKey) => {
      this.getTemplateFieldsInformation(templateKey, event);
    });

    ipcMain.on("information:lore-catagory", (event, templateKey) => {
      this.getLoreCatagory(templateKey, event);
    });
    ipcMain.on("information:lore-library", (event, edition) => {
      this.getLoreLibrary(edition, event);
    });

    ipcMain.on("save:lore-entry", (event, { templateKey, newEntry }) => {
      this.saveLoreEntry(newEntry, templateKey, event);
    });
    ipcMain.on(
      "information:lore-data-entry",
      (event, { templateKey, entryKey }) => {
        this.getLoreEntryInformation(entryKey, templateKey, event);
      }
    );
    ipcMain.on(
      "catalog:lore-entry-delete",
      (event, { templateKey, entryKey }) => {
        this.removeLoreEntryInformation(entryKey, templateKey, event);
      }
    );
  }

  saveLoreImage(event, filePath, information, userMode) {
    saveImageData(event, filePath, information, userMode);
    async function saveImageData(event, sourceFilePath, information) {
      console.log("Saving image data...");

      if (!(await isFileAccessible(sourceFilePath))) {
        console.error("Source file not found:", sourceFilePath);
        return;
      }

      const filename = path.basename(sourceFilePath);
      const newImageFilePath = path.join(
        information.sprites.directory,
        filename
      );

      const imageData = fs.readFileSync(sourceFilePath);

      if (userMode === DIST) {
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

      if (userMode === DEV) {
        event.returnValue = path.join("../data/assets/sprites", filename);
      } else if (userMode === DIST) {
        event.returnValue = path.join(
          this.#root,
          "/data/assets/sprites",
          filename
        );
      }
    }
    async function updateSpriteReferences(fileIndex, filename) {
      information.sprites.data[SPRITES_KEY][fileIndex] = {};
      information.sprites.data[SPRITES_KEY][fileIndex][PREVIEWS_KEY] = filename;

      try {
        await fs.promises.writeFile(
          information.sprites.path,
          JSON.stringify(information.sprites.data)
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
  }

  saveTemplatesInformation(data, event) {
    if (!data) {
      console.error("Invalid data format: Missing templates section");
      event.sender.send("save-failed", "Invalid data format");
    } else {
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
    }
  }

  saveLoreInformation(data, event) {
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
  }

  getSpritePreviewPath(fileKey, event) {
    if (userMode === DEV) {
      const relativeFilePath = path.join(
        "../data/assets/sprites",
        this.information.sprites.data.sprite[fileKey].preview
      );
      event.returnValue = relativeFilePath;
    } else if (userMode === DIST) {
      const filePath = path.join(
        this.#root,
        _DIR,
        _ASSETS_DIR,
        _SPRITES_DIR,
        this.information.sprites.data.sprite[fileKey].preview
      );
      event.returnValue = filePath;
    }
  }

  getLoreLibrary(edition, event) {
    const result = this.information?.lore?.[edition].data ?? null;

    if (result) {
      event.returnValue = result;
    } else {
      event.returnValue = result;
    }
  }

  getTemplateFieldsInformation(templateKey, event) {
    const result = this.information.templates.data[templateKey];
    if (result) {
      event.returnValue = result;
      // console.log("Replying to information:template-fields ...", result);
    } else {
      event.returnValue = result;
      // console.log("Requested recieved for undefined template...", templateKey);
    }
  }

  getLoreCatagory(templateKey, event) {
    const result = this.information?.lore?.main?.data?.[templateKey] ?? null;

    if (result) {
      event.returnValue = result;
    } else {
      event.returnValue = result;
    }
  }

  saveLoreEntry(newEntry, templateKey, event) {
    this.information.lore.temp.data[templateKey][newEntry.name] = newEntry;

    event.returnValue = true;

    const filename = this.information.lore.temp.path;
    fs.writeFile(
      filename,
      JSON.stringify(this.information.lore.temp.data),
      (err) => {
        if (err) {
          console.error("Error saving lore:", err);
        } else {
          console.log("Lore saved to temp file successfully.");
        }
      }
    );
  }

  getLoreEntryInformation(entryKey, templateKey, event) {
    const result =
      this.information?.lore?.temp?.data?.[templateKey]?.[entryKey] ?? null;

    if (result?.valid) {
      event.returnValue = result;
      // console.log("Replying to information:lore-data-entry ...", result);
    } else {
      event.returnValue = result;
    }
  }

  removeLoreEntryInformation(entryKey, templateKey, event) {
    const result =
      this.information?.lore?.temp?.data?.[templateKey]?.[entryKey] ?? null;

    if (result?.valid) {
      delete this.information.lore.temp.data[templateKey][entryKey];
      event.returnValue = result;
      const filename = this.information.lore.temp.path;
      fs.writeFile(
        filename,
        JSON.stringify(this.information.lore.temp.data),
        (err) => {
          if (err) {
            console.error("Error saving lore:", err);
          } else {
            console.log(
              "Lore entry deleted succesfully."
            );
          }
        }
      );
    } else {
      event.returnValue = result;
    }
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
