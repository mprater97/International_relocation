function renderCompare(){
  document.getElementById('locations').innerHTML=
    '<div class="card" style="border-left:4px solid var(--accent)">'+
    '<h2>🏙️ Melbourne — Location Guide</h2>'+
    '<p class="ts tm">$159k salary | 4-bed with garden | Beach lifestyle</p>'+
    '<div class="stabs mt2">'+
    '<div class="stab active" onclick="showCmp(\'suburbs\',this)">🏘️ Suburbs</div>'+
    '<div class="stab" onclick="showCmp(\'costs\',this)">💰 Living Costs</div>'+
    
    '<div class="stab" onclick="showCmp(\'shortlist\',this)">⭐ Shortlist</div>'+
    '<div class="stab" onclick="showCmp(\'frankie\',this)">💼 Frankie</div>'+
    '<div class="stab" onclick="showCmp(\'sydney\',this)">🌊 vs Sydney</div>'+
    '</div></div><div id="cmpContent"></div>';
  showCmp('suburbs');
}
function showCmp(id,btn){
  if(btn){document.querySelectorAll('#locations .stab').forEach(function(s){s.classList.remove('active')});btn.classList.add('active')}
  if(id==='shortlist'){renderShortlist()}else if(id==='suburbs'){renderSuburbsInteractive()}else{document.getElementById('cmpContent').innerHTML=CMP[id]||'';}
}
var CMP={};

CMP.shortlist='';
function renderShortlist(){
  var areas=state.shortlist||[];
  var html='<div class="card"><h2>⭐ My Suburb Shortlist</h2><p class="tx tm mb2">Add areas, rate them, enter real prices. Score out of 5 for each feature.</p>';
  
  // Add new area form
  html+='<div class="flex g2 fw aic mb2"><input type="text" id="slName" placeholder="Suburb name" style="flex:1;min-width:150px"><input type="number" id="slRent" placeholder="Actual rent $/wk" style="max-width:130px"><input type="text" id="slLink" placeholder="Listing URL (optional)" style="flex:1;min-width:150px"><button class="btn btn-p" onclick="addToShortlist()">+ Add</button></div>';
  
  if(areas.length){
    html+='<div class="table-wrap"><table><tr><th>Suburb</th><th>Rent/wk</th><th>Beach</th><th>Commute</th><th>Schools</th><th>Lifestyle</th><th>Value</th><th>Total</th><th>Notes</th><th></th></tr>';
    areas.sort(function(a,b){return (b.scores||{}).total-(a.scores||{}).total});
    areas.forEach(function(a,i){
      var s=a.scores||{beach:0,commute:0,schools:0,lifestyle:0,value:0};
      s.total=(s.beach||0)+(s.commute||0)+(s.schools||0)+(s.lifestyle||0)+(s.value||0);
      html+='<tr><td style="font-weight:600">'+(a.link?'<a href="'+a.link+'" target="_blank" style="color:var(--accent)">'+a.name+' →</a>':a.name)+'</td>';
      html+='<td><input type="number" class="ism" value="'+(a.rent||'')+'" placeholder="$" oninput="updateShortlist('+i+',\'rent\',+this.value)"></td>';
      ['beach','commute','schools','lifestyle','value'].forEach(function(k){
        html+='<td><select onchange="updateShortlistScore('+i+',\''+k+'\',+this.value)" style="width:50px"><option value="0" '+(s[k]===0?'selected':'')+'>-</option><option value="1" '+(s[k]===1?'selected':'')+'>1</option><option value="2" '+(s[k]===2?'selected':'')+'>2</option><option value="3" '+(s[k]===3?'selected':'')+'>3</option><option value="4" '+(s[k]===4?'selected':'')+'>4</option><option value="5" '+(s[k]===5?'selected':'')+'>5</option></select></td>';
      });
      html+='<td style="font-weight:700;color:'+(s.total>=20?'var(--green)':s.total>=15?'var(--accent)':'var(--muted)')+'">'+s.total+'/25</td>';
      html+='<td><input type="text" value="'+(a.notes||'')+'" placeholder="Notes..." oninput="updateShortlist('+i+',\'notes\',this.value)" style="min-width:120px"></td>';
      html+='<td><button class="btn btn-o" style="padding:2px 6px;color:var(--red)" onclick="removeFromShortlist('+i+')">✕</button></td></tr>';
    });
    html+='</table></div>';
    
    // Show winner
    if(areas.length>1){
      var sorted=areas.slice().sort(function(a,b){var sa=(a.scores||{});var sb=(b.scores||{});return((sb.beach||0)+(sb.commute||0)+(sb.schools||0)+(sb.lifestyle||0)+(sb.value||0))-((sa.beach||0)+(sa.commute||0)+(sa.schools||0)+(sa.lifestyle||0)+(sa.value||0))});
      var winner=sorted[0];
      var ws=winner.scores||{};
      var wtotal=(ws.beach||0)+(ws.commute||0)+(ws.schools||0)+(ws.lifestyle||0)+(ws.value||0);
      if(wtotal>0)html+='<div class="card mt2" style="border-left:4px solid var(--green)"><h3 style="color:var(--green)">🏆 Current Leader: '+winner.name+' ('+wtotal+'/25)</h3></div>';
    }
  } else {
    html+='<p class="tm ts">No areas shortlisted yet. Add suburbs above to start comparing.</p>';
  }
  html+='</div>';
  
  // Scoring guide
  html+='<div class="card"><h3>Scoring Guide</h3><div class="table-wrap"><table><tr><th>Score</th><th>Beach</th><th>Commute</th><th>Schools</th><th>Lifestyle</th><th>Value</th></tr><tr><td>5</td><td>On the beach</td><td>&lt;30 min train</td><td>Top rated (91+)</td><td>Cafes, shops, community all excellent</td><td>Under $550/wk 4-bed</td></tr><tr><td>4</td><td>5 min drive</td><td>30–40 min</td><td>Good rated</td><td>Most things nearby</td><td>$550–650/wk</td></tr><tr><td>3</td><td>10–15 min drive</td><td>40–50 min</td><td>Average</td><td>Some things nearby</td><td>$650–750/wk</td></tr><tr><td>2</td><td>20+ min drive</td><td>50–60 min</td><td>Below average</td><td>Limited nearby</td><td>$750–900/wk</td></tr><tr><td>1</td><td>30+ min drive</td><td>60+ min</td><td>Poor</td><td>Very limited</td><td>$900+/wk</td></tr></table></div></div>';
  
  document.getElementById('cmpContent').innerHTML=html;
}

function addToShortlist(){
  var name=document.getElementById('slName').value;
  if(!name)return;
  var rent=+(document.getElementById('slRent').value)||0;
  var link=document.getElementById('slLink').value;
  if(!state.shortlist)state.shortlist=[];
  state.shortlist.push({name:name,rent:rent,link:link,notes:'',scores:{beach:0,commute:0,schools:0,lifestyle:0,value:0}});
  save();showCmp('shortlist');
}
function updateShortlist(i,field,val){
  if(!state.shortlist||!state.shortlist[i])return;
  state.shortlist[i][field]=val;
  save();
}
function updateShortlistScore(i,field,val){
  if(!state.shortlist||!state.shortlist[i])return;
  if(!state.shortlist[i].scores)state.shortlist[i].scores={};
  state.shortlist[i].scores[field]=val;
  save();showCmp('shortlist');
}
function removeFromShortlist(i){
  if(!state.shortlist)return;
  state.shortlist.splice(i,1);
  save();showCmp('shortlist');
}



