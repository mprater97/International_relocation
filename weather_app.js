// ===== COMPUTED STATS =====
var temps=D.filter(function(d){return d.max!=null});
var maxT=Math.max.apply(null,temps.map(function(d){return d.max}));
var minT=Math.min.apply(null,temps.map(function(d){return d.min}));
var avgMax=(temps.reduce(function(s,d){return s+d.max},0)/temps.length).toFixed(1);
var avgMin=(temps.reduce(function(s,d){return s+d.min},0)/temps.length).toFixed(1);
var totalRain=D.reduce(function(s,d){return s+(d.rain||0)},0).toFixed(0);
var rainDays=D.filter(function(d){return d.rain>0}).length;
var dryDays=D.filter(function(d){return d.rain===0}).length;
var sunData=D.filter(function(d){return d.sun_hours});
var avgSun=(sunData.reduce(function(s,d){return s+d.sun_hours},0)/sunData.length).toFixed(1);
var seaD=D.filter(function(d){return d.sea_temp!=null});
var avgSea=seaD.length?(seaD.reduce(function(s,d){return s+d.sea_temp},0)/seaD.length).toFixed(1):'?';
var swimDays=seaD.filter(function(d){return d.sea_temp>=18}).length;
var beachDays=D.filter(function(d){return d.max>=25&&d.rain===0}).length;
var perfectDays=D.filter(function(d){return d.max>=22&&d.max<=28&&d.rain===0&&d.cloud!=null&&d.cloud<50}).length;
var tshirtDays=D.filter(function(d){return d.max>=20&&d.rain===0}).length;
var coatDays=D.filter(function(d){return d.max!=null&&d.max<15}).length;

// ===== HERO STATS =====
document.getElementById('heroStats').innerHTML=
'<div class="hero-card"><div class="emoji">☀️</div><div class="val" style="color:#fbbf24">'+avgSun+'h</div><div class="lbl">Sun per day</div></div>'+
'<div class="hero-card"><div class="emoji">🏖️</div><div class="val" style="color:#f59e0b">'+beachDays+'</div><div class="lbl">Beach days</div></div>'+
'<div class="hero-card"><div class="emoji">👕</div><div class="val" style="color:#22c55e">'+tshirtDays+'</div><div class="lbl">T-shirt days</div></div>'+
'<div class="hero-card"><div class="emoji">🌧️</div><div class="val" style="color:#06b6d4">'+dryDays+'</div><div class="lbl">Dry days</div></div>'+
'<div class="hero-card"><div class="emoji">🌊</div><div class="val" style="color:#0ea5e9">'+swimDays+'</div><div class="lbl">Swim days</div></div>'+
'<div class="hero-card"><div class="emoji">🌡️</div><div class="val" style="color:#ef4444">'+avgMax+'°</div><div class="lbl">Avg high</div></div>';

// ===== TABS =====
function showWTab(id,btn){
  document.querySelectorAll('.wtab').forEach(function(t){t.classList.remove('active')});
  document.querySelectorAll('.wpanel').forEach(function(p){p.classList.remove('active')});
  document.getElementById(id).classList.add('active');
  btn.classList.add('active');
  if(id==='charts'&&!window._chartsRendered)renderCharts();
}

