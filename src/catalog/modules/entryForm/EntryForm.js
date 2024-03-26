import { toggleView } from "../../../renderer";
import { removeExtension } from "../../../utils/removeExtension";
import { Prompts } from "./promptGenerator/Prompts";
import { promptTemplates } from "./promptGenerator/promptTemplates";

export class EntryForm {
  constructor() {
    const promptGenerator = new Prompts();
    promptGenerator.ready();

    const navButtonEditEntry = document.querySelectorAll(
      ".lore-navigation__button--edit-entry"
    );
    navButtonEditEntry[0].style.display = "none";
    navButtonEditEntry[0].addEventListener("click", () => {
      const editEntryFormWrapper = document.querySelectorAll(
        ".edit-entry__form-wrapper"
      );
      if (editEntryFormWrapper[0].style.display != "block") {
        editEntryFormWrapper[0].style.display = "block";
        this.updateForm();
        const viewerCardsWrapper = document.querySelectorAll(
          ".viewer__cards-wrapper"
        );
        viewerCardsWrapper[0].style.display = "none";

        const entryFormTemplateSelect = document.querySelectorAll(
          ".entry-form__template-select"
        );
        entryFormTemplateSelect[0].value = "";

        const entryFormPrototypeSelect = document.querySelectorAll(
          ".entry-form__prototype-select"
        );
        entryFormPrototypeSelect[0].value = "";
        entryFormPrototypeSelect[0].disabled = true;
      }
    });

    // TEMPLATE SELECTOR
    const entryFormTemplateSelect = document.querySelectorAll(
      ".entry-form__template-select"
    );
    entryFormTemplateSelect[0].addEventListener("change", () => {
      this.updateForm();
      this.updatePrototypeDropdown();
    });

    // PROTOTYPE SELECTOR
    const entryFormPrototypeSelect = document.querySelectorAll(
      ".entry-form__prototype-select"
    );
    entryFormPrototypeSelect[0].addEventListener("change", (event) => {
      this.handlePrototypeSelect(event);
    });

    // CLEAR FORM
    const entryFormCommandButtonClear = document.querySelectorAll(
      ".entry-form__commands-button--clear"
    );
    entryFormCommandButtonClear[0].addEventListener("click", () => {
      this.clearEntryForm();
    });

    // IMAGE INPUT
    const entryFormImageInput = document.querySelectorAll(
      ".entry-form__image--input"
    );
    entryFormImageInput[0].addEventListener("change", (event) => {
      this.updateImagePreview(event);
    });

    // IMAGE CLEAR
    const entryFormImageClear = document.querySelectorAll(
      ".entry-form__image-button--clear"
    );
    entryFormImageClear[0].addEventListener("click", () => {
      this.clearImagePreview();
    });

    // SAVE ENTRY
    const entryFormSaveAll = document.querySelectorAll(
      ".entry-form__save-button"
    );
    entryFormSaveAll[0].addEventListener("click", () => {
      this.saveEntry();
    });
  }

  clearEntryForm() {
    const entryFormTemplateSelect = document.querySelectorAll(
      ".entry-form__template-select"
    );
    const entryFormPrototypeSelect = document.querySelectorAll(
      ".entry-form__prototype-select"
    );

    entryFormTemplateSelect[0].selectedIndex = 0;
    entryFormPrototypeSelect[0].selectedIndex = 0;

    this.updateForm();
    this.updatePrototypeDropdown();
  }

  handlePrototypeSelect(event) {
    // avtive entry
    const selectedEntry = event.target.value;

    // active template
    const entryFormTemplateSelect = document.querySelectorAll(
      ".entry-form__template-select"
    );
    const selectedTemplate = entryFormTemplateSelect[0].value;

    // fill out the form with the selected entry
    if (selectedTemplate) {
      let hasSprite = false;

      const templateKey = selectedTemplate;
      const entryKey = selectedEntry;

      const loreEntry = window.catalogAPI.getInformationLoreEntry({
        templateKey,
        entryKey,
      });

      for (const field in loreEntry) {
        if (field === "sprite") {
          hasSprite = true;
          this.setPreview(loreEntry[field]);
        } else if (field !== "valid" && field !== "version") {
          const element = document.querySelector(`[name=${field}]`);
          element.value = loreEntry[field];
        }
      }

      if (!hasSprite) {
        this.clearImagePreview();
      }

      const entryFormGeneratePromptButton = document.querySelectorAll(
        ".entry-form__commands-button--generate-prompt"
      );
      if (!!selectedEntry) {
        entryFormGeneratePromptButton[0].style.display = "flex";
      } else {
        entryFormGeneratePromptButton[0].style.display = "none";
        this.updateForm();
      }
    }
  }

  enablePrototypeDropdown() {
    try {
      const entryFormPrototypeSelect = document.querySelectorAll(
        ".entry-form__prototype-select"
      );
      if (entryFormPrototypeSelect[0].options.length > 1) {
        entryFormPrototypeSelect[0].disabled = false;
      } else {
        console.info("No prototypes available for this template.");
        entryFormPrototypeSelect[0].disabled = true;
      }
    } catch (error) {
      console.error("Error enabling prototype dropdown:", error);
      entryFormPrototypeSelect[0].disabled = true;
    }
  }

