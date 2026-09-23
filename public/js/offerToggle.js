document.addEventListener("DOMContentLoaded", () => {
  const offerToggle = document.getElementById("offerToggle");
  const offerText = document.getElementById("offerText");

  const OFFER_RATE = 0.15;

  function applyOffer(isEnabled) {
    document.querySelectorAll(".price-box").forEach(box => {
      const newPriceEl = box.querySelector(".new-price");
      const oldPriceEl = box.querySelector(".old-price");
      const offersText = box.querySelector(".offers-text");

      if (!newPriceEl) return;

      const basePrice = Number(newPriceEl.dataset.price);

      if (isEnabled) {  
        const discountedPrice = Math.round(
          basePrice - basePrice * OFFER_RATE
        );

        if (oldPriceEl) oldPriceEl.style.display = "inline";
        newPriceEl.innerText =
          "₹" + discountedPrice.toLocaleString("en-IN");
        if (offersText) offersText.style.display = "inline";
      } else {
        if (oldPriceEl) oldPriceEl.style.display = "none";
        newPriceEl.innerText =
          "₹" + basePrice.toLocaleString("en-IN");
        if (offersText) offersText.style.display = "none";
      }
    });

    if (offerText) {
      if (isEnabled) {
        offerText.innerHTML = `
          Flat 15% OFF
          <span class="offer-badge">DEAL</span>
        `;
        offerText.classList.add("offer-active");
      } else {
        offerText.innerHTML = "View available offers";
        offerText.classList.remove("offer-active");
      }
    }
  }

  const savedState = localStorage.getItem("offerEnabled") === null
  ? true
  : localStorage.getItem("offerEnabled") === "true";

  if (offerToggle) {
    offerToggle.checked = savedState;
  }

  applyOffer(savedState);

  if (offerToggle) {
    offerToggle.addEventListener("change", () => {
      const isEnabled = offerToggle.checked;
      localStorage.setItem("offerEnabled", isEnabled);
      applyOffer(isEnabled);
    });
  }
});

const filters = document.querySelectorAll(".filter");
const currentPath = window.location.pathname;

filters.forEach(filter => {
    if (filter.getAttribute("href") === currentPath) {
        filter.classList.add("active");
    }
});