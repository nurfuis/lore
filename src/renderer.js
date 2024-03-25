import "./index.css";
import { EntryForm } from "./catalog/modules/entryForm/EntryForm";
import { TemplateMaker } from "./catalog/modules/templateMaker/TemplateMaker";
import { Viewer } from "./catalog/modules/viewer/Viewer";

import { onLoadLoreCatalog } from "./catalog/events/onLoadLoreCatalog"; // This is used
import { welcomeButtonStartLoreCatalog } from "./catalog/buttons/welcomeButtonStartLoreCatalog";

//* INSTANCES *//
const entryForm = new EntryForm();
const templateMaker = new TemplateMaker();
const viewer = new Viewer();

// Start
welcomeButtonStartLoreCatalog();

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

//* FUNCS *//
export function toggleView(showCreateForm) {
  if (showCreateForm) {
    templateMaker.updateTemplateMakerDropdownOptions();
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
