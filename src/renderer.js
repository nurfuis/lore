import "./index.css";
import { UIElements } from "./app/UIElements";
import { EntryForm } from "./app/modules/EntryForm";
import { Prompts } from "./app/modules/Prompts";
import { TemplateMaker } from "./app/modules/TemplateMaker";
import { Viewer } from "./app/modules/Viewer";
import { Menu } from "./app/modules/Menu";

//* MAIN FEATURE *//
const uiElements = new UIElements();
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

// * OPEN THE CATALOG *//
initializeWelcomeButtonStart();

electronAPI.onOpenProject((catalog) => {
  start(catalog);
});
electronAPI.onSetProjectDirectory((currentDirectory) => {
  setDetailsProjectDirectory(currentDirectory);
  function setDetailsProjectDirectory(currentDirectory) {
    const detailsProjectDirectory = document.querySelectorAll(
      ".details__project-directory"
    );
    detailsProjectDirectory[0].innerText = "";
    detailsProjectDirectory[0].innerText = "Project Path " + currentDirectory;
    return true;
  }
});

function start(catalog) {
  entryForm.loreLib = catalog.lore.main.data;
  entryForm.templates = catalog.templates.data;
  // TODO start move over to new catalog property?
  entryForm.sprites = catalog.sprites;
  viewer.sprites = catalog.sprites;
  console.log(
    "renderer templates injection to entry form",
    catalog.templates.data
  );
  // entry form is coupled to the templates now
  // it can read templates from thetemplates module now
  // and the references need to be updated in entryForm
  // before unlinking templates from the entry form here
  templateMaker.templates = catalog.templates.data;
  // The block below configures the workspace elements
  // it can probably be part of the menu and use a method to run it
  uiElements.welcomeDiv.innerText = "Select an option to begin...";
  uiElements.createButton.style.display = "";
  uiElements.viewButton.style.display = "";
  uiElements.createTemplateButton.style.display = "";
  // The next part tells the modules that their data is loaded
  // and to hurry up and set their initial states
  viewer.renderGameData();
  templateMaker.updateOptions();
  entryForm.updateForm();
}
function initializeWelcomeButtonStart() {
  const welcomeButtonStart = document.querySelectorAll(
    ".welcome__button--start"
  );
  welcomeButtonStart[0].addEventListener("click", () => {
    const isLoaded = electronAPI.loadLoreData();
    console.log("Project directory is loaded", isLoaded);
  });
}


