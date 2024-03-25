const { app, BrowserWindow, ipcMain, Menu, Notification } = require("electron");

const fs = require("fs");
const path = require("path");

if (require("electron-squirrel-startup")) {
  app.quit();
}
const { APP_ICON, DEV, DIST } = require("./main/settings/appConfiguration");

const {
  _DIR,
  LORE_LIBRARY,
  LORE_LIBRARY_TEMP,
} = require("./main/settings/directoryConfiguration");

const { cycleBackgrounds } = require("./main/menu/cycleBackgrounds");
const { toggleTheme } = require("./main/menu/toggleTheme");

const { Library } = require("./catalog/process/Library");
const { CatalogAPI } = require("./catalog/process/CatalogAPI");
const { Catalog } = require("./catalog/process/Catalog");

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = true;

app.setAppUserModelId("Lore");

const userMode = DEV;

const root = getRoot(userMode);

function getRoot(userMode) {
  console.log("User mode:", userMode);

  if (DEV && userMode === DEV) {
    return `${process.env.INIT_CWD}`;
  } else if (DIST && userMode === DIST) {
    return `${app.getPath("userData")}`;
  } else {
    console.error("Undetected user mode, quitting app...:", userMode);
    app.quit();
  }
}

const appIcon = path.join(root, APP_ICON);

const DEFAULT_WINDOW_OPTIONS = {
  width: 900,
  height: 600,
  icon: appIcon,
  webPreferences: {
    preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
  },
};

app.on("ready", () => {
  const mainWindow = new BrowserWindow(DEFAULT_WINDOW_OPTIONS);

  createWindow(mainWindow);

  openLoreLibrary(mainWindow, root, userMode);
});

app.on("window-all-closed", () => {
  try {
    saveChanges({ reason: "exit" });
    function saveChanges({ reason }) {
      const mainFile = path.join(root, _DIR, LORE_LIBRARY);
      const tempFile = path.join(root, _DIR, LORE_LIBRARY_TEMP);

      try {
        fs.copyFileSync(tempFile, mainFile);
        console.log("Saved data to main file...", mainFile);

        fs.unlinkSync(tempFile);
        console.log("Temporary file removed...", tempFile);

        showSavedNotification();
        function showSavedNotification() {
          new Notification({
            title: "Changes Saved",
            body: "Your lore data has been successfully saved.",
            icon: appIcon,
          }).show();
        }
      } catch (error) {
        console.error("No changes to save.");
        if (reason == "save") {
          showNoDataSavedNotification();
          function showNoDataSavedNotification() {
            new Notification({
              title: "No Changes Detected",
              body: "There were no changes to save in your lore data.",
              icon: appIcon,
            }).show();
          }
        }
      }
    }
  } catch (error) {
    console.error("No data to write. Goodbye.");
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    const mainWindow = new BrowserWindow(DEFAULT_WINDOW_OPTIONS);
    createWindow(mainWindow);
  }
});

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

function createWindow(mainWindow) {
  const menu = Menu.buildFromTemplate([
    {
      label: "Cycle Backgrounds",
      click: () => {
        cycleBackgrounds(mainWindow, root);
      },
    },
    {
      label: "Toggle Theme",
      click: () => {
        toggleTheme(mainWindow);
      },
    },
  ]);
  Menu.setApplicationMenu(menu);

  mainWindow.setMenuBarVisibility(true);
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.webContents.openDevTools();
}
