const { contextBridge, ipcRenderer } = require("electron");

const electronAPI = {
  saveLore: (data) => ipcRenderer.send("save-lore", data),
  saveImage: (data) => ipcRenderer.send("save-image", data),
  saveTemplates: (data) => ipcRenderer.send("save-templates", data),
  openFileDialog: () => {
    ipcRenderer.send("open-file-dialog");
  },
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);

contextBridge.exposeInMainWorld("loreData", {
  getLore() {
    return ipcRenderer.sendSync("request-lore-data");
  },
});

contextBridge.exposeInMainWorld("request", {
  getImage(filename) {
    // Add filename argument
    const response = ipcRenderer.sendSync("request-image", filename);
    return response;
  },
});

contextBridge.exposeInMainWorld("templateData", {
  getMaps() {
    // Add filename argument
    const response = ipcRenderer.sendSync("request-templates");
    return response;
  },
});
