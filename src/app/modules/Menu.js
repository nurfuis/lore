import { UIElements } from "../UIElements";
const uiElements = new UIElements();

function toggleSettingsModal() {
  uiElements.settingsModal.style.display = "block";
}

export class Menu {
  constructor() {
    uiElements.createButton.addEventListener("click", () =>
      this.toggleView(true)
    );
    uiElements.viewButton.addEventListener("click", () =>
      this.toggleView(false)
    );
    uiElements.settingsButton.addEventListener("click", () =>
      toggleSettingsModal()
    );
    window.addEventListener("click", function (event) {
      if (event.target === uiElements.settingsModal) {
        uiElements.settingsModal.style.display = "none";
      }
    });

    uiElements.closeModalButton.addEventListener("click", function () {
      uiElements.modal.style.display = "none";
    });
  }
  toggleView(showCreateForm) {
    if (uiElements.welcomeDiv.style.display != "none") {
      uiElements.welcomeDiv.style.display = "none";
    }

    if (showCreateForm) {
      console.log("Showing edit entry form.");
    } else {
      console.log("Showing viewer.");
      this.viewer.renderGameData();
    }

    uiElements.createFormContainer.style.display = showCreateForm
      ? "block"
      : "none";
    uiElements.gameDataViewer.style.display = showCreateForm ? "none" : "block";
  }
}
