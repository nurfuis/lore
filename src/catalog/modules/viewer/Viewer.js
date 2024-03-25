export class Viewer {
  constructor() {
    const modal = document.querySelectorAll(".modal");
    window.addEventListener("click", function (event) {
      if (event.target === modal[3]) {
        modal[3].style.display = "none";
      }
    });
  }

  deleteConfirmed(itemToDelete, type) {
    const templateKey = type;
    const entryKey = itemToDelete.name;

    window.loreAPI.catalogLoreEntryDelete({ templateKey, entryKey });

    const informationToast = document.querySelectorAll(
      ".lore-main__information-toast"
    );
    informationToast[0].innerText = `Entry "${itemToDelete.name}" deleted successfully!`;

    // TODO remove the li element as opposed to reloading the entire module
    this.renderGameData();
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

    let previewText = ""; // Empty string for text accumulation
    const nameKey = "name";
    const versionKey = "version";
    const descriptionKey = "description";

    const nameValue = item[nameKey];
    const versionValue = item[versionKey];
    const descriptionValue = item[descriptionKey];

    if (nameValue) {
      previewText += `Name: ${nameValue}\n`;
    }
    if (versionValue) {
      previewText += `Version: ${versionValue}\n`;
    }
    if (descriptionValue) {
      previewText += `Description: ${descriptionValue}\n`;
    }

    const entryItemPreview = document.createElement("p");
    entryItemPreview.classList.add("lore-summary__entry-text");
    entryItemPreview.textContent = previewText.trim();
    listContentElement.appendChild(entryItemPreview);

    if (item.sprite) {
      const entryImagePeviewElement = document.createElement("img");
      const imageSource = window.loreAPI.getPathSpritesPreview(item.sprite);
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

  createCard(type) {
    const card = document.createElement("div");
    card.classList.add("category-card");

    const sectionHeader = this.createCardHeader(type, card);
    card.appendChild(sectionHeader);

    const itemsContainer = createItemsContainer();
    card.appendChild(itemsContainer);

    const loreLibrary = window.loreAPI.getInformationLoreLibrary("temp");

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

  createCardHeader(type, card) {
    const loreLibrary = window.loreAPI.getInformationLoreLibrary("temp");

    const sectionHeader = document.createElement("h2");

    sectionHeader.textContent = `${type} (${
      Object.keys(loreLibrary[type]).length
    })`; // Add key count
    sectionHeader.classList.add("category-header");

    sectionHeader.addEventListener("click", () => {
      card.classList.toggle("expanded"); /* Add or remove expanded class */
    });

    return sectionHeader;
  }

  renderGameData() {
    const viewerCards = document.querySelectorAll(".viewer__cards-wrapper");
    viewerCards[0].innerHTML = "";

    const loreLibrary = window.loreAPI.getInformationLoreLibrary("temp");

    for (const type in loreLibrary) {
      if (Object.keys(loreLibrary).length > 0) {
        const card = this.createCard(type);

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
  const modalEntryDetailsHeading = document.querySelectorAll(
    ".modal__entry-details--heading"
  );
  modalEntryDetailsHeading[0].textContent = item.name;

  const modalEntryDetailsDescription = document.querySelectorAll(
    ".modal__entry-details--description"
  );

  modalEntryDetailsDescription[0].textContent =
    item.description || "No description available";

  const detailsList = createEntryList(item);

  const existingEntries = modalEntryDetailsDescription[0].nextElementSibling;

  const modalEntryDetailsSprite = document.querySelectorAll(
    ".modal__entry-details--sprite"
  );

  if (existingEntries && existingEntries.tagName === "UL") {
    existingEntries.remove();
    modalEntryDetailsSprite[0].innerHTML = "";
  }

  if (item.sprite) {
    modalEntryDetailsSprite[0].innerHTML = "";

    const spriteImage = document.createElement("img");
    const imageSource = window.loreAPI.getPathSpritesPreview(item.sprite);

    spriteImage.src = imageSource;
    modalEntryDetailsSprite[0].appendChild(spriteImage);
  }

  modalEntryDetailsDescription[0].parentElement.appendChild(detailsList);

  const modal = document.querySelectorAll(".modal");
  modal[3].style.display = "block";
}
function createEntryList(item) {
  const detailsList = document.createElement("ul");
  for (const entry in item) {
    const entryItem = document.createElement("li");
    entryItem.textContent = `${entry}: ${item[entry]}`;
    detailsList.appendChild(entryItem);
  }
  return detailsList;
}
