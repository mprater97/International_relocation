function renderPlan(){
  document.getElementById('plan').innerHTML=`

<div class="card" style="border-left:4px solid var(--accent)">
  <h2>🇬🇧 → 🇦🇺 Complete Relocation Playbook</h2>
  <p class="ts tm">Family of 4 · UK to Melbourne · 16-week plan · Company-sponsored visa</p>
  <div class="stabs mt2">
    <div class="stab active" onclick="showPlanSection('overview',this)">Overview</div>
    <div class="stab" onclick="showPlanSection('phase1',this)">Phase 1</div>
    <div class="stab" onclick="showPlanSection('phase2',this)">Phase 2</div>
    <div class="stab" onclick="showPlanSection('phase3',this)">Phase 3</div>
    <div class="stab" onclick="showPlanSection('phase4',this)">Phase 4</div>
    <div class="stab" onclick="showPlanSection('finance',this)">Finance</div>
    <div class="stab" onclick="showPlanSection('legal',this)">Legal & Tax</div>
    <div class="stab" onclick="showPlanSection('links',this)">Key Links</div>
  </div>
</div>

<div id="planContent"></div>`;
  showPlanSection('overview');
}

function showPlanSection(id,btn){
  if(btn){document.querySelectorAll('#plan .stab').forEach(s=>s.classList.remove('active'));btn.classList.add('active')}
  document.getElementById('planContent').innerHTML=PLAN_SECTIONS[id]||'';
}

const PLAN_SECTIONS = {};

PLAN_SECTIONS.overview=`
<div class="card">
  <h2>🎯 Mission</h2>
  <p class="ts">Execute a low-risk, cost-efficient relocation from UK to Melbourne resulting in:</p>
  <ul class="ts" style="margin:8px 0 0 20px;line-height:2">
    <li>UK liabilities minimised (house rented, debts cleared)</li>
    <li>AU living stable within 6–8 weeks of arrival</li>
    <li>Family fully settled — school, housing, routine</li>
    <li>Monthly surplus achieved within 3–4 months</li>
  </ul>
</div>

<div class="card">
  <h2>📅 16-Week Timeline</h2>
  <div class="table-wrap"><table>
    <tr><th>Phase</th><th>Weeks</th><th>Focus</th><th>Key Milestones</th></tr>
    <tr><td><span class="pl p1">Phase 1</span></td><td>1–4</td><td>Foundations</td><td>Dog relo started, agent instructed, declutter, FX setup</td></tr>
    <tr><td><span class="pl p2">Phase 2</span></td><td>5–8</td><td>Lock & Prep</td><td>Property compliant & listed, cars sold, shipping booked, contracts cancelled</td></tr>
    <tr><td><span class="pl p3">Phase 3</span></td><td>9–12</td><td>Execution</td><td>Goods shipped, tenant secured, UK exit complete, bags packed</td></tr>
    <tr><td><span class="pl p4">Phase 4</span></td><td>13–16</td><td>Arrival & Settle</td><td>Bank, TFN, rental, schools, car, routine established</td></tr>
  </table></div>
</div>

<div class="card">
  <h2>⚠️ Critical Path (Do Not Delay)</h2>
  <div class="table-wrap"><table>
    <tr><th>Item</th><th>Why</th><th>Start</th></tr>
    <tr><td style="font-weight:600">🐕 Dog relocation</td><td>Longest timeline — blood test + 180-day wait + quarantine</td><td>Day 1</td></tr>
    <tr><td style="font-weight:600">🏠 UK property rental</td><td>Biggest financial lever — empty house = £1k+/mo drain</td><td>Week 1</td></tr>
    <tr><td style="font-weight:600">📦 Shipping timing</td><td>6–10 weeks transit — must align with arrival</td><td>Week 6</td></tr>
    <tr><td style="font-weight:600">🏠 AU rental</td><td>Competitive market — need strong application ready</td><td>Day 1 in AU</td></tr>
  </table></div>
</div>

<div class="card">
  <h2>🧠 Core Strategy</h2>
  <div class="table-wrap"><table>
    <tr><th>#</th><th>Rule</th><th>Why</th></tr>
    <tr><td>1</td><td>Sequence over speed</td><td>Do things in the right order — rushing causes expensive mistakes</td></tr>
    <tr><td>2</td><td>Cash flow over optimisation early</td><td>Flexibility matters more than perfection in months 1–3</td></tr>
    <tr><td>3</td><td>Reduce UK cost drag ASAP</td><td>Every month of empty house / unused contracts = money burned</td></tr>
    <tr><td>4</td><td>Stay lean in AU first 3 months</td><td>Avoid lifestyle creep — settle first, upgrade later</td></tr>
    <tr><td>5</td><td>Don't overthink — execute then refine</td><td>80% right now beats 100% right in 3 months</td></tr>
  </table></div>
</div>`;

