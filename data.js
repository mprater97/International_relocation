// ===== DATA MODEL =====
const GBP_AUD = 1.92;
let BUDGET = 30000; // editable via UI

const FUNDING_SOURCES = [
  {id:'lump_sum',label:'Company Lump Sum',color:'var(--accent)'},
  {id:'company_direct',label:'Company Direct (not lump sum)',color:'#8b5cf6'},
  {id:'sale_proceeds',label:'Sale Proceeds',color:'var(--orange)'},
  {id:'credit',label:'Credit/Debt',color:'var(--red)'},
  {id:'other',label:'Other',color:'var(--muted)'},
];

const DEFAULT_DEBTS = [
  {id:'debt_santander',desc:'Santander Loan (Car)',amount:6035,monthly:187.30,note:'Clear from car sale (~£14k)'},
  {id:'debt_mbna',desc:'MBNA (Car)',amount:7362,monthly:200,note:'Clear from car sale (~£14k)'},
  {id:'debt_klarna',desc:'Klarna (Vic Plumb)',amount:798,monthly:46.98,note:'Pay off from lump sum'},
  {id:'debt_vk12',desc:'VK12 bike finance',amount:751,monthly:83.56,note:'Keeping bikes — finance continues, shipping to AU'},
  {id:'debt_holiday',desc:'Credit card (holiday)',amount:1150,monthly:0,note:'Clearing from wages over next 3 months'},
  {id:'debt_phone',desc:'ID Mobile contract',amount:720,monthly:29.99,monthsLeft:24,note:'Cannot exit — £29.99/mo ongoing from AU'},
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
  {id:'dog',cat:'Dog Relocation',desc:'Pet relocation inc. quarantine',week:3,forecastLow:3000,forecastHigh:6000,forecast:4500,phase:1,defaultFund:'lump_sum'},
  {id:'ship',cat:'Shipping',desc:'PSS groupage — 2 bikes, 2 TVs, 11 cartons (door-to-door)',week:6,forecastLow:1533,forecastHigh:1533,forecast:1533,phase:1,defaultFund:'lump_sum'},
  {id:'ship_ins',cat:'Shipping',desc:'Shipping insurance',week:6,forecastLow:100,forecastHigh:300,forecast:200,phase:1,defaultFund:'lump_sum'},
  {id:'ship_bikes',cat:'Shipping',desc:'Bike shipping to AU',week:6,forecastLow:500,forecastHigh:1500,forecast:1000,phase:1,defaultFund:'lump_sum'},
  {id:'gas_cert',cat:'UK Property',desc:'Oil boiler service & safety certificate',week:5,forecastLow:60,forecastHigh:90,forecast:75,phase:2,defaultFund:'lump_sum'},
  {id:'eicr',cat:'UK Property',desc:'EICR electrical cert',week:5,forecastLow:120,forecastHigh:250,forecast:180,phase:2,defaultFund:'lump_sum'},
  {id:'epc',cat:'UK Property',desc:'EPC certificate',week:5,forecastLow:60,forecastHigh:120,forecast:80,phase:2,defaultFund:'lump_sum'},
  {id:'alarms',cat:'UK Property',desc:'Smoke/CO alarms',week:5,forecastLow:30,forecastHigh:80,forecast:50,phase:2,defaultFund:'lump_sum'},
  {id:'repairs',cat:'UK Property',desc:'Repairs & defects',week:6,forecastLow:200,forecastHigh:1000,forecast:500,phase:2,defaultFund:'lump_sum'},
  {id:'paint',cat:'UK Property',desc:'Paint touch-up',week:6,forecastLow:50,forecastHigh:200,forecast:80,phase:2,defaultFund:'lump_sum'},
  {id:'clean',cat:'UK Property',desc:'Professional deep clean',week:7,forecastLow:150,forecastHigh:300,forecast:200,phase:2,defaultFund:'lump_sum'},
  {id:'photos',cat:'UK Property',desc:'Professional photos',week:7,forecastLow:100,forecastHigh:200,forecast:150,phase:2,defaultFund:'lump_sum'},
  {id:'landlord_ins',cat:'UK Property',desc:'Landlord insurance (annual ~£960)',week:3,forecastLow:800,forecastHigh:1000,forecast:960,phase:1,defaultFund:'lump_sum'},
  {id:'agent_fee',cat:'UK Property',desc:'Letting agent setup fee (LAP - inc photos & marketing)',week:4,forecastLow:358,forecastHigh:358,forecast:358,phase:1,defaultFund:'lump_sum'},
  {id:'agent_plan',cat:'UK Property',desc:'Letting agent annual plan (LAP - save 10%)',week:4,forecastLow:1177,forecastHigh:1308,forecast:1177,phase:1,defaultFund:'lump_sum'},
  {id:'skip',cat:'Declutter',desc:'Skip / bulk waste',week:2,forecastLow:150,forecastHigh:300,forecast:200,phase:1,defaultFund:'lump_sum'},
  {id:'fx_cost',cat:'Financial',desc:'FX conversion costs',week:3,forecastLow:300,forecastHigh:600,forecast:400,phase:1,defaultFund:'lump_sum'},
  {id:'mail_redirect',cat:'UK Exit',desc:'Royal Mail redirect 12mo',week:8,forecastLow:60,forecastHigh:100,forecast:80,phase:2,defaultFund:'lump_sum'},
  {id:'misc_exit',cat:'UK Exit',desc:'Misc UK exit costs',week:11,forecastLow:100,forecastHigh:300,forecast:200,phase:3,defaultFund:'lump_sum'},
  {id:'poa',cat:'Legal',desc:'UK Power of Attorney',week:7,forecastLow:100,forecastHigh:300,forecast:200,phase:2,defaultFund:'lump_sum'},
  {id:'au_bond',cat:'AU Housing',desc:'Rental bond (4 weeks)',week:15,forecastLow:2600,forecastHigh:3200,forecast:2800,phase:4,defaultFund:'lump_sum'},
  {id:'au_advance',cat:'AU Housing',desc:'Rent advance (2 weeks)',week:15,forecastLow:1300,forecastHigh:1600,forecast:1400,phase:4,defaultFund:'lump_sum'},
  {id:'au_school1',cat:'AU School',desc:'School fees — 14yr old (term)',week:14,forecastLow:1250,forecastHigh:3000,forecast:2000,phase:4,defaultFund:'lump_sum'},
  {id:'au_school2',cat:'AU School',desc:'School fees — 10yr old (term)',week:14,forecastLow:1250,forecastHigh:3000,forecast:2000,phase:4,defaultFund:'lump_sum'},
  {id:'au_uniform1',cat:'AU School',desc:'Uniform — 14yr old',week:15,forecastLow:150,forecastHigh:300,forecast:200,phase:4,defaultFund:'lump_sum'},
  {id:'au_uniform2',cat:'AU School',desc:'Uniform — 10yr old',week:15,forecastLow:150,forecastHigh:300,forecast:200,phase:4,defaultFund:'lump_sum'},
  {id:'au_health',cat:'AU Insurance',desc:'Health insurance (3 months)',week:13,forecastLow:800,forecastHigh:1500,forecast:1100,phase:4,defaultFund:'lump_sum'},
  {id:'au_pet_ins',cat:'AU Insurance',desc:'AU pet insurance (new policy)',week:14,forecastLow:30,forecastHigh:80,forecast:50,phase:4,defaultFund:'lump_sum'},
  {id:'adapters',cat:'Misc',desc:'AU power adapters',week:10,forecastLow:10,forecastHigh:20,forecast:15,phase:3,defaultFund:'lump_sum'},
  // Debts to clear
  {id:'debt_car_finance',cat:'Debts to Clear',desc:'Car finance — Santander + MBNA',week:5,forecastLow:13397,forecastHigh:13397,forecast:13397,phase:2,defaultFund:'sale_proceeds'},
  {id:'debt_klarna_clear',cat:'Debts to Clear',desc:'Klarna (Vic Plumb)',week:4,forecastLow:798,forecastHigh:798,forecast:798,phase:1,defaultFund:'lump_sum'},
  // Company-funded items (tracked but not in personal budget)
  {id:'co_visa',cat:'Company Funded',desc:'Visa — all family',week:1,forecastLow:0,forecastHigh:0,forecast:0,phase:1,defaultFund:'company_direct'},
  {id:'co_flights',cat:'Company Funded',desc:'Flights — family of 4',week:8,forecastLow:0,forecastHigh:0,forecast:0,phase:2,defaultFund:'company_direct'},
  {id:'co_temp',cat:'Company Funded',desc:'Temp accommodation (6 weeks)',week:13,forecastLow:0,forecastHigh:0,forecast:0,phase:4,defaultFund:'company_direct'},
  {id:'co_tax',cat:'Company Funded',desc:'Tax advice service',week:1,forecastLow:0,forecastHigh:0,forecast:0,phase:1,defaultFund:'company_direct'},
  // Separate budget items (tracked but not in personal budget)
  {id:'sep_car',cat:'Separate Budget',desc:'AU car (used)',week:15,forecastLow:6000,forecastHigh:10000,forecast:8000,phase:4,defaultFund:'lump_sum'},
  {id:'sep_furniture',cat:'Separate Budget',desc:'AU furniture/essentials',week:15,forecastLow:500,forecastHigh:1500,forecast:1000,phase:4,defaultFund:'lump_sum'},
  {id:'sep_util',cat:'Separate Budget',desc:'AU utilities setup',week:15,forecastLow:100,forecastHigh:250,forecast:150,phase:4,defaultFund:'lump_sum'},
];

