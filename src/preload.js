const { contextBridge, ipcRenderer } = require("electron");

const loreAPI = {
  //* CALL AND RESPONSE *//

  loadCatalog() {
    const response = ipcRenderer.sendSync(
      "catalog:load"
    );
    return response;
  },

  getPathSpritesPreview(fileKey) {
    const response = ipcRenderer.sendSync("path:sprites-preview", fileKey);
    return response;
  },

  saveImage(filePath) {
    const response = ipcRenderer.sendSync("save:lore-image", filePath);
    return response;
  },

  getInformationLoreEntry({ templateKey, entryKey }) {
    const response = ipcRenderer.sendSync("information:lore-data-entry", {
      templateKey,
      entryKey,
    });
    return response;
  },
  catalogLoreEntryDelete({ templateKey, entryKey }) {
    const response = ipcRenderer.sendSync("catalog:lore-entry-delete", {
      templateKey,
      entryKey,
    });
    return response;
  },
  catalogGetTemplates() {
    // returns all saved templates
    const response = ipcRenderer.sendSync("catalog:get-templates");
    return response;
  },

  getInformationTemplateFields(templateKey) {
    // returns the individual fields of a selected template
    const response = ipcRenderer.sendSync(
      "information:template-fields",
      templateKey
    );
    return response;
  },

  getInformationLoreCatagory(templateKey) {
    // returns the entries in a template catagory from the library data
    const response = ipcRenderer.sendSync(
      "information:lore-catagory",
      templateKey
    );
    return response;
  },

  getInformationLoreLibrary(edition) {
    const response = ipcRenderer.sendSync("information:lore-library", edition);
    return response;
  },

  saveInformationLoreEntry({ templateKey, newEntry }) {
    const response = ipcRenderer.sendSync("save:lore-entry", {
      templateKey,
      newEntry,
    });
    return response;
  },

  //* ONE WAY FROM MAIN *//

  onLoadCatalog: (callback) =>
    ipcRenderer.on("catalog:send-full-library", (_event, value) => callback(value)),

  onSetPath: (callback) =>
    ipcRenderer.on("catalog:send-library-path", (_event, value) =>
      callback(value)
    ),

  //* ONE WAY TO MAIN *//
  saveLore: (data) => ipcRenderer.send("save:lore-information", data),
  saveTemplates: (data) => ipcRenderer.send("save:templates-information", data),
};
contextBridge.exposeInMainWorld("loreAPI", loreAPI);
