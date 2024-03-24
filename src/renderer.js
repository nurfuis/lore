import "./index.css";
import { EntryForm } from "./catalog/modules/entryForm/EntryForm";
import { TemplateMaker } from "./catalog/modules/templateMaker/TemplateMaker";
import { Viewer } from "./catalog/modules/viewer/Viewer";

//* INSTANCES *//
const entryForm = new EntryForm();
const templateMaker = new TemplateMaker();
const viewer = new Viewer();

// Start
const welcomeButtonStart = document.querySelectorAll(
  ".lore-welcome__button--start"
);
welcomeButtonStart[0].addEventListener("click", () => {
  const isLoaded = loreAPI.loadCatalog();
  console.log("Catalog is loaded...", isLoaded);
});

// Edit Entry
const navButtonEditEntry = document.querySelectorAll(
  ".lore-navigation__button--edit-entry"
);
navButtonEditEntry[0].style.display = "none";
navButtonEditEntry[0].addEventListener("click", () => toggleView(true));

// Card Viewer
const navButtonCardViewer = document.querySelectorAll(
  ".lore-navigation__button--viewer"
);
navButtonCardViewer[0].style.display = "none";
navButtonCardViewer[0].addEventListener("click", () => toggleView(false));

// Template Maker
const navButtonTemplateMaker = document.querySelectorAll(
  ".lore-navigation__button--create-template"
);
navButtonTemplateMaker[0].style.display = "none";

// Modal
const modal = document.querySelectorAll(".modal");
const modalButtonClose = document.querySelectorAll(".modal_button--close");
for (let i = 0; i < modalButtonClose.length; i++) {
  modalButtonClose[i].addEventListener("click", function () {
    modal[i].style.display = "none";
  });
}

//* EVENTS *//
loreAPI.onSetPath((currentDirectory) => {
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

loreAPI.onLoadCatalog((catalog) => {
  start(catalog);
  function start(catalog) {
    templateMaker.templates = catalog.information.templates.data;

    const welcomeBlock = document.querySelectorAll(".lore-welcome__wrapper");
    welcomeBlock[0].style.display = "none";

    const informationToast = document.querySelectorAll(
      ".lore-main__information-toast"
    );
    informationToast[0].innerText = "Select an option to begin...";

    const navButtonEditEntry = document.querySelectorAll(
      ".lore-navigation__button--edit-entry"
    );
    navButtonEditEntry[0].style.display = "";

    const navButtonCreateTemplate = document.querySelectorAll(
      ".lore-navigation__button--create-template"
    );
    navButtonCreateTemplate[0].style.display = "";

    const navButtonViewer = document.querySelectorAll(
      ".lore-navigation__button--viewer"
    );
    navButtonViewer[0].style.display = "";
  }
});

//* FUNCS *//
function toggleView(showCreateForm) {
  if (showCreateForm) {
    templateMaker.updateOptions();
    entryForm.updateForm();   
  } else {
    viewer.renderGameData();
  }

  const editEntryFormWrapper = document.querySelectorAll(
    ".edit-entry__form-wrapper"
  );
  editEntryFormWrapper[0].style.display = showCreateForm ? "block" : "none";

  const viewerCardsWrapper = document.querySelectorAll(
    ".viewer__cards-wrapper"
  );
  viewerCardsWrapper[0].style.display = showCreateForm ? "none" : "block";
}