const MONTHLY_AU = [
  {id:'m_rent',desc:'Rent',monthly_aud:3200},
  {id:'m_groc',desc:'Groceries',monthly_aud:1400},
  {id:'m_transport',desc:'Transport/fuel',monthly_aud:500},
  {id:'m_util',desc:'Utilities + internet',monthly_aud:350},
  {id:'m_health',desc:'Health insurance',monthly_aud:400},
  {id:'m_mobile',desc:'Mobile phones',monthly_aud:120},
  {id:'m_kids',desc:'Kids activities',monthly_aud:300},
];
const MONTHLY_UK = [
  {id:'m_mortgage',desc:'Yorkshire BS Mortgage',monthly_gbp:1056},
  {id:'m_council',desc:'Council Tax',monthly_gbp:303.55},
  {id:'m_electric',desc:'Eon Electric',monthly_gbp:56.29},
  {id:'m_broadband',desc:'Vodafone Broadband',monthly_gbp:27.68},
  {id:'m_home_ins',desc:'Home Insurance (Quote Me Happy)',monthly_gbp:43.34},
  {id:'m_tv',desc:'TV Licence',monthly_gbp:14.95},
  {id:'m_kerosene',desc:'Kerosene (heating)',monthly_gbp:0},
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
  {id:'m_klarna',action:'CLEAR',note:'Pay off from lump sum'},
  {id:'m_vk12',action:'KEEP',note:'Keeping bikes — taking to AU. Finance continues.'},
];
const INCOME = {salary_aud:10400,rsu_aud:2500};

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
];
