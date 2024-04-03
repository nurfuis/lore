import { setToastText } from "../../../utils/setToastText";

export class Viewer {
  constructor() {
    const navButtonCardViewer = document.querySelectorAll(
      ".lore-navigation__button--viewer"
    );
    navButtonCardViewer[0].style.display = "none";
    navButtonCardViewer[0].addEventListener("click", () => {
      const cardViewerWrapper = document.querySelectorAll(
        ".viewer__cards-wrapper"
      );

      if (cardViewerWrapper[0].style.display != "block") {
        cardViewerWrapper[0].style.display = "block";
        this.renderGameData();
        const entryFormWrapper = document.querySelectorAll(
          ".edit-entry__form-wrapper"
        );
        entryFormWrapper[0].style.display = "none";
      }
    });

    const modal = document.querySelectorAll(".modal");
    window.addEventListener("click", function (event) {
      if (event.target === modal[3]) {
        modal[3].style.display = "none";
      }
    });
  }

  deleteConfirmed(itemToDelete, type) {
    const templateKey = type;
    const entry = itemToDelete;

    const response = window.catalogAPI.catalogLoreEntryDelete({
      templateKey,
      entry,
    });
    console.log(response);
    const details = response?.message || "Entry removed.";
    setToastText(details, 4000);
    // TODO remove the li element as opposed to reloading the entire module
  }

  deleteEntry(itemToDelete, type) {
    const modal = document.querySelectorAll(".modal");

    modal[2].style.display = "block"; // Show the modal

    const confirmDeleteButton = document.querySelectorAll(
      ".modal__confirmation--delete"
    );

    confirmDeleteButton[0].addEventListener("click", () => {
      this.deleteConfirmed(itemToDelete, type);
      modal[2].style.display = "none";
      this.renderGameData();
    });

    const cancelDeleteButton = document.querySelectorAll(
      ".modal__confirmation--cancel"
    );
    cancelDeleteButton[0].addEventListener("click", () => {
      modal[2].style.display = "none"; // Hide the modal on cancel
    });
  }

  createDeleteButton(item, type) {
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "lore-summary__delete-entry-button";

    deleteButton.addEventListener("click", () => {
      this.deleteEntry(item, type);
    });

    return deleteButton;
  }
  // WE ARE HERE
  createLoreSummaryEntryListItem(item, type) {
    const listParentElement = document.createElement("li");
    listParentElement.classList.add("lore-summary");

    const listContentElement = document.createElement("div");
    listContentElement.classList.add("lore-summary__content");
    listParentElement.appendChild(listContentElement);

    const nameKey =
      item?.name ||
      item?.Name ||
      item?.index ||
      item?.Index ||
      item?.key ||
      item?.Key ||
      Object.values(item)[1];

    const descriptionKey = "description";
    const descriptionValue = item[descriptionKey];

    const entryItemPreviewLine1 = document.createElement("p");
    entryItemPreviewLine1.classList.add("lore-summary__entry-text");

    const entryItemPreviewLine2 = document.createElement("p");
    entryItemPreviewLine2.classList.add("lore-summary__entry-text--line2");

    // Append the paragraphs to the listContentElement so we can create the spans inside them
    listContentElement.appendChild(entryItemPreviewLine1);
    listContentElement.appendChild(entryItemPreviewLine2);

    if (nameKey) {
      const nameSpan = document.createElement("span");
      nameSpan.textContent = "Name: ";
      entryItemPreviewLine1.appendChild(nameSpan);

      const valueSpan = document.createElement("span");
      valueSpan.textContent = `${nameKey}`;
      valueSpan.classList.add("highlight");

      entryItemPreviewLine1.appendChild(valueSpan);
    }

    if (descriptionValue) {
      const descriptionSpan = document.createElement("span");
      descriptionSpan.textContent = `Description: ${descriptionValue}`;
      entryItemPreviewLine2.appendChild(descriptionSpan);
    }

    if (item.sprite) {
      const entryImagePeviewElement = document.createElement("img");
      const imageSource = window.catalogAPI.getPathSpritesPreview(item.sprite);
      entryImagePeviewElement.src = imageSource;
      entryImagePeviewElement.classList.add(
        "lore-summary__entry-image-preview"
      );

      const entryImagePreviewWrapper = document.createElement("div");
      entryImagePreviewWrapper.classList.add(
        "lore-summary__entry-image-preview-wrapper"
      );
      entryImagePreviewWrapper.appendChild(entryImagePeviewElement);
      listContentElement.appendChild(entryImagePreviewWrapper);
    }

    const detailsButton = createDetailsButton(item);
    listContentElement.appendChild(detailsButton);

    const deleteButton = this.createDeleteButton(item, type);
    listContentElement.appendChild(deleteButton);

    return listParentElement;
  }

