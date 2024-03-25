const { Menu } = require("electron");
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
  Menu.setApplicationMenu(menu);
  window.setMenuBarVisibility(true);
}
exports.configureCatalogMenu = configureCatalogMenu;
