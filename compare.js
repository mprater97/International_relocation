var GMAPS_KEY='AIzaSyCkKC4fUOBNqnXghQNUGTHe4lZ06gIILIY';
function loadSuburbPhotos(name,containerId){
  var el=document.getElementById(containerId);
  if(!el)return;
  // Use Places Text Search to find the suburb, then get photos
  var query=encodeURIComponent(name+' Victoria Australia');
  fetch('https://maps.googleapis.com/maps/api/place/textsearch/json?query='+query+'&key='+GMAPS_KEY)
    .then(function(r){return r.json()})
    .then(function(data){
      if(data.results&&data.results[0]&&data.results[0].photos){
        var photos=data.results[0].photos.slice(0,5);
        el.innerHTML=photos.map(function(p){
          return '<img src="https://maps.googleapis.com/maps/api/place/photo?maxwidth=300&photo_reference='+p.photo_reference+'&key='+GMAPS_KEY+'" style="height:100px;border-radius:8px;object-fit:cover;flex:0 0 auto" loading="lazy">';
        }).join('');
      } else {
        el.innerHTML='<a href="https://www.google.com/maps/search/'+query+'" target="_blank" style="font-size:.7rem;color:var(--accent);padding:10px">📷 View on Google Maps</a>';
      }
    })
    .catch(function(){
      el.innerHTML='<a href="https://www.google.com/maps/search/'+query+'" target="_blank" style="font-size:.7rem;color:var(--accent);padding:10px">📷 View on Google Maps</a>';
    });
}
function renderCompare(){
  document.getElementById('locations').innerHTML=
    '<div class="card" style="border-left:4px solid var(--accent)">'+
    '<h2>🏙️ Melbourne — Location Guide</h2>'+
    '<p class="ts tm">$159k salary | 4-bed with garden | Beach lifestyle</p>'+
    '<div class="stabs mt2">'+
    '<div class="stab active" onclick="showCmp(\'suburbs\',this)">🏘️ Suburbs</div>'+
    '<div class="stab" onclick="showCmp(\'costs\',this)">💰 Living Costs</div>'+
    
    
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
  var html='<div class="card"><h2>⭐ My Suburb Shortlist</h2><p class="tx tm mb2">Add areas, rate them, enter real prices. Rate each feature 1–10 for a better spread.</p>';
  
  // Add new area form
  html+='<div class="flex g2 fw aic mb2"><input type="text" id="slName" placeholder="Suburb name" style="flex:1;min-width:150px"><input type="number" id="slRent" placeholder="Actual rent $/wk" style="max-width:130px"><input type="text" id="slLink" placeholder="Listing URL (optional)" style="flex:1;min-width:150px"><button class="btn btn-p" onclick="addToShortlist()">+ Add</button></div>';
  
  if(areas.length){
    html+='<div class="table-wrap"><table><tr><th>Suburb</th><th>Rent/wk</th><th>Beach</th><th>Commute</th><th>Schools</th><th>Lifestyle</th><th>Value</th><th>Total</th><th>Notes</th><th></th></tr>';
    areas.sort(function(a,b){return (b.scores||{}).total-(a.scores||{}).total});
    areas.forEach(function(a,i){
      var s=a.scores||{beach:0,commute:0,schools:0,lifestyle:0,value:0};
      s.total=(s.beach||0)+(s.commute||0)+(s.schools||0)+(s.lifestyle||0)+(s.value||0);
      var nameColor=s.total>=40?'var(--green)':s.total>=30?'var(--accent)':'var(--muted)';
      html+='<tr><td style="font-weight:600">'+(a.link?'<a href="'+a.link+'" target="_blank" style="color:var(--accent)">'+a.name+' →</a>':a.name)+(s.total>0?' <span style="background:'+nameColor+';color:#fff;padding:1px 6px;border-radius:10px;font-size:.7rem;font-weight:700;margin-left:4px">'+s.total+'</span>':'')+'</td>';
      html+='<td><input type="number" class="ism" value="'+(a.rent||'')+'" placeholder="$" oninput="updateShortlist('+i+',\'rent\',+this.value)"></td>';
      ['beach','commute','schools','lifestyle','value'].forEach(function(k){
        html+='<td><select onchange="updateShortlistScore('+i+',\''+k+'\',+this.value)" style="width:45px">';
        for(var n=0;n<=10;n++)html+='<option value="'+n+'" '+(s[k]===n?'selected':'')+'>'+(n===0?'-':n)+'</option>';
        html+='</select></td>';
      });
      html+='<td style="font-weight:700;color:'+(s.total>=40?'var(--green)':s.total>=30?'var(--accent)':'var(--muted)')+'">'+s.total+'/50</td>';
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
      if(wtotal>0)html+='<div class="card mt2" style="border-left:4px solid var(--green)"><h3 style="color:var(--green)">🏆 Current Leader: '+winner.name+' ('+wtotal+'/50)</h3></div>';
    }
  } else {
    html+='<p class="tm ts">No areas shortlisted yet. Add suburbs above to start comparing.</p>';
  }
  html+='</div>';
  
  // Scoring guide
  html+='<div class="card"><h3>Scoring Guide (1–10)</h3><div class="table-wrap"><table><tr><th>Score</th><th>Beach</th><th>Commute</th><th>Schools</th><th>Lifestyle</th><th>Value</th></tr><tr><td>9–10</td><td>On the beach / walk</td><td>&lt;25 min door-to-door</td><td>Top rated (VCE 90+)</td><td>Everything walkable, buzzing community</td><td>Under $550/wk 4-bed</td></tr><tr><td>7–8</td><td>5 min drive</td><td>25–35 min</td><td>Good (VCE 80+)</td><td>Most things nearby, good vibe</td><td>$550–650/wk</td></tr><tr><td>5–6</td><td>10–15 min drive</td><td>35–45 min</td><td>Average</td><td>Some things nearby</td><td>$650–750/wk</td></tr><tr><td>3–4</td><td>20 min drive</td><td>45–55 min</td><td>Below average</td><td>Limited, need to drive</td><td>$750–900/wk</td></tr><tr><td>1–2</td><td>30+ min drive</td><td>55+ min</td><td>Poor / no data</td><td>Very limited</td><td>$900+/wk</td></tr></table></div></div>';
  
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
  {name:'Seaford',safety:4,walk:3,familyScore:4,growth:4,crime:'Low',walkScore:'Moderate — car helpful but train+beach walkable',demographics:'Young families, retirees, growing professional mix',pros:'Affordable beach lifestyle, improving rapidly, foreshore trail, good community',cons:'Further from city (50 min), limited nightlife, some older housing stock',cafes:'Foreshore cafes, fish & chips, growing brunch scene',shops:'Local shops + 10 min to Frankston Bayside Centre',outdoors:'Beach, foreshore trail, wetlands, playgrounds',community:'Relaxed village, young families, community markets',school:'Monterey SC',schoolRating:'VCE median 25 — Average',schoolLink:'https://www.google.com/search?q=Monterey+Secondary+College+Frankston',pc:'3198',bed3:'520–580',bed4:'580–650',train:50,beach:'ON beach',garden:'Yes',vibe:'Beach village, foreshore trail, relaxed',lat:-38.1,lng:145.134},
  {name:'Carrum',safety:4,walk:3,familyScore:5,growth:3,crime:'Low',walkScore:'Moderate — beach walkable, car for shops',demographics:'Families, quiet retirees, boat owners',pros:'Very quiet, Patterson River lifestyle, beach on doorstep, tight community',cons:'Small suburb, limited shops/cafes, need car for most things',cafes:'Small cafe strip, Patterson River dining',shops:'Local shops, 10 min to Frankston',outdoors:'Beach, Patterson River walks, boat ramp',community:'Quiet family streets, tight-knit',school:'Patterson River SC',schoolRating:'VCE median 26 — Average',schoolLink:'https://www.google.com/search?q=Patterson+River+Secondary+College',pc:'3197',bed3:'530–590',bed4:'600–680',train:48,beach:'ON beach',garden:'Yes',vibe:'Quiet beach, Patterson River, family',lat:-38.075,lng:145.123},
  {name:'Frankston',safety:3,walk:4,familyScore:4,growth:5,crime:'Low-Medium (improving rapidly)',walkScore:'Good — shops, beach, train all walkable',demographics:'Mixed — families, young professionals, growing gentrification',pros:'Best value beach suburb, massive investment happening, great facilities, arts centre',cons:'Reputation (outdated — rapidly improving), some rougher pockets inland',cafes:'Waterfront cafes, restaurants on Nepean Hwy, night dining',shops:'Bayside Centre (major), Power Centre',outdoors:'Beach, pier, foreshore park, botanic gardens, skatepark',community:'Coastal town buzz, markets, events, arts centre',school:'Frankston High',schoolRating:'VCE median 28 — Good',schoolLink:'https://www.google.com/search?q=Frankston+High+School+Victoria',pc:'3199',bed3:'500–600',bed4:'580–680',train:55,beach:'ON beach',garden:'Yes',vibe:'Coastal town, cafes, markets, improving',lat:-38.143,lng:145.126},
  {name:'Frankston South',safety:5,walk:3,familyScore:5,growth:3,crime:'Very low',walkScore:'Low — car needed, quiet residential streets',demographics:'Established families, professionals',pros:'Very safe, leafy, larger blocks, quiet, near Frankston amenities',cons:'Need car everywhere, less community buzz, slightly more expensive',cafes:'Quiet, local cafes',shops:'Near Frankston Bayside',outdoors:'Sweetwater Creek, bushland walks, 5 min to beach',community:'Leafy, quiet, established families',school:'Frankston High',schoolRating:'VCE median 28 — Good',schoolLink:'https://www.google.com/search?q=Elisabeth+Murdoch+College+Langwarrin',pc:'3199',bed3:'580–650',bed4:'650–750',train:58,beach:'5 min',garden:'Yes',vibe:'Leafy, quiet, larger properties',lat:-38.16,lng:145.13},
  {name:'Langwarrin',safety:5,walk:2,familyScore:5,growth:4,crime:'Very low',walkScore:'Low — car essential, suburban estates',demographics:'Young families with kids, new home owners',pros:'Safest area, biggest gardens, newest houses, great parks, very affordable',cons:'No beach (12 min drive), car essential, less character than coastal suburbs',cafes:'Local cafes, Gateway food court',shops:'Gateway Shopping Centre, Karingal Hub',outdoors:'Lloyd Park, Flora & Fauna Reserve, 12 min to beach',community:'New estates, parks, playgrounds, family-focused',school:'Elisabeth Murdoch College',schoolRating:'VCE median 27 — Good',schoolLink:'https://www.google.com/search?q=Cranbourne+Secondary+College',pc:'3910',bed3:'480–550',bed4:'550–630',train:60,beach:'12 min',garden:'Yes ★',vibe:'New estates, big gardens, parks, space',lat:-38.167,lng:145.17},
  {name:'Karingal',safety:4,walk:3,familyScore:4,growth:3,crime:'Low',walkScore:'Moderate — Karingal Hub walkable for some',demographics:'Families, affordable housing seekers',pros:'Very affordable, near Frankston shops, quiet',cons:'Less character, older housing, not as much happening',cafes:'Karingal Hub food court, local cafes',shops:'Karingal Hub, near Frankston',outdoors:'Karingal Reserve, 10 min to beach',community:'Affordable, family area',school:'Frankston High',schoolRating:'VCE median 28 — Good',schoolLink:'https://www.google.com/search?q=Parkdale+Secondary+College',pc:'3199',bed3:'460–520',bed4:'530–600',train:58,beach:'10 min',garden:'Yes',vibe:'Affordable, near Frankston shops',lat:-38.15,lng:145.15},
  {name:'Cranbourne',safety:3,walk:2,familyScore:4,growth:5,crime:'Low-Medium',walkScore:'Low — car essential',demographics:'Young families, multicultural, new estates',pros:'Cheapest option, brand new houses, Royal Botanic Gardens, growing fast',cons:'25 min to beach, less established community, some areas still developing',cafes:'Growing cafe scene, Cranbourne Park food',shops:'Cranbourne Park Shopping Centre',outdoors:'Royal Botanic Gardens Cranbourne, 25 min to beach',community:'New estates, growing, diverse',school:'Cranbourne SC',schoolRating:'VCE median 24 — Below Avg',schoolLink:'https://www.google.com/search?q=Mordialloc+College',pc:'3977',bed3:'450–520',bed4:'520–600',train:55,beach:'25 min',garden:'Yes ★',vibe:'Very affordable, new estates, growing',lat:-38.099,lng:145.283},
  {name:'Mordialloc',safety:4,walk:5,familyScore:5,growth:3,crime:'Low',walkScore:'Excellent — beach, shops, train, cafes all walkable',demographics:'Families, young professionals, dog owners',pros:'Best walkability, beach+creek+pier, great cafe strip, strong community, close to everything',cons:'Smaller blocks near water, slightly higher rent, parking busy on weekends',cafes:'Main St strip — cafes, pubs, restaurants. Great brunch',shops:'Local Main St shops + 15 min Chadstone/Southland',outdoors:'Beach, Mordialloc Creek, pier, coastal walk',community:'Strong community, pier fishing, weekend markets',school:'Parkdale SC',schoolRating:'VCE median 30 — Good+',schoolLink:'https://www.google.com/search?q=Mentone+Girls+Secondary+College',pc:'3195',bed3:'600–680',bed4:'680–780',train:38,beach:'ON beach',garden:'Some',vibe:'Beach + creek, cafes, pier, family',lat:-37.987,lng:145.087},
  {name:'Aspendale',safety:4,walk:4,familyScore:5,growth:3,crime:'Low',walkScore:'Good — beach walkable, train nearby',demographics:'Quiet families, nature lovers',pros:'Quiet beach suburb, Edithvale wetlands, less busy than Mordialloc',cons:'Less cafe/shop options, quieter (pro or con depending on preference)',cafes:'Quiet local cafes, near Mordialloc strip',shops:'Near Southland, local shops',outdoors:'Beach, Edithvale wetlands, bike paths',community:'Quiet beach suburb, families',school:'Mordialloc College',schoolRating:'VCE median 28 — Good',schoolLink:'https://www.google.com/search?q=Cheltenham+Secondary+College',pc:'3195',bed3:'620–700',bed4:'700–800',train:40,beach:'ON beach',garden:'Some',vibe:'Quiet beach, Edithvale wetlands',lat:-38.025,lng:145.103},
  {name:'Mentone',safety:5,walk:5,familyScore:5,growth:3,crime:'Very low',walkScore:'Excellent — village shops, beach, train all walkable',demographics:'Established families, professionals, dog walkers',pros:'Village feel, very safe, leafy streets, great schools, walkable to everything',cons:'Higher rent, established area (less new housing), competitive rental market',cafes:'Mentone Parade cafes, brunch spots, bakeries',shops:'Village shops + Southland (major) 5 min',outdoors:'Beach, coastal trail, parks, quiet cycling streets',community:'Village feel, tree-lined, families, dog walkers',school:'Mentone Girls SC / Parkdale SC',schoolRating:'VCE median 31–32 — Very Good',schoolLink:'https://www.google.com/search?q=Glen+Waverley+Secondary+College',pc:'3194',bed3:'650–750',bed4:'750–880',train:35,beach:'5 min',garden:'Yes',vibe:'Village feel, cafes, leafy streets',lat:-37.983,lng:145.067},
  {name:'Cheltenham',safety:4,walk:4,familyScore:4,growth:3,crime:'Low',walkScore:'Good — Southland walkable, train nearby',demographics:'Mix of families and professionals',pros:'Central location, Southland shopping, good access to everywhere, reasonable rent',cons:'Not on beach (8 min drive), less character than village suburbs, busier roads',cafes:'Charman Rd cafes, Southland food precinct',shops:'Southland Shopping Centre (huge), DFO nearby',outdoors:'8 min to beach, parks, bike paths',community:'Central, well-connected, professionals + families',school:'Cheltenham SC',schoolRating:'VCE median 29 — Good',schoolLink:'https://www.google.com/search?q=Mount+Waverley+Secondary+College',pc:'3192',bed3:'620–700',bed4:'700–800',train:32,beach:'8 min',garden:'Yes',vibe:'Central, good access everywhere',lat:-37.957,lng:145.053},
  {name:'Glen Waverley',safety:4,walk:4,familyScore:5,growth:3,crime:'Low',walkScore:'Good — Kingsway strip, The Glen, train walkable',demographics:'Multicultural families (large Asian community), education-focused',pros:'Best schools, incredible food scene, The Glen shopping, family-oriented',cons:'30 min to beach, competitive school zone, higher rent for the area, busy',cafes:'Kingsway — Asian restaurants, bubble tea, yum cha, hotpot',shops:'The Glen Shopping Centre, Kingsway strip',outdoors:'Jells Park, Valley Reserve, 30 min to beach',community:'Multicultural, food-focused, top schools, family',school:'Glen Waverley SC',schoolRating:'VCE median 34 — Excellent (91.40)',schoolLink:'https://www.google.com/search?q=Box+Hill+High+School',pc:'3150',bed3:'650–750',bed4:'750–900',train:40,beach:'30 min',garden:'Yes',vibe:'Top schools (91.40), Asian food hub',lat:-37.878,lng:145.163},
  {name:'Mt Waverley',safety:5,walk:3,familyScore:5,growth:3,crime:'Very low',walkScore:'Moderate — village shops walkable, car for most',demographics:'Established families, quiet professionals',pros:'Very safe, leafy, good schools, quieter than Glen Waverley, parks',cons:'30 min to beach, less food/cafe scene than Glen Waverley, car needed',cafes:'Local village cafes, near Glen Waverley strip',shops:'Near The Glen, local shops',outdoors:'Valley Reserve, Damper Creek, parks',community:'Leafy, quiet, established families',school:'Mt Waverley SC',schoolRating:'VCE median 31 — Very Good',schoolLink:'https://www.google.com/search?q=Sandringham+College+Victoria',pc:'3149',bed3:'600–680',bed4:'680–780',train:35,beach:'30 min',garden:'Yes',vibe:'Leafy, quieter, good primaries',lat:-37.877,lng:145.129},
  {name:'Box Hill',safety:3,walk:5,familyScore:3,growth:4,crime:'Low-Medium (busy area)',walkScore:'Excellent — everything walkable, major transport hub',demographics:'Very multicultural, students, young professionals, families',pros:'Best transport links (25 min CBD), amazing Asian food, affordable for location',cons:'Busy/urban feel, smaller blocks, less family-suburb vibe, some apartment towers',cafes:'Massive Asian food scene — dumplings, BBQ, bubble tea',shops:'Box Hill Central, Market Street',outdoors:'Box Hill Gardens, bike paths, 35 min to beach',community:'Multicultural hub, vibrant, busy',school:'Box Hill High',schoolRating:'VCE median 29 — Good',schoolLink:'https://www.google.com/search?q=Brighton+Secondary+College',pc:'3128',bed3:'550–630',bed4:'630–720',train:25,beach:'35 min',garden:'Some',vibe:'Asian hub, great food, direct train',lat:-37.819,lng:145.122},
  {name:'Sandringham',safety:5,walk:4,familyScore:5,growth:2,crime:'Very low',walkScore:'Good — village, beach, train walkable',demographics:'Established wealthy families',pros:'Beautiful village, beach, very safe, great schools, leafy',cons:'Expensive, established (hard to find rentals), less diverse',cafes:'Village cafes, Bay Rd restaurants',shops:'Sandringham village, near Southland',outdoors:'Beach, Half Moon Bay, coastal walks',community:'Village, leafy, established families',school:'Sandringham College',schoolRating:'VCE median 30 — Good+',schoolLink:'https://www.google.com/search?q=Mornington+Secondary+College',pc:'3191',bed3:'750–880',bed4:'880–1050',train:28,beach:'ON beach',garden:'Yes',vibe:'Village, beach, leafy, family',lat:-37.951,lng:145.01},
  {name:'Brighton',safety:5,walk:4,familyScore:5,growth:2,crime:'Very low',walkScore:'Good — Church St, beach, train walkable',demographics:'Wealthy established families, professionals',pros:'Iconic, beautiful, best beaches, amazing cafes, top schools, safe',cons:'Most expensive, very established, competitive rentals, less diverse',cafes:'Church St cafes, Bay St restaurants, wine bars',shops:'Church St boutiques, Bay St, 15 min Chadstone',outdoors:'Brighton Beach (bathing boxes), Half Moon Bay, coastal walk',community:'Upmarket, leafy, private schools nearby',school:'Brighton SC',schoolRating:'VCE median 32 — Very Good',schoolLink:'https://www.findmyschool.vic.gov.au',pc:'3186',bed3:'850–1000',bed4:'1000–1300',train:25,beach:'ON beach',garden:'Yes',vibe:'Iconic bathing boxes, upmarket',lat:-37.907,lng:144.987},
  {name:'Mornington',safety:4,walk:4,familyScore:5,growth:4,crime:'Low',walkScore:'Good — Main St, beach, pier walkable',demographics:'Families, sea-changers, retirees, winery workers',pros:'Peninsula lifestyle, wineries, markets, strong community, beach, big gardens',cons:'70 min to CBD (long commute), limited train, need car, further from kids activities in city',cafes:'Main St cafes, wineries, breweries, brunch culture',shops:'Main St boutiques, Mornington Central',outdoors:'Beach, Mills Beach, pier, coastal walks, hot springs nearby',community:'Peninsula village, markets, wineries, strong community',school:'Mornington SC',schoolRating:'VCE median 27 — Good',schoolLink:'https://www.findmyschool.vic.gov.au',pc:'3931',bed3:'580–680',bed4:'680–800',train:70,beach:'ON beach',garden:'Yes ★',vibe:'Village, wineries, pier, markets',lat:-38.218,lng:145.038},
  {name:'Mt Martha',safety:5,walk:3,familyScore:5,growth:3,crime:'Very low',walkScore:'Low — car needed, quiet residential',demographics:'Families seeking space, nature lovers',pros:'Beautiful beaches, bushland, very quiet, safe, big properties',cons:'75 min to CBD, very car-dependent, limited shops/cafes, isolated feel',cafes:'Quiet local cafes, near Mornington Main St',shops:'Near Mornington Central',outdoors:'Beautiful beaches, bushland walks, Briars wildlife',community:'Quiet, nature-focused, families',school:'Mornington SC',schoolRating:'VCE median 27 — Good',schoolLink:'https://www.findmyschool.vic.gov.au',pc:'3934',bed3:'620–700',bed4:'700–850',train:75,beach:'ON beach',garden:'Yes ★',vibe:'Quiet, beautiful beaches, bushland',lat:-38.27,lng:145.02},
  {name:'Richmond',safety:3,walk:5,familyScore:3,growth:3,crime:'Low-Medium (urban area)',walkScore:'Excellent — everything walkable, 5 min to CBD',demographics:'Young professionals, Amazon staff, diverse, some families',pros:'Closest to work (5 min!), incredible food/cafe scene, Yarra River, vibrant',cons:'Urban not suburban, smaller properties, less garden space, busy, not beach lifestyle',pc:'3121',bed3:'600–750',bed4:'750–950',train:5,beach:'20 min',garden:'Some',vibe:'Amazon popular. Cafes, shops, parks. Inner city but residential',lat:-37.818,lng:144.998,school:'Richmond High',schoolRating:'VCE median 28 — Good',schoolLink:'https://www.google.com/search?q=Richmond+High+School+Melbourne',cafes:'Bridge Rd + Swan St — huge cafe scene, Vietnamese food hub',shops:'Bridge Rd, Victoria Gardens centre',outdoors:'Yarra River trails, Burnley Park, Botanic Gardens nearby',community:'Young professionals + families, diverse, Amazon crowd'},
  {name:'Windsor',safety:4,walk:5,familyScore:4,growth:3,crime:'Low',walkScore:'Excellent — Chapel St, Albert Park, train walkable',demographics:'Young professionals, couples, some families',pros:'Albert Park Lake (F1!), great cafes, quieter than St Kilda, close to beach+city',cons:'Smaller properties, less garden, urban feel, 15 min to beach not on it',pc:'3181',bed3:'550–700',bed4:'700–900',train:8,beach:'15 min (St Kilda)',garden:'Some',vibe:'Quieter than St Kilda. Nice pubs, cafes, parks',lat:-37.856,lng:144.991,school:'Albert Park College',schoolRating:'VCE median 29 — Good',schoolLink:'https://www.google.com/search?q=Albert+Park+College+Melbourne',cafes:'Chapel St south — quieter cafes, wine bars, brunch',shops:'Chapel St, Prahran Market',outdoors:'Albert Park Lake (F1 track!), Fawkner Park, St Kilda beach 15 min',community:'Quieter St Kilda alternative, families + young professionals'}
];

var SCHOOL_INFO={
  'Richmond':{students:'~900',type:'Co-ed Yr 7–12 (Yr 7–12, both kids attend)',extra:'Inner city school. Diverse. Strong arts & digital media. Close to MCG and sporting precinct'},
  'Windsor':{students:'~1,000',type:'Co-ed Yr 7–12 (Yr 7–12, both kids attend)',extra:'Albert Park College — modern school, strong academics, near F1 track/Albert Park Lake. Good creative programs'},
  'Seaford':{students:'~800',type:'Co-ed Yr 7–12 (Yr 7–12, both kids attend)',extra:'Specialist basketball & volleyball programs. Wellbeing focus. New STEM building. Good transition support for international students'},
  'Carrum':{students:'~1,100',type:'Co-ed Yr 7–12 (Yr 7–12, both kids attend)',extra:'Strong outdoor ed & marine studies program. Environmental science focus. Smaller community feel. Active camps program'},
  'Frankston':{students:'~1,800',type:'Co-ed Yr 7–12 (Yr 7–12, both kids attend)',extra:'Large school with ACCELERATED LEARNING program (selective entry). Strong sport — swimming, athletics, football. Performing arts centre. Good ESL & transition support'},
  'Frankston South':{students:'~1,800',type:'Co-ed Yr 7–12 (Yr 7–12, both kids attend)',extra:'Same as Frankston High — accelerated program available. Large school with wide subject choice'},
  'Karingal':{students:'~1,800',type:'Co-ed Yr 7–12 (Yr 7–12, both kids attend)',extra:'Frankston High zone — accelerated program. Large school = wide subject choice at VCE level'},
  'Langwarrin':{students:'~1,200',type:'Co-ed Yr 7–12 (Yr 7–12, both kids attend)',extra:'Arts & performance focus. Dance, drama, music programs. Good pastoral care — dedicated wellbeing team for new students'},
  'Cranbourne':{students:'~900',type:'Co-ed Yr 7–12 (Yr 7–12, both kids attend)',extra:'Growing area, newer facilities. Improving results year-on-year. STEM & robotics programs. Diverse student body'},
  'Mordialloc':{students:'~1,400',type:'Co-ed Yr 7–12 (Yr 7–12, both kids attend)',extra:'Strong music & performing arts program. Active sport — beach sports, swimming. Good academic results. Smaller than average = more attention'},
  'Aspendale':{students:'~700',type:'Co-ed Yr 7–12 (Yr 7–12, both kids attend)',extra:'Smaller school = very personal attention. Environmental focus (near wetlands). Good for students who prefer less overwhelming environment'},
  'Mentone':{students:'~900 (girls) / ~1,400 (Parkdale)',type:'Mentone Girls (selective entry) + Parkdale Co-ed  (Yr 7–12, both kids attend)',extra:'MENTONE GIRLS: strong academics, STEM focus, all-girls environment, leadership programs, debating. PARKDALE: strong music & performing arts, co-ed, inclusive, good results'},
  'Cheltenham':{students:'~600',type:'Co-ed Yr 7–12 (Yr 7–12, both kids attend)',extra:'Smallest school on list = very personal. Strong community feel. Excellent support for new arrivals. Every student known by name'},
  'Glen Waverley':{students:'~2,100',type:'Co-ed Yr 7–12 (Yr 7–12, both kids attend)',extra:'TOP PUBLIC SCHOOL in Melbourne. Accelerated program (selective entry Yr 9). Languages: Mandarin, Japanese, French. STEM excellence. Robotics. Debating. Very competitive catchment — must live in zone to attend'},
  'Mt Waverley':{students:'~1,500',type:'Co-ed Yr 7–12 (Yr 7–12, both kids attend)',extra:'Strong academics + outstanding music program (orchestra, bands). Good pastoral care. Less pressure than Glen Waverley but still strong results. Languages program'},
  'Box Hill':{students:'~1,000',type:'Co-ed Yr 7–12 (Yr 7–12, both kids attend)',extra:'Very diverse school — 60+ nationalities. Excellent ESL & international student support. Strong arts & digital media. Good for students transitioning from overseas'},
  'Sandringham':{students:'~1,200',type:'Co-ed Yr 7–12 (Yr 7–12, both kids attend)',extra:'Beach location influences culture — outdoor ed, sailing, beach sports. Strong performing arts (theatre, dance). Relaxed but academic. Good creative programs'},
  'Brighton':{students:'~1,100',type:'Co-ed Yr 7–12 (Yr 7–12, both kids attend)',extra:'Strong academics + sport (rowing, athletics). Near several private school alternatives if needed later. Good VCE results. Active parent community'},
  'Mornington':{students:'~1,400',type:'Co-ed Yr 7–12 (Yr 7–12, both kids attend)',extra:'Peninsula school with unique programs: marine studies, surfing program, outdoor ed camps. Environmental science. Active sport. Relaxed coastal culture'},
  'Mt Martha':{students:'~1,400',type:'Co-ed Yr 7–12 (Yr 7–12, both kids attend)',extra:'Same as Mornington SC — surfing program, outdoor ed, marine studies. Peninsula lifestyle school'},
};


var suburbView='list';
function initSuburbMap(){
  var mapEl=document.getElementById('suburbMap');
  if(!mapEl||!window.L)return;
  var map=L.map('suburbMap').setView([-37.95,145.05],11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap',maxZoom:16}).addTo(map);
  
  var colors={'🏖️ BUDGET — Beach':'#22c55e','🏡 BUDGET — Inland':'#16a34a','🏙️ INNER — Amazon Popular':'#3b82f6','🌊 MID — Bayside':'#06b6d4','🏫 MID — Eastern':'#8b5cf6','💎 PREMIUM':'#f59e0b','🍷 PENINSULA':'#ec4899'};
  var tiers=[
    {name:'🏖️ BUDGET — Beach',suburbs:['Seaford','Carrum','Frankston','Frankston South']},
    {name:'🏡 BUDGET — Inland',suburbs:['Langwarrin','Karingal','Cranbourne']},
    {name:'🏙️ INNER — Amazon Popular',suburbs:['Richmond','Windsor']},
    {name:'🌊 MID — Bayside',suburbs:['Mordialloc','Aspendale','Mentone','Cheltenham']},
    {name:'🏫 MID — Eastern',suburbs:['Glen Waverley','Mt Waverley','Box Hill']},
    {name:'💎 PREMIUM',suburbs:['Sandringham','Brighton']},
    {name:'🍷 PENINSULA',suburbs:['Mornington','Mt Martha']},
  ];
  
  tiers.forEach(function(tier){
    var color=colors[tier.name]||'#94a3b8';
    tier.suburbs.forEach(function(sname){
      var s=SUBURBS_DATA.find(function(x){return x.name===sname});
      if(!s)return;
      var bed4mo=Math.round(parseInt(s.bed4)*52/12);
      var icon=L.divIcon({html:'<div style="background:'+color+';padding:2px 6px;border-radius:10px;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,.3);font-size:10px;font-weight:700;color:#fff;white-space:nowrap">£'+Math.round(bed4mo*0.532)+'</div>',iconSize:[50,20],iconAnchor:[25,10],className:''});
      var marker=L.marker([s.lat,s.lng],{icon:icon}).addTo(map);
      var mc=s.train<=15?5:s.train<=30?4:s.train<=45?3:s.train<=60?2:1;
      var mf=s.familyScore;var ml=Math.round((s.walk+(s.safety||3))/2);
      var mfi=parseInt(s.bed4)<=600?5:parseInt(s.bed4)<=700?4:parseInt(s.bed4)<=850?3:parseInt(s.bed4)<=1000?2:1;
      var mb=s.beach==='ON beach'?5:/^5/.test(s.beach)?4:/^[89]|^1[012]/.test(s.beach)?3:/^1[3-9]|^2[0-5]/.test(s.beach)?2:1;
      var mvce=parseInt((s.schoolRating||'').match(/\d+/)||[0]);var msc=mvce>=32?5:mvce>=29?4:mvce>=27?3:mvce>=25?2:1;
      var mw=((mf*25+ml*20+mfi*17.5+mc*17.5+mb*10+msc*10)/100).toFixed(1);
      var mwc=mw>=4?'#16a34a':mw>=3?'#3b82f6':'#6b7280';
      marker.bindPopup('<div style="min-width:200px"><strong>'+s.name+'</strong> <span style="background:'+mwc+';color:#fff;padding:1px 6px;border-radius:8px;font-size:.7rem">'+mw+'/5</span><br><span style="font-size:.85rem">4-bed: $'+bed4mo+'/mo (£'+Math.round(bed4mo*0.532)+')<br>Train: '+s.train+' min | Beach: '+s.beach+'<br>School: '+s.school+' ('+s.schoolRating+')</span><br><button onclick="showSuburbDetail(\''+s.name+'\')" style="margin-top:4px;padding:4px 8px;background:#3b82f6;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:.75rem">View full details</button></div>');
    });
  });
  
  // Add MEL12 office marker
  var officeIcon=L.divIcon({html:'<div style="background:#ef4444;width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font-size:10px">🏢</div>',iconSize:[18,18],iconAnchor:[9,9],className:''});
  L.marker([-37.8178,144.9581],{icon:officeIcon}).addTo(map).bindPopup('<strong>Amazon MEL12</strong><br>555 Collins St, Melbourne CBD');
}

function showSuburbDetail(name){
  var s=SUBURBS_DATA.find(function(x){return x.name===name});
  if(!s)return;
  var si=SCHOOL_INFO[name]||{};
  var d=(state.suburbData||{})[name]||{};
  var bed4mo=Math.round(parseInt(s.bed4)*52/12);
  var bed3mo=Math.round(parseInt(s.bed3)*52/12);
  var disposable=9571-bed4mo-3345;
  var mapUrl='https://www.google.com/maps/search/'+s.name.replace(/ /g,'+')+'+Victoria+Australia/@'+s.lat+','+s.lng+',14z';
  var domainUrl='https://www.domain.com.au/rent/'+s.name.toLowerCase().replace(/ /g,'-')+'-vic-'+s.pc+'/?bedrooms=3-any&propertytype=house';
  var el=document.getElementById('suburbMapInfo');
  if(!el)return;
  el.style.display='block';
  el.innerHTML='<div class="flex jcb aic"><h2 style="margin:0">'+s.name+'</h2><button class="btn btn-o" style="padding:4px 10px" onclick="this.parentElement.parentElement.style.display=\'none\'">✕ Close</button></div>'+
    '<p class="ts tm">'+s.vibe+'</p>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0">'+
    '<div class="card" style="margin:0;padding:12px"><h3 style="font-size:.9rem">💰 Rent</h3><div style="font-size:.9rem"><strong>4-bed: $'+bed4mo+'/mo (£'+Math.round(bed4mo*0.532)+')</strong><br>3-bed: $'+bed3mo+'/mo (£'+Math.round(bed3mo*0.532)+')<br><span class="tx tm">($'+s.bed4+'/wk | $'+s.bed3+'/wk)</span></div></div>'+
    '<div class="card" style="margin:0;padding:12px"><h3 style="font-size:.9rem">💰 Budget</h3><div style="font-size:.9rem">Disposable: <strong>$'+disposable+'/mo (£'+Math.round(disposable*0.532)+')</strong><br><span class="tx tm">After all expenses on $159k salary</span></div></div>'+
    '</div>'+
    '<div class="card" style="margin:8px 0;padding:12px"><h3 style="font-size:.9rem">🚆 Location</h3><div style="font-size:.85rem">Train to CBD (MEL12): <strong>'+s.train+' min</strong><br>Beach: <strong>'+s.beach+'</strong><br>Garden: '+s.garden+'</div></div>'+
    '<div class="card" style="margin:8px 0;padding:12px"><h3 style="font-size:.9rem">🏫 School</h3><div style="font-size:.85rem"><a href="'+s.schoolLink+'" target="_blank" style="color:var(--accent)"><strong>'+s.school+'</strong></a><br>'+s.schoolRating+'<br>'+(si.students?'👥 '+si.students+' · '+si.type+'<br>':'')+( si.extra?'✨ '+si.extra:'')+'</div></div>'+
    '<div class="card" style="margin:8px 0;padding:12px"><h3 style="font-size:.9rem">☕ Lifestyle</h3><div style="font-size:.85rem"><strong>Cafes:</strong> '+s.cafes+'<br><strong>Shopping:</strong> '+s.shops+'<br><strong>Outdoors:</strong> '+s.outdoors+'<br><strong>Community:</strong> '+s.community+'</div></div>'+
    '<div class="card" style="margin:8px 0;padding:12px"><h3 style="font-size:.9rem">📊 Decision Factors</h3><div style="font-size:.85rem">'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:8px">'+
    '<div>🛡️ Safety: <strong>'+s.safety+'/5</strong></div>'+
    '<div>🚶 Walkability: <strong>'+s.walk+'/5</strong></div>'+
    '<div>👨‍👩‍👧‍👦 Family: <strong>'+s.familyScore+'/5</strong></div>'+
    '<div>📈 Growth: <strong>'+s.growth+'/5</strong></div>'+
    '</div>'+
    '<div><strong>Crime:</strong> '+s.crime+'</div>'+
    '<div><strong>Walk score:</strong> '+s.walkScore+'</div>'+
    '<div><strong>Demographics:</strong> '+s.demographics+'</div>'+
    '<div style="margin-top:6px;color:var(--green)"><strong>✅ Pros:</strong> '+s.pros+'</div>'+
    '<div style="color:var(--orange)"><strong>⚠️ Cons:</strong> '+s.cons+'</div>'+
    '</div></div>'+
    (function(){
      var commute=s.train<=15?5:s.train<=30?4:s.train<=45?3:s.train<=60?2:1;
      var family=s.familyScore;
      var lifestyle=Math.round((s.walk+(s.safety||3))/2);
      var financial=parseInt(s.bed4)<=600?5:parseInt(s.bed4)<=700?4:parseInt(s.bed4)<=850?3:parseInt(s.bed4)<=1000?2:1;
      var beach=s.beach==='ON beach'?5:/^5/.test(s.beach)?4:/^[89]|^1[012]/.test(s.beach)?3:/^1[3-9]|^2[0-5]/.test(s.beach)?2:1;
      var vce=parseInt((s.schoolRating||'').match(/\d+/)||[0]);var school=vce>=32?5:vce>=29?4:vce>=27?3:vce>=25?2:1;
      var weighted=((family*25+lifestyle*20+financial*17.5+commute*17.5+beach*10+school*10)/100).toFixed(1);
      return '<div class="card" style="margin:8px 0;padding:12px"><h3 style="font-size:.9rem">🎯 Weighted Score — '+weighted+'/5</h3>'+
        '<div style="font-size:.75rem;color:var(--muted);margin-bottom:6px">Family 25% | Lifestyle 20% | Financial 17.5% | Commute 17.5% | Beach 10% | School 10%</div>'+
        '<div style="font-size:.85rem;display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px">'+
        '<div>👨‍👩‍👧‍👦 Family: '+family+'/5</div>'+
        '<div>☕ Lifestyle: '+lifestyle+'/5</div>'+
        '<div>💰 Financial: '+financial+'/5</div>'+
        '<div>🚆 Commute: '+commute+'/5</div>'+
        '<div>🏖️ Beach: '+beach+'/5</div>'+
        '<div>🎓 School: '+school+'/5</div>'+
        '</div>'+
        '<div class="pb mt2" style="height:12px"><div class="pf" style="width:'+(weighted*20)+'%;background:var(--green)"></div></div>'+
        '<div style="font-size:.7rem;color:var(--muted);margin-top:4px">Friction check: '+(s.walk>=4&&s.train<=40?'✅ Low daily friction — walkable + reasonable commute':s.walk>=3&&s.train<=55?'⚡ Moderate friction — some car dependency':'⚠️ Higher friction — car essential, longer commute')+'</div>'+
        '</div>';
    })()+
    '<div class="flex g2 fw" style="margin-top:12px">'+
    '<a href="'+mapUrl+'" target="_blank" class="btn btn-o" style="font-size:.78rem">📍 Google Maps</a>'+
    '<a href="'+domainUrl+'" target="_blank" class="btn btn-o" style="font-size:.78rem">🏠 Browse Listings</a>'+
    '<a href="'+s.schoolLink+'" target="_blank" class="btn btn-o" style="font-size:.78rem">🏫 School Info</a>'+
    '<button class="btn btn-p" style="font-size:.78rem" onclick="addSuburbToShortlist(\''+name+'\')">⭐ Add to Shortlist</button>'+
    '</div>';
  el.scrollIntoView({behavior:'smooth'});
}


function renderSuburbsInteractive(){
  var sd=state.suburbData||{};
  var html='<div class="card"><h2>🏘️ Melbourne Suburbs</h2><div class="flex g2 mb2"><button class="btn '+(suburbView==='map'?'btn-p':'btn-o')+'" onclick="suburbView=\'map\';renderSuburbsInteractive()">🗺️ Map View</button><button class="btn '+(suburbView==='list'?'btn-p':'btn-o')+'" onclick="suburbView=\'list\';renderSuburbsInteractive()">📋 List View</button></div><details style="margin-top:8px"><summary style="cursor:pointer;font-size:.8rem;color:var(--accent);font-weight:600">🎯 How scores are calculated</summary><div style="font-size:.75rem;margin-top:8px;line-height:1.8"><div style="margin-bottom:6px"><strong>Weighted Score /5</strong> = Family 25% + Lifestyle 20% + Financial 17.5% + Commute 17.5% + Beach 10% + School 10%</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:4px"><div>👨‍👩‍👧‍👦 <strong>Family (30%)</strong> — safety, schools, parks, family-friendly</div><div>☕ <strong>Lifestyle (25%)</strong> — walkability + safety average</div><div>💰 <strong>Financial (17.5%)</strong> — rent affordability (4-bed price)</div><div>🚆 <strong>Commute (17.5%)</strong> — train time to CBD</div><div>🤝 <strong>Social (10%)</strong> — walkability to cafes, shops, community</div></div><div style="margin-top:6px"><span style="background:#16a34a;color:#fff;padding:1px 6px;border-radius:8px;font-size:.65rem">4.0+ Great</span> <span style="background:#3b82f6;color:#fff;padding:1px 6px;border-radius:8px;font-size:.65rem">3.0–3.9 Good</span> <span style="background:#6b7280;color:#fff;padding:1px 6px;border-radius:8px;font-size:.65rem">&lt;3.0 Weaker</span></div></div></details></div>';
  if(suburbView==='map'){
    html+='<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;font-size:.75rem">';
    html+='<span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#22c55e"></span> Budget Beach</span>';
    html+='<span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#16a34a"></span> Budget Inland</span>';
    html+='<span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#3b82f6"></span> Inner (Amazon)</span>';
    html+='<span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#06b6d4"></span> Mid Bayside</span>';
    html+='<span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#8b5cf6"></span> Mid Eastern</span>';
    html+='<span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#f59e0b"></span> Premium</span>';
    html+='<span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#ec4899"></span> Peninsula</span>';
    html+='<span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#ef4444"></span> 🏢 Office</span>';
    html+='</div>';
    html+='<div id="suburbMap" style="height:60vh;min-height:350px;border-radius:14px;margin-bottom:16px"></div>';
    html+='<div id="suburbMapInfo" class="card" style="display:none"></div>';
    document.getElementById('cmpContent').innerHTML=html;
    setTimeout(initSuburbMap,100);
    return;
  }
  
  
  // Local tips card
  html+='<div class="card" style="border-left:4px solid var(--orange)"><details><summary style="cursor:pointer;font-size:1.1rem;font-weight:700">💡 Local Tips (from Amazon colleague)</summary>';
  html+='<p class="tx tm mb2">Not factual — one person\'s perspective. But useful context.</p>';
  html+='<div style="font-size:.85rem;line-height:1.9;color:#cbd5e1">';
  html+='<p><strong>Don\'t live in the city centre</strong> — mostly apartments, busy, no need. Suburbs are 10–15 min away and much better for families.</p>';
  html+='<p><strong>Southbank</strong> — like Canary Wharf. Corporate, riverside bars. Not great for families.</p>';
  html+='<p><strong>St Kilda</strong> — great, near beach + Albert Park. But close to nightlife. <strong>Windsor</strong> is quieter alternative (nice pubs, cafes, parks).</p>';
  html+='<p><strong>South Yarra</strong> — super nice, near city. Trendy (Barry\'s, acai bowls, designer dogs). Expensive but you could find a deal. Lots of parks.</p>';
  html+='<p><strong>Brighton</strong> — serious contender for families. Beach, amazing cafes/restaurants, great train links. Very popular with expats.</p>';
  html+='<p><strong>Richmond</strong> — lots of Amazon people live here. Great cafes, shops, parks, bars. Safe bet. Can\'t go wrong.</p>';
  html+='<p style="margin-top:8px"><strong>Must-do places:</strong></p>';
  html+='<ul style="margin:4px 0 0 20px"><li><strong>Westerfolds Park</strong> — bit of a drive but wild kangaroos roaming freely</li><li><strong>Great Ocean Road</strong> — can\'t be missed</li><li><strong>Botanic Gardens + Yarra River</strong> — public BBQs along the river, super active</li><li><strong>Chadstone Shopping Centre</strong> — "best she\'s ever been to, consistently"</li><li><strong>Healesville Sanctuary</strong> — must-do zoo, near Yarra Valley wineries</li></ul>';
  html+='</details></div>';

  var tiers=[
    {name:'🏖️ BUDGET — Beach',suburbs:['Seaford','Carrum','Frankston','Frankston South']},
    {name:'🏡 BUDGET — Inland',suburbs:['Langwarrin','Karingal','Cranbourne']},
    {name:'🌊 MID — Bayside',suburbs:['Mordialloc','Aspendale','Mentone','Cheltenham']},
    {name:'🏫 MID — Eastern',suburbs:['Glen Waverley','Mt Waverley','Box Hill']},
    {name:'🏙️ INNER — Amazon Popular',suburbs:['Richmond','Windsor']},
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
      var disposable=9571-rentMo-3345; // 3345 = monthly costs excl rent
      
      var myRating=(state.suburbRatings||{})[s.name]||0;
      html+='<div style="border:1px solid var(--border);border-radius:10px;padding:12px;margin:8px 0;position:relative">';
      html+='<div style="position:absolute;top:8px;right:10px;font-size:1.1rem;cursor:pointer" title="Your rating">';
      for(var star=1;star<=5;star++)html+='<span onclick="if(!state.suburbRatings)state.suburbRatings={};state.suburbRatings[\''+s.name+'\']=state.suburbRatings[\''+s.name+'\']=='+star+'?0:'+star+';save();renderSuburbsInteractive()" style="color:'+(star<=myRating?'#f59e0b':'#d1d5db')+'">'+(star<=myRating?'★':'☆')+'</span>';
      html+='</div>';
      // Header row - calculate weighted score for badge
      var _c=s.train<=15?5:s.train<=30?4:s.train<=45?3:s.train<=60?2:1;
      var _f=s.familyScore;var _l=Math.round((s.walk+(s.safety||3))/2);
      var _fi=parseInt(s.bed4)<=600?5:parseInt(s.bed4)<=700?4:parseInt(s.bed4)<=850?3:parseInt(s.bed4)<=1000?2:1;
      var _b=s.beach==='ON beach'?5:/^5/.test(s.beach)?4:/^[89]|^1[012]/.test(s.beach)?3:/^1[3-9]|^2[0-5]/.test(s.beach)?2:1;
      var _vce=parseInt((s.schoolRating||'').match(/\d+/)||[0]);var _sc=_vce>=32?5:_vce>=29?4:_vce>=27?3:_vce>=25?2:1;
      var _w=((_f*25+_l*20+_fi*17.5+_c*17.5+_b*10+_sc*10)/100).toFixed(1);
      var _wc=_w>=4?'#16a34a':_w>=3?'#3b82f6':'#6b7280';
      html+='<div class="flex jcb aic fw" style="gap:8px">';
      html+='<div><a href="'+mapUrl+'" target="_blank" style="color:var(--accent);font-weight:700;font-size:1rem">'+s.name+' 📍</a> <span style="background:'+_wc+';color:#fff;padding:2px 7px;border-radius:10px;font-size:.7rem;font-weight:700">'+_w+'/5</span>';
      html+='<div class="tx tm">'+s.vibe+'</div></div>';
      var bed4mid=parseInt(s.bed4);var bed3mid=parseInt(s.bed3);var bed4mo=Math.round(bed4mid*52/12);var bed3mo=Math.round(bed3mid*52/12);html+='<div style="text-align:right"><div style="font-weight:700">4-bed: $'+bed4mo+'/mo (£'+Math.round(bed4mo*0.532)+')</div><div class="tx tm">3-bed: $'+bed3mo+'/mo (£'+Math.round(bed3mo*0.532)+')</div><div class="tx tm" style="font-size:.65rem">($'+s.bed4+'/wk)</div>';
      html+='<div class="tx tm">'+s.train+' min train · '+s.beach+'</div></div>';
      html+='</div>';
      
      // Photo gallery - loads from Google Places
      html+='<div id="gallery_'+s.name.replace(/ /g,'_')+'" style="display:flex;gap:6px;overflow-x:auto;padding:8px 0;margin-top:6px;-webkit-overflow-scrolling:touch"><div style="color:var(--muted);font-size:.7rem;padding:20px">Loading photos...</div></div>';
      setTimeout(function(){loadSuburbPhotos(''+s.name,'gallery_'+s.name.replace(/ /g,'_'))},100*(idx+1));
      // Quick stats row
      html+='<div class="flex g2 fw mt2" style="font-size:.78rem">';
      html+='<span>🏫 <a href="'+(s.schoolLink||'')+'" target="_blank" style="color:var(--accent)">'+( s.school||'—')+'</a> ('+( s.schoolRating||'—')+')</span>';
      html+='<span>💰 ~$'+disposable+'/mo (£'+Math.round(disposable*0.532)+') disposable</span>';
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
  
  // end list view
  
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





CMP.costs='<div class="card" style="border-left:4px solid var(--accent);margin-bottom:12px"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px"><div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap"><div><div class="tm" style="font-size:.7rem">Net Salary</div><div style="font-size:1.1rem;font-weight:700;color:var(--green)">$9,571 (£5,092)/mo</div></div><div style="font-size:1.2rem;color:var(--muted)">−</div><div><div class="tm" style="font-size:.7rem">Living Costs (excl. rent)</div><div style="font-size:1.1rem;font-weight:700;color:var(--orange)">$3,345 (£1,780)/mo</div></div><div style="font-size:1.2rem;color:var(--muted)">=</div><div><div class="tm" style="font-size:.7rem">Before Rent</div><div style="font-size:1.1rem;font-weight:700;color:var(--green)">$6,226 (£3,312)/mo</div><div class="tm" style="font-size:.65rem">Subtract your suburb\'s rent for final disposable</div></div></div><button class="btn btn-o" style="font-size:.7rem;padding:6px 10px" onclick="document.getElementById(\'lcPopup\').style.display=document.getElementById(\'lcPopup\').style.display===\'block\'?\'none\':\'block\'">📋 What\'s included?</button></div><div id="lcPopup" style="display:none;margin-top:12px;font-size:.78rem;max-height:350px;overflow-y:auto"><div style="font-weight:600;margin-bottom:6px">Monthly expenses (excluding rent):</div><div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)"><span>Groceries (~$265/wk)</span><span>$1,150 (£612)</span></div><div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)"><span>Eating out / coffees / takeaway</span><span>$200 (£106)</span></div><div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)"><span>Car fuel</span><span>$200 (£106)</span></div><div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)"><span>Car lease (inc. insurance, rego, maint)</span><span>$600 (£319)</span></div><div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)"><span>Electricity + gas</span><span>$250 (£133)</span></div><div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)"><span>Water usage</span><span>$50 (£27)</span></div><div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)"><span>Internet (NBN)</span><span>$80 (£43)</span></div><div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)"><span>Health insurance (your 20% of ~$400 plan)</span><span>$80 (£43)</span></div><div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)"><span>Mobile phones (family)</span><span>$60 (£32)</span></div><div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)"><span>Streaming (Netflix, Spotify)</span><span>$35 (£19)</span></div><div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)"><span>Contents / rental insurance</span><span>$40 (£21)</span></div><div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)"><span>Kids activities (sport + casual)</span><span>$250 (£133)</span></div><div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)"><span>School uniforms / books</span><span>$50 (£27)</span></div><div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)"><span>Clothing / shoes</span><span>$80 (£43)</span></div><div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)"><span>Haircuts / personal care</span><span>$40 (£21)</span></div><div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)"><span>Medical / dental gap</span><span>$30 (£16)</span></div><div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)"><span>Pet insurance + vet</span><span>$60 (£32)</span></div><div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)"><span>Household supplies</span><span>$40 (£21)</span></div><div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)"><span>School contributions (x2)</span><span>$50 (£27)</span></div><div style="display:flex;justify-content:space-between;padding:6px 0;font-weight:700"><span>TOTAL (excl. rent)</span><span>$3,345 (£1,780)/mo</span></div><div class="tm" style="font-size:.7rem;margin-top:4px">⬆️ Subtract your chosen suburb\'s rent from $6,226 to get your final monthly disposable income.</div></div></div>'+
'<div class="card"><h2>💰 Monthly Budget — $159k (£85k) Salary (4-Bed with Garden)</h2><p class="tx tm mb2">Net: $9,571 (£5,092)/mo. Amazon pays 80% health insurance.</p><div class="table-wrap"><table><tr><th>Suburb</th><th>4-bed/wk</th><th>Rent/mo</th><th>Disposable/mo</th><th>Disposable/yr</th></tr><tr style="background:rgba(34,197,94,.05)"><td style="font-weight:600"><a href="https://www.google.com/maps/search/Langwarrin+Victoria+Australia/@-38.1670,145.1700,13z" target="_blank" style="color:var(--accent)">Langwarrin 📍</a></td><td>$590 (£314)</td><td>$2,556 (£1360)</td><td style="color:var(--green)">$3,670 (£1952)</td><td style="color:var(--green)">$44,040 (£23429)</td></tr><tr><td style="font-weight:600"><a href="https://www.google.com/maps/search/Seaford+Victoria+Australia/@-38.1000,145.1340,13z" target="_blank" style="color:var(--accent)">Seaford 📍</a></td><td>$620 (£330)</td><td>$2,686 (£1429)</td><td style="color:var(--green)">$3,540 (£1883)</td><td style="color:var(--green)">$42,480 (£22599)</td></tr><tr><td style="font-weight:600"><a href="https://www.google.com/maps/search/Frankston+Victoria+Australia/@-38.1430,145.1260,13z" target="_blank" style="color:var(--accent)">Frankston 📍</a></td><td>$630 (£335)</td><td>$2,730 (£1452)</td><td style="color:var(--green)">$3,496 (£1860)</td><td style="color:var(--green)">$41,952 (£22318)</td></tr><tr><td style="font-weight:600"><a href="https://www.google.com/maps/search/Mordialloc+Victoria+Australia/@-37.9870,145.0870,13z" target="_blank" style="color:var(--accent)">Mordialloc 📍</a></td><td>$730 (£388)</td><td>$3,163 (£1683)</td><td style="color:var(--green)">$3,063 (£1630)</td><td style="color:var(--green)">$36,756 (£19554)</td></tr><tr><td style="font-weight:600"><a href="https://www.google.com/maps/search/Mentone+Victoria+Australia/@-37.9830,145.0670,13z" target="_blank" style="color:var(--accent)">Mentone 📍</a></td><td>$800 (£426)</td><td>$3,466 (£1844)</td><td style="color:var(--green)">$2,760 (£1468)</td><td style="color:var(--green)">$33,120 (£17620)</td></tr><tr><td style="font-weight:600"><a href="https://www.google.com/maps/search/Glen Waverley+Victoria+Australia/@-37.8780,145.1630,13z" target="_blank" style="color:var(--accent)">Glen Waverley 📍</a></td><td>$1,460 (£777)</td><td>$3,553 (£1890)</td><td style="color:var(--green)">$2,673 (£1422)</td><td style="color:var(--green)">$32,076 (£17064)</td></tr><tr><td style="font-weight:600"><a href="https://www.google.com/maps/search/Sandringham+Victoria+Australia/@-37.9510,145.0100,13z" target="_blank" style="color:var(--accent)">Sandringham 📍</a></td><td>$950 (£505)</td><td>$4,116 (£2190)</td><td style="color:var(--orange)">$2,110 (£1123)</td><td style="color:var(--orange)">$25,320 (£13470)</td></tr><tr><td style="font-weight:600"><a href="https://www.google.com/maps/search/Brighton+Victoria+Australia/@-37.9070,144.9870,13z" target="_blank" style="color:var(--accent)">Brighton 📍</a></td><td>$1100 (£585)</td><td>$4,766 (£2536)</td><td style="color:var(--orange)">$1,460 (£777)</td><td style="color:var(--orange)">$17,520 (£9321)</td></tr></table></div></div>';

CMP.costs+='<div class="card"><h2>📊 Salary Breakdown — $159,000 AUD (£84,588)</h2><div class="table-wrap"><table><tr><th></th><th>Amount</th></tr><tr><td>Gross salary</td><td>$159,000 (£84,588)</td></tr><tr><td>Tax</td><td>-$40,972 (£21,797)</td></tr><tr><td>Medicare levy (2%)</td><td>-$3,180 (£1,692)</td></tr><tr style="font-weight:700"><td>Net annual</td><td>$114,848 (£61,099)</td></tr><tr style="font-weight:700"><td>Net monthly</td><td>$9,571 (£5,092)</td></tr><tr><td>Super (12% employer pays)</td><td>$19,080 (£10,151)/yr (not in your pocket)</td></tr><tr><td>Health insurance (family)</td><td>~$400 (£213)/mo total — Amazon pays 80%, you pay $80 (£43)</td></tr></table></div></div>';
CMP.costs+='<div class="card"><h2>🛒 Melbourne Living Costs — Real Prices</h2><p class="tx tm mb2">Average prices. AUD with £ equivalent.</p><h3>🛒 Groceries (Weekly Family Shop)</h3><div class="table-wrap"><table><tr><th>Item</th><th>Coles/Woolworths</th><th>Aldi</th></tr><tr><td>Milk 2L</td><td>$4 (£2)</td><td>$3 (£2)</td></tr><tr><td>Bread loaf</td><td>$4 (£2)</td><td>$2 (£1)</td></tr><tr><td>Chicken breast 1kg</td><td>$13 (£7)</td><td>$10 (£5)</td></tr><tr><td>Mince beef 500g</td><td>$8 (£4)</td><td>$6 (£3)</td></tr><tr><td>Rice 1kg</td><td>$4 (£2)</td><td>$2 (£1)</td></tr><tr><td>Eggs 12</td><td>$6 (£3)</td><td>$4 (£2)</td></tr><tr><td>Bananas 1kg</td><td>$4 (£2)</td><td>$3 (£2)</td></tr><tr><td>Pasta 500g</td><td>$3 (£2)</td><td>$1 (£1)</td></tr><tr><td>Cheese block 500g</td><td>$7 (£4)</td><td>$5 (£3)</td></tr><tr><td>Cereal box</td><td>$6 (£3)</td><td>$3 (£2)</td></tr><tr style="font-weight:700"><td>Typical weekly shop (family 4)</td><td>$300 (£160)</td><td>$230 (£122)</td></tr></table></div>';
CMP.costs+='<h3>☕ Eating Out & Coffees</h3><div class="table-wrap"><table><tr><th>Item</th><th>Average Cost</th></tr><tr><td>Coffee (flat white)</td><td>$5 (£3)</td></tr><tr><td>Bubble tea</td><td>$7 (£4)</td></tr><tr><td>Lunch (cafe/takeaway)</td><td>$18 (£10)</td></tr><tr><td>Dinner out (family 4, casual)</td><td>$100 (£53)</td></tr><tr><td>Dinner out (family 4, nice)</td><td>$200 (£106)</td></tr><tr><td>Pizza delivery (family)</td><td>$50 (£27)</td></tr><tr><td>Fish & chips (family)</td><td>$40 (£21)</td></tr><tr><td>Pub meal (adult)</td><td>$28 (£15)</td></tr><tr><td>Kids meal (pub/cafe)</td><td>$12 (£6)</td></tr><tr><td>Ice cream (scoop)</td><td>$6 (£3)</td></tr></table></div>';
CMP.costs+='<h3>⚽ Kids Activities & Entertainment</h3><div class="table-wrap"><table><tr><th>Activity</th><th>Cost</th></tr><tr><td>Cinema (adult)</td><td>$22 (£12)</td></tr><tr><td>Cinema (child)</td><td>$16 (£9)</td></tr><tr><td>Trampoline park (per child)</td><td>$25 (£13)/session</td></tr><tr><td>Ice skating session</td><td>$22 (£12) inc hire</td></tr><tr><td>Bowling (per person)</td><td>$18 (£10)</td></tr><tr><td>Mini golf</td><td>$16 (£9)</td></tr><tr><td>Zoo (Melbourne Zoo family)</td><td>$90 (£48)</td></tr><tr><td>Aquarium (SEA LIFE family)</td><td>$100 (£53)</td></tr><tr><td>Swimming pool entry</td><td>$7 (£4)</td></tr><tr><td>Beach / Parks / BBQs / Bike trails</td><td>FREE</td></tr><tr><td>Sport club (per term)</td><td>$175 (£93)</td></tr><tr><td>Circus/aerial class (per term)</td><td>$350 (£186)</td></tr><tr><td>Ice hockey (per season)</td><td>$650 (£346)</td></tr></table></div>';
CMP.costs+='<h3>🚗 Transport & Car</h3><div class="table-wrap"><table><tr><th>Item</th><th>Cost</th></tr><tr><td>Petrol (per litre)</td><td>$2 (£1)</td></tr><tr><td>Full tank (60L)</td><td>$110 (£59)</td></tr><tr><td>Myki (train/tram weekly cap)</td><td>$53 (£28)</td></tr><tr><td>Car rego (annual)</td><td>$600 (£319)</td></tr><tr><td>Car insurance (annual)</td><td>$1800 (£958)</td></tr><tr><td>RACV roadside (annual)</td><td>$125 (£66)</td></tr><tr><td>Car service</td><td>$300 (£160)</td></tr><tr><td>Tyres (set of 4)</td><td>$600 (£319)</td></tr></table></div>';
CMP.costs+='<h3>🏠 Household & Utilities</h3><div class="table-wrap"><table><tr><th>Item</th><th>Monthly Cost</th></tr><tr><td>Electricity + gas</td><td>$250 (£133)/mo</td></tr><tr><td>Water</td><td>$50 (£27)/mo</td></tr><tr><td>Internet (NBN)</td><td>$80 (£43)/mo</td></tr><tr><td>Mobile plan (per person)</td><td>$40 (£21)/mo</td></tr><tr><td>Netflix</td><td>$20 (£11)/mo</td></tr><tr><td>Spotify (family)</td><td>$15 (£8)/mo</td></tr><tr><td>Contents insurance</td><td>$40 (£21)/mo</td></tr><tr><td>Haircut (mens)</td><td>$30 (£16)</td></tr><tr><td>Haircut (womens)</td><td>$80 (£43)</td></tr><tr><td>Gym membership</td><td>$65 (£35)/mo</td></tr></table></div>';
CMP.costs+='<h3>🎉 Weekend / Family Outings</h3><div class="table-wrap"><table><tr><th>Activity</th><th>Typical Cost (family 4)</th></tr><tr><td>Beach day (parking + ice cream)</td><td>$25 (£13)</td></tr><tr><td>Phillip Island Penguin Parade</td><td>$140 (£74)</td></tr><tr><td>Great Ocean Road day trip</td><td>$100 (£53)</td></tr><tr><td>Healesville Sanctuary</td><td>$90 (£48)</td></tr><tr><td>Melbourne Museum</td><td>$15 (£8) (kids free)</td></tr><tr><td>Queen Vic Market shop + lunch</td><td>$65 (£35)</td></tr><tr><td>Hot springs (Mornington)</td><td>$150 (£80)</td></tr><tr><td>Camping weekend</td><td>$150 (£80)</td></tr><tr><td>AFL game (4 tickets)</td><td>$120 (£64)</td></tr></table></div>';
CMP.costs+='<p class="ts mt2">💡 <strong>Key difference from UK:</strong> Eating out is more expensive, but outdoor activities (beaches, parks, BBQs, trails) are mostly FREE. Your lifestyle shifts from paying for indoor entertainment to free outdoor living.</p></div>';

CMP.costs+='<div class="card"><h2>🚗 Car: Lease ($600/mo all-inclusive)</h2><p class="tx tm mb2">Decision made: lease is the best option with no AU credit history for finance.</p><div class="table-wrap"><table><tr><th>Included in lease</th><th>Separate (you pay)</th></tr><tr><td>✅ Insurance</td><td>Fuel: $200/mo</td></tr><tr><td>✅ Rego</td><td>Tolls (if applicable)</td></tr><tr><td>✅ Maintenance & servicing</td><td></td></tr><tr><td>✅ Roadside assist</td><td></td></tr></table></div><p class="ts mt2">💡 <strong>Novated lease through Amazon:</strong> Payments from pre-tax salary — could save $100-150/mo in tax. Ask your relocation team.</p></div>';


CMP.lifestyle+='<div class="card"><h2>🎪 Kids Activities</h2><div class="table-wrap"><table><tr><th>Activity</th><th>Where</th><th>Cost</th><th>Link</th></tr><tr><td style="font-weight:600">Aerial silks / lyra (selective entry)</td><td>NICA, Brunswick</td><td>$250–450/term</td><td><a href="https://www.nica.com.au" target="_blank" style="color:var(--accent)">nica.com.au →</a></td></tr><tr><td style="font-weight:600">Ice hockey </td><td>O\'Brien Icehouse, Docklands</td><td>$500–800/season</td><td><a href="https://obrienicehouse.com.au" target="_blank" style="color:var(--accent)">obrienicehouse.com.au →</a></td></tr><tr><td style="font-weight:600">Ice skating (casual)</td><td>Oakleigh Ice Skating Centre</td><td>$18–25/session</td><td><a href="https://www.icerink.com.au" target="_blank" style="color:var(--accent)">icerink.com.au →</a></td></tr><tr><td style="font-weight:600">Trampolining</td><td>Bounce Inc (Glen Iris, Essendon)</td><td>$20–30/session</td><td><a href="https://www.bounceinc.com.au" target="_blank" style="color:var(--accent)">bounceinc.com.au →</a></td></tr><tr><td style="font-weight:600">Skateparks</td><td>Frankston, Riverslide, Waterways</td><td>FREE</td><td><a href="https://www.google.com/maps/search/skatepark+melbourne" target="_blank" style="color:var(--accent)">Find skateparks →</a></td></tr><tr><td style="font-weight:600">Mountain biking</td><td>Lysterfield Park, You Yangs</td><td>FREE</td><td><a href="https://www.google.com/maps/search/lysterfield+mountain+bike" target="_blank" style="color:var(--accent)">Lysterfield →</a></td></tr><tr><td style="font-weight:600">Swimming</td><td>Local pools + beaches</td><td>$5–8 (pool) / FREE (beach)</td><td></td></tr><tr><td style="font-weight:600">AFL (Auskick for kids)</td><td>Local clubs everywhere</td><td>$100–150/season</td><td><a href="https://www.playfootball.com.au" target="_blank" style="color:var(--accent)">playfootball.com.au →</a></td></tr><tr><td style="font-weight:600">Cricket</td><td>Local clubs</td><td>$100–200/season</td><td></td></tr><tr><td style="font-weight:600">Pokemon GO</td><td>Royal Botanic Gardens, Flagstaff</td><td>FREE</td><td></td></tr></table></div></div>';






CMP.frankie='<div class="card"><h2>💼 Frankie — Complete Work Guide</h2><p class="tx tm mb2">Everything Frankie needs to know about working in Melbourne. Full work rights on 482 dependent visa — no restrictions.</p></div>';

CMP.frankie+='<div class="card"><h2>💼 Frankie — Work Options in Melbourne</h2><p class="tx tm mb2">Student support / nurture practitioner background. Full work rights on 482 dependent visa.</p><h3>Equivalent AU Roles — Qualifications Required</h3><div class="table-wrap"><table><tr><th>Role</th><th>Salary</th><th>Quals Needed</th><th>Frankie Has It?</th><th>Jobs</th></tr><tr><td style="font-weight:600">Education Support Worker</td><td>$55–70k</td><td>Cert III Education Support (or equivalent UK experience)</td><td style="color:var(--green)">✅ UK experience accepted by most schools</td><td><a href="https://www.seek.com.au/education-support-jobs/in-Melbourne-VIC" target="_blank" style="color:var(--accent)">Seek →</a></td></tr><tr><td style="font-weight:600">Learning Support Officer (LSO)</td><td>$55–75k</td><td>Cert IV Education Support OR Diploma. Some accept experience only</td><td style="color:var(--green)">✅ Likely — may need VETASSESS letter</td><td><a href="https://www.seek.com.au/learning-support-officer-jobs/in-Melbourne-VIC" target="_blank" style="color:var(--accent)">Seek →</a></td></tr><tr><td style="font-weight:600">Student Wellbeing Officer</td><td>$65–80k</td><td>Degree in Social Work, Psychology, or Youth Work. OR Diploma + experience</td><td style="color:var(--orange)">⚠️ May need Diploma upskill</td><td><a href="https://www.seek.com.au/student-wellbeing-jobs/in-Melbourne-VIC" target="_blank" style="color:var(--accent)">Seek →</a></td></tr><tr><td style="font-weight:600">Teacher Aide</td><td>$50–65k</td><td>Cert III School Support Services (or equivalent experience)</td><td style="color:var(--green)">✅ UK experience accepted</td><td><a href="https://www.seek.com.au/teacher-aide-jobs/in-Melbourne-VIC" target="_blank" style="color:var(--accent)">Seek →</a></td></tr><tr><td style="font-weight:600">Youth Worker</td><td>$55–72k</td><td>Cert IV Youth Work OR Diploma Community Services</td><td style="color:var(--orange)">⚠️ May need Cert IV (6–12 months)</td><td><a href="https://www.seek.com.au/youth-worker-jobs/in-Melbourne-VIC" target="_blank" style="color:var(--accent)">Seek →</a></td></tr><tr><td style="font-weight:600">Disability Support (NDIS)</td><td>$55–68k</td><td>Cert III Individual Support OR Cert IV Disability. Some accept no quals + training provided</td><td style="color:var(--green)">✅ Many employers train on the job</td><td><a href="https://www.seek.com.au/disability-support-worker-jobs/in-Melbourne-VIC" target="_blank" style="color:var(--accent)">Seek →</a></td></tr><tr><td style="font-weight:600">Before/After School Care (OSHC)</td><td>$28–35/hr</td><td>Cert III Education Support OR working towards. First Aid required</td><td style="color:var(--green)">✅ Can start immediately</td><td><a href="https://www.seek.com.au/oshc-jobs/in-Melbourne-VIC" target="_blank" style="color:var(--accent)">Seek →</a></td></tr></table></div><p class="ts mt2">💡 <strong>Bottom line:</strong> Frankie can start in Education Support / Teacher Aide / OSHC / NDIS roles immediately with UK experience. Higher-paying Wellbeing/Youth Worker roles may need a 6–12 month Australian qualification.</p>';

CMP.frankie+='<h3>What Frankie Needs</h3><div class="table-wrap"><table><tr><th>Requirement</th><th>Detail</th><th>Cost</th><th>Timeline</th></tr><tr><td style="font-weight:600">Working With Children Check (WWCC)</td><td>Mandatory for any role with kids. Apply online via Service Victoria</td><td>Free (volunteers) / $35 (employees)</td><td>2–4 weeks</td></tr><tr><td style="font-weight:600">Qualification recognition</td><td>UK education/support qualifications are generally accepted. May need a Cert III/IV equivalence letter from VETASSESS if employer asks</td><td>$0–$500</td><td>2–6 weeks if needed</td></tr><tr><td style="font-weight:600">First Aid Certificate</td><td>Most school roles require current first aid. Do a 1-day course in AU</td><td>$100–$150</td><td>1 day</td></tr><tr><td style="font-weight:600">Police Check</td><td>National police check — required for education roles</td><td>$42</td><td>1–2 weeks</td></tr><tr><td style="font-weight:600">Australian CV format</td><td>Different from UK — no photo, no DOB, focus on achievements. 2–3 pages max</td><td>Free (DIY) or $100–$300 (professional)</td><td>1–2 days</td></tr></table></div>';

CMP.frankie+='<h3>Other Options / Ideas</h3><div class="table-wrap"><table><tr><th>Option</th><th>Detail</th><th>Earning potential</th></tr><tr><td style="font-weight:600">Part-time school role (3 days/wk)</td><td>Most education support roles offer part-time. Good for settling in first</td><td>$32,000–$45,000/yr</td></tr><tr><td style="font-weight:600">Casual / relief work</td><td>Register with agencies (Tradewind, Anzuk, ClassCover) for day-to-day school work. Flexible, no commitment</td><td>$250–$350/day</td></tr><tr><td style="font-weight:600">NDIS support work</td><td>Huge demand in AU. Flexible hours. Work with kids/teens with disabilities</td><td>$35–$55/hr</td></tr><tr><td style="font-weight:600">Before/after school care (OSHC)</td><td>Always hiring. Hours: 6:30–9am and 3–6pm. Good if kids are at same school</td><td>$28–$35/hr</td></tr><tr><td style="font-weight:600">Upskill: Cert IV in Education Support</td><td>6–12 month course. Opens more doors. Can study while working part-time</td><td>$1,500–$4,000 (course fee)</td></tr><tr><td style="font-weight:600">Upskill: Diploma of Community Services</td><td>12–18 months. Leads to youth work, family services, wellbeing roles</td><td>$3,000–$8,000 (course fee)</td></tr></table></div>';

CMP.frankie+='<h3>Key Job Search Links</h3><div class="table-wrap"><table><tr><th>Platform</th><th>Link</th></tr><tr><td style="font-weight:600">Seek (main job site)</td><td><a href="https://www.seek.com.au/education-support-jobs/in-Melbourne-VIC" target="_blank" style="color:var(--accent)">seek.com.au →</a></td></tr><tr><td style="font-weight:600">VIC Dept of Education careers</td><td><a href="https://www.education.vic.gov.au/hrweb/careers" target="_blank" style="color:var(--accent)">education.vic.gov.au/careers →</a></td></tr><tr><td style="font-weight:600">Catholic Education Melbourne</td><td><a href="https://www.cecv.catholic.edu.au/Employment" target="_blank" style="color:var(--accent)">cecv.catholic.edu.au →</a></td></tr><tr><td style="font-weight:600">Independent Schools Victoria</td><td><a href="https://www.is.vic.edu.au/employment" target="_blank" style="color:var(--accent)">is.vic.edu.au →</a></td></tr><tr><td style="font-weight:600">Tradewind (education agency)</td><td><a href="https://www.twrecruitment.com.au" target="_blank" style="color:var(--accent)">twrecruitment.com.au →</a></td></tr><tr><td style="font-weight:600">Anzuk Education (agency)</td><td><a href="https://www.anzuk.education" target="_blank" style="color:var(--accent)">anzuk.education →</a></td></tr><tr><td style="font-weight:600">EthicalJobs (community sector)</td><td><a href="https://www.ethicaljobs.com.au" target="_blank" style="color:var(--accent)">ethicaljobs.com.au →</a></td></tr></table></div><p class="ts mt2">💡 <strong>Demand is strong</strong> — VIC schools are actively recruiting education support staff. Frankie\'s UK experience translates well. Most roles are term-time only (school holidays off = great for family).</p></div>';


CMP.frankie+='<div class="card"><h2>📋 Step-by-Step: Getting Work-Ready</h2><div class="table-wrap"><table><tr><th>#</th><th>Step</th><th>When</th><th>Cost</th><th>How</th></tr><tr><td>1</td><td style="font-weight:600">Apply for Working With Children Check</td><td>Week 1 in AU</td><td>$35</td><td><a href="https://www.workingwithchildren.vic.gov.au" target="_blank" style="color:var(--accent)">workingwithchildren.vic.gov.au →</a></td></tr><tr><td>2</td><td style="font-weight:600">Get National Police Check</td><td>Week 1 in AU</td><td>$42</td><td><a href="https://www.nationalcrimecheck.com.au" target="_blank" style="color:var(--accent)">nationalcrimecheck.com.au →</a></td></tr><tr><td>3</td><td style="font-weight:600">Do First Aid course (HLTAID011)</td><td>Week 2–3</td><td>$100–150</td><td><a href="https://www.stjohn.org.au/first-aid-training" target="_blank" style="color:var(--accent)">St John Ambulance →</a> or <a href="https://www.redcross.org.au/first-aid" target="_blank" style="color:var(--accent)">Red Cross →</a></td></tr><tr><td>4</td><td style="font-weight:600">Update CV to AU format</td><td>Before arrival</td><td>Free</td><td>No photo, no DOB, 2–3 pages, achievements-focused. <a href="https://www.seek.com.au/career-advice/article/how-to-write-a-resume" target="_blank" style="color:var(--accent)">Seek CV guide →</a></td></tr><tr><td>5</td><td style="font-weight:600">Register on job platforms</td><td>Week 1–2</td><td>Free</td><td>Seek, Indeed, EthicalJobs, school websites</td></tr><tr><td>6</td><td style="font-weight:600">Register with education agencies</td><td>Week 2–3</td><td>Free</td><td>Tradewind, Anzuk, ClassCover — for casual/relief work</td></tr><tr><td>7</td><td style="font-weight:600">Check qualification recognition (if needed)</td><td>Before or after arrival</td><td>$0–$500</td><td><a href="https://www.vetassess.com.au" target="_blank" style="color:var(--accent)">VETASSESS →</a> (only if employer specifically asks)</td></tr></table></div></div>';

CMP.frankie+='<div class="card"><h2>🎓 Training & Upskill Options</h2><p class="tx tm mb2">If Frankie wants to move into higher-paying roles or broaden options.</p><div class="table-wrap"><table><tr><th>Course</th><th>Duration</th><th>Cost</th><th>Opens doors to</th><th>Where</th></tr><tr><td style="font-weight:600">Cert III Education Support</td><td>6 months</td><td>$1,500–$3,000<br>(may be free via Skills First)</td><td>Education Support, Teacher Aide, OSHC</td><td><a href="https://www.holmesglen.edu.au" target="_blank" style="color:var(--accent)">Holmesglen →</a></td></tr><tr><td style="font-weight:600">Cert IV Education Support</td><td>6–12 months</td><td>$2,000–$4,000</td><td>Learning Support Officer, higher pay band</td><td><a href="https://www.chisholm.edu.au" target="_blank" style="color:var(--accent)">Chisholm →</a></td></tr><tr><td style="font-weight:600">Cert IV Youth Work</td><td>6–12 months</td><td>$2,000–$4,000</td><td>Youth Worker roles ($55–72k)</td><td><a href="https://www.swinburne.edu.au" target="_blank" style="color:var(--accent)">Swinburne →</a></td></tr><tr><td style="font-weight:600">Diploma Community Services</td><td>12–18 months</td><td>$3,000–$8,000</td><td>Wellbeing Officer, Family Services, Case Worker ($65–85k)</td><td><a href="https://www.holmesglen.edu.au" target="_blank" style="color:var(--accent)">Holmesglen →</a></td></tr><tr><td style="font-weight:600">Cert III Individual Support (Disability)</td><td>6 months</td><td>$1,500–$3,000<br>(often free via Skills First)</td><td>NDIS support work ($35–55/hr)</td><td><a href="https://www.chisholm.edu.au" target="_blank" style="color:var(--accent)">Chisholm →</a></td></tr></table></div><p class="ts mt2">💡 <strong>Skills First</strong> = Victorian government subsidised training. Many courses are FREE or heavily discounted for residents. Check eligibility after arrival: <a href="https://www.skills.vic.gov.au" target="_blank" style="color:var(--accent)">skills.vic.gov.au →</a></p></div>';

CMP.frankie+='<div class="card"><h2>💰 What Frankie Could Earn</h2><div class="table-wrap"><table><tr><th>Scenario</th><th>Hours</th><th>Gross/yr</th><th>Net/mo (approx)</th></tr><tr><td style="font-weight:600">Full-time Education Support</td><td>38 hrs/wk</td><td>$60,000</td><td>~$4,100</td></tr><tr><td style="font-weight:600">Part-time 3 days/wk</td><td>22 hrs/wk</td><td>$35,000</td><td>~$2,600</td></tr><tr><td style="font-weight:600">Casual relief (3 days/wk avg)</td><td>Varies</td><td>$38,000–$45,000</td><td>~$2,800–$3,200</td></tr><tr><td style="font-weight:600">NDIS support (25 hrs/wk)</td><td>25 hrs/wk</td><td>$45,000–$55,000</td><td>~$3,200–$3,800</td></tr><tr><td style="font-weight:600">OSHC only (before + after school)</td><td>25 hrs/wk</td><td>$35,000–$40,000</td><td>~$2,600–$2,900</td></tr></table></div><p class="ts mt2">All scenarios are term-time only (school holidays off) except NDIS which is year-round. Combined household income with your $159k = very comfortable in any Melbourne suburb.</p></div>';

CMP.frankie+='<div class="card"><h2>🔗 All Job Search Links</h2><div class="table-wrap"><table><tr><th>Platform</th><th>Best for</th><th>Link</th></tr><tr><td style="font-weight:600">Seek</td><td>Main AU job site — all roles</td><td><a href="https://www.seek.com.au/education-support-jobs/in-Melbourne-VIC" target="_blank" style="color:var(--accent)">seek.com.au →</a></td></tr><tr><td style="font-weight:600">Indeed Australia</td><td>Wide range, good for support roles</td><td><a href="https://au.indeed.com/Education-Support-jobs-in-Melbourne-VIC" target="_blank" style="color:var(--accent)">indeed.com.au →</a></td></tr><tr><td style="font-weight:600">VIC Dept of Education</td><td>Government school roles</td><td><a href="https://www.education.vic.gov.au/hrweb/careers" target="_blank" style="color:var(--accent)">education.vic.gov.au →</a></td></tr><tr><td style="font-weight:600">Catholic Education Melbourne</td><td>Catholic school roles</td><td><a href="https://www.cecv.catholic.edu.au/Employment" target="_blank" style="color:var(--accent)">cecv.catholic.edu.au →</a></td></tr><tr><td style="font-weight:600">Independent Schools Victoria</td><td>Private school roles</td><td><a href="https://www.is.vic.edu.au/employment" target="_blank" style="color:var(--accent)">is.vic.edu.au →</a></td></tr><tr><td style="font-weight:600">Tradewind Recruitment</td><td>Education agency — casual/relief</td><td><a href="https://www.twrecruitment.com.au" target="_blank" style="color:var(--accent)">twrecruitment.com.au →</a></td></tr><tr><td style="font-weight:600">Anzuk Education</td><td>Education agency — casual/perm</td><td><a href="https://www.anzuk.education" target="_blank" style="color:var(--accent)">anzuk.education →</a></td></tr><tr><td style="font-weight:600">ClassCover</td><td>Relief teaching/support app</td><td><a href="https://www.classcover.com.au" target="_blank" style="color:var(--accent)">classcover.com.au →</a></td></tr><tr><td style="font-weight:600">EthicalJobs</td><td>Community sector, youth, wellbeing</td><td><a href="https://www.ethicaljobs.com.au" target="_blank" style="color:var(--accent)">ethicaljobs.com.au →</a></td></tr><tr><td style="font-weight:600">Hireup (NDIS)</td><td>NDIS support work platform</td><td><a href="https://www.hireup.com.au" target="_blank" style="color:var(--accent)">hireup.com.au →</a></td></tr><tr><td style="font-weight:600">Mable (NDIS)</td><td>NDIS support work platform</td><td><a href="https://www.mable.com.au" target="_blank" style="color:var(--accent)">mable.com.au →</a></td></tr></table></div></div>';


CMP.sydney='<div class="card"><h2>🌊 Why Not Sydney — Cost Summary</h2><p class="tx tm mb2">Sydney was considered but Melbourne wins financially.</p><div class="table-wrap"><table><tr><th></th><th style="color:var(--accent)">Melbourne</th><th style="color:var(--orange)">Sydney</th><th>Difference</th></tr><tr><td style="font-weight:600">4-bed rent/wk</td><td>$58 (£31)0–800 (£309–426)</td><td>$90 (£48)0–1,200 (£479–638)</td><td class="tr">Syd +$30 (£16)0–400 (£160–213)/wk</td></tr><tr><td style="font-weight:600">School fees (2 kids/yr)</td><td style="color:var(--green)">FREE</td><td style="color:var(--red)">$11,200 (£5958)+</td><td class="tr">Syd +$11,200 (£5958)/yr</td></tr><tr><td style="font-weight:600">Annual cost difference</td><td colspan="2"></td><td style="color:var(--red);font-weight:700">Sydney costs $25,00 (£1330)0–35,000 (£13300–18620)/yr MORE</td></tr><tr><td style="font-weight:600">Monthly disposable</td><td style="color:var(--green)">$3,50 (£186)0–4,100 (£1862–2181)</td><td style="color:var(--red)">$80 (£43)0–1,500 (£426–798)</td><td></td></tr></table></div><p class="ts mt2">On $159 (£85)k salary, Sydney would leave you with under $1,500 (£798)/mo disposable after a 4-bed rent + school fees. Melbourne gives you $3,50 (£186)0–4,100 (£1862–2181)/mo. The decision is clear.</p></div>';
