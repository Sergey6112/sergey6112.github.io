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
  const catalogGrid = catalogPanel.querySelector(".catalog-grid");
  const catalogAnimationDuration = 260;
  let catalogCloseTimer;
  let catalogScrollFrame;
  let catalogViewportTimer;

  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  const updateCatalogHeight = () => {
    const horizontalPadding = Number.parseFloat(window.getComputedStyle(catalogPanel).paddingLeft) || 0;
    const contentHeight = catalogGrid ? catalogGrid.scrollHeight : catalogPanel.scrollHeight;
    catalogPanel.style.setProperty("--catalog-open-height", `${Math.ceil(contentHeight + horizontalPadding * 2 + 2)}px`);
  };

  const stopCatalogScroll = () => {
    if (catalogScrollFrame) {
      window.cancelAnimationFrame(catalogScrollFrame);
      catalogScrollFrame = undefined;
    }
  };

  const resetHomeViewport = () => {
    stopCatalogScroll();
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const settleHomeViewport = () => {
    window.clearTimeout(catalogViewportTimer);
    resetHomeViewport();
    window.requestAnimationFrame(resetHomeViewport);
    catalogViewportTimer = window.setTimeout(resetHomeViewport, 80);
  };

  const animateScrollToTop = () => {
    stopCatalogScroll();
    const startScroll = window.scrollY;
    if (startScroll <= 0) return;
    const startTime = window.performance.now();

    const step = (now) => {
      const progress = Math.min((now - startTime) / catalogAnimationDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      window.scrollTo(0, Math.round(startScroll * (1 - eased)));

      if (progress < 1) {
        catalogScrollFrame = window.requestAnimationFrame(step);
      } else {
        catalogScrollFrame = undefined;
      }
    };

    catalogScrollFrame = window.requestAnimationFrame(step);
  };

  const openCatalog = ({ animate = true } = {}) => {
    window.clearTimeout(catalogCloseTimer);
    window.clearTimeout(catalogViewportTimer);
    stopCatalogScroll();
    catalogToggle.setAttribute("aria-expanded", "true");
    catalogPanel.hidden = false;
    catalogPanel.removeAttribute("inert");
    catalogPanel.setAttribute("aria-hidden", "false");
    updateCatalogHeight();

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
    window.clearTimeout(catalogViewportTimer);
    catalogToggle.setAttribute("aria-expanded", "false");
    catalogPanel.classList.remove("is-open");
    catalogPanel.setAttribute("aria-hidden", "true");
    catalogPanel.setAttribute("inert", "");

    if (window.location.hash === "#catalog-panel") {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }

    if (reduceMotion) {
      stopCatalogScroll();
      window.scrollTo(0, 0);
    } else {
      animateScrollToTop();
    }

    catalogCloseTimer = window.setTimeout(() => {
      if (catalogToggle.getAttribute("aria-expanded") === "false") {
        catalogPanel.hidden = true;
        resetHomeViewport();
      }
    }, reduceMotion ? 0 : catalogAnimationDuration + 20);
  };

  const openedFromProductPage = window.location.hash === "#catalog-panel";

  if (openedFromProductPage) {
    openCatalog({ animate: false });

    const cleanHomeUrl = /^https?:$/.test(window.location.protocol)
      ? "/"
      : `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(null, "", cleanHomeUrl);

    settleHomeViewport();
  }

  window.addEventListener("pageshow", () => {
    if (catalogToggle.getAttribute("aria-expanded") === "true") {
      updateCatalogHeight();
      settleHomeViewport();
    }
  });

  catalogToggle.addEventListener("click", () => {
    const isOpen = catalogToggle.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeCatalog();
    } else {
      openCatalog();
    }
  });

  window.addEventListener("resize", () => {
    if (catalogToggle.getAttribute("aria-expanded") === "true") updateCatalogHeight();
  }, { passive: true });
}
