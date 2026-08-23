const directionButtons=[...document.querySelectorAll(".sticker-direction")];
const detailSections=[...document.querySelectorAll(".sticker-details")];

function closeAll(exceptId=""){
  detailSections.forEach(section=>{section.hidden=section.id!==exceptId;});
  directionButtons.forEach(button=>{
    const active=button.dataset.target===exceptId;
    button.classList.toggle("is-active",active);
    button.setAttribute("aria-expanded",String(active));
  });
}

directionButtons.forEach(button=>{
  button.addEventListener("click",()=>{
    const targetId=button.dataset.target;
    const isOpen=button.getAttribute("aria-expanded")==="true";
    closeAll(isOpen?"":targetId);
    if(!isOpen){requestAnimationFrame(()=>document.getElementById(targetId).scrollIntoView({behavior:"smooth",block:"start"}));}
  });
});

document.querySelectorAll(".sticker-details-close").forEach(button=>{
  button.addEventListener("click",()=>{
    const section=button.closest(".sticker-details");
    const opener=directionButtons.find(item=>item.dataset.target===section.id);
    closeAll();
    opener?.focus();
  });
});
