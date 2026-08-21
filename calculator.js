const PRICE_SHEET_CSV = "https://docs.google.com/spreadsheets/d/1WReItohuSFKGW5CgmueQOW9ZmqwWkQLshQBZhdjX4zU/export?format=csv&gid=872944395";

const materials = {
  banner440: { label: "Баннер 440 г", price: 650, aliases: ["баннер 440"], column: 1 },
  selfAdhesive: { label: "Самоклейка", price: 800, aliases: ["самоклейка"], column: 1 },
  mesh: { label: "Баннерная сетка", price: 950, aliases: ["баннерная сетка"], column: 1 },
  perforated: { label: "Перфорированная плёнка", price: 950, aliases: ["пленка перфа", "плёнка перфа"], column: 2 },
  canvas: { label: "Холст", price: 3300, aliases: ["холст"], column: 2 },
  poster: { label: "Постерная бумага", price: 850, aliases: ["постер"], column: 2 }
};

let eyeletPrice = 20;

const form = document.querySelector("#wide-format-calculator");
const widthInput = document.querySelector("#width");
const heightInput = document.querySelector("#height");
const quantityInput = document.querySelector("#quantity");
const eyeletsInput = document.querySelector("#eyelets");
const designStatus = document.querySelector("#design-status");
const priceStatus = document.querySelector("#price-status");

const money = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });

function parseCSV(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i], next = text[i + 1];
    if (char === '"' && quoted && next === '"') { cell += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += char;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function normalize(value = "") {
  return value.toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
}

function firstNumber(value = "") {
  const match = String(value).replace(/\s/g, "").match(/\d+(?:[.,]\d+)?/);
  return match ? Number(match[0].replace(",", ".")) : null;
}

function findRow(rows, aliases) {
  return rows.find((row) => aliases.some((alias) => normalize(row[0]).includes(normalize(alias))));
}

async function loadLivePrices() {
  try {
    const response = await fetch(`${PRICE_SHEET_CSV}&_=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const rows = parseCSV(await response.text());
    let updated = 0;
    Object.values(materials).forEach((material) => {
      const row = findRow(rows, material.aliases);
      const value = row ? firstNumber(row[material.column]) : null;
      if (value) { material.price = value; updated += 1; }
    });
    const eyeletRow = findRow(rows, ["люверс"]);
    const liveEyeletPrice = eyeletRow ? firstNumber(eyeletRow.slice(1).join(" ")) : null;
    if (liveEyeletPrice) eyeletPrice = liveEyeletPrice;
    if (updated < Object.keys(materials).length) throw new Error("Не все цены найдены");
    priceStatus.textContent = "Цены из актуального прайса";
    priceStatus.className = "price-status is-live";
  } catch (error) {
    priceStatus.textContent = "Используются сохранённые цены";
    priceStatus.className = "price-status is-fallback";
  }
  renderPrices();
  calculate();
}

function renderPrices() {
  Object.entries(materials).forEach(([key, material]) => {
    const node = document.querySelector(`[data-price-for="${key}"]`);
    if (node) node.textContent = `от ${money.format(material.price)} ₽/м²`;
  });
  document.querySelector("#eyelet-rate").textContent = `${money.format(eyeletPrice)} ₽/шт.`;
}

function positiveNumber(input, fallback) {
  const value = Number(String(input.value).replace(",", "."));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function currentMaterial() {
  const selected = form.elements.material.value;
  return materials[selected] || materials.banner440;
}

function calculation() {
  const width = positiveNumber(widthInput, 0.1);
  const height = positiveNumber(heightInput, 0.1);
  const quantity = Math.max(1, Math.round(positiveNumber(quantityInput, 1)));
  const material = currentMaterial();
  const area = width * height * quantity;
  const printCost = area * material.price;
  const eyeletCount = eyeletsInput.checked ? Math.ceil((2 * (width + height)) / 0.3) * quantity : 0;
  const eyeletsCost = eyeletCount * eyeletPrice;
  return { width, height, quantity, material, area, printCost, eyeletCount, eyeletsCost, total: printCost + eyeletsCost };
}

function calculate() {
  const result = calculation();
  document.querySelector("#summary-material").textContent = result.material.label;
  document.querySelector("#summary-area").textContent = `${decimal.format(result.area)} м²`;
  document.querySelector("#summary-print").textContent = `${money.format(result.printCost)} ₽`;
  document.querySelector("#eyelet-count").textContent = result.eyeletCount;
  document.querySelector("#summary-eyelets").textContent = `${money.format(result.eyeletsCost)} ₽`;
  document.querySelector("#eyelets-summary").hidden = !eyeletsInput.checked;
  document.querySelector("#summary-total").textContent = `${money.format(result.total)} ₽`;
}

function buildMessage() {
  const r = calculation();
  const eyelets = eyeletsInput.checked ? `Да, примерно ${r.eyeletCount} шт. (${money.format(r.eyeletsCost)} ₽)` : "Нет";
  const design = designStatus.value === "needed" ? "Нужен дизайн" : "Макет готов";
  return [
    "Здравствуйте! Хочу заказать широкоформатную печать в МОНОПРИНТ.",
    "",
    `Материал: ${r.material.label} - от ${money.format(r.material.price)} ₽/м²`,
    `Размер: ${decimal.format(r.width)} × ${decimal.format(r.height)} м`,
    `Количество: ${r.quantity} шт.`,
    `Общая площадь: ${decimal.format(r.area)} м²`,
    `Люверсы: ${eyelets}`,
    `Макет: ${design}`,
    `Предварительная стоимость: ${money.format(r.total)} ₽`,
    "",
    "Прошу подтвердить расчёт и срок изготовления."
  ].join("\n");
}

form.addEventListener("input", calculate);
form.addEventListener("change", calculate);
document.querySelectorAll("[data-quantity-step]").forEach((button) => {
  button.addEventListener("click", () => {
    quantityInput.value = Math.max(1, Number(quantityInput.value || 1) + Number(button.dataset.quantityStep));
    calculate();
  });
});

document.querySelector("#max-submit").addEventListener("click", () => {
  openMaxChat(buildMessage());
});

renderPrices();
calculate();
loadLivePrices();
