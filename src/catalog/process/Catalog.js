const { dialog } = require("electron");

const fs = require("fs");
const path = require("path");
const { DEV, DIST } = require("../../main/settings/appConfiguration");
const {
  SPRITES_KEY,
  PREVIEWS_KEY,
  _DIR,
  _ASSETS_DIR,
  _SPRITES_DIR,
} = require("./config/directoryConfiguration");
const { removeExtension } = require("../../utils/removeExtension");

class Catalog {
  constructor(catalogData) {
    this.information = catalogData;
  }

  handleFileOpen(event) {
    console.log(event);
    const { canceled, filePaths } = dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    if (!canceled) {
      event.returnValue = filePaths[0];
    } else {
      event.returnValue = filePaths[0];
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
  // sprites
  saveLoreImage(event, filePath, information, userMode, projectPath) {
    saveImageData(event, filePath, information, userMode, projectPath);
    async function saveImageData(
      event,
      sourceFilePath,
      information,
      userMode,
      projectPath
    ) {
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
        // In development mode, set the return value to a temporary path within the
        // data/assets/sprites directory to ensure the page doesn't reload due to webpack
        // noticing file changes. This approach might not be ideal for long-term
        // maintainability. Is there a preferred way to handle this scenario?
        event.returnValue = path.join(
          "../",
          _DIR,
          _ASSETS_DIR,
          _SPRITES_DIR,
          filename
        );
      } else if (userMode === DIST) {
        // In production mode, set the return value to the final path within the
        // data/assets/sprites directory relative to the application projectPath.
        event.returnValue = path.join(
          projectPath,
          _DIR,
          _ASSETS_DIR,
          _SPRITES_DIR,
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
  getSpritePreviewPath(fileKey, event, userMode, projectPath) {
    if (userMode === DEV) {
      const relativeFilePath = path.join(
        "../",
        _DIR,
        _ASSETS_DIR,
        _SPRITES_DIR,
        this.information.sprites.data.sprite[fileKey].preview
      );
      event.returnValue = relativeFilePath;
    } else if (userMode === DIST) {
      const filePath = path.join(
        projectPath,
        _DIR,
        _ASSETS_DIR,
        _SPRITES_DIR,
        this.information.sprites.data.sprite[fileKey].preview
      );
      event.returnValue = filePath;
    }
  }
  // templates
  getTemplates(event) {
    const result = this.information.templates.data;
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
  saveTemplate(flags, newTemplate, templateKey, event) {
    if (!templateKey) {
      event.returnValue = {
        status: "incomplete",
        message: "Template name is required.",
      };
      return;
    } else if (!!this.information.templates.data[templateKey]) {
      event.returnValue = {
        status: "conflict",
        message: `A template with the key "${templateKey}" has already been entered.`,
      };
      return;
    } else {
      const templateData = this.information.templates.data;
      templateData[templateKey] = newTemplate;

      const loreInfo = this.information.lore.temp.data;

      if (!loreInfo.hasOwnProperty(templateKey)) {
        // check for Template in the lore library
        // Create it if it doesn't exist

        // The templates.json and lib.json are coupled...

        // If the catagory is not premade in the library the editor
        // will throw an error. For now, we prevent that here.
        // It may be prudent to do some sort of additional
        // check and template catagory object creation in the
        // save entry function.

        // We make this check instead of simply overwriting to
        // protect existing entries from overwrite for the time
        // being. I may add some more detailed template handling
        // logic down the line.

        loreInfo[templateKey] = {};

        console.log("Key added to lore library:", templateKey);

        this.saveCatalogInformationToTemp();
      }

      fs.writeFile(
        this.information.templates.path,
        JSON.stringify(templateData),
        (err) => {
          if (err) {
            console.error("Error saving templates:");
          } else {
            console.log("Templates saved successfully!");
          }
        }
      );
      event.returnValue = {
        status: "resolved",
        message: `Template "${templateKey}" has been created.`,
      };
    }
  }
  deleteTemplate(flags, templateKey, event) {
    if (this.information.lore.temp.data.hasOwnProperty(templateKey)) {
      delete this.information.lore.temp.data[templateKey];

      console.log("Key removed from lore library:", templateKey);

      this.saveCatalogInformationToTemp();
    }

    if (!!this.information.templates.data[templateKey]) {
      delete this.information.templates.data[templateKey];

      fs.writeFile(
        this.information.templates.path,
        JSON.stringify(this.information.templates.data),
        (err) => {
          if (err) {
            console.error("Error saving templates:");
          } else {
            console.log("Template removed successfully!");
          }
        }
      );

      event.returnValue = {
        status: "resolved",
        message: `A template with the key "${templateKey}" has been removed.`,
      };
    } else {
      event.returnValue = {
        status: "error",
        message: `A template with the key "${templateKey}" cannot be located.`,
      };
    }
  }
  // lore
  getLoreCatagory(templateKey, event) {
    const result = this.information?.lore?.main?.data?.[templateKey] ?? null;
    if (result) {
      event.returnValue = result;
    } else {
      event.returnValue = result;
    }
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
  saveLoreEntry(flags, newEntry, templateKey, event) {
    const entryKey =
      newEntry?.name ||
      newEntry?.Name ||
      newEntry?.index ||
      newEntry?.Index ||
      newEntry?.key ||
      newEntry?.Key ||
      Object.values(newEntry)[1];

    const entryKeyAlreadyExists =
      this.information.lore.temp.data[templateKey][entryKey]?.valid || false;

    console.log("save with flags", flags);

    if (!entryKey) {
      event.returnValue = {
        status: "incomplete",
        message: "Entry name is required.",
      };
    } else if (flags == "canOverwrite") {
      console.log("overwrite triggered");
      const version =
        this.information.lore.temp.data[templateKey][entryKey]["version"] + 1;
      newEntry["version"] = version;
      this.information.lore.temp.data[templateKey][entryKey] = newEntry;
      const filename = this.information.lore.temp.path;
      fs.writeFile(
        filename,
        JSON.stringify(this.information.lore.temp.data),
        (err) => {
          if (err) {
            console.error("Error overwriting lore:", err);
            event.returnValue = {
              status: "error",
              message:
                "Encountered an error while trying to ovrwrite changes to file.",
            };
          } else {
            console.log("Lore overwritten to temp file successfully.");
          }
        }
      );
      event.returnValue = {
        status: "overwritten",
        message:
          "Succesfully overwritten information for " +
          templateKey +
          ":" +
          entryKey,
      };
    } else if (entryKeyAlreadyExists) {
      event.returnValue = {
        status: "conflict",
        message:
          "Entry with that name already exists. Do you want to overwrite it?",
      };
    } else if (entryKey && !entryKeyAlreadyExists) {
      newEntry["version"] = 1;
      this.information.lore.temp.data[templateKey][entryKey] = newEntry;
      const filename = this.information.lore.temp.path;
      fs.writeFile(
        filename,
        JSON.stringify(this.information.lore.temp.data),
        (err) => {
          if (err) {
            console.error("Error saving lore:", err);
            event.returnValue = {
              status: "error",
              message:
                "Encountered an error while trying to overwrite changes to file.",
            };
          } else {
            console.log("Lore saved to temp file successfully.");
          }
        }
      );
      event.returnValue = {
        status: "resolved",
        message:
          "Succesfully saved information for " + templateKey + ": " + entryKey,
      };
    }
  }
  removeLoreEntryInformation(entry, templateKey, event) {
    const entryKey =
      entry?.name ||
      entry?.Name ||
      entry?.index ||
      entry?.Index ||
      entry?.key ||
      entry?.Key ||
      Object.values(entry)[1];
    const result =
      this.information?.lore?.temp?.data?.[templateKey]?.[entryKey] ?? null;

    if (result?.valid) {
      delete this.information.lore.temp.data[templateKey][entryKey];
      const filename = this.information.lore.temp.path;
      fs.writeFile(
        filename,
        JSON.stringify(this.information.lore.temp.data),
        (err) => {
          if (err) {
            console.error("Error saving lore:", err);
          } else {
            console.log("Lore entry deleted succesfully.");
            event.returnValue = {
              status: "resolved",
              message: `${entryKey} was removed succesfully.`,
            };
          }
        }
      );
    } else {
      event.returnValue = result;
    }
  }
  saveCatalogInformationToTemp() {
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
}
exports.Catalog = Catalog;
