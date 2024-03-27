// Example useage:
// const toastDetails = "Select an option to begin...";
// setToastText(toastDetails, 3500);

export function setToastText(toastDetails, delay) {
  const toastContent = document.querySelectorAll(
    ".lore-main__information-toast"
  );

  toastContent[0].innerText = toastDetails;
  toastContent[0].scrollIntoView({ behavior: 'smooth' });

  setTimeout(() => {
    if (!toastContent[0]) return; // Exit if content element not found

    const fadeOutTime = 1200; // Adjust fade-out duration in milliseconds (1 second)
    let opacity = 1;

    const fadeInterval = setInterval(() => {
      opacity -= 0.02; // Decrease opacity by 10% each interval
      toastContent[0].style.opacity = opacity;

      if (opacity <= 0) {
        clearInterval(fadeInterval);
        toastContent[0].textContent = ""; // Clear content after fade-out
        toastContent[0].style.opacity = 1;
      }
    }, fadeOutTime / 50); // Adjust intervals for smoother fade (100 steps)
  }, delay); // Execute after the specified delay
}
