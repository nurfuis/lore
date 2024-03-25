loreAPI.onLoadCatalog((catalog) => {
  start(catalog);
  function start(catalog) {
    const welcomeBlock = document.querySelectorAll(".lore-welcome__wrapper");
    welcomeBlock[0].style.display = "none";

    const toastDetails = "Select an option to begin...";

    setToastText(toastDetails, 3500);

    function setToastText(toastDetails, delay) {
      const toastContent = document.querySelectorAll(
        ".lore-main__information-toast"
      );

      toastContent[0].innerText = toastDetails;

      setTimeout(() => {
        if (!toastContent[0]) return; // Exit if content element not found

        const fadeOutTime = 1500; // Adjust fade-out duration in milliseconds (1 second)
        let opacity = 1;

        const fadeInterval = setInterval(() => {
          opacity -= 0.02; // Decrease opacity by 10% each interval
          toastContent[0].style.opacity = opacity;

          if (opacity <= 0) {
            clearInterval(fadeInterval);
            toastContent[0].textContent = ""; // Clear content after fade-out
          }
        }, fadeOutTime / 50); // Adjust intervals for smoother fade (100 steps)
      }, delay); // Execute after the specified delay
    }

    const navButtonEditEntry = document.querySelectorAll(
      ".lore-navigation__button--edit-entry"
    );
    navButtonEditEntry[0].style.display = "";

    const navButtonCreateTemplate = document.querySelectorAll(
      ".lore-navigation__button--create-template"
    );
    navButtonCreateTemplate[0].style.display = "";

    const navButtonViewer = document.querySelectorAll(
      ".lore-navigation__button--viewer"
    );
    navButtonViewer[0].style.display = "";
  }
});
