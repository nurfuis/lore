const { contextBridge } = require("electron");
const { catalogHandler } = require("./catalog/preloadCatalog");

contextBridge.exposeInMainWorld("catalogHandler", catalogHandler);