// ===== FAMILY VIEW =====
(function renderFamily(){
  var html='';
  
  // Seasons
  html+='<div class="section"><div class="section-title">🌏 The Four Seasons</div>';
  html+='<div class="seasons">';
  html+='<div class="season-card summer"><h3>☀️ Summer (Dec–Feb)</h3><div class="temps">🌡️ Highs: <strong>25–35°C</strong> · Lows: 14–20°C</div><div class="activities">🏖️ Beach every day · 🏊 Ocean swimming (20°C+) · 🌅 Long evenings (sunset 8:45pm) · 🍦 Ice cream at the pier · 🎄 Christmas on the beach · 🏕️ Camping trips · 🚴 Bike rides at sunset<br><br>⚡ <strong>Reality:</strong> A few 35°+ scorchers ('+D.filter(function(d){return d.max>=35}).length+' days this year). Stay inside with AC, hit the beach at 5pm when it cools.</div></div>';
  html+='<div class="season-card autumn"><h3>🍂 Autumn (Mar–May)</h3><div class="temps">🌡️ Highs: <strong>18–26°C</strong> · Lows: 10–16°C</div><div class="activities">🍁 Beautiful colours · ☕ Perfect cafe weather · 🏈 AFL season starts · 🎃 Mild & sunny · 🚶 Bush walks · 🍷 Yarra Valley wineries · 🌤️ Still warm enough for beach<br><br>⚡ <strong>Reality:</strong> Best kept secret — often the nicest months. Warm days, cool nights, less wind than spring.</div></div>';
  html+='<div class="season-card winter"><h3>❄️ Winter (Jun–Aug)</h3><div class="temps">🌡️ Highs: <strong>13–16°C</strong> · Lows: 4–9°C</div><div class="activities">🧥 Coat weather · ☕ Hot chocolate season · 🎬 Movie nights · 🏔️ Snow trips (2hrs away) · 🍜 Pho & ramen · 🏉 AFL finals · 🌧️ Some rainy days<br><br>⚡ <strong>Reality:</strong> Like a mild UK autumn. Coldest night this year: '+minT+'°C. No snow in the city. Frost is rare ('+D.filter(function(d){return d.min!=null&&d.min<=0}).length+' days).</div></div>';
  html+='<div class="season-card spring"><h3>🌸 Spring (Sep–Nov)</h3><div class="temps">🌡️ Highs: <strong>18–24°C</strong> · Lows: 8–14°C</div><div class="activities">🌺 Gardens blooming · 🏇 Melbourne Cup · 🌤️ Warming up · 🏖️ First beach days · 🌊 Sea warming · 🎭 Festival season · 🌈 Changeable (4 seasons in 1 day!)<br><br>⚡ <strong>Reality:</strong> Most variable season. Can be 25° one day, 15° the next. Always have a jacket handy.</div></div>';
  html+='</div></div>';
  
  // What does a typical day look like?
  html+='<div class="section"><div class="section-title">📅 What Does a Typical Day Look Like?</div>';
  html+='<div class="daily-vibe">';
  html+='<div class="vibe-item"><div class="num" style="color:#22c55e">'+perfectDays+'</div><div class="desc">Perfect days<br>(22-28°, sunny)</div></div>';
  html+='<div class="vibe-item"><div class="num" style="color:#fbbf24">'+tshirtDays+'</div><div class="desc">T-shirt days<br>(20°+, dry)</div></div>';
  html+='<div class="vibe-item"><div class="num" style="color:#f59e0b">'+beachDays+'</div><div class="desc">Beach days<br>(25°+, dry)</div></div>';
  html+='<div class="vibe-item"><div class="num" style="color:#60a5fa">'+coatDays+'</div><div class="desc">Coat days<br>(under 15°)</div></div>';
  html+='<div class="vibe-item"><div class="num" style="color:#06b6d4">'+D.filter(function(d){return d.rain>=5}).length+'</div><div class="desc">Umbrella days<br>(5mm+ rain)</div></div>';
  html+='<div class="vibe-item"><div class="num" style="color:#ef4444">'+D.filter(function(d){return d.max>=32}).length+'</div><div class="desc">AC days<br>(32°+ hot)</div></div>';
  html+='</div></div>';
  
  // vs Scotland comparison
  html+='<div class="section"><div class="section-title">🏴󠁧󠁢󠁳󠁣󠁴󠁿 vs 🇦🇺 How Does It Compare to Scotland?</div>';
  html+='<div class="compare"><table>';
  html+='<tr><th></th><th>Melbourne</th><th>Scotland</th><th>Winner</th></tr>';
  html+='<tr><td>☀️ Sunshine hours/year</td><td><strong>'+Math.round(sunData.reduce(function(s,d){return s+d.sun_hours},0))+'h</strong></td><td>~1,250h</td><td class="winner">🇦🇺 +'+Math.round(sunData.reduce(function(s,d){return s+d.sun_hours},0)-1250)+'h</td></tr>';
  html+='<tr><td>🌧️ Rain days/year</td><td><strong>'+rainDays+'</strong></td><td>~185</td><td class="winner">🇦🇺 '+(185-rainDays)+' fewer</td></tr>';
  html+='<tr><td>🏖️ Beach days (25°+)</td><td><strong>'+beachDays+'</strong></td><td>~1–3</td><td class="winner">🇦🇺 '+beachDays+' vs ~2</td></tr>';
  html+='<tr><td>🌊 Swimmable ocean</td><td><strong>'+swimDays+' days</strong> (18°+)</td><td>0 days (sea peaks ~13°C)</td><td class="winner">🇦🇺 Ocean swimming!</td></tr>';
  html+='<tr><td>❄️ Frost days</td><td><strong>'+D.filter(function(d){return d.min!=null&&d.min<=0}).length+'</strong></td><td>~70</td><td class="winner">🇦🇺 Almost none</td></tr>';
  html+='<tr><td>🌡️ Winter high</td><td><strong>14°C avg</strong></td><td>5–6°C avg</td><td class="winner">🇦🇺 Nearly 3x warmer</td></tr>';
  html+='<tr><td>🌡️ Summer high</td><td><strong>25°C avg</strong></td><td>17°C avg</td><td class="winner">🇦🇺 Proper summer</td></tr>';
  html+='<tr><td>🔥 Hot days (30°+)</td><td><strong>'+D.filter(function(d){return d.max>=30}).length+'</strong></td><td>0</td><td style="color:#f59e0b">🇦🇺 (need AC)</td></tr>';
  html+='<tr><td>🌫️ Grey days (80%+ cloud)</td><td><strong>'+D.filter(function(d){return d.cloud!=null&&d.cloud>=80}).length+'</strong></td><td>~230</td><td class="winner">🇦🇺 Way less grey</td></tr>';
  html+='<tr><td>🌅 Daylight (winter)</td><td><strong>~10h</strong></td><td>~7h</td><td class="winner">🇦🇺 3h more light</td></tr>';
  html+='<tr><td>❄️ Snow days</td><td><strong>0</strong></td><td>~15–20</td><td class="winner">🇦🇺 No disruption</td></tr>';
  html+='</table></div></div>';
  
  // Family activities by season
  html+='<div class="section"><div class="section-title">🎯 What The Kids Will Love</div>';
  html+='<div style="background:rgba(255,255,255,.04);border-radius:14px;padding:16px;border:1px solid rgba(255,255,255,.08);font-size:.82rem;line-height:2">';
  html+='<div>🏖️ <strong>Beach after school</strong> — warm enough Oct–Apr (7 months!)</div>';
  html+='<div>🛹 <strong>Skateparks year-round</strong> — even winter is mild enough</div>';
  html+='<div>🏊 <strong>Ocean swimming</strong> — '+swimDays+' days the sea is 18°+ (Dec–Apr)</div>';
  html+='<div>🚴 <strong>Bike rides</strong> — flat coastal paths, dry most days</div>';
  html+='<div>🌅 <strong>Summer sunsets at 8:45pm</strong> — long evenings outside</div>';
  html+='<div>🏕️ <strong>Camping & bush walks</strong> — autumn is perfect (20–25°, no bugs)</div>';
  html+='<div>⛷️ <strong>Snow trips</strong> — Mt Buller 2.5hrs away (Jun–Sep)</div>';
  html+='<div>🎄 <strong>Christmas on the beach</strong> — 25°C on Dec 25 this year!</div>';
  html+='</div></div>';
  
  document.getElementById('family').innerHTML=html;
})();

