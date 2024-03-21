import { UIElements } from "../UIElements";
const uiElements = new UIElements();

function toggleSettingsModal() {
  uiElements.settingsModal.style.display = "block";
}

export class Menu {
  constructor() {

    initializeWelcomeButtonStart();
    
    uiElements.createButton.addEventListener("click", () =>
      this.toggleView(true)
    );
    uiElements.viewButton.addEventListener("click", () =>
      this.toggleView(false)
    );
    uiElements.fileBrowserButton.addEventListener("click", async () => {
      const result = await electronAPI.openFileDialog();
      this.currentDirectory = result;
      console.log(this.currentDirectory);
      const modalLabels = document.querySelectorAll(".modal-label");
      for (const modalLabel of modalLabels) {
        modalLabel.innerText = "";
        modalLabel.innerText = "Project Path " + result;
      }
    });
    uiElements.modalProceedButton[0].addEventListener("click", () => {
      const result = electronAPI.init(this.currentDirectory);
      console.log(result);
      if (result) {
        uiElements.settingsModal.style.display = "none";
        const pathDisplay = document.querySelectorAll(
          ".details__project-directory"
        );
        pathDisplay[0].innerText = "";
        pathDisplay[0].innerText = "Project Path " + this.currentDirectory;
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
  }
  toggleView(showCreateForm) {
    if (uiElements.welcomeDiv.style.display != "none") {
      uiElements.welcomeDiv.style.display = "none";
    }
    if (showCreateForm) {
      // console.log('Display the entry form.');
    } else {
      // console.log('Display the viewer.');
      this.viewer.renderGameData();
    }

    uiElements.createFormContainer.style.display = showCreateForm
      ? "block"
      : "none";
    uiElements.gameDataViewer.style.display = showCreateForm ? "none" : "block";
  }
}
function initializeWelcomeButtonStart() {
  const welcomeButtonStart = document.querySelectorAll(
    ".welcome__button--start"
  );
  welcomeButtonStart[0].addEventListener("click", () => {
    const isLoaded = electronAPI.fetchLoreData();
    console.log("Project directory is loaded", isLoaded);
  });
}

