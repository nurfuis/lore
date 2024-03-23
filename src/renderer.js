import "./index.css";
import { EntryForm } from "./app/modules/entryForm/EntryForm";
import { TemplateMaker } from "./app/modules/templateMaker/TemplateMaker";
import { Viewer } from "./app/modules/viewer/Viewer";
import { Menu } from "./app/Menu";

//* MAIN FEATURE *//
const entryForm = new EntryForm();
const templateMaker = new TemplateMaker();
const viewer = new Viewer();
const menu = new Menu();

templateMaker.entryForm = entryForm;

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
  templateMaker.templates = catalog.information.templates.data;

  const welcomeBlock = document.querySelectorAll(".lore-welcome__wrapper");
  welcomeBlock[0].style.display = "none";

  const informationToast = document.querySelectorAll(".lore-main__information-toast");
  informationToast[0].innerText = "Select an option to begin...";

  const navButtonEditEntry = document.querySelectorAll(".lore-navigation__button--edit-entry")
  navButtonEditEntry[0].style.display = "";

  const navButtonCreateTemplate = document.querySelectorAll(".lore-navigation__button--create-template")
  navButtonCreateTemplate[0].style.display = "";

  const navButtonViewer = document.querySelectorAll(".lore-navigation__button--viewer")
  navButtonViewer[0].style.display = "";

  viewer.renderGameData();
  templateMaker.updateOptions();
  entryForm.updateForm();
}

function initializeWelcomeButtonStart() {
  const welcomeButtonStart = document.querySelectorAll(
    ".lore-welcome__button--start"
  );
  welcomeButtonStart[0].addEventListener("click", () => {
    const isLoaded = electronAPI.loadLoreData();
    console.log("Project directory is loaded", isLoaded);
  });
}
