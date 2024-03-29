import { setToastText } from "../../utils/setToastText";

catalogAPI.onLoadCatalog((catalog) => {
  start(catalog);
  function start(catalog) {
    const welcomeBlock = document.querySelectorAll(".lore-welcome__wrapper");
    welcomeBlock[0].style.display = "none";

    const toastDetails = "Select an option to begin...";

    setToastText(toastDetails, 3500);

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

    const hiddenElements = document.querySelectorAll(".hidden");

    for (const element of hiddenElements) {
      element.classList.remove("hidden");
    }
  }
});
