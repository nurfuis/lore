import "./main.css";
const { app, BrowserWindow, Notification, Menu, ipcMain } = require("electron");

const path = require("path");
const fs = require("fs");

if (require("electron-squirrel-startup")) {
  app.quit();
}
const { DEV, DIST } = require("./main/settings/appConfiguration");

const { themes } = require("./main/settings/themes");

const { mainCatalog } = require("./catalog/mainCatalog");

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = true;
Menu.setApplicationMenu(null);
app.setAppUserModelId("Lore");

const userMode = DIST;

const projectPath = getProjectPath(userMode);

function getProjectPath(userMode) {
  console.log("User mode:", userMode);

  if (DEV && userMode === DEV) {
    return `${process.env.INIT_CWD}`;
  } else if (DIST && userMode === DIST) {
    let usePath;
    try {
      const configFile = path.join(`${app.getPath("userData")}`, "config.json");
      usePath = JSON.parse(fs.readFileSync(configFile, "utf-8"));
    } catch (error) {
      console.log("No config created, falling back to userData path.");
    }

    const projectPath = usePath?.USER_PATH || `${app.getPath("userData")}`;

    return projectPath;
  } else {
    console.error("Undetected user mode, quitting app...:", userMode);
    app.quit();
  }
}
const appIcon = path.join(__dirname, "7986bebb473f94fb3559.png");

const DEFAULT_WINDOW_OPTIONS = {
  width: 900,
  height: 600,
  backgroundColor: themes.earth.background,
  show: false,
  icon: appIcon,
  titleBarStyle: "hidden",
  webPreferences: {
    preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
  },
};

let mainWindow;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.on("ready", () => {
    mainWindow = new BrowserWindow(DEFAULT_WINDOW_OPTIONS);
    configureWindow(mainWindow);
    const catalog = mainCatalog(mainWindow, projectPath, userMode);
  });
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = new BrowserWindow(DEFAULT_WINDOW_OPTIONS);
      configureWindow(mainWindow);
    }
  });
  app.on("window-all-closed", () => {
    saveAndQuit();

    if (process.platform !== "darwin") {
      app.quit();
    }
  });
  ipcMain.on("menu:save-and-quit", () => {
    saveAndQuit();
  });
  function saveAndQuit() {
    try {
      saveChanges({ reason: "save" });
      function saveChanges({ reason }) {
        const {
          _DIR,
          LORE_LIBRARY,
          LORE_LIBRARY_TEMP,
        } = require("./catalog/process/config/directoryConfiguration");

        const configFile = path.join(
          `${app.getPath("userData")}`,
          "config.json"
        );
        const usePath = JSON.parse(fs.readFileSync(configFile, "utf-8"));

        const mainFile = path.join(usePath.USER_PATH, _DIR, LORE_LIBRARY);
        const tempFile = path.join(usePath.USER_PATH, _DIR, LORE_LIBRARY_TEMP);

        try {
          fs.copyFileSync(tempFile, mainFile);
          console.log("Saved data to main file...", mainFile);

          fs.unlinkSync(tempFile);
          console.log("Temporary file removed...", tempFile);

          showSavedNotification();
          function showSavedNotification() {
            app.setAppUserModelId("Lore");

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
              app.setAppUserModelId("Lore");

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
    app.quit();
    if (process.platform !== "darwin") {
      app.quit();
    }
  }
  function configureWindow(window) {
    window.setMenuBarVisibility(false);
    window.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    window.once("ready-to-show", () => {
      window.show();
      window.webContents.send("catalog:send-library-path", projectPath);
      window.webContents.openDevTools();
    });
  }
}
