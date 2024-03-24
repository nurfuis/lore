import { UIElements } from "./UIElements";
const uiElements = new UIElements();

export class Menu {
  constructor() {
    const navButtonEditEntry = document.querySelectorAll(
      ".lore-navigation__button--edit-entry"
    );
    navButtonEditEntry[0].addEventListener("click", () =>
      this.toggleView(true)
    );
    const navButtonViewCards = document.querySelectorAll(
      ".lore-navigation__button--viewer"
    );
    navButtonViewCards[0].addEventListener("click", () =>
      this.toggleView(false)
    );
    
    const modal = document.querySelectorAll(".modal");
    const modalButtonClose = document.querySelectorAll(".modal_button--close");
    for (let i = 0; i < modalButtonClose.length; i++) {
      modalButtonClose[i].addEventListener("click", function () {
        modal[i].style.display = "none";
      });
    }
  }
  toggleView(showCreateForm) {
    if (showCreateForm) {
      // console.log('Display the entry form.');
    } else {
      // console.log('Display the viewer.');
      this.viewer.renderGameData();
    }

    const editEntryFormWrapper = document.querySelectorAll(
      ".edit-entry__form-wrapper"
    );
    editEntryFormWrapper[0].style.display = showCreateForm ? "block" : "none";

    uiElements.gameDataViewer.style.display = showCreateForm ? "none" : "block";
  }
}