var SUBURBS_DATA=[
  {name:'Seaford',cafes:'Foreshore cafes, fish & chips, growing brunch scene',shops:'Local shops + 10 min to Frankston Bayside Centre',outdoors:'Beach, foreshore trail, wetlands, playgrounds',community:'Relaxed village, young families, community markets',school:'Monterey SC',schoolRating:'VCE median 25 — Average',schoolLink:'https://www.google.com/search?q=Monterey+Secondary+College+Frankston',pc:'3198',bed3:'520–580',bed4:'580–650',train:50,beach:'ON beach',garden:'Yes',vibe:'Beach village, foreshore trail, relaxed',lat:-38.1,lng:145.134},
  {name:'Carrum',cafes:'Small cafe strip, Patterson River dining',shops:'Local shops, 10 min to Frankston',outdoors:'Beach, Patterson River walks, boat ramp',community:'Quiet family streets, tight-knit',school:'Patterson River SC',schoolRating:'VCE median 26 — Average',schoolLink:'https://www.google.com/search?q=Patterson+River+Secondary+College',pc:'3197',bed3:'530–590',bed4:'600–680',train:48,beach:'ON beach',garden:'Yes',vibe:'Quiet beach, Patterson River, family',lat:-38.075,lng:145.123},
  {name:'Frankston',cafes:'Waterfront cafes, restaurants on Nepean Hwy, night dining',shops:'Bayside Centre (major), Power Centre',outdoors:'Beach, pier, foreshore park, botanic gardens, skatepark',community:'Coastal town buzz, markets, events, arts centre',school:'Frankston High',schoolRating:'VCE median 28 — Good',schoolLink:'https://www.google.com/search?q=Frankston+High+School+Victoria',pc:'3199',bed3:'500–600',bed4:'580–680',train:55,beach:'ON beach',garden:'Yes',vibe:'Coastal town, cafes, markets, improving',lat:-38.143,lng:145.126},
  {name:'Frankston South',cafes:'Quiet, local cafes',shops:'Near Frankston Bayside',outdoors:'Sweetwater Creek, bushland walks, 5 min to beach',community:'Leafy, quiet, established families',school:'Frankston High',schoolRating:'VCE median 28 — Good',schoolLink:'https://www.google.com/search?q=Elisabeth+Murdoch+College+Langwarrin',pc:'3199',bed3:'580–650',bed4:'650–750',train:58,beach:'5 min',garden:'Yes',vibe:'Leafy, quiet, larger properties',lat:-38.16,lng:145.13},
  {name:'Langwarrin',cafes:'Local cafes, Gateway food court',shops:'Gateway Shopping Centre, Karingal Hub',outdoors:'Lloyd Park, Flora & Fauna Reserve, 12 min to beach',community:'New estates, parks, playgrounds, family-focused',school:'Elisabeth Murdoch College',schoolRating:'VCE median 27 — Good',schoolLink:'https://www.google.com/search?q=Cranbourne+Secondary+College',pc:'3910',bed3:'480–550',bed4:'550–630',train:60,beach:'12 min',garden:'Yes ★',vibe:'New estates, big gardens, parks, space',lat:-38.167,lng:145.17},
  {name:'Karingal',cafes:'Karingal Hub food court, local cafes',shops:'Karingal Hub, near Frankston',outdoors:'Karingal Reserve, 10 min to beach',community:'Affordable, family area',school:'Frankston High',schoolRating:'VCE median 28 — Good',schoolLink:'https://www.google.com/search?q=Parkdale+Secondary+College',pc:'3199',bed3:'460–520',bed4:'530–600',train:58,beach:'10 min',garden:'Yes',vibe:'Affordable, near Frankston shops',lat:-38.15,lng:145.15},
  {name:'Cranbourne',cafes:'Growing cafe scene, Cranbourne Park food',shops:'Cranbourne Park Shopping Centre',outdoors:'Royal Botanic Gardens Cranbourne, 25 min to beach',community:'New estates, growing, diverse',school:'Cranbourne SC',schoolRating:'VCE median 24 — Below Avg',schoolLink:'https://www.google.com/search?q=Mordialloc+College',pc:'3977',bed3:'450–520',bed4:'520–600',train:55,beach:'25 min',garden:'Yes ★',vibe:'Very affordable, new estates, growing',lat:-38.099,lng:145.283},
  {name:'Mordialloc',cafes:'Main St strip — cafes, pubs, restaurants. Great brunch',shops:'Local Main St shops + 15 min Chadstone/Southland',outdoors:'Beach, Mordialloc Creek, pier, coastal walk',community:'Strong community, pier fishing, weekend markets',school:'Parkdale SC',schoolRating:'VCE median 30 — Good+',schoolLink:'https://www.google.com/search?q=Mentone+Girls+Secondary+College',pc:'3195',bed3:'600–680',bed4:'680–780',train:38,beach:'ON beach',garden:'Some',vibe:'Beach + creek, cafes, pier, family',lat:-37.987,lng:145.087},
  {name:'Aspendale',cafes:'Quiet local cafes, near Mordialloc strip',shops:'Near Southland, local shops',outdoors:'Beach, Edithvale wetlands, bike paths',community:'Quiet beach suburb, families',school:'Mordialloc College',schoolRating:'VCE median 28 — Good',schoolLink:'https://www.google.com/search?q=Cheltenham+Secondary+College',pc:'3195',bed3:'620–700',bed4:'700–800',train:40,beach:'ON beach',garden:'Some',vibe:'Quiet beach, Edithvale wetlands',lat:-38.025,lng:145.103},
  {name:'Mentone',cafes:'Mentone Parade cafes, brunch spots, bakeries',shops:'Village shops + Southland (major) 5 min',outdoors:'Beach, coastal trail, parks, quiet cycling streets',community:'Village feel, tree-lined, families, dog walkers',school:'Mentone Girls SC / Parkdale SC',schoolRating:'VCE median 31–32 — Very Good',schoolLink:'https://www.google.com/search?q=Glen+Waverley+Secondary+College',pc:'3194',bed3:'650–750',bed4:'750–880',train:35,beach:'5 min',garden:'Yes',vibe:'Village feel, cafes, leafy streets',lat:-37.983,lng:145.067},
  {name:'Cheltenham',cafes:'Charman Rd cafes, Southland food precinct',shops:'Southland Shopping Centre (huge), DFO nearby',outdoors:'8 min to beach, parks, bike paths',community:'Central, well-connected, professionals + families',school:'Cheltenham SC',schoolRating:'VCE median 29 — Good',schoolLink:'https://www.google.com/search?q=Mount+Waverley+Secondary+College',pc:'3192',bed3:'620–700',bed4:'700–800',train:32,beach:'8 min',garden:'Yes',vibe:'Central, good access everywhere',lat:-37.957,lng:145.053},
  {name:'Glen Waverley',cafes:'Kingsway — Asian restaurants, bubble tea, yum cha, hotpot',shops:'The Glen Shopping Centre, Kingsway strip',outdoors:'Jells Park, Valley Reserve, 30 min to beach',community:'Multicultural, food-focused, top schools, family',school:'Glen Waverley SC',schoolRating:'VCE median 34 — Excellent (91.40)',schoolLink:'https://www.google.com/search?q=Box+Hill+High+School',pc:'3150',bed3:'650–750',bed4:'750–900',train:40,beach:'30 min',garden:'Yes',vibe:'Top schools (91.40), Asian food hub',lat:-37.878,lng:145.163},
  {name:'Mt Waverley',cafes:'Local village cafes, near Glen Waverley strip',shops:'Near The Glen, local shops',outdoors:'Valley Reserve, Damper Creek, parks',community:'Leafy, quiet, established families',school:'Mt Waverley SC',schoolRating:'VCE median 31 — Very Good',schoolLink:'https://www.google.com/search?q=Sandringham+College+Victoria',pc:'3149',bed3:'600–680',bed4:'680–780',train:35,beach:'30 min',garden:'Yes',vibe:'Leafy, quieter, good primaries',lat:-37.877,lng:145.129},
  {name:'Box Hill',cafes:'Massive Asian food scene — dumplings, BBQ, bubble tea',shops:'Box Hill Central, Market Street',outdoors:'Box Hill Gardens, bike paths, 35 min to beach',community:'Multicultural hub, vibrant, busy',school:'Box Hill High',schoolRating:'VCE median 29 — Good',schoolLink:'https://www.google.com/search?q=Brighton+Secondary+College',pc:'3128',bed3:'550–630',bed4:'630–720',train:25,beach:'35 min',garden:'Some',vibe:'Asian hub, great food, direct train',lat:-37.819,lng:145.122},
  {name:'Sandringham',cafes:'Village cafes, Bay Rd restaurants',shops:'Sandringham village, near Southland',outdoors:'Beach, Half Moon Bay, coastal walks',community:'Village, leafy, established families',school:'Sandringham College',schoolRating:'VCE median 30 — Good+',schoolLink:'https://www.google.com/search?q=Mornington+Secondary+College',pc:'3191',bed3:'750–880',bed4:'880–1050',train:28,beach:'ON beach',garden:'Yes',vibe:'Village, beach, leafy, family',lat:-37.951,lng:145.01},
  {name:'Brighton',cafes:'Church St cafes, Bay St restaurants, wine bars',shops:'Church St boutiques, Bay St, 15 min Chadstone',outdoors:'Brighton Beach (bathing boxes), Half Moon Bay, coastal walk',community:'Upmarket, leafy, private schools nearby',school:'Brighton SC',schoolRating:'VCE median 32 — Very Good',schoolLink:'https://www.findmyschool.vic.gov.au',pc:'3186',bed3:'850–1000',bed4:'1000–1300',train:25,beach:'ON beach',garden:'Yes',vibe:'Iconic bathing boxes, upmarket',lat:-37.907,lng:144.987},
  {name:'Mornington',cafes:'Main St cafes, wineries, breweries, brunch culture',shops:'Main St boutiques, Mornington Central',outdoors:'Beach, Mills Beach, pier, coastal walks, hot springs nearby',community:'Peninsula village, markets, wineries, strong community',school:'Mornington SC',schoolRating:'VCE median 27 — Good',schoolLink:'https://www.findmyschool.vic.gov.au',pc:'3931',bed3:'580–680',bed4:'680–800',train:70,beach:'ON beach',garden:'Yes ★',vibe:'Village, wineries, pier, markets',lat:-38.218,lng:145.038},
  {name:'Mt Martha',cafes:'Quiet local cafes, near Mornington Main St',shops:'Near Mornington Central',outdoors:'Beautiful beaches, bushland walks, Briars wildlife',community:'Quiet, nature-focused, families',school:'Mornington SC',schoolRating:'VCE median 27 — Good',schoolLink:'https://www.findmyschool.vic.gov.au',pc:'3934',bed3:'620–700',bed4:'700–850',train:75,beach:'ON beach',garden:'Yes ★',vibe:'Quiet, beautiful beaches, bushland',lat:-38.27,lng:145.02},
];

