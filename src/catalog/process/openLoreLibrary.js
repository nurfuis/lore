const { ipcMain } = require("electron");
const { DEV, DIST } = require("../../main/settings/appConfiguration");
const { Library } = require("./Library");
const { CatalogAPI } = require("./CatalogAPI");
const { Catalog } = require("./Catalog");

function openLoreLibrary(mainWindow, root, userMode) {
  ipcMain.on("catalog:load", async (event) => {
    const catalogIsLoaded = await loadCatalog(userMode, root, mainWindow);
    event.returnValue = catalogIsLoaded;

    console.log("Catalog is loaded...", catalogIsLoaded);
  });

  async function loadCatalog(userMode, root, mainWindow) {
    console.log("Loading catalog...");

    const library = new Library();

    const information = await library.initializeProjectDirectories(root);

    const catalog = new Catalog(information);

    const catalogAPI = new CatalogAPI(userMode, root);
    catalogAPI.module = catalog;

    mainWindow.webContents.send("catalog:send-full-library", catalog);
    mainWindow.webContents.send("catalog:send-library-path", root);
    if (userMode === DEV) {
      return information;
    } else if (userMode === DIST) {
      return true;
    } else {
      return false;
    }
  }
}
exports.openLoreLibrary = openLoreLibrary;
