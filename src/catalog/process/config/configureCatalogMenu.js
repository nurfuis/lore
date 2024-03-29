const { Menu, ipcMain } = require("electron");
const { cycleBackgrounds } = require("../../../main/menu/cycleBackgrounds");
const { toggleTheme } = require("../../../main/menu/toggleTheme");

function configureCatalogMenu(window, projectPath) {
  const menu = Menu.buildFromTemplate([
    {
      label: "Cycle Backgrounds",
      click: () => {
        cycleBackgrounds(window, projectPath);
      },
    },
    {
      label: "Toggle Theme",
      click: () => {
        toggleTheme(window);
      },
    },
  ]);
  // window.titleBarStyle = "hidden";

  // Menu.setApplicationMenu(menu);
  // window.setMenuBarVisibility(true);
  ipcMain.on("menu:toggle-theme", () => {
    toggleTheme(window);
  });

  ipcMain.on("menu:cycle-background", () => {
    cycleBackgrounds(window, projectPath);
  });
}
exports.configureCatalogMenu = configureCatalogMenu;