var SCHOOL_INFO={
  'Seaford':{students:'~800',type:'Co-ed Yr 7–12 (both kids)',extra:'Specialist basketball & volleyball. Smaller school = more personal attention for new students'},
  'Carrum':{students:'~1,100',type:'Co-ed Yr 7–12 (both kids)',extra:'Strong outdoor ed & marine studies. Good for Jack if he likes water/nature'},
  'Frankston':{students:'~1,800',type:'Co-ed Yr 7–12 (both kids)',extra:'Large school. ACCELERATED LEARNING program (Bella could apply). Strong sport. Good ESL support for transitions'},
  'Frankston South':{students:'~1,800',type:'Co-ed Yr 7–12 (both kids)',extra:'Same as Frankston High — accelerated program available'},
  'Karingal':{students:'~1,800',type:'Co-ed Yr 7–12 (both kids)',extra:'Frankston High zone — accelerated program'},
  'Langwarrin':{students:'~1,200',type:'Co-ed Yr 7–12 (both kids)',extra:'Arts & performance focus. Good pastoral care for new students settling in'},
  'Cranbourne':{students:'~900',type:'Co-ed Yr 7–12 (both kids)',extra:'Growing area, newer facilities. Lower academic results but improving'},
  'Mordialloc':{students:'~1,400',type:'Co-ed Yr 7–12 (both kids)',extra:'Strong music program (Bella?). Good results. Active sport'},
  'Aspendale':{students:'~700',type:'Co-ed Yr 7–12 (both kids)',extra:'Smaller = personal attention. Good for settling in. Near beach for outdoor ed'},
  'Mentone':{students:'~900 (girls) / ~1,400 (Parkdale)',type:'Mentone Girls (Bella) + Parkdale Co-ed (Jack)',extra:'MENTONE GIRLS: strong academics, STEM, all-girls environment. PARKDALE: strong music, co-ed. Could split kids between schools'},
  'Cheltenham':{students:'~600',type:'Co-ed Yr 7–12 (both kids)',extra:'Smallest school = very personal. Community feel. Good support for new arrivals'},
  'Glen Waverley':{students:'~2,100',type:'Co-ed Yr 7–12 (both kids)',extra:'TOP PUBLIC SCHOOL. Accelerated program (Bella). Languages (Mandarin, Japanese). STEM excellence. Very competitive catchment — must live in zone'},
  'Mt Waverley':{students:'~1,500',type:'Co-ed Yr 7–12 (both kids)',extra:'Strong academics + music program. Good pastoral care. Less pressure than Glen Waverley'},
  'Box Hill':{students:'~1,000',type:'Co-ed Yr 7–12 (both kids)',extra:'Diverse school, excellent ESL support (good for transition). Strong arts'},
  'Sandringham':{students:'~1,200',type:'Co-ed Yr 7–12 (both kids)',extra:'Beach location. Outdoor ed, performing arts, sport. Relaxed vibe'},
  'Brighton':{students:'~1,100',type:'Co-ed Yr 7–12 (both kids)',extra:'Strong academics + sport. Near several private school alternatives if needed later'},
  'Mornington':{students:'~1,400',type:'Co-ed Yr 7–12 (both kids)',extra:'Peninsula school. Outdoor ed, marine studies, SURFING PROGRAM. Great for active kids (Jack)'},
  'Mt Martha':{students:'~1,400',type:'Co-ed Yr 7–12 (both kids)',extra:'Same as Mornington SC — surfing program, outdoor ed'},
};

