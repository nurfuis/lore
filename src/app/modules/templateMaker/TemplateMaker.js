import { UIElements } from "../../UIElements";
const uiElements = new UIElements();

function createNewField() {
  const newField = document.createElement("div");
  newField.classList.add("template-field");

  const fieldNameLabel = document.createElement("label");
  fieldNameLabel.textContent = "Field Name:";
  newField.appendChild(fieldNameLabel);

  const fieldNameInput = document.createElement("input");
  fieldNameInput.type = "text";
  fieldNameInput.name = "field-name";
  fieldNameInput.required = true;
  newField.appendChild(fieldNameInput);

  const fieldTypeSelect = document.createElement("select");
  fieldTypeSelect.name = "field-type";
  newField.appendChild(fieldTypeSelect);

  const fieldPromptLabel = document.createElement("label");
  fieldPromptLabel.textContent = "Field Prompt:";
  newField.appendChild(fieldPromptLabel);

  const fieldPrompt = document.createElement("input"); // Placeholder for the prompt
  fieldPrompt.classList.add("field-prompt"); // Add a class for styling
  fieldPrompt.name = "field-prompt";
  newField.appendChild(fieldPrompt);

  const fieldTypes = ["text", "textarea", "select"];
  fieldTypes.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    fieldTypeSelect.appendChild(option);
  });

  const fieldOptionsContainer = document.createElement("div");
  fieldOptionsContainer.classList.add("field-options");
  newField.appendChild(fieldOptionsContainer);

  // Add a "Remove Field" button
  const removeFieldButton = document.createElement("button");
  removeFieldButton.textContent = "Remove Field";
  removeFieldButton.classList.add("remove-field-button"); // Add a class for styling
  removeFieldButton.addEventListener("click", function () {
    const fieldToRemove = this.parentElement; // Get the field element containing this button
    uiElements.templateFieldsContainer.removeChild(fieldToRemove);
  });
  newField.appendChild(removeFieldButton);

  // Add "Insert Field" button
  const insertFieldButton = document.createElement("button");
  insertFieldButton.textContent = "Insert Field";
  insertFieldButton.classList.add("insert-field-button");
  insertFieldButton.addEventListener("click", function () {
    const newField = createNewField(); // Create a new field
    uiElements.templateFieldsContainer.insertBefore(
      newField,
      this.parentElement.nextSibling
    ); // Insert it after this field
  });

  newField.appendChild(insertFieldButton);

  const hr = document.createElement("hr");
  newField.appendChild(hr);
  return newField;
}
function removeOptionInput(fieldOptionsContainer) {
  const existingOptions =
    fieldOptionsContainer.querySelectorAll("input[type='text']");
  if (existingOptions.length > 0) {
    const lastOption = existingOptions[existingOptions.length - 1];
    fieldOptionsContainer.removeChild(lastOption);
  } else {
    // Handle case where there are no options to remove (optional: display message)
  }
}
function addOptionInput(fieldOptionsContainer) {
  const optionInput = document.createElement("input");
  optionInput.type = "text";
  optionInput.placeholder = "Enter Option Value";
  optionInput.classList.add("option-input"); // Add the class

  fieldOptionsContainer.appendChild(optionInput);
}

// function removeTemplateEntry(templateName) {
//   // 1. Remove from the set
//   existingTemplateNames.delete(templateName);

//   // 2. Remove from the dropdown
//   const templateOption = uiElements.templateSelect.querySelector(
//     `option[value="${templateName}"]`
//   );
//   if (templateOption) {
//     uiElements.templateSelect.removeChild(templateOption);
//   }
//   // 3. If no templates remain, select none
//   if (uiElements.templateSelect.options.length === 0) {
//     selectedTemplate = undefined; // Reset selected template
//   }

//   // 4. Remove from the template creator dropdown
//   const createTemplateOption = uiElements.templateDropdown.querySelector(
//     `option[value="${templateName}"]`
//   );
//   if (createTemplateOption) {
//     uiElements.templateDropdown.removeChild(createTemplateOption);
//   }
//   // 5. If no templates remain, select none
//   if (uiElements.templateDropdown.options.length === 0) {
//     selectedTemplate = undefined; // Reset selected template
//   }
// }

