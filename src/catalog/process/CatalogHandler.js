const { ipcMain } = require("electron");

class CatalogHandler {
  constructor(userMode, projectPath) {
    this.userMode = userMode;
    this.projectPath = projectPath;
    // catalog
    ipcMain.on("information:lore-library", (event, edition) => {
      this.module.getLoreLibrary(edition, event);
    });
    // sprites
    ipcMain.on("save:lore-image", (event, filePath) => {
      this.module.saveLoreImage(event, filePath, this.module.information, this.userMode, this.projectPath);
    });
    ipcMain.on("path:sprites-preview", (event, fileKey) => {
      this.module.getSpritePreviewPath(fileKey, event, this.userMode, this.projectPath);
    });
    //templates
    ipcMain.on("catalog:get-templates", (event) => {
      this.module.getTemplates(event);
    });
    ipcMain.on("catalog:save-template", (event, { templateKey, fields }) => {
      this.module.saveTemplate(fields, templateKey, event);
    });
    ipcMain.on("information:template-fields", (event, templateKey) => {
      this.module.getTemplateFieldsInformation(templateKey, event);
    });
    // lore
    ipcMain.on("information:lore-catagory", (event, templateKey) => {
      this.module.getLoreCatagory(templateKey, event);
    });
    ipcMain.on(
      "information:lore-data-entry",
      (event, { templateKey, entryKey }) => {
        this.module.getLoreEntryInformation(entryKey, templateKey, event);
      }
    );
    ipcMain.on("save:lore-entry", (event, { templateKey, newEntry, flags }) => {
      this.module.saveLoreEntry(flags, newEntry, templateKey, event);
    });
    ipcMain.on(
      "catalog:lore-entry-delete",
      (event, { templateKey, entryKey }) => {
        this.module.removeLoreEntryInformation(entryKey, templateKey, event);
      }
    );
    ipcMain.on("save:lore-information", (event) => {
      this.module.saveCatalogInformationToTemp();
      console.log(event);
    });
  }
}
exports.CatalogAPI = CatalogHandler;
