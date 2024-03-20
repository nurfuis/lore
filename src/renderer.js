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
// Couple the entry form with prompts
entryForm.prompts = prompts;
prompts.entryForm = entryForm;
// Couple the entry form with templates
templateMaker.entryForm = entryForm;
entryForm.templateMaker = templateMaker;
// Inject the viewer with entryForm
viewer.entryForm = entryForm;
// Inject the menu with viewer
menu.viewer = viewer;
// * OPEN THE CATALOG *//
function start(catalog) {
  entryForm.loreLib = catalog.lore.main.data;
  entryForm.templates = catalog.templates.data;
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
// Listen for start command and its data pack
electronAPI.onOpenProject((catalog) => {
  start(catalog);
});
// make an event to listen for the update
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