  createCard(type, loreLibrary) {
    const card = document.createElement("div");
    card.classList.add("category-card");

    const headerWrapper = document.createElement("div");
    headerWrapper.classList.add("category-card__header-wrapper");
    card.appendChild(headerWrapper);

    const numberOfEntries = Object.keys(loreLibrary[type]).length;
    if (numberOfEntries > 0) {
      const headerWrapperBackgroundImage = loreLibrary[type];

      const imageIndex = Object.values(headerWrapperBackgroundImage)[0].sprite;

      let fixedImagePath;

      if (!!imageIndex) {
        const imageSource = window.catalogAPI.getPathSpritesPreview(imageIndex);
        function fixImagePath(imagePath) {
          return imagePath.replace(/\\/g, "/");
        }
        fixedImagePath = fixImagePath(imageSource);
        card.style.backgroundImage = `linear-gradient(rgba(218, 218, 223,0.3), rgba(67, 67, 67,0.9)), url("${fixedImagePath}")`;
      }

      headerWrapper.classList.add("can-expand");
      headerWrapper.addEventListener("click", () => {
        if (card.classList.contains("expanded")) {
          headerWrapper.classList.toggle("expanded");
          card.classList.toggle("expanded");

          if (!!fixedImagePath) {
            card.style.backgroundImage = `linear-gradient(rgba(218, 218, 223,0.3), rgba(67, 67, 67,0.9)), url("${fixedImagePath}")`;
          }
        } else {
          headerWrapper.classList.toggle("expanded");
          card.classList.toggle("expanded");
          card.style.backgroundImage =
            "linear-gradient(rgba(218, 218, 223, 0.2), rgba(67, 67, 67, 0.2))";
        }
      });
    } else if (numberOfEntries === 0) {
      headerWrapper.classList.add("can-delete");
      headerWrapper.style.opacity = 0.7;

      headerWrapper.addEventListener("click", () => {
        const templateKey = type;
        const modal = document.querySelectorAll(".modal");
        modal[4].style.display = "block";

        const message = document.querySelectorAll(".modal__error-message");
        message[0].innerText =
          "Are you sure you want to delete the template: " + templateKey;

        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";
        cancelButton.classList.add("modal__button");

        const deleteTemplateButton = document.createElement("button");
        deleteTemplateButton.textContent = "Delete";
        deleteTemplateButton.classList.add("modal__button");
        deleteTemplateButton.classList.add("modal__button--destructive");

        const buttonsWrapper = document.querySelectorAll(
          ".modal_buttons-wrapper"
        );

        buttonsWrapper[0].appendChild(cancelButton);
        buttonsWrapper[0].appendChild(deleteTemplateButton);

        // Add event listeners
        cancelButton.addEventListener("click", () => {
          modal[4].style.display = "none";
          buttonsWrapper[0].removeChild(cancelButton);
          buttonsWrapper[0].removeChild(deleteTemplateButton);
        });

        deleteTemplateButton.addEventListener("click", () => {
          const response = window.catalogAPI.deleteTemplate({
            templateKey,

            flags: "canOverwrite",
          });
          console.log(response);

          setToastText(response.message, 4000);

          modal[4].style.display = "none";
          buttonsWrapper[0].removeChild(cancelButton);
          buttonsWrapper[0].removeChild(deleteTemplateButton);

          this.renderGameData();
        });
      });
      const buttonsWrapper = document.querySelectorAll(
        ".modal_buttons-wrapper"
      );
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

      const modalButtonClose = document.querySelectorAll(
        ".modal_button--close"
      );
      modalButtonClose[4].addEventListener("click", clearButtonsWrapper);
    }

    const sectionHeader = this.createCardHeader(type, card, loreLibrary);
    headerWrapper.appendChild(sectionHeader);

    const itemsContainer = createItemsContainer();
    card.appendChild(itemsContainer);

    const sortedKeys = Object.keys(loreLibrary[type]).sort();

    // Create cards for entries in alphabetical order
    sortedKeys.forEach((key) => {
      const itemElement = this.createLoreSummaryEntryListItem(
        loreLibrary[type][key],
        type
      );
      itemsContainer.appendChild(itemElement);
    });

    return card;
  }

