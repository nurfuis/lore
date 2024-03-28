export class TemplateMaker {
  constructor() {
    this.existingTemplateNames = new Set();
    this.isCreatingTemplate = false;

    // Template Maker
    const navButtonTemplateMaker = document.querySelectorAll(
      ".lore-navigation__button--create-template"
    );
    navButtonTemplateMaker[0].style.display = "none";

    // esc to close template maker
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        const modal = document.querySelectorAll(".modal");
        modal[1].style.display = "none";
        this.isCreatingTemplate = false;
      }
    });
    // tab creates new field when using template maker
    // document.addEventListener("keydown", (event) => {
    //   if (event.key === "Tab" && this.isCreatingTemplate) {
    //     event.preventDefault();
    //     this.addNewFieldToFormEvent();
    //   }
    // });
    // open template maker
    const navButtonCreateTemplate = document.querySelectorAll(
      ".lore-navigation__button--create-template"
    );
    navButtonCreateTemplate[0].addEventListener("click", () => {
      this.openTemplateMakerModal();
      const templateName = document.querySelectorAll(
        ".template-maker__input-field--template-key"
      );
      templateName[0].value = "";
    });
    // disable template modal tab-behavior by setting flag "isCreatingTemplate" false when closing
    const modalButtonClose = document.querySelectorAll(".modal_button--close");
    modalButtonClose[1].addEventListener("click", () => {
      this.isCreatingTemplate = false;
    });
    // add field button listener
    const templateMakerButtonAddField = document.querySelectorAll(
      ".template-maker__button--add-field"
    );
    templateMakerButtonAddField[0].addEventListener("click", () => {
      this.addNewFieldToFormEvent();
    });
    // save form button listener
    const templateMakerButtonSaveForm = document.querySelectorAll(
      ".template-maker__button--save-form"
    );
    templateMakerButtonSaveForm[0].addEventListener("click", () => {
      this.saveTemplateMakerFormToFile();
    });
    // dropdown listener (populate form with existing an template's values)
    const templateMakerTemplateSelect = document.querySelectorAll(
      ".template-maker__select--template"
    );
    templateMakerTemplateSelect[0].addEventListener("change", (event) => {
      this.populateTemplateMakerForm(templateMakerTemplateSelect);
    });

    const navButtonEditEntry = document.querySelectorAll(
      ".lore-navigation__button--edit-entry"
    );
    navButtonEditEntry[0].addEventListener("click", () => {
      this.updateTemplateDropdownOptions();
    });
  }
  updateTemplateDropdownOptions() {
    const templates = window.catalogAPI.catalogGetTemplates();
    if (templates) {
      const availableTemplates = Object.keys(templates);

      const entryFormTemplateSelect = document.querySelectorAll(
        ".entry-form__template-select"
      );
      entryFormTemplateSelect[0].innerHTML = "";

      const templateMakerTemplateSelect = document.querySelectorAll(
        ".template-maker__select--template"
      );
      templateMakerTemplateSelect[0].innerHTML = "";

      const newOptionEntry = document.createElement("option");
      newOptionEntry.textContent = "-- Select Type --";
      newOptionEntry.value = "";

      const newOptionTemplate = document.createElement("option");
      newOptionTemplate.textContent = "-- Inherit From (Optional) --";
      newOptionTemplate.value = "";

      entryFormTemplateSelect[0].appendChild(newOptionEntry);
      templateMakerTemplateSelect[0].appendChild(newOptionTemplate);

      // Filter out existing templates and append only new ones
      for (const templateName of availableTemplates) {
        const entryOption = document.createElement("option");
        entryOption.value = templateName;
        entryOption.text = templateName;

        entryFormTemplateSelect[0].appendChild(entryOption);

        const templateOption = document.createElement("option");
        templateOption.value = templateName;
        templateOption.text = templateName;

        templateMakerTemplateSelect[0].appendChild(templateOption);

        this.existingTemplateNames.add(templateName);
      }
    }
  }
  openTemplateMakerModal() {
    this.updateTemplateDropdownOptions();
    const modal = document.querySelectorAll(".modal");
    modal[1].style.display = "block";

    this.isCreatingTemplate = true;

    prepopulateForm();
  }
  populateTemplateMakerForm(templateMakerTemplateSelect) {
    const selectedTemplate = templateMakerTemplateSelect[0].value;

    if (!selectedTemplate) {
      prepopulateForm();
      return;
    }
    const templates = window.catalogAPI.catalogGetTemplates();
    const templateData = templates[selectedTemplate];

    const templateMakerFieldsWrapper = document.querySelectorAll(
      ".template-maker__fields-wrapper"
    );
    templateMakerFieldsWrapper[0].innerHTML = "";

    const formContainer = templateMakerFieldsWrapper[0];

    // Iterate through the template data

    for (const fieldName in templateData) {
      const fieldData = templateData[fieldName];

      const newField = createNewField();
      const fieldInput = newField.querySelector("input");
      fieldInput.value = fieldData.label;

      const fieldTypeSelect = newField.querySelector(
        "select[name='field-type']"
      );
      const fieldOptionsContainer = newField.querySelector(".field-options");

      fieldTypeSelect.value = fieldData.type;

      this.handleFormFieldTypeSelectorChange(
        fieldTypeSelect,
        fieldOptionsContainer
      );

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

      formContainer.appendChild(newField);
    }
  }
  handleFormFieldTypeSelectorChange(fieldTypeSelect, fieldOptionsContainer) {
    fieldTypeSelect.addEventListener("change", function () {
      const selectedType = this.value;
      fieldOptionsContainer.innerHTML = ""; // Clear existing options

      if (selectedType === "select") {
        // Create a new div for option buttons
        const span = document.createElement("span");
        span.classList.add("prompt");
        span.innerText = "Add multiple options to make a dropdown.";
        fieldOptionsContainer.appendChild(span);
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
  }
  addNewFieldToFormEvent() {
    const newField = createNewField();
    const fieldTypeSelect = newField.querySelector("select[name='field-type']");

    const fieldOptionsContainer = newField.querySelector(".field-options");

    this.handleFormFieldTypeSelectorChange(
      fieldTypeSelect,
      fieldOptionsContainer
    );
    const inputToFocus = newField.querySelector("input"); // Directly target the input element

    const templateMakerFieldsWrapper = document.querySelectorAll(
      ".template-maker__fields-wrapper"
    );
    templateMakerFieldsWrapper[0].appendChild(newField);
    inputToFocus.focus();
  }
  saveTemplateMakerFormToFile() {
    const templateName = document.querySelectorAll(
      ".template-maker__input-field--template-key"
    );
    if (templateName[0]) {
      this.processFilledTemplateMakerForm(templateName[0]);
    }
  }
  processFilledTemplateMakerForm(templateName) {
    const templateMakerFieldsWrapper = document.querySelectorAll(
      ".template-maker__fields-wrapper"
    );

    const newTemplate = {}; // Initialize an empty object for fields
    // 3. Parse fields from modal (iterate through generated fields)
    const fieldElements =
      templateMakerFieldsWrapper[0].querySelectorAll(".template-field");

    fieldElements.forEach((fieldElement) => {
      const fieldNameInput = fieldElement.querySelector(
        "input[name='field-name']"
      );
      const fieldTypeSelect = fieldElement.querySelector(
        "select[name='field-type']"
      );
      const fieldTypePrompt = fieldElement.querySelector(
        "textarea[name='field-prompt']"
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
        newTemplate[fieldNameInput.value] = {
          // Use field name as key in the fields object
          label: fieldNameInput.value, // Set label to same as field name (optional, can be customized)
          type: fieldTypeSelect.value,
          options: options, // Include options if it's a select field
          prompt: fieldTypePrompt.value,
        };
      } else {
        newTemplate[fieldNameInput.value] = {
          // Use field name as key in the fields object
          label: fieldNameInput.value, // Set label to same as field name (optional, can be customized)
          type: fieldTypeSelect.value,
          prompt: fieldTypePrompt.value,
        };
      }
    });

    // // 4. Add fields to the templateData object
    const templateKey = templateName.value || undefined;

    const flags = "none";
    const response = window.catalogAPI.saveTemplate({
      templateKey,
      newTemplate,
      flags,
    });

    console.log(response);

    const buttonsWrapper = document.querySelectorAll(".modal_buttons-wrapper");
    function clearButtonsWrapper() {
      if (buttonsWrapper && buttonsWrapper.length > 0) {
        clearElementChildren(buttonsWrapper[0]);
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
      return;
    } else if (response.status === "conflict") {
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
      return;
    } else if (response.status === "resolved") {
      const cardViewerWrapper = document.querySelectorAll(
        ".viewer__cards-wrapper"
      );
      if (cardViewerWrapper[0].style.display != "none") {
        cardViewerWrapper[0].style.display = "none";
      }

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
      templateName.value = "";
    }

    const modal = document.querySelectorAll(".modal");
    modal[1].style.display = "none";
    this.updateTemplateDropdownOptions();
    window.scrollTo(0, 0);
  }
}
function prepopulateForm() {
  const templateMakerFieldsWrapper = document.querySelectorAll(
    ".template-maker__fields-wrapper"
  );
  templateMakerFieldsWrapper[0].innerHTML = "";

  const templateKeyInputField = document.querySelectorAll(
    ".template-maker__input-field--template-key"
  );
  if (templateKeyInputField[0]) {
    templateKeyInputField[0].focus();
  }
  // Index Key wrapper
  const newField = document.createElement("div");
  newField.classList.add("template-field");

  // Index key label
  const fieldNameLabel = document.createElement("label");
  fieldNameLabel.textContent = "Index Key";
  newField.appendChild(fieldNameLabel);

  // index key guidance
  const span = document.createElement("span");
  span.classList.add("prompt");
  span.innerText =
    'Provide a unique reference which is required for each entry. It is reccomended to use "name."';
  newField.appendChild(span);

  // index key input
  const fieldNameInput = document.createElement("input");
  fieldNameInput.classList.add("template-field__input--read-only");
  fieldNameInput.type = "text";
  fieldNameInput.name = "field-name";
  fieldNameInput.value = "name";
  fieldNameInput.readOnly = false;
  newField.appendChild(fieldNameInput);
  fieldNameInput.disabled = false;

  // index key input type
  // wrapper
  const fieldSelectorWrapper = document.createElement("div");
  fieldSelectorWrapper.classList.add("template-maker__field-wrapper");
  newField.appendChild(fieldSelectorWrapper);

  // input type selector label
  const fieldSelectorLabel = document.createElement("label");
  fieldSelectorLabel.textContent = "Input Type";
  fieldSelectorWrapper.appendChild(fieldSelectorLabel);

  // dropdown
  const fieldTypeSelect = document.createElement("select");
  fieldTypeSelect.name = "field-type";
  fieldTypeSelect.disabled = true;
  fieldSelectorWrapper.appendChild(fieldTypeSelect);
  // dropdown options
  const fieldTypes = ["text", "textarea", "select"];
  fieldTypes.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    fieldTypeSelect.appendChild(option);
  });
  // prompt label
  const fieldPromptLabel = document.createElement("label");
  fieldPromptLabel.textContent = "Input Guidance";
  newField.appendChild(fieldPromptLabel);
  // prompt guidance
  const span0 = document.createElement("span");
  span0.classList.add("prompt");
  span0.innerText =
    "Describe any guidelines which should be followed when choosing a name for entries of this type.";
  newField.appendChild(span0);

  // prompt input
  const fieldPrompt = document.createElement("textarea"); // Placeholder for the prompt
  fieldPrompt.classList.add("field-prompt"); // Add a class for styling
  fieldPrompt.name = "field-prompt";
  newField.appendChild(fieldPrompt);

  const hr = document.createElement("hr");
  newField.appendChild(hr);

  templateMakerFieldsWrapper[0].appendChild(newField);

  // // Description wrapper
  const descriptionField = document.createElement("div");
  descriptionField.classList.add("template-field");
  // description label
  const descriptionFieldNameLabel = document.createElement("label");
  descriptionFieldNameLabel.textContent = "Description:";
  descriptionField.appendChild(descriptionFieldNameLabel);
  // info
  const span1 = document.createElement("span");
  span1.classList.add("prompt");
  span1.innerText = "A description field is added to all entries.";
  descriptionField.appendChild(span1);
  // description input
  const descriptionFieldNameInput = document.createElement("input");
  descriptionFieldNameInput.classList.add("template-field__input--read-only");
  descriptionFieldNameInput.type = "text";
  descriptionFieldNameInput.name = "field-name";
  descriptionFieldNameInput.value = "description";
  descriptionFieldNameInput.readOnly = false;
  descriptionFieldNameInput.disabled = false;
  descriptionField.appendChild(descriptionFieldNameInput);

  const descriptionFieldSelectorWrapper = document.createElement("div");
  descriptionFieldSelectorWrapper.classList.add(
    "template-maker__field-wrapper"
  );
  descriptionField.appendChild(descriptionFieldSelectorWrapper);

  // input type selector label
  const descriptionFieldSelectorLabel = document.createElement("label");
  descriptionFieldSelectorLabel.textContent = "Input Type";
  descriptionFieldSelectorWrapper.appendChild(descriptionFieldSelectorLabel);

  // description input type dropdown
  const descriptionFieldTypeSelect = document.createElement("select");
  descriptionFieldTypeSelect.name = "field-type";
  descriptionFieldTypeSelect.disabled = true;
  descriptionField.appendChild(descriptionFieldTypeSelect);
  // description input type dropdown options
  const descriptionFieldTypes = ["text", "textarea", "select"];
  descriptionFieldTypes.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    descriptionFieldTypeSelect.appendChild(option);
  });
  descriptionFieldTypeSelect.value = "textarea";

  // description label
  const descriptionFieldPromptLabel = document.createElement("label");
  descriptionFieldPromptLabel.textContent = "Input Guidance:";
  descriptionField.appendChild(descriptionFieldPromptLabel);
  // description guidance
  const span2 = document.createElement("span");
  span2.classList.add("prompt");
  span2.innerText =
    "Which properties should be included when composing a brief description for entries of this type?";
  descriptionField.appendChild(span2);
  // description input
  const descriptionFieldPrompt = document.createElement("textarea"); // Placeholder for the prompt
  descriptionFieldPrompt.classList.add("field-prompt"); // Add a class for styling
  descriptionFieldPrompt.name = "field-prompt";
  descriptionField.appendChild(descriptionFieldPrompt);

  const descriptionHr = document.createElement("hr");
  descriptionField.appendChild(descriptionHr);
  templateMakerFieldsWrapper[0].appendChild(descriptionField);
}

