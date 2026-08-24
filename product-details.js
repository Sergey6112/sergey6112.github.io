const productDetailButtons=[...document.querySelectorAll(".product-detail-button")];
const productDetailSections=[...document.querySelectorAll(".product-detail-section")];

function showProductDetails(openId=""){
  productDetailSections.forEach(section=>{section.hidden=section.id!==openId;});
  productDetailButtons.forEach(button=>{
    const active=button.dataset.target===openId;
    button.classList.toggle("is-active",active);
    button.setAttribute("aria-expanded",String(active));
  });
}

productDetailButtons.forEach(button=>{
  button.addEventListener("click",()=>{
    const targetId=button.dataset.target;
    const isOpen=button.getAttribute("aria-expanded")==="true";
    showProductDetails(isOpen?"":targetId);
    if(!isOpen){requestAnimationFrame(()=>document.getElementById(targetId).scrollIntoView({behavior:"smooth",block:"start"}));}
  });
});

document.querySelectorAll(".product-details-close").forEach(button=>{
  button.addEventListener("click",()=>{
    const section=button.closest(".product-detail-section");
    const opener=productDetailButtons.find(item=>item.dataset.target===section.id);
    showProductDetails();
    opener?.focus();
  });
});

const initialProductId=location.hash.slice(1);
if(productDetailSections.some(section=>section.id===initialProductId)){
  showProductDetails(initialProductId);
  requestAnimationFrame(()=>document.getElementById(initialProductId)?.scrollIntoView({block:"start"}));
}
