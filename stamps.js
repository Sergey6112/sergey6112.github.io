const product=document.querySelector("#stamp-product");
const shape=document.querySelector("#stamp-shape");
const quantity=document.querySelector("#stamp-quantity");
const urgent=document.querySelector("#stamp-urgent");
const file=document.querySelector("#stamp-file");
const typeButtons=[...document.querySelectorAll(".stamp-type-button")];

function count(){return Math.max(1,Math.round(Number(quantity.value)||1));}
function update(){
  quantity.value=count();
  document.querySelector("#stamp-summary-text").textContent=`${product.value} · ${shape.value.toLowerCase()} форма · ${count()} шт.${urgent.checked?" · срочное изготовление":""}`;
  typeButtons.forEach(button=>button.classList.toggle("is-active",button.dataset.stampType===product.value));
}
function message(){
  const filename=file.files[0]?.name||"не выбран";
  return["Здравствуйте! Хочу заказать печать или штамп в МОНОПРИНТ.","",`Изделие: ${product.value}`,`Форма: ${shape.value}`,`Количество: ${count()} шт.`,`Срочно: ${urgent.checked?"да":"нет"}`,`Файл: ${filename}`,"","Прошу рассчитать стоимость и срок изготовления.",filename!=="не выбран"?"Файл прикреплю следующим сообщением.":""].filter(Boolean).join("\n");
}

typeButtons.forEach(button=>button.addEventListener("click",()=>{product.value=button.dataset.stampType;update();document.querySelector("#stamp-configurator").scrollIntoView({behavior:"smooth",block:"start"});}));
document.querySelectorAll("[data-stamp-step]").forEach(button=>button.addEventListener("click",()=>{quantity.value=count()+Number(button.dataset.stampStep);update();}));
document.querySelector("#stamp-configurator").addEventListener("input",update);
document.querySelector("#stamp-configurator").addEventListener("change",update);
file.addEventListener("change",()=>{document.querySelector("#stamp-file-label").textContent=file.files[0]?.name||"Загрузить файл";});
document.querySelector("#stamp-max-submit").addEventListener("click",()=>window.open(`https://max.ru/:share?text=${encodeURIComponent(message())}`,"_blank","noopener,noreferrer"));
update();
