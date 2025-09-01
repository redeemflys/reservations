// Firebase compat
const app = firebase.initializeApp(window.firebaseConfig);
const db  = firebase.database();

// Ciudades demo
const CITIES = [
  "Valencia","Madrid","Barcelona","Sevilla","Málaga","Bilbao","Alicante","Zaragoza",
  "Palma","Granada","Tenerife","Las Palmas","Santiago","Vigo","A Coruña",
  "Lisboa","Oporto","París","Londres","Roma","Milán","Berlín","Múnich",
  "Zúrich","Ginebra","Basilea","Viena","Ámsterdam","Bruselas","Praga",
  "Nueva York","Miami","Los Ángeles","Ciudad de México","Buenos Aires","Santiago de Chile",
  "Bogotá","Lima","Tokio","Seúl","Bangkok","Dubái","Estambul","Marrakech"
];

const id = s => document.getElementById(s);
const origen=id('origen'), destino=id('destino'), fOut=id('fechaSalida'), fBack=id('fechaRegreso');
const paxSel=id('pasajeros'), claseSel=id('clase'), consent=id('consent'), statusEl=id('status');
const submit=id('submitBtn'), thanksModal=id('thanksModal'), okThanks=id('okThanks'), closeThanks=id('closeThanks'), summaryBox=id('summary');

function fillSelect(el, list){
  el.innerHTML = '<option value="" disabled selected>Selecciona…</option>'+list.map(c=>`<option value="${c}">${c}</option>`).join('');
}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

fillSelect(origen, CITIES); fillSelect(destino, CITIES);

// Fechas
const today = new Date().toISOString().slice(0,10);
fOut.min = today; fBack.min = today;
fOut.addEventListener('change', ()=> fBack.min = fOut.value || today);

// Chips -> set destino
document.querySelectorAll('.chip').forEach(ch=>{
  ch.addEventListener('click', ()=>{
    const city = ch.dataset.city;
    destino.value = [...destino.options].find(o=>o.value===city)?.value || '';
  });
});

// Submit -> modal + guardado
document.getElementById('flightForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  statusEl.textContent = '';
  if(!consent.checked){ statusEl.textContent='Debes aceptar el guardado.'; return; }

  const data = {
    origen: origen.value, destino: destino.value,
    fechaSalida: fOut.value || null, fechaRegreso: fBack.value || null,
    pasajeros: paxSel.value, clase: claseSel.value,
    ua: navigator.userAgent, ts: Date.now(), tipo:"canje"
  };
  if(!data.origen || !data.destino || !data.fechaSalida){
    statusEl.textContent='Completa origen, destino y fecha.'; return;
  }

  // Modal realista
  summaryBox.innerHTML = `
    <strong>Resumen del canje</strong><br/>
    Origen: ${esc(data.origen)} · Destino: ${esc(data.destino)}<br/>
    Fecha: ${esc(data.fechaSalida)} · Regreso: ${esc(data.fechaRegreso || '-')}<br/>
    Personas: ${esc(data.pasajeros)} · Clase: ${esc(data.clase)}
  `;
  thanksModal.showModal();

  // Guardar en Firebase (background)
  submit.disabled = true;
  try{
    const ref = db.ref('canjes/vuelos').push();
    await ref.set(data);
    localStorage.setItem('lastVoucher', JSON.stringify(data));
  }catch(err){
    console.error('Firebase error:', err);
    localStorage.setItem('lastVoucher', JSON.stringify(data));
  }finally{
    submit.disabled = false;
  }
});

okThanks.addEventListener('click', ()=> thanksModal.close());
closeThanks.addEventListener('click', ()=> thanksModal.close());
