const SHEET_BASE = "https://docs.google.com/spreadsheets/d/1WReItohuSFKGW5CgmueQOW9ZmqwWkQLshQBZhdjX4zU/export?format=csv&gid=";
const SHEETS = { businessCards: "0", print: "426448258" };

const fallback = {
  businessCards: {
    standard: { label: "Стандарт 300 г", density: "300 г", prices: { 100: 1000, 1000: 2300, 2000: 3400, 3000: 4800, 4000: 5900, 5000: 6900, 10000: 11200 } },
    softTouch: { label: "Soft Touch", density: "ламинация Soft Touch", prices: { 100: 2000, 500: 9500, 1000: 17000 } },
    laminate: { label: "Матовая/глянцевая", density: "ламинация", prices: { 100: 1700, 500: 7500, 1000: 15000 } }
  },
  flyers: {
    a7: { label: "А7", prices: { 115: {100:1300,500:1700,1000:1850,2000:2900,3000:3900,5000:4750}, 130:{100:1500,500:1600,1000:1700,2000:3000,3000:4000,5000:4900}, 300:{100:1700,500:2000,1000:2900,2000:4000,3000:5200} } },
    a6: { label: "А6", prices: { 115:{100:1700,500:2300,1000:2600,2000:4000,3000:5100,5000:6700}, 130:{100:1900,500:2400,1000:2900,2000:4500,3000:6000}, 300:{100:2300,500:3550,1000:5000,2000:6700} } },
    a5: { label: "А5", prices: { 115:{100:2450,500:3200,1000:3700,2000:5800,3000:7500,5000:9900}, 130:{100:2650,500:3300,1000:3900,2000:6000,3000:7700,5000:10100}, 300:{100:2850,500:5800,1000:7000,2000:11600} } },
    a4: { label: "А4", prices: { 115:{100:4100,500:5800,1000:6000,2000:9000,3000:12000,5000:16500}, 130:{100:4300,500:6300,1000:6500}, 300:{100:4700,500:11500,1000:12500} } },
    euro: { label: "Евро", prices: { 115:{100:1950,500:2350,1000:2980,2000:4000,3000:4800,5000:6200}, 130:{100:2100,500:2550,1000:3100,2000:4200,3000:5000,5000:6400}, 300:{100:2400,500:5700,1000:5900,2000:9800,3000:14100,5000:21000} } }
  },
  booklets: {
    a5a6: { label: "А5 → А6", prices: { 115:{500:2800,1000:3700,2000:6800,5000:10300} } },
    a4a5: { label: "А4 → А5", prices: { 115:{50:2800}, 300:{50:3000} } },
    a4euro: { label: "А4 → Евро, C-сгиб", prices: { 115:{500:4800,1000:5900,2000:10300,5000:20500,10000:38000}, 130:{500:6500,1000:7900,2000:12500,5000:28700,10000:47800} } }
  },
  options: { rounding: 500, hole: 1.5 }
};

let priceData = JSON.parse(JSON.stringify(fallback));
const form = document.querySelector("#printing-calculator");
const formatSelect = document.querySelector("#print-format");
const densitySelect = document.querySelector("#paper-density");
const quantitySelect = document.querySelector("#print-quantity");
const formatField = document.querySelector("#format-field");
const paperField = document.querySelector("#paper-field");
const formatLabel = document.querySelector("#format-label");
const cardOptions = document.querySelector("#business-card-options");
const rounding = document.querySelector("#rounding");
const hole = document.querySelector("#hole");
const statusNode = document.querySelector("#printing-price-status");
const money = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

function parseCSV(text) {
  const rows=[]; let row=[],cell="",quoted=false;
  for(let i=0;i<text.length;i+=1){const c=text[i],n=text[i+1];if(c==='"'&&quoted&&n==='"'){cell+='"';i+=1}else if(c==='"')quoted=!quoted;else if(c===','&&!quoted){row.push(cell);cell=""}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&n==='\n')i+=1;row.push(cell);rows.push(row);row=[];cell=""}else cell+=c}
  if(cell||row.length){row.push(cell);rows.push(row)} return rows;
}
const norm=(v="")=>v.toLowerCase().replace(/ё/g,"е").replace(/\s+/g," ").trim();
const number=(v="")=>{const m=String(v).replace(/\s/g,"").match(/\d+(?:[.,]\d+)?/);return m?Number(m[0].replace(",",".")):null};

