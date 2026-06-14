// ===== STATE =====
let state=load();
// Restore custom costs into FORECAST_ITEMS
(function(){if(state.customCosts&&state.customCosts.length){state.customCosts.forEach(function(c){if(!FORECAST_ITEMS.find(function(x){return x.id===c.id})){FORECAST_ITEMS.push({id:c.id,type:'oneoff',defaultFund:c.fund,cat:c.fund==='uk_wages'?'UK Property':'AU Setup',desc:c.desc,week:10,forecastLow:c.forecast,forecastHigh:c.forecast,forecast:c.forecast,phase:c.fund==='uk_wages'?2:4})}})}})();
function defaults(){return{auStart:null,moveDate:null,lumpSum:14900,checked:{},actuals:{},funding:{},forecasts:{},contacts:{},decisions:{},weeklySpend:{},fx:[],income:[],debtPaid:{},debts:null,journal:{},riskStatus:{},docChecked:{},todos:[],customTasks:[],customCosts:[],customDocs:[],pins:[],_collapsed:{}}}
function load(){
  var d=defaults();
  try{var s=localStorage.getItem('relo_v3');if(s){var saved=JSON.parse(s);Object.keys(saved).forEach(function(k){d[k]=saved[k]})}}catch(e){}
  return d;
}
function save(){
  state._saved=Date.now();
  try{localStorage.setItem('relo_v3',JSON.stringify(state));
    // Auto-backup every hour
    var lastBackup=localStorage.getItem('relo_backup_time')||0;
    if(Date.now()-lastBackup>3600000){localStorage.setItem('relo_backup',JSON.stringify(state));localStorage.setItem('relo_backup_time',Date.now())}
  }catch(e){console.error('Save failed',e)}
  var el=document.getElementById('saveIndicator');
  if(el){el.textContent='✓ Saved';el.style.color='var(--green)'}
  // Sync to Firebase (debounced)
  clearTimeout(window._fbSaveTimer);
  window._fbSaveTimer=setTimeout(function(){
    if(window._fbReady){
      try{window._fbSave(JSON.parse(JSON.stringify(state))).then(function(){
        var el=document.getElementById('saveIndicator');
        if(el){el.textContent='☁️ Synced';el.style.color='var(--accent)'}
      }).catch(function(e){console.log('Firebase sync error:',e)})}catch(e){}
    }
  },2000);
}
// Auto-save every 30 seconds as safety net
setInterval(function(){save()},30000);

function exportData(){const b=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='relo-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click()}
function importData(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{try{state=JSON.parse(ev.target.result);save();location.reload()}catch(e){alert('Invalid file')}};r.readAsText(f)}
function resetEverything(){
  if(!confirm('This will delete ALL data on ALL devices - cloud and local. Are you sure?'))return;
  if(!confirm('LAST CHANCE - this cannot be undone.'))return;
  localStorage.removeItem('relo_v3');
  localStorage.removeItem('relo_pw_hash');
  localStorage.removeItem('relo_trusted');
  sessionStorage.removeItem('relo_unlocked');
  if(window._fbReady){
    window._fbSave({_deleted:true,_saved:0}).then(function(){location.reload()}).catch(function(){location.reload()});
  }else{location.reload()}
}

function resetData(){if(confirm('Delete ALL data?')&&confirm('Really sure?')){localStorage.removeItem('relo_v3');location.reload()}}
function toggleTheme(){const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=t;localStorage.setItem('relo_theme',t)}
let _dbt;function dbSave(fn){save();clearTimeout(_dbt);_dbt=setTimeout(fn,400)}
;(function(){const t=localStorage.getItem('relo_theme');if(t)document.documentElement.dataset.theme=t})();

// ===== HELPERS =====
function getStart(){if(state.auStart){const d=new Date(state.auStart);d.setDate(d.getDate()-12*7);return d}return new Date('2026-04-19')}
function wkDate(w){const d=new Date(getStart());d.setDate(d.getDate()+(w-1)*7);return d}
function fd(d){return d.toLocaleDateString('en-GB',{day:'numeric',month:'short'})}
function fdf(d){return d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
function fG(v){var gbp=Math.round(v*0.526);return'$'+Math.round(v).toLocaleString()+' (£'+gbp.toLocaleString()+')'}
function fGBP(v){var aud=Math.round(v*1.90);return'£'+Math.round(v).toLocaleString()+' ($'+aud.toLocaleString()+')'}
function fA(v){var gbp=Math.round(v*0.526);return'$'+Math.round(v).toLocaleString()+' (£'+gbp.toLocaleString()+')'}
function curWk(){const n=new Date(),d=Math.floor((n-getStart())/(7*864e5));return Math.max(1,Math.min(22,d+1))}
function daysTo(s){if(!s)return null;return Math.ceil((new Date(s)-new Date())/(864e5))}
function getBudget(){
  var total=310;var used=0;
  var services={temp30:70,temp45:105,temp60:140,shipping:190,flights:15,car:15,homefind:35};
  if(state.pointsSelected){Object.keys(state.pointsSelected).forEach(function(k){if(state.pointsSelected[k]&&services[k])used+=services[k]})}
  var remain=total-used;
  return Math.round(remain*48.05);
}
function getDebts(){return(state.debts||DEFAULT_DEBTS).map(d=>{const paid=(state.debtPaid||{})[d.id]||0;const owed=d.amount||(d.monthly?(d.monthly*(d.monthsLeft||0)):0);return{...d,owed,paid,left:Math.max(0,owed-paid)}})}
function debtLeft(){return getDebts().reduce((s,d)=>s+d.left,0)}
function totalInc(){return(state.income||[]).reduce((s,e)=>s+e.amt,0)}
function getFund(id){return(state.funding||{})[id]||FORECAST_ITEMS.find(i=>i.id===id)?.defaultFund||'lump_sum'}
const CO_IDS=['co_visa','co_flights','co_temp','co_tax'];
const SEP_IDS=['sep_car','sep_furniture','sep_util'];
const myItems=()=>FORECAST_ITEMS.filter(i=>!CO_IDS.includes(i.id)&&!SEP_IDS.includes(i.id));
function totalFC(){return myItems().reduce((s,i)=>s+i.forecast,0)}
function totalAct(){return myItems().filter(i=>state.actuals[i.id]!=null).reduce((s,i)=>s+state.actuals[i.id],0)}
function netSpend(){return totalAct()-totalInc()}
function pctDone(){const t=CHECKLIST.length;return t?Math.round(CHECKLIST.filter(c=>state.checked[c.id]).length/t*100):0}
function cumFC(){const wk={};myItems().forEach(i=>{wk[i.week]=(wk[i.week]||0)+i.forecast});let c=0;const r={};for(let w=1;w<=22;w++){c+=(wk[w]||0);r[w]=c}return r}
function cumAct(){const wk={};myItems().forEach(i=>{if(state.actuals[i.id]!=null)wk[i.week]=(wk[i.week]||0)+state.actuals[i.id]});let c=0;const r={};for(let w=1;w<=22;w++){c+=(wk[w]||0);r[w]=c}return r}

// ===== FX =====
let liveRate=null,rateFetched=0;
async function fetchRate(){
  if(liveRate&&Date.now()-rateFetched<36e5)return liveRate;
  try{const r=await fetch('https://open.er-api.com/v6/latest/GBP');const d=await r.json();
    if(d.result==='success'&&d.rates?.AUD){liveRate=d.rates.AUD;rateFetched=Date.now();state._rate=liveRate;state._rateT=rateFetched;save();return liveRate}}catch(e){}
  return state._rate||null;
}

// ===== TABS =====
document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));
  t.classList.add('active');document.getElementById(t.dataset.tab).classList.add('active');
  ({plan:renderPlanNew,money:renderMoney,locations:renderCompare,notes:renderNotes,settings:renderSettings})[t.dataset.tab]?.();
}));

function updateHeader(){
  const h=document.getElementById('headerDates');
  const parts=[];
  if(state.auStart)parts.push('AU Start: '+fdf(new Date(state.auStart)));
  if(state.moveDate){const d=daysTo(state.moveDate);if(d>0)parts.push('✈️ '+d+' days to move')}
  h.textContent=parts.length?parts.join(' · '):'Set your AU start date in ⚙️ Settings';
}

// ===== DASHBOARD =====
function renderDash(){
  updateHeader();
  const el=document.getElementById('dash');
  const budget=getBudget(),fc=totalFC(),inc=totalInc(),dl=debtLeft(),cw=curWk();
  const netPos=budget+inc-fc-getDebts().reduce((s,d)=>s+d.owed,0);
  const thisWk=CHECKLIST.filter(c=>c.week===cw&&!state.checked[c.id]);
  const overdue=CHECKLIST.filter(c=>c.week<cw&&!state.checked[c.id]);

  el.innerHTML=`
    <div class="sg">
      <div class="sb blue"><div class="l">Relo Cash (AUD)</div><div class="v">${fG(budget)}</div></div>
      <div class="sb orange"><div class="l">Forecast Out</div><div class="v">${fG(fc)}</div></div>
      <div class="sb green"><div class="l">Sales In</div><div class="v">${fG(inc)}</div></div>
      <div class="sb ${dl>0?'red':'green'}"><div class="l">Debt Left</div><div class="v">${fG(dl)}</div></div>
      <div class="sb ${netPos>=0?'green':'red'}"><div class="l">Net Position</div><div class="v">${fG(netPos)}</div></div>
      <div class="sb ${pctDone()>75?'green':pctDone()>40?'yellow':'red'}"><div class="l">Tasks</div><div class="v">${pctDone()}%</div></div>
    </div>

    <div class="card">
      <h2>💰 Financial Position</h2>
      <div class="table-wrap"><table>
        <tr><td>Company lump sum</td><td class="tg" style="font-weight:600">+${fG(budget)}</td></tr>
        <tr><td>Sales income</td><td class="tg">+${fG(inc)}</td></tr>
        <tr style="font-weight:700"><td>Available</td><td>= ${fG(budget+inc)}</td></tr>
        <tr><td>Relocation costs</td><td style="color:var(--orange)">-${fG(fc)}</td></tr>
        <tr><td>Debts</td><td class="tr">-${fG(getDebts().reduce((s,d)=>s+d.owed,0))}</td></tr>
        <tr style="font-weight:700"><td>Forecast net</td><td style="color:${netPos>=0?'var(--green)':'var(--red)'}">= ${fG(netPos)}</td></tr>
      </table></div>
    </div>

    <div class="card">
      <h2>⚡ Week ${cw} — ${fd(wkDate(cw))}</h2>
      ${thisWk.length?thisWk.map(t=>`<div class="ci"><input type="checkbox" onchange="state.checked['${t.id}']=true;save();renderDash()"><div class="ct">${t.text}<div class="cm"><span class="pl p${t.phase}">${t.cat}</span></div></div>${t.cost!=='—'&&t.cost!=='Free'?`<div class="cc">${t.cost}</div>`:''}</div>`).join(''):'<p class="tm ts">✅ All done this week!</p>'}
    </div>

    ${overdue.length?`<div class="card"><h2>🚨 Overdue (${overdue.length})</h2>
      ${overdue.slice(0,6).map(t=>`<div class="ci"><input type="checkbox" onchange="state.checked['${t.id}']=true;save();renderDash()"><div class="ct">${t.text}<div class="cm"><span class="pl p${t.phase}">Wk ${t.week}</span> ${t.cat}</div></div></div>`).join('')}
      ${overdue.length>6?`<p class="tm tx mt2">+${overdue.length-6} more</p>`:''}</div>`:''}
  `;
}

// ===== MONEY =====
let moneySub='overview';