  resetPrototypeDropdown() {
    const entryFormPrototypeSelect = document.querySelectorAll(
      ".entry-form__prototype-select"
    );
    entryFormPrototypeSelect[0].selectedIndex = 0;
    entryFormPrototypeSelect[0].innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.text = "-- Select Entry (Optional) --";
    entryFormPrototypeSelect[0].appendChild(defaultOption);
    entryFormPrototypeSelect[0].disabled = true;
  }

  updatePrototypeDropdown() {
    const entryFormPrototypeSelect = document.querySelectorAll(
      ".entry-form__prototype-select"
    );

    entryFormPrototypeSelect[0].selectedIndex = 0;
    entryFormPrototypeSelect[0].innerHTML = "";

    const entryFormGeneratePromptButton = document.querySelectorAll(
      ".entry-form__commands-button--generate-prompt"
    );

    entryFormGeneratePromptButton[0].style.display = "none";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.text = "-- Select Entry (Optional) --";
    entryFormPrototypeSelect[0].appendChild(defaultOption);

    const entryFormTemplateSelect = document.querySelectorAll(
      ".entry-form__template-select"
    );
    const selectedTemplate = entryFormTemplateSelect[0].value;
    if (selectedTemplate) {
      const templateKey = selectedTemplate;
      const allCatagoryEntries =
        window.catalogAPI.getInformationLoreCatagory(templateKey);

      const prototypeNames = Object.keys(allCatagoryEntries);
      if (prototypeNames) {
        prototypeNames.sort();

        prototypeNames.forEach((prototypeName) => {
          const option = document.createElement("option");
          option.value = prototypeName;
          option.text = prototypeName;
          entryFormPrototypeSelect[0].appendChild(option);
        });
        this.enablePrototypeDropdown();
      } else {
        console.info("No prototypes available for this template.");
      }
    }
  }

  clearImagePreview() {
    const entryFormImagePreview = document.querySelectorAll(
      ".entry-form__image--preview"
    );
    entryFormImagePreview[0].src = "";
    entryFormImagePreview[0].style.display = "none";

    const entryFormImageInput = document.querySelectorAll(
      ".entry-form__image--input"
    );
    entryFormImageInput[0].value = "";
    this.spriteKey = undefined;
  }

  setPreview(fileKey) {
    this.spriteKey = fileKey;
    const imageSource = window.catalogAPI.getPathSpritesPreview(fileKey);

    const entryFormImagePreview = document.querySelectorAll(
      ".entry-form__image--preview"
    );

    entryFormImagePreview[0].src = imageSource;

    entryFormImagePreview[0].style.display = "block";
  }