function renderSuburbsInteractive(){
  var sd=state.suburbData||{};
  var html='<div class="card"><h2>🏘️ Melbourne Suburbs — All Info</h2><p class="tx tm mb2">Each suburb has everything: price, school, lifestyle, budget. Tap ℹ️ to expand details.</p></div>';
  
  var tiers=[
    {name:'🏖️ BUDGET — Beach',suburbs:['Seaford','Carrum','Frankston','Frankston South']},
    {name:'🏡 BUDGET — Inland',suburbs:['Langwarrin','Karingal','Cranbourne']},
    {name:'🌊 MID — Bayside',suburbs:['Mordialloc','Aspendale','Mentone','Cheltenham']},
    {name:'🏫 MID — Eastern',suburbs:['Glen Waverley','Mt Waverley','Box Hill']},
    {name:'💎 PREMIUM',suburbs:['Sandringham','Brighton']},
    {name:'🍷 PENINSULA',suburbs:['Mornington','Mt Martha']},
  ];
  
  tiers.forEach(function(tier){
    html+='<div class="card"><h3>'+tier.name+'</h3>';
    tier.suburbs.forEach(function(sname){
      var s=SUBURBS_DATA.find(function(x){return x.name===sname});
      if(!s)return;
      var d=sd[s.name]||{};
      var mapUrl='https://www.google.com/maps/search/'+s.name.replace(/ /g,'+')+'+Victoria+Australia/@'+s.lat+','+s.lng+',13z';
      var rent=d.price||parseInt(s.bed4)||0;
      var rentMo=Math.round(rent*52/12);
      var disposable=9571-rentMo-3515; // 3515 = other monthly costs minus rent
      
      html+='<div style="border:1px solid var(--border);border-radius:10px;padding:12px;margin:8px 0">';
      // Header row
      html+='<div class="flex jcb aic fw" style="gap:8px">';
      html+='<div><a href="'+mapUrl+'" target="_blank" style="color:var(--accent);font-weight:700;font-size:1rem">'+s.name+' 📍</a>';
      html+='<div class="tx tm">'+s.vibe+'</div></div>';
      html+='<div style="text-align:right"><div style="font-weight:700">$'+s.bed4+'/wk</div>';
      html+='<div class="tx tm">'+s.train+' min train · '+s.beach+'</div></div>';
      html+='</div>';
      
      // Quick stats row
      html+='<div class="flex g2 fw mt2" style="font-size:.78rem">';
      html+='<span>🏫 <a href="'+(s.schoolLink||'')+'" target="_blank" style="color:var(--accent)">'+( s.school||'—')+'</a> ('+( s.schoolRating||'—')+')</span>';
      html+='<span>💰 ~$'+disposable+'/mo disposable</span>';
      html+='</div>';
      
      // Expandable detail
      html+='<details style="margin-top:8px"><summary style="cursor:pointer;font-size:.82rem;color:var(--accent)">ℹ️ Details + Add to Shortlist</summary>';
      html+='<div style="padding:8px 0">';
      
      // Price + listing
      html+='<div class="flex g2 fw aic mb2"><label class="tx">Your price:</label><input type="number" class="ism" value="'+(d.price||'')+'" placeholder="$/wk" oninput="saveSuburbField(\''+s.name+'\',\'price\',+this.value)"><label class="tx">Train:</label><input type="number" class="ism" style="width:50px" value="'+(d.train||s.train)+'" oninput="saveSuburbField(\''+s.name+'\',\'train\',+this.value)"> min<label class="tx">Listing:</label><input type="text" value="'+(d.link||'')+'" placeholder="URL" style="flex:1;min-width:100px;font-size:.75rem" oninput="saveSuburbField(\''+s.name+'\',\'link\',this.value)">'+(d.link?'<a href="'+d.link+'" target="_blank" style="color:var(--accent);font-size:.75rem">View →</a>':'')+'</div>';
      
      // Features
      html+='<div style="font-size:.72rem;margin:6px 0">';
      var features=['Beach','Garden','Direct Train','Cafes','Shops','Good School','Parks','4-bed','Quiet','Family Area','Dog Friendly','Bike Paths'];
      features.forEach(function(f){
        var checked=(d.features||{})[f];
        html+='<label style="margin-right:6px"><input type="checkbox" '+(checked?'checked':'')+' onchange="saveSuburbFeature(\''+s.name+'\',\''+f+'\',this.checked)"> '+f+'</label>';
      });
      html+='<br><input type="text" value="'+(d.custom||'')+'" placeholder="+ Custom notes..." style="font-size:.75rem;margin-top:4px;width:100%" oninput="saveSuburbField(\''+s.name+'\',\'custom\',this.value)">';
      html+='</div>';
      
      // Add to shortlist button
      html+='<button class="btn btn-p" style="margin-top:6px;font-size:.78rem" onclick="addSuburbToShortlist(\''+s.name+'\')">⭐ Add to Shortlist</button>';
      html+='</div></details>';
      // Lifestyle dropdown
      html+='<details style="margin-top:4px"><summary style="cursor:pointer;font-size:.82rem;color:var(--muted)">☕ Lifestyle & Activities</summary>';
      html+='<div style="padding:8px 0;font-size:.8rem">';
      html+='<div style="margin:4px 0"><strong>☕ Cafes & Food:</strong> '+s.cafes+'</div>';
      html+='<div style="margin:4px 0"><strong>🛍️ Shopping:</strong> '+s.shops+'</div>';
      html+='<div style="margin:4px 0"><strong>🌳 Outdoors:</strong> '+s.outdoors+'</div>';
      html+='<div style="margin:4px 0"><strong>👨‍👩‍👧‍👦 Community:</strong> '+s.community+'</div>';
      var si=SCHOOL_INFO[s.name]||{};
      html+='<div style="margin:8px 0;padding:8px;background:rgba(255,255,255,.03);border-radius:6px"><strong>🏫 School Detail:</strong> <a href="'+s.schoolLink+'" target="_blank" style="color:var(--accent)">'+s.school+'</a><br>';
      html+='<span class="tx">'+s.schoolRating+'</span><br>';
      if(si.students)html+='<span class="tx tm">👥 '+si.students+' students · '+si.type+'</span><br>';
      if(si.extra)html+='<span class="tx tm">✨ '+si.extra+'</span><br>';
      html+='<span class="tx tm" style="margin-top:4px;display:block">Score guide: 25=Average, 28=Good, 30+=Very Good, 33+=Excellent (state avg ~27)</span>';
      html+='<div style="margin-top:4px"><a href="https://www.findmyschool.vic.gov.au" target="_blank" style="color:var(--accent);font-size:.75rem">Find My School (catchment) →</a> · <a href="https://bettereducation.com.au/school/Secondary/vic/vic_top_secondary_schools.aspx" target="_blank" style="color:var(--accent);font-size:.75rem">Rankings →</a> · <a href="'+s.schoolLink+'" target="_blank" style="color:var(--accent);font-size:.75rem">Google →</a></div></div>';
      html+='</div></details>';
      html+='</div>';
    });
    html+='</div>';
  });
  
  // Browse listings
  html+='<div class="card"><h3>🔍 Browse Listings on Domain.com.au</h3><div class="flex g2 fw">';
  SUBURBS_DATA.forEach(function(s){
    var url='https://www.domain.com.au/rent/'+s.name.toLowerCase().replace(/ /g,'-')+'-vic-'+s.pc+'/?bedrooms=3-any&propertytype=house';
    html+='<a href="'+url+'" target="_blank" class="btn btn-o" style="font-size:.72rem;padding:5px 8px">'+s.name+'</a>';
  });
  html+='</div></div>';
  
  document.getElementById('cmpContent').innerHTML=html;
}
function saveSuburbField(name,field,val){
  if(!state.suburbData)state.suburbData={};
  if(!state.suburbData[name])state.suburbData[name]={};
  state.suburbData[name][field]=val;
  save();
}
function saveSuburbFeature(name,feature,checked){
  if(!state.suburbData)state.suburbData={};
  if(!state.suburbData[name])state.suburbData[name]={};
  if(!state.suburbData[name].features)state.suburbData[name].features={};
  state.suburbData[name].features[feature]=checked;
  save();
}
function addSuburbToShortlist(name){
  var s=SUBURBS_DATA.find(function(x){return x.name===name});
  var d=(state.suburbData||{})[name]||{};
  if(!state.shortlist)state.shortlist=[];
  var features=[];
  if(d.features){Object.keys(d.features).forEach(function(k){if(d.features[k])features.push(k)})}
  if(d.custom)features.push(d.custom);
  state.shortlist.push({
    name:name,
    rent:d.price||0,
    link:d.link||'',
    notes:features.join(', '),
    scores:{beach:0,commute:0,schools:0,lifestyle:0,value:0}
  });
  save();
  alert('⭐ '+name+' added to shortlist! Go to Shortlist tab to score it.');
}