function createNewField() {
  const newField = document.createElement("div");
  newField.classList.add("template-field");

  const fieldNameLabel = document.createElement("label");
  fieldNameLabel.textContent = "Field Label:";
  newField.appendChild(fieldNameLabel);

  const span = document.createElement("span");
  span.classList.add("prompt");
  span.innerText = "Choose a descriptive name for the input.";
  newField.appendChild(span);

  const fieldNameInput = document.createElement("input");
  fieldNameInput.type = "text";
  fieldNameInput.name = "field-name";
  fieldNameInput.required = true;
  newField.appendChild(fieldNameInput);

  // wrapper
  const fieldSelectorWrapper = document.createElement("div");
  fieldSelectorWrapper.classList.add("template-maker__field-wrapper");
  newField.appendChild(fieldSelectorWrapper);

  // input type selector label
  const fieldSelectorLabel = document.createElement("label");
  fieldSelectorLabel.textContent = "Input Type";
  fieldSelectorWrapper.appendChild(fieldSelectorLabel);

  const fieldTypeSelect = document.createElement("select");
  fieldTypeSelect.name = "field-type";
  fieldSelectorWrapper.appendChild(fieldTypeSelect);

  const fieldTypes = ["text", "textarea", "select"];
  fieldTypes.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    fieldTypeSelect.appendChild(option);
  });

  const fieldPromptLabel = document.createElement("label");
  fieldPromptLabel.textContent = "Input Guidance:";
  newField.appendChild(fieldPromptLabel);

  const span1 = document.createElement("span");
  span1.classList.add("prompt");
  span1.innerText = "Provide concise instructions on how to fill the input.";
  newField.appendChild(span1);

  const fieldPrompt = document.createElement("textarea"); // Placeholder for the prompt
  fieldPrompt.classList.add("field-prompt"); // Add a class for styling
  fieldPrompt.name = "field-prompt";
  newField.appendChild(fieldPrompt);

  const fieldOptionsContainer = document.createElement("div");
  fieldOptionsContainer.classList.add("field-options");
  fieldSelectorWrapper.appendChild(fieldOptionsContainer);

  // // Add "Insert Field" button
  // const insertFieldButton = document.createElement("button");
  // insertFieldButton.textContent = "Insert Field";
  // insertFieldButton.classList.add("insert-field-button");
  // insertFieldButton.addEventListener("click", function () {
  //   const newField = createNewField(); // Create a new field
  //   const templateMakerFieldsWrapper = document.querySelectorAll(
  //     ".template-maker__fields-wrapper"
  //   );
  //   templateMakerFieldsWrapper[0].insertBefore(
  //     newField,
  //     this.parentElement.nextSibling
  //   ); // Insert it after this field
  // });

  // newField.appendChild(insertFieldButton);

  // Add a "Remove Field" button
  const removeFieldButton = document.createElement("button");
  removeFieldButton.textContent = "Remove Field";
  removeFieldButton.classList.add("remove-field-button"); // Add a class for styling
  removeFieldButton.addEventListener("click", function () {
    const fieldToRemove = this.parentElement; // Get the field element containing this button
    const templateMakerFieldsWrapper = document.querySelectorAll(
      ".template-maker__fields-wrapper"
    );
    templateMakerFieldsWrapper[0].removeChild(fieldToRemove);
  });
  newField.appendChild(removeFieldButton);

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
