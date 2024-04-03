const { ipcMain, dialog, app } = require("electron");
const { DEV, DIST } = require("../main/settings/appConfiguration");
const { Library } = require("./process/Library");
const { CatalogAPI } = require("./process/CatalogHandler");
const { Catalog } = require("./process/Catalog");
const {
  configureCatalogMenu,
} = require("./process/config/configureCatalogMenu");
const { cycleBackgrounds } = require("../main/menu/cycleBackgrounds");
const path = require("path");
const fs = require("fs");

let pathOverride;

function mainCatalog(mainWindow, projectPath, userMode) {
  let catalogIsLoaded;

  ipcMain.handle("dialog-file-open", handleOpenDialog);
  async function handleOpenDialog() {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    if (!canceled && !catalogIsLoaded) {
      console.log("dialog result", filePaths[0]);

      pathOverride = filePaths[0];

      mainWindow.webContents.send("catalog:send-library-path", filePaths[0]);

      return filePaths[0];
    } else {
      return { response: "Catalog already loaded: " + catalogIsLoaded };
    }
  }

  ipcMain.on("catalog:load", async (event) => {
    catalogIsLoaded = await loadCatalog(userMode, projectPath, mainWindow);

    event.returnValue = catalogIsLoaded;

    console.log("Catalog is loaded...", catalogIsLoaded);
  });
  async function loadCatalog(userMode, projectPath, mainWindow) {
    console.log("Loading catalog...");

    const library = new Library();

    const userProjectPath = pathOverride || projectPath;

    writeConfig(userProjectPath);

    const information = await library.initializeProjectDirectories(
      userProjectPath
    );

    const catalog = new Catalog(information);

    const catalogAPI = new CatalogAPI(userMode, userProjectPath);

    catalogAPI.module = catalog;

    mainWindow.webContents.send("catalog:send-full-library", catalog);
    mainWindow.webContents.send("catalog:send-library-path", userProjectPath);

    cycleBackgrounds(mainWindow, projectPath);

    configureCatalogMenu(mainWindow, projectPath);

    if (userMode === DEV) {
      return true;
    } else if (userMode === DIST) {
      return true;
    } else {
      return false;
    }
  }
}
exports.mainCatalog = mainCatalog;

function writeConfig(userProjectPath) {
  const writeTo = path.join(`${app.getPath("userData")}`, "config.json");
  console.log(userProjectPath);
  console.log(writeTo);
  try {
    fs.writeFileSync(writeTo, JSON.stringify({ USER_PATH: userProjectPath }));
  } catch (error) {
    console.error("ERRORZ");
  }
}
