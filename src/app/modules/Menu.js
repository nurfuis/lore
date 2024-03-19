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
    uiElements.settingsButton.addEventListener("click", () => {
      toggleSettingsModal();

      const userPath = electronAPI.getRoot();
      const modalLabels = document.querySelectorAll(".modal-label");

      for (const modalLabel of modalLabels) {
        modalLabel.innerText = "";
        modalLabel.innerText = "Project Path " + userPath;
      }
    });
    uiElements.modalProceedButton[0].addEventListener("click", () => {
      const result = electronAPI.init();
      if (result) {
        uiElements.settingsModal.style.display = "none";
      }
    });

    window.addEventListener("click", function (event) {
      if (event.target === uiElements.settingsModal) {
        uiElements.settingsModal.style.display = "none";
      }
    });

    uiElements.closeModalButton.addEventListener("click", function () {
      uiElements.modal.style.display = "none";
    });
    // Listen for
    uiElements.fileBrowserButton.addEventListener("click", () => {
      electronAPI.openFileDialog();
      uiElements.settingsModal.style.display = "none";
      uiElements.settingsButton.style.display = "none";
    });
  }
  toggleView(showCreateForm) {
    if (uiElements.welcomeDiv.style.display != "none") {
      uiElements.welcomeDiv.style.display = "none";
    }

    if (showCreateForm) {
      console.log("Display the entry form.");
    } else {
      console.log("Display the viewer.");
      this.viewer.renderGameData();
    }

    uiElements.createFormContainer.style.display = showCreateForm
      ? "block"
      : "none";
    uiElements.gameDataViewer.style.display = showCreateForm ? "none" : "block";
  }
}
