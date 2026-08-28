// Все контакты сайта редактируются в одном месте.
const CONTACTS = {
  phone: "+79381114131",
  email: "info@mono-print.ru",
  max: "https://max.ru/u/f9LHodD0cOK-8bOsjbWF1MatpsxchI5ix057xEPlfJnU2UN78zfdYixXzE4",
  telegram: "https://t.me/monoprint",
  vk: "https://vk.ru/monoprint_rnd",
  map: "https://yandex.ru/maps/-/CTg6rPIj"
};

const links = {
  phone: `tel:${CONTACTS.phone}`,
  email: `mailto:${CONTACTS.email}`,
  max: CONTACTS.max,
  telegram: CONTACTS.telegram,
  vk: CONTACTS.vk,
  map: CONTACTS.map
};

document.querySelectorAll("[data-link]").forEach((element) => {
  const type = element.dataset.link;
  if (links[type]) element.href = links[type];
});

const catalogToggle = document.querySelector(".catalog-toggle");
const catalogPanel = document.querySelector("#catalog-panel");

if (catalogToggle && catalogPanel) {
  let catalogCloseTimer;

  const openCatalog = ({ animate = true } = {}) => {
    window.clearTimeout(catalogCloseTimer);
    catalogToggle.setAttribute("aria-expanded", "true");
    catalogPanel.hidden = false;
    catalogPanel.removeAttribute("inert");
    catalogPanel.setAttribute("aria-hidden", "false");

    if (!animate) {
      catalogPanel.classList.add("is-open");
      return;
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => catalogPanel.classList.add("is-open"));
    });
  };

  const closeCatalog = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    catalogToggle.setAttribute("aria-expanded", "false");
    catalogPanel.classList.remove("is-open");
    catalogPanel.setAttribute("aria-hidden", "true");
    catalogPanel.setAttribute("inert", "");

    if (window.location.hash === "#catalog-panel") {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }

    window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? "auto" : "smooth" });

    catalogCloseTimer = window.setTimeout(() => {
      if (catalogToggle.getAttribute("aria-expanded") === "false") {
        catalogPanel.hidden = true;
      }
    }, reduceMotion ? 0 : 570);
  };

  if (window.location.hash === "#catalog-panel") {
    openCatalog({ animate: false });
  }

  catalogToggle.addEventListener("click", () => {
    const isOpen = catalogToggle.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeCatalog();
    } else {
      openCatalog();
    }
  });
}
