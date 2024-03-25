const { contextBridge } = require("electron");
const { catalogHandlers } = require("./catalog/preloadCatalog");

contextBridge.exposeInMainWorld("catalogHandlers", catalogHandlers);
