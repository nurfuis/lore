const { contextBridge, ipcRenderer } = require("electron");

const electronAPI = {
  //* CALL AND RESPONSE *//

  loadLoreData(path) {
    const response = ipcRenderer.sendSync(
      "load:lore-data-project-directory",
      path
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

  getInformationTemplateFields(templateKey) {
    const response = ipcRenderer.sendSync(
      "information:template-fields",
      templateKey
    );
    return response;
  },

  getInformationLoreEntry({ templateKey, entryKey }) {
    const response = ipcRenderer.sendSync("information:lore-data-entry", {
      templateKey,
      entryKey,
    });
    return response;
  },

  saveInformationLoreEntry(newEntry) {
    const response = ipcRenderer.sendSync("save:lore-entry", newEntry);
    return response;
  },

  //* ONE WAY FROM MAIN *//

  onOpenProject: (callback) =>
    ipcRenderer.on("send:catalog-data", (_event, value) => callback(value)),

  onSetProjectDirectory: (callback) =>
    ipcRenderer.on("send:current-directory", (_event, value) =>
      callback(value)
    ),

  //* ONE WAY TO MAIN *//
  saveLore: (data) => ipcRenderer.send("save:lore-information", data),
  saveTemplates: (data) => ipcRenderer.send("save:templates-information", data),
};
contextBridge.exposeInMainWorld("electronAPI", electronAPI);
