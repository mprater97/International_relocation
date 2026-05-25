// ===== STATE =====
let state=load();
function defaults(){return{auStart:null,moveDate:null,lumpSum:14900,checked:{},actuals:{},funding:{},forecasts:{},contacts:{},decisions:{},weeklySpend:{},fx:[],income:[],debtPaid:{},debts:null,journal:{},riskStatus:{},docChecked:{},todos:[],customTasks:[],customCosts:[],customDocs:[],pins:[],_collapsed:{}}}
function load(){
  var d=defaults();
  try{var s=localStorage.getItem('relo_v3');if(s){var saved=JSON.parse(s);Object.keys(saved).forEach(function(k){d[k]=saved[k]})}}catch(e){}
  return d;
}
function save(){
  state._saved=Date.now();
  try{localStorage.setItem('relo_v3',JSON.stringify(state))}catch(e){console.error('Save failed',e)}
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
function fG(v){var gbp=Math.round(v*0.532);return'$'+Math.round(v).toLocaleString()+' (£'+gbp.toLocaleString()+')'}
function fGBP(v){var aud=Math.round(v*1.88);return'£'+Math.round(v).toLocaleString()+' ($'+aud.toLocaleString()+')'}
function fA(v){var gbp=Math.round(v*0.532);return'$'+Math.round(v).toLocaleString()+' (£'+gbp.toLocaleString()+')'}
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
    {id:'temp30',name:'Temp Housing 30 days',points:70,market:3600,cashCost:3364},
    {id:'temp45',name:'Temp Housing 45 days',points:105,market:5400,cashCost:5045},
    {id:'temp60',name:'Temp Housing 60 days',points:140,market:7200,cashCost:6727},
    {id:'shipping',name:'Household Goods Shipment',points:190,market:2882,cashCost:9130},
    {id:'flights',name:'Final Trip Airfare (family of 4)',points:15,market:6542,cashCost:721},
    {id:'car',name:'Rental Car 15 days',points:15,market:1050,cashCost:721},
    {id:'homefind',name:'Home Finding Trip (3 days)',points:35,market:1000,cashCost:1682},
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
  html+='<p class="tx tm mb2">Tick services you want. Remaining points convert to cash at $31 USD/point.</p>';
  html+='<div class="table-wrap"><table><tr><th>Use?</th><th>Service</th><th>Points</th><th>Cash Cost<br>(off $14,900)</th><th>Est. Value</th><th>Actual Cost<br>(if you find it)</th><th>Saving</th></tr>';
  services.forEach(function(s){
    var checked=selected[s.id];
    var verdict=s.market>(s.points*31*1.55)?'<span style="color:var(--green)">✅ Good value</span>':'<span style="color:var(--red)">❌ Take cash</span>';
    var actualCost=(state.pointsActual||{})[s.id]||0;var effectiveMarket=actualCost||s.market;var saving=effectiveMarket-s.cashCost;html+='<tr'+(checked?' style="background:rgba(34,197,94,.08)"':'')+'><td><input type="checkbox" '+(checked?'checked':'')+' onchange="togglePoint(this.checked,\''+s.id+'\')"></td><td style="font-weight:600">'+s.name+'</td><td>'+s.points+' pts<br><span class="tx tm">($'+s.cashCost.toLocaleString()+' AUD)</span></td><td>-$'+s.cashCost.toLocaleString()+' (£'+Math.round(s.cashCost*0.532).toLocaleString()+')</td><td>~$'+s.market.toLocaleString()+' (£'+Math.round(s.market*0.532).toLocaleString()+')</td><td><input type="number" class="ism" value="'+(actualCost||'')+'" placeholder="$" onchange="savePointsActual(\''+s.id+'\',+this.value);renderMoney()"></td><td style="color:'+(saving>0?'var(--green)':'var(--red)')+'">$'+(saving>0?'+':'')+saving.toLocaleString()+' (£'+(saving>0?'+':'')+Math.round(saving*0.532).toLocaleString()+')</td></tr>';
  });
  html+='</table></div>';
  
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
      <div class="stab ${moneySub==='costs'?'active':''}" onclick="moneySub='costs';renderMoney()">Costs</div>
      <div class="stab ${moneySub==='uk'?'active':''}" onclick="moneySub='uk';renderMoney()">UK Costs</div>
    </div>
    <div id="moneySub"></div>`;
  ({overview:moneyOverview,costs:moneyCosts,uk:moneyUK})[moneySub]?.();
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
  
  // Dynamic calculations from actual data
  var debts=getDebts();
  var debtTotal=debts.reduce(function(s,d){return s+d.left},0); // remaining debt in GBP
  var debtAud=Math.round(debtTotal*1.88);
  
  // Calculate costs by funding source from FORECAST_ITEMS
  var coSep=['co_visa','co_flights','co_temp','co_tax','sep_car','sep_furniture','sep_util'];
  var ukPrepCosts=0;var auSetupCosts=0;
  FORECAST_ITEMS.forEach(function(i){
    if(coSep.indexOf(i.id)>=0)return;
    var fund=(state.funding||{})[i.id]||i.defaultFund||'lump_sum';
    var amt=state.actuals[i.id]!=null?state.actuals[i.id]:(state.forecasts&&state.forecasts[i.id]?state.forecasts[i.id]:i.forecast);
    if(fund==='uk_wages')ukPrepCosts+=amt;
    else if(fund==='lump_sum')auSetupCosts+=amt;
  });
  // totalCosts calculated from costLines below
  
  // Income - use state values so user can edit
  var savings=state.savings||0;
  var carSale2=state.carSale2||Math.round(14000*1.88);
  var carSale1=state.carSale1||Math.round(3900*1.88);
  var homeSales=state.homeSales||Math.round(1500*1.88);
  var wagesSaved=state.wagesSaved||Math.round(1000*1.88);
  var pointsCash=budget;
  // totalIncome calculated from incomeLines below
  // netPosition calculated after rendering sections
  
  var html='<div style="background:rgba(59,130,246,.08);padding:6px 12px;border-radius:8px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;font-size:.75rem"><span>💱 Live rate: <strong>$1 AUD = £0.532</strong> | £1 = $1.88 AUD | $1 USD = $1.55 AUD</span><span id="fxLive" class="tm">fetching...</span></div>';
  fetch("https://api.exchangerate-api.com/v4/latest/AUD").then(function(r){return r.json()}).then(function(d){var el=document.getElementById("fxLive");if(el)el.textContent="Live: £"+d.rates.GBP.toFixed(4)}).catch(function(){var el=document.getElementById("fxLive");if(el)el.textContent=""});
  html+=renderPointsAllocator();
  
  html+='<div style="display:flex;flex-direction:column;gap:10px;margin-top:16px">';
  
  // COSTS
  html+='<div class="card" style="margin:0;padding:12px"><h3 style="font-size:.9rem;color:var(--orange)">📤 Forecast Costs</h3>';
  html+='<div style="display:flex;flex-direction:column;gap:6px">';
  // Core costs - all shown as £ with ($) since Mike thinks in £
  var coreCosts=[
    {name:'Debts to clear',aud:debtAud,gbp:debtTotal},
    {name:'UK property prep',aud:ukPrepCosts,gbp:Math.round(ukPrepCosts*0.532)},
    {name:'AU setup (bond, ship, dog)',aud:auSetupCosts,gbp:Math.round(auSetupCosts*0.532)}
  ];
  var extraCosts=state.extraCosts||[];
  var costTotal=0;
  coreCosts.forEach(function(item){
    costTotal+=item.aud;
    html+='<div style="background:rgba(239,68,68,.08);padding:8px 12px;border-radius:8px;display:flex;align-items:center;gap:8px"><span style="flex:2;font-size:.8rem">'+item.name+'</span><strong style="min-width:80px;text-align:right;font-size:.85rem">\u00a3'+item.gbp.toLocaleString()+' <span style="font-size:.7rem;color:var(--muted)">($'+item.aud.toLocaleString()+')</span></strong></div>';
  });
  extraCosts.forEach(function(item,idx){
    var aud=item.currency==='gbp'?Math.round(item.amount*1.88):item.amount;
    costTotal+=aud;
    var conv=item.currency==='gbp'?'($'+aud.toLocaleString()+')':'(\u00a3'+Math.round(item.amount*0.532).toLocaleString()+')';
    var sym=item.currency==='gbp'?'\u00a3':'$';
    html+='<div style="background:rgba(239,68,68,.08);padding:8px 12px;border-radius:8px;display:flex;align-items:center;gap:8px"><input type="text" value="'+item.name+'" style="flex:2;min-width:120px;background:transparent;border:none;border-bottom:1px dashed rgba(255,255,255,.2);color:var(--text);font-size:.8rem;padding:2px 0" onchange="state.extraCosts['+idx+'].name=this.value;save()"><span style="font-size:.75rem">'+sym+'</span><input type="number" value="'+item.amount+'" style="flex:1;max-width:80px;text-align:right;font-weight:600;font-size:.85rem" onchange="state.extraCosts['+idx+'].amount=+this.value;save();renderMoney()"><span style="font-size:.7rem;color:var(--muted);min-width:60px;text-align:right">'+conv+'</span><button class="btn btn-o" style="padding:2px 6px;color:var(--red);font-size:.7rem" onclick="state.extraCosts.splice('+idx+',1);save();renderMoney()">\u2715</button></div>';
  });
  if(pointsMarketCost>0){costTotal-=pointsMarketCost;html+='<div style="background:rgba(34,197,94,.1);padding:8px 12px;border-radius:8px;display:flex;justify-content:space-between;align-items:center;color:var(--green)"><span>Covered by points</span><strong>-'+fG(pointsMarketCost)+'</strong></div>';}
  html+='<div style="display:flex;gap:4px;margin-top:4px"><input type="text" id="newCostName" placeholder="+ Add cost..." style="flex:1;font-size:.75rem"><select id="newCostCur" style="font-size:.7rem"><option value="gbp">£</option><option value="aud">$</option></select><input type="number" id="newCostAmt" placeholder="Amount" style="width:70px;font-size:.75rem"><button class="btn btn-o" style="padding:2px 8px;font-size:.7rem" onclick="addCostLine()">+</button></div>';
  html+='<div style="background:var(--card2);padding:10px 12px;border-radius:8px;display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:.9rem"><span>TOTAL COSTS</span><span style="color:var(--orange)">\u00a3'+Math.round(costTotal*0.532).toLocaleString()+' ($'+costTotal.toLocaleString()+')</span></div>';
  html+='</div></div>';
  
  // INCOME
  html+='<div class="card" style="margin:0;padding:12px"><h3 style="font-size:.9rem;color:var(--green)">📥 Forecast Income</h3>';
  html+='<div style="display:flex;flex-direction:column;gap:6px">';
  var incomeLines=state.incomeLines||[
    {name:'Car sale 2',amount:14000,currency:'gbp'},
    {name:'Car sale 1',amount:3900,currency:'gbp'},
    {name:'Home item sales',amount:1500,currency:'gbp'},
    {name:'Wages saved',amount:1000,currency:'gbp'},
    {name:'Savings',amount:0,currency:'gbp'}
  ];
  if(!state.incomeLines){state.incomeLines=incomeLines;save()}
  var incomeTotal=0;
  incomeLines.forEach(function(item,idx){
    var aud=item.currency==='gbp'?Math.round(item.amount*1.88):item.amount;
    incomeTotal+=aud;
    var conv=item.currency==='gbp'?'($'+aud.toLocaleString()+')':'(\u00a3'+Math.round(item.amount*0.532).toLocaleString()+')';
    var sym=item.currency==='gbp'?'\u00a3':'$';
    html+='<div style="background:rgba(34,197,94,.08);padding:8px 12px;border-radius:8px;display:flex;align-items:center;gap:8px"><input type="text" value="'+item.name+'" style="flex:2;min-width:120px;background:transparent;border:none;border-bottom:1px dashed rgba(255,255,255,.2);color:var(--text);font-size:.8rem;padding:2px 0" onchange="state.incomeLines['+idx+'].name=this.value;save()"><span style="font-size:.75rem">'+sym+'</span><input type="number" value="'+item.amount+'" style="flex:1;max-width:80px;text-align:right;font-weight:600;font-size:.85rem" onchange="state.incomeLines['+idx+'].amount=+this.value;save();renderMoney()"><span style="font-size:.7rem;color:var(--muted);min-width:60px;text-align:right">'+conv+'</span><button class="btn btn-o" style="padding:2px 6px;color:var(--red);font-size:.7rem" onclick="state.incomeLines.splice('+idx+',1);save();renderMoney()">\u2715</button></div>';
  });
  html+='<div style="background:rgba(59,130,246,.08);padding:8px 12px;border-radius:8px;display:flex;justify-content:space-between;align-items:center"><span>Points cash</span><strong>'+fG(pointsCash)+'</strong></div>';
  incomeTotal+=pointsCash;
  html+='<div style="display:flex;gap:4px;margin-top:4px"><input type="text" id="newIncomeName" placeholder="+ Add income..." style="flex:1;font-size:.75rem"><select id="newIncomeCur" style="font-size:.7rem"><option value="gbp">£</option><option value="aud">$</option></select><input type="number" id="newIncomeAmt" placeholder="Amount" style="width:70px;font-size:.75rem"><button class="btn btn-o" style="padding:2px 8px;font-size:.7rem" onclick="addIncomeLine()">+</button></div>';
  html+='<div style="background:var(--card2);padding:10px 12px;border-radius:8px;display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:.9rem"><span>TOTAL INCOME</span><span style="color:var(--green)">\u00a3'+Math.round(incomeTotal*0.532).toLocaleString()+' ($'+incomeTotal.toLocaleString()+')</span></div>';
  html+='</div></div>';
  
  // POINTS
  html+='<div class="card" style="margin:0;padding:12px"><h3 style="font-size:.9rem;color:var(--accent)">🎯 Points Summary</h3>';
  html+='<div style="display:flex;flex-direction:column;gap:6px">';
  if(selectedServices.temp30)html+='<div style="background:rgba(59,130,246,.08);padding:8px 12px;border-radius:8px;display:flex;justify-content:space-between;align-items:center"><span>✅ Housing 30 days</span><strong>'+fG(3600)+'</strong></div>';
  if(selectedServices.temp45)html+='<div style="background:rgba(59,130,246,.08);padding:8px 12px;border-radius:8px;display:flex;justify-content:space-between;align-items:center"><span>✅ Housing 45 days</span><strong>'+fG(5400)+'</strong></div>';
  if(selectedServices.temp60)html+='<div style="background:rgba(59,130,246,.08);padding:8px 12px;border-radius:8px;display:flex;justify-content:space-between;align-items:center"><span>✅ Housing 60 days</span><strong>'+fG(7200)+'</strong></div>';
  if(selectedServices.shipping)html+='<div style="background:rgba(59,130,246,.08);padding:8px 12px;border-radius:8px;display:flex;justify-content:space-between;align-items:center"><span>✅ Shipping</span><strong>'+fG(2882)+'</strong></div>';
  if(selectedServices.flights)html+='<div style="background:rgba(59,130,246,.08);padding:8px 12px;border-radius:8px;display:flex;justify-content:space-between;align-items:center"><span>✅ Flights</span><strong>'+fG(6542)+'</strong></div>';
  if(selectedServices.car)html+='<div style="background:rgba(59,130,246,.08);padding:8px 12px;border-radius:8px;display:flex;justify-content:space-between;align-items:center"><span>✅ Rental car</span><strong>'+fG(1050)+'</strong></div>';
  if(selectedServices.homefind)html+='<div style="background:rgba(59,130,246,.08);padding:8px 12px;border-radius:8px;display:flex;justify-content:space-between;align-items:center"><span>✅ Home finding</span><strong>'+fG(1000)+'</strong></div>';
  if(!Object.values(selectedServices).some(function(v){return v}))html+='<div style="background:var(--card2);padding:8px 12px;border-radius:8px;text-align:center;color:var(--muted)">No services selected yet</div>';
  html+='<div style="background:var(--card2);padding:10px 12px;border-radius:8px;display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:.9rem"><span>Services value</span><span style="color:var(--accent)">'+fG(pointsMarketCost)+'</span></div>';
  html+='<div style="background:var(--card2);padding:10px 12px;border-radius:8px;display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:.9rem"><span>Cash remaining</span><span style="color:var(--green)">'+fG(pointsCash)+'</span></div>';
  html+='</div></div>';
  
  html+='</div>';
  
  // NET POSITION - calculate from rendered totals
  var netPosition=incomeTotal-(costTotal>0?costTotal:0);
  html+='<div class="card mt2" style="text-align:center;border-left:4px solid '+(netPosition>=0?'var(--green)':'var(--red)')+'"><h3>Net Position: <span style="color:'+(netPosition>=0?'var(--green)':'var(--red)')+'">\u00a3'+Math.round(Math.abs(netPosition)*0.532).toLocaleString()+' ($'+Math.abs(netPosition).toLocaleString()+')</span></h3>';
  html+='<p class="tx tm">'+(netPosition>=0?'✅ Fully funded — surplus of '+fG(netPosition):'⚠️ Shortfall of '+fG(Math.abs(netPosition)))+'</p></div>';

  
  document.getElementById('moneySub').innerHTML=html;
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
  html+='<p class="tx tm mb2">Total: '+fG(ukItems.reduce(function(s,i){return s+i.forecast},0))+' — funded from UK wages</p>';
  html+='<div class="table-wrap"><table><tr><th>Item</th><th>Forecast ($)</th><th>Actual ($)</th><th></th></tr>';
  ukItems.forEach(function(i){html+=costRow(i)});
  html+='</table></div></div>';
  
  // AU SETUP
  html+='<div class="card"><h2>🦘 AU Setup Costs</h2>';
  html+='<p class="tx tm mb2">Total: '+fG(auItems.reduce(function(s,i){return s+i.forecast},0))+' — funded from relo cash</p>';
  html+='<div class="table-wrap"><table><tr><th>Item</th><th>Forecast ($)</th><th>Actual ($)</th><th></th></tr>';
  auItems.forEach(function(i){html+=costRow(i)});
  html+='</table></div></div>';
  
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
restoreCustomItems();updateHeader();planSub='thisweek';renderPlanNew();

// ===== PLAN (Combined: Phases + Tasks + To-Do) =====
var planSub='thisweek';
function renderPlanNew(){
  updateHeader();
  var el=document.getElementById('plan');
  if(!el)return;
  var cw=curWk();
  var thisWk=CHECKLIST.filter(function(c){return c.week===cw&&!state.checked[c.id]});
  var overdue=CHECKLIST.filter(function(c){return c.week<cw&&!state.checked[c.id]});
  var pct=pctDone();
  el.innerHTML='<div class="sg"><div class="sb '+(pct>75?'green':pct>40?'yellow':'red')+'"><div class="l">Done</div><div class="v">'+pct+'%</div></div><div class="sb yellow"><div class="l">Overdue</div><div class="v">'+overdue.length+'</div></div><div class="sb blue"><div class="l">This Week</div><div class="v">'+thisWk.length+'</div></div><div class="sb blue"><div class="l">Week</div><div class="v">'+cw+'</div></div></div><div class="stabs"><div class="stab '+(planSub==='thisweek'?'active':'')+'" onclick="planSub=\'thisweek\';renderPlanNew()">⚡ This Week</div><div class="stab '+(planSub==='phase1'?'active':'')+'" onclick="planSub=\'phase1\';renderPlanNew()">🔵 P1</div><div class="stab '+(planSub==='phase2'?'active':'')+'" onclick="planSub=\'phase2\';renderPlanNew()">🟠 P2</div><div class="stab '+(planSub==='phase3'?'active':'')+'" onclick="planSub=\'phase3\';renderPlanNew()">🟡 P3</div><div class="stab '+(planSub==='phase4'?'active':'')+'" onclick="planSub=\'phase4\';renderPlanNew()">🟢 P4</div><div class="stab '+(planSub==='todo'?'active':'')+'" onclick="planSub=\'todo\';renderPlanNew()">📌 To-Do</div></div><div id="planSub"></div>';
  if(planSub==='thisweek')planThisWeek(cw,thisWk,overdue);
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
  var todos=state.todos||[];
  var html='<div class="card"><h2>📌 To-Do List</h2><div class="flex g2 fw aic mb2"><input type="text" id="todoText" placeholder="What needs doing?" style="flex:1;min-width:200px" onkeydown="if(event.key===\'Enter\')addTodo()"><select id="todoCat" style="max-width:140px"><option>General</option><option>House Repairs</option><option>Packing</option><option>Admin</option><option>Shopping</option><option>Kids</option></select><select id="todoPri" style="max-width:100px"><option value="med">Medium</option><option value="high">High</option><option value="low">Low</option></select><button class="btn btn-p" onclick="addTodo()">+ Add</button></div>';
  if(todos.length){todos.forEach(function(t,i){var pri=t.pri==='high'?'🔴':t.pri==='low'?'🟢':'🟡';html+='<div class="ci'+(t.done?' done':'')+'"><input type="checkbox" '+(t.done?'checked':'')+' onchange="state.todos['+i+'].done=!state.todos['+i+'].done;save();renderPlanNew()"><div class="ct">'+pri+' '+t.text+'<div class="cm">'+t.cat+'</div></div><button class="btn btn-o" style="padding:2px 6px" onclick="state.todos.splice('+i+',1);save();renderPlanNew()">✕</button></div>';});}else{html+='<p class="tm ts">No to-dos yet.</p>';}
  html+='</div>';
  document.getElementById('planSub').innerHTML=html;
}
