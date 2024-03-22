import { UIElements } from "../../../UIElements";
import { promptTemplates } from "./promptTemplates";

// function fillTemplate(template, data) {
//   let filledTemplate = template;
//   for (const key in data) {
//     filledTemplate = filledTemplate.replace(
//       new RegExp(`{{${key}}}`, "g"),
//       data[key]
//     );
//   }
//   return filledTemplate;
// }

function copyPromptText() {
  const promptText = document.getElementById("promptText");
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(promptText);
  selection.removeAllRanges();
  selection.addRange(range);

  navigator.clipboard
    .writeText(promptText.textContent)
    .then(() => {
      console.log("Prompt copied successfully!"); // Optional success message
    })
    .catch(() => {
      console.error("Failed to copy prompt!"); // Optional error message
    });
  selection.removeAllRanges();
  promptModal.style.display = "none";
}

export class Prompts {
  constructor() {
    this.ui = new UIElements();
    this.templates = promptTemplates;
    const promptModal = document.getElementById("promptModal");
    const copyPromptButton = document.getElementById("copyPromptButton");

    copyPromptButton.addEventListener("click", copyPromptText);

    this.ui.generatePromptButton.addEventListener("click", () => {
      this.generatePrompt();
      promptModal.style.display = "block";
    });

    window.addEventListener("click", function (event) {
      if (event.target === promptModal) {
        promptModal.style.display = "none";
      }
    });
  }
  generatePrompt() {
    const entryTemplateSelect = document.querySelectorAll(
      ".entry-form__template-select"
    );
    const selectedTemplateValue = entryTemplateSelect[0].value;
    console.log("Selected template:", selectedTemplateValue);

    const entryPrototypeSelect = document.querySelectorAll(
      ".entry-form__prototype-select"
    );
    const selectedPrototypeValue = entryPrototypeSelect[0].value;
    console.log("Selected entry:", selectedPrototypeValue);

    const loreLib = this.entryForm.loreLib;

    let promptString = "";

    if (selectedPrototypeValue != undefined) {
      promptString += `Please fill in the missing details for a lore library entry in the ${selectedTemplateValue} category. You can expand or adjust details to create a more convincing lore while preserving the main details provided.; `;

      // iterate over the entry fields
      for (const key in loreLib[selectedTemplateValue][
        selectedPrototypeValue
      ]) {
        if (key !== "valid" && key !== "version" && key != "sprite") {
          // get field name
          const fieldValue =
            loreLib[selectedTemplateValue][selectedPrototypeValue][key];
          // console.log("prompt key", key);
          // console.log(
          //   "prompt data",
          //   this.entryForm.templates[selectedTemplate][key]
          // );

          // Check for user provided prompt
          const providedPrompt =
            this.entryForm.templates[selectedTemplateValue][key].prompt;
          const hasUserProvidedPrompt = !!providedPrompt;

          // get detailed prompt from presets
          const fieldPromptTemplate = promptTemplates[key];

          if (!fieldValue) {
            // field was empty
            if (hasUserProvidedPrompt) {
              promptString += providedPrompt;
            } else if (fieldPromptTemplate) {
              promptString += `${key}: ${fieldPromptTemplate} ; `;
            } else {
              promptString += `**Provide details for the ${key} field** ; `;
            }
          } else {
            // field was filled in
            promptString += `Based on the existing ${key}: ${fieldValue}; `;
          }
        }
      }
    } else {
      promptString = "Please select a lore entry to generate a prompt for.";
    }
    const promptText = document.getElementById("promptText");
    promptText.textContent = promptString;
    promptModal.style.display = "block"; // Open the modal after updating prompt
  }
}