  async updateImagePreview(event) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      console.error("Please select an image file.");
      return;
    }

    const pathToSource = catalogAPI.saveImage(file.path);

    const entryFormImagePreview = document.querySelectorAll(
      ".entry-form__image--preview"
    );

    entryFormImagePreview[0].src = `${pathToSource}`;
    entryFormImagePreview[0].style.display = "block";

    this.spriteKey = removeExtension(file.name);

    console.log("save:lore-image", file.name);
  }

  updateForm() {
    this.clearImagePreview();

    const entryFormElement = document.querySelectorAll(
      ".entry-form__form-element"
    );
    entryFormElement[0].innerHTML = "";

    const entryFormSaveAll = document.querySelectorAll(
      ".entry-form__save-button"
    );

    const entryFormImageInput = document.querySelectorAll(".entry-form__image");

    const entryFormCommandButtonClear = document.querySelectorAll(
      ".entry-form__commands-button--clear"
    );

    const elementsToShow = [
      entryFormElement[0],
      entryFormSaveAll[0],
      entryFormImageInput[0],
      entryFormCommandButtonClear[0],
    ];

    const elementsToHide = [];

    const entryFormTemplateSelect = document.querySelectorAll(
      ".entry-form__template-select"
    );
    const selectedTemplate = entryFormTemplateSelect[0].value;

    if (!!selectedTemplate) {
      const templateFields =
        window.catalogAPI.getInformationTemplateFields(selectedTemplate);

      for (const fieldName in templateFields) {
        const fieldData = templateFields[fieldName];

        const label = document.createElement("label");
        label.textContent = fieldData.label;

        const promptSpan = document.createElement("span");
        promptSpan.classList.add("prompt");

        promptSpan.textContent =
          fieldData.prompt || promptTemplates[fieldName] || fieldData.label;

        let inputElement;
        switch (fieldData.type) {
          case "text":
            inputElement = document.createElement("input");
            inputElement.type = "text";

            // Escape spaces in the field name for attribute safety
            inputElement.name = fieldName.replace(/\s/g, "_");
            break;
          case "textarea":
            inputElement = document.createElement("textarea");
            // Escape spaces in the field name for attribute safety
            inputElement.name = fieldName.replace(/\s/g, "_");
            break;
          case "select":
            inputElement = document.createElement("select");
            // Escape spaces in the field name for attribute safety
            inputElement.name = fieldName.replace(/\s/g, "_");
            for (const option of fieldData.options) {
              const optionElement = document.createElement("option");
              optionElement.text = option;
              optionElement.value = option;
              inputElement.appendChild(optionElement);
            }
            break;
        }

        // assemble the elements
        const br = document.createElement("br");
        entryFormElement[0].appendChild(label);
        entryFormElement[0].appendChild(promptSpan);
        entryFormElement[0].appendChild(inputElement);
        entryFormElement[0].appendChild(br);
      }
      elementsToShow.forEach((element) => (element.style.display = "block")); // Show elements
      elementsToHide.forEach((element) => (element.style.display = "none")); // Show elements
    } else {
      elementsToShow.forEach((element) => (element.style.display = "none")); // Hide elements
      elementsToHide.forEach((element) => (element.style.display = "block")); // Hide elements
      this.resetPrototypeDropdown();
    }
  }

  saveEntry() {
    const newEntry = {};
    newEntry["valid"] = true;

    const entryFormElement = document.querySelectorAll(
      ".entry-form__form-element"
    );

    const formData = new FormData(entryFormElement[0]);
    for (const [key, value] of formData.entries()) {
      newEntry[key] = value;
    }

    const entryFormImageInput = document.querySelectorAll(
      ".entry-form__image--input"
    );

    if (!!entryFormImageInput[0].value || this.spriteKey) {
      const filePath = removeExtension(
        entryFormImageInput[0].value || this.spriteKey
      );
      const parts = filePath.split(/[\\/]/);

      newEntry["sprite"] = parts[parts.length - 1];
    }

    const entryFormTemplateSelect = document.querySelectorAll(
      ".entry-form__template-select"
    );
    entryFormTemplateSelect[0].value;

    const templateKey = entryFormTemplateSelect[0].value;

    const response = window.catalogAPI.saveInformationLoreEntry({
      templateKey,
      newEntry,
      flags: "none",
    });

    console.log("save entry:", response);

    const buttonsWrapper = document.querySelectorAll(".modal_buttons-wrapper");
    function clearButtonsWrapper() {
      if (buttonsWrapper && buttonsWrapper.length > 0) {
        clearElementChildren(buttonsWrapper[0]); // Clear children of the first buttons wrapper
        function clearElementChildren(element) {
          if (!element || !element.nodeType) {
            return;
          }

          for (let i = element.children.length - 1; i >= 0; i--) {
            element.removeChild(element.children[i]);
          }
        }
      }
    }

    const modalButtonClose = document.querySelectorAll(".modal_button--close");
    modalButtonClose[4].addEventListener("click", clearButtonsWrapper);

    if (response.status === "incomplete") {
      const modal = document.querySelectorAll(".modal");
      modal[4].style.display = "block";

      const message = document.querySelectorAll(".modal__error-message");
      message[0].innerText = response.message;

      const acceptButton = document.createElement("button");
      acceptButton.textContent = "OK";
      acceptButton.classList.add("modal__error--ok");

      buttonsWrapper[0].appendChild(acceptButton);

      acceptButton.addEventListener("click", () => {
        modal[4].style.display = "none";

        buttonsWrapper[0].removeChild(acceptButton);
      });
    } else if (response.status === "conflict") {
      const modal = document.querySelectorAll(".modal");
      modal[4].style.display = "block";

      const message = document.querySelectorAll(".modal__error-message");
      message[0].innerText = response.message;

      const cancelButton = document.createElement("button");
      cancelButton.textContent = "Cancel";
      cancelButton.classList.add("modal__button");

      const overwriteButton = document.createElement("button");
      overwriteButton.textContent = "Overwrite";
      overwriteButton.classList.add("modal__button");
      overwriteButton.classList.add("modal__button--destructive");

      buttonsWrapper[0].appendChild(cancelButton);
      buttonsWrapper[0].appendChild(overwriteButton);

      // Add event listeners
      cancelButton.addEventListener("click", () => {
        modal[4].style.display = "none";
        buttonsWrapper[0].removeChild(cancelButton);
        buttonsWrapper[0].removeChild(overwriteButton);
        window.scrollTo(0, 0);
      });

      overwriteButton.addEventListener("click", () => {
        const response = window.catalogAPI.saveInformationLoreEntry({
          templateKey,
          newEntry,
          flags: "canOverwrite",
        });
        console.log(response);

        this.updateForm();
        this.updatePrototypeDropdown();

        const informationToast = document.querySelectorAll(
          ".lore-main__information-toast"
        );
        informationToast[0].innerText = response.message;

        modal[4].style.display = "none";
        buttonsWrapper[0].removeChild(cancelButton);
        buttonsWrapper[0].removeChild(overwriteButton);
      });
    } else if (response.status === "resolved") {
      this.updateForm();
      this.updatePrototypeDropdown();

      const informationToast = document.querySelectorAll(
        ".lore-main__information-toast"
      );
      informationToast[0].innerText = response.message;
      window.scrollTo(0, 0);
      console.log("Saved entry succesfully.");
    } else {
      const informationToast = document.querySelectorAll(
        ".lore-main__information-toast"
      );
      informationToast[0].innerText = response.message;
    }
  }
}
