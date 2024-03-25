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
    const welcomeBlock = document.querySelectorAll(".lore-welcome__wrapper");
    welcomeBlock[0].style.display = "none";

    const informationToast = document.querySelectorAll(
      ".lore-main__information-toast"
    );
    informationToast[0].innerText = "Select an option to begin...";
    clearToastContent(3000);
    function clearToastContent(delay) {
      setTimeout(() => {
        const toastContent = document.querySelectorAll(
          ".lore-main__information-toast"
        ); 
        if (!toastContent[0]) return; // Exit if content element not found

        const fadeOutTime = 1000; // Adjust fade-out duration in milliseconds (1 second)
        let opacity = 1;

        const fadeInterval = setInterval(() => {
          opacity -= 0.1; // Decrease opacity by 10% each interval
          toastContent[0].style.opacity = opacity;

          if (opacity <= 0) {
            clearInterval(fadeInterval);
            toastContent[0].textContent = ""; // Clear content after fade-out
          }
        }, fadeOutTime / 10); // Adjust intervals for smoother fade (100 steps)
      }, delay); // Execute after the specified delay
    }

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
