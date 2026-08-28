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
  const openCatalog = () => {
    catalogToggle.setAttribute("aria-expanded", "true");
    catalogPanel.hidden = false;
  };

  const closeCatalog = () => {
    catalogToggle.setAttribute("aria-expanded", "false");
    catalogPanel.hidden = true;

    if (window.location.hash === "#catalog-panel") {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }

    // После удаления высокого блока браузер может сохранить прежнюю прокрутку.
    // Возвращаем страницу в исходное состояние после пересчёта разметки.
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  };

  if (window.location.hash === "#catalog-panel") {
    openCatalog();
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
