const { app, BrowserWindow, Menu, Notification } = require("electron");

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
} = require("./catalog/process/directoryConfiguration");

const { cycleBackgrounds } = require("./main/menu/cycleBackgrounds");
const { toggleTheme } = require("./main/menu/toggleTheme");

const { openLoreLibrary } = require("./catalog/process/openLoreLibrary");
const { themes } = require("./main/settings/themes");

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
  backgroundColor: themes.earth.background,
  show: false,
  icon: appIcon,
  webPreferences: {
    preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
  },
};

app.on("ready", () => {
  const mainWindow = new BrowserWindow(DEFAULT_WINDOW_OPTIONS);
  configureWindow(mainWindow);
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
    configureWindow(mainWindow);
  }
});

function configureWindow(window) {
  const menu = Menu.buildFromTemplate([
    {
      label: "Cycle Backgrounds",
      click: () => {
        cycleBackgrounds(window, root);
      },
    },
    {
      label: "Toggle Theme",
      click: () => {
        toggleTheme(window);
      },
    },
  ]);
  Menu.setApplicationMenu(menu);

  window.setMenuBarVisibility(true);
  window.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  // window.webContents.openDevTools();
  window.once('ready-to-show', () => {
    window.show()
  })
}
