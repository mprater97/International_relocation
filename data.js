// ===== DATA MODEL =====
const GBP_AUD = 1.90;
let BUDGET = 9610; // USD relocation points cash value // editable via UI

const FUNDING_SOURCES = [
  {id:'lump_sum',label:'Relo Points Cash',color:'var(--accent)'},
  {id:'uk_wages',label:'UK Wages (before move)',color:'#8b5cf6'},
  {id:'sale_proceeds',label:'Car Sale Proceeds',color:'var(--orange)'},
  {id:'savings',label:'Personal Savings (£3k)',color:'var(--green)'},
  {id:'company_direct',label:'Company Direct (visa/flights/housing)',color:'#06b6d4'},
  {id:'other',label:'Other',color:'var(--muted)'},
];

const DEFAULT_DEBTS = [
  {id:'debt_santander',desc:'Santander Loan (Car)',amount:6035,monthly:187.30,note:'Clear from car sale (~£14k)'},
  {id:'debt_mbna',desc:'MBNA (Car)',amount:7362,monthly:200,note:'Clear from car sale (~£14k)'},
  {id:'debt_klarna',desc:'Klarna (Vic Plumb)',amount:798,monthly:46.98,note:'Clear from car sale'},
  {id:'debt_vk12',desc:'VK12 bike finance',amount:751,monthly:83.56,note:'Clear from car sale'},
];

