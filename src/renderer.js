import "./index.css";
import { UIElements } from "./app/UIElements";
import { EntryForm } from "./app/modules/EntryForm";
import { Prompts } from "./app/utils/Prompts";
import { TemplateMaker } from "./app/modules/TemplateMaker";
import { Viewer } from "./app/modules/Viewer";
import { Menu } from "./app/modules/Menu";

const uiElements = new UIElements();
//* MAIN FEATURE *//
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

async function startUp() {

  const maxTries = 120;
  let tries = 0;
  while (true) {
    const loreData = window.loreData;
    entryForm.loreLib = loreData.getLore();
    if (entryForm.loreLib.dateId) {
      const templateData = window.templateData;
      templateMaker.templates = templateData.getMaps();

      uiElements.welcomeDiv.innerText = "Select an option to begin...";
      uiElements.createButton.style.display = "";
      uiElements.viewButton.style.display = "";
      uiElements.createTemplateButton.style.display = "";

      viewer.renderGameData();
      templateMaker.updateOptions();
      entryForm.updateForm();
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 1 second

    tries++;
    if (tries >= maxTries) {
      break;
    }
  }
}
uiElements.fileBrowserButton.addEventListener("click", () => {
  window.electronAPI.openFileDialog();
  uiElements.settingsModal.style.display = "none";

});
startUp();
