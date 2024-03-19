const { contextBridge, ipcRenderer } = require("electron");

const electronAPI = {
  //* ONE WAY FROM MAIN *//
  onOpenProject: (callback) =>
    ipcRenderer.on("send:catalog", (_event, value) => callback(value)),
  //* ONE WAY TO MAIN *//
  saveLore: (data) => ipcRenderer.send("lore-data-save", data),
  saveImage: (data) => ipcRenderer.send("image-save", data),
  saveTemplates: (data) => ipcRenderer.send("templates-save", data),
  openFileDialog: () => {
    ipcRenderer.send("dialog-file-open");
  },
  //* CALL AND RESPONSE *//
  getRoot() {
    const response = ipcRenderer.sendSync("root-request");
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
  init() {
    const response = ipcRenderer.sendSync("reload-request");
    return response;
  },
};
contextBridge.exposeInMainWorld("electronAPI", electronAPI);
