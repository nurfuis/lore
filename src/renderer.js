import "./index.css";
import { UIElements } from "./app/UIElements";
import { EntryForm } from "./app/modules/EntryForm";
import { Prompts } from "./app/utils/Prompts";
import { TemplateMaker } from "./app/modules/TemplateMaker";
import { Viewer } from "./app/modules/Viewer";
import { Menu } from "./app/modules/Menu";
const uiElements = new UIElements();
//* MAIN FEATURE *//
let catalog;
const entryForm = new EntryForm();
const prompts = new Prompts();
const templateMaker = new TemplateMaker();
const viewer = new Viewer();
const menu = new Menu();

entryForm.prompts = prompts;
prompts.entryForm = entryForm;

templateMaker.entryForm = entryForm;
entryForm.templateMaker = templateMaker;

viewer.entryForm = entryForm;

menu.viewer = viewer;

uiElements.fileBrowserButton.addEventListener("click", () => {
  window.electronAPI.openFileDialog();
  uiElements.settingsModal.style.display = "none";
  uiElements.settingsButton.style.display = "none";

});

window.catalogAPI.onOpenProject((catalog) => {
  start(catalog);
});

function start(catalog) {
  entryForm.loreLib = catalog.lore.main.data;
  entryForm.templates = catalog.templates.data.template;
  templateMaker.templates = catalog.templates.data.template;
  
  uiElements.welcomeDiv.innerText = "Select an option to begin...";
  uiElements.createButton.style.display = "";
  uiElements.viewButton.style.display = "";
  uiElements.createTemplateButton.style.display = "";

  viewer.renderGameData();
  templateMaker.updateOptions();
  entryForm.updateForm();
}

