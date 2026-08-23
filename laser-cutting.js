const cuttingButtons=[...document.querySelectorAll(".cutting-direction")];
const cuttingSections=[...document.querySelectorAll(".cutting-details")];

function setCuttingSection(openId=""){
  cuttingSections.forEach(section=>{section.hidden=section.id!==openId;});
  cuttingButtons.forEach(button=>{
    const active=button.dataset.target===openId;
    button.classList.toggle("is-active",active);
    button.setAttribute("aria-expanded",String(active));
  });
}

cuttingButtons.forEach(button=>{
  button.addEventListener("click",()=>{
    const targetId=button.dataset.target;
    const isOpen=button.getAttribute("aria-expanded")==="true";
    setCuttingSection(isOpen?"":targetId);
    if(!isOpen){requestAnimationFrame(()=>document.getElementById(targetId).scrollIntoView({behavior:"smooth",block:"start"}));}
  });
});

document.querySelectorAll(".cutting-details-close").forEach(button=>{
  button.addEventListener("click",()=>{
    const section=button.closest(".cutting-details");
    const opener=cuttingButtons.find(item=>item.dataset.target===section.id);
    setCuttingSection();
    opener?.focus();
  });
});