// ===== POINTS ALLOCATOR =====
function renderPointsAllocator(){
  var services=[
    // Best value first (by ratio)
    {id:'flights',name:'Final Trip Airfare (4 pax)',points:15,market:Math.round(3200*1.90),ratio:'9.3x',desc:'4x one-way economy',cat:'Travel'},
    {id:'homefind',name:'Home Finding Trip (4 pax)',points:35,market:Math.round(5750*1.90),ratio:'7.1x',desc:'4 ret. flights + hotel + car',cat:'Travel'},
    {id:'coaching',name:'Family Relocation Support',points:10,market:Math.round(1500*1.90),ratio:'6.5x',desc:'6 coaching sessions',cat:'Support'},
    {id:'cultural',name:'Cross Cultural Training',points:15,market:Math.round(1575*1.90),ratio:'4.6x',desc:'1-day session',cat:'Support'},
    {id:'hotel7',name:'Short Term Hotel (7 days)',points:21,market:Math.round(1950*1.90),ratio:'4.0x',desc:'2 rooms, 4 pax',cat:'Housing'},
    {id:'hotel14',name:'Short Term Hotel (14 days)',points:42,market:Math.round(3900*1.90),ratio:'4.0x',desc:'2 rooms, 4 pax',cat:'Housing'},
    {id:'temp30',name:'Temp Housing (30 days)',points:70,market:Math.round(4250*1.90),ratio:'2.6x',desc:'2-bed furnished apt',cat:'Housing'},
    {id:'temp45',name:'Temp Housing (45 days)',points:105,market:Math.round(6400*1.90),ratio:'2.6x',desc:'2-bed furnished apt',cat:'Housing'},
    {id:'temp60',name:'Temp Housing (60 days)',points:140,market:Math.round(8500*1.90),ratio:'2.6x',desc:'2-bed furnished apt',cat:'Housing'},
    {id:'temp75',name:'Temp Housing (75 days)',points:175,market:Math.round(10650*1.90),ratio:'2.6x',desc:'2-bed furnished apt',cat:'Housing'},
    {id:'temp90',name:'Temp Housing (90 days)',points:210,market:Math.round(12750*1.90),ratio:'2.6x',desc:'2-bed furnished apt',cat:'Housing'},
    {id:'shipping',name:'Assisted Move — Full HHG',points:190,market:Math.round(9500*1.90),ratio:'2.2x',desc:'Full intl. sea freight + 30d storage',cat:'Shipping'},
    {id:'storage15',name:'Addtl HHG Storage (15d)',points:5,market:Math.round(300*1.90),ratio:'2.6x',desc:'Storage extension',cat:'Shipping'},
    {id:'storage30',name:'Addtl HHG Storage (30d)',points:10,market:Math.round(525*1.90),ratio:'2.3x',desc:'Storage extension',cat:'Shipping'},
    {id:'storage45',name:'Addtl HHG Storage (45d)',points:15,market:Math.round(750*1.90),ratio:'2.2x',desc:'Storage extension',cat:'Shipping'},
    {id:'air',name:'Ship Goods by Air',points:60,market:Math.round(2500*1.90),ratio:'1.8x',desc:'Small/soft items',cat:'Shipping'},
    {id:'dsp1',name:'Dest. Service Provider (1d)',points:10,market:Math.round(475*1.90),ratio:'2.1x',desc:'Local relocation expert',cat:'Support'},
    {id:'dsp2',name:'Dest. Service Provider (2d)',points:20,market:Math.round(950*1.90),ratio:'2.1x',desc:'Local relocation expert',cat:'Support'},
    {id:'dsp3',name:'Dest. Service Provider (3d)',points:30,market:Math.round(1425*1.90),ratio:'2.1x',desc:'Local relocation expert',cat:'Support'},
    {id:'car15',name:'Rental Car (15 days)',points:10,market:Math.round(525*1.90),ratio:'2.3x',desc:'Mid-size vehicle',cat:'Transport'},
    {id:'car30',name:'Rental Car (30 days)',points:20,market:Math.round(1000*1.90),ratio:'2.2x',desc:'Mid-size vehicle',cat:'Transport'},
    {id:'car45',name:'Rental Car (45 days)',points:30,market:Math.round(1475*1.90),ratio:'2.1x',desc:'Mid-size vehicle',cat:'Transport'},
    {id:'car60',name:'Rental Car (60 days)',points:40,market:Math.round(1950*1.90),ratio:'2.1x',desc:'Mid-size vehicle',cat:'Transport'},
    {id:'furn30',name:'Furniture Rental (30d)',points:35,market:Math.round(450*1.90),ratio:'0.6x',desc:'2-bed setup — POOR VALUE',cat:'Housing'},
    {id:'furn60',name:'Furniture Rental (60d)',points:70,market:Math.round(900*1.90),ratio:'0.6x',desc:'2-bed setup — POOR VALUE',cat:'Housing'},
    {id:'furn90',name:'Furniture Rental (90d)',points:105,market:Math.round(1350*1.90),ratio:'0.6x',desc:'2-bed setup — POOR VALUE',cat:'Housing'},
  ];
  var selected=state.pointsSelected||{};
  var usedPts=0;var totalMarketValue=0;
  services.forEach(function(s){if(selected[s.id]){usedPts+=s.points;var actual=(state.pointsActual||{})[s.id];totalMarketValue+=(actual||s.market)}});
  var remainPts=310-usedPts;
  var cashValue=remainPts*48;
  var cashAUD=cashValue;
  var totalValue=totalMarketValue+cashAUD;

  var html='<div class="card"><h2>🎯 Points Allocator — 310 Total</h2>';
  html+='<div class="sg"><div class="sb blue"><div class="l">Total Points</div><div class="v">310</div></div><div class="sb orange"><div class="l">Used</div><div class="v">'+usedPts+'</div></div><div class="sb green"><div class="l">Remaining</div><div class="v">'+remainPts+'</div></div><div class="sb green"><div class="l">Cash Value</div><div class="v">$'+cashValue+' AUD</div></div></div>';
  html+='<p class="tx tm mb2">Tick services to use points. Remaining convert to cash at $31 USD/pt ($43.49 AUD). Sorted by value ratio.</p>';
  html+='<p class="tx tm mb2" style="font-size:.7rem">🟢 4x+ = excellent value | 🔵 2x+ = good | 🔴 <1x = take cash instead</p>';
  html+='<div class="table-wrap"><table><tr><th></th><th>Service</th><th>Pts</th><th>Market Value</th><th>Ratio</th></tr>';
  services.forEach(function(s){
    var checked=selected[s.id];
    var ratioNum=parseFloat(s.ratio);
    var ratioColor=ratioNum>=4?'var(--green)':ratioNum>=2?'var(--accent)':'var(--red)';
    var cashCost=Math.round(s.points*43.49);
    html+='<tr'+(checked?' style="background:rgba(34,197,94,.08)"':'')+'><td><input type="checkbox" '+(checked?'checked':'')+' onchange="togglePoint(this.checked,\''+s.id+'\')">';
    html+='</td><td><strong>'+s.name+'</strong><br><span class="tx tm">'+s.desc+'</span></td>';
    html+='<td style="text-align:center">'+s.points+'</td>';
    html+='<td>£'+Math.round(s.market*0.526).toLocaleString()+' <span class="tx tm">($'+s.market.toLocaleString()+')</span></td>';
    html+='<td style="font-weight:700;color:'+ratioColor+'">'+s.ratio+'</td></tr>';
  });
  html+='</table></div>';
  html+='<p class="tx tm" style="margin-top:8px">💡 Recommended: Flights (9.3x) + Home Finding (7.1x) + Assisted Move (2.2x) + Temp Housing 30d (2.6x) = 310 pts used, ~£22,700 market value for £7,131 in points.</p>';
  
    return html;
}

function savePointsActual(id,val){
  if(!state.pointsActual)state.pointsActual={};
  state.pointsActual[id]=val;
  save();
}

function togglePoint(checked,id){
  if(!state.pointsSelected)state.pointsSelected={};
  state.pointsSelected[id]=checked;
  save();renderMoney();
}

function renderMoney(){
  updateHeader();
  const el=document.getElementById('money');
  el.innerHTML=`
    <div class="stabs">
      <div class="stab ${moneySub==='overview'?'active':''}" onclick="moneySub='overview';renderMoney()">Overview</div>
      <div class="stab ${moneySub==='aumonthly'?'active':''}" onclick="moneySub='aumonthly';renderMoney()">AU Monthly</div>
      <div class="stab ${moneySub==='costs'?'active':''}" onclick="moneySub='costs';renderMoney()">Costs</div>
      <div class="stab ${moneySub==='cashflow'?'active':''}" onclick="moneySub='cashflow';renderMoney()">Cashflow</div>
      <div class="stab ${moneySub==='uk'?'active':''}" onclick="moneySub='uk';renderMoney()">UK Costs</div>
    </div>
    <div id="moneySub"></div>`;
  ({overview:moneyOverview,aumonthly:moneyAUMonthly,costs:moneyCosts,cashflow:moneyCashflow,uk:moneyUK})[moneySub]?.();
}


function addCostLine(){
  var name=document.getElementById('newCostName').value;
  var amt=+(document.getElementById('newCostAmt').value)||0;
  var cur=document.getElementById('newCostCur')?document.getElementById('newCostCur').value:'gbp';
  if(!name)return;
  if(!state.extraCosts)state.extraCosts=[];
  state.extraCosts.push({name:name,amount:amt,currency:cur});
  save();renderMoney();
}
function addIncomeLine(){
  var name=document.getElementById('newIncomeName').value;
  var amt=+(document.getElementById('newIncomeAmt').value)||0;
  var cur=document.getElementById('newIncomeCur')?document.getElementById('newIncomeCur').value:'gbp';
  if(!name)return;
  if(!state.incomeLines)state.incomeLines=[];
  state.incomeLines.push({name:name,amount:amt,currency:cur});
  save();renderMoney();
}

