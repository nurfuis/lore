const { contextBridge, ipcRenderer } = require("electron");

//* ONE WAY FROM MAIN *//
contextBridge.exposeInMainWorld("catalogAPI", {
  onOpenProject: (callback) =>
    ipcRenderer.on("send:catalog", (_event, value) => callback(value)),
});

//* ONE WAY TO MAIN *//
const electronAPI = {
  saveLore: (data) => ipcRenderer.send("save-lore-data", data),
  saveImage: (data) => ipcRenderer.send("save-image", data),
  saveTemplates: (data) => ipcRenderer.send("save-templates", data),
  openFileDialog: () => {
    ipcRenderer.send("open-file-dialog");
  },
};
contextBridge.exposeInMainWorld("electronAPI", electronAPI);

//* CALL AND RESPONSE *//
contextBridge.exposeInMainWorld("request", {
  getImage(filename) {
    const response = ipcRenderer.sendSync("request-image", filename);
    return response;
  },
});
contextBridge.exposeInMainWorld("loreData", {
  getLore() {
    return ipcRenderer.sendSync("lore-data-request");
  },
});
contextBridge.exposeInMainWorld("templateData", {
  getMaps() {
    // Add filename argument
    const response = ipcRenderer.sendSync("request-templates");
    return response;
  },
});
contextBridge.exposeInMainWorld("process", {
  getRoot() {
    const response = ipcRenderer.sendSync("request-root");
    return response;
  },
});
contextBridge.exposeInMainWorld("reload", {
  init() {
    const response = ipcRenderer.sendSync("request-reload");
    return response;
  },
});
