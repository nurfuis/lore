const { ipcRenderer } = require("electron");

const { contextBridge } = require("electron");
const { catalogAPI } = require("./catalog/preloadCatalogAPI");

const menuAPI = {
  cycleBackground: () => ipcRenderer.send("menu:cycle-background"),
  toggleTheme: () => ipcRenderer.send("menu:toggle-theme"),
};
contextBridge.exposeInMainWorld("menuAPI", menuAPI);

contextBridge.exposeInMainWorld("catalogAPI", catalogAPI);