function moneyOverview(){
  var budget=getBudget(),fc=totalFC();
  var selectedServices=state.pointsSelected||{};
  var servicesData={temp30:{pts:70,market:3600},temp45:{pts:105,market:5400},temp60:{pts:140,market:7200},shipping:{pts:190,market:2882},flights:{pts:15,market:6542},car:{pts:15,market:1050},homefind:{pts:35,market:1000}};
  var pointsMarketCost=0;
  Object.keys(selectedServices).forEach(function(k){if(selectedServices[k]&&servicesData[k])pointsMarketCost+=servicesData[k].market});
  var pointsCash=budget;
  if(!state.paidItems)state.paidItems={};
  
  // Build itemised cost lists
  var coSep=['co_visa','co_flights','co_temp','co_tax','sep_car','sep_furniture','sep_util'];
  var debts=getDebts();
  var ukItems=[];var auItems=[];
  FORECAST_ITEMS.forEach(function(i){
    if(coSep.indexOf(i.id)>=0)return;
    var fund=(state.funding||{})[i.id]||i.defaultFund||'lump_sum';
    var amt=state.actuals[i.id]!=null?state.actuals[i.id]:(state.forecasts&&state.forecasts[i.id]?state.forecasts[i.id]:i.forecast);
    if(fund==='uk_wages')ukItems.push({id:i.id,desc:i.desc,aud:amt,gbp:Math.round(amt*0.526)});
    else if(fund==='lump_sum')auItems.push({id:i.id,desc:i.desc,aud:amt,gbp:Math.round(amt*0.526)});
  });
  
  // Calculate totals (only unpaid items count)
  var debtRemaining=debts.reduce(function(s,d){return s+d.left},0);
  var debtAud=Math.round(debtRemaining*1.90);
  var ukRemaining=ukItems.filter(function(i){return !state.paidItems[i.id]}).reduce(function(s,i){return s+i.aud},0);
  var auRemaining=auItems.filter(function(i){return !state.paidItems[i.id]}).reduce(function(s,i){return s+i.aud},0);
  var extraCosts=state.extraCosts||[];
  var extraRemaining=extraCosts.filter(function(i,idx){return !state.paidItems['extra_'+idx]}).reduce(function(s,i){return s+(i.currency==='gbp'?Math.round(i.amount*1.90):i.amount)},0);
  var costTotal=debtAud+ukRemaining+auRemaining+extraRemaining;
  
  // Income
  var incomeLines=state.incomeLines||[{name:'Car sale 2',amount:14000,currency:'gbp'},{name:'Car sale 1',amount:3900,currency:'gbp'},{name:'Home item sales',amount:1500,currency:'gbp'},{name:'Wages saved',amount:1000,currency:'gbp'}];
  if(!state.incomeLines){state.incomeLines=incomeLines;save()}
  var incomeTotal=pointsCash;
  incomeLines.forEach(function(i){incomeTotal+=(i.currency==='gbp'?Math.round(i.amount*1.90):i.amount)});
  var netPosition=incomeTotal-costTotal;
  
  var html='<div style="background:rgba(59,130,246,.08);padding:6px 12px;border-radius:8px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;font-size:.75rem"><span>💱 Live rate: £1 = $1.90 AUD</span><span id="fxLive" class="tm">fetching...</span></div>';
  fetch("https://api.exchangerate-api.com/v4/latest/AUD").then(function(r){return r.json()}).then(function(d){var el=document.getElementById("fxLive");if(el)el.textContent="Live: £"+d.rates.GBP.toFixed(4)}).catch(function(){});
  
  // NET POSITION BANNER
  html+='<div class="card" style="padding:12px;border-left:4px solid '+(netPosition>=0?'var(--green)':'var(--red)')+';margin-bottom:8px"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">';
  html+='<div><div style="font-size:.7rem;color:var(--muted)">REMAINING TO PAY</div><div style="font-size:1.3rem;font-weight:700;color:var(--orange)">£'+Math.round(costTotal*0.526).toLocaleString()+' <span style="font-size:.8rem">($'+costTotal.toLocaleString()+')</span></div></div>';
  html+='<div style="text-align:center"><div style="font-size:.7rem;color:var(--muted)">FUNDING</div><div style="font-size:1.3rem;font-weight:700;color:var(--green)">£'+Math.round(incomeTotal*0.526).toLocaleString()+'</div></div>';
  html+='<div style="text-align:right"><div style="font-size:.7rem;color:var(--muted)">NET POSITION</div><div style="font-size:1.3rem;font-weight:700;color:'+(netPosition>=0?'var(--green)':'var(--red)')+'">'+(netPosition>=0?'+':'-')+'£'+Math.round(Math.abs(netPosition)*0.526).toLocaleString()+'</div></div>';
  html+='</div><div class="pb mt2" style="height:10px"><div class="pf" style="width:'+Math.min(100,Math.round((incomeTotal-costTotal)/incomeTotal*100+50))+'%;background:'+(netPosition>=0?'var(--green)':'var(--red)')+'"></div></div></div>';
  
  // DEBTS - editable amounts + add new
  html+='<div class="card" style="padding:12px;margin-bottom:8px"><h3 style="font-size:.9rem;color:var(--red)">🔴 Debts to Clear — £'+debtRemaining.toLocaleString()+' remaining</h3>';
  html+='<div style="font-size:.7rem;color:var(--muted);margin-bottom:6px">Edit the amount as you pay them down. Tick when cleared.</div>';
  html+='<div style="display:flex;flex-direction:column;gap:4px;margin-top:8px">';
  debts.forEach(function(d){
    var cleared=d.left<=0;
    html+='<div style="display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:6px;background:'+(cleared?'rgba(34,197,94,.08)':'rgba(239,68,68,.05)')+';opacity:'+(cleared?'.6':'1')+'">';
    html+='<input type="checkbox" '+(cleared?'checked':'')+' style="width:18px;height:18px" onchange="markDebtPaid(\''+d.id+'\',this.checked)">';
    html+='<input type="text" value="'+d.desc+'" style="flex:1;min-width:100px;background:transparent;border:none;border-bottom:1px dashed rgba(255,255,255,.15);color:var(--text);font-size:.78rem" onchange="renameDebt(\''+d.id+'\',this.value)">';
    html+='<span style="font-size:.7rem;color:var(--muted)">£</span><input type="number" value="'+d.left+'" style="width:65px;text-align:right;font-size:.8rem;font-weight:600" onchange="updDebt(\''+d.id+'\',+this.value)">';
    html+='<button class="btn btn-o" style="padding:2px 5px;color:var(--red);font-size:.65rem" onclick="removeDebt(\''+d.id+'\')">✕</button>';
    html+='</div>';
  });
  html+='<div style="display:flex;gap:4px;margin-top:6px"><input type="text" id="ndDesc" placeholder="+ Add debt..." style="flex:1;font-size:.75rem"><input type="number" id="ndAmt" placeholder="£" style="width:70px;font-size:.75rem"><button class="btn btn-o" style="padding:2px 8px;font-size:.7rem" onclick="addDebt()">+</button></div>';
  html+='</div></div>';
  
  // UK PROPERTY PREP - editable + tickable + add new
  var ukTotal=ukItems.reduce(function(s,i){return s+i.gbp},0);
  var ukPaid=ukItems.filter(function(i){return state.paidItems[i.id]}).reduce(function(s,i){return s+i.gbp},0);
  html+='<div class="card" style="padding:12px;margin-bottom:8px"><h3 style="font-size:.9rem;color:var(--orange)">🏠 UK Property Prep — £'+(ukTotal-ukPaid).toLocaleString()+' remaining <span style="font-size:.7rem;color:var(--muted)">(£'+ukPaid.toLocaleString()+' paid)</span></h3>';
  html+='<div style="display:flex;flex-direction:column;gap:3px;margin-top:8px">';
  ukItems.forEach(function(i){
    var paid=state.paidItems[i.id];
    html+='<div style="display:flex;align-items:center;gap:6px;padding:5px 10px;border-radius:6px;background:'+(paid?'rgba(34,197,94,.06)':'rgba(239,68,68,.04)')+';opacity:'+(paid?'.6':'1')+'">';
    html+='<input type="checkbox" '+(paid?'checked':'')+' style="width:16px;height:16px" onchange="state.paidItems[\''+i.id+'\']=this.checked;save();renderMoney()">';
    html+='<span style="flex:1;font-size:.78rem;'+(paid?'text-decoration:line-through':'')+'">'+i.desc+'</span>';
    html+='<input type="number" value="'+i.gbp+'" style="width:60px;text-align:right;font-size:.78rem;font-weight:600" onchange="updateForecastGBP(\''+i.id+'\',+this.value)">';
    html+='<span style="font-size:.65rem;color:var(--muted)">£</span>';
    html+='</div>';
  });
  html+='<div style="display:flex;gap:4px;margin-top:6px"><input type="text" id="ukNewDesc" placeholder="+ Add UK cost..." style="flex:1;font-size:.75rem"><input type="number" id="ukNewAmt" placeholder="£" style="width:60px;font-size:.75rem"><button class="btn btn-o" style="padding:2px 8px;font-size:.7rem" onclick="addUKCost()">+</button></div>';
  html+='</div></div>';
  
  // AU SETUP - editable + tickable + add new
  var auTotal=auItems.reduce(function(s,i){return s+i.aud},0);
  var auPaid=auItems.filter(function(i){return state.paidItems[i.id]}).reduce(function(s,i){return s+i.aud},0);
  html+='<div class="card" style="padding:12px;margin-bottom:8px"><h3 style="font-size:.9rem;color:var(--orange)">🦘 AU Setup — $'+(auTotal-auPaid).toLocaleString()+' remaining <span style="font-size:.7rem;color:var(--muted)">($'+auPaid.toLocaleString()+' paid)</span></h3>';
  html+='<div style="display:flex;flex-direction:column;gap:3px;margin-top:8px">';
  auItems.forEach(function(i){
    var paid=state.paidItems[i.id];
    html+='<div style="display:flex;align-items:center;gap:6px;padding:5px 10px;border-radius:6px;background:'+(paid?'rgba(34,197,94,.06)':'rgba(239,68,68,.04)')+';opacity:'+(paid?'.6':'1')+'">';
    html+='<input type="checkbox" '+(paid?'checked':'')+' style="width:16px;height:16px" onchange="state.paidItems[\''+i.id+'\']=this.checked;save();renderMoney()">';
    html+='<span style="flex:1;font-size:.78rem;'+(paid?'text-decoration:line-through':'')+'">'+i.desc+'</span>';
    html+='<input type="number" value="'+i.aud+'" style="width:70px;text-align:right;font-size:.78rem;font-weight:600" onchange="updateForecastAUD(\''+i.id+'\',+this.value)">';
    html+='<span style="font-size:.65rem;color:var(--muted)">$</span>';
    html+='</div>';
  });
  html+='<div style="display:flex;gap:4px;margin-top:6px"><input type="text" id="auNewDesc" placeholder="+ Add AU cost..." style="flex:1;font-size:.75rem"><input type="number" id="auNewAmt" placeholder="$" style="width:70px;font-size:.75rem"><button class="btn btn-o" style="padding:2px 8px;font-size:.7rem" onclick="addAUCost()">+</button></div>';
  html+='</div></div>';
  
  // EXTRA COSTS - tick off
  if(extraCosts.length){
    html+='<div class="card" style="padding:12px;margin-bottom:8px"><h3 style="font-size:.9rem;color:var(--orange)">📋 Other Costs — $'+extraRemaining.toLocaleString()+' remaining</h3>';
    html+='<div style="display:flex;flex-direction:column;gap:3px;margin-top:8px">';
    extraCosts.forEach(function(item,idx){
      var paid=state.paidItems['extra_'+idx];
      var aud=item.currency==='gbp'?Math.round(item.amount*1.90):item.amount;
      var sym=item.currency==='gbp'?'£':'$';
      html+='<div style="display:flex;align-items:center;gap:8px;padding:5px 10px;border-radius:6px;background:'+(paid?'rgba(34,197,94,.06)':'rgba(239,68,68,.04)')+';opacity:'+(paid?'.6':'1')+'"><input type="checkbox" '+(paid?'checked':'')+' style="width:16px;height:16px" onchange="state.paidItems[\'extra_'+idx+'\']=this.checked;save();renderMoney()"><span style="flex:1;font-size:.78rem;'+(paid?'text-decoration:line-through':'')+'">'+item.name+'</span><span style="font-size:.78rem;font-weight:600">'+sym+item.amount.toLocaleString()+'</span><button class="btn btn-o" style="padding:2px 6px;color:var(--red);font-size:.65rem" onclick="state.extraCosts.splice('+idx+',1);delete state.paidItems[\'extra_'+idx+'\'];save();renderMoney()">✕</button></div>';
    });
    html+='</div></div>';
  }
  // Add extra cost
  html+='<div style="display:flex;gap:4px;margin-bottom:12px"><input type="text" id="newCostName" placeholder="+ Add cost..." style="flex:1;font-size:.75rem"><select id="newCostCur" style="font-size:.7rem"><option value="gbp">£</option><option value="aud">$</option></select><input type="number" id="newCostAmt" placeholder="Amount" style="width:70px;font-size:.75rem"><button class="btn btn-o" style="padding:2px 8px;font-size:.7rem" onclick="addCostLine()">+</button></div>';
  
  // INCOME
  html+='<div class="card" style="padding:12px;margin-bottom:8px"><h3 style="font-size:.9rem;color:var(--green)">📥 Income & Funding — £'+Math.round(incomeTotal*0.526).toLocaleString()+'</h3>';
  html+='<div style="display:flex;flex-direction:column;gap:4px;margin-top:8px">';
  html+='<div style="display:flex;justify-content:space-between;padding:6px 10px;background:rgba(59,130,246,.08);border-radius:6px;font-size:.8rem"><span>Relo points cash</span><strong>'+fG(pointsCash)+'</strong></div>';
  incomeLines.forEach(function(item,idx){
    var aud=item.currency==='gbp'?Math.round(item.amount*1.90):item.amount;
    var sym=item.currency==='gbp'?'£':'$';
    html+='<div style="display:flex;align-items:center;gap:8px;padding:5px 10px;background:rgba(34,197,94,.06);border-radius:6px"><span style="flex:1;font-size:.78rem">'+item.name+'</span><span style="font-size:.75rem">'+sym+'</span><input type="number" value="'+item.amount+'" style="width:70px;text-align:right;font-weight:600;font-size:.8rem" onchange="state.incomeLines['+idx+'].amount=+this.value;save();renderMoney()"><button class="btn btn-o" style="padding:2px 6px;color:var(--red);font-size:.65rem" onclick="state.incomeLines.splice('+idx+',1);save();renderMoney()">✕</button></div>';
  });
  html+='<div style="display:flex;gap:4px;margin-top:4px"><input type="text" id="newIncomeName" placeholder="+ Add income..." style="flex:1;font-size:.75rem"><select id="newIncomeCur" style="font-size:.7rem"><option value="gbp">£</option><option value="aud">$</option></select><input type="number" id="newIncomeAmt" placeholder="Amount" style="width:70px;font-size:.75rem"><button class="btn btn-o" style="padding:2px 8px;font-size:.7rem" onclick="addIncomeLine()">+</button></div>';
  html+='</div></div>';
  
  html+=renderPointsAllocator();
  
  document.getElementById('moneySub').innerHTML=html;
}
function markDebtPaid(id,checked){
  if(!state.debtPaid)state.debtPaid={};
  var d=getDebts().find(function(x){return x.id===id});
  if(checked&&d)state.debtPaid[id]=d.owed;
  else state.debtPaid[id]=0;
  save();renderMoney();
}
function renameDebt(id,name){
  if(!state.debts)state.debts=DEFAULT_DEBTS.map(function(d){return Object.assign({},d)});
  var d=state.debts.find(function(x){return x.id===id});
  if(d)d.desc=name;
  save();
}
function removeDebt(id){
  if(!state.debts)state.debts=DEFAULT_DEBTS.map(function(d){return Object.assign({},d)});
  state.debts=state.debts.filter(function(x){return x.id!==id});
  save();renderMoney();
}
function updateForecastGBP(id,gbp){
  var aud=Math.round(gbp*1.90);
  var item=FORECAST_ITEMS.find(function(x){return x.id===id});
  if(item)item.forecast=aud;
  if(!state.forecasts)state.forecasts={};
  state.forecasts[id]=aud;
  save();renderMoney();
}
function updateForecastAUD(id,aud){
  var item=FORECAST_ITEMS.find(function(x){return x.id===id});
  if(item)item.forecast=aud;
  if(!state.forecasts)state.forecasts={};
  state.forecasts[id]=aud;
  save();renderMoney();
}
function addUKCost(){
  var desc=document.getElementById('ukNewDesc').value;
  var amt=+(document.getElementById('ukNewAmt').value)||0;
  if(!desc)return;
  var id='uk_'+Date.now();
  FORECAST_ITEMS.push({id:id,type:'oneoff',defaultFund:'uk_wages',cat:'UK Property',desc:desc,week:curWk(),forecastLow:amt,forecastHigh:amt,forecast:Math.round(amt*1.90),phase:2});
  if(!state.forecasts)state.forecasts={};
  state.forecasts[id]=Math.round(amt*1.90);
  if(!state.customCosts)state.customCosts=[];
  state.customCosts.push({id:id,desc:desc,forecast:Math.round(amt*1.90),fund:'uk_wages'});
  save();renderMoney();
}
function addAUCost(){
  var desc=document.getElementById('auNewDesc').value;
  var amt=+(document.getElementById('auNewAmt').value)||0;
  if(!desc)return;
  var id='au_'+Date.now();
  FORECAST_ITEMS.push({id:id,type:'oneoff',defaultFund:'lump_sum',cat:'AU Setup',desc:desc,week:curWk(),forecastLow:amt,forecastHigh:amt,forecast:amt,phase:4});
  if(!state.forecasts)state.forecasts={};
  state.forecasts[id]=amt;
  if(!state.customCosts)state.customCosts=[];
  state.customCosts.push({id:id,desc:desc,forecast:amt,fund:'lump_sum'});
  save();renderMoney();
}

function moneyCosts(){
  var coSep=['co_visa','co_flights','co_temp','co_tax','sep_car','sep_furniture','sep_util'];
  var debts=getDebts();
  var ukItems=[];var auItems=[];var otherItems=[];
  FORECAST_ITEMS.forEach(function(i){
    if(coSep.indexOf(i.id)>=0)return;
    var fund=(state.funding||{})[i.id]||i.defaultFund||'lump_sum';
    if(fund==='uk_wages')ukItems.push(i);
    else if(fund==='lump_sum')auItems.push(i);
    else otherItems.push(i);
  });
  
  function costRow(i){
    var act=state.actuals[i.id];
    return '<tr><td><input type="text" value="'+i.desc+'" style="min-width:140px" oninput="renameCost(\''+i.id+'\',this.value)"></td>'+
      '<td><input type="number" class="ism" value="'+i.forecast+'" oninput="FORECAST_ITEMS.find(function(x){return x.id===\''+i.id+'\'}).forecast=+this.value;if(!state.forecasts)state.forecasts={};state.forecasts[\''+i.id+'\']=+this.value;dbSave(renderMoney)"></td>'+
      '<td><input type="number" class="ism" value="'+(act!=null?act:'')+'" placeholder="—" oninput="state.actuals[\''+i.id+'\']=this.value===\'\'?null:+this.value;dbSave(renderMoney)"></td>'+
      '<td><button class="btn btn-o" style="padding:2px 6px;color:var(--red)" onclick="removeCost(\''+i.id+'\')">✕</button></td></tr>';
  }
  function costRowGBP(i){
    var fc=Math.round(i.forecast*0.526);
    var act=state.actuals[i.id];
    var actGBP=act!=null?Math.round(act*0.526):'';
    return '<tr><td><input type="text" value="'+i.desc+'" style="min-width:140px" oninput="renameCost(\''+i.id+'\',this.value)"></td>'+
      '<td><input type="number" class="ism" value="'+fc+'" oninput="FORECAST_ITEMS.find(function(x){return x.id===\''+i.id+'\'}).forecast=Math.round(+this.value*1.90);if(!state.forecasts)state.forecasts={};state.forecasts[\''+i.id+'\']=Math.round(+this.value*1.90);dbSave(renderMoney)"></td>'+
      '<td><input type="number" class="ism" value="'+actGBP+'" placeholder="—" oninput="state.actuals[\''+i.id+'\']=this.value===\'\'?null:Math.round(+this.value*1.90);dbSave(renderMoney)"></td>'+
      '<td><button class="btn btn-o" style="padding:2px 6px;color:var(--red)" onclick="removeCost(\''+i.id+'\')">✕</button></td></tr>';
  }
  
  var html='<p class="tx tm" style="margin-bottom:12px">💡 These costs feed into the <strong>📤 Forecast Costs</strong> tile on the Overview tab.</p>';
  
  // DEBTS SECTION
  html+='<div class="card"><h2>🔴 Debts to Clear</h2>';
  html+='<p class="tx tm mb2">Total: '+fGBP(debts.reduce(function(s,d){return s+d.left},0))+'</p>';
  html+='<div class="table-wrap"><table><tr><th>Debt</th><th>Owed (£)</th><th>Paid (£)</th><th>Left</th></tr>';
  debts.forEach(function(d){
    html+='<tr><td>'+d.desc+'</td>';
    html+='<td><input type="number" class="ism" value="'+d.owed+'" oninput="updDebt(\''+d.id+'\',+this.value)"></td>';
    html+='<td><input type="number" class="ism" value="'+(d.paid||'')+'" placeholder="0" oninput="if(!state.debtPaid)state.debtPaid={};state.debtPaid[\''+d.id+'\']=+this.value;save();renderMoney()"></td>';
    html+='<td style="font-weight:600;color:'+(d.left>0?'var(--red)':'var(--green)')+'">'+fGBP(d.left)+'</td></tr>';
  });
  html+='</table></div>';
  html+='<div class="flex g2 fw aic mt2"><input type="text" id="ndDesc" placeholder="Description" style="max-width:180px"><input type="number" id="ndAmt" placeholder="Total £" style="max-width:100px"><button class="btn btn-o" onclick="addDebt()">+ Add</button></div>';
  html+='</div>';
  
  // UK PROPERTY PREP
  html+='<div class="card"><h2>🏠 UK Property Prep</h2>';
  html+='<p class="tx tm mb2">Total: '+fGBP(Math.round(ukItems.reduce(function(s,i){return s+i.forecast},0)*0.526))+' — funded from UK wages</p>';
  html+='<div class="table-wrap"><table><tr><th>Item</th><th>Forecast (£)</th><th>Actual (£)</th><th></th></tr>';
  ukItems.forEach(function(i){html+=costRowGBP(i)});
  html+='</table></div></div>';
  
  // AU SETUP
  html+='<div class="card"><h2>🦘 AU Setup Costs</h2>';
  html+='<p class="tx tm mb2">Total: '+fG(auItems.reduce(function(s,i){return s+i.forecast},0))+' — funded from relo cash</p>';
  html+='<div class="table-wrap"><table><tr><th>Item</th><th>Forecast ($)</th><th>Actual ($)</th><th></th></tr>';
  auItems.forEach(function(i){html+=costRow(i)});
  html+='</table></div></div>';
  
  // DEFERRED COSTS (not in initial move total)
  var deferredItems=[];
  FORECAST_ITEMS.forEach(function(i){
    if(coSep.indexOf(i.id)>=0)return;
    var fund=(state.funding||{})[i.id]||i.defaultFund||'lump_sum';
    if(fund==='deferred')deferredItems.push(i);
  });
  if(deferredItems.length){
    html+='<div class="card" style="opacity:.7"><h2>⏳ Deferred Costs (not in initial move total)</h2>';
    html+='<p class="tx tm mb2">These are paid later and not included in the move funding calculation.</p>';
    html+='<div class="table-wrap"><table><tr><th>Item</th><th>Forecast (£)</th><th>When</th><th></th></tr>';
    deferredItems.forEach(function(i){
      var fc=Math.round(i.forecast*0.526);
      html+='<tr><td>'+i.desc+'</td><td>£'+fc.toLocaleString()+'</td><td>Nov 2026</td><td></td></tr>';
    });
    html+='</table></div></div>';
  }
  
  // ADD NEW
  html+='<div class="card"><h3>+ Add Cost Item</h3>';
  html+='<div class="flex g2 fw aic"><input type="text" id="ccDesc" placeholder="Description" style="flex:1;min-width:180px"><input type="text" id="ccCat" placeholder="Category" style="max-width:120px" value="Custom"><input type="number" id="ccForecast" placeholder="Forecast $" style="max-width:100px"><select id="ccFund"><option value="lump_sum">Relo Cash</option><option value="uk_wages">UK Wages</option></select><button class="btn btn-p" onclick="addCustomCost()">+ Add</button></div></div>';
  
  document.getElementById('moneySub').innerHTML=html;
}

