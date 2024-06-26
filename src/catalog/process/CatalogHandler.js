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
    // ipcMain.handle(
    //   "dialog:open-image-file",
    //   this.module.handleOpenImageDialog()
    // );

    ipcMain.on("save:lore-image", (event, filePath) => {
      this.module.saveLoreImage(
        event,
        filePath,
        this.module.information,
        this.userMode,
        this.projectPath
      );
    });
    ipcMain.on("path:sprites-preview", (event, fileKey) => {
      this.module.getSpritePreviewPath(
        fileKey,
        event,
        this.userMode,
        this.projectPath
      );
    });
    //templates
    ipcMain.on("catalog:get-templates", (event) => {
      this.module.getTemplates(event);
    });

    ipcMain.on(
      "save:template",
      (event, { templateKey, newTemplate, flags }) => {
        this.module.saveTemplate(flags, newTemplate, templateKey, event);
      }
    );

    ipcMain.on("delete:template", (event, { templateKey, flags }) => {
      this.module.deleteTemplate(flags, templateKey, event);
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
    ipcMain.on("catalog:lore-entry-delete", (event, { templateKey, entry }) => {
      this.module.removeLoreEntryInformation(entry, templateKey, event);
    });
    ipcMain.on("save:lore-information", (event) => {
      this.module.saveCatalogInformationToTemp();
      console.log(event);
    });
  }
}
exports.CatalogAPI = CatalogHandler;