CMP.costs='<div class="card"><h2>💰 Monthly Budget — $159k Salary (4-Bed with Garden)</h2><p class="tx tm mb2">Net: $9,571/mo. Amazon pays 80% health insurance. School fees: FREE (VIC).</p><div class="table-wrap"><table><tr><th>Suburb</th><th>4-bed/wk</th><th>Rent/mo</th><th>Disposable/mo</th><th>Disposable/yr</th></tr><tr style="background:rgba(34,197,94,.05)"><td style="font-weight:600"><a href="https://www.google.com/maps/search/Langwarrin+Victoria+Australia/@-38.1670,145.1700,13z" target="_blank" style="color:var(--accent)">Langwarrin 📍</a></td><td>$590</td><td>$2,556</td><td style="color:var(--green)">$4,123</td><td style="color:var(--green)">$49,476</td></tr><tr><td style="font-weight:600"><a href="https://www.google.com/maps/search/Seaford+Victoria+Australia/@-38.1000,145.1340,13z" target="_blank" style="color:var(--accent)">Seaford 📍</a></td><td>$620</td><td>$2,686</td><td style="color:var(--green)">$3,993</td><td style="color:var(--green)">$47,916</td></tr><tr><td style="font-weight:600"><a href="https://www.google.com/maps/search/Frankston+Victoria+Australia/@-38.1430,145.1260,13z" target="_blank" style="color:var(--accent)">Frankston 📍</a></td><td>$630</td><td>$2,730</td><td style="color:var(--green)">$3,949</td><td style="color:var(--green)">$47,388</td></tr><tr><td style="font-weight:600"><a href="https://www.google.com/maps/search/Mordialloc+Victoria+Australia/@-37.9870,145.0870,13z" target="_blank" style="color:var(--accent)">Mordialloc 📍</a></td><td>$730</td><td>$3,163</td><td style="color:var(--green)">$3,516</td><td style="color:var(--green)">$42,192</td></tr><tr><td style="font-weight:600"><a href="https://www.google.com/maps/search/Mentone+Victoria+Australia/@-37.9830,145.0670,13z" target="_blank" style="color:var(--accent)">Mentone 📍</a></td><td>$800</td><td>$3,466</td><td style="color:var(--green)">$3,213</td><td style="color:var(--green)">$38,556</td></tr><tr><td style="font-weight:600"><a href="https://www.google.com/maps/search/Glen Waverley+Victoria+Australia/@-37.8780,145.1630,13z" target="_blank" style="color:var(--accent)">Glen Waverley 📍</a></td><td>$820</td><td>$3,553</td><td style="color:var(--green)">$3,126</td><td style="color:var(--green)">$37,512</td></tr><tr><td style="font-weight:600"><a href="https://www.google.com/maps/search/Sandringham+Victoria+Australia/@-37.9510,145.0100,13z" target="_blank" style="color:var(--accent)">Sandringham 📍</a></td><td>$950</td><td>$4,116</td><td style="color:var(--orange)">$2,563</td><td style="color:var(--orange)">$30,756</td></tr><tr><td style="font-weight:600"><a href="https://www.google.com/maps/search/Brighton+Victoria+Australia/@-37.9070,144.9870,13z" target="_blank" style="color:var(--accent)">Brighton 📍</a></td><td>$1100</td><td>$4,766</td><td style="color:var(--orange)">$1,913</td><td style="color:var(--orange)">$22,956</td></tr></table></div><p class="ts mt2">Includes: rent, groceries ($1,400), car ($500), utilities ($350), health copay ($80), phones ($130), kids activities ($300), UK costs net (-£37 surplus), flights ($417/mo amortised). School fees: $0 (VIC free for 482 visa).</p></div>';

CMP.costs+='<div class="card"><h2>📊 Salary Breakdown — $159,000 AUD</h2><div class="table-wrap"><table><tr><th></th><th>Amount</th></tr><tr><td>Gross salary</td><td>$159,000</td></tr><tr><td>Tax</td><td>-$40,972</td></tr><tr><td>Medicare levy (2%)</td><td>-$3,180</td></tr><tr style="font-weight:700"><td>Net annual</td><td>$114,848</td></tr><tr style="font-weight:700"><td>Net monthly</td><td>$9,571</td></tr><tr><td>Super (12% employer pays)</td><td>$19,080/yr (not in your pocket)</td></tr><tr><td>Health insurance (Amazon 80%)</td><td>Saves ~$350/mo vs paying yourself</td></tr></table></div></div>';

CMP.costs+='<div class="card"><h2>🛒 Melbourne Living Costs — Real Prices</h2><p class="tx tm mb2">What things actually cost day-to-day. Prices in AUD.</p><h3>🛒 Groceries (Weekly Family Shop)</h3><div class="table-wrap"><table><tr><th>Item</th><th>Coles/Woolworths</th><th>Aldi (cheaper)</th></tr><tr><td>Milk 2L</td><td>$3.50</td><td>$2.89</td></tr><tr><td>Bread loaf</td><td>$3.50–5.00</td><td>$2.49</td></tr><tr><td>Chicken breast 1kg</td><td>$12–14</td><td>$10–11</td></tr><tr><td>Mince beef 500g</td><td>$7–9</td><td>$5.99</td></tr><tr><td>Rice 1kg</td><td>$3–4</td><td>$2.49</td></tr><tr><td>Eggs 12</td><td>$5–7</td><td>$4.49</td></tr><tr><td>Bananas 1kg</td><td>$3–5</td><td>$2.99</td></tr><tr><td>Pasta 500g</td><td>$2–3</td><td>$1.29</td></tr><tr><td>Cheese block 500g</td><td>$6–8</td><td>$4.99</td></tr><tr><td>Cereal box</td><td>$5–7</td><td>$3.49</td></tr><tr style="font-weight:700"><td>Typical weekly shop (family 4)</td><td>$280–350</td><td>$200–260</td></tr></table></div>';

CMP.costs+='<h3>☕ Eating Out & Coffees</h3><div class="table-wrap"><table><tr><th>Item</th><th>Typical Cost</th></tr><tr><td>Coffee (flat white/latte)</td><td>$4.50–6.00</td></tr><tr><td>Bubble tea</td><td>$6–8</td></tr><tr><td>Lunch (cafe/takeaway)</td><td>$15–22</td></tr><tr><td>Dinner out (family of 4, casual)</td><td>$80–120</td></tr><tr><td>Dinner out (family of 4, nice restaurant)</td><td>$150–250</td></tr><tr><td>Pizza delivery (family)</td><td>$40–60</td></tr><tr><td>Fish & chips (family)</td><td>$35–50</td></tr><tr><td>Pub meal (adult)</td><td>$22–35</td></tr><tr><td>Kids meal (pub/cafe)</td><td>$10–15</td></tr><tr><td>Ice cream (scoop)</td><td>$5–7</td></tr></table></div>';

CMP.costs+='<h3>⚽ Kids Activities & Entertainment</h3><div class="table-wrap"><table><tr><th>Activity</th><th>Cost</th></tr><tr><td>Cinema (adult)</td><td>$20–24</td></tr><tr><td>Cinema (child)</td><td>$15–18</td></tr><tr><td>Bounce Inc / trampoline park (per child)</td><td>$20–30/session</td></tr><tr><td>Ice skating session</td><td>$18–25 inc skate hire</td></tr><tr><td>Bowling (per person)</td><td>$15–20</td></tr><tr><td>Mini golf</td><td>$15–18</td></tr><tr><td>Zoo (Melbourne Zoo family)</td><td>$80–100</td></tr><tr><td>Aquarium (SEA LIFE family)</td><td>$90–120</td></tr><tr><td>Swimming pool entry</td><td>$5–8</td></tr><tr><td>Beach</td><td>FREE</td></tr><tr><td>Parks / playgrounds</td><td>FREE</td></tr><tr><td>BBQ areas (public)</td><td>FREE</td></tr><tr><td>Bike trails</td><td>FREE</td></tr><tr><td>Library</td><td>FREE</td></tr><tr><td>Sport club registration (per term)</td><td>$100–250</td></tr><tr><td>Circus/aerial class (per term)</td><td>$250–450</td></tr><tr><td>Ice hockey (per season)</td><td>$500–800</td></tr></table></div>';

CMP.costs+='<h3>🚗 Transport & Car</h3><div class="table-wrap"><table><tr><th>Item</th><th>Cost</th></tr><tr><td>Petrol (per litre)</td><td>$1.70–2.10</td></tr><tr><td>Full tank (60L)</td><td>$100–125</td></tr><tr><td>Myki (train/tram weekly cap)</td><td>$53</td></tr><tr><td>Car rego (annual)</td><td>$350–850</td></tr><tr><td>Car insurance (comprehensive, annual)</td><td>$1,200–2,400</td></tr><tr><td>RACV roadside (annual)</td><td>$100–150</td></tr><tr><td>Car service</td><td>$200–400</td></tr><tr><td>Tyres (set of 4)</td><td>$400–800</td></tr></table></div>';

CMP.costs+='<h3>🏠 Household & Utilities</h3><div class="table-wrap"><table><tr><th>Item</th><th>Monthly Cost</th></tr><tr><td>Electricity + gas</td><td>$200–350</td></tr><tr><td>Water</td><td>$50–80 (often in rent)</td></tr><tr><td>Internet (NBN 50-100Mbps)</td><td>$70–90</td></tr><tr><td>Mobile plan (per person)</td><td>$30–50</td></tr><tr><td>Netflix</td><td>$17–23</td></tr><tr><td>Spotify</td><td>$12–19 (family)</td></tr><tr><td>Contents insurance</td><td>$30–60</td></tr><tr><td>Haircut (mens)</td><td>$25–40</td></tr><tr><td>Haircut (womens)</td><td>$60–120</td></tr><tr><td>Gym membership</td><td>$50–80</td></tr></table></div>';