function moneyDebts(){
  const debts=getDebts();
  document.getElementById('moneySub').innerHTML=`
    <div class="sg">
      <div class="sb ${debtLeft()>0?'red':'green'}"><div class="l">Remaining</div><div class="v">${fG(debtLeft())}</div></div>
      <div class="sb green"><div class="l">Paid Off</div><div class="v">${fG(debts.reduce((s,d)=>s+d.paid,0))}</div></div>
    </div>
    <div class="card">
      <h2>🔴 Debts & Commitments</h2>
      <p class="tx tm mb2">Edit Owed or Paid directly. Left updates automatically.</p>
      <div class="table-wrap"><table><tr><th>Debt</th><th>Owed</th><th>Paid</th><th>Left</th><th>Notes</th></tr>
      ${debts.map(d=>`<tr>
        <td>${d.desc}${d.monthly?' <span class="tx tm">(${fG(d.monthly)}/mo)</span>':''}</td>
        <td><input type="number" class="ism" value="${d.owed}" oninput="updDebt('${d.id}',+this.value)"></td>
        <td><input type="number" class="ism" value="${d.paid||''}" placeholder="0" oninput="if(!state.debtPaid)state.debtPaid={};state.debtPaid['${d.id}']=+this.value;save();document.getElementById('dl_${d.id}').textContent=fGBP(Math.max(0,${d.owed}-(+this.value)))"></td>
        <td id="dl_${d.id}" style="font-weight:600;color:${d.left>0?'var(--red)':'var(--green)'}">${fGBP(d.left)}</td>
        <td class="tx tm">${d.note||''}</td></tr>`).join('')}</table></div>
      <h3>Add New Debt</h3>
      <div class="flex g2 fw aic">
        <input type="text" id="ndDesc" placeholder="Description" style="max-width:180px">
        <input type="number" id="ndAmt" placeholder="Total £" style="max-width:100px">
        <input type="number" id="ndMo" placeholder="Monthly £" style="max-width:100px">
        <button class="btn btn-o" onclick="addDebt()">+ Add</button>
      </div>
    </div>`;
}
function updDebt(id,v){
  if(!state.debts)state.debts=DEFAULT_DEBTS.map(function(d){return Object.assign({},d)});
  var d=state.debts.find(function(x){return x.id===id});
  if(d){d.amount=v;if(d.monthly)d.monthly=0}
  dbSave(renderMoney);
}
function addDebt(){
  var desc=document.getElementById('ndDesc').value;
  var amt=+(document.getElementById('ndAmt').value)||0;
  var mo=+(document.getElementById('ndMo').value)||0;
  if(!desc)return;
  if(!state.debts)state.debts=DEFAULT_DEBTS.map(function(d){return Object.assign({},d)});
  state.debts.push({id:'d_'+Date.now(),desc:desc,amount:amt,monthly:mo,monthsLeft:mo&&amt?Math.ceil(amt/mo):0,note:''});
  save();renderMoney();
}

function moneyIncome(){
  const entries=state.income||[];const total=entries.reduce((s,e)=>s+e.amt,0);
  document.getElementById('moneySub').innerHTML=`
    <div class="sg"><div class="sb green"><div class="l">Total Income</div><div class="v">${fG(total)}</div></div></div>
    <div class="card"><h2>💵 Income & Sales</h2>
      <div class="flex g2 fw mb2">
        <input type="text" id="inDesc" placeholder="Description" style="max-width:200px">
        <input type="number" id="inAmt" placeholder="Amount £" style="max-width:110px">
        <input type="date" id="inDate" value="${new Date().toISOString().slice(0,10)}" style="max-width:140px">
        <select id="inCat" style="max-width:140px"><option>Car Sale</option><option>Declutter</option><option>Refund</option><option>Other</option></select>
        <button class="btn btn-p" onclick="addInc()">+ Add</button>
      </div>
      ${entries.length?`<div class="table-wrap"><table><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th></th></tr>
      ${entries.map((e,i)=>`<tr><td>${e.date||'—'}</td><td>${e.cat}</td><td>${e.desc}</td><td class="tg" style="font-weight:600">${fG(e.amt)}</td>
      <td><button class="btn btn-o" style="padding:2px 6px" onclick="state.income.splice(${i},1);save();renderMoney()">✕</button></td></tr>`).join('')}
      <tr style="font-weight:700"><td colspan="3">Total</td><td class="tg">${fG(total)}</td><td></td></tr></table></div>`:'<p class="tm ts">No income logged yet.</p>'}
    </div>`;
}
function addInc(){const desc=document.getElementById('inDesc').value,amt=+document.getElementById('inAmt').value,date=document.getElementById('inDate').value,cat=document.getElementById('inCat').value;if(!desc||!amt)return;if(!state.income)state.income=[];state.income.push({desc,amt,date,cat});save();renderMoney()}

async function moneyFX(){
  const txns=state.fx||[];const tGBP=txns.reduce((s,t)=>s+t.gbp,0);const tAUD=txns.reduce((s,t)=>s+t.aud,0);const avg=tGBP?tAUD/tGBP:0;
  const rate=await fetchRate();
  document.getElementById('moneySub').innerHTML=`
    <div class="sg">
      <div class="sb ${rate&&rate>=1.95?'green':'yellow'}"><div class="l">Live Rate</div><div class="v">${rate?rate.toFixed(4):'...'}</div></div>
      <div class="sb blue"><div class="l">Converted</div><div class="v">${fG(tGBP)}</div></div>
      <div class="sb green"><div class="l">AUD Got</div><div class="v">${fA(tAUD)}</div></div>
      <div class="sb orange"><div class="l">Avg Rate</div><div class="v">${avg?avg.toFixed(4):'—'}</div></div>
    </div>
    ${rate?`<div class="card"><h2>Calculator</h2>
      <div class="table-wrap"><table><tr><th>Convert</th><th>You'd get</th></tr>
      ${[5000,10000,15000,20000].map(g=>`<tr><td>${fG(g)}</td><td>${fA(Math.round(g*rate))}</td></tr>`).join('')}</table></div>
      ${rate>=1.95?'<p class="tg mt2" style="font-weight:600">✅ Good rate — consider converting</p>':rate>=1.90?'<p class="tm mt2">⚡ Decent rate (1.90+)</p>':'<p class="tr mt2">⚠️ Below 1.90 — wait if you can</p>'}
    </div>`:''}
    <div class="card"><h2>Conversion Log</h2>
      <div class="flex g2 fw mb2">
        <input type="date" id="fxD" value="${new Date().toISOString().slice(0,10)}" style="max-width:130px">
        <input type="number" id="fxG" placeholder="GBP" style="max-width:100px">
        <input type="number" id="fxR" placeholder="Rate" step="0.0001" value="${rate?rate.toFixed(4):''}" style="max-width:90px">
        <input type="number" id="fxA" placeholder="AUD" style="max-width:100px">
        <input type="number" id="fxF" placeholder="Fee £" style="max-width:80px">
        <select id="fxP" style="max-width:100px"><option>Wise</option><option>Revolut</option><option>OFX</option><option>Bank</option></select>
        <button class="btn btn-p" onclick="addFX()">+ Add</button>
      </div>
      ${txns.length?`<div class="table-wrap"><table><tr><th>Date</th><th>GBP</th><th>Rate</th><th>AUD</th><th>Fee</th><th>Via</th><th></th></tr>
      ${txns.map((t,i)=>`<tr><td>${t.date||'—'}</td><td>${fG(t.gbp)}</td><td>${t.rate.toFixed(4)}</td><td>${fA(t.aud)}</td><td>${fG(t.fee||0)}</td><td>${t.via}</td>
      <td><button class="btn btn-o" style="padding:2px 6px" onclick="state.fx.splice(${i},1);save();renderMoney()">✕</button></td></tr>`).join('')}</table></div>`:'<p class="tm ts">No conversions yet.</p>'}
    </div>`;
}
function addFX(){const date=document.getElementById('fxD').value,gbp=+document.getElementById('fxG').value,rate=+document.getElementById('fxR').value,aud=+document.getElementById('fxA').value,fee=+document.getElementById('fxF').value,via=document.getElementById('fxP').value;if(!gbp||!aud)return;if(!state.fx)state.fx=[];state.fx.push({date,gbp,rate:rate||aud/gbp,aud,fee,via});save();renderMoney()}

function moneyUK(){
  document.getElementById('moneySub').innerHTML=`<div class="card">
    <h2>UK Monthly Costs — What Happens</h2>
    <div class="table-wrap"><table><tr><th>Item</th><th>£/mo</th><th>Action</th><th>Notes</th></tr>
    ${MONTHLY_UK.map(m=>{const a=UK_COST_ACTIONS.find(x=>x.id===m.id)||{};
      return`<tr><td>${m.desc}</td><td>${fGBP(m.monthly_gbp)}</td>
      <td><span class="badge b-${(a.action||'').toLowerCase()}">${a.action||'—'}</span></td>
      <td class="tx tm">${a.note||''}</td></tr>`}).join('')}
    <tr style="font-weight:700"><td>Current total</td><td>${fGBP(MONTHLY_UK.reduce((s,m)=>s+m.monthly_gbp,0))}/mo</td><td colspan="2"></td></tr>
    </table></div>
    <h3>After Move (ongoing UK costs)</h3>
    <div class="table-wrap"><table><tr><th>Item</th><th>£/mo</th></tr>
    ${MONTHLY_UK.filter(m=>{const a=UK_COST_ACTIONS.find(x=>x.id===m.id);return a&&['STAYS','KEEP','KEEPS','REVIEW'].includes(a.action)}).map(m=>`<tr><td>${m.desc}</td><td>${fGBP(m.monthly_gbp)}</td></tr>`).join('')}
    <tr><td>LAP Letting Agent plan</td><td>${fGBP(109)}</td></tr>
    <tr><td>Landlord insurance</td><td>${fGBP(80)}</td></tr>
    <tr class="tg"><td>Rental income</td><td>+${fGBP(UK_RENTAL_INCOME)}</td></tr>
    </table></div></div>`;
}