PLAN_SECTIONS.phase1=`
<div class="card" style="border-left:4px solid #60a5fa">
  <h2>🔵 Phase 1: Foundations (Weeks 1–4)</h2>
</div>

<div class="card">
  <h2>🐕 Nala — Relocation via PetAir UK</h2>
  <p class="ts tm mb2">Nala stays with family in UK for first 6–9 months. Start vet process now so she's travel-ready by ~Jan 2027. PetAir UK: <a href="https://www.petairuk.com" target="_blank">petairuk.com</a> · 01725 551124</p>

  <h3>⚠️ Critical Rules</h3>
  <ul class="ts" style="line-height:2">
    <li><strong>Two separate ID checks</strong> by two different OV66 authorised vets from unrelated practices — both BEFORE blood sample</li>
    <li><strong>180-day wait</strong> starts from date the <strong>lab receives</strong> the blood sample, NOT the draw date</li>
    <li><strong>Blood sample vet ≠ VHC endorsement vet</strong> — must be different vets</li>
    <li><strong>Rabies vaccination must be valid</strong> at both blood test AND export date (3-year vaccines OK)</li>
    <li><strong>Microchip registered owner</strong> must be the person importing to Australia</li>
    <li style="color:var(--red)"><strong>Leishmania warning:</strong> If Nala has ever been vaccinated against Leishmania (e.g. CaniLeish) she will test positive and be <strong>permanently barred</strong> from Australia. No exceptions. Check with your vet.</li>
  </ul>

  <h3>Step-by-Step Process</h3>
  <div class="table-wrap"><table>
    <tr><th>#</th><th>Step</th><th>Detail</th><th>When</th><th>Cost</th></tr>
    <tr><td>1</td><td>Confirm microchip owner</td><td>Must match the person importing. Update microchip database if needed</td><td>Week 1</td><td>Free</td></tr>
    <tr><td>2</td><td>Leishmania check</td><td>Confirm with vet Nala has NEVER had CaniLeish or similar vaccine</td><td>Week 1</td><td>Free</td></tr>
    <tr><td>3</td><td>Rabies vaccination</td><td>Must be current and remain valid through to export. 3-year vaccine recommended</td><td>Week 2</td><td>£50–£80</td></tr>
    <tr><td>4</td><td>1st ID check</td><td>OV66 authorised vet. PetAir offer this at their Windsor branch</td><td>Week 3</td><td>£120</td></tr>
    <tr><td>5</td><td>2nd ID check</td><td>DIFFERENT OV66 vet from a separate, unrelated practice. Must be before blood sample</td><td>Week 4</td><td>£80–£120</td></tr>
    <tr><td>6</td><td>RNATT blood sample</td><td>Can be same appointment as 2nd ID check. Cannot be taken before 2nd ID check. <strong>Note the date the lab receives the sample — this starts the 180-day clock</strong></td><td>Week 5</td><td>£100–£200</td></tr>
    <tr><td>7</td><td>180-day wait</td><td>~6 months from lab receipt date. Nala stays with family during this period</td><td>Weeks 5–30</td><td>—</td></tr>
    <tr><td>8</td><td>Crate training</td><td>Daily 15–30 min sessions. Family member to continue while caring for Nala</td><td>Week 6+</td><td>£50–£150</td></tr>
    <tr><td>9</td><td>Import permit</td><td>PetAir handles application</td><td>Week 8</td><td>Included</td></tr>
    <tr><td>10</td><td>Book flight</td><td>Once 180-day eligibility date confirmed. 10 days quarantine at Mickleham (Melbourne) if both ID checks done correctly, otherwise 30 days</td><td>~Month 7–8</td><td>£3k–£6k</td></tr>
    <tr><td>11</td><td>3 pre-export vet visits</td><td>Time-sensitive to flight date. PetAir will schedule exact dates and advise on specific products required</td><td>Weeks before flight</td><td>£200–£400</td></tr>
    <tr><td>12</td><td>VHC endorsement</td><td>Veterinary Health Certificate — must be endorsed by a DIFFERENT vet from the one who took the blood sample</td><td>Days before flight</td><td>Included</td></tr>
  </table></div>

  <p class="ts mt2" style="color:var(--orange)">💡 <strong>Timeline:</strong> If blood sample reaches lab by ~July 2026, Nala is eligible to fly from ~January 2027. Start ID checks now so you're not rushing.</p>
</div>

<div class="card">
  <h2>🏠 UK Property — Rental Setup</h2>
  <div class="table-wrap"><table>
    <tr><th>Step</th><th>Detail</th><th>Link</th></tr>
    <tr><td>Contact 3 letting agents</td><td>Compare fees (target 8–10%), services, tenant demand</td><td>Local agents</td></tr>
    <tr><td>Consent to Let</td><td>Apply to Yorkshire BS. Cheaper than BTL remortgage — small rate increase</td><td>Call lender</td></tr>
    <tr><td>Landlord insurance</td><td>~£80/mo. Switch from home insurance</td><td><a href="https://www.comparethemarket.com/home-insurance/landlord/" target="_blank">Compare the Market</a></td></tr>
    <tr><td>NRL Scheme</td><td>Register BEFORE leaving UK. Without it, agent withholds 20% of rent for HMRC</td><td><a href="https://www.gov.uk/government/publications/non-resident-landlord-application-to-have-uk-rental-income-without-deduction-of-uk-tax-individuals-nrl1" target="_blank">HMRC NRL1 Form</a></td></tr>
    <tr><td>Deposit protection</td><td>Agent usually handles. Must be protected within 30 days</td><td><a href="https://www.depositprotection.com" target="_blank">DPS</a> / <a href="https://www.tenancydepositscheme.com" target="_blank">TDS</a></td></tr>
  </table></div>
  <p class="ts mt2">💡 Price slightly under market (£50/mo less) to secure a tenant FAST. Empty month = £1,064 mortgage with no income.</p>
</div>

<div class="card">
  <h2>🧹 Declutter</h2>
  <p class="ts">Target: remove 50–70% of household contents. Every box you don't ship saves £30–£50.</p>
  <div class="table-wrap"><table>
    <tr><th>Action</th><th>Detail</th></tr>
    <tr><td>Sell (>£200)</td><td><a href="https://www.facebook.com/marketplace" target="_blank">Facebook Marketplace</a>, <a href="https://www.ebay.co.uk" target="_blank">eBay</a>, <a href="https://www.gumtree.com" target="_blank">Gumtree</a></td></tr>
    <tr><td>Donate</td><td><a href="https://www.bhf.org.uk/shop/donating-goods" target="_blank">British Heart Foundation</a> (free collection), <a href="https://www.sueryder.org" target="_blank">Sue Ryder</a></td></tr>
    <tr><td>Skip/bulk waste</td><td>Check council for free bulky waste collection first. Skip ~£150–£300</td></tr>
  </table></div>
  <p class="ts mt2">Rule: "Would I pay £50 to have this in Melbourne?" If no, it goes.</p>
</div>

<div class="card">
  <h2>📦 Shipping — PSS International Removals</h2>
  <p class="ts tm mb2"><a href="https://www.pssremovals.com" target="_blank">pssremovals.com</a> · 020 8686 7733 · info@pssremovals.com</p>
  <div class="table-wrap"><table>
    <tr><th>Detail</th><th>Info</th></tr>
    <tr><td>Quote</td><td><strong>£1,533</strong> (ref: 1776892279 B) — valid 30 days from 23 Apr 2026</td></tr>
    <tr><td>Service</td><td>Shared container (groupage), door-to-door, professional packing & materials included</td></tr>
    <tr><td>Inventory</td><td>2 × Bicycles, 2 × TVs, 11 × Cartons</td></tr>
    <tr><td>Transit time</td><td>8–12 weeks (can be up to 12–16 depending on port schedules)</td></tr>
    <tr><td>Deposit</td><td>£350 to reserve dates (BAR protected)</td></tr>
    <tr><td>Includes</td><td>Packing, materials, inventory, ocean freight, customs clearance, delivery to 1st floor</td></tr>
    <tr><td>Excludes</td><td>Duties/taxes, customs/agricultural inspection fees, parking permits, extra items</td></tr>
    <tr><td>Prohibited</td><td><a href="https://www.agriculture.gov.au/biosecurity-trade/travelling/bringing-mailing-goods" target="_blank">DAFF prohibited items</a> — wood, food, seeds, plant materials, untreated timber</td></tr>
  </table></div>
</div>

<div class="card">
  <h2>📦 Carton Packing Guide (11 cartons × 46cm × 46cm × 46cm, max 25kg each)</h2>
  <p class="ts tm mb2">Each carton is roughly the size of a large moving box. Here's a realistic guide for what fits:</p>
  <div class="table-wrap"><table>
    <tr><th>Carton</th><th>Suggested Contents</th><th>Tips</th></tr>
    <tr><td><strong>1–2: Kids' essentials</strong></td><td>Favourite toys, books, games, comfort items, photo albums, small keepsakes</td><td>Let each kid pack one carton of things that matter to them</td></tr>
    <tr><td><strong>3: Kitchen</strong></td><td>Favourite pans, knife set, utensils, small appliances (check voltage — AU is 240V same as UK so most are fine)</td><td>Wrap items in tea towels to save space</td></tr>
    <tr><td><strong>4: Bedding/linen</strong></td><td>Duvet, pillows, favourite bed sheets, towels</td><td>Vacuum bags compress these massively — fit 2–3× more</td></tr>
    <tr><td><strong>5: Tools & DIY</strong></td><td>Essential tools, drill, screwdriver set, bike tools, spare parts</td><td>Heavy — watch the 25kg limit</td></tr>
    <tr><td><strong>6: Electronics</strong></td><td>Games consoles, controllers, cables, hard drives, chargers, adapters</td><td>Original boxes if you have them. Bubble wrap if not</td></tr>
    <tr><td><strong>7: Books & documents</strong></td><td>Important books, reference materials, photo albums, framed photos</td><td>Books are HEAVY — half-fill and pad with clothes</td></tr>
    <tr><td><strong>8–9: Clothes (off-season)</strong></td><td>Winter coats, suits, formal wear, shoes, items you won't need for 8–12 weeks</td><td>Vacuum bags again. You'll carry 6–8 weeks of clothes in suitcases</td></tr>
    <tr><td><strong>10: Sentimental</strong></td><td>Family heirlooms, ornaments, artwork, irreplaceable items</td><td>Wrap individually. These are the things you can't rebuy</td></tr>
    <tr><td><strong>11: Misc / overflow</strong></td><td>Anything else that passes the test: "Would I pay £50 to have this in Melbourne?"</td><td>Don't fill this just because it exists — empty space is fine</td></tr>
  </table></div>
  <p class="ts mt2"><strong>Don't ship:</strong> Cheap furniture (buy in AU), appliances you can replace, anything bulky and low-value, anything on the <a href="https://www.agriculture.gov.au/biosecurity-trade/travelling/bringing-mailing-goods" target="_blank">DAFF prohibited list</a></p>
  <p class="ts mt2">💡 <strong>Pro tip:</strong> Take photos of every item before it goes in a carton. Number each carton 1–11 and keep a list of contents. Email it to yourself. This is your insurance evidence if anything goes missing.</p>
</div>

<div class="card">
  <h2>💰 Financial Setup</h2>
  <div class="table-wrap"><table>
    <tr><th>Action</th><th>Link</th></tr>
    <tr><td>Open Wise account</td><td><a href="https://wise.com" target="_blank">wise.com</a> — 0.4–0.6% FX fee vs 2–4% at banks</td></tr>
    <tr><td>Open Revolut (backup)</td><td><a href="https://www.revolut.com" target="_blank">revolut.com</a></td></tr>
    <tr><td>Set GBP→AUD rate alerts</td><td>Target 1.95+. Convert in £5k–£10k tranches</td></tr>
    <tr><td>Pre-open AU bank account</td><td><a href="https://www.commbank.com.au/moving-to-australia.html" target="_blank">CommBank — Moving to Australia</a> (open from UK, verify in-branch within 6 weeks)</td></tr>
    <tr><td>Notify UK bank</td><td>Tell them you're moving overseas to avoid fraud blocks</td></tr>
  </table></div>
</div>

<div class="card">
  <h2>🏥 Pre-Departure Health (Use NHS While Free)</h2>
  <div class="table-wrap"><table>
    <tr><th>Action</th><th>Why</th></tr>
    <tr><td>Dental checkups — whole family</td><td>AU dental: checkup $200–$400, filling $150–$350. Do it free on NHS</td></tr>
    <tr><td>Eye tests + prescriptions</td><td>Update before leaving</td></tr>
    <tr><td>GP — request 3–6 month prescriptions</td><td>Use generic/chemical names (AU may have different brand names)</td></tr>
    <tr><td>Get medical summaries for all 4</td><td>AU GP needs your history. Getting records from UK remotely is painful</td></tr>
    <tr><td>Kids immunisation records</td><td>Schools require these for enrolment</td></tr>
  </table></div>
</div>

<div class="card">
  <h2>🏛️ UK Pension</h2>
  <div class="table-wrap"><table>
    <tr><th>Action</th><th>Detail</th></tr>
    <tr><td>Check State Pension record</td><td><a href="https://www.gov.uk/check-state-pension" target="_blank">gov.uk/check-state-pension</a> — need 35 qualifying years for full pension</td></tr>
    <tr><td>Voluntary NI contributions</td><td>Class 2 ~£3.45/week from AU. If you have 25+ years, continuing to 35 is excellent value (~£180/yr buys ~£275/yr pension for life). Discuss with company tax advisor</td></tr>
    <tr><td>Workplace pensions</td><td>Locate all, get values. Leave where they are for now — don't rush QROPS transfers</td></tr>
  </table></div>
</div>`;

