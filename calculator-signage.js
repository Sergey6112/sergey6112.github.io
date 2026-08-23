const toggle=document.querySelector("#neon-toggle");
const calculator=document.querySelector("#neon-calculator");
const closeButton=document.querySelector("#neon-close");
const widthInput=document.querySelector("#neon-width");
const heightInput=document.querySelector("#neon-height");
const lengthInput=document.querySelector("#neon-length");
const elementsInput=document.querySelector("#neon-elements");
const fileInput=document.querySelector("#neon-file");
const facadeToggle=document.querySelector("#facade-toggle");
const facadeInfo=document.querySelector("#facade-info");
const facadeClose=document.querySelector("#facade-close");
const money=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const decimal=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});
const NEON_PRICE_FACTOR=0.9;

function bounded(input,min,max,fallback){
  const value=Number(String(input.value).replace(",","."));
  return Number.isFinite(value)?Math.min(max,Math.max(min,value)):fallback;
}

function result(){
  const base=Number(new FormData(calculator).get("neonBase")||2300);
  const width=bounded(widthInput,30,290,100);
  const height=bounded(heightInput,20,190,50);
  const length=bounded(lengthInput,1,50,6);
  const elements=Math.round(bounded(elementsInput,1,150,20));
  const materialCost=(base+(width/100*height/100*1.3*3200))*NEON_PRICE_FACTOR;
  const neonCost=length*1600*NEON_PRICE_FACTOR;
  const elementsCost=elements*160*NEON_PRICE_FACTOR;
  const raw=1.1*(1.1*materialCost+neonCost+elementsCost);
  return{base,width,height,length,elements,total:Math.round(raw/100)*100,baseLabel:base===4900?"Цветное основание":"Прозрачное основание"};
}

function calculate(){
  const value=result();
  document.querySelector("#neon-total").textContent=`${money.format(value.total)} ₽`;
  document.querySelector("#neon-summary-text").textContent=`${value.baseLabel} · ${value.width} × ${value.height} см · ${decimal.format(value.length)} м неона · ${value.elements} эл.`;
}

function setOpen(open,focus=true){
  calculator.hidden=!open;
  toggle.setAttribute("aria-expanded",String(open));
  toggle.classList.toggle("is-active",open);
  if(open){calculate();requestAnimationFrame(()=>calculator.scrollIntoView({behavior:"smooth",block:"start"}));}
  else if(focus){toggle.focus();}
}

function setFacadeOpen(open,focus=true){
  facadeInfo.hidden=!open;
  facadeToggle.setAttribute("aria-expanded",String(open));
  facadeToggle.classList.toggle("is-active",open);
  if(open){requestAnimationFrame(()=>facadeInfo.scrollIntoView({behavior:"smooth",block:"start"}));}
  else if(focus){facadeToggle.focus();}
}

function message(){
  const value=result();
  const file=fileInput.files[0]?.name||"не выбран";
  return["Здравствуйте! Хочу заказать неоновую вывеску в МОНОПРИНТ.","",`Основание: ${value.baseLabel}`,`Размер: ${value.width} × ${value.height} см`,`Длина гибкого неона: ${decimal.format(value.length)} м`,`Количество элементов: ${value.elements}`,`Ориентировочная стоимость: ${money.format(value.total)} ₽`,`Файл: ${file}`,"","Прошу уточнить стоимость и срок изготовления.",file!=="не выбран"?"Файл прикреплю следующим сообщением.":""].filter(Boolean).join("\n");
}

toggle.addEventListener("click",()=>{const open=calculator.hidden;if(open)setFacadeOpen(false,false);setOpen(open);});
closeButton.addEventListener("click",()=>setOpen(false));
facadeToggle.addEventListener("click",()=>{const open=facadeInfo.hidden;if(open)setOpen(false,false);setFacadeOpen(open);});
facadeClose.addEventListener("click",()=>setFacadeOpen(false));
calculator.addEventListener("input",calculate);
calculator.addEventListener("change",calculate);
fileInput.addEventListener("change",()=>{document.querySelector("#neon-file-label").textContent=fileInput.files[0]?.name||"Загрузить файл";});
document.querySelector("#neon-max-submit").addEventListener("click",()=>openMaxChat(message()));
document.querySelector("#facade-max-submit").addEventListener("click",()=>openMaxChat("Здравствуйте! Хочу оформить фасад в МОНОПРИНТ. Нужна консультация по способу оформления: плоттерная резка цветных плёнок или закатка полноцветной печатной плёнкой. Прошу помочь подобрать подходящий вариант и рассчитать стоимость."));
calculate();
