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
  if (window.location.hash === "#catalog-panel") {
    catalogToggle.setAttribute("aria-expanded", "true");
    catalogPanel.hidden = false;
  }

  catalogToggle.addEventListener("click", () => {
    const isOpen = catalogToggle.getAttribute("aria-expanded") === "true";
    catalogToggle.setAttribute("aria-expanded", String(!isOpen));
    catalogPanel.hidden = isOpen;
  });
}
