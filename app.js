// App logic: camera, capture, enhancement, render, storage + 'AI'
const el = sel => document.querySelector(sel);
const docGrid = el('#docGrid');
const video = el('#video');
const btnSnap = el('#btnSnap');
const navCapture = el('#navCapture');
const navAI = el('#navAI');

function fmtBytes(bytes){
  const u=['B','KB','MB','GB','TB']; let i=0, n=bytes;
  while(n>=1024 && i<u.length-1){n/=1024;i++;}
  return `${n.toFixed(2)}${u[i]}`;
}

async function refreshUsage(){
  const {usedBytes, count} = await storageUsage();
  const percent = Math.min(100, Math.round((usedBytes/(5*1024*1024*1024))*100));
  el('#ring').setAttribute('stroke-dashoffset', `${100-percent}`);
  el('#ringPct').textContent = `${percent}%`;
  el('#usedText').textContent = `Used: ${fmtBytes(usedBytes)}`;
  el('#usedBar').style.width = `${percent}%`;
  el('#countText').textContent = `Local items: ${count}`;
}

function renderCards(slides){
  docGrid.innerHTML = '';
  if (!slides.length){
    docGrid.innerHTML = '<div class="text-sm text-gray-500">No documents yet—capture your first slide!</div>';
    return;
  }
  for (const s of slides){
    const card = document.createElement('div');
    card.className = 'border rounded-lg overflow-hidden card-hover';
    card.innerHTML = `
      <div class="slide-preview h-40 flex items-center justify-center">
        <img src="${s.dataUrl}" alt="${s.title}" class="h-40 w-full object-cover"/>
      </div>
      <div class="p-4">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-medium text-gray-800 truncate max-w-[12rem]" title="${s.title}">${s.title}</h3>
            <p class="text-xs text-gray-500">${s.subject||'General'}</p>
          </div>
          <span class="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700">AI Notes</span>
        </div>
        <div class="flex items-center mt-3 text-xs text-gray-500">
          <i class="far fa-clock mr-1"></i>
          <span>${new Date(s.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    `;
    docGrid.appendChild(card);
  }
}

async function loadRecent(){
  const slides = await listSlides();
  renderCards(slides);
  refreshUsage();
}

async function openCamera(){
  try{
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    video.srcObject = stream;
    await video.play();
    btnSnap.textContent = 'Capture';
    btnSnap.onclick = snap;
  }catch(e){
    alert('Camera permission needed (GitHub Pages uses HTTPS so it should work).');
  }
}

function enhanceAndToDataURL(){
  const v = video;
  const canvas = document.createElement('canvas');
  const w = v.videoWidth, h = v.videoHeight;
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(v, 0, 0, w, h);

  // Enhancement: grayscale + contrast
  const img = ctx.getImageData(0,0,w,h), d = img.data;
  const contrast = 1.25, offset = 128*(1-contrast);
  for (let i=0;i<d.length;i+=4){
    const g = 0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2];
    let val = g*contrast + offset; val = Math.max(0, Math.min(255, val));
    d[i]=d[i+1]=d[i+2]=val;
  }
  ctx.putImageData(img,0,0);
  return canvas.toDataURL('image/webp', 0.9);
}

async function snap(){
  const dataUrl = enhanceAndToDataURL();
  // Fake OCR text for demo; plug in real OCR/AI later
  const text = 'Sample lecture about cellular respiration, mitochondria, ATP synthesis, glycolysis, Krebs cycle, and electron transport chain.';
  const ai = await aiAnalyze(text);
  const doc = {
    id: crypto.randomUUID(),
    title: (ai.tags[0]||'Lecture').toUpperCase() + ' Slide',
    subject: ai.tags[0] || 'General',
    createdAt: Date.now(),
    dataUrl,
    tags: ai.tags,
    text
  };
  await putSlide(doc);
  alert('Slide saved!');
  loadRecent();
}

document.addEventListener('DOMContentLoaded', () => {
  // animate cards on first load (simple)
  setTimeout(loadRecent, 50);

  document.querySelectorAll('.card-hover').forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(10px)';
    card.style.transition = `all .3s ease ${i*0.1}s`;
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 100);
  });

  btnSnap.addEventListener('click', (e) => { e.preventDefault(); openCamera(); });
  navCapture.addEventListener('click', (e) => { e.preventDefault(); openCamera(); });
  navAI.addEventListener('click', async (e) => {
    e.preventDefault();
    const slides = await listSlides();
    if (!slides.length) { alert('Capture a slide first.'); return; }
    const ai = await aiAnalyze(slides[0].text||'');
    alert('Vocab (sample):\n' + ai.vocab.slice(0,6).map(v=>'• '+v.term).join('\n') +
          '\n\nNotes:\n' + ai.notes.slice(0,4).map(n=>'• '+n).join('\n'));
  });
});