// ===== AU MONTHLY BUDGET (adaptive to suburb) =====
function moneyAUMonthly(){
  var suburb=state.selectedSuburb||'Mordialloc';
  var suburbData=typeof SUBURBS_DATA!=='undefined'?SUBURBS_DATA:[];
  var s=suburbData.find(function(x){return x.name===suburb});
  var rent4=s?Math.round(parseInt(s.bed4)*52/12):3163;
  var salary=state.auSalary||9571;
  var ukSurplus=state.ukSurplus||228;
  var frankieIncome=state.frankieIncome||0;
  var totalIn=salary+ukSurplus+frankieIncome;
  
  // Editable monthly costs
  var mCosts=state.auMonthlyCosts||{
    rent:rent4,groceries:1150,eating_out:200,fuel:200,car_lease:600,
    electricity:250,water:50,internet:80,health:80,mobiles:60,
    streaming:35,contents_ins:40,kids_activities:250,school:50,
    clothing:80,personal:40,medical:30,pet:60,household:40,school_vol:50
  };
  if(!state.auMonthlyCosts){state.auMonthlyCosts=mCosts;save()}
  // Update rent if suburb changed
  if(s&&mCosts.rent!==rent4&&!state._rentOverride){mCosts.rent=rent4;state.auMonthlyCosts=mCosts;save()}
  
  var totalOut=Object.values(mCosts).reduce(function(a,b){return a+b},0);
  var disposable=totalIn-totalOut;
  var disposableGBP=Math.round(disposable*0.526);
  var annualDisp=disposable*12;
  
  var html='';
  // Suburb selector
  html+='<div class="card" style="padding:12px"><div class="flex jcb aic fw" style="gap:8px"><div><strong>📍 Suburb:</strong> <select onchange="state.selectedSuburb=this.value;state._rentOverride=false;save();renderMoney()" style="font-size:.85rem;padding:4px 8px">';
  suburbData.forEach(function(sub){html+='<option value="'+sub.name+'"'+(sub.name===suburb?' selected':'')+'>'+sub.name+' ($'+parseInt(sub.bed4)+'/wk)</option>'});
  html+='</select></div>';
  html+='<div style="text-align:right"><div style="font-size:.7rem;color:var(--muted)">Monthly disposable</div><div style="font-size:1.3rem;font-weight:700;color:'+(disposable>=2000?'var(--green)':disposable>=1000?'var(--orange)':'var(--red)')+'">$'+disposable.toLocaleString()+'/mo <span style="font-size:.8rem">(£'+disposableGBP.toLocaleString()+')</span></div></div></div></div>';
  
  // Visual summary
  var pctSpent=Math.round(totalOut/totalIn*100);
  html+='<div class="card" style="padding:12px"><div style="display:flex;gap:12px;flex-wrap:wrap">';
  html+='<div style="flex:1;min-width:120px;text-align:center"><div class="tm" style="font-size:.65rem">INCOME</div><div style="font-size:1.1rem;font-weight:700;color:var(--green)">$'+totalIn.toLocaleString()+'</div></div>';
  html+='<div style="flex:1;min-width:120px;text-align:center"><div class="tm" style="font-size:.65rem">EXPENSES</div><div style="font-size:1.1rem;font-weight:700;color:var(--orange)">$'+totalOut.toLocaleString()+'</div></div>';
  html+='<div style="flex:1;min-width:120px;text-align:center"><div class="tm" style="font-size:.65rem">LEFT OVER</div><div style="font-size:1.1rem;font-weight:700;color:'+(disposable>=0?'var(--green)':'var(--red)')+'">$'+disposable.toLocaleString()+'</div></div>';
  html+='<div style="flex:1;min-width:120px;text-align:center"><div class="tm" style="font-size:.65rem">ANNUAL SAVINGS</div><div style="font-size:1.1rem;font-weight:700;color:var(--accent)">$'+annualDisp.toLocaleString()+'</div></div>';
  html+='</div>';
  html+='<div class="pb mt2" style="height:14px;position:relative"><div class="pf" style="width:'+Math.min(pctSpent,100)+'%;background:'+(pctSpent>90?'var(--red)':pctSpent>75?'var(--orange)':'var(--green)')+'"></div><div style="position:absolute;top:-1px;right:4px;font-size:.6rem;color:var(--muted)">'+pctSpent+'% of income</div></div></div>';
  
  // INCOME breakdown
  html+='<div class="card" style="padding:12px"><h3 style="font-size:.9rem;color:var(--green)">📥 Monthly Income</h3>';
  html+='<div style="display:flex;flex-direction:column;gap:4px">';
  html+='<div style="display:flex;justify-content:space-between;padding:6px 10px;background:rgba(34,197,94,.08);border-radius:6px"><span>Your net salary ($159k gross)</span><input type="number" value="'+salary+'" style="width:80px;text-align:right;font-weight:600" onchange="state.auSalary=+this.value;save();renderMoney()"></div>';
  html+='<div style="display:flex;justify-content:space-between;padding:6px 10px;background:rgba(34,197,94,.08);border-radius:6px"><span>UK property surplus (rent - mortgage/agent)</span><input type="number" value="'+ukSurplus+'" style="width:80px;text-align:right;font-weight:600" onchange="state.ukSurplus=+this.value;save();renderMoney()"></div>';
  html+='<div style="display:flex;justify-content:space-between;padding:6px 10px;background:rgba(34,197,94,.08);border-radius:6px"><span>Frankie income (when working)</span><input type="number" value="'+frankieIncome+'" style="width:80px;text-align:right;font-weight:600" onchange="state.frankieIncome=+this.value;save();renderMoney()"></div>';
  html+='<div style="display:flex;justify-content:space-between;padding:8px 10px;background:var(--card2);border-radius:6px;font-weight:700"><span>TOTAL IN</span><span>$'+totalIn.toLocaleString()+' (£'+Math.round(totalIn*0.526).toLocaleString()+')</span></div>';
  html+='</div></div>';
  
  // EXPENSES breakdown - editable
  html+='<div class="card" style="padding:12px"><h3 style="font-size:.9rem;color:var(--orange)">📤 Monthly Expenses</h3>';
  html+='<div style="display:flex;flex-direction:column;gap:3px">';
  var costLabels={rent:'🏠 Rent (4-bed, '+suburb+')',groceries:'🛒 Groceries (~$265/wk)',eating_out:'☕ Eating out / coffees',fuel:'⛽ Car fuel',car_lease:'🚗 Car lease (all-inclusive)',electricity:'⚡ Electricity + gas',water:'💧 Water',internet:'🌐 Internet (NBN)',health:'🏥 Health insurance (your 20%)',mobiles:'📱 Mobiles (family)',streaming:'📺 Streaming',contents_ins:'🔒 Contents insurance',kids_activities:'⚽ Kids activities',school:'📚 School supplies/excursions',clothing:'👕 Clothing/shoes',personal:'💇 Haircuts/personal',medical:'🩺 Medical/dental gap',pet:'🐕 Pet insurance + vet',household:'🏡 Household supplies',school_vol:'🎒 School voluntary (x2)'};
  Object.keys(mCosts).forEach(function(k){
    html+='<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 10px;background:rgba(239,68,68,.05);border-radius:6px;font-size:.8rem"><span style="flex:1">'+(costLabels[k]||k)+'</span><span style="color:var(--muted);font-size:.7rem;min-width:55px;text-align:right">£'+Math.round(mCosts[k]*0.526).toLocaleString()+'</span><input type="number" value="'+mCosts[k]+'" style="width:70px;text-align:right;font-size:.8rem" onchange="state.auMonthlyCosts.'+k+'=+this.value;if(\''+k+'\'===\'rent\')state._rentOverride=true;save();renderMoney()"></div>';
  });
  html+='<div style="display:flex;justify-content:space-between;padding:8px 10px;background:var(--card2);border-radius:6px;font-weight:700;margin-top:4px"><span>TOTAL OUT</span><span style="color:var(--orange)">$'+totalOut.toLocaleString()+' (£'+Math.round(totalOut*0.526).toLocaleString()+')</span></div>';
  html+='</div></div>';
  
  // What disposable income means
  html+='<div class="card" style="padding:12px;border-left:4px solid '+(disposable>=2000?'var(--green)':'var(--orange)')+'"><h3 style="font-size:.9rem">💡 What $'+disposable.toLocaleString()+'/mo gets you</h3>';
  html+='<div style="font-size:.8rem;line-height:1.8">';
  if(disposable>=3000)html+='<div>✅ Very comfortable — can save $1,500+/mo and still enjoy dining, activities, holidays</div><div>✅ Could afford private school fees if ever needed later</div><div>✅ Emergency fund builds fast</div>';
  else if(disposable>=2000)html+='<div>✅ Comfortable — dining out weekly, kids activities, weekend trips</div><div>✅ Saving $500–$1,000/mo realistic</div><div>✅ No financial stress</div>';
  else if(disposable>=1000)html+='<div>⚡ Manageable — need to budget, but not tight</div><div>⚡ Saving $200–$500/mo with discipline</div><div>⚡ Occasional dining/activities fine</div>';
  else html+='<div>⚠️ Tight — need careful budgeting</div><div>⚠️ Limited savings capacity</div><div>⚠️ Consider cheaper suburb or Frankie working to improve</div>';
  html+='</div>';
  if(frankieIncome===0)html+='<p class="tx tm mt2">💡 <strong>If Frankie works part-time (3 days):</strong> +$2,600/mo → disposable would be <strong style="color:var(--green)">$'+(disposable+2600).toLocaleString()+'/mo</strong></p>';
  html+='</div>';
  
  document.getElementById('moneySub').innerHTML=html;
}

// ===== CASHFLOW TIMELINE =====
function moneyCashflow(){
  var coSep=['co_visa','co_flights','co_temp','co_tax','sep_car','sep_furniture','sep_util'];
  var weeks={};
  FORECAST_ITEMS.forEach(function(i){
    if(coSep.indexOf(i.id)>=0)return;
    var w=i.week||1;
    if(!weeks[w])weeks[w]={out:0,items:[]};
    var amt=state.actuals[i.id]!=null?state.actuals[i.id]:i.forecast;
    weeks[w].out+=amt;
    weeks[w].items.push({desc:i.desc,amt:amt,paid:state.actuals[i.id]!=null});
  });
  
  var cw=curWk();
  var cumulative=0;
  var budget=getBudget();
  var totalIncome=(state.incomeLines||[]).reduce(function(s,i){return s+(i.currency==='gbp'?Math.round(i.amount*1.90):i.amount)},0)+budget;
  
  var html='<div class="card" style="padding:12px"><h3 style="font-size:.9rem">📅 Week-by-Week Cashflow</h3>';
  html+='<p class="tx tm mb2">Shows when money goes out. Green = paid. Grey = forecast. Current week highlighted.</p>';
  html+='<div style="display:flex;flex-direction:column;gap:2px">';
  
  for(var w=1;w<=22;w++){
    var wk=weeks[w]||{out:0,items:[]};
    cumulative+=wk.out;
    var pct=totalIncome>0?Math.round(cumulative/totalIncome*100):0;
    var isCurrent=w===cw;
    var isPast=w<cw;
    
    if(wk.items.length===0&&!isCurrent)continue;
    
    html+='<div style="padding:8px 10px;border-radius:8px;border:1px solid '+(isCurrent?'var(--accent)':'var(--border)')+';background:'+(isCurrent?'rgba(59,130,246,.08)':'transparent')+'">';
    html+='<div style="display:flex;justify-content:space-between;align-items:center">';
    html+='<div><strong style="font-size:.8rem">Wk '+w+'</strong> <span class="tm" style="font-size:.7rem">'+fd(wkDate(w))+'</span>'+(isCurrent?' <span style="background:var(--accent);color:#fff;padding:1px 6px;border-radius:8px;font-size:.6rem">NOW</span>':'')+'</div>';
    html+='<div style="text-align:right"><strong style="color:var(--orange);font-size:.85rem">-'+fA(wk.out)+'</strong><div style="font-size:.65rem;color:var(--muted)">Cum: '+fA(cumulative)+' ('+pct+'%)</div></div>';
    html+='</div>';
    if(wk.items.length){
      html+='<div style="margin-top:4px;padding-left:8px;border-left:2px solid var(--border)">';
      wk.items.forEach(function(item){
        html+='<div style="font-size:.72rem;display:flex;justify-content:space-between;padding:2px 0;color:'+(item.paid?'var(--green)':'var(--muted)')+'"><span>'+(item.paid?'✅':'⬜')+' '+item.desc+'</span><span>'+fA(item.amt)+'</span></div>';
      });
      html+='</div>';
    }
    html+='</div>';
  }
  html+='</div>';
  
  // Summary bar
  var totalCosts=cumulative;
  var remaining=totalIncome-totalCosts;
  html+='<div style="margin-top:12px;padding:10px 12px;background:var(--card2);border-radius:8px;display:flex;justify-content:space-between;align-items:center;font-weight:700"><span>Total move costs</span><span style="color:var(--orange)">'+fA(totalCosts)+'</span></div>';
  html+='<div style="padding:10px 12px;background:var(--card2);border-radius:8px;display:flex;justify-content:space-between;align-items:center;font-weight:700;margin-top:4px"><span>Funding available</span><span style="color:var(--green)">'+fA(totalIncome)+'</span></div>';
  html+='<div style="padding:10px 12px;background:'+(remaining>=0?'rgba(34,197,94,.1)':'rgba(239,68,68,.1)')+';border-radius:8px;display:flex;justify-content:space-between;align-items:center;font-weight:700;margin-top:4px"><span>Net position</span><span style="color:'+(remaining>=0?'var(--green)':'var(--red)')+'">'+fA(remaining)+'</span></div>';
  html+='</div>';
  
  document.getElementById('moneySub').innerHTML=html;
}

// ===== TASKS (Checklist + Documents) =====
let taskSub='checklist',taskFilter={phase:0,cat:'All',search:''};
function renderTasks(){
  const el=document.getElementById('tasks');
  el.innerHTML=`
    <div class="stabs">
      <div class="stab ${taskSub==='checklist'?'active':''}" onclick="taskSub='checklist';renderTasks()">Checklist</div>
      <div class="stab ${taskSub==='documents'?'active':''}" onclick="taskSub='documents';renderTasks()">Documents</div>
    </div><div id="taskSub"></div>`;
  taskSub==='checklist'?taskChecklist():taskDocs();
}

function taskChecklist(){
  const cw=curWk();const cats=['All',...new Set(CHECKLIST.map(c=>c.cat))];
  let items=CHECKLIST;
  if(taskFilter.phase)items=items.filter(c=>c.phase===taskFilter.phase);
  if(taskFilter.cat!=='All')items=items.filter(c=>c.cat===taskFilter.cat);
  if(taskFilter.search)items=items.filter(c=>c.text.toLowerCase().includes(taskFilter.search.toLowerCase()));
  const done=items.filter(c=>state.checked[c.id]).length,total=items.length;

  document.getElementById('taskSub').innerHTML=`
    <div class="sg">
      <div class="sb green"><div class="l">Done</div><div class="v">${done}/${total}</div></div>
      <div class="sb yellow"><div class="l">Overdue</div><div class="v">${CHECKLIST.filter(c=>c.week<cw&&!state.checked[c.id]).length}</div></div>
    </div>
    <div class="card">
      <div class="flex g2 fw aic mb2">
        <input type="text" placeholder="🔍 Search..." value="${taskFilter.search}" oninput="taskFilter.search=this.value;renderTasks()" style="max-width:200px">
        <select onchange="taskFilter.phase=+this.value;renderTasks()"><option value="0">All Phases</option><option value="1" ${taskFilter.phase===1?'selected':''}>Phase 1</option><option value="2" ${taskFilter.phase===2?'selected':''}>Phase 2</option><option value="3" ${taskFilter.phase===3?'selected':''}>Phase 3</option><option value="4" ${taskFilter.phase===4?'selected':''}>Phase 4</option></select>
        <select onchange="taskFilter.cat=this.value;renderTasks()">${cats.map(c=>`<option ${taskFilter.cat===c?'selected':''}>${c}</option>`).join('')}</select>
      </div>
      <div class="pb mb2" style="height:10px"><div class="pf" style="width:${total?done/total*100:0}%;background:var(--green)"></div></div>
      ${items.map(c=>{const ck=state.checked[c.id],od=c.week<cw&&!ck;
        return`<div class="ci${ck?' done':''}"><input type="checkbox" ${ck?'checked':''} onchange="state.checked['${c.id}']=!state.checked['${c.id}'];save();renderTasks()">
        <div class="ct">${c.text}<div class="cm"><span class="pl p${c.phase}">P${c.phase}</span>Wk ${c.week} (${fd(wkDate(c.week))}) · ${c.cat}${od?' <span class="tr">⚠️ OVERDUE</span>':''}</div></div>
        ${c.cost!=='—'&&c.cost!=='Free'&&c.cost!=='Included'&&c.cost!=='Company'?`<div class="cc">${c.cost}</div>`:''}</div>`}).join('')}
      <h3 class="mt3">+ Add Custom Task</h3>
      <div class="flex g2 fw aic">
        <input type="text" id="ctText" placeholder="Task description" style="flex:1;min-width:200px">
        <select id="ctPhase"><option value="1">Phase 1</option><option value="2">Phase 2</option><option value="3">Phase 3</option><option value="4">Phase 4</option></select>
        <input type="number" id="ctWeek" placeholder="Week" style="max-width:70px" value="1">
        <input type="text" id="ctCat" placeholder="Category" style="max-width:120px" value="Custom">
        <input type="text" id="ctCost" placeholder="Cost" style="max-width:80px" value="—">
        <button class="btn btn-p" onclick="addCustomTask()">+ Add</button>
      </div>
    </div>`;
}