function getStartDate(){
  if(state.auStartDate){
    // Work backwards: AU start = Week 13 Day 1, so planning starts 12 weeks before
    const aus=new Date(state.auStartDate);
    aus.setDate(aus.getDate()-12*7);
    return aus;
  }
  return new Date('2026-04-19'); // default
}
function weekDate(w){const d=new Date(getStartDate());d.setDate(d.getDate()+(w-1)*7);return d}
function fmtDate(d){return d.toLocaleDateString('en-GB',{day:'numeric',month:'short'})}
function fmtDateFull(d){return d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
function fmtGBP(v){return '£'+v.toLocaleString('en-GB',{minimumFractionDigits:0,maximumFractionDigits:0})}
function fmtAUD(v){return '$'+v.toLocaleString('en-AU',{minimumFractionDigits:0,maximumFractionDigits:0})}
function currentWeek(){const now=new Date();const diff=Math.floor((now-getStartDate())/(7*24*60*60*1000));return Math.max(1,Math.min(22,diff+1))}
function daysUntil(dateStr){if(!dateStr)return null;const d=new Date(dateStr);const now=new Date();return Math.ceil((d-now)/(24*60*60*1000))}

const FORECAST_ITEMS = [
  // Personal budget items
  {id:'dog',type:'oneoff',defaultFund:'deferred',cat:'Dog Relocation',desc:'Pet relocation inc. quarantine',week:3,forecastLow:5640,forecastHigh:11280,forecast:8460,phase:1},
  {id:'ship',type:'oneoff',defaultFund:'uk_wages',cat:'Shipping',desc:'PSS groupage — 2 bikes, 2 TVs, 11 cartons (door-to-door)',week:6,forecastLow:1533,forecastHigh:1533,forecast:1533,phase:1},
  {id:'ship_ins',type:'oneoff',defaultFund:'uk_wages',cat:'Shipping',desc:'Shipping insurance',week:6,forecastLow:100,forecastHigh:300,forecast:200,phase:1},
  {id:'ship_bikes',type:'oneoff',cat:'Shipping',desc:'Bike shipping to AU',week:6,forecastLow:500,forecastHigh:1500,forecast:1000,phase:1,defaultFund:'lump_sum'},
  {id:'gas_cert',type:'oneoff',defaultFund:'uk_wages',cat:'UK Property',desc:'Oil boiler service (£75 = ~$141 AUD)',week:5,forecastLow:113,forecastHigh:169,forecast:141,phase:2},
  {id:'eicr',type:'oneoff',defaultFund:'uk_wages',cat:'UK Property',desc:'EICR electrical cert (£180 = ~$338 AUD)',week:5,forecastLow:226,forecastHigh:470,forecast:338,phase:2},
  {id:'epc',type:'oneoff',defaultFund:'uk_wages',cat:'UK Property',desc:'EPC certificate (£80 = ~$150 AUD)',week:5,forecastLow:113,forecastHigh:226,forecast:150,phase:2},
  {id:'alarms',type:'oneoff',defaultFund:'uk_wages',cat:'UK Property',desc:'Smoke/CO alarms (£50 = ~$94 AUD)',week:5,forecastLow:56,forecastHigh:150,forecast:94,phase:2},
  {id:'repairs',type:'oneoff',defaultFund:'uk_wages',cat:'UK Property',desc:'Repairs & defects (£500 = ~$940 AUD)',week:6,forecastLow:376,forecastHigh:1880,forecast:940,phase:2},
  {id:'paint',type:'oneoff',defaultFund:'uk_wages',cat:'UK Property',desc:'Paint touch-up (£80 = ~$150 AUD)',week:6,forecastLow:94,forecastHigh:376,forecast:150,phase:2},
  {id:'clean',type:'oneoff',defaultFund:'uk_wages',cat:'UK Property',desc:'Professional deep clean (£200 = ~$376 AUD)',week:7,forecastLow:282,forecastHigh:564,forecast:376,phase:2},
  {id:'photos',type:'oneoff',defaultFund:'uk_wages',cat:'UK Property',desc:'Professional photos (£150 = ~$282 AUD)',week:7,forecastLow:188,forecastHigh:376,forecast:282,phase:2},
  {id:'landlord_ins',type:'oneoff',defaultFund:'uk_wages',cat:'UK Property',desc:'Landlord insurance (annual ~£960)',week:3,forecastLow:800,forecastHigh:1000,forecast:960,phase:1},
  {id:'agent_fee',type:'oneoff',defaultFund:'uk_wages',cat:'UK Property',desc:'Letting agent setup fee (LAP £358 = ~$673 AUD)',week:4,forecastLow:600,forecastHigh:700,forecast:673,phase:1},
  {id:'skip',type:'oneoff',defaultFund:'uk_wages',cat:'Declutter',desc:'Skip / bulk waste (£200 = ~$376 AUD)',week:2,forecastLow:280,forecastHigh:560,forecast:376,phase:1},
  {id:'fx_cost',type:'oneoff',defaultFund:'uk_wages',cat:'Financial',desc:'FX conversion costs (~$752 AUD)',week:3,forecastLow:564,forecastHigh:1128,forecast:752,phase:1},
  {id:'mail_redirect',type:'oneoff',defaultFund:'uk_wages',cat:'UK Exit',desc:'Royal Mail redirect 12mo (£80 = ~$150 AUD)',week:8,forecastLow:110,forecastHigh:190,forecast:150,phase:2},
  {id:'misc_exit',type:'oneoff',defaultFund:'uk_wages',cat:'UK Exit',desc:'Misc UK exit costs (£200 = ~$376 AUD)',week:11,forecastLow:190,forecastHigh:560,forecast:376,phase:3},
  {id:'poa',type:'oneoff',defaultFund:'uk_wages',cat:'Legal',desc:'UK Power of Attorney (£200 = ~$376 AUD)',week:7,forecastLow:190,forecastHigh:560,forecast:376,phase:2},
  {id:'au_bond',type:'oneoff',cat:'AU Housing',desc:'Rental bond (4 weeks)',week:15,forecastLow:2600,forecastHigh:3200,forecast:2800,phase:4,defaultFund:'lump_sum'},
  {id:'au_advance',type:'oneoff',cat:'AU Housing',desc:'Rent advance (2 weeks)',week:15,forecastLow:1300,forecastHigh:1600,forecast:1400,phase:4,defaultFund:'lump_sum'},
  {id:'au_uniform1',type:'oneoff',cat:'AU School',desc:'Uniform — 14yr old',week:15,forecastLow:150,forecastHigh:300,forecast:200,phase:4,defaultFund:'lump_sum'},
  {id:'au_uniform2',type:'oneoff',cat:'AU School',desc:'Uniform — 10yr old',week:15,forecastLow:150,forecastHigh:300,forecast:200,phase:4,defaultFund:'lump_sum'},
  {id:'au_health',type:'monthly',cat:'AU Insurance',desc:'Health insurance setup (your 20% first 3 months)',week:13,forecastLow:200,forecastHigh:350,forecast:240,phase:4,defaultFund:'lump_sum'},
  {id:'au_pet_ins',type:'monthly',cat:'AU Insurance',desc:'AU pet insurance (new policy)',week:14,forecastLow:30,forecastHigh:80,forecast:50,phase:4,defaultFund:'lump_sum'},
  {id:'adapters',type:'oneoff',cat:'Misc',desc:'AU power adapters',week:10,forecastLow:10,forecastHigh:20,forecast:15,phase:3,defaultFund:'lump_sum'},
  // Debts to clear
  // Company-funded items (tracked but not in personal budget)
  {id:'co_visa',type:'oneoff',cat:'Company Funded',desc:'Visa — all family',week:1,forecastLow:0,forecastHigh:0,forecast:0,phase:1,defaultFund:'company_direct'},
  {id:'co_flights',type:'oneoff',cat:'Company Funded',desc:'Flights — family of 4',week:8,forecastLow:0,forecastHigh:0,forecast:0,phase:2,defaultFund:'company_direct'},
  {id:'co_temp',type:'oneoff',cat:'Company Funded',desc:'Temp accommodation (6 weeks)',week:13,forecastLow:0,forecastHigh:0,forecast:0,phase:4,defaultFund:'company_direct'},
  {id:'co_tax',type:'oneoff',cat:'Company Funded',desc:'Tax advice service',week:1,forecastLow:0,forecastHigh:0,forecast:0,phase:1,defaultFund:'company_direct'},
  // Separate budget items (tracked but not in personal budget)
  {id:'sep_car',type:'oneoff',defaultFund:'sale_proceeds',cat:'Separate Budget',desc:'AU car (used)',week:15,forecastLow:6000,forecastHigh:10000,forecast:8000,phase:4,defaultFund:'lump_sum'},
  {id:'au_furn_beds',type:'oneoff',cat:'AU Furnishing',desc:'Beds + mattresses (queen + 2 singles)',week:14,forecastLow:2000,forecastHigh:3500,forecast:2800,phase:4,defaultFund:'lump_sum'},
  {id:'au_furn_sofa',type:'oneoff',cat:'AU Furnishing',desc:'Sofa (3-seater)',week:14,forecastLow:400,forecastHigh:1200,forecast:800,phase:4,defaultFund:'lump_sum'},
  {id:'au_furn_dining',type:'oneoff',cat:'AU Furnishing',desc:'Dining table + chairs',week:14,forecastLow:200,forecastHigh:800,forecast:500,phase:4,defaultFund:'lump_sum'},
  {id:'au_furn_desks',type:'oneoff',cat:'AU Furnishing',desc:'Desks x3 (2 kids + 1 adult)',week:14,forecastLow:300,forecastHigh:700,forecast:500,phase:4,defaultFund:'lump_sum'},
  {id:'au_furn_fridge',type:'oneoff',cat:'AU Furnishing',desc:'Fridge (400L+)',week:14,forecastLow:600,forecastHigh:1200,forecast:900,phase:4,defaultFund:'lump_sum'},
  {id:'au_furn_washer',type:'oneoff',cat:'AU Furnishing',desc:'Washing machine',week:14,forecastLow:400,forecastHigh:900,forecast:650,phase:4,defaultFund:'lump_sum'},
  {id:'au_furn_kitchen',type:'oneoff',cat:'AU Furnishing',desc:'Kitchenware (pots, pans, plates, cutlery, utensils)',week:14,forecastLow:200,forecastHigh:500,forecast:350,phase:4,defaultFund:'lump_sum'},
  {id:'au_furn_linen',type:'oneoff',cat:'AU Furnishing',desc:'Bedding, linen, towels, pillows',week:14,forecastLow:300,forecastHigh:600,forecast:450,phase:4,defaultFund:'lump_sum'},
  {id:'au_furn_curtains',type:'oneoff',cat:'AU Furnishing',desc:'Curtains / blinds',week:15,forecastLow:150,forecastHigh:400,forecast:250,phase:4,defaultFund:'lump_sum'},
  {id:'au_furn_tv_unit',type:'oneoff',cat:'AU Furnishing',desc:'TV unit + bookshelf + storage',week:15,forecastLow:150,forecastHigh:400,forecast:250,phase:4,defaultFund:'lump_sum'},
  {id:'au_furn_misc',type:'oneoff',cat:'AU Furnishing',desc:'Household basics (vacuum, iron, bins, cleaning, bathroom)',week:14,forecastLow:200,forecastHigh:500,forecast:350,phase:4,defaultFund:'lump_sum'},
  {id:'sep_furniture',type:'oneoff',defaultFund:'savings',cat:'Separate Budget',desc:'AU furniture contingency / extras',week:15,forecastLow:0,forecastHigh:2000,forecast:1000,phase:4,defaultFund:'lump_sum'},
  {id:'sep_util',type:'oneoff',defaultFund:'savings',cat:'Separate Budget',desc:'AU utilities setup',week:15,forecastLow:100,forecastHigh:250,forecast:150,phase:4,defaultFund:'lump_sum'},
];

const MONTHLY_AU = [
  {id:'m_rent',desc:'Rent (4-bed, Seaford area)',monthly_aud:2686},
  {id:'m_groc',desc:'Groceries',monthly_aud:1150},
  {id:'m_eat',desc:'Eating out / coffees / takeaway',monthly_aud:200},
  {id:'m_fuel',desc:'Car fuel',monthly_aud:200},
  {id:'m_car_lease',desc:'Car lease (inc. insurance, rego, maintenance)',monthly_aud:600},
  {id:'m_util',desc:'Electricity + gas',monthly_aud:250},
  {id:'m_water',desc:'Water usage',monthly_aud:50},
  {id:'m_internet',desc:'Internet (NBN)',monthly_aud:80},
  {id:'m_health',desc:'Health insurance (your 20% — Amazon pays 80%)',monthly_aud:80},
  {id:'m_mobile',desc:'Mobile phones (family)',monthly_aud:60},
  {id:'m_streaming',desc:'Streaming (Netflix, Spotify etc)',monthly_aud:35},
  {id:'m_contents_ins',desc:'Contents / rental insurance',monthly_aud:40},
  {id:'m_kids',desc:'Kids activities (sport + casual)',monthly_aud:250},
  {id:'m_school',desc:'School uniforms / books / excursions',monthly_aud:50},
  {id:'m_clothing',desc:'Clothing / shoes (family)',monthly_aud:80},
  {id:'m_personal',desc:'Haircuts / personal care',monthly_aud:40},
  {id:'m_medical',desc:'Medical / dental gap payments',monthly_aud:30},
  {id:'m_pet',desc:'Pet insurance + vet (Nala — when arrives)',monthly_aud:60},
  {id:'m_home',desc:'Household supplies / maintenance',monthly_aud:40},
  {id:'m_school_vol',desc:'School voluntary contributions (x2)',monthly_aud:50},
];
const MONTHLY_UK = [
  {id:'m_mortgage',desc:'Yorkshire BS Mortgage',monthly_gbp:1056},
  {id:'m_council',desc:'Council Tax',monthly_gbp:303.55},
  {id:'m_electric',desc:'Eon Electric',monthly_gbp:56.29},
  {id:'m_broadband',desc:'Vodafone Broadband',monthly_gbp:27.68},
  {id:'m_home_ins',desc:'Home Insurance (Quote Me Happy)',monthly_gbp:43.34},
  {id:'m_tv',desc:'TV Licence',monthly_gbp:14.95},
  {id:'m_pet_bonnie',desc:'Tesco Pet (Bonnie)',monthly_gbp:38.99},
  {id:'m_pet_nala',desc:'LV Pet (Nala)',monthly_gbp:22.63},  {id:'m_car_ins_p',desc:'1st Central (Peugeot insurance)',monthly_gbp:23.33},
  {id:'m_car_ins_r',desc:'AA (Renault insurance)',monthly_gbp:38.62},
  {id:'m_car_tax_r',desc:'Renault car tax',monthly_gbp:17.06},
  {id:'m_car_tax_p',desc:'Peugeot car tax',monthly_gbp:54.25},
  {id:'m_aa',desc:'AA Membership',monthly_gbp:12.35},
  {id:'m_voda_mike',desc:'Vodafone Mobile (Mike)',monthly_gbp:23.60},
  {id:'m_id_mobile',desc:'ID Mobile',monthly_gbp:29.99},
  {id:'m_1p_mobile',desc:'1p Mobile',monthly_gbp:20.00},
  {id:'m_squarespace',desc:'Squarespace Email',monthly_gbp:8.40},
  {id:'m_lg_crit',desc:'L&G Life + Critical Illness',monthly_gbp:24.07},
  {id:'m_lg_life',desc:'L&G Life Insurance',monthly_gbp:9.76},
  {id:'m_santander',desc:'Santander Loan',monthly_gbp:187.30},
  {id:'m_mbna',desc:'MBNA',monthly_gbp:200.00},
  {id:'m_klarna',desc:'Klarna (Vic Plumb)',monthly_gbp:46.98},
  {id:'m_vk12',desc:'VK12 Bike Finance',monthly_gbp:83.56},
  {id:'m_agent_lap',desc:'LAP Letting Agent Plan',monthly_gbp:109},
];
const UK_RENTAL_INCOME = 1400;

// POST-MOVE UK ongoing costs (for disposable income calculation)
const UK_POST_MOVE_MONTHLY_GBP = 1278.83; // mortgage + landlord ins + agent + L&G
// Rental income covers this and gives surplus
// Net: £1,400 - £1,278.83 = +£121.17/mo surplus = +$228 AUD/mo
const UK_NET_MONTHLY_AUD = 228; // SURPLUS (positive = you gain money)
const PERSONAL_SAVINGS_GBP = 3900; // £3,900 from first car sale + savings // £3,000 saved for covering shortfalls
const PERSONAL_SAVINGS_AUD = 7332; // £3,900 × $1.88 // £3,000 × $1.88


// What happens to each UK cost on move
const UK_COST_ACTIONS = [
  {id:'m_mortgage',action:'STAYS',note:'Covered by tenant rent'},
  {id:'m_council',action:'STOPS',note:'Tenant pays when they move in'},
  {id:'m_electric',action:'STOPS',note:'Transfer to tenant/agent'},
  {id:'m_broadband',action:'CANCEL',note:'30 day notice'},
  {id:'m_home_ins',action:'CANCEL',note:'Cancel — replaced by landlord insurance (~£80/mo)'},
  {id:'m_tv',action:'CANCEL',note:'Cancel before departure'},
  {id:'m_kerosene',action:'STOPS',note:'Tenant responsibility'},
  {id:'m_pet_bonnie',action:'CANCEL',note:'Cancel — get single AU pet insurance instead'},
  {id:'m_pet_nala',action:'CANCEL',note:'Cancel — get single AU pet insurance instead'},
  {id:'m_car_ins_p',action:'CANCEL',note:'Cancel when car sold'},
  {id:'m_car_ins_r',action:'CANCEL',note:'Cancel when car sold'},
  {id:'m_car_tax_r',action:'CANCEL',note:'Auto-refund when SORN/sold'},
  {id:'m_car_tax_p',action:'CANCEL',note:'Auto-refund when SORN/sold'},
  {id:'m_aa',action:'CANCEL',note:'Cancel when cars sold'},
  {id:'m_voda_mike',action:'CANCEL',note:'30 day notice — switch to PAYG'},
  {id:'m_id_mobile',action:'KEEPS',note:'Cannot exit — pay from AU'},
  {id:'m_1p_mobile',action:'CANCEL',note:'Cancel or keep as cheap UK number'},
  {id:'m_squarespace',action:'CANCEL',note:'Cancel unless needed'},
  {id:'m_lg_crit',action:'KEEP',note:'Keep — cheap UK cover, hard to replace'},
  {id:'m_lg_life',action:'KEEP',note:'Keep — cheap UK cover'},
  {id:'m_santander',action:'CLEAR',note:'Pay off from car sale (~£14k total)'},
  {id:'m_mbna',action:'CLEAR',note:'Pay off from car sale (~£14k total)'},
  {id:'m_klarna',action:'CLEAR',note:'Clear from car sale'},
  {id:'m_vk12',action:'CLEAR',note:'Clear from car sale'},
];
const INCOME = {salary_aud:9571,rsu_aud:2500};

const COMPANY_COVERS = ['co_visa','co_flights','co_temp','co_tax'];
const SEPARATE_IDS = ['sep_car','sep_furniture','sep_util'];

const DOCUMENTS = [
  {id:'doc_pass',text:'Passports (all 4)',cat:'Identity'},
  {id:'doc_visa',text:'Visa grant letters',cat:'Identity'},
  {id:'doc_marriage',text:'Marriage certificate',cat:'Identity'},
  {id:'doc_birth1',text:'Birth certificate — child 1',cat:'Identity'},
  {id:'doc_birth2',text:'Birth certificate — child 2',cat:'Identity'},
  {id:'doc_dl1',text:'Driving licence — adult 1',cat:'Identity'},
  {id:'doc_dl2',text:'Driving licence — adult 2',cat:'Identity'},
  {id:'doc_employ',text:'Employment contract',cat:'Employment'},
  {id:'doc_ref_emp',text:'Employer reference letter',cat:'Employment'},
  {id:'doc_ref_land',text:'Landlord reference letter (for AU rental)',cat:'Employment'},
  {id:'doc_bank',text:'Bank statements (last 3 months)',cat:'Financial'},
  {id:'doc_ins_uk',text:'UK insurance policies',cat:'Financial'},
  {id:'doc_ins_au',text:'AU insurance policies',cat:'Financial'},
  {id:'doc_tenancy',text:'UK property tenancy agreement',cat:'Property'},
  {id:'doc_med1',text:'Medical records — adult 1',cat:'Medical'},
  {id:'doc_med2',text:'Medical records — adult 2',cat:'Medical'},
  {id:'doc_med3',text:'Medical records — child 1',cat:'Medical'},
  {id:'doc_med4',text:'Medical records — child 2',cat:'Medical'},
  {id:'doc_dental',text:'Dental records / x-rays',cat:'Medical'},
  {id:'doc_vacc',text:'Kids immunisation records',cat:'Medical'},
  {id:'doc_prescr',text:'Prescription details (generic names)',cat:'Medical'},
  {id:'doc_school1',text:'School records — child 1',cat:'School'},
  {id:'doc_school2',text:'School records — child 2',cat:'School'},
  {id:'doc_dog',text:'Dog import paperwork & permits',cat:'Dog'},
  {id:'doc_dog_vacc',text:'Dog vaccination records',cat:'Dog'},
  {id:'doc_dog_blood',text:'Dog blood test results',cat:'Dog'},
  {id:'doc_noclaims',text:'Car insurer no-claims letter',cat:'Other'},
  {id:'doc_idp',text:'International driving permits',cat:'Other'},
  {id:'doc_cloud',text:'All documents scanned to cloud ☁️',cat:'Other'},
];

const RISKS = [
  {id:'r1',risk:'Dog import delayed (blood test timing)',impact:'High',mitigation:'Start Day 1, build 2–3 week buffer'},
  {id:'r2',risk:'UK property not rented before departure',impact:'High',mitigation:'Price competitively, list early, agent manages remotely'},
  {id:'r3',risk:'AU rental market — can\'t find property quickly',impact:'Medium',mitigation:'Apply aggressively, flexible on area, strong application'},
  {id:'r4',risk:'Shipping delayed',impact:'Low-Med',mitigation:'Pack essentials in suitcases for 6–8 weeks'},
  {id:'r5',risk:'FX rate drops significantly',impact:'Medium',mitigation:'Convert in tranches, not all at once'},
  {id:'r6',risk:'Overspending in first month',impact:'Medium',mitigation:'Weekly budget tracking, stick to essentials'},
  {id:'r7',risk:'Kids struggle to settle',impact:'Medium',mitigation:'Routine quickly, sports clubs, familiar items'},
  {id:'r8',risk:'Visa processing delays',impact:'High',mitigation:'Company managing — follow up regularly'},
  {id:'r9',risk:'Partner isolation / adjustment',impact:'Medium',mitigation:'Community groups, expat networks, proactive socialising'},
  {id:'r10',risk:'Shipping items damaged/seized by customs',impact:'Low-Med',mitigation:'Inventory with photos, insurance, avoid prohibited items'},
  {id:'r11',risk:'Melbourne toll road fines',impact:'Low',mitigation:'Set up CityLink + EastLink before driving'},
  {id:'r12',risk:'UK property maintenance issue while overseas',impact:'Medium',mitigation:'Fully managed agent, emergency fund'},
];

// Pre-loaded Melbourne pins (user can delete/add more)
const DEFAULT_PINS = [
  // WORK
  {lat:-37.8178,lng:144.9581,cat:'work',title:'Amazon MEL12',note:'555 Collins St, Melbourne CBD. Your Melbourne office.',city:'melbourne'},
  {lat:-33.8738,lng:151.2093,cat:'work',title:'Amazon SYD15',note:'2-26 Park St, Sydney CBD. Your Sydney office.',city:'sydney'},
  // MELBOURNE SUBURBS
  {lat:-37.8782,lng:145.1628,cat:'housing',title:'Glen Waverley',note:'Target suburb — good schools, family-friendly, strong rental market'},
  {lat:-37.8667,lng:145.1292,cat:'housing',title:'Mount Waverley',note:'Target suburb — quieter, good primary schools'},
  {lat:-37.8136,lng:145.1218,cat:'housing',title:'Box Hill',note:'Target suburb — great transport links, diverse community'},
  {lat:-37.8400,lng:145.1150,cat:'housing',title:'Burwood',note:'Target suburb — central, good access'},
  {lat:-37.7847,lng:145.1270,cat:'housing',title:'Doncaster',note:'Target suburb — family area, Westfield shopping'},
  {lat:-37.8730,lng:145.1650,cat:'school',title:'Glen Waverley Secondary College',note:'Highly rated public secondary — check catchment'},
  {lat:-37.8770,lng:145.1300,cat:'school',title:'Mount Waverley Secondary College',note:'Highly rated public secondary'},
  {lat:-37.8750,lng:145.1600,cat:'school',title:'Glen Waverley Primary',note:'Good primary for 10yr old — check catchment'},
  {lat:-37.8560,lng:145.1480,cat:'school',title:'Pinewood Primary',note:'Alternative primary option'},
  {lat:-37.8228,lng:145.0593,cat:'transport',title:'Chadstone Shopping Centre',note:'Largest shopping centre in southern hemisphere'},

  // SYDNEY SUBURBS
  {lat:-33.7727,lng:151.0813,cat:'housing',title:'Epping',note:'Good schools, metro access, diverse. Rent $750-$950/wk',city:'sydney'},
  {lat:-33.7833,lng:151.0500,cat:'housing',title:'Carlingford',note:'Family area, near selective schools. Rent $750-$950/wk',city:'sydney'},
  {lat:-33.7630,lng:150.9927,cat:'housing',title:'Baulkham Hills',note:'Top selective school zone, safe. Rent $800-$1,000/wk',city:'sydney'},
  {lat:-33.9644,lng:151.0990,cat:'housing',title:'Hurstville',note:'South, good transport, more affordable. Rent $700-$900/wk',city:'sydney'},
  {lat:-33.7969,lng:151.1803,cat:'housing',title:'Chatswood',note:'North Shore, excellent amenities, pricey. Rent $900-$1,200/wk',city:'sydney'},
  // SYDNEY SCHOOLS
  {lat:-33.7500,lng:151.0450,cat:'school',title:'Cherrybrook Technology HS',note:'Best non-selective govt school in Sydney (88.93)',city:'sydney'},
  {lat:-33.7700,lng:151.0800,cat:'school',title:'Epping Boys High School',note:'Good govt secondary in target area',city:'sydney'},
  {lat:-33.7850,lng:151.0480,cat:'school',title:'Carlingford High School',note:'Govt secondary near Carlingford',city:'sydney'},
  // SYDNEY ACTIVITIES
  {lat:-33.9100,lng:151.1050,cat:'activity',title:'Sydney Ice Arena (Canterbury)',note:'Jack — ice skating & hockey programs',city:'sydney'},
  {lat:-33.7780,lng:151.1230,cat:'activity',title:'Macquarie Ice Rink',note:'Jack — ice skating, north Sydney',city:'sydney'},
  {lat:-33.8450,lng:151.1750,cat:'activity',title:'Sydney Trapeze School',note:'Bella — aerial silks, lyra, trapeze. ~$300-$500/term',city:'sydney'},
  // MELBOURNE ACTIVITIES
  {lat:-37.8155,lng:144.9378,cat:'activity',title:'O\'Brien Icehouse (Docklands)',note:'Jack — main Melbourne rink, hockey programs',city:'melbourne'},
  {lat:-37.8990,lng:145.0890,cat:'activity',title:'Olympic Ice Skating Centre (Oakleigh)',note:'Jack — 15 min from Glen Waverley. Learn to skate + hockey',city:'melbourne'},
  {lat:-37.7700,lng:144.9600,cat:'activity',title:'NICA (Brunswick)',note:'Bella & Jack — National Institute of Circus Arts. Best in AU for aerial.',city:'melbourne'},
];
