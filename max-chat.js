const MONOPRINT_MAX_CHAT="https://max.ru/u/f9LHodD0cOK-8bOsjbWF1MatpsxchI5ix057xEPlfJnU2UN78zfdYixXzE4";

function showMaxNotice(text,isError=false){
  let notice=document.querySelector("#max-copy-toast");
  if(!notice){
    notice=document.createElement("div");
    notice.id="max-copy-toast";
    notice.className="max-copy-toast";
    notice.setAttribute("role","status");
    notice.setAttribute("aria-live","polite");
    document.body.append(notice);
  }
  notice.textContent=text;
  notice.classList.toggle("is-error",isError);
  notice.classList.remove("is-hidden");
  clearTimeout(showMaxNotice.timer);
  showMaxNotice.timer=setTimeout(()=>notice.classList.add("is-hidden"),5000);
}

function fallbackCopy(text){
  const field=document.createElement("textarea");
  field.value=text;
  field.setAttribute("readonly","");
  field.style.position="fixed";
  field.style.opacity="0";
  document.body.append(field);
  field.select();
  const copied=document.execCommand("copy");
  field.remove();
  return copied;
}

function openMaxChat(message){
  window.open(MONOPRINT_MAX_CHAT,"_blank","noopener,noreferrer");
  const success=()=>showMaxNotice("Расчёт скопирован. Вставьте его в открывшийся чат MAX.");
  const failure=()=>showMaxNotice("Чат MAX открыт. Скопируйте расчёт со страницы и отправьте его менеджеру.",true);
  if(navigator.clipboard&&window.isSecureContext){
    navigator.clipboard.writeText(message).then(success).catch(()=>fallbackCopy(message)?success():failure());
  }else{
    fallbackCopy(message)?success():failure();
  }
}

window.openMaxChat=openMaxChat;