function taskDocs(){
  const cats={};DOCUMENTS.forEach(d=>{if(!cats[d.cat])cats[d.cat]=[];cats[d.cat].push(d)});
  const done=DOCUMENTS.filter(d=>state.docChecked[d.id]).length;
  document.getElementById('taskSub').innerHTML=`
    <div class="sg"><div class="sb ${done===DOCUMENTS.length?'green':'yellow'}"><div class="l">Collected</div><div class="v">${done}/${DOCUMENTS.length}</div></div></div>
    <div class="card"><h2>📁 Critical Documents (Carry-On)</h2>
    ${Object.entries(cats).map(([cat,docs])=>`<h3>${cat}</h3>${docs.map(d=>{const ck=state.docChecked[d.id];
      return`<div class="ci${ck?' done':''}"><input type="checkbox" ${ck?'checked':''} onchange="state.docChecked['${d.id}']=!state.docChecked['${d.id}'];save();renderTasks()"><div class="ct">${d.text}</div></div>`}).join('')}`).join('')}
      <h3 class="mt3">+ Add Document</h3>
      <div class="flex g2 fw aic">
        <input type="text" id="cdText" placeholder="Document name" style="flex:1;min-width:200px">
        <select id="cdCat"><option>Identity</option><option>Medical</option><option>School</option><option>Financial</option><option>Property</option><option>Dog</option><option>Employment</option><option>Other</option></select>
        <button class="btn btn-p" onclick="addCustomDoc()">+ Add</button>
      </div>
    </div>`;
}

// ===== NOTES (Journal + Contacts + Decisions + Risks) =====
let notesSub='journal';
function renderNotes(){
  const el=document.getElementById('notes');
  el.innerHTML=`
    <div class="stabs">
      <div class="stab ${notesSub==='journal'?'active':''}" onclick="notesSub='journal';renderNotes()">Journal</div>
      <div class="stab ${notesSub==='contacts'?'active':''}" onclick="notesSub='contacts';renderNotes()">Contacts</div>
      <div class="stab ${notesSub==='decisions'?'active':''}" onclick="notesSub='decisions';renderNotes()">Decisions</div>
      <div class="stab ${notesSub==='risks'?'active':''}" onclick="notesSub='risks';renderNotes()">Risks</div>
    </div><div id="notesSub"></div>`;
  ({journal:notesJournal,contacts:notesContacts,decisions:notesDecisions,risks:notesRisks})[notesSub]?.();
}

function notesJournal(){
  document.getElementById('notesSub').innerHTML=`<div class="card"><h2>📓 Weekly Journal</h2>
    ${Array.from({length:16},(_,i)=>i+1).reverse().map(w=>`<div style="background:var(--card2);border-radius:8px;padding:10px;margin-bottom:6px">
      <div style="font-weight:600;font-size:.85rem${w===curWk()?';color:var(--accent)':''}">Week ${w} — ${fd(wkDate(w))} ${w===curWk()?'(now)':''}</div>
      <textarea placeholder="Notes, thoughts, issues..." oninput="state.journal[${w}]=this.value;save()">${state.journal[w]||''}</textarea>
    </div>`).join('')}</div>`;
}

const CONTACTS=[
  {id:'pet_relo',l:'🐕 Pet Relocation'},{id:'letting',l:'🏠 Letting Agent'},{id:'mortgage',l:'🏦 Mortgage Lender'},
  {id:'shipping',l:'📦 Shipping Co'},{id:'gas',l:'🔧 Gas Engineer'},{id:'elec',l:'⚡ Electrician'},
  {id:'co_relo',l:'🏢 Company Relo'},{id:'co_tax',l:'📋 Company Tax'},{id:'au_health',l:'🏥 AU Health Ins'},
  {id:'au_sch1',l:'🏫 AU School (14yr)'},{id:'au_sch2',l:'🏫 AU School (10yr)'},{id:'au_agent',l:'🏠 AU Agent'},{id:'au_gp',l:'🩺 AU GP'}];

function notesContacts(){
  document.getElementById('notesSub').innerHTML=`<div class="card"><h2>📇 Contacts</h2>
    <div class="cg">${CONTACTS.map(s=>{const c=(state.contacts||{})[s.id]||{};
      return`<div class="cc-card"><div class="n">${s.l}</div>
      <input placeholder="Name" value="${c.name||''}" oninput="if(!state.contacts)state.contacts={};if(!state.contacts['${s.id}'])state.contacts['${s.id}']={};state.contacts['${s.id}'].name=this.value;save()">
      <input placeholder="Phone" value="${c.phone||''}" oninput="if(!state.contacts['${s.id}'])state.contacts['${s.id}']={};state.contacts['${s.id}'].phone=this.value;save()">
      <input placeholder="Email / notes" value="${c.notes||''}" oninput="if(!state.contacts['${s.id}'])state.contacts['${s.id}']={};state.contacts['${s.id}'].notes=this.value;save()">
      </div>`}).join('')}</div></div>`;
}

const DECISIONS=[
  {id:'d1',l:'Letting agent'},{id:'d2',l:'Managed vs let-only'},{id:'d3',l:'Pet relo company'},{id:'d4',l:'Shipping type'},
  {id:'d5',l:'Shipping company'},{id:'d6',l:'AU health insurer'},{id:'d7',l:'AU suburb'},{id:'d8',l:'AU school (14yr)'},
  {id:'d9',l:'AU school (10yr)'},{id:'d10',l:'AU car'},{id:'d11',l:'UK property keep/sell'},{id:'d12',l:'UK NI contributions'},{id:'d13',l:'Super fund'}];

function notesDecisions(){
  document.getElementById('notesSub').innerHTML=`<div class="card"><h2>📝 Decisions</h2>
    <div class="table-wrap"><table><tr><th>Decision</th><th>Chosen</th><th>Why</th><th>Date</th></tr>
    ${DECISIONS.map(d=>{const v=(state.decisions||{})[d.id]||{};
      return`<tr><td style="font-weight:600">${d.l}</td>
      <td><input value="${v.chosen||''}" placeholder="—" oninput="if(!state.decisions)state.decisions={};if(!state.decisions['${d.id}'])state.decisions['${d.id}']={};state.decisions['${d.id}'].chosen=this.value;save()"></td>
      <td><input value="${v.reason||''}" placeholder="Why..." oninput="state.decisions['${d.id}'].reason=this.value;save()"></td>
      <td><input value="${v.date||''}" placeholder="dd/mm" style="width:60px" oninput="state.decisions['${d.id}'].date=this.value;save()"></td></tr>`}).join('')}</table></div></div>`;
}

function notesRisks(){
  const sts=['monitoring','mitigated','issue','resolved'];
  document.getElementById('notesSub').innerHTML=`<div class="card"><h2>🚨 Risks</h2>
    <div class="table-wrap"><table><tr><th>Risk</th><th>Impact</th><th>Status</th><th>Notes</th></tr>
    ${RISKS.map(r=>{const rs=(state.riskStatus||{})[r.id]||{};
      return`<tr><td>${r.risk}</td><td>${r.impact}</td>
      <td><select oninput="if(!state.riskStatus)state.riskStatus={};if(!state.riskStatus['${r.id}'])state.riskStatus['${r.id}']={};state.riskStatus['${r.id}'].status=this.value;save()">${sts.map(s=>`<option ${(rs.status||'monitoring')===s?'selected':''}>${s}</option>`).join('')}</select></td>
      <td><input value="${rs.notes||''}" placeholder="Notes..." oninput="state.riskStatus['${r.id}'].notes=this.value;save()"></td></tr>`}).join('')}</table></div></div>`;
}

// ===== SETTINGS =====
function renderSettings(){
  const el=document.getElementById('settings');
  el.innerHTML=`
    <div class="card">
      <h2>📅 Key Dates</h2>
      <p class="tx tm mb2">Set your AU start date — the entire 16-week plan calculates backwards from this.</p>
      <div class="flex g2 fw aic">
        <label class="ts">AU Work Start:</label><input type="date" value="${state.auStart||''}" style="max-width:180px" onchange="state.auStart=this.value||null;save();updateHeader()">
        <label class="ts">Move/Flight Date:</label><input type="date" value="${state.moveDate||''}" style="max-width:180px" onchange="state.moveDate=this.value||null;save();updateHeader()">
      </div>
      ${state.auStart?`<p class="ts mt2">Planning starts: <strong>${fdf(getStart())}</strong> → AU arrival: Week 13 (${fd(wkDate(13))})</p>`:''}
    </div>
    <div class="card">
      <h2>💾 Data</h2>
      <div class="flex g2 fw">
        <button class="btn btn-p" onclick="exportData()">💾 Export Backup</button>
        <button class="btn btn-o" onclick="document.getElementById('imp').click()">📂 Import Backup</button>
        <button class="btn btn-o tr" onclick="resetData()">🗑️ Reset This Device</button>
        <button class="btn btn-o tr" onclick="resetEverything()">💣 Reset ALL Devices (cloud + local)</button>
        <button class="btn btn-o" onclick="changePw()">🔒 Change Password</button>
        <button class="btn btn-o" onclick="localStorage.removeItem('relo_trusted');alert('Device untrusted — you will need to log in next time')">🚫 Untrust Device</button>
      </div>
      ${state._saved?`<p class="tx tm mt2">Last saved: ${new Date(state._saved).toLocaleString('en-GB')}</p>`:''}
    </div>
    <div class="card">
      <h2>ℹ️ About</h2>
      <p class="ts tm">UK → Melbourne relocation tracker. All data stored locally in your browser. Export backups regularly.</p>
    </div>`;
}

// ===== MAP =====
var mapInstance=null;var mapMarkers=[];var mapCity='melbourne';
var PIN_CATS=[
  {id:'housing',label:'🏠 Housing',color:'#3b82f6'},
  {id:'school',label:'🏫 School',color:'#22c55e'},
  {id:'activity',label:'⚽ Activity/Sport',color:'#f97316'},
  {id:'transport',label:'🚆 Transport',color:'#8b5cf6'},
  {id:'shopping',label:'🛒 Shopping',color:'#eab308'},
  {id:'medical',label:'🏥 Medical',color:'#ef4444'},
  {id:'work',label:'💼 Work',color:'#06b6d4'},
  {id:'other',label:'📍 Other',color:'#94a3b8'}
];

function renderMap(){
  var el=document.getElementById('map');
  el.innerHTML='<div class="card"><h2>🗺️ Map</h2>'+
    '<div class="stabs mb2">'+
    '<div class="stab '+(mapCity==='melbourne'?'active':'')+'" onclick="mapCity=\'melbourne\';renderMap()">🏙️ Melbourne</div>'+
    '<div class="stab '+(mapCity==='sydney'?'active':'')+'" onclick="mapCity=\'sydney\';renderMap()">🌊 Sydney</div>'+
    '</div>'+
    '<p class="tx tm mb2">Search for any address, school, or business. Click the map to drop a pin.</p><p class="tx tm mb2">Search for any address, school, or business. Click the map to drop a pin.</p><div class="flex g2 fw aic"><input type="text" id="mapSearch" placeholder="🔍 Search address, school, business..." style="flex:1;min-width:200px" onkeydown="if(event.key===\'Enter\')searchMap()"><button class="btn btn-p" onclick="searchMap()">Search</button></div><div id="searchResults" class="mt2"></div></div><div id="mapView"></div><div class="pin-form" id="pinForm" style="display:none"><h3>Add Pin</h3><div class="flex g2 fw aic mt2"><select id="pinCat">'+PIN_CATS.map(function(c){return'<option value="'+c.id+'">'+c.label+'</option>'}).join('')+'</select><input type="text" id="pinTitle" placeholder="Title (e.g. 42 Smith St)" style="flex:1;min-width:180px"><input type="text" id="pinNote" placeholder="Notes..." style="flex:1;min-width:180px"><button class="btn btn-p" onclick="savePin()">Save Pin</button><button class="btn btn-o" onclick="cancelPin()">Cancel</button></div></div><div class="card mt2" id="pinList"></div>';
  setTimeout(initMap,100);
}

var pendingLatLng=null;
function initMap(){
  if(mapInstance){mapInstance.remove();mapInstance=null}
  var center=mapCity==='sydney'?[-33.83,151.08]:[-37.88,145.08];mapInstance=L.map('mapView').setView(center,12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution:'© OpenStreetMap contributors',maxZoom:19
  }).addTo(mapInstance);
  mapInstance.on('click',function(e){
    pendingLatLng=e.latlng;
    document.getElementById('pinForm').style.display='block';
    document.getElementById('pinTitle').value='';
    document.getElementById('pinNote').value='';
    document.getElementById('pinTitle').focus();
  });
  loadPins();
}

function pinIcon(color){
  return L.divIcon({
    html:'<div style="background:'+color+';width:24px;height:24px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>',
    iconSize:[24,24],iconAnchor:[12,12],className:''
  });
}

