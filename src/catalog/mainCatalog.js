const { ipcMain } = require("electron");
const { DEV, DIST } = require("../main/settings/appConfiguration");
const { Library } = require("./process/Library");
const { CatalogAPI } = require("./process/CatalogAPI");
const { Catalog } = require("./process/Catalog");
const { configureCatalogMenu } = require("./process/configureCatalogMenu");

function mainCatalog(mainWindow, projectPath, userMode) {
  ipcMain.on("catalog:load", async (event) => {
    const catalogIsLoaded = await loadCatalog(userMode, projectPath, mainWindow);
    
    event.returnValue = catalogIsLoaded;

    console.log("Catalog is loaded...", catalogIsLoaded);
  });

  async function loadCatalog(userMode, projectPath, mainWindow) {
    console.log("Loading catalog...");

    const library = new Library();

    const information = await library.initializeProjectDirectories(projectPath);

    const catalog = new Catalog(information);

    const catalogAPI = new CatalogAPI(userMode, projectPath);
    
    catalogAPI.module = catalog;

    mainWindow.webContents.send("catalog:send-full-library", catalog);
    mainWindow.webContents.send("catalog:send-library-path", projectPath);

    configureCatalogMenu(mainWindow, projectPath);

    if (userMode === DEV) {
      return information;
    } else if (userMode === DIST) {
      return true;
    } else {
      return false;
    }
  }
}
exports.mainCatalog = mainCatalog;