PLAN_SECTIONS.phase2=`
<div class="card" style="border-left:4px solid var(--orange)">
  <h2>🟠 Phase 2: Lock & Prep (Weeks 5–8)</h2>
</div>

<div class="card">
  <h2>🏠 Property Compliance (MANDATORY for letting)</h2>
  <div class="table-wrap"><table>
    <tr><th>Certificate</th><th>Cost</th><th>Detail</th></tr>
    <tr><td>Oil Safety (CP12)</td><td>£60–£90</td><td>Must be Gas Safe registered engineer. <a href="https://www.oftec.org" target="_blank">Find engineer</a></td></tr>
    <tr><td>EICR (Electrical)</td><td>£120–£250</td><td>Electrical Installation Condition Report</td></tr>
    <tr><td>EPC</td><td>£60–£120</td><td>Min rating E. Valid 10 years — check if current</td></tr>
    <tr><td>Smoke alarms</td><td>£30–£80</td><td>Every floor. Interlinked recommended</td></tr>
    <tr><td>CO detectors</td><td>Included above</td><td>Required in rooms with solid fuel appliances</td></tr>
  </table></div>
  <p class="ts mt2">💡 Some companies do combined gas+electrical for ~£150–£200. Check <a href="https://www.checkatrade.com" target="_blank">Checkatrade</a></p>
</div>

<div class="card">
  <h2>🏠 Property Prep & Listing</h2>
  <div class="table-wrap"><table>
    <tr><th>Action</th><th>Detail</th></tr>
    <tr><td>Fix all defects</td><td>Leaks, heating, locks, damp. Functional > perfect</td></tr>
    <tr><td>Neutral paint</td><td>DIY with magnolia/white emulsion saves £100–£200</td></tr>
    <tr><td>Deep clean</td><td>Professional clean £150–£300</td></tr>
    <tr><td>Professional photos</td><td>£100–£200. Makes a huge difference to listing quality</td></tr>
    <tr><td>List with agent</td><td>Slightly under market = faster tenant. Speed > perfection</td></tr>
    <tr><td>"How to Rent" guide</td><td>Legal requirement. <a href="https://www.gov.uk/government/publications/how-to-rent" target="_blank">Download from gov.uk</a></td></tr>
  </table></div>
</div>

<div class="card">
  <h2>🚗 Sell Cars</h2>
  <div class="table-wrap"><table>
    <tr><th>Action</th><th>Detail</th></tr>
    <tr><td>Get valuations</td><td><a href="https://www.webuyanycar.com" target="_blank">We Buy Any Car</a>, <a href="https://www.autotrader.co.uk/car-valuation" target="_blank">AutoTrader valuation</a>, local dealers</td></tr>
    <tr><td>List early</td><td>Private sale gets 10–20% more than WBAC. Don't wait until last 2 weeks</td></tr>
    <tr><td>After sale</td><td>Cancel insurance, SORN or transfer V5C via <a href="https://www.gov.uk/sold-bought-vehicle" target="_blank">gov.uk</a></td></tr>
    <tr><td>No-claims letter</td><td>Request from insurer — AU insurers may accept for discount</td></tr>
  </table></div>
  <p class="ts mt2" style="color:var(--orange)">Target: £14k combined. Must cover £13,397 car finance (Santander + MBNA).</p>
</div>

<div class="card">
  <h2>🧾 Cancel UK Contracts</h2>
  <div class="table-wrap"><table>
    <tr><th>Cancel (30 day notice)</th><th>Keep</th></tr>
    <tr><td>Vodafone broadband</td><td>L&G Life + Critical Illness (cheap, hard to replace)</td></tr>
    <tr><td>TV Licence — <a href="https://www.tvlicensing.co.uk/check-if-you-need-one/topics/cancellations-and-refunds" target="_blank">Cancel here</a></td><td>UK bank account</td></tr>
    <tr><td>Squarespace email</td><td>ID Mobile (can't exit — 24mo contract)</td></tr>
    <tr><td>Vodafone mobile, 1p mobile</td><td></td></tr>
    <tr><td>AA membership</td><td></td></tr>
    <tr><td>Car insurance × 2, car tax × 2</td><td></td></tr>
    <tr><td>Pet insurance × 2 (get AU cover instead)</td><td></td></tr>
  </table></div>
  <p class="ts mt2">💡 Keep a UK mobile on cheap PAYG (£5–£10/mo) for banking 2FA and HMRC. <a href="https://www.royalmail.com/personal/receiving-mail/redirection" target="_blank">Royal Mail redirect</a> (12 months, £60–£100)</p>
</div>

<div class="card">
  <h2>🏥 AU Health Insurance</h2>
  <p class="ts">On a 482 visa you need OVHC (Overseas Visitor Health Cover). Check if company covers this.</p>
  <div class="table-wrap"><table>
    <tr><th>Provider</th><th>Notes</th></tr>
    <tr><td><a href="https://www.ahm.com.au/overseas-visitors" target="_blank">AHM</a></td><td>Often cheapest for OVHC</td></tr>
    <tr><td><a href="https://www.nib.com.au/overseas-visitors" target="_blank">NIB</a></td><td>Good value</td></tr>
    <tr><td><a href="https://www.bupa.com.au/health-insurance/overseas-visitors" target="_blank">Bupa</a></td><td>Wider network, costs more</td></tr>
    <tr><td><a href="https://www.medibank.com.au/overseas-health-insurance/" target="_blank">Medibank</a></td><td>Wider network, costs more</td></tr>
  </table></div>
</div>

<div class="card">
  <h2>⚖️ Wills & Legal</h2>
  <div class="table-wrap"><table>
    <tr><th>Action</th><th>Detail</th></tr>
    <tr><td>Review UK wills</td><td>May not cover AU assets</td></tr>
    <tr><td>UK Power of Attorney</td><td>£100–£300. Someone to manage UK property/banking if needed. <a href="https://www.gov.uk/power-of-attorney" target="_blank">gov.uk/power-of-attorney</a></td></tr>
    <tr><td>AU wills</td><td>Get drafted after arrival (Month 2–3). ~$300–$600 for a couple</td></tr>
  </table></div>
</div>`;