function loadPins(){
  mapMarkers.forEach(function(m){mapInstance.removeLayer(m)});
  mapMarkers=[];
  var list=state.pins||[];
  var html='<h2>📍 Saved Pins ('+list.length+')</h2>';
  if(list.length){
    html+='<div class="table-wrap"><table><tr><th>Cat</th><th>Title</th><th>Notes</th><th></th></tr>';
    list.forEach(function(p,i){
      var cat=PIN_CATS.find(function(c){return c.id===p.cat})||PIN_CATS[7];
      var marker=L.marker([p.lat,p.lng],{icon:pinIcon(cat.color)}).addTo(mapInstance);
      marker.bindPopup('<strong>'+cat.label+'</strong><br><strong>'+(p.title||'')+'</strong><br>'+(p.note||'')+'<br><button onclick="deletePin('+i+')" style="margin-top:4px;padding:2px 8px;cursor:pointer">Delete</button>');
      mapMarkers.push(marker);
      html+='<tr><td><span class="pin-cat" style="background:'+cat.color+'"></span>'+cat.label+'</td><td>'+p.title+'</td><td class="tx tm">'+(p.note||'—')+'</td><td><button class="btn btn-o" style="padding:2px 6px" onclick="flyToPin('+i+')">📍</button> <button class="btn btn-o" style="padding:2px 6px" onclick="deletePin('+i+')">✕</button></td></tr>';
    });
    html+='</table></div>';
  }else{
    html+='<p class="tm ts">No pins yet. Click the map to add one.</p>';
  }
  document.getElementById('pinList').innerHTML=html;
}