// ===== MONTHLY VIEW =====
(function renderMonths(){
  var months={};
  D.forEach(function(d){
    var m=d.date.substring(0,7);
    if(!months[m])months[m]={mx:[],mn:[],rain:0,sun:[],sea:[],days:0};
    if(d.max!=null)months[m].mx.push(d.max);
    if(d.min!=null)months[m].mn.push(d.min);
    months[m].rain+=d.rain||0;
    if(d.sun_hours)months[m].sun.push(d.sun_hours);
    if(d.sea_temp!=null)months[m].sea.push(d.sea_temp);
    months[m].days++;
  });
  var mns=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var emojis=['🏖️','🏖️','🍂','🍂','🍂','❄️','❄️','❄️','🌸','🌸','🌸','🏖️'];
  
  var html='<div class="section"><div class="section-title">📅 Month by Month</div>';
  html+='<div class="monthly">';
  Object.keys(months).sort().forEach(function(m){
    var d=months[m];
    var mi=parseInt(m.split('-')[1])-1;
    var mx=d.mx.length?Math.round(d.mx.reduce(function(a,b){return a+b},0)/d.mx.length):'?';
    var mn=d.mn.length?Math.round(d.mn.reduce(function(a,b){return a+b},0)/d.mn.length):'?';
    var sun=d.sun.length?(d.sun.reduce(function(a,b){return a+b},0)/d.sun.length).toFixed(1):'?';
    var sea=d.sea.length?Math.round(d.sea.reduce(function(a,b){return a+b},0)/d.sea.length):'?';
    html+='<div class="mo-card"><div class="month">'+emojis[mi]+' '+mns[mi]+'</div>';
    html+='<div class="hot">'+mx+'°</div>';
    html+='<div class="cold">'+mn+'°</div>';
    html+='<div class="rain">💧'+Math.round(d.rain)+'mm</div>';
    html+='<div class="sun">☀️'+sun+'h</div>';
    html+='<div style="color:#0ea5e9">🌊'+sea+'°</div>';
    html+='</div>';
  });
  html+='</div></div>';
  
  // What to wear each month
  html+='<div class="section"><div class="section-title">👕 What to Wear</div>';
  html+='<div style="background:rgba(255,255,255,.04);border-radius:14px;padding:16px;border:1px solid rgba(255,255,255,.08);font-size:.78rem;line-height:2.2">';
  html+='<div>🏖️ <strong>Dec–Feb:</strong> Shorts, t-shirt, sunnies, sunscreen. Hat essential. Light dress for evenings.</div>';
  html+='<div>🍂 <strong>Mar–May:</strong> Jeans + t-shirt most days. Light jacket for evenings. Still warm enough for shorts some days.</div>';
  html+='<div>❄️ <strong>Jun–Aug:</strong> Jeans, jumper, jacket. Scarf on cold mornings. NOT as cold as UK — no heavy winter coat needed.</div>';
  html+='<div>🌸 <strong>Sep–Nov:</strong> Layers! Can be warm or cool. T-shirt + jacket you can remove. "4 seasons in 1 day" is real.</div>';
  html+='</div></div>';
  
  document.getElementById('months').innerHTML=html;
})();

