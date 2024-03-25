const { contextBridge } = require("electron");
const { catalogAPI } = require("./catalog/preloadCatalogAPI");

contextBridge.exposeInMainWorld("catalogAPI", catalogAPI);
