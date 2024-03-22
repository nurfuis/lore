const { contextBridge, ipcRenderer } = require("electron");

const electronAPI = {
  //* ONE WAY FROM MAIN *//
  onOpenProject: (callback) =>
    ipcRenderer.on("send:catalog-data", (_event, value) => callback(value)),
  // make a function to handle the project directory update
  onSetProjectDirectory: (callback) =>
    ipcRenderer.on("send:current-directory", (_event, value) =>
      callback(value)
    ),

  //* ONE WAY TO MAIN *//
  saveLore: (data) => ipcRenderer.send("lore-data-save", data),
  saveTemplates: (data) => ipcRenderer.send("templates-save", data),

  //* CALL AND RESPONSE *//
  getPathSpritesPreview(fileKey) {
    const response = ipcRenderer.sendSync("path:sprites-preview", fileKey);
    return response;
  },
  saveImage(filePath) {
    const response = ipcRenderer.sendSync("save:lore-image", filePath);
    return response;
  },
  loadLoreData(path) {
    const response = ipcRenderer.sendSync(
      "load:lore-data-project-directory",
      path
    );
    return response;
  },
};
contextBridge.exposeInMainWorld("electronAPI", electronAPI);
