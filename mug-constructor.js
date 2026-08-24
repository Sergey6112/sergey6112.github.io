import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const viewer = document.getElementById('viewer');
const loaderEl = document.getElementById('loader');
const canvas = document.getElementById('printCanvas');
const ctx = canvas.getContext('2d');
const fileInput = document.getElementById('fileInput');
const scaleRange = document.getElementById('scaleRange');
const rotationRange = document.getElementById('rotationRange');
const scaleOut = document.getElementById('scaleOut');
const rotationOut = document.getElementById('rotationOut');

const state = { image:null, x:canvas.width/2, y:canvas.height/2, scale:1, rotation:0, dragging:false, lastX:0, lastY:0 };
let mugTexture, renderer, scene, camera, controls, mugRoot;
let autoRotate = false;

function drawEditor(showGuides=true){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#fafaf7'; ctx.fillRect(0,0,canvas.width,canvas.height);
  // subtle grid
  ctx.save(); ctx.strokeStyle='rgba(0,0,0,.035)'; ctx.lineWidth=1;
  for(let x=0;x<=canvas.width;x+=canvas.width/8){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,canvas.height);ctx.stroke()}
  for(let y=0;y<=canvas.height;y+=canvas.height/4){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(canvas.width,y);ctx.stroke()}
  ctx.restore();

  if(state.image){
    ctx.save(); ctx.translate(state.x,state.y); ctx.rotate(state.rotation*Math.PI/180); ctx.scale(state.scale,state.scale);
    ctx.drawImage(state.image,-state.image.width/2,-state.image.height/2); ctx.restore();
  } else {
    ctx.fillStyle='#a7a7a2'; ctx.textAlign='center'; ctx.font='600 28px Inter, Arial'; ctx.fillText('Загрузите изображение',canvas.width/2,canvas.height/2-5);
    ctx.fillStyle='#c0c0bb'; ctx.font='400 18px Inter, Arial'; ctx.fillText('и расположите его в области печати',canvas.width/2,canvas.height/2+31);
  }

  if(showGuides){
    const m=24; ctx.save(); ctx.setLineDash([12,10]); ctx.strokeStyle='rgba(239,43,115,.55)'; ctx.lineWidth=2; ctx.strokeRect(m,m,canvas.width-m*2,canvas.height-m*2); ctx.restore();
  }
  refreshTexture();
}

function refreshTexture(){ if(mugTexture) mugTexture.needsUpdate=true; }
function setScaleUI(){ scaleRange.value=Math.round(state.scale*100); scaleOut.value=`${Math.round(state.scale*100)}%`; rotationRange.value=state.rotation; rotationOut.value=`${Math.round(state.rotation)}°`; }

function loadImage(file){
  if(!file || !file.type.startsWith('image/')) return;
  if(file.size>20*1024*1024){ alert('Файл больше 20 МБ. Выберите изображение меньшего размера.'); return; }
  const url=URL.createObjectURL(file), img=new Image();
  img.onload=()=>{ state.image=img; state.rotation=0; fitImage(); URL.revokeObjectURL(url); };
  img.src=url;
}
function fitImage(){ if(!state.image)return; state.scale=Math.min(canvas.width/state.image.width,canvas.height/state.image.height)*.92; state.x=canvas.width/2; state.y=canvas.height/2; setScaleUI(); drawEditor(); }
function fillImage(){ if(!state.image)return; state.scale=Math.max(canvas.width/state.image.width,canvas.height/state.image.height); state.x=canvas.width/2; state.y=canvas.height/2; setScaleUI(); drawEditor(); }
function centerImage(){ state.x=canvas.width/2; state.y=canvas.height/2; drawEditor(); }

function getPoint(ev){ const r=canvas.getBoundingClientRect(); return {x:(ev.clientX-r.left)*canvas.width/r.width,y:(ev.clientY-r.top)*canvas.height/r.height}; }
canvas.addEventListener('pointerdown',ev=>{ if(!state.image)return; const p=getPoint(ev); state.dragging=true; state.lastX=p.x;state.lastY=p.y;canvas.setPointerCapture(ev.pointerId); });
canvas.addEventListener('pointermove',ev=>{ if(!state.dragging)return; const p=getPoint(ev); state.x+=p.x-state.lastX;state.y+=p.y-state.lastY;state.lastX=p.x;state.lastY=p.y;drawEditor(); });
canvas.addEventListener('pointerup',()=>state.dragging=false);canvas.addEventListener('pointercancel',()=>state.dragging=false);
canvas.addEventListener('wheel',ev=>{ if(!state.image)return;ev.preventDefault(); state.scale*=ev.deltaY<0?1.05:.95;state.scale=Math.max(.05,Math.min(4,state.scale));setScaleUI();drawEditor();},{passive:false});