function priceRow(row, quantities) {
  const result={}; quantities.forEach((q,index)=>{const value=number(row[index+1]);if(Number.isFinite(q)&&value&&String(row[index+1]).trim()!=="-")result[q]=value}); return result;
}

function parseBusinessCards(rows) {
  const headerIndex=rows.findIndex(r=>norm(r[0])==="плотность/тираж"); if(headerIndex<0)return false;
  const quantities=rows[headerIndex].slice(1).map(number);
  const mappings=[
    ["standard",r=>norm(r[0])==="300"],
    ["softTouch",r=>norm(r[0]).includes("софт тач")],
    ["laminate",r=>norm(r[0]).includes("мат/глянец")]
  ];
  let count=0; mappings.forEach(([key,test])=>{const row=rows.find(test);if(row){const prices=priceRow(row,quantities);if(Object.keys(prices).length){priceData.businessCards[key].prices=prices;count+=1}}});
  const roundRow=rows.find(r=>norm(r[0]).includes("скругление")); const holeRow=rows.find(r=>norm(r[0])==="отверстие");
  if(roundRow)priceData.options.rounding=number(roundRow.slice(1).join(" "))||priceData.options.rounding;
  if(holeRow)priceData.options.hole=number(holeRow.slice(1).join(" "))||priceData.options.hole;
  return count===3;
}

function sectionKey(name) {
  const n=norm(name);
  if(n.startsWith("листовки а7"))return ["flyers","a7"];
  if(n.startsWith("листовки а6"))return ["flyers","a6"];
  if(n.startsWith("листовки а5"))return ["flyers","a5"];
  if(n.startsWith("листовки а4"))return ["flyers","a4"];
  if(n.startsWith("листовки евро"))return ["flyers","euro"];
  if(n.startsWith("буклеты а5 до а6"))return ["booklets","a5a6"];
  if(n.startsWith("буклеты а4 до а5"))return ["booklets","a4a5"];
  if(n.startsWith("буклеты а4 до евро"))return ["booklets","a4euro"];
  return null;
}

function parseFlyers(rows) {
  let parsed=0;
  for(let i=0;i<rows.length;i+=1){const key=sectionKey(rows[i][0]);if(!key)continue;const header=rows[i+1]||[];if(norm(header[0])!=="плотность/тираж")continue;const quantities=header.slice(1).map(number);const prices={};for(let j=i+2;j<Math.min(i+6,rows.length);j+=1){const density=number(rows[j][0]);if(![115,130,300].includes(density))break;const values=priceRow(rows[j],quantities);if(Object.keys(values).length)prices[density]=values}if(Object.keys(prices).length){priceData[key[0]][key[1]].prices=prices;parsed+=1}}
  return parsed>=8;
}

async function loadPrices() {
  try{
    const stamp=Date.now();
    const [cardsResponse,printResponse]=await Promise.all([
      fetch(`${SHEET_BASE}${SHEETS.businessCards}&_=${stamp}`,{cache:"no-store"}),
      fetch(`${SHEET_BASE}${SHEETS.print}&_=${stamp}`,{cache:"no-store"})
    ]);
    if(!cardsResponse.ok||!printResponse.ok)throw new Error("Ошибка загрузки прайса");
    const cardsOk=parseBusinessCards(parseCSV(await cardsResponse.text()));
    const printOk=parseFlyers(parseCSV(await printResponse.text()));
    if(!cardsOk||!printOk)throw new Error("Не все цены найдены");
    statusNode.textContent="Цены из актуального прайса";statusNode.className="price-status is-live";
  }catch(error){statusNode.textContent="Используются сохранённые цены";statusNode.className="price-status is-fallback"}
  configureProduct();
}

function option(value,label){const o=document.createElement("option");o.value=value;o.textContent=label;return o}
function fillSelect(select,items,selected){select.replaceChildren(...items.map(([v,l])=>option(v,l)));if(selected&&items.some(([v])=>String(v)===String(selected)))select.value=selected}
function product(){return form.elements.product.value}