CMP.costs+='<h3>🎉 Weekend / Family Outings</h3><div class="table-wrap"><table><tr><th>Activity</th><th>Typical Cost (family 4)</th></tr><tr><td>Beach day (parking + ice cream)</td><td>$20–30</td></tr><tr><td>Phillip Island Penguin Parade</td><td>$120–160</td></tr><tr><td>Great Ocean Road day trip (fuel + lunch)</td><td>$80–120</td></tr><tr><td>Healesville Sanctuary</td><td>$80–100</td></tr><tr><td>Melbourne Museum</td><td>$0–30 (kids free)</td></tr><tr><td>Queen Vic Market shop + lunch</td><td>$50–80</td></tr><tr><td>Mornington Peninsula hot springs</td><td>$120–180</td></tr><tr><td>Camping weekend (fuel + food + site)</td><td>$100–200</td></tr><tr><td>AFL game (4 tickets)</td><td>$80–160</td></tr></table></div>';

CMP.costs+='<p class="ts mt2">💡 <strong>Key difference from UK:</strong> Eating out is more expensive, but outdoor activities (beaches, parks, BBQs, trails) are mostly FREE. Your lifestyle shifts from paying for indoor entertainment to free outdoor living.</p></div>';

CMP.costs+='<div class="card"><h2>🚗 Car: Lease vs Buy</h2><div class="table-wrap"><table><tr><th></th><th>Cheap Lease (12 months)</th><th>Buy Used (outright)</th><th>Buy Used (finance)</th></tr><tr><td style="font-weight:600">Upfront cost</td><td>$0–$1,000 deposit</td><td>$12,000–$18,000</td><td>$2,000–$3,000 deposit</td></tr><tr><td style="font-weight:600">Monthly cost</td><td>$400–$550/mo</td><td>$0 (you own it)</td><td>$300–$450/mo</td></tr><tr><td style="font-weight:600">Annual total</td><td>$4,800–$6,600</td><td>$0 (after purchase)</td><td>$3,600–$5,400</td></tr><tr><td style="font-weight:600">Insurance</td><td>Often included</td><td>You pay (~$150/mo)</td><td>You pay (~$150/mo)</td></tr><tr><td style="font-weight:600">Rego + maintenance</td><td>Often included</td><td>You pay (~$80/mo)</td><td>You pay (~$80/mo)</td></tr><tr><td style="font-weight:600">Flexibility</td><td style="color:var(--green)">Return after 12 months</td><td>Sell when you want</td><td>Locked into finance term</td></tr><tr><td style="font-weight:600">Credit needed?</td><td style="color:var(--red)">Yes — hard with no AU credit history</td><td style="color:var(--green)">No</td><td style="color:var(--red)">Yes — hard with no AU credit history</td></tr><tr style="font-weight:700"><td>Best for you?</td><td>Good if you can get approved</td><td style="color:var(--green)">RECOMMENDED — no credit needed, cheapest long-term</td><td>Unlikely to get approved initially</td></tr></table></div><p class="ts mt2">⚠️ <strong>Credit history:</strong> You arrive with ZERO Australian credit score. Leases and finance are hard to get in the first 6–12 months. Buying outright with cash is the safest option. Budget $12–18k from relocation cash or savings.</p><p class="ts mt2">💡 <strong>Novated lease through Amazon:</strong> Ask your employer — a novated lease uses your salary (pre-tax) so credit score matters less. Could save tax too. Discuss with your tax advisor.</p></div>';


CMP.lifestyle+='<div class="card"><h2>🎪 Kids Activities</h2><div class="table-wrap"><table><tr><th>Activity</th><th>Where</th><th>Cost</th><th>Link</th></tr><tr><td style="font-weight:600">Aerial silks / lyra (Bella)</td><td>NICA, Brunswick</td><td>$250–450/term</td><td><a href="https://www.nica.com.au" target="_blank" style="color:var(--accent)">nica.com.au →</a></td></tr><tr><td style="font-weight:600">Ice hockey (Jack)</td><td>O\'Brien Icehouse, Docklands</td><td>$500–800/season</td><td><a href="https://obrienicehouse.com.au" target="_blank" style="color:var(--accent)">obrienicehouse.com.au →</a></td></tr><tr><td style="font-weight:600">Ice skating (casual)</td><td>Oakleigh Ice Skating Centre</td><td>$18–25/session</td><td><a href="https://www.icerink.com.au" target="_blank" style="color:var(--accent)">icerink.com.au →</a></td></tr><tr><td style="font-weight:600">Trampolining</td><td>Bounce Inc (Glen Iris, Essendon)</td><td>$20–30/session</td><td><a href="https://www.bounceinc.com.au" target="_blank" style="color:var(--accent)">bounceinc.com.au →</a></td></tr><tr><td style="font-weight:600">Skateparks</td><td>Frankston, Riverslide, Waterways</td><td>FREE</td><td><a href="https://www.google.com/maps/search/skatepark+melbourne" target="_blank" style="color:var(--accent)">Find skateparks →</a></td></tr><tr><td style="font-weight:600">Mountain biking</td><td>Lysterfield Park, You Yangs</td><td>FREE</td><td><a href="https://www.google.com/maps/search/lysterfield+mountain+bike" target="_blank" style="color:var(--accent)">Lysterfield →</a></td></tr><tr><td style="font-weight:600">Swimming</td><td>Local pools + beaches</td><td>$5–8 (pool) / FREE (beach)</td><td></td></tr><tr><td style="font-weight:600">AFL (Auskick for kids)</td><td>Local clubs everywhere</td><td>$100–150/season</td><td><a href="https://www.playfootball.com.au" target="_blank" style="color:var(--accent)">playfootball.com.au →</a></td></tr><tr><td style="font-weight:600">Cricket</td><td>Local clubs</td><td>$100–200/season</td><td></td></tr><tr><td style="font-weight:600">Pokemon GO</td><td>Royal Botanic Gardens, Flagstaff</td><td>FREE</td><td></td></tr></table></div></div>';






CMP.frankie='<div class="card"><h2>💼 Frankie — Complete Work Guide</h2><p class="tx tm mb2">Everything Frankie needs to know about working in Melbourne. Full work rights on 482 dependent visa — no restrictions.</p></div>';