PLAN_SECTIONS.phase3=`
<div class="card" style="border-left:4px solid var(--yellow)">
  <h2>🟡 Phase 3: Execution (Weeks 9–12)</h2>
</div>

<div class="card">
  <h2>📦 Pack & Ship</h2>
  <div class="table-wrap"><table>
    <tr><th>Action</th><th>Detail</th></tr>
    <tr><td>Supervised packing</td><td>Be present. Photograph everything before boxing (insurance evidence)</td></tr>
    <tr><td>Inventory spreadsheet</td><td>Numbered list with photos. Email to yourself as cloud backup</td></tr>
    <tr><td>Keep essentials separate</td><td>6–8 weeks of clothing, work setup, kids essentials — NOT shipped</td></tr>
    <tr><td>Bikes</td><td>Shipping separately — confirm with shipping company</td></tr>
  </table></div>
</div>

<div class="card">
  <h2>🏠 UK Property — Final Push</h2>
  <div class="table-wrap"><table>
    <tr><th>Action</th><th>Detail</th></tr>
    <tr><td>Chase agent</td><td>Weekly calls for tenant applications</td></tr>
    <tr><td>Approve tenant</td><td>Review references. Don't be too picky — a good tenant now > perfect tenant in 2 months</td></tr>
    <tr><td>Sign tenancy</td><td>Ideally before departure. Fallback: agent manages remotely</td></tr>
    <tr><td>Deposit protected</td><td>Must be done within 30 days of receiving deposit</td></tr>
  </table></div>
  <p class="ts mt2" style="color:var(--orange)">⚠️ Budget for 1–2 months void if no tenant by departure (£2,000–£2,400)</p>
</div>

<div class="card">
  <h2>🧾 Final UK Exit</h2>
  <div class="table-wrap"><table>
    <tr><th>Action</th><th>Link</th></tr>
    <tr><td>Final meter readings</td><td>Gas, electric, water — on moving day</td></tr>
    <tr><td>P85 form to HMRC</td><td><a href="https://www.gov.uk/government/publications/income-tax-leaving-the-uk-getting-your-tax-right-p85" target="_blank">P85 — Leaving the UK</a></td></tr>
    <tr><td>Medical records</td><td>Get certified copies for all 4. Dental x-rays too</td></tr>
    <tr><td>School records</td><td>Transfer letters for both kids</td></tr>
    <tr><td>DVLA notification</td><td><a href="https://www.gov.uk/sold-bought-vehicle" target="_blank">gov.uk vehicle notification</a></td></tr>
    <tr><td>Notify premium bonds / NS&I</td><td><a href="https://www.nsandi.com" target="_blank">nsandi.com</a></td></tr>
  </table></div>
</div>

<div class="card">
  <h2>👨‍👩‍👧‍👦 Kids' Transition</h2>
  <div class="table-wrap"><table>
    <tr><th>Action</th><th>Detail</th></tr>
    <tr><td>Farewell gatherings</td><td>Let them say proper goodbyes</td></tr>
    <tr><td>Contact details</td><td>WhatsApp/Discord groups with UK friends before leaving</td></tr>
    <tr><td>Comfort items</td><td>Let kids choose what goes in their suitcase</td></tr>
    <tr><td>Flight entertainment</td><td>Download offline content — tablets, books, games</td></tr>
  </table></div>
  <p class="ts mt2">💡 The 14-year-old will likely find it harder — leaving established friendships at a critical social age. Setting up video call schedules helps enormously.</p>
</div>

<div class="card">
  <h2>📁 Documents Folder (CARRY ON — DO NOT CHECK)</h2>
  <p class="ts">Passports, visa grants, employment contract, marriage cert, birth certs, medical records, dental records, vaccination records, school records, dog paperwork, insurance policies, tenancy agreement, bank statements (3 months), driving licences, reference letters</p>
  <p class="ts mt2" style="font-weight:600">☁️ Scan EVERYTHING to cloud (Google Drive / OneDrive) as backup.</p>
</div>`;

