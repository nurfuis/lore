const { contextBridge, ipcRenderer } = require("electron");

const electronAPI = {
  //* ONE WAY FROM MAIN *//
  onOpenProject: (callback) =>
    ipcRenderer.on("send:catalog-data", (_event, value) => callback(value)),
  //* ONE WAY TO MAIN *//
  saveLore: (data) => ipcRenderer.send("lore-data-save", data),
  saveImage: (data) => ipcRenderer.send("image-save", data),
  saveTemplates: (data) => ipcRenderer.send("templates-save", data),

  //* CALL AND RESPONSE *//
  openFileDialog() {
    const response = ipcRenderer.invoke("dialog-file-open");
    return response;
  },
  getRoot() {
    const response = ipcRenderer.sendSync("root-request");
    return response;
  },
  getCurrentDirectory() {
    const response = ipcRenderer.sendSync("current-directory-request");
    return response;
  },
  getImage(filename) {
    const response = ipcRenderer.sendSync("image-request", filename);
    return response;
  },
  getLore() {
    return ipcRenderer.sendSync("lore-data-request");
  },
  getTemplates() {
    const response = ipcRenderer.sendSync("templates-request");
    return response;
  },
  fetchLoreData(path) {
    const response = ipcRenderer.sendSync("load:lore-data-project-directory", path);
    return response;
  },

  
};
contextBridge.exposeInMainWorld("electronAPI", electronAPI);