scaleRange.addEventListener('input',()=>{state.scale=+scaleRange.value/100;scaleOut.value=`${scaleRange.value}%`;drawEditor()});
rotationRange.addEventListener('input',()=>{state.rotation=+rotationRange.value;rotationOut.value=`${rotationRange.value}°`;drawEditor()});
document.querySelectorAll('[data-nudge]').forEach(btn=>btn.addEventListener('click',()=>{let [x,y]=btn.dataset.nudge.split(',').map(Number);state.x+=x;state.y+=y;drawEditor()}));
document.getElementById('fitBtn').onclick=fitImage;document.getElementById('fillBtn').onclick=fillImage;document.getElementById('centerBtn').onclick=centerImage;
document.getElementById('chooseFileBtn').onclick=e=>{e.preventDefault();fileInput.click()};fileInput.addEventListener('change',()=>loadImage(fileInput.files[0]));
const uploadZone=document.getElementById('uploadZone');['dragenter','dragover'].forEach(n=>uploadZone.addEventListener(n,e=>{e.preventDefault();uploadZone.classList.add('drag')}));['dragleave','drop'].forEach(n=>uploadZone.addEventListener(n,e=>{e.preventDefault();uploadZone.classList.remove('drag')}));uploadZone.addEventListener('drop',e=>loadImage(e.dataTransfer.files[0]));

function init3D(){
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(35,viewer.clientWidth/viewer.clientHeight,.01,100);camera.position.set(1.7,.55,1.85);
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(viewer.clientWidth,viewer.clientHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;viewer.prepend(renderer.domElement);
  controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.06;controls.enablePan=false;controls.minDistance=1.05;controls.maxDistance=4;controls.target.set(.05,-.03,0);
  scene.add(new THREE.HemisphereLight(0xffffff,0xd7d7d2,2.4));
  const key=new THREE.DirectionalLight(0xffffff,3.6);key.position.set(3,4,3);key.castShadow=true;scene.add(key);
  const rim=new THREE.DirectionalLight(0xffffff,1.6);rim.position.set(-3,1,-2);scene.add(rim);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(1.15,64),new THREE.ShadowMaterial({opacity:.12}));floor.rotation.x=-Math.PI/2;floor.position.y=-.51;floor.receiveShadow=true;scene.add(floor);

  mugTexture=new THREE.CanvasTexture(canvas);mugTexture.colorSpace=THREE.SRGBColorSpace;mugTexture.flipY=false;mugTexture.wrapS=THREE.ClampToEdgeWrapping;mugTexture.wrapT=THREE.ClampToEdgeWrapping;

  new GLTFLoader().load('assets/mug.glb',gltf=>{
    mugRoot=gltf.scene; scene.add(mugRoot);
    mugRoot.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true; const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(mat=>{if(!mat)return;if(mat.name==='art_here'){mat.map=mugTexture;mat.color.set(0xffffff);mat.roughness=.32;mat.metalness=0;}else{mat.color.set(0xffffff);mat.roughness=.28;mat.metalness=0;}mat.needsUpdate=true;});});
    const box=new THREE.Box3().setFromObject(mugRoot), size=box.getSize(new THREE.Vector3()), center=box.getCenter(new THREE.Vector3());mugRoot.position.sub(center); const s=1.35/Math.max(size.x,size.y,size.z);mugRoot.scale.setScalar(s); mugRoot.position.y+=.02;
    loaderEl.style.display='none'; drawEditor();
  },undefined,err=>{loaderEl.innerHTML='<b>Не удалось загрузить 3D-модель</b><small>Обновите страницу или попробуйте открыть её позже.</small>';console.error(err)});

  function animate(){requestAnimationFrame(animate);controls.autoRotate=autoRotate;controls.autoRotateSpeed=1.6;controls.update();renderer.render(scene,camera)}animate();
  addEventListener('resize',()=>{camera.aspect=viewer.clientWidth/viewer.clientHeight;camera.updateProjectionMatrix();renderer.setSize(viewer.clientWidth,viewer.clientHeight)});
}

document.getElementById('rotateBtn').onclick=()=>{autoRotate=!autoRotate;document.getElementById('rotateBtn').style.background=autoRotate?'#171717':'#fff';document.getElementById('rotateBtn').style.color=autoRotate?'#fff':'#222'};
document.getElementById('resetViewBtn').onclick=()=>{camera.position.set(1.7,.55,1.85);controls.target.set(.05,-.03,0);controls.update()};
document.getElementById('resetAllBtn').onclick=()=>{state.image=null;state.x=canvas.width/2;state.y=canvas.height/2;state.scale=1;state.rotation=0;fileInput.value='';setScaleUI();drawEditor();camera.position.set(1.7,.55,1.85);controls.target.set(.05,-.03,0)};

function downloadData(url,name){const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove()}
document.getElementById('downloadPrintBtn').onclick=()=>{if(!state.image){alert('Сначала загрузите изображение.');return;}drawEditor(false);downloadData(canvas.toDataURL('image/png'),'monoprint-mug-210x95mm.png');drawEditor(true)};
document.getElementById('downloadPreviewBtn').onclick=()=>{renderer.render(scene,camera);downloadData(renderer.domElement.toDataURL('image/png'),'monoprint-mug-preview.png')};

drawEditor();init3D();