PLAN_SECTIONS.phase4=`
<div class="card" style="border-left:4px solid var(--green)">
  <h2>🟢 Phase 4: Arrival & Settling (Weeks 13–16)</h2>
</div>

<div class="card">
  <h2>🏦 Day 1–7: Admin Blitz</h2>
  <div class="table-wrap"><table>
    <tr><th>Action</th><th>Detail</th><th>Link</th></tr>
    <tr><td>Bank account</td><td>Verify CommBank in-branch (if pre-opened) or open NAB</td><td><a href="https://www.commbank.com.au" target="_blank">CommBank</a></td></tr>
    <tr><td>TFN — both adults</td><td>Apply Day 1. Takes 2–4 weeks by post. Without it, employer withholds 45%</td><td><a href="https://www.ato.gov.au/individuals/tax-file-number/" target="_blank">ATO — TFN</a></td></tr>
    <tr><td>Health insurance</td><td>Activate OVHC policy</td><td></td></tr>
    <tr><td>SIM cards</td><td>Optus, Telstra, or Vodafone for all family</td><td></td></tr>
    <tr><td>Medicare</td><td>Register if eligible on your visa (UK-AU reciprocal agreement)</td><td><a href="https://www.servicesaustralia.gov.au/medicare" target="_blank">Services Australia</a></td></tr>
    <tr><td>Register with GP</td><td>Use <a href="https://www.hotdoc.com.au" target="_blank">HotDoc</a> to find bulk-billing GPs nearby</td><td></td></tr>
    <tr><td>Emergency number</td><td><strong>000</strong> (not 999). Poisons: 13 11 26</td><td></td></tr>
  </table></div>
</div>

<div class="card">
  <h2>🏠 Rental Search (HIGH PRIORITY)</h2>
  <p class="ts tm mb2">Melbourne rental market is competitive. You have 6 weeks temp housing — use it well.</p>
  <div class="table-wrap"><table>
    <tr><th>Action</th><th>Detail</th></tr>
    <tr><td>Set up alerts</td><td><a href="https://www.domain.com.au" target="_blank">Domain.com.au</a> and <a href="https://www.realestate.com.au" target="_blank">Realestate.com.au</a></td></tr>
    <tr><td>Target areas</td><td>Glen Waverley, Mount Waverley, Box Hill, Burwood, Doncaster</td></tr>
    <tr><td>Target rent</td><td>$650–$800/week. $700 vs $800 = $5,200/year saved</td></tr>
    <tr><td>Apply via</td><td><a href="https://www.1form.com.au" target="_blank">1Form</a> or <a href="https://www.2apply.com.au" target="_blank">2Apply</a> — pre-fill your profile</td></tr>
    <tr><td>Bond</td><td>4 weeks rent + 2 weeks advance = ~$3,500–$5,000 upfront</td></tr>
  </table></div>
  <p class="ts mt2"><strong>Winning tactics:</strong> Arrive 10 min early to inspections. Offer 6–12 month lease. Offer extra rent in advance. Include a cover letter about your family and stable employment. Apply same day.</p>
</div>

<div class="card">
  <h2>🏫 Schools</h2>
  <div class="table-wrap"><table>
    <tr><th>Detail</th><th>Info</th></tr>
    <tr><td>Visa fees</td><td>482 visa = temporary resident. Govt schools charge $5,000–$12,000/yr per child. <strong>Check if company covers this.</strong></td></tr>
    <tr><td>Term timing</td><td>Mid-July arrival = Term 3 start. Good timing — kids start immediately</td></tr>
    <tr><td>Good schools (14yr)</td><td>Glen Waverley Secondary, Mount Waverley Secondary</td></tr>
    <tr><td>Good schools (10yr)</td><td>Glen Waverley Primary, Pinewood Primary</td></tr>
    <tr><td>Catchment</td><td>Research zones BEFORE choosing rental — <a href="https://www.findmyschool.vic.gov.au" target="_blank">findmyschool.vic.gov.au</a></td></tr>
  </table></div>
</div>

<div class="card">
  <h2>🚗 Car & Driving</h2>
  <div class="table-wrap"><table>
    <tr><th>Action</th><th>Detail</th></tr>
    <tr><td>Research</td><td><a href="https://www.carsales.com.au" target="_blank">Carsales.com.au</a>. Target: Toyota Camry, Mazda 3, Hyundai i30 ($15k–$20k)</td></tr>
    <tr><td>Inspection</td><td><a href="https://www.racv.com.au/on-the-road/buying-a-car/vehicle-inspections.html" target="_blank">RACV vehicle inspection</a> ($200–$350)</td></tr>
    <tr><td>Insurance</td><td>Compare on <a href="https://www.iselect.com.au/car-insurance/" target="_blank">iSelect</a></td></tr>
    <tr><td>Toll accounts</td><td>Set up BEFORE driving: <a href="https://www.citylink.com.au" target="_blank">CityLink</a> + <a href="https://www.eastlink.com.au" target="_blank">EastLink</a>. No account = automatic fine</td></tr>
    <tr><td>Licence</td><td>UK licence valid 6 months. Swap to Victorian — no test for UK holders. <a href="https://www.vicroads.vic.gov.au" target="_blank">VicRoads</a></td></tr>
    <tr><td>Hook turns</td><td>Melbourne CBD only — right turn from left lane. <a href="https://www.vicroads.vic.gov.au/safety-and-road-rules/road-rules/a-to-z-of-road-rules/hook-turns" target="_blank">How hook turns work</a></td></tr>
    <tr><td>Tram rules</td><td>MUST stop behind trams when doors open. Fine $480+</td></tr>
  </table></div>
</div>

<div class="card">
  <h2>🔌 Home Setup</h2>
  <div class="table-wrap"><table>
    <tr><th>Service</th><th>Recommendation</th></tr>
    <tr><td>Electricity + gas</td><td>Compare on <a href="https://compare.energy.vic.gov.au" target="_blank">Victorian Energy Compare</a> (govt site)</td></tr>
    <tr><td>Internet</td><td><a href="https://www.aussiebroadband.com.au" target="_blank">Aussie Broadband</a> (best rated) or <a href="https://www.superloop.com" target="_blank">Superloop</a> (cheapest). Check NBN type at your address</td></tr>
    <tr><td>Furniture</td><td><a href="https://www.facebook.com/marketplace" target="_blank">Facebook Marketplace</a> (excellent in Melbourne), <a href="https://www.ikea.com/au/" target="_blank">IKEA</a>, <a href="https://www.kmart.com.au" target="_blank">Kmart</a></td></tr>
    <tr><td>Mobile plans</td><td>Boost, Belong, or Optus prepaid ($30–$50/mo each)</td></tr>
  </table></div>
</div>

<div class="card">
  <h2>👨‍👩‍👧‍👦 Family Settling</h2>
  <div class="table-wrap"><table>
    <tr><th>Who</th><th>Actions</th></tr>
    <tr><td>Kids</td><td>Enrol in local sport within 2 weeks (AFL Auskick, cricket, swimming, tennis). Set up video calls with UK friends. Check school buddy programs</td></tr>
    <tr><td>Partner</td><td>Full work rights on 482 dependent visa. <a href="https://www.seek.com.au" target="_blank">Seek.com.au</a> for jobs. Join local Facebook groups ("Brits in Melbourne", suburb groups). Community groups, volunteering</td></tr>
    <tr><td>Family</td><td>Establish routine quickly. Explore local area — parks, library, shops. Keep weekends light first month</td></tr>
  </table></div>
  <p class="ts mt2">💡 It's normal to feel unsettled for 4–6 weeks. Routine is the fastest cure.</p>
</div>`;