function searchMap(){
  var q=document.getElementById('mapSearch').value;
  if(!q)return;
  var res=document.getElementById('searchResults');
  res.innerHTML='<p class="tx tm">Searching...</p>';
  fetch('https://nominatim.openstreetmap.org/search?format=json&q='+encodeURIComponent(q+' '+(mapCity==='sydney'?'Sydney':'Melbourne')+' Australia')+'&limit=5&addressdetails=1')
    .then(function(r){return r.json()})
    .then(function(data){
      if(!data.length){res.innerHTML='<p class="tx tm">No results found. Try a different search.</p>';return}
      res.innerHTML=data.map(function(d,i){
          var name=d.display_name.replace(/'/g,'').substring(0,60);
          return '<div style="display:flex;align-items:center;gap:8px;padding:8px;border-bottom:1px solid var(--border);cursor:pointer" onclick="goToResult('+d.lat+','+d.lon+')">'+
          '<div style="flex:1"><div class="ts" style="font-weight:600">'+name+'</div><div class="tx tm">'+(d.type||'')+'</div></div>'+
          '<select id="srCat'+i+'" style="max-width:110px;min-height:36px" onclick="event.stopPropagation()">'+PIN_CATS.map(function(c){return'<option value="'+c.id+'">'+c.label+'</option>'}).join('')+'</select>'+
          '<button class="btn btn-p" style="padding:4px 12px" onclick="event.stopPropagation();quickPin('+d.lat+','+d.lon+',\''+name+'\','+i+')">+ Save</button></div>';
        }).join('');
    })
    .catch(function(){res.innerHTML='<p class="tx tm tr">Search failed — check your connection.</p>'});
}

function quickPin(lat,lng,name,idx){
  var cat=document.getElementById('srCat'+idx).value;
  if(!state.pins)state.pins=[];
  state.pins.push({lat:lat,lng:lng,cat:cat,title:name,note:'',city:mapCity});
  save();loadPins();
  if(mapInstance)mapInstance.flyTo([lat,lng],15);
}

function goToResult(lat,lng){
  if(mapInstance)mapInstance.flyTo([lat,lng],16);
}

function pinFromSearch(lat,lng,name){
  pendingLatLng={lat:lat,lng:lng};
  document.getElementById('pinForm').style.display='block';
  document.getElementById('pinTitle').value=name;
  document.getElementById('pinNote').value='';
  document.getElementById('pinTitle').focus();
}

function toggleCatCollapse(catId){
  if(!state._collapsed)state._collapsed={};
  state._collapsed[catId]=!state._collapsed[catId];
  save();loadPins();
}

function savePin(){
  if(!pendingLatLng)return;
  var cat=document.getElementById('pinCat').value;
  var title=document.getElementById('pinTitle').value||'Untitled';
  var note=document.getElementById('pinNote').value;
  if(!state.pins)state.pins=[];
  state.pins.push({lat:pendingLatLng.lat,lng:pendingLatLng.lng,cat:cat,title:title,note:note,city:mapCity});
  save();
  document.getElementById('pinForm').style.display='none';
  pendingLatLng=null;
  loadPins();
}

function cancelPin(){
  document.getElementById('pinForm').style.display='none';
  pendingLatLng=null;
}

function deletePin(i){
  state.pins.splice(i,1);save();loadPins();
}

function flyToPin(i){
  var p=state.pins[i];
  if(p&&mapInstance)mapInstance.flyTo([p.lat,p.lng],16);
}

// ===== TO-DO LIST =====
function renderTodo(){
  const el=document.getElementById('todo');
  const todos=state.todos||[];
  const done=todos.filter(t=>t.done).length;
  const cats=[...new Set(todos.map(t=>t.cat||'General'))];
  el.innerHTML=`
    <div class="sg">
      <div class="sb ${done===todos.length&&todos.length?'green':'yellow'}"><div class="l">Done</div><div class="v">${done}/${todos.length}</div></div>
    </div>
    <div class="card">
      <h2>📌 To-Do List</h2>
      <p class="tx tm mb2">General tasks — house repairs, errands, prep work, anything that needs doing.</p>
      <div class="flex g2 fw aic mb2">
        <input type="text" id="todoText" placeholder="What needs doing?" style="flex:1;min-width:200px" onkeydown="if(event.key==='Enter')addTodo()">
        <select id="todoCat" style="max-width:140px">
          <option>General</option><option>House Repairs</option><option>Packing</option><option>Admin</option><option>Shopping</option><option>Kids</option><option>Other</option>
        </select>
        <select id="todoPri" style="max-width:100px">
          <option value="med">Medium</option><option value="high">High</option><option value="low">Low</option>
        </select>
        <button class="btn btn-p" onclick="addTodo()">+ Add</button>
      </div>
      ${todos.length?todos.map((t,i)=>{
        const pri=t.pri==='high'?'🔴':t.pri==='low'?'🟢':'🟡';
        return '<div class="ci'+(t.done?' done':'')+'">'+
          '<input type="checkbox" '+(t.done?'checked':'')+' onchange="state.todos['+i+'].done=!state.todos['+i+'].done;save();renderTodo()">'+
          '<div class="ct">'+pri+' '+t.text+'<div class="cm">'+t.cat+'</div></div>'+
          '<button class="btn btn-o" style="padding:2px 6px" onclick="state.todos.splice('+i+',1);save();renderTodo()">✕</button></div>';
      }).join(''):'<p class="tm ts">No to-dos yet. Add one above.</p>'}
    </div>`;
}
function addTodo(){
  const text=document.getElementById('todoText').value;
  if(!text)return;
  const cat=document.getElementById('todoCat').value;
  const pri=document.getElementById('todoPri').value;
  if(!state.todos)state.todos=[];
  state.todos.push({text:text,cat:cat,pri:pri,done:false});
  save();renderTodo();
  document.getElementById('todoText').value='';
}

// ===== CUSTOM TASK ADDING (for checklist) =====
function addCustomTask(){
  var text=document.getElementById('ctText').value;
  var phase=+(document.getElementById('ctPhase').value)||1;
  var week=+(document.getElementById('ctWeek').value)||1;
  var cat=document.getElementById('ctCat').value||'Custom';
  var cost=document.getElementById('ctCost').value||'—';
  if(!text)return;
  if(!state.customTasks)state.customTasks=[];
  var id='custom_'+Date.now();
  state.customTasks.push({id:id,text:text,phase:phase,week:week,cat:cat,cost:cost});
  CHECKLIST.push({id:id,text:text,phase:phase,week:week,cat:cat,cost:cost});
  save();renderTasks();
}

// ===== CUSTOM COST ADDING =====
function renameCost(id,name){
  if(!state.renames)state.renames={};
  state.renames[id]=name;
  var item=FORECAST_ITEMS.find(function(x){return x.id===id});
  if(item)item.desc=name;
  save();
}

function updateCostWeek(id,week){
  if(!state.costWeeks)state.costWeeks={};
  state.costWeeks[id]=week;
  var item=FORECAST_ITEMS.find(function(x){return x.id===id});
  if(item)item.week=week;
  save();
}

function removeCost(id){
  if(!confirm('Remove this cost item?'))return;
  if(!state.removedCosts)state.removedCosts=[];
  state.removedCosts.push(id);
  var idx=FORECAST_ITEMS.findIndex(function(x){return x.id===id});
  if(idx>-1)FORECAST_ITEMS.splice(idx,1);
  save();renderMoney();
}

function addCustomCost(){
  var desc=document.getElementById('ccDesc').value;
  var week=+(document.getElementById('ccWeek').value)||1;
  var forecast=+(document.getElementById('ccForecast').value)||0;
  var cat=document.getElementById('ccCat').value||'Custom';
  if(!desc)return;
  if(!state.customCosts)state.customCosts=[];
  var id='cc_'+Date.now();
  var item={id:id,cat:cat,desc:desc,week:week,forecastLow:forecast,forecastHigh:forecast,forecast:forecast,phase:Math.ceil(week/4),defaultFund:'lump_sum'};
  state.customCosts.push(item);
  FORECAST_ITEMS.push(item);
  save();renderMoney();
}

// ===== CUSTOM DOCUMENT ADDING =====
function addCustomDoc(){
  var text=document.getElementById('cdText').value;
  var cat=document.getElementById('cdCat').value||'Other';
  if(!text)return;
  if(!state.customDocs)state.customDocs=[];
  var id='cdoc_'+Date.now();
  state.customDocs.push({id:id,text:text,cat:cat});
  DOCUMENTS.push({id:id,text:text,cat:cat});
  save();renderTasks();
}

// ===== RESTORE CUSTOM ITEMS ON LOAD =====
function changePw(){
  var pw=prompt('Enter new password:');
  if(!pw)return;
  var hash=0;for(var i=0;i<pw.length;i++){hash=((hash<<5)-hash)+pw.charCodeAt(i);hash|=0}
  localStorage.setItem('relo_pw_hash',String(hash));
  alert('Password updated');
}

function restoreCustomItems(){
  if(!state.pins||!state.pins.length){if(typeof DEFAULT_PINS!=='undefined')state.pins=DEFAULT_PINS.slice()}
  // Restore saved forecast values
  if(state.forecasts){Object.keys(state.forecasts).forEach(function(id){
    var item=FORECAST_ITEMS.find(function(x){return x.id===id});
    if(item)item.forecast=state.forecasts[id];
  })}
  // Restore renames
  if(state.renames){Object.keys(state.renames).forEach(function(id){
    var item=FORECAST_ITEMS.find(function(x){return x.id===id});
    if(item)item.desc=state.renames[id];
  })}
  // Restore week changes
  if(state.costWeeks){Object.keys(state.costWeeks).forEach(function(id){
    var item=FORECAST_ITEMS.find(function(x){return x.id===id});
    if(item)item.week=state.costWeeks[id];
  })}
  // Remove deleted items
  if(state.removedCosts){state.removedCosts.forEach(function(id){
    var idx=FORECAST_ITEMS.findIndex(function(x){return x.id===id});
    if(idx>-1)FORECAST_ITEMS.splice(idx,1);
  })}
  (state.customTasks||[]).forEach(function(t){
    if(!CHECKLIST.find(function(c){return c.id===t.id}))CHECKLIST.push(t);
  });
  (state.customCosts||[]).forEach(function(c){
    if(!FORECAST_ITEMS.find(function(f){return f.id===c.id}))FORECAST_ITEMS.push(c);
  });
  (state.customDocs||[]).forEach(function(d){
    if(!DOCUMENTS.find(function(x){return x.id===d.id}))DOCUMENTS.push(d);
  });
}

// ===== INIT =====
restoreCustomItems();updateHeader();planSub='visa';renderPlanNew();
// Auto-sync if visa tasks missing
var _visaCats=['Immigration','Tax','Health','Travel','Schools'];
if(!(state.todos||[]).some(function(t){return _visaCats.indexOf(t.cat)>=0})){
  if(window._fbReady&&window._fbLoad){window._fbLoad().then(function(snap){if(snap.exists){var cloud=snap.data();if(cloud.todos&&cloud.todos.some(function(t){return _visaCats.indexOf(t.cat)>=0})){state.todos=cloud.todos;save();renderPlanNew()}}}).catch(function(){})}
}

// ===== PLAN (Combined: Phases + Tasks + To-Do) =====
var planSub='visa';

var VISA_DEFAULTS=[
{text:'Confirm visa status with Internal Movement Hub',cat:'Immigration',pri:'high'},
{text:'Upload Education Certificates',cat:'Immigration',pri:'high'},
{text:'Upload Evidence of English Language',cat:'Immigration',pri:'high'},
{text:'Upload Invitation Letter',cat:'Immigration',pri:'high'},
{text:'Upload Letter of Appointment',cat:'Immigration',pri:'high'},
{text:'Book & complete visa medicals (all 4 family)',cat:'Immigration',pri:'high'},
{text:'Upload Passport(s) — all family members',cat:'Immigration',pri:'high'},
{text:'Upload Proof of Medical Insurance',cat:'Immigration',pri:'high'},
{text:'Upload Resume / CV',cat:'Immigration',pri:'med'},
{text:'Upload Secondment Letter',cat:'Immigration',pri:'high'},
{text:'Visa application submitted & approved',cat:'Immigration',pri:'high'},
{text:'Update citizenship/residency in A to Z',cat:'Immigration',pri:'high'},
{text:'Get certified copies birth + marriage certificates',cat:'Immigration',pri:'high'},
{text:'Check passport expiry — renew if <2 years',cat:'Immigration',pri:'high'},
{text:'Take extra passport photos',cat:'Immigration',pri:'med'},
{text:'Make extra copies of all passports',cat:'Immigration',pri:'med'},
{text:'Meet Amazon tax advisor — AU taxation',cat:'Tax',pri:'high'},
{text:'Check RSU/stock vesting across jurisdictions',cat:'Tax',pri:'high'},
{text:'Ensure last 5 years tax returns accessible',cat:'Tax',pri:'med'},
{text:'Check AU super/retirement contributions',cat:'Tax',pri:'med'},
{text:'Physical exams for all family before departure',cat:'Health',pri:'med'},
{text:'Complete all dental work before departure',cat:'Health',pri:'med'},
{text:'Get copies of medical + dental records',cat:'Health',pri:'high'},
{text:'Get extra medications, glasses, prescriptions',cat:'Health',pri:'med'},
{text:'Check AU inoculation requirements',cat:'Health',pri:'med'},
{text:'Get small amount of AUD cash for arrival',cat:'Travel',pri:'med'},
{text:'Notify credit card companies of travel',cat:'Travel',pri:'med'},
{text:'Keep record of all relocation expenses + receipts',cat:'Travel',pri:'med'},
{text:'Change travel profile (new cost centre)',cat:'Travel',pri:'med'},
{text:'Select primary school for Jack (Aug-Dec 2026)',cat:'Schools',pri:'high'},
{text:'Select secondary school for Bella',cat:'Schools',pri:'high'},
{text:'Get school records transferred',cat:'Schools',pri:'high'},
{text:'Notify current UK schools of departure',cat:'Schools',pri:'med'},
{text:'Check registration dates + interview requirements',cat:'Schools',pri:'high'},
];
function ensureVisaTasks(){
  if(!state.todos)state.todos=[];
  var existing=state.todos.map(function(t){return t.text});
  var added=0;
  VISA_DEFAULTS.forEach(function(d){
    if(existing.indexOf(d.text)<0){state.todos.push({text:d.text,cat:d.cat,pri:d.pri,done:false});added++}
  });
  if(added>0)save();
}
ensureVisaTasks();

function renderVisaLegal(){
  var todos=state.todos||[];
  var visaCats=['Immigration','Tax','Health','Travel','Schools'];
  var visaTasks=todos.filter(function(t){return visaCats.indexOf(t.cat)>=0});
  var done=visaTasks.filter(function(t){return t.done}).length;
  
  var html='<div class="card"><h2>📋 Visa & Legal Checklist</h2>';
  html+='<div class="sg mb2"><div class="sb '+(done===visaTasks.length&&visaTasks.length?'green':'orange')+'"><div class="l">Progress</div><div class="v">'+done+'/'+visaTasks.length+'</div></div></div>';
  
  visaCats.forEach(function(cat){
    var items=visaTasks.filter(function(t){return t.cat===cat});
    if(!items.length)return;
    var catDone=items.filter(function(t){return t.done}).length;
    html+='<h3 style="margin-top:12px">'+(cat==='Immigration'?'🛂':cat==='Tax'?'💼':cat==='Health'?'🏥':cat==='Travel'?'✈️':'🎓')+' '+cat+' ('+catDone+'/'+items.length+')</h3>';
    
    // Pending first
    items.filter(function(t){return !t.done}).forEach(function(t){
      var idx=todos.indexOf(t);
      var pri=t.pri==='high'?'🔴':t.pri==='low'?'🟢':'🟡';
      html+='<div class="ci"><input type="checkbox" onchange="state.todos['+idx+'].done=true;save();renderPlanNew()"><div class="ct">'+pri+' '+t.text+'</div><button class="btn btn-o" style="padding:2px 6px" onclick="state.todos.splice('+idx+',1);save();renderPlanNew()">✕</button></div>';
    });
    // Done at bottom
    items.filter(function(t){return t.done}).forEach(function(t){
      var idx=todos.indexOf(t);
      html+='<div class="ci done"><input type="checkbox" checked onchange="state.todos['+idx+'].done=false;save();renderPlanNew()"><div class="ct">'+t.text+'</div></div>';
    });
  });
  
  html+='</div>';
  
  // Document requirements detail
  html+='<div class="card mt2"><h2>📄 Required Documents — Detail</h2><p class="tx tm mb2">TSS (482) Visa — what each document is, who provides it, and when.</p>';
  html+='<h3 style="color:var(--accent)">🏢 Corporate Documents (Amazon provides)</h3>';
  html+='<div class="table-wrap"><table><tr><th>Document</th><th>Description</th><th>Who</th><th>When</th></tr>';
  html+='<tr><td style="font-weight:600">Nomination Application Form</td><td>Electronic submission of sponsorship nomination</td><td>Amazon / ISP</td><td>Before filing</td></tr>';
  html+='<tr><td style="font-weight:600">Position Information</td><td>Start date, weekly hours, employment period, full compensation package</td><td>Amazon</td><td>Before filing</td></tr>';
  html+='<tr><td style="font-weight:600">Job Description</td><td>Full-time position, title, ANZSCO code, responsibilities, duties, experience required, licensing</td><td>Amazon</td><td>Before filing</td></tr>';
  html+='<tr><td style="font-weight:600">Evidence of Labour Market Testing</td><td>For ICT roles — alternative requirement applies (ICT occupation exemption)</td><td>Amazon</td><td>Before filing</td></tr>';
  html+='<tr><td style="font-weight:600">Market Salary Rate (AMSR)</td><td>Evidence position meets Annual Market Salary Rate threshold</td><td>Amazon</td><td>Before filing</td></tr>';
  html+='</table></div>';
  
  html+='<h3 style="color:var(--orange);margin-top:12px">👤 Personal Documents (You provide)</h3>';
  html+='<div class="table-wrap"><table><tr><th>Document</th><th>Description</th><th>Format</th><th>When</th></tr>';
  html+='<tr><td style="font-weight:600">Passport</td><td>Current valid passport for all family members</td><td>Copy</td><td>Before filing</td></tr>';
  html+='<tr><td style="font-weight:600">Passport Photo</td><td>Recent passport-style photo</td><td>Copy</td><td>Before filing</td></tr>';
  html+='<tr><td style="font-weight:600">CV / Resume</td><td>Up-to-date CV showing relevant experience</td><td>Copy</td><td>Before filing</td></tr>';
  html+='<tr><td style="font-weight:600">Educational Certificates</td><td>Degree/diploma certificates proving qualifications</td><td>Copy</td><td>Before filing</td></tr>';
  html+='<tr><td style="font-weight:600">Employment References</td><td>Letters from previous employers confirming experience</td><td>Copy</td><td>Before filing</td></tr>';
  html+='<tr><td style="font-weight:600">English Language Evidence</td><td>UK passport holder = exempt (native English speaker). May need to declare.</td><td>Copy</td><td>Before filing</td></tr>';
  html+='<tr><td style="font-weight:600">Family/Relationship Documents</td><td>Marriage certificate, kids\' birth certificates</td><td>Copy</td><td>Before filing</td></tr>';
  html+='<tr><td style="font-weight:600">Police Certificates</td><td>For all adults — any country where stay exceeded 12 months in last 10 years (UK for you)</td><td>Copy</td><td>Before filing</td></tr>';
  html+='<tr><td style="font-weight:600">Travel History (10 years)</td><td>All countries visited in last 10 years for all adult dependents</td><td>Copy</td><td>Before filing</td></tr>';
  html+='<tr><td style="font-weight:600">Residential Address History (10 years)</td><td>All addresses lived at in last 10 years for all adult dependents</td><td>Copy</td><td>Before filing</td></tr>';
  html+='<tr><td style="font-weight:600">Registration/Licensing</td><td>Professional memberships or registrations (if relevant to role)</td><td>Copy</td><td>Before filing</td></tr>';
  html+='<tr style="background:rgba(59,130,246,.05)"><td style="font-weight:600">Health Assessment</td><td>Visa medical exam — book through BUPA panel clinic (all family members)</td><td>Original</td><td style="color:var(--orange)">After filing</td></tr>';
  html+='<tr style="background:rgba(59,130,246,.05)"><td style="font-weight:600">Health Insurance</td><td>Proof of adequate health cover in Australia (Amazon provides through benefits)</td><td>N/A</td><td style="color:var(--orange)">Post-arrival</td></tr>';
  html+='</table></div>';
  
  html+='<div style="margin-top:12px;font-size:.78rem;line-height:1.8">';
  html+='<div>💡 <strong>All copies are fine</strong> — no originals, wet signatures, or lawyer authentication needed for 482 visa</div>';
  html+='<div>💡 <strong>English language:</strong> UK passport = exempt as native English speaker</div>';
  html+='<div>💡 <strong>Police check:</strong> Apply via <a href="https://www.acro.police.uk/police-certificates" target="_blank" style="color:var(--accent)">ACRO UK Police Certificate</a> — takes 2-4 weeks</div>';
  html+='<div>💡 <strong>Health assessment:</strong> Booked AFTER visa application lodged — immigration team will instruct</div>';
  html+='<div>💡 <strong>Frankie:</strong> Needs same personal documents as dependent (passport, police cert, health assessment, travel/address history)</div>';
  html+='</div></div>';
  
  document.getElementById('planSub').innerHTML=html;
}

function renderPlanNew(){
  updateHeader();
  var el=document.getElementById('plan');
  if(!el)return;
  var cw=curWk();
  var thisWk=CHECKLIST.filter(function(c){return c.week===cw&&!state.checked[c.id]});
  var overdue=CHECKLIST.filter(function(c){return c.week<cw&&!state.checked[c.id]});
  var pct=pctDone();
  el.innerHTML='<div class="sg"><div class="sb '+(pct>75?'green':pct>40?'yellow':'red')+'"><div class="l">Done</div><div class="v">'+pct+'%</div></div><div class="sb yellow"><div class="l">Overdue</div><div class="v">'+overdue.length+'</div></div><div class="sb blue"><div class="l">This Week</div><div class="v">'+thisWk.length+'</div></div><div class="sb blue"><div class="l">Week</div><div class="v">'+cw+'</div></div></div><div class="stabs"><div class="stab '+(planSub==='visa'?'active':'')+'" onclick="planSub=\'visa\';renderPlanNew()">📋 Visa & Legal</div><div class="stab '+(planSub==='thisweek'?'active':'')+'" onclick="planSub=\'thisweek\';renderPlanNew()">⚡ This Week</div><div class="stab '+(planSub==='phase1'?'active':'')+'" onclick="planSub=\'phase1\';renderPlanNew()">🔵 P1</div><div class="stab '+(planSub==='phase2'?'active':'')+'" onclick="planSub=\'phase2\';renderPlanNew()">🟠 P2</div><div class="stab '+(planSub==='phase3'?'active':'')+'" onclick="planSub=\'phase3\';renderPlanNew()">🟡 P3</div><div class="stab '+(planSub==='phase4'?'active':'')+'" onclick="planSub=\'phase4\';renderPlanNew()">🟢 P4</div><div class="stab '+(planSub==='todo'?'active':'')+'" onclick="planSub=\'todo\';renderPlanNew()">📌 To-Do</div></div><div id="planSub"></div>';
  if(planSub==='visa')renderVisaLegal();
  else if(planSub==='thisweek')planThisWeek(cw,thisWk,overdue);
  else if(planSub==='todo')renderTodo2();
  
  else planPhase(parseInt(planSub.replace('phase','')));
}
function planThisWeek(cw,thisWk,overdue){
  var html='<div class="card"><h2>⚡ Week '+cw+' — '+fd(wkDate(cw))+'</h2>';
  if(thisWk.length){thisWk.forEach(function(t){html+='<div class="ci"><input type="checkbox" onchange="state.checked[\''+t.id+'\']=true;save();renderPlanNew()"><div class="ct">'+t.text+'<div class="cm"><span class="pl p'+t.phase+'">'+t.cat+'</span></div></div>'+(t.cost!=='—'&&t.cost!=='Free'?'<div class="cc">'+t.cost+'</div>':'')+'</div>'});}else{html+='<p class="tm ts">✅ All done this week!</p>';}
  html+='</div>';
  if(overdue.length){html+='<div class="card"><h2>🚨 Overdue ('+overdue.length+')</h2>';overdue.forEach(function(t){html+='<div class="ci"><input type="checkbox" onchange="state.checked[\''+t.id+'\']=true;save();renderPlanNew()"><div class="ct">'+t.text+'<div class="cm"><span class="pl p'+t.phase+'">Wk '+t.week+'</span> '+t.cat+'</div></div></div>';});html+='</div>';}
  document.getElementById('planSub').innerHTML=html;
}
function planPhase(phase){
  var items=CHECKLIST.filter(function(c){return c.phase===phase});
  var pending=items.filter(function(c){return !state.checked[c.id]});
  var completed=items.filter(function(c){return state.checked[c.id]});
  var names=['','🔵 Phase 1: Foundations (Wk 1–4)','🟠 Phase 2: Lock & Prep (Wk 5–8)','🟡 Phase 3: Execution (Wk 9–12)','🟢 Phase 4: Arrival (Wk 13–16)'];
  var html='<div class="card"><h2>'+names[phase]+'</h2><div class="pb mb2" style="height:10px"><div class="pf" style="width:'+(items.length?completed.length/items.length*100:0)+'%;background:var(--green)"></div></div><p class="tx tm mb2">'+completed.length+'/'+items.length+' complete</p>';
  pending.forEach(function(c){html+='<div class="ci"><input type="checkbox" onchange="state.checked[\''+c.id+'\']=true;save();renderPlanNew()"><div class="ct">'+c.text+'<div class="cm">Wk '+c.week+' · '+c.cat+'</div></div>'+(c.cost!=='—'&&c.cost!=='Free'&&c.cost!=='Included'&&c.cost!=='Company'?'<div class="cc">'+c.cost+'</div>':'')+'</div>';});
  if(completed.length){html+='<h3 class="mt3" style="color:var(--green)">✅ Completed ('+completed.length+')</h3>';
  completed.forEach(function(c){html+='<div class="ci done"><input type="checkbox" checked onchange="state.checked[\''+c.id+'\']=false;save();renderPlanNew()"><div class="ct">'+c.text+'<div class="cm">Wk '+c.week+' · '+c.cat+'</div></div></div>';});}
  html+='</div>';
  document.getElementById('planSub').innerHTML=html;
}
function renderTodo2(){
  var todos=(state.todos||[]).filter(function(t){return ['Immigration','Tax','Health','Travel','Schools'].indexOf(t.cat)<0});
  var html='<div class="card"><h2>📌 To-Do List</h2><div class="flex g2 fw aic mb2"><input type="text" id="todoText" placeholder="What needs doing?" style="flex:1;min-width:200px" onkeydown="if(event.key===\'Enter\')addTodo()"><select id="todoCat" style="max-width:140px"><option>General</option><option>House Repairs</option><option>Packing</option><option>Admin</option><option>Shopping</option><option>Kids</option></select><select id="todoPri" style="max-width:100px"><option value="med">Medium</option><option value="high">High</option><option value="low">Low</option></select><button class="btn btn-p" onclick="addTodo()">+ Add</button></div>';
  if(todos.length){todos.forEach(function(t,i){var pri=t.pri==='high'?'🔴':t.pri==='low'?'🟢':'🟡';html+='<div class="ci'+(t.done?' done':'')+'"><input type="checkbox" '+(t.done?'checked':'')+' onchange="state.todos['+i+'].done=!state.todos['+i+'].done;save();renderPlanNew()"><div class="ct">'+pri+' '+t.text+'<div class="cm">'+t.cat+'</div></div><button class="btn btn-o" style="padding:2px 6px" onclick="state.todos.splice('+i+',1);save();renderPlanNew()">✕</button></div>';});}else{html+='<p class="tm ts">No to-dos yet.</p>';}
  html+='</div>';
  document.getElementById('planSub').innerHTML=html;
}
