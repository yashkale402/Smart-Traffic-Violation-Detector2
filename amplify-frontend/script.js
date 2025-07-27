// ---------------- CONFIG ----------------
// ⚠️  PUT YOUR REAL API GATEWAY URL HERE
const API_ENDPOINT = 

// ---------------------------------------

const qs = sel => document.querySelector(sel);

// Element refs
const fileInput       = qs('#fileInput');
const browseBtn       = qs('#browseBtn');
const uploadBox       = qs('#uploadBox');
const progressWrap    = qs('#uploadProgressWrapper');
const progressFill    = qs('#uploadProgress');
const progressPercent = qs('#progressPercent');
const processingText  = qs('#processingStatus span');
const resultSection   = qs('#resultSection');
const resultAlert     = qs('#resultAlert');
const resultBody      = qs('#resultTable tbody');
const evidenceImg     = qs('#evidenceImg');
const newBtn          = qs('#newAnalysisBtn');
const exportBtn       = qs('#exportBtn');

// Browse click
browseBtn.addEventListener('click', () => fileInput.click());

// Drag‑n‑drop
['dragover','dragenter'].forEach(ev =>
  uploadBox.addEventListener(ev, e => {
    e.preventDefault();
    uploadBox.classList.add('drag');
  })
);
['dragleave','dragend','drop'].forEach(ev =>
  uploadBox.addEventListener(ev, () => uploadBox.classList.remove('drag'))
);
uploadBox.addEventListener('drop', e => {
  e.preventDefault();
  if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});

// File picker
fileInput.addEventListener('change', e => handleFile(e.target.files[0]));

// Upload & analyze
async function handleFile(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async e => {
    try {
      startProgress();
      const res = await fetch(API_ENDPOINT, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ filename:file.name, data:e.target.result })
      });
      stepProgress(75,'Analyzing with AI …');

      const data = await res.json();
      stepProgress(100,'Completed');
      setTimeout(resetProgress,800);

      showResult(data);
    } catch (err) {
      alert('Error: '+err);
      resetProgress();
    }
  };
  reader.readAsDataURL(file);
}

// Progress helpers
function startProgress(){
  progressWrap.classList.remove('d-none');
  stepProgress(10,'Uploading image …');
}
function stepProgress(percent,txt){
  progressFill.style.width = percent+'%';
  progressPercent.textContent = percent+'%';
  processingText.textContent  = txt;
}
function resetProgress(){
  progressWrap.classList.add('d-none');
  progressFill.style.width = '0%';
  progressPercent.textContent = '0%';
}

// Display results
function showResult(data){
  resultSection.classList.remove('d-none');

  if (data.violations && data.violations.length){
    resultAlert.className = 'result-alert danger';
    resultAlert.textContent = 'Violations Detected: '+data.violations.join(', ');
  } else {
    resultAlert.className = 'result-alert success';
    resultAlert.textContent = 'No violation detected';
  }

  resultBody.innerHTML = '';
  data.labels.forEach(l => addRow('Label',l,'-'));
  data.texts .forEach(t => addRow('Detected Text',t,'-'));
  evidenceImg.src = data.imgUrl;
}
function addRow(type,val,conf){
  const tr = document.createElement('tr');
  tr.innerHTML = `<td>${type}</td><td>${val}</td><td>${conf}</td>`;
  resultBody.appendChild(tr);
}

// Buttons
newBtn.addEventListener('click', () => {
  resultSection.classList.add('d-none');
  fileInput.value = '';
  evidenceImg.src = '';
});
exportBtn.addEventListener('click', () =>
  alert('Export feature coming soon 🚀')
);