PLAN_SECTIONS.finance=`
<div class="card">
  <h2>💰 Financial Strategy</h2>
</div>

<div class="card">
  <h2>Starting Position</h2>
  <div class="table-wrap"><table>
    <tr><th>In</th><th>Amount</th></tr>
    <tr><td>Company lump sum</td><td class="tg">~£30,000 (TBC)</td></tr>
    <tr><td>Car sales (forecast)</td><td class="tg">~£14,000</td></tr>
    <tr><td>Personal savings</td><td>£0</td></tr>
  </table></div>
  <table class="mt2">
    <tr><th>Debts to Clear</th><th>Amount</th><th>Strategy</th></tr>
    <tr><td>Santander car loan</td><td>£6,035</td><td>From car sale</td></tr>
    <tr><td>MBNA car</td><td>£7,362</td><td>From car sale</td></tr>
    <tr><td>Klarna</td><td>£798</td><td>From lump sum</td></tr>
    <tr><td>VK12 bike finance</td><td>£751</td><td>Continues — paying from AU</td></tr>
    <tr><td>Holiday credit card</td><td>£1,150</td><td>From wages over 3 months</td></tr>
    <tr><td>ID Mobile</td><td>£720 (24×£30)</td><td>Cannot exit — ongoing</td></tr>
  </table></div>
</div>

<div class="card">
  <h2>💱 FX Strategy</h2>
  <div class="table-wrap"><table>
    <tr><th>Rule</th><th>Detail</th></tr>
    <tr><td>Convert in tranches</td><td>£5k–£10k at a time. Never all at once</td></tr>
    <tr><td>Use Wise/Revolut</td><td>0.4–0.6% fee vs 2–4% at banks. Saves £300–£700 on £20k</td></tr>
    <tr><td>Target rate</td><td>1.95+ is good. 1.90+ is acceptable. Below 1.90 wait if you can</td></tr>
    <tr><td>Keep GBP for UK costs</td><td>Mortgage, insurance, agent fees stay in GBP</td></tr>
  </table></div>
</div>

<div class="card">
  <h2>📊 Monthly Costs (Stabilised — Month 4+)</h2>
  <div class="table-wrap"><table>
    <tr><th>AU Living</th><th>AUD/mo</th></tr>
    <tr><td>Rent ($700/wk)</td><td>$3,000–$3,500</td></tr>
    <tr><td>Groceries</td><td>$1,200–$1,500</td></tr>
    <tr><td>Transport/fuel</td><td>$400–$600</td></tr>
    <tr><td>Utilities + internet</td><td>$300–$400</td></tr>
    <tr><td>Health insurance</td><td>$300–$500</td></tr>
    <tr><td>Mobiles</td><td>$100–$150</td></tr>
    <tr><td>Kids activities</td><td>$200–$400</td></tr>
    <tr style="font-weight:700"><td>Total AU</td><td>~$5,500–$7,000</td></tr>
  </table></div>
  <table class="mt2">
    <tr><th>Income</th><th>AUD/mo</th></tr>
    <tr><td>Salary (net)</td><td>~$10,400</td></tr>
    <tr><td>RSUs (when vesting)</td><td>~$2,500</td></tr>
    <tr style="font-weight:700;color:var(--green)"><td>Monthly surplus</td><td>$2,500–$5,000+</td></tr>
  </table></div>
</div>`;