CMP.frankie+='<div class="card"><h2>💼 Frankie — Work Options in Melbourne</h2><p class="tx tm mb2">Student support / nurture practitioner background. Full work rights on 482 dependent visa.</p><h3>Equivalent AU Roles — Qualifications Required</h3><div class="table-wrap"><table><tr><th>Role</th><th>Salary</th><th>Quals Needed</th><th>Frankie Has It?</th><th>Jobs</th></tr><tr><td style="font-weight:600">Education Support Worker</td><td>$55–70k</td><td>Cert III Education Support (or equivalent UK experience)</td><td style="color:var(--green)">✅ UK experience accepted by most schools</td><td><a href="https://www.seek.com.au/education-support-jobs/in-Melbourne-VIC" target="_blank" style="color:var(--accent)">Seek →</a></td></tr><tr><td style="font-weight:600">Learning Support Officer (LSO)</td><td>$55–75k</td><td>Cert IV Education Support OR Diploma. Some accept experience only</td><td style="color:var(--green)">✅ Likely — may need VETASSESS letter</td><td><a href="https://www.seek.com.au/learning-support-officer-jobs/in-Melbourne-VIC" target="_blank" style="color:var(--accent)">Seek →</a></td></tr><tr><td style="font-weight:600">Student Wellbeing Officer</td><td>$65–80k</td><td>Degree in Social Work, Psychology, or Youth Work. OR Diploma + experience</td><td style="color:var(--orange)">⚠️ May need Diploma upskill</td><td><a href="https://www.seek.com.au/student-wellbeing-jobs/in-Melbourne-VIC" target="_blank" style="color:var(--accent)">Seek →</a></td></tr><tr><td style="font-weight:600">Teacher Aide</td><td>$50–65k</td><td>Cert III School Support Services (or equivalent experience)</td><td style="color:var(--green)">✅ UK experience accepted</td><td><a href="https://www.seek.com.au/teacher-aide-jobs/in-Melbourne-VIC" target="_blank" style="color:var(--accent)">Seek →</a></td></tr><tr><td style="font-weight:600">Youth Worker</td><td>$55–72k</td><td>Cert IV Youth Work OR Diploma Community Services</td><td style="color:var(--orange)">⚠️ May need Cert IV (6–12 months)</td><td><a href="https://www.seek.com.au/youth-worker-jobs/in-Melbourne-VIC" target="_blank" style="color:var(--accent)">Seek →</a></td></tr><tr><td style="font-weight:600">Disability Support (NDIS)</td><td>$55–68k</td><td>Cert III Individual Support OR Cert IV Disability. Some accept no quals + training provided</td><td style="color:var(--green)">✅ Many employers train on the job</td><td><a href="https://www.seek.com.au/disability-support-worker-jobs/in-Melbourne-VIC" target="_blank" style="color:var(--accent)">Seek →</a></td></tr><tr><td style="font-weight:600">Before/After School Care (OSHC)</td><td>$28–35/hr</td><td>Cert III Education Support OR working towards. First Aid required</td><td style="color:var(--green)">✅ Can start immediately</td><td><a href="https://www.seek.com.au/oshc-jobs/in-Melbourne-VIC" target="_blank" style="color:var(--accent)">Seek →</a></td></tr></table></div><p class="ts mt2">💡 <strong>Bottom line:</strong> Frankie can start in Education Support / Teacher Aide / OSHC / NDIS roles immediately with UK experience. Higher-paying Wellbeing/Youth Worker roles may need a 6–12 month Australian qualification.</p>';

CMP.frankie+='<h3>What Frankie Needs</h3><div class="table-wrap"><table><tr><th>Requirement</th><th>Detail</th><th>Cost</th><th>Timeline</th></tr><tr><td style="font-weight:600">Working With Children Check (WWCC)</td><td>Mandatory for any role with kids. Apply online via Service Victoria</td><td>Free (volunteers) / $35 (employees)</td><td>2–4 weeks</td></tr><tr><td style="font-weight:600">Qualification recognition</td><td>UK education/support qualifications are generally accepted. May need a Cert III/IV equivalence letter from VETASSESS if employer asks</td><td>$0–$500</td><td>2–6 weeks if needed</td></tr><tr><td style="font-weight:600">First Aid Certificate</td><td>Most school roles require current first aid. Do a 1-day course in AU</td><td>$100–$150</td><td>1 day</td></tr><tr><td style="font-weight:600">Police Check</td><td>National police check — required for education roles</td><td>$42</td><td>1–2 weeks</td></tr><tr><td style="font-weight:600">Australian CV format</td><td>Different from UK — no photo, no DOB, focus on achievements. 2–3 pages max</td><td>Free (DIY) or $100–$300 (professional)</td><td>1–2 days</td></tr></table></div>';

CMP.frankie+='<h3>Other Options / Ideas</h3><div class="table-wrap"><table><tr><th>Option</th><th>Detail</th><th>Earning potential</th></tr><tr><td style="font-weight:600">Part-time school role (3 days/wk)</td><td>Most education support roles offer part-time. Good for settling in first</td><td>$32,000–$45,000/yr</td></tr><tr><td style="font-weight:600">Casual / relief work</td><td>Register with agencies (Tradewind, Anzuk, ClassCover) for day-to-day school work. Flexible, no commitment</td><td>$250–$350/day</td></tr><tr><td style="font-weight:600">NDIS support work</td><td>Huge demand in AU. Flexible hours. Work with kids/teens with disabilities</td><td>$35–$55/hr</td></tr><tr><td style="font-weight:600">Before/after school care (OSHC)</td><td>Always hiring. Hours: 6:30–9am and 3–6pm. Good if kids are at same school</td><td>$28–$35/hr</td></tr><tr><td style="font-weight:600">Upskill: Cert IV in Education Support</td><td>6–12 month course. Opens more doors. Can study while working part-time</td><td>$1,500–$4,000 (course fee)</td></tr><tr><td style="font-weight:600">Upskill: Diploma of Community Services</td><td>12–18 months. Leads to youth work, family services, wellbeing roles</td><td>$3,000–$8,000 (course fee)</td></tr></table></div>';

CMP.frankie+='<h3>Key Job Search Links</h3><div class="table-wrap"><table><tr><th>Platform</th><th>Link</th></tr><tr><td style="font-weight:600">Seek (main job site)</td><td><a href="https://www.seek.com.au/education-support-jobs/in-Melbourne-VIC" target="_blank" style="color:var(--accent)">seek.com.au →</a></td></tr><tr><td style="font-weight:600">VIC Dept of Education careers</td><td><a href="https://www.education.vic.gov.au/hrweb/careers" target="_blank" style="color:var(--accent)">education.vic.gov.au/careers →</a></td></tr><tr><td style="font-weight:600">Catholic Education Melbourne</td><td><a href="https://www.cecv.catholic.edu.au/Employment" target="_blank" style="color:var(--accent)">cecv.catholic.edu.au →</a></td></tr><tr><td style="font-weight:600">Independent Schools Victoria</td><td><a href="https://www.is.vic.edu.au/employment" target="_blank" style="color:var(--accent)">is.vic.edu.au →</a></td></tr><tr><td style="font-weight:600">Tradewind (education agency)</td><td><a href="https://www.twrecruitment.com.au" target="_blank" style="color:var(--accent)">twrecruitment.com.au →</a></td></tr><tr><td style="font-weight:600">Anzuk Education (agency)</td><td><a href="https://www.anzuk.education" target="_blank" style="color:var(--accent)">anzuk.education →</a></td></tr><tr><td style="font-weight:600">EthicalJobs (community sector)</td><td><a href="https://www.ethicaljobs.com.au" target="_blank" style="color:var(--accent)">ethicaljobs.com.au →</a></td></tr></table></div><p class="ts mt2">💡 <strong>Demand is strong</strong> — VIC schools are actively recruiting education support staff. Frankie\'s UK experience translates well. Most roles are term-time only (school holidays off = great for family).</p></div>';


CMP.frankie+='<div class="card"><h2>📋 Step-by-Step: Getting Work-Ready</h2><div class="table-wrap"><table><tr><th>#</th><th>Step</th><th>When</th><th>Cost</th><th>How</th></tr><tr><td>1</td><td style="font-weight:600">Apply for Working With Children Check</td><td>Week 1 in AU</td><td>$35</td><td><a href="https://www.workingwithchildren.vic.gov.au" target="_blank" style="color:var(--accent)">workingwithchildren.vic.gov.au →</a></td></tr><tr><td>2</td><td style="font-weight:600">Get National Police Check</td><td>Week 1 in AU</td><td>$42</td><td><a href="https://www.nationalcrimecheck.com.au" target="_blank" style="color:var(--accent)">nationalcrimecheck.com.au →</a></td></tr><tr><td>3</td><td style="font-weight:600">Do First Aid course (HLTAID011)</td><td>Week 2–3</td><td>$100–150</td><td><a href="https://www.stjohn.org.au/first-aid-training" target="_blank" style="color:var(--accent)">St John Ambulance →</a> or <a href="https://www.redcross.org.au/first-aid" target="_blank" style="color:var(--accent)">Red Cross →</a></td></tr><tr><td>4</td><td style="font-weight:600">Update CV to AU format</td><td>Before arrival</td><td>Free</td><td>No photo, no DOB, 2–3 pages, achievements-focused. <a href="https://www.seek.com.au/career-advice/article/how-to-write-a-resume" target="_blank" style="color:var(--accent)">Seek CV guide →</a></td></tr><tr><td>5</td><td style="font-weight:600">Register on job platforms</td><td>Week 1–2</td><td>Free</td><td>Seek, Indeed, EthicalJobs, school websites</td></tr><tr><td>6</td><td style="font-weight:600">Register with education agencies</td><td>Week 2–3</td><td>Free</td><td>Tradewind, Anzuk, ClassCover — for casual/relief work</td></tr><tr><td>7</td><td style="font-weight:600">Check qualification recognition (if needed)</td><td>Before or after arrival</td><td>$0–$500</td><td><a href="https://www.vetassess.com.au" target="_blank" style="color:var(--accent)">VETASSESS →</a> (only if employer specifically asks)</td></tr></table></div></div>';