// ===== CHARTS =====
function renderCharts(){
  window._chartsRendered=true;
  var labels=D.map(function(d){return d.date});
  
  var html='<div class="section"><div class="section-title">🌡️ Temperature — Full Year</div>';
  html+='<div class="chart-box"><canvas id="tempChart"></canvas></div></div>';
  html+='<div class="section"><div class="section-title">☀️ Sunshine Hours</div>';
  html+='<div class="chart-box"><canvas id="sunChart"></canvas></div></div>';
  html+='<div class="section"><div class="section-title">🌊 Sea Temperature (Port Phillip Bay)</div>';
  html+='<div class="chart-box"><canvas id="seaChart"></canvas></div></div>';
  document.getElementById('charts').innerHTML=html;
  
  setTimeout(function(){
    new Chart(document.getElementById('tempChart'),{type:'line',data:{labels:labels,datasets:[
      {label:'High',data:D.map(function(d){return d.max}),borderColor:'#ef4444',backgroundColor:'rgba(239,68,68,.08)',fill:'+1',borderWidth:1.5,pointRadius:0,tension:.3},
      {label:'Low',data:D.map(function(d){return d.min}),borderColor:'#60a5fa',fill:false,borderWidth:1.5,pointRadius:0,tension:.3},
      {label:'Rain mm',data:D.map(function(d){return d.rain}),type:'bar',backgroundColor:'rgba(6,182,212,.4)',yAxisID:'r',barThickness:2}
    ]},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{labels:{font:{size:11},color:'#94a3b8'}}},scales:{x:{ticks:{maxTicksLimit:12,font:{size:9},color:'#475569'},grid:{color:'rgba(255,255,255,.03)'}},y:{title:{display:true,text:'°C',color:'#64748b'},ticks:{color:'#64748b'},grid:{color:'rgba(255,255,255,.04)'}},r:{position:'right',title:{display:true,text:'mm',color:'#64748b'},ticks:{color:'#64748b'},grid:{display:false},min:0}}}});
    
    new Chart(document.getElementById('sunChart'),{type:'bar',data:{labels:labels,datasets:[
      {data:D.map(function(d){return d.sun_hours}),backgroundColor:D.map(function(d){return d.sun_hours>=10?'rgba(251,191,36,.7)':d.sun_hours>=6?'rgba(251,191,36,.4)':'rgba(148,163,184,.3)'}),borderRadius:2,barThickness:2}
    ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{maxTicksLimit:12,font:{size:9},color:'#475569'},grid:{display:false}},y:{title:{display:true,text:'Hours',color:'#64748b'},ticks:{color:'#64748b'},grid:{color:'rgba(255,255,255,.04)'},min:0,max:16}}}});
    
    new Chart(document.getElementById('seaChart'),{type:'line',data:{labels:labels,datasets:[
      {data:D.map(function(d){return d.sea_temp}),borderColor:'#0ea5e9',backgroundColor:'rgba(14,165,233,.12)',fill:true,borderWidth:2,pointRadius:0,tension:.4},
      {data:D.map(function(){return 18}),borderColor:'rgba(34,197,94,.4)',borderWidth:1,borderDash:[4,4],pointRadius:0,fill:false,label:'Swimmable (18°C)'}
    ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{font:{size:11},color:'#94a3b8'}}},scales:{x:{ticks:{maxTicksLimit:12,font:{size:9},color:'#475569'},grid:{display:false}},y:{title:{display:true,text:'°C',color:'#64748b'},ticks:{color:'#64748b'},grid:{color:'rgba(255,255,255,.04)'},min:10,max:24}}}});
  },50);
}

