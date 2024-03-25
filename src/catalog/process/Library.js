const { app, dialog } = require("electron");
const fs = require("fs");
const path = require("path");
const {
  SPRITES_KEY,
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
} = require("./directoryConfiguration");
const { defaultTemplates } = require("./templatesConfiguration");

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
        const newLibrary = {};
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
      if (err) {
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
exports.Library = Library;