PLAN_SECTIONS.legal=`
<div class="card">
  <h2>⚖️ Legal & Tax</h2>
</div>

<div class="card">
  <h2>🇬🇧 UK Tax</h2>
  <div class="table-wrap"><table>
    <tr><th>Action</th><th>Detail</th><th>Link</th></tr>
    <tr><td>P85 form</td><td>Notify HMRC you're leaving. Do before departure</td><td><a href="https://www.gov.uk/government/publications/income-tax-leaving-the-uk-getting-your-tax-right-p85" target="_blank">P85 form</a></td></tr>
    <tr><td>Split-year treatment</td><td>Only taxed as UK resident for portion of year in UK. Likely qualify under Case 4. <strong>Use company tax advisor</strong></td><td><a href="https://www.gov.uk/government/publications/rdr3-statutory-residence-test-srt" target="_blank">SRT guidance</a></td></tr>
    <tr><td>NRL Scheme</td><td>Register before leaving. Receive rent gross, self-assess</td><td><a href="https://www.gov.uk/government/publications/non-resident-landlord-application-to-have-uk-rental-income-without-deduction-of-uk-tax-individuals-nrl1" target="_blank">NRL1 form</a></td></tr>
    <tr><td>Self-assessment</td><td>File for split year by Jan 2028</td><td><a href="https://www.gov.uk/self-assessment-tax-returns" target="_blank">gov.uk self-assessment</a></td></tr>
    <tr><td>Overseas voter</td><td>Register before leaving — vote in UK elections for 15 years</td><td><a href="https://www.gov.uk/register-to-vote" target="_blank">Register to vote</a></td></tr>
  </table></div>
</div>

<div class="card">
  <h2>🇦🇺 AU Tax</h2>
  <div class="table-wrap"><table>
    <tr><th>Action</th><th>Detail</th></tr>
    <tr><td>TFN</td><td>Apply Day 1 — both adults. <a href="https://www.ato.gov.au/individuals/tax-file-number/" target="_blank">ATO</a></td></tr>
    <tr><td>Tax residency</td><td>You become AU tax resident on arrival. AU taxes worldwide income</td></tr>
    <tr><td>UK rental income</td><td>Must declare on AU tax return. Claim foreign tax credit for UK tax paid (Double Tax Agreement)</td></tr>
    <tr><td>Superannuation</td><td>Choose fund: <a href="https://www.australiansuper.com" target="_blank">AustralianSuper</a> or <a href="https://hostplus.com.au" target="_blank">Hostplus</a></td></tr>
    <tr><td>AU voting</td><td>Compulsory once permanent resident/citizen. Not on 482 visa initially</td></tr>
  </table></div>
  <p class="ts mt2"><strong>Use your company tax advice service for all of this.</strong> They should cover both UK and AU obligations.</p>
</div>

<div class="card">
  <h2>🛡️ Insurance Timeline</h2>
  <div class="table-wrap"><table>
    <tr><th>When</th><th>Insurance</th><th>Action</th></tr>
    <tr><td>Before departure</td><td>UK landlord insurance</td><td>~£80/mo. Replace home insurance</td></tr>
    <tr><td>Before departure</td><td>L&G Life + Critical Illness</td><td>KEEP — cheap, hard to replace</td></tr>
    <tr><td>On arrival</td><td>AU health (OVHC)</td><td>Activate. $300–$500/mo</td></tr>
    <tr><td>When car bought</td><td>AU car insurance</td><td>$100–$200/mo</td></tr>
    <tr><td>In permanent rental</td><td>AU contents insurance</td><td>$30–$60/mo</td></tr>
    <tr><td>Month 2–3</td><td>AU income protection</td><td>$50–$150/mo</td></tr>
    <tr><td>When settled</td><td>AU pet insurance</td><td>New single policy for dog</td></tr>
    <tr><td>6+ months</td><td>AU life insurance</td><td>Review — you have UK cover already</td></tr>
  </table></div>
</div>`;