// ===== HONEST VIEW =====
(function renderHonest(){
  var html='';
  html+='<div class="section"><div class="section-title">🤝 The Full Picture — No Sugar Coating</div>';
  
  html+='<div class="truth" style="margin-bottom:16px"><h3>🔥 The Hot Days</h3><ul>';
  html+='<li><strong>'+D.filter(function(d){return d.max>=35}).length+' days over 35°C</strong> this year — genuinely hot. You need AC.</li>';
  html+='<li><strong>'+D.filter(function(d){return d.max>=40}).length+' days over 40°C</strong> — extreme heat. Stay inside, drink water, check on neighbours.</li>';
  html+='<li>Hottest day: <strong>'+maxT+'°C</strong> — hotter than anything in the UK, ever.</li>';
  html+='<li>Hot days come in bursts (2-3 days) then a cool change blows through.</li>';
  html+='<li>UV is INTENSE — sunscreen is non-negotiable, even on cloudy days.</li>';
  html+='</ul></div>';
  
  html+='<div class="truth" style="margin-bottom:16px;border-color:rgba(6,182,212,.2);background:rgba(6,182,212,.04)"><h3 style="color:#67e8f9">🌧️ The Rain</h3><ul>';
  html+='<li><strong>'+rainDays+' rain days</strong> — but most are light. Only '+D.filter(function(d){return d.rain>=10}).length+' days had 10mm+.</li>';
  html+='<li>Total rainfall: '+totalRain+'mm — less than Edinburgh (700mm) or Glasgow (1,100mm).</li>';
  html+='<li>Rain is different here — often a quick shower then sun. Not all-day drizzle like UK.</li>';
  html+='<li>Wettest day: '+D.reduce(function(a,b){return(b.rain||0)>(a.rain||0)?b:a}).rain+'mm — that\'s a proper downpour.</li>';
  html+='</ul></div>';
  
  html+='<div class="truth" style="margin-bottom:16px;border-color:rgba(139,92,246,.2);background:rgba(139,92,246,.04)"><h3 style="color:#c4b5fd">💨 The Wind</h3><ul>';
  var windD=D.filter(function(d){return d.wind!=null});
  html+='<li><strong>'+windD.filter(function(d){return d.wind>=40}).length+' windy days</strong> (gusts 40km/h+) — Melbourne IS windy.</li>';
  html+='<li>Spring is worst for wind. Summer sea breezes are actually nice (cool you down).</li>';
  html+='<li>"Four seasons in one day" is a real thing — mostly in spring (Sep–Nov).</li>';
  html+='</ul></div>';
  
  html+='<div class="truth" style="border-color:rgba(59,130,246,.2);background:rgba(59,130,246,.04)"><h3 style="color:#93c5fd">❄️ The Cold</h3><ul>';
  html+='<li>Winter highs average <strong>14°C</strong> — like a UK October. Not brutal.</li>';
  html+='<li>Coldest night: <strong>'+minT+'°C</strong> — cold but not freezing.</li>';
  html+='<li>Only <strong>'+D.filter(function(d){return d.min!=null&&d.min<=0}).length+' frost days</strong> all year (UK gets ~55).</li>';
  html+='<li>No snow in the city. Ever. (Mountains 2hrs away if you want it.)</li>';
  html+='<li>Houses are NOT well insulated — winter indoors can feel colder than you\'d expect. Get a good heater.</li>';
  html+='</ul></div>';
  
  // Bottom line
  html+='<div style="background:rgba(34,197,94,.06);border-radius:14px;padding:16px;border:1px solid rgba(34,197,94,.15);margin-top:16px">';
  html+='<h3 style="color:#86efac;margin-bottom:8px">✅ Bottom Line</h3>';
  html+='<div style="font-size:.82rem;line-height:2">';
  html+='<div>• <strong>More outdoor days than the UK</strong> — significantly more sunshine and dry days</div>';
  html+='<div>• <strong>Winter is mild</strong> — you\'ll barely need a heavy coat</div>';
  html+='<div>• <strong>Summer is hot</strong> — but you have AC, beaches, and pools</div>';
  html+='<div>• <strong>The lifestyle shift is real</strong> — from indoor/grey to outdoor/active</div>';
  html+='<div>• <strong>UV is the main danger</strong> — not cold, not rain. Slip slop slap!</div>';
  html+='</div></div>';
  
  document.getElementById('honest').innerHTML=html;
})();
