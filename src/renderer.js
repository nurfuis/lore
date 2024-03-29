import "./index.css";
import { intitCloseModalButton } from "./renderer/intitCloseModalButton";
intitCloseModalButton();

import { RendererCatalog } from "./catalog/RendererCatalog.js";
const catalog = new RendererCatalog();
console.log(catalog);

const cycleBackgroundButton = document.querySelectorAll(
  ".main-menu__button--cycle-background"
);
cycleBackgroundButton[0].addEventListener("click", () => {
  window.menuAPI.cycleBackground();
});
const toggleThemeButton = document.querySelectorAll(
  ".main-menu__button--toggle-theme"
);
toggleThemeButton[0].addEventListener("click", () => {
  window.menuAPI.toggleTheme();
});
const saveAndQuitButton = document.querySelectorAll(
  ".main-menu__button--save"
);
saveAndQuitButton[0].addEventListener("click", () => {
  window.menuAPI.saveAndQuit();
});