function configureProduct() {
  const p=product();
  if(p==="businessCards"){
    formatField.hidden=false;paperField.hidden=true;cardOptions.hidden=false;formatLabel.textContent="Исполнение";
    fillSelect(formatSelect,Object.entries(priceData.businessCards).map(([k,v])=>[k,v.label]),formatSelect.value||"standard");
  }else{
    formatField.hidden=false;paperField.hidden=false;cardOptions.hidden=true;rounding.checked=false;hole.checked=false;formatLabel.textContent=p==="flyers"?"Формат":"Сложение";
    fillSelect(formatSelect,Object.entries(priceData[p]).map(([k,v])=>[k,v.label]),formatSelect.value);
  }
  configureDensities();
}

function configureDensities() {
  const p=product();
  if(p==="businessCards"){configureQuantities();return}
  const item=priceData[p][formatSelect.value]||Object.values(priceData[p])[0];
  const densities=Object.keys(item.prices).map(v=>[v,`${v} г/м²`]);
  fillSelect(densitySelect,densities,densitySelect.value);
  configureQuantities();
}

function priceMap() {
  const p=product();
  if(p==="businessCards")return priceData.businessCards[formatSelect.value]?.prices||{};
  return priceData[p][formatSelect.value]?.prices[densitySelect.value]||{};
}

function configureQuantities() {
  const prices=priceMap();const quantities=Object.keys(prices).map(Number).sort((a,b)=>a-b).map(v=>[v,`${money.format(v)} шт.`]);
  fillSelect(quantitySelect,quantities,quantitySelect.value);calculate();
}

function calculation() {
  const p=product(),quantity=Number(quantitySelect.value||0),base=Number(priceMap()[quantity]||0);
  let extra=0;const extras=[];
  if(p==="businessCards"&&rounding.checked){extra+=priceData.options.rounding;extras.push(`скругление ${money.format(priceData.options.rounding)} ₽`)}
  if(p==="businessCards"&&hole.checked){const cost=quantity*priceData.options.hole;extra+=cost;extras.push(`отверстие ${money.format(cost)} ₽`)}
  const productLabel=p==="businessCards"?"Визитки":p==="flyers"?"Листовки":"Буклеты";
  const format=p==="businessCards"?priceData.businessCards[formatSelect.value]?.label:priceData[p][formatSelect.value]?.label;
  const params=p==="businessCards"?format:`${format}, ${densitySelect.value} г/м²`;
  return {p,productLabel,params,quantity,base,extra,extras,total:base+extra};
}

function calculate() {
  const r=calculation();
  document.querySelector("#printing-summary-product").textContent=r.productLabel;
  document.querySelector("#printing-summary-params").textContent=r.params||"—";
  document.querySelector("#printing-summary-quantity").textContent=`${money.format(r.quantity)} шт.`;
  document.querySelector("#printing-summary-base").textContent=`${money.format(r.base)} ₽`;
  document.querySelector("#printing-options-summary").hidden=!r.extra;
  document.querySelector("#printing-summary-options").textContent=`${money.format(r.extra)} ₽`;
  document.querySelector("#printing-summary-total").textContent=`${money.format(r.total)} ₽`;
}

function message() {
  const r=calculation();const design=document.querySelector("#printing-design-status").value==="needed"?"Нужен дизайн":"Макет готов";
  return ["Здравствуйте! Хочу заказать полиграфию в МОНОПРИНТ.","",`Продукция: ${r.productLabel}`,`Параметры: ${r.params}`,`Тираж: ${money.format(r.quantity)} шт.`,r.extras.length?`Опции: ${r.extras.join(", ")}`:"Дополнительные опции: нет",`Макет: ${design}`,`Предварительная стоимость: ${money.format(r.total)} ₽`,"","Прошу подтвердить расчёт и срок изготовления."].join("\n");
}

[...form.elements.product].forEach(input=>input.addEventListener("change",configureProduct));
formatSelect.addEventListener("change",configureDensities);densitySelect.addEventListener("change",configureQuantities);
form.addEventListener("change",calculate);
document.querySelector("#printing-max-submit").addEventListener("click",()=>window.open(`https://max.ru/:share?text=${encodeURIComponent(message())}`,"_blank","noopener,noreferrer"));
configureProduct();loadPrices();
