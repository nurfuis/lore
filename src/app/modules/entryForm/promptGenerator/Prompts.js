import { promptTemplates } from "./promptTemplates";
/*
    TODO:
      select prompt modal by class selector
      select copyPromptButton with class 

      include in modal rework when that happens

*/
export class Prompts {
  constructor() {
    const entryFormGeneratePromptButton = document.querySelectorAll(
      ".entry-form__commands-button--generate-prompt"
    );
    entryFormGeneratePromptButton[0].addEventListener("click", () => {
      this.generatePrompt();
      promptModal.style.display = "block";
    });    
      
    const promptModal = document.getElementById("promptModal");
    
    const copyPromptButton = document.getElementById("copyPromptButton");

    copyPromptButton.addEventListener("click", copyPromptText);

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

    let promptString = "";

    if (selectedPrototypeValue != undefined) {
      promptString += `Please fill in the missing details for a lore library entry in the ${selectedTemplateValue} category. You can expand or adjust details to create a more convincing lore while preserving the main details provided.; `;

      // iterate over the entry fields
      const loreLibrary = window.loreAPI.getInformationLoreLibrary("temp");

      for (const key in loreLibrary[selectedTemplateValue][
        selectedPrototypeValue
      ]) {
        if (key !== "valid" && key !== "version" && key != "sprite") {
          // get field name
          const fieldValue =
            loreLibrary[selectedTemplateValue][selectedPrototypeValue][key];

          // Check for user provided prompt
          const templateFields =
            window.loreAPI.getInformationTemplateFields(
              selectedTemplateValue
            );

          const providedPrompt = templateFields[key]?.prompt;

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
      promptString = "Please select a lore entry to generate a prompt.";
    }
    const promptText = document.getElementById("promptText");
    promptText.textContent = promptString;
    promptModal.style.display = "block"; 
  }
}

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
      console.log("Prompt copied successfully!");
    })
    .catch(() => {
      console.error("Failed to copy prompt!");
    });
  selection.removeAllRanges();
  promptModal.style.display = "none";
}