  createCardHeader(type, card, loreLibrary) {
    const sectionHeader = document.createElement("h2");
    const numberOfEntries = Object.keys(loreLibrary[type]).length;
    sectionHeader.textContent = `${type} (${numberOfEntries})`;
    sectionHeader.classList.add("category-header");

    return sectionHeader;
  }

  renderGameData() {
    const viewerCards = document.querySelectorAll(".viewer__cards-wrapper");
    viewerCards[0].innerHTML = "";

    const loreLibrary = window.catalogAPI.getInformationLoreLibrary("temp");

    const sectionHeader = document.createElement("h1");
    sectionHeader.innerText = "Explorer";
    viewerCards[0].appendChild(sectionHeader);

    for (const type in loreLibrary) {
      if (Object.keys(loreLibrary).length > 0) {
        const card = this.createCard(type, loreLibrary);

        viewerCards[0].appendChild(card);
      }
    }
  }
}
function createItemsContainer() {
  const itemsContainer = document.createElement("ul");
  itemsContainer.classList.add("game-data-items");
  itemsContainer.classList.add("category-content");
  return itemsContainer;
}
function createDetailsButton(item) {
  const detailsButton = document.createElement("button");
  detailsButton.textContent = "Show Details";
  detailsButton.className = "lore-summary__details-button";
  detailsButton.addEventListener("click", () => {
    updateDetailsModal(item);
  });

  return detailsButton;
}
function updateDetailsModal(item) {
  const modal = document.querySelectorAll(".modal");
  const modalWrapper = document.querySelectorAll(".modal-content__wrapper");
  modalWrapper[0].innerHTML = "";

  const modalEntryDetailsHeading = document.createElement("h2");
  modalEntryDetailsHeading.classList.add("modal__entry-details--heading");
  modalEntryDetailsHeading.textContent =
    item?.name ||
    item?.Name ||
    item?.index ||
    item?.Index ||
    item?.key ||
    item?.Key ||
    Object.values(item)[1];
  modalWrapper[0].appendChild(modalEntryDetailsHeading);

  const hr = document.createElement("hr");
  modalWrapper[0].appendChild(hr);

  if (item.sprite) {
    const modalEntryDetailsSpriteWrapper = document.createElement("div");
    modalEntryDetailsSpriteWrapper.classList.add(
      "modal__entry-details--sprite"
    );
    modalWrapper[0].appendChild(modalEntryDetailsSpriteWrapper);

    const modalEntryDetailsSpriteFrame = document.createElement("div");
    modalEntryDetailsSpriteFrame.classList.add("modal__entry-sprite-frame");
    modalEntryDetailsSpriteWrapper.appendChild(modalEntryDetailsSpriteFrame);

    const spriteImage = document.createElement("img");
    const imageSource = window.catalogAPI.getPathSpritesPreview(item.sprite);

    spriteImage.src = imageSource;
    modalEntryDetailsSpriteFrame.appendChild(spriteImage);
  }

  const span = document.createElement("span");
  span.innerText = `Version : ${item.version}`;
  span.classList.add("prompt");
  modalWrapper[0].appendChild(span);

  const detailsList = createEntryList(item);
  modalWrapper[0].appendChild(detailsList);

  modal[3].style.display = "block";
}
function createEntryList(item) {
  const detailsList = document.createElement("ul");
  for (const entry in item) {
    if (
      entry != "valid" &&
      entry != "version" &&
      entry != "sprite" &&
      !!item[entry]
    ) {
      const entryItem = document.createElement("li");

      const entryItemWrapper = document.createElement("div");
      entryItemWrapper.classList.add("modal-details__entry-item-wrapper");
      entryItem.appendChild(entryItemWrapper);

      const entryItemHeader = document.createElement("h3");
      entryItemHeader.innerText = `${entry}:`;
      entryItemWrapper.appendChild(entryItemHeader);

      const entryItemDetails = document.createElement("p");
      const formattedText = item[entry].replace(/\n/g, "<br>");
      entryItemDetails.innerHTML = formattedText;
      entryItemWrapper.appendChild(entryItemDetails);

      const hr = document.createElement("hr");
      entryItemWrapper.appendChild(hr);
      detailsList.appendChild(entryItem);
    }
  }
  return detailsList;
}