CMP.frankie+='<div class="card"><h2>🎓 Training & Upskill Options</h2><p class="tx tm mb2">If Frankie wants to move into higher-paying roles or broaden options.</p><div class="table-wrap"><table><tr><th>Course</th><th>Duration</th><th>Cost</th><th>Opens doors to</th><th>Where</th></tr><tr><td style="font-weight:600">Cert III Education Support</td><td>6 months</td><td>$1,500–$3,000<br>(may be free via Skills First)</td><td>Education Support, Teacher Aide, OSHC</td><td><a href="https://www.holmesglen.edu.au" target="_blank" style="color:var(--accent)">Holmesglen →</a></td></tr><tr><td style="font-weight:600">Cert IV Education Support</td><td>6–12 months</td><td>$2,000–$4,000</td><td>Learning Support Officer, higher pay band</td><td><a href="https://www.chisholm.edu.au" target="_blank" style="color:var(--accent)">Chisholm →</a></td></tr><tr><td style="font-weight:600">Cert IV Youth Work</td><td>6–12 months</td><td>$2,000–$4,000</td><td>Youth Worker roles ($55–72k)</td><td><a href="https://www.swinburne.edu.au" target="_blank" style="color:var(--accent)">Swinburne →</a></td></tr><tr><td style="font-weight:600">Diploma Community Services</td><td>12–18 months</td><td>$3,000–$8,000</td><td>Wellbeing Officer, Family Services, Case Worker ($65–85k)</td><td><a href="https://www.holmesglen.edu.au" target="_blank" style="color:var(--accent)">Holmesglen →</a></td></tr><tr><td style="font-weight:600">Cert III Individual Support (Disability)</td><td>6 months</td><td>$1,500–$3,000<br>(often free via Skills First)</td><td>NDIS support work ($35–55/hr)</td><td><a href="https://www.chisholm.edu.au" target="_blank" style="color:var(--accent)">Chisholm →</a></td></tr></table></div><p class="ts mt2">💡 <strong>Skills First</strong> = Victorian government subsidised training. Many courses are FREE or heavily discounted for residents. Check eligibility after arrival: <a href="https://www.skills.vic.gov.au" target="_blank" style="color:var(--accent)">skills.vic.gov.au →</a></p></div>';

CMP.frankie+='<div class="card"><h2>💰 What Frankie Could Earn</h2><div class="table-wrap"><table><tr><th>Scenario</th><th>Hours</th><th>Gross/yr</th><th>Net/mo (approx)</th></tr><tr><td style="font-weight:600">Full-time Education Support</td><td>38 hrs/wk</td><td>$60,000</td><td>~$4,100</td></tr><tr><td style="font-weight:600">Part-time 3 days/wk</td><td>22 hrs/wk</td><td>$35,000</td><td>~$2,600</td></tr><tr><td style="font-weight:600">Casual relief (3 days/wk avg)</td><td>Varies</td><td>$38,000–$45,000</td><td>~$2,800–$3,200</td></tr><tr><td style="font-weight:600">NDIS support (25 hrs/wk)</td><td>25 hrs/wk</td><td>$45,000–$55,000</td><td>~$3,200–$3,800</td></tr><tr><td style="font-weight:600">OSHC only (before + after school)</td><td>25 hrs/wk</td><td>$35,000–$40,000</td><td>~$2,600–$2,900</td></tr></table></div><p class="ts mt2">All scenarios are term-time only (school holidays off) except NDIS which is year-round. Combined household income with your $159k = very comfortable in any Melbourne suburb.</p></div>';

CMP.frankie+='<div class="card"><h2>🔗 All Job Search Links</h2><div class="table-wrap"><table><tr><th>Platform</th><th>Best for</th><th>Link</th></tr><tr><td style="font-weight:600">Seek</td><td>Main AU job site — all roles</td><td><a href="https://www.seek.com.au/education-support-jobs/in-Melbourne-VIC" target="_blank" style="color:var(--accent)">seek.com.au →</a></td></tr><tr><td style="font-weight:600">Indeed Australia</td><td>Wide range, good for support roles</td><td><a href="https://au.indeed.com/Education-Support-jobs-in-Melbourne-VIC" target="_blank" style="color:var(--accent)">indeed.com.au →</a></td></tr><tr><td style="font-weight:600">VIC Dept of Education</td><td>Government school roles</td><td><a href="https://www.education.vic.gov.au/hrweb/careers" target="_blank" style="color:var(--accent)">education.vic.gov.au →</a></td></tr><tr><td style="font-weight:600">Catholic Education Melbourne</td><td>Catholic school roles</td><td><a href="https://www.cecv.catholic.edu.au/Employment" target="_blank" style="color:var(--accent)">cecv.catholic.edu.au →</a></td></tr><tr><td style="font-weight:600">Independent Schools Victoria</td><td>Private school roles</td><td><a href="https://www.is.vic.edu.au/employment" target="_blank" style="color:var(--accent)">is.vic.edu.au →</a></td></tr><tr><td style="font-weight:600">Tradewind Recruitment</td><td>Education agency — casual/relief</td><td><a href="https://www.twrecruitment.com.au" target="_blank" style="color:var(--accent)">twrecruitment.com.au →</a></td></tr><tr><td style="font-weight:600">Anzuk Education</td><td>Education agency — casual/perm</td><td><a href="https://www.anzuk.education" target="_blank" style="color:var(--accent)">anzuk.education →</a></td></tr><tr><td style="font-weight:600">ClassCover</td><td>Relief teaching/support app</td><td><a href="https://www.classcover.com.au" target="_blank" style="color:var(--accent)">classcover.com.au →</a></td></tr><tr><td style="font-weight:600">EthicalJobs</td><td>Community sector, youth, wellbeing</td><td><a href="https://www.ethicaljobs.com.au" target="_blank" style="color:var(--accent)">ethicaljobs.com.au →</a></td></tr><tr><td style="font-weight:600">Hireup (NDIS)</td><td>NDIS support work platform</td><td><a href="https://www.hireup.com.au" target="_blank" style="color:var(--accent)">hireup.com.au →</a></td></tr><tr><td style="font-weight:600">Mable (NDIS)</td><td>NDIS support work platform</td><td><a href="https://www.mable.com.au" target="_blank" style="color:var(--accent)">mable.com.au →</a></td></tr></table></div></div>';


CMP.sydney='<div class="card"><h2>🌊 Why Not Sydney — Cost Summary</h2><p class="tx tm mb2">Sydney was considered but Melbourne wins financially.</p><div class="table-wrap"><table><tr><th></th><th style="color:var(--accent)">Melbourne</th><th style="color:var(--orange)">Sydney</th><th>Difference</th></tr><tr><td style="font-weight:600">4-bed rent/wk</td><td>$580–800</td><td>$900–1,200</td><td class="tr">Syd +$300–400/wk</td></tr><tr><td style="font-weight:600">School fees (2 kids/yr)</td><td style="color:var(--green)">FREE</td><td style="color:var(--red)">$11,200+</td><td class="tr">Syd +$11,200/yr</td></tr><tr><td style="font-weight:600">Annual cost difference</td><td colspan="2"></td><td style="color:var(--red);font-weight:700">Sydney costs $25,000–35,000/yr MORE</td></tr><tr><td style="font-weight:600">Monthly disposable</td><td style="color:var(--green)">$3,500–4,100</td><td style="color:var(--red)">$800–1,500</td><td></td></tr></table></div><p class="ts mt2">On $159k salary, Sydney would leave you with under $1,500/mo disposable after a 4-bed rent + school fees. Melbourne gives you $3,500–4,100/mo. The decision is clear.</p></div>';
