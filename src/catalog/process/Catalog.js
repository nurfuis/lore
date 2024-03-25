const fs = require("fs");
const path = require("path");
const { DEV, DIST } = require("../../main/settings/appConfiguration");
const { SPRITES_KEY, PREVIEWS_KEY, _DIR, _ASSETS_DIR, _SPRITES_DIR } = require("../../main/settings/directoryConfiguration");
const { removeExtension } = require("../../utils/removeExtension");

class Catalog {
  constructor(catalogData) {
    this.information = catalogData;
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
  saveLoreImage(event, filePath, information, userMode, root) {
    saveImageData(event, filePath, information, userMode, root);
    async function saveImageData(event, sourceFilePath, information, userMode, root) {
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

      if (!(await updateSpriteReferences(removeExtension(filename), filename))) {
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
        event.returnValue = path.join("../data/assets/sprites", filename);
      } else if (userMode === DIST) {
        // In production mode, set the return value to the final path within the
        // data/assets/sprites directory relative to the application root.
        event.returnValue = path.join(
          root,
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
  getSpritePreviewPath(fileKey, event, userMode, root) {
    if (userMode === DEV) {
      const relativeFilePath = path.join(
        "../data/assets/sprites",
        this.information.sprites.data.sprite[fileKey].preview
      );
      event.returnValue = relativeFilePath;
    } else if (userMode === DIST) {
      const filePath = path.join(
        root,
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
  saveTemplate(fields, templateKey, event) {
    const templateData = this.information.templates.data;

    templateData[templateKey] = fields;

    const loreInfo = this.information.lore.temp.data;

    if (!loreInfo.hasOwnProperty(templateKey)) {
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
    const result = this.information?.lore?.temp?.data?.[templateKey]?.[entryKey] ?? null;

    if (result?.valid) {
      event.returnValue = result;
      // console.log("Replying to information:lore-data-entry ...", result);
    } else {
      event.returnValue = result;
    }
  }
  saveLoreEntry(flags, newEntry, templateKey, event) {
    const entryKey = newEntry?.name ||
      newEntry?.Name ||
      newEntry?.index ||
      newEntry?.Index ||
      newEntry?.key ||
      newEntry?.Key;

    const entryKeyAlreadyExists = this.information.lore.temp.data[templateKey][entryKey]?.valid || false;

    console.log("save with flags", flags);

    if (!entryKey) {
      event.returnValue = {
        status: "incomplete",
        message: "Entry name is required.",
      };
    } else if (flags == "canOverwrite") {
      console.log("overwrite triggered");
      const version = this.information.lore.temp.data[templateKey][entryKey]["version"] + 1;
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
              message: "Encountered an error while trying to ovrwrite changes to file.",
            };
          } else {
            console.log("Lore overwritten to temp file successfully.");
          }
        }
      );
      event.returnValue = {
        status: "overwritten",
        message: "Succesfully overwritten information for " +
          templateKey +
          ":" +
          entryKey,
      };
    } else if (entryKeyAlreadyExists) {
      event.returnValue = {
        status: "conflict",
        message: "Entry with that name already exists. Do you want to overwrite it?",
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
              message: "Encountered an error while trying to overwrite changes to file.",
            };
          } else {
            console.log("Lore saved to temp file successfully.");
          }
        }
      );
      event.returnValue = {
        status: "resolved",
        message: "Succesfully saved information for " + templateKey + ":" + entryKey,
      };
    }
  }
  removeLoreEntryInformation(entryKey, templateKey, event) {
    const result = this.information?.lore?.temp?.data?.[templateKey]?.[entryKey] ?? null;

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
            console.log("Lore entry deleted succesfully.");
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
