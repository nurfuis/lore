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
  console.log("fire on the mountain");
  window.menuAPI.cycleBackground();
});
const toggleThemeButton = document.querySelectorAll(
  ".main-menu__button--toggle-theme"
);
toggleThemeButton[0].addEventListener("click", () => {
  console.log("fire on the mountain");
  window.menuAPI.toggleTheme();
});