PLAN_SECTIONS.links=`
<div class="card">
  <h2>🔗 Key Links & Services</h2>
</div>

<div class="card">
  <h2>🇬🇧 UK — Before Departure</h2>
  <div class="table-wrap"><table>
    <tr><th>Service</th><th>Link</th></tr>
    <tr><td>HMRC — P85 (leaving UK)</td><td><a href="https://www.gov.uk/government/publications/income-tax-leaving-the-uk-getting-your-tax-right-p85" target="_blank">gov.uk/P85</a></td></tr>
    <tr><td>HMRC — NRL Scheme</td><td><a href="https://www.gov.uk/government/publications/non-resident-landlord-application-to-have-uk-rental-income-without-deduction-of-uk-tax-individuals-nrl1" target="_blank">NRL1 form</a></td></tr>
    <tr><td>State Pension check</td><td><a href="https://www.gov.uk/check-state-pension" target="_blank">gov.uk/check-state-pension</a></td></tr>
    <tr><td>Power of Attorney</td><td><a href="https://www.gov.uk/power-of-attorney" target="_blank">gov.uk/power-of-attorney</a></td></tr>
    <tr><td>Register overseas voter</td><td><a href="https://www.gov.uk/register-to-vote" target="_blank">gov.uk/register-to-vote</a></td></tr>
    <tr><td>Royal Mail redirect</td><td><a href="https://www.royalmail.com/personal/receiving-mail/redirection" target="_blank">royalmail.com/redirection</a></td></tr>
    <tr><td>TV Licence cancel</td><td><a href="https://www.tvlicensing.co.uk" target="_blank">tvlicensing.co.uk</a></td></tr>
    <tr><td>How to Rent guide</td><td><a href="https://www.gov.uk/government/publications/how-to-rent" target="_blank">gov.uk — How to Rent</a></td></tr>
    <tr><td>OFTEC Register</td><td><a href="https://www.oftec.org" target="_blank">oftec.org</a></td></tr>
    <tr><td>Deposit Protection</td><td><a href="https://www.depositprotection.com" target="_blank">DPS</a> · <a href="https://www.tenancydepositscheme.com" target="_blank">TDS</a></td></tr>
    <tr><td>Checkatrade (tradespeople)</td><td><a href="https://www.checkatrade.com" target="_blank">checkatrade.com</a></td></tr>
    <tr><td>Wise (FX)</td><td><a href="https://wise.com" target="_blank">wise.com</a></td></tr>
    <tr><td>Revolut (FX backup)</td><td><a href="https://www.revolut.com" target="_blank">revolut.com</a></td></tr>
  </table></div>
</div>

<div class="card">
  <h2>🐕 Pet Relocation</h2>
  <div class="table-wrap"><table>
    <tr><th>Service</th><th>Link</th></tr>
    <tr><td>DAFF — Importing cats & dogs</td><td><a href="https://www.agriculture.gov.au/biosecurity-trade/cats-dogs" target="_blank">agriculture.gov.au</a></td></tr>
    <tr><td>APHA (blood test lab)</td><td><a href="https://www.gov.uk/government/organisations/animal-and-plant-health-agency" target="_blank">APHA Weybridge</a></td></tr>
    <tr><td>Jetpets</td><td><a href="https://www.jetpets.com.au" target="_blank">jetpets.com.au</a></td></tr>
    <tr><td>PetAir UK</td><td><a href="https://www.petair.co.uk" target="_blank">petair.co.uk</a></td></tr>
    <tr><td>Dogtainers</td><td><a href="https://www.dogtainers.com.au" target="_blank">dogtainers.com.au</a></td></tr>
  </table></div>
</div>

<div class="card">
  <h2>📦 Shipping</h2>
  <div class="table-wrap"><table>
    <tr><th>Company</th><th>Link</th></tr>
    <tr><td>Anglo Pacific</td><td><a href="https://www.anglopacific.co.uk" target="_blank">anglopacific.co.uk</a></td></tr>
    <tr><td>PSS Removals</td><td><a href="https://www.pssremovals.com" target="_blank">pssremovals.com</a></td></tr>
    <tr><td>John Mason</td><td><a href="https://www.johnmason.com" target="_blank">johnmason.com</a></td></tr>
    <tr><td>DAFF prohibited items</td><td><a href="https://www.agriculture.gov.au/biosecurity-trade/travelling/bringing-mailing-goods" target="_blank">What you can't bring</a></td></tr>
  </table></div>
</div>

<div class="card">
  <h2>🇦🇺 Australia — On Arrival</h2>
  <div class="table-wrap"><table>
    <tr><th>Service</th><th>Link</th></tr>
    <tr><td>ATO — Tax File Number</td><td><a href="https://www.ato.gov.au/individuals/tax-file-number/" target="_blank">ato.gov.au/TFN</a></td></tr>
    <tr><td>Medicare</td><td><a href="https://www.servicesaustralia.gov.au/medicare" target="_blank">servicesaustralia.gov.au</a></td></tr>
    <tr><td>CommBank (pre-open from UK)</td><td><a href="https://www.commbank.com.au/moving-to-australia.html" target="_blank">commbank.com.au</a></td></tr>
    <tr><td>Domain (rentals)</td><td><a href="https://www.domain.com.au" target="_blank">domain.com.au</a></td></tr>
    <tr><td>Realestate.com.au</td><td><a href="https://www.realestate.com.au" target="_blank">realestate.com.au</a></td></tr>
    <tr><td>1Form (rental applications)</td><td><a href="https://www.1form.com.au" target="_blank">1form.com.au</a></td></tr>
    <tr><td>Find My School (catchments)</td><td><a href="https://www.findmyschool.vic.gov.au" target="_blank">findmyschool.vic.gov.au</a></td></tr>
    <tr><td>Carsales</td><td><a href="https://www.carsales.com.au" target="_blank">carsales.com.au</a></td></tr>
    <tr><td>RACV (inspections + roadside)</td><td><a href="https://www.racv.com.au" target="_blank">racv.com.au</a></td></tr>
    <tr><td>VicRoads (licence, rego)</td><td><a href="https://www.vicroads.vic.gov.au" target="_blank">vicroads.vic.gov.au</a></td></tr>
    <tr><td>CityLink (tolls)</td><td><a href="https://www.citylink.com.au" target="_blank">citylink.com.au</a></td></tr>
    <tr><td>EastLink (tolls)</td><td><a href="https://www.eastlink.com.au" target="_blank">eastlink.com.au</a></td></tr>
    <tr><td>Victorian Energy Compare</td><td><a href="https://compare.energy.vic.gov.au" target="_blank">compare.energy.vic.gov.au</a></td></tr>
    <tr><td>Aussie Broadband</td><td><a href="https://www.aussiebroadband.com.au" target="_blank">aussiebroadband.com.au</a></td></tr>
    <tr><td>HotDoc (find a GP)</td><td><a href="https://www.hotdoc.com.au" target="_blank">hotdoc.com.au</a></td></tr>
    <tr><td>Seek (jobs)</td><td><a href="https://www.seek.com.au" target="_blank">seek.com.au</a></td></tr>
    <tr><td>AustralianSuper</td><td><a href="https://www.australiansuper.com" target="_blank">australiansuper.com</a></td></tr>
    <tr><td>Hook turns explained</td><td><a href="https://www.vicroads.vic.gov.au/safety-and-road-rules/road-rules/a-to-z-of-road-rules/hook-turns" target="_blank">VicRoads hook turns</a></td></tr>
  </table></div>
</div>

<div class="card">
  <h2>🏥 Health Insurance (OVHC)</h2>
  <div class="table-wrap"><table>
    <tr><th>Provider</th><th>Link</th></tr>
    <tr><td>AHM</td><td><a href="https://www.ahm.com.au/overseas-visitors" target="_blank">ahm.com.au</a></td></tr>
    <tr><td>NIB</td><td><a href="https://www.nib.com.au/overseas-visitors" target="_blank">nib.com.au</a></td></tr>
    <tr><td>Bupa</td><td><a href="https://www.bupa.com.au/health-insurance/overseas-visitors" target="_blank">bupa.com.au</a></td></tr>
    <tr><td>Medibank</td><td><a href="https://www.medibank.com.au/overseas-health-insurance/" target="_blank">medibank.com.au</a></td></tr>
  </table></div>
</div>

<div class="card">
  <h2>🚨 Emergency Numbers (Australia)</h2>
  <div class="table-wrap"><table>
    <tr><td style="font-size:1.2rem;font-weight:700">000</td><td>Police, Fire, Ambulance</td></tr>
    <tr><td style="font-weight:600">13 11 26</td><td>Poisons Information</td></tr>
    <tr><td style="font-weight:600">13 11 14</td><td>Lifeline (mental health crisis)</td></tr>
    <tr><td style="font-weight:600">1800 737 732</td><td>1800RESPECT (family violence)</td></tr>
  </table></div>
</div>`;