export class TemplateMaker {
  constructor() {
    this.isCreatingTemplate = false;
    this.existingTemplateNames = new Set();

    uiElements.createTemplateButton.addEventListener("click", () => {
      this.openCreateTemplateModal();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        uiElements.createTemplateModal.style.display = "none";
        this.isCreatingTemplate = false;
      }
    });
    uiElements.closeModalButton.addEventListener("click", () => {
      uiElements.createTemplateModal.style.display = "none";
      this.isCreatingTemplate = false;
    });
    window.addEventListener("click", function (event) {
      if (event.target === uiElements.createTemplateModal) {
        console.log("Clicked off from template modal.");
      }
    });
    uiElements.addFieldButton.addEventListener("click", () => {
      this.addFieldEvent();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Tab" && this.isCreatingTemplate) {
        event.preventDefault(); // Prevent default Alt+Tab behavior
        this.addFieldEvent();
      }
    });
    uiElements.saveTemplateButton.addEventListener("click", () => {
      this.createTemplate();
    });
    // uiElements.deleteTemplateButton.addEventListener("click", () => {
    //   deleteTemplate(selectedTemplate);
    // });
  }

  updateOptions() {
    if (this.templates) {
      const availableTemplates = Object.keys(this.templates);

      // Filter out existing templates and append only new ones
      availableTemplates
        .filter((templateName) => !this.existingTemplateNames.has(templateName))
        .forEach((templateName) => {
          const entryOption = document.createElement("option");
          entryOption.value = templateName;
          entryOption.text = templateName;
          uiElements.templateSelect.appendChild(entryOption);

          const templateOption = document.createElement("option");
          templateOption.value = templateName;
          templateOption.text = templateName;
          uiElements.templateDropdown.appendChild(templateOption);

          this.existingTemplateNames.add(templateName); // Add new template to the set
        });
    }
  }
  openCreateTemplateModal() {
    uiElements.createTemplateModal.style.display = "block";
    uiElements.templateFieldsContainer.innerHTML = "";

    this.isCreatingTemplate = true;

    // Focus on the first input field for accessibility
    const nameInput = document.getElementById("template-name");
    if (nameInput) {
      // FOCUS FIELD
      nameInput.focus();
    }
  }
  handleFieldTypeChange(fieldTypeSelect, fieldOptionsContainer) {
    fieldTypeSelect.addEventListener("change", function () {
      const selectedType = this.value;
      fieldOptionsContainer.innerHTML = ""; // Clear existing options

      if (selectedType === "select") {
        // Create a new div for option buttons
        const optionButtonContainer = document.createElement("div");
        optionButtonContainer.classList.add("option-button-container"); // Add a class for styling

        const addOptionButton = document.createElement("button");
        addOptionButton.textContent = "Add Option";
        addOptionButton.addEventListener("click", function () {
          addOptionInput(fieldOptionsContainer); // Call function to add option input
        });
        optionButtonContainer.appendChild(addOptionButton);

        const removeOptionButton = document.createElement("button");
        removeOptionButton.textContent = "Remove Option";
        removeOptionButton.addEventListener("click", function () {
          removeOptionInput(fieldOptionsContainer); // Call function to remove option input
        });
        optionButtonContainer.appendChild(removeOptionButton);

        // Append the button container to the options container
        fieldOptionsContainer.appendChild(optionButtonContainer);
      } else {
        // Remove the button container if it exists (optional)
        const existingButtonContainer = fieldOptionsContainer.querySelector(
          ".option-button-container"
        );
        if (existingButtonContainer) {
          fieldOptionsContainer.removeChild(existingButtonContainer);
        }
      }

      fieldOptionsContainer.style.display =
        selectedType === "select" ? "block" : "none";
    });
    uiElements.templateDropdown.addEventListener("change", (event) => {
      selectedTemplate = uiElements.templateDropdown.value;
      const templateData = templates[selectedTemplate];
      const formContainer = uiElements.templateFieldsContainer;
      // console.log(formContainer);
      formContainer.innerHTML = "";
      function appendTemplateFields(templateData, formContainer) {
        // Iterate through the template data
        for (const fieldName in templateData) {
          const fieldData = templateData[fieldName];
          // console.log("fieldData", fieldData);

          const newField = createNewField();
          const fieldInput = newField.querySelector("input");
          fieldInput.value = fieldData.label;

          const fieldTypeSelect = newField.querySelector(
            "select[name='field-type']"
          );
          const fieldOptionsContainer =
            newField.querySelector(".field-options");

          fieldTypeSelect.value = fieldData.type;

          handleFieldTypeChange(fieldTypeSelect, fieldOptionsContainer);

          if (fieldData.type == "select" && fieldData.options != undefined) {
            console.log(fieldData.type);
            for (let i = 0; i < fieldData.options.length; i++) {
              const optionInput = document.createElement("input");
              optionInput.type = "text";
              optionInput.value = fieldData.options[i];
              optionInput.classList.add("option-input"); // Add the class

              fieldOptionsContainer.appendChild(optionInput);
            }
            const optionButtonContainer = document.createElement("div");
            optionButtonContainer.classList.add("option-button-container"); // Add a class for styling

            const addOptionButton = document.createElement("button");
            addOptionButton.textContent = "Add Option";
            addOptionButton.addEventListener("click", function () {
              addOptionInput(fieldOptionsContainer); // Call function to add option input
            });
            optionButtonContainer.appendChild(addOptionButton);

            const removeOptionButton = document.createElement("button");
            removeOptionButton.textContent = "Remove Option";
            removeOptionButton.addEventListener("click", function () {
              removeOptionInput(fieldOptionsContainer); // Call function to remove option input
            });
            optionButtonContainer.appendChild(removeOptionButton);

            // Append the button container to the options container
            fieldOptionsContainer.appendChild(optionButtonContainer);
          }

          uiElements.templateFieldsContainer.appendChild(newField);
        }
      }
      appendTemplateFields(templateData, formContainer);
    });
  }
  addFieldEvent() {
    const newField = createNewField();
    const fieldTypeSelect = newField.querySelector("select[name='field-type']");

    const fieldOptionsContainer = newField.querySelector(".field-options");

    this.handleFieldTypeChange(fieldTypeSelect, fieldOptionsContainer);
    const inputToFocus = newField.querySelector("input"); // Directly target the input element
    uiElements.templateFieldsContainer.appendChild(newField);
    inputToFocus.focus();
  }
  processTemplate(templateName) {
    const templateFieldsContainer = document.getElementById("template-fields");

    const fields = {}; // Initialize an empty object for fields
    // 3. Parse fields from modal (iterate through generated fields)
    const fieldElements =
      templateFieldsContainer.querySelectorAll(".template-field");
    fieldElements.forEach((fieldElement) => {
      const fieldNameInput = fieldElement.querySelector(
        "input[name='field-name']"
      );
      const fieldTypeSelect = fieldElement.querySelector(
        "select[name='field-type']"
      );
      const fieldTypePrompt = fieldElement.querySelector(
        "input[name='field-prompt']"
      );

      const options = []; // Initialize an empty options array for select fields

      // Handle options for select type only
      if (fieldTypeSelect.value === "select") {
        const optionInputs = fieldElement.querySelectorAll(
          ".field-options input"
        ); // Select all option input fields within the field
        optionInputs.forEach((optionInput) => {
          if (optionInput.value) {
            options.push(optionInput.value); // Add option value if present
          }
        });
      }
      if (options.length > 0) {
        fields[fieldNameInput.value] = {
          // Use field name as key in the fields object
          label: fieldNameInput.value, // Set label to same as field name (optional, can be customized)
          type: fieldTypeSelect.value,
          options: options, // Include options if it's a select field
          prompt: fieldTypePrompt.value,
        };
      } else {
        fields[fieldNameInput.value] = {
          // Use field name as key in the fields object
          label: fieldNameInput.value, // Set label to same as field name (optional, can be customized)
          type: fieldTypeSelect.value,
          prompt: fieldTypePrompt.value,
        };
      }
    });

    // 4. Add fields to the templateData object
    this.templates[templateName] = fields;
    // TODO  PREVENT OVERWRITE?!
    // add a catagory to the library for the new template

    // TODO couple EntryForm to templateMaker
    if (!this.entryForm.loreLib[templateName]) {
      this.entryForm.loreLib[templateName] = {};
    } else {
      console.log(
        "do something about items when getting their template changed"
      );
    }

    electronAPI.saveTemplates(this.templates); // Save updated gameData

    // TODO offload this to entryForm so each module manages its own save and data
    electronAPI.saveLore(this.entryForm.loreLib); // Save updated gameData

    // 5. Close the modal
    const createTemplateModal = document.getElementById(
      "create-template-modal"
    );
    createTemplateModal.style.display = "none";

    // 6. (Optional) Update template options in templateSelect (implementation depends on your logic)

    // updateOptions();// still in renderer
    this.entryForm.updateForm();
    console.log("Template created:", templateName); // Log for confirmation
  }
  createTemplate() {
    const templateName = document.getElementById("template-name").value;

    if (templateName) {
      this.processTemplate(templateName);
    }

    // if (uiElements.templateDropdown.value) {
    //   // this is stopping writing when a template has been extended TODO sort this out
    //   console.log(uiElements.templateDropdown.value);
    // }
    // template has a name, save it
  }

  //   deleteTemplate(templateName) {
  //     // 1. Confirm deletion with the user
  //     if (!templateName) return;
  //     if (
  //       !confirm(
  //         `Are you sure you want to delete the template "${templateName}"? This action cannot be undone.`
  //       )
  //     ) {
  //       return; // Exit function if user cancels
  //     }

  //     // 2. Remove template data from entryForm.loreLib
  //     delete templates[templateName];

  //     // Keep the orphans
  //     // delete entryForm.loreLib[templateName];

  //     // 3. Save updated gameData
  //     try {
  //       window.electronAPI.saveTemplates(templates);
  //       console.log(`Template "${templateName}" deleted successfully.`);
  //     } catch (error) {
  //       console.error(`Failed to delete template: ${error.message}`);
  //       // Add user-friendly error handling (e.g., display an error message)
  //     }
  //     // 4. (Optional) Update template options in templateSelect (implementation depends on your logic)
  //     removeTemplateEntry(templateName);
  //     uiElements.deleteTemplateButton.style.display = "none";

  //     entryForm.updateForm();
  //     updateOptions();
  //     uiElements.createTemplateModal.style.display = "none";
  //   }
}
