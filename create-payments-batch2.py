import os

files = {}

# ─────────────────────────────────────────────────────────────────────────────
# COMPANY FILES — Payments Domain Batch 2
# 10 companies filling IMPLEMENTATION_FILL, STRONG_VALIDATOR_NEEDED,
# and GEOGRAPHIC_WHITESPACE queue items
# ─────────────────────────────────────────────────────────────────────────────

files["data/companies/b2b-payments/paystack.yaml"] = """\
slug: paystack
name: Paystack
domain: b2b-payments
research_queue_source: "IMPLEMENTATION_FILL:developer-first-payment-api"
founded: 2016
country: Nigeria
status: acquired
stage: series_a
funding_history: "YC S16 batch. Series A $8M 2018 (Stripe, Tencent, Visa, Singtel
  Innov8). Acquired by Stripe in October 2020 for approximately $200M (unconfirmed
  — Stripe has not disclosed the exact price; multiple Bloomberg and TechCrunch
  sources cite this range). Total raised before acquisition: ~$8M."
revenue_signal: "<10M"
profitability_signal: unknown
evidence_weight: weak_validator
signal_confidence: low
notable_facts: "Founded by Shola Akinlade and Ezra Olubi in Lagos, Nigeria — both
  met at Babcock University and worked together at Clickatell before Paystack.
  YC S16. Built developer-first payment API for African businesses: simple API key
  activation, card + bank transfer + mobile money acceptance, instant settlement.
  At acquisition: 60,000 businesses on platform, $1B+ annualised payment volume.
  Stripe's first Africa acquisition and primary Africa market entry. Still operates
  as a standalone brand under Stripe ownership. Key structural insight: Paystack proved
  the developer-first payment API model (pioneered by Stripe in the US) transferred
  to Africa with a full-stack local adaptation — not a simple re-skin, but a rebuilt
  product handling Nigerian bank APIs, USSD fallback, card tokenisation, and CBN
  compliance. Founding team had prior payment industry experience from Clickatell.
  Structural contrast with Interswitch: Interswitch built domestic switching rails
  bottom-up from the banking infrastructure; Paystack built developer-facing APIs
  top-down from merchant pain points. Both necessary; both distinct."
implementation_patterns:
  - slug: developer-first-payment-api
    source: TechCrunch / YC S16 alumni record / Stripe acquisition announcement
problems:
  - slug: programmatic-payment-acceptance
timeline:
  - year: 2016
    event_type: founding
    implementation_pattern: developer-first-payment-api
    problem: programmatic-payment-acceptance
    description: "Founded by Shola Akinlade and Ezra Olubi in Lagos. YC S16 admission.
      Initial product: simple API for Nigerian businesses to accept card and bank
      transfer payments. Core insight: the Stripe model (7-line integration, instant
      activation) had never been applied to the Nigerian market — existing options
      required weeks-long applications and complex integrations."
    source: TechCrunch / YC S16 profile
  - year: 2018
    event_type: product_launch
    implementation_pattern: developer-first-payment-api
    description: "Raised Series A $8M. Launched Paystack Commerce (hosted payment
      pages for non-developers) alongside the developer API. At this point 10,000+
      businesses on platform. Stripe and Visa participated in the Series A — a signal
      that global payment incumbents saw Paystack's model as validating."
    source: TechCrunch Series A announcement
  - year: 2020
    event_type: acquisition
    implementation_pattern: developer-first-payment-api
    description: "Acquired by Stripe for approximately $200M. At acquisition: 60,000
      businesses, $1B+ annualised payment volume. Stripe's stated rationale: Nigeria
      and Africa broadly represent one of the most important growth opportunities in
      the world and Paystack would speed their entry. CBN (Central Bank of Nigeria)
      payment institution licence transferred to Stripe ownership. Paystack continues
      operating as standalone brand."
    capability_acquired: "CBN payment institution licence and Nigerian bank API
      integrations — the local regulatory approvals and technical connections that
      Stripe could not obtain quickly from outside Nigeria."
    source: Stripe acquisition announcement / TechCrunch
"""

files["data/companies/b2b-payments/checkout-com.yaml"] = """\
slug: checkout-com
name: Checkout.com
domain: b2b-payments
research_queue_source: "IMPLEMENTATION_FILL:developer-first-payment-api"
founded: 2012
country: UK
status: operating
stage: unicorn
funding_history: "Self-funded by founder Guillaume Pousaz from 2012 to 2019 (7 years).
  Series A $230M May 2019 (Insight Partners). Series B $150M January 2020. Series C
  $450M June 2021 ($15B valuation). Series D $1B January 2022 ($40B valuation —
  peak). By 2024, internal valuation reportedly marked down significantly (~$11B
  range). Total raised: $1.83B."
revenue_signal: ">100M"
profitability_signal: unknown
evidence_weight: weak_validator
signal_confidence: low
notable_facts: "Founded by Guillaume Pousaz, Swiss entrepreneur, in London. Seven
  years self-funded before first external capital — a structural signal of underlying
  economics. Developer-first API targeting enterprise merchants with complex payment
  routing needs. Differentiation from Stripe: Checkout.com offers more direct acquiring
  relationships and lower pricing for high-volume merchants (similar to Adyen's IC++
  model but with Stripe-like developer experience). Customers include Binance, Revolut,
  Wise, Pizza Hut, Farfetch. Valuation compression from $40B (January 2022) to ~$11B
  (2024 internal reports) reflects 2021 growth-era overpricing rather than business
  failure — revenue reportedly still growing. Processing volume: $100B+ annually.
  Notable: CEO Pousaz remained majority owner through all funding rounds (self-funded
  for 7 years). Seven-year bootstrapped period before raising capital = estimated
  profitable_proxy before external funding arrived."
implementation_patterns:
  - slug: developer-first-payment-api
    source: Checkout.com press materials / Insight Partners announcement
problems:
  - slug: programmatic-payment-acceptance
timeline:
  - year: 2012
    event_type: founding
    implementation_pattern: developer-first-payment-api
    problem: programmatic-payment-acceptance
    description: "Founded by Guillaume Pousaz in London. Bootstrapped with founder
      capital. Initial focus: enterprise merchants in Middle East and Europe needing
      online payment acceptance with direct acquiring relationships rather than
      aggregator models. Built without external funding for 7 years — proof of early
      unit economic viability."
    source: Checkout.com company history / Financial Times
  - year: 2019
    event_type: funding
    implementation_pattern: developer-first-payment-api
    description: "Series A $230M from Insight Partners after 7 years of self-funding
      — first external capital. At this point: established enterprise customer base
      including Deliveroo, TransferWise (Wise), and others. Chose to raise to accelerate
      geographic expansion rather than out of necessity."
    source: TechCrunch / Insight Partners
  - year: 2022
    event_type: funding
    implementation_pattern: developer-first-payment-api
    description: "Series D $1B at $40B valuation — peak valuation during 2021-2022
      fintech boom. By 2024, internal valuation reportedly compressed to ~$11B range
      as growth-era multiples contracted. Revenue still growing. Processing $100B+
      in annual payment volume. Customers include Binance, Revolut, Pizza Hut, Farfetch."
    source: Bloomberg / Financial Times
"""

files["data/companies/b2b-payments/ofx.yaml"] = """\
slug: ofx
name: OFX (formerly OzForex)
domain: b2b-payments
research_queue_source: "IMPLEMENTATION_FILL:cross-border-a2a-infrastructure"
founded: 1998
country: Australia
status: operating
stage: public
funding_history: "Founded as OzForex in Sydney 1998. IPO on Australian Securities
  Exchange (ASX: OFX) in October 2013. No significant VC funding before IPO —
  grew from transaction revenue for 15 years before listing."
revenue_signal: ">100M"
profitability_signal: known_profitable
evidence_weight: strong_validator
signal_confidence: high
notable_facts: "FY2024 (ending March 2024): revenue AUD 265.7M, net profit AUD 39.5M
  (ASX annual report). Founded by Matthew Gilmour in Sydney as a low-cost alternative
  to bank international wire transfers. Operates across Australia, UK, Canada, USA,
  New Zealand, Hong Kong, Singapore. Key distinction from Wise: OFX targets larger
  individual and business transfers ($10k+ average transaction value vs Wise's broader
  smaller-transaction base). Offers FX forwards and hedging products for business
  customers. 26 years operating, profitable, ASX-listed — one of the oldest surviving
  cross-border A2A infrastructure companies. Structural comparison with Wise: both
  use local banking rails to reduce correspondent banking costs; OFX is more traditional
  FX broker model (spot rates, forwards, relationships) vs Wise's pooled-currency
  network model. Both ground the cross-border-payment-network winning condition.
  Second strong validator for cross-border-a2a-infrastructure pattern."
implementation_patterns:
  - slug: cross-border-a2a-infrastructure
    source: OFX ASX annual report FY2024 / ASX:OFX listing
problems:
  - slug: cross-border-payment-infrastructure
  - slug: programmatic-payment-disbursement
    confidence: medium
    notes: "OFX Business serves SMBs and enterprises for supplier payments and payroll
      disbursement — a disbursement use case alongside the core FX/transfer use case."
timeline:
  - year: 1998
    event_type: founding
    implementation_pattern: cross-border-a2a-infrastructure
    problem: cross-border-payment-infrastructure
    description: "Founded as OzForex in Sydney by Matthew Gilmour. Initial product:
      online international money transfers at rates significantly better than retail
      bank FX margins. Core model: hold currency pools in Australia and destination
      countries, execute two domestic transfers plus a spot FX conversion — eliminating
      the 4-7 correspondent bank hops of a standard SWIFT wire transfer."
    source: OFX company history / ASX prospectus
  - year: 2013
    event_type: funding
    description: "IPO on ASX at AUD 2.00/share, market cap AUD 440M. At IPO: 15
      years of profitable operation, presence across Australia, UK, USA, Canada,
      New Zealand. First online FX transfer company to IPO in Australia. Proved the
      cross-border A2A model is economically self-sustaining without venture capital."
    source: ASX IPO prospectus
  - year: 2021
    event_type: acquisition
    implementation_pattern: cross-border-a2a-infrastructure
    problem: programmatic-payment-disbursement
    description: "Acquired Paytron (Australian B2B payables platform) — moved from
      pure FX transfer into business accounts payable automation. Expanded target
      from individual and SMB FX to enterprise AP workflows. Using existing banking
      network and FX capability as the expansion base."
    capability_deployed: "banking-licence-portfolio — existing payment institution
      licences and bank relationships in 8 countries made B2B payables expansion
      tractable without new regulatory applications."
    capability: banking-licence-portfolio
    source: OFX press release / ASX announcement
"""

files["data/companies/b2b-payments/airwallex.yaml"] = """\
slug: airwallex
name: Airwallex
domain: b2b-payments
research_queue_source: "IMPLEMENTATION_FILL:cross-border-a2a-infrastructure"
founded: 2015
country: Australia
status: operating
stage: unicorn
funding_history: "Seed 2015. Series A $13M January 2018. Series B $80M July 2018
  (Tencent lead). Series C $100M March 2019 (DST Global, Sequoia China). Series D
  $160M April 2020. Series E $100M September 2021 ($4B valuation). Series F $256M
  November 2022 ($5.5B valuation — Lone Pine Capital lead). Total: $900M+."
revenue_signal: ">100M"
profitability_signal: estimated_profitable_proxy
evidence_weight: weak_validator
signal_confidence: low
notable_facts: "Founded in Melbourne, Australia by Jack Zhang, Lucy Liu, Max Li,
  and Ki-Lok Wong — all met at University of Melbourne. Founded 2015 after experiencing
  the cross-border payment pain firsthand running a coffee trading business between
  Australia and China. Core product: multi-currency business accounts + API-first
  cross-border payments. Reached $100B in annual payment volume in 2023. Claimed
  profitability on annual run-rate basis in Q4 2023 (company statement). 100,000+
  business customers. Customers include Navan, Brex, SHEIN, Qantas. Products span:
  global business accounts, FX, payouts, corporate cards, expense management.
  Embedded Finance (Airwallex for Platforms) launched 2022 — enables fintechs and
  marketplaces to embed Airwallex's FX and multi-currency capabilities. Geographic
  expansion facilitated by payment institution licences in Australia (ASIC), UK
  (FCA), EU (Bank of Lithuania), Hong Kong (HKMA), and others. The Melbourne founding
  team is notable: all four co-founders were technical (engineers), which explains
  the API-first architecture from day one."
implementation_patterns:
  - slug: cross-border-a2a-infrastructure
    source: Airwallex Series F announcement / company press materials
problems:
  - slug: cross-border-payment-infrastructure
  - slug: programmatic-payment-disbursement
    confidence: medium
    notes: "Airwallex enables both sides: cross-border money movement (infrastructure)
      and mass international payouts to employees and suppliers (disbursement)."
timeline:
  - year: 2015
    event_type: founding
    implementation_pattern: cross-border-a2a-infrastructure
    problem: cross-border-payment-infrastructure
    description: "Founded in Melbourne by four University of Melbourne alumni. Founding
      motivation: personal experience of excessive FX fees while running a coffee
      import business between Australia and China. Initial product: API-first
      multi-currency business accounts enabling companies to hold, convert, and send
      money in 50+ currencies without intermediary bank FX margins."
    source: Airwallex founder interviews / Crunchbase
  - year: 2019
    event_type: market_entry
    implementation_pattern: cross-border-a2a-infrastructure
    description: "Series C $100M (DST Global lead). Launched UK operations (FCA
      authorisation obtained). Expanded to Hong Kong, Singapore, Europe. At this point:
      API-first cross-border product established; began building embedded finance
      layer for fintechs and platforms."
    capability: banking-licence-portfolio
    capability_deployed: "FCA payment institution licence enabled direct local currency
      settlement via UK Faster Payments — same capability that Wise used to build
      its cross-border model, now replicated by Airwallex for its multi-currency
      treasury product."
    source: Airwallex Series C announcement
  - year: 2022
    event_type: product_launch
    implementation_pattern: cross-border-a2a-infrastructure
    description: "Series F $256M at $5.5B valuation. Launched Airwallex for Platforms
      — embedded multi-currency accounts and FX for other companies' products. $100B+
      in annual payment volume by 2023. Claimed profitability Q4 2023. Customers
      include Navan, Brex, SHEIN, Qantas."
    source: Airwallex Series F / company blog
"""

files["data/companies/b2b-payments/nium.yaml"] = """\
slug: nium
name: Nium
domain: b2b-payments
research_queue_source: "IMPLEMENTATION_FILL:cross-border-a2a-infrastructure"
founded: 2014
country: Singapore
status: operating
stage: unicorn
funding_history: "Founded 2014 as InstaReM. Rebrand to Nium 2020. Series B $41M
  2019 (Visa participated as strategic investor). Series C $67M 2021. Series D $200M
  October 2021 at $2.1B valuation (Riverwood Capital lead — unicorn). Total raised:
  $286M+."
revenue_signal: "10-100M"
profitability_signal: unknown
evidence_weight: weak_validator
signal_confidence: low
notable_facts: "Founded in Singapore as InstaReM by Prajit Nanu and Michael Minassian.
  Rebranded to Nium in 2020 to signal expansion from cross-border remittances to
  broader payment infrastructure. Primary product: real-time cross-border payout
  infrastructure and card issuing APIs for financial institutions, fintechs, and
  enterprises. Connected to 220+ countries and territories, 100+ currencies, 7
  payment types. Key customers: Uber (global driver payouts), Deliveroo, Paysend,
  and major banks using Nium for correspondent banking alternatives. Visa strategic
  investment signals Visa sees Nium as infrastructure rather than a competitive
  threat. Two revenue streams: (1) payout infrastructure (transaction fees on cross-
  border payouts to bank accounts), (2) card issuing (interchange revenue on Nium-
  issued corporate and virtual cards). B2B2B model: Nium sells to businesses that
  then serve their own end customers. Singapore HQ provides regulatory base for APAC
  expansion."
implementation_patterns:
  - slug: cross-border-a2a-infrastructure
    source: Nium Series D announcement / company documentation
problems:
  - slug: cross-border-payment-infrastructure
  - slug: programmatic-payment-disbursement
    confidence: medium
    notes: "Nium's primary use case is mass cross-border payouts — enterprises paying
      employees, contractors, and suppliers in 220+ countries. Both cross-border
      infrastructure and disbursement automation are relevant."
timeline:
  - year: 2014
    event_type: founding
    implementation_pattern: cross-border-a2a-infrastructure
    problem: cross-border-payment-infrastructure
    description: "Founded as InstaReM in Singapore by Prajit Nanu and Michael Minassian.
      Initial product: low-cost cross-border remittances for individuals in Asia
      (Australia, Singapore, India, Malaysia corridors). Used local banking rails to
      undercut bank FX rates. Visa applied for and received Money Transfer Operator
      licence in Singapore."
    source: InstaReM / Nium company history
  - year: 2020
    event_type: pivot
    implementation_pattern: cross-border-a2a-infrastructure
    description: "Rebranded from InstaReM to Nium. Pivoted from B2C remittances to
      B2B payout infrastructure and card issuing. Recognised the larger commercial
      opportunity in being the infrastructure that other companies (banks, fintechs,
      enterprises) use to send money globally rather than competing with consumer apps."
    capability: local-payment-rail-integrations
    capability_deployed: "Existing local rail connections in Asia-Pacific, built over
      6 years of consumer remittance operation, transferred to B2B payout infrastructure
      without re-building — the same integrations that moved consumer money now move
      enterprise payouts."
    source: Nium rebrand announcement / TechCrunch
  - year: 2021
    event_type: funding
    description: "Series D $200M at $2.1B valuation (Riverwood Capital lead). Visa
      participated. At this point: 220+ countries connected, 7 payment types, card
      issuing launched. Uber uses Nium for driver payouts in multiple markets. Became
      Singapore's first B2B fintech unicorn."
    source: Nium Series D announcement
"""

files["data/companies/b2b-payments/tipalti.yaml"] = """\
slug: tipalti
name: Tipalti
domain: b2b-payments
research_queue_source: "IMPLEMENTATION_FILL:accounts-payable-automation"
founded: 2010
country: Israel
status: operating
stage: unicorn
funding_history: "Founded 2010 with $12M seed (founder-funded and early angels).
  Series A $7.5M 2015. Series B $30M 2018. Series C $76M 2019. Series D $150M 2020.
  Series E $270M 2021 at $8.3B valuation (G Squared, Durable Capital Partners lead).
  Total raised: $550M+. By 2024, internal valuations for late-2021 growth-era rounds
  broadly compressed; Tipalti's implied valuation likely in $3-5B range."
revenue_signal: ">100M"
profitability_signal: unknown
evidence_weight: weak_validator
signal_confidence: low
notable_facts: "Founded by Chen Amit (CEO) and Oren Kaniel in Israel (US HQ Foster
  City, CA). Core product: mass payout automation — companies that pay large numbers
  of suppliers, affiliates, creators, or contractors internationally. Handles payee
  onboarding, tax compliance (W-9/W-8/1099), payment method selection, multi-currency
  payouts, and payment reconciliation. Customers include Twitch, Twitter/X, GoDaddy,
  Canva, Roku, LinkedIn, Vimeo. 4,000+ clients, $40B+ in annual payables processed.
  Key distinction from BILL: BILL targets SMB invoice-based AP (paying 10-200 suppliers);
  Tipalti targets companies paying 1,000-1,000,000 payees internationally (creators,
  affiliates, marketplace sellers). The complexity Tipalti solves: paying 50,000
  YouTube creators across 200 countries each requires different payment methods,
  currencies, tax forms, and compliance rules — impossible to manage manually.
  Founded in Israel; significant engineering team in Israel. Competes with BILL,
  Corpay (for larger enterprises), and Stripe Payouts."
implementation_patterns:
  - slug: accounts-payable-automation
    source: Tipalti company documentation / Series E announcement
problems:
  - slug: programmatic-payment-disbursement
  - slug: cross-border-payment-infrastructure
    confidence: medium
    notes: "Tipalti's mass international payout capability requires cross-border
      payment infrastructure in 196 countries — both problems are relevant."
timeline:
  - year: 2010
    event_type: founding
    implementation_pattern: accounts-payable-automation
    problem: programmatic-payment-disbursement
    description: "Founded by Chen Amit and Oren Kaniel in Israel. Initial insight:
      companies paying large numbers of international affiliates, publishers, and
      suppliers spend enormous resources on manual payment operations — collecting
      payee bank details, managing tax compliance forms, sending individual wires.
      Tipalti automates the entire payout lifecycle from payee onboarding to payment
      execution and reconciliation."
    source: Tipalti company history / TechCrunch
  - year: 2019
    event_type: product_launch
    implementation_pattern: accounts-payable-automation
    description: "Series C $76M. Launched Tipalti Approve — AP workflow automation
      (purchase orders, invoice approvals, three-way matching). Expanded from pure
      payout automation to full AP lifecycle. At this point: 1,000+ clients, processing
      $5B+ in annual payables. Twitch and GoDaddy among major customers."
    source: Tipalti Series C announcement
  - year: 2021
    event_type: funding
    description: "Series E $270M at $8.3B valuation — peak growth-era valuation.
      $40B+ in annual payables processed at this point. Launched Tipalti Pi (AI-powered
      AP automation) and Tipalti Card (corporate spend management). 4,000+ clients."
    source: Tipalti Series E announcement
"""

files["data/companies/b2b-payments/corpay.yaml"] = """\
slug: corpay
name: Corpay (formerly FleetCor Technologies)
domain: b2b-payments
research_queue_source: "STRONG_VALIDATOR_NEEDED:accounts-payable-automation"
founded: 2000
country: USA
status: operating
stage: public
funding_history: "Founded 2000. IPO October 2010 on NYSE as FLT (FleetCor Technologies).
  No significant VC dependency — grew from payment processing revenue. Renamed Corpay
  February 2024 (NYSE: CPAY). Active acquirer: 75+ acquisitions since founding."
revenue_signal: ">1B"
profitability_signal: known_profitable
evidence_weight: strong_validator
signal_confidence: high
notable_facts: "FY2024 revenues $4.0B net revenue, operating income $1.7B (~43%
  margin) — public filings. Founded by Ron Clarke in Atlanta, GA. Original core:
  fleet fuel payment cards for commercial vehicle fleets (trucking, logistics). Over
  24 years, expanded via acquisition into: corporate AP automation (Paymerang,
  Nvoicepay acquisitions), cross-border B2B payments (Cambridge Global acquired
  2019), lodging payments (Hotel Engine acquisition), and tolls (T-Systems toll
  division). Rebranded from FleetCor to Corpay in February 2024 to signal the
  expansion beyond fleet cards into broader corporate payments. Customers: 800,000+
  businesses globally. Processes $1T+ in annual spend. Primary strong validator for
  accounts-payable-automation solution pattern: 24 years of profitable operation,
  public financials, 43% operating margin — the clearest evidence that B2B payment
  automation produces durable economics. Note: Corpay is a corporate payment management
  company, not a pure AP software company — revenue mix includes fleet cards (legacy),
  AP automation, corporate travel, cross-border payments. AP automation is a growing
  segment of the overall business rather than the sole product."
implementation_patterns:
  - slug: accounts-payable-automation
    source: Corpay (FleetCor) annual report 2024 / NYSE: CPAY filing
    notes: "Corpay's AP automation segment (Paymerang, Nvoicepay products) fits this
      pattern. The broader fleet card and travel payment business is corporate payment
      management — a superset of AP automation."
problems:
  - slug: programmatic-payment-disbursement
  - slug: cross-border-payment-infrastructure
    confidence: medium
    notes: "Cambridge Global acquisition 2019 expanded Corpay into cross-border B2B
      FX and payments — directly addresses cross-border payment infrastructure problem."
timeline:
  - year: 2000
    event_type: founding
    implementation_pattern: accounts-payable-automation
    problem: programmatic-payment-disbursement
    description: "Founded by Ron Clarke in Atlanta, GA. Initial product: fleet fuel
      payment cards for commercial trucking and logistics fleets. Core mechanism:
      gives fleet operators a closed-loop payment card accepted only at fuel stations,
      with automated expense reporting and controls — eliminating cash reimbursement
      and eliminating driver theft of fuel expenses."
    source: FleetCor company history / IPO prospectus
  - year: 2010
    event_type: funding
    description: "IPO on NYSE as FLT at $15/share, market cap ~$1.5B. At IPO:
      fleet fuel card business with 300,000+ commercial vehicles. Self-sustaining
      profitable operation for 10 years before listing. Demonstrated fleet payment
      automation produces durable unit economics."
    source: NYSE IPO prospectus / SEC filing
  - year: 2019
    event_type: acquisition
    problem: cross-border-payment-infrastructure
    description: "Acquired Cambridge Global Payments (now Corpay Cross-Border) for
      $900M — major expansion into cross-border B2B FX and international payments.
      Cambridge had $30B in annual FX volume and 12,000 corporate clients. This
      acquisition transferred Corpay's corporate payment relationships into the
      cross-border corridor."
    capability_acquired: "FX hedging and cross-border payment infrastructure via
      Cambridge Global — banking relationships and regulatory licences in multiple
      jurisdictions for business FX."
    source: FleetCor press release 2019
  - year: 2024
    event_type: product_launch
    description: "Rebranded from FleetCor Technologies to Corpay (NYSE: CPAY) in
      February 2024. FY2024 net revenues $4.0B, operating income $1.7B (43% margin).
      Active in 150+ countries. 800,000+ business clients. Processes $1T+ in annual
      spend across fleet, AP, travel, and cross-border products."
    source: Corpay annual report 2024 / NYSE: CPAY
"""

files["data/companies/b2b-payments/spreedly.yaml"] = """\
slug: spreedly
name: Spreedly
domain: b2b-payments
research_queue_source: "STRONG_VALIDATOR_NEEDED:payment-orchestration-layer"
founded: 2008
country: USA
status: operating
stage: series_b
funding_history: "Bootstrapped from founding (2008) through 2021 — 13 years of self-
  funded operation, zero external capital. First and only external round: $75M from
  Silversmith Capital Partners in March 2021. Total external raised: $75M. The 13
  years of self-funding before raising capital is the primary economic signal."
revenue_signal: "10-100M"
profitability_signal: estimated_profitable_proxy
profitability_proxy_applied: true
evidence_weight: strong_validator
signal_confidence: low
notable_facts: "Founded in Durham, North Carolina by Ben Milne (later Dwolla founder),
  Ryan Dix, and others. Rebranded and repositioned from original B2C product (PaymentSpring)
  to payment orchestration SaaS. Core product: universal payment vault + payment
  orchestration layer — merchants tokenise payment methods once with Spreedly, then
  route transactions to any of 130+ supported payment gateways (Stripe, Adyen,
  Braintree, etc.) without re-tokenising. Primary value: flexibility to switch
  payment processors without recapturing card data; resilience against gateway
  outages; A/B testing of payment gateway performance. Customers include Grubhub,
  Ritual, and companies in travel, marketplace, and platform sectors. 13 years
  bootstrapped = strongest available economic signal for a private company in this
  pattern. Profitability proxy applied (Tier 6 inference: no external funding for
  13 years + sustained operation = Estimated profitable before 2021 raise). Post-2021
  funding status unknown but baseline was clearly profitable before deciding to
  raise growth capital. Second strong validator for payment-orchestration-layer
  (Modern Treasury is first, but weak_validator)."
implementation_patterns:
  - slug: payment-orchestration-layer
    source: Spreedly product documentation / Silversmith Capital announcement
problems:
  - slug: programmatic-payment-acceptance
  - slug: programmatic-payment-disbursement
    confidence: medium
    notes: "Spreedly primarily addresses the payment acceptance orchestration problem
      (routing payments to gateways); disbursement is secondary."
timeline:
  - year: 2008
    event_type: founding
    implementation_pattern: payment-orchestration-layer
    problem: programmatic-payment-acceptance
    description: "Founded in Durham, NC. Original product was a B2C subscription
      payment product. Pivoted within a few years to the universal payment vault and
      orchestration model after identifying the core pain: companies that accept
      payments are locked to a single payment gateway and cannot switch without
      re-capturing all stored card data from customers. Spreedly solves this by
      vaulting payment methods centrally and routing to any gateway."
    source: Spreedly company history / Silversmith Capital announcement
  - year: 2015
    event_type: product_launch
    implementation_pattern: payment-orchestration-layer
    description: "Established as a self-sustaining bootstrapped business at this
      point — 7 years of zero external capital. Launched gateway routing capabilities
      enabling A/B testing of payment providers and automatic failover. At this stage
      the orchestration model was clearly validated by sustained operation without
      external funding."
    source: Spreedly product history
  - year: 2021
    event_type: funding
    implementation_pattern: payment-orchestration-layer
    description: "Raised first external round: $75M from Silversmith Capital Partners.
      Chose to raise growth capital after 13 years of profitable bootstrapped operation.
      The decision to raise after profitability rather than out of necessity distinguishes
      this from typical venture-funded companies. Used capital for geographic expansion
      and enterprise sales team. 130+ supported payment gateways at this point."
    source: Spreedly / Silversmith Capital announcement
"""

files["data/companies/b2b-payments/moniepoint.yaml"] = """\
slug: moniepoint
name: Moniepoint (formerly TeamApt)
domain: b2b-payments
research_queue_source: "GEOGRAPHIC_WHITESPACE:full-stack-payment-processor:Nigeria"
founded: 2015
country: Nigeria
status: operating
stage: unicorn
funding_history: "Founded 2015 as TeamApt. Relatively capital-efficient growth:
  $5.5M Series A 2020 (QED Investors). $110M funding round September 2023 (QED
  Investors, Novastar Ventures, Lightrock, Google's Africa Investment Fund, others)
  at approximately $1B valuation. Total raised: ~$120M."
revenue_signal: "10-100M"
profitability_signal: estimated_profitable_proxy
evidence_weight: weak_validator
signal_confidence: low
notable_facts: "Founded by Tosin Eniolorunda (CEO) and Felix Ike (CTO) — both
  former employees of Interswitch. The Interswitch lineage is analytically significant:
  Eniolorunda and Ike worked on Interswitch's banking infrastructure products before
  founding TeamApt in 2015. They applied that institutional knowledge to a different
  layer of the Nigerian payment stack — instead of switching (Interswitch's model),
  they built merchant-facing POS infrastructure and business banking for SMBs.
  At $2B valuation (2024 QED internal estimate): 2M+ businesses on platform,
  $17B+ monthly transaction volume claimed. Products: Moniepoint POS terminals
  (250,000+ active terminals), Moniepoint Business Account (current account for
  SMBs), MoniePoint Agency Banking (rural financial access expansion). Multiple
  sources describe Moniepoint as profitable — including QED Investors, who do not
  typically invest in pre-profitable companies at Series A. Original company name
  TeamApt rebranded to Moniepoint in 2022 after spinning out the consumer product
  (Monnify) as a separate entity. Structural contrast with Interswitch: Interswitch
  built domestic switching rails bottom-up from the banking infrastructure; Moniepoint
  built merchant-facing payment terminals top-down from business banking — both
  necessary layers of the Nigerian payment stack, both profitable, both grounding
  the domestic-payment-infrastructure and full-stack-payment-processor patterns."
implementation_patterns:
  - slug: full-stack-payment-processor
    source: QED Investors announcement / Moniepoint press materials
    notes: "Moniepoint processes SMB card and mobile money payments via own POS
      terminal network — a full-stack approach (own hardware + processing + settlement)
      targeting the 2M+ Nigerian SMBs that Interswitch's bank-facing infrastructure
      does not directly serve."
  - slug: domestic-payment-infrastructure
    confidence: medium
    source: QED Investors / Moniepoint press materials
    notes: "Secondary — Moniepoint extends Nigeria's domestic payment infrastructure
      to SMBs (merchant layer), complementing Interswitch's interbank switching layer."
problems:
  - slug: programmatic-payment-acceptance
timeline:
  - year: 2015
    event_type: founding
    implementation_pattern: full-stack-payment-processor
    problem: programmatic-payment-acceptance
    description: "Founded as TeamApt by Tosin Eniolorunda and Felix Ike — both former
      Interswitch employees. Initial product: banking software infrastructure sold
      to Nigerian banks (B2B banking technology). Institutional knowledge from
      Interswitch's payment infrastructure applied to building the merchant-facing
      layer of Nigerian payments."
    source: Moniepoint company history / QED Investors
  - year: 2020
    event_type: product_launch
    implementation_pattern: full-stack-payment-processor
    description: "Launched Moniepoint POS terminal and agency banking product for
      Nigerian SMBs. Series A $5.5M from QED Investors. Pivoted from bank-facing
      software to merchant-facing payment infrastructure — the layer Interswitch's
      interbank switching does not serve directly."
    capability_deployed: "Institutional knowledge of Nigerian banking infrastructure
      and CBN regulatory requirements from Interswitch experience — transferred
      directly to building CBN-compliant POS infrastructure and business accounts."
    source: QED Investors / TechCrunch
  - year: 2022
    event_type: pivot
    implementation_pattern: full-stack-payment-processor
    description: "Rebranded from TeamApt to Moniepoint. Spun out consumer product
      (Monnify) as separate entity to focus fully on SMB business banking and payments.
      At this point: 150,000+ active POS terminals, 1M+ businesses."
    source: Moniepoint rebrand announcement
  - year: 2023
    event_type: funding
    description: "$110M funding round at ~$1B valuation (QED Investors lead, Google
      Africa Investment Fund, others). $17B+ monthly payment volume claimed. 2M+
      businesses on platform. 250,000+ active POS terminals. Multiple investors
      describe business as profitable at this stage."
    source: TechCrunch / QED Investors announcement
"""

files["data/companies/b2b-payments/fawry.yaml"] = """\
slug: fawry
name: Fawry for Banking and Payment Technology Services
domain: b2b-payments
research_queue_source: "GEOGRAPHIC_WHITESPACE:domestic-payment-infrastructure:Egypt"
founded: 2008
country: Egypt
status: operating
stage: public
funding_history: "Founded 2008 with Egyptian government support and bank consortium
  backing. IPO on Egyptian Exchange (EGX: FAWRY) August 2019 — first Egyptian
  tech company to list on EGX. No significant VC dependency — grew from transaction
  fee revenue for 11 years before listing."
revenue_signal: "10-100M"
profitability_signal: known_profitable
evidence_weight: strong_validator
signal_confidence: high
notable_facts: "EGP revenue FY2023: EGP 1.6B (~$33M USD at prevailing rates) per
  EGX annual report. Profitable and listed. Founded by Ashraf Sabry in Cairo with
  consortium backing from Egyptian banks and the Egyptian government. Core product:
  bill payment network — consumers and businesses can pay utility bills, mobile
  top-ups, insurance premiums, and e-commerce purchases through 300,000+ Fawry
  service points (bank branches, kiosks, pharmacies, supermarkets) and digital
  channels. 40M+ monthly transactions. 44M registered users (out of 104M Egyptian
  population). Fawry solved a fundamental infrastructure problem in Egypt: most
  Egyptians lacked bank accounts and cards, but all had utility bills to pay.
  By building a payment acceptance network that worked with cash, Fawry created
  the first mass-market payment infrastructure layer in Egypt. Second confirmed
  observation for domestic-payment-infrastructure pattern (Interswitch is first from
  Nigeria). Second African strong validator for payments domain. Note on revenue
  scale: EGP 1.6B sounds large but ~$33M USD due to Egyptian Pound depreciation —
  revenue_signal set to 10-100M in USD terms. Profitable and growing in local currency;
  USD value impacted by FX."
implementation_patterns:
  - slug: domestic-payment-infrastructure
    source: EGX annual report 2023 / Fawry investor relations
problems:
  - slug: programmatic-payment-acceptance
timeline:
  - year: 2008
    event_type: founding
    implementation_pattern: domestic-payment-infrastructure
    problem: programmatic-payment-acceptance
    description: "Founded by Ashraf Sabry in Cairo with backing from a consortium
      of Egyptian banks and support from the Egyptian government's financial inclusion
      agenda. Initial product: bill payment network enabling consumers to pay utility
      and telecom bills through bank branches and kiosks — solving a specific Egyptian
      infrastructure gap where most citizens lacked direct bank account access for
      digital payment."
    source: Fawry company history / EGX prospectus
  - year: 2019
    event_type: funding
    description: "IPO on Egyptian Exchange (EGX: FAWRY) in August 2019 — first
      Egyptian technology company to list on EGX. At IPO: 11 years of profitable
      operation, 150,000+ service points, 35M+ registered users. IPO price EGP 6.46
      per share. Proved domestic payment infrastructure model is viable as a standalone
      listed business in an emerging market."
    source: EGX IPO prospectus
  - year: 2022
    event_type: product_launch
    implementation_pattern: domestic-payment-infrastructure
    description: "Launched Fawry Plus (merchant payment terminals and B2B payment
      services) and expanded B2B payment services for merchants. Grew to 300,000+
      service points, 44M registered users, 40M+ monthly transactions. Expansion
      of the domestic network from bill payments into full merchant payment acceptance."
    capability: local-payment-rail-integrations
    capability_deployed: "Existing network of 300,000+ service points and bank
      integrations made B2B merchant payment expansion tractable — the same infrastructure
      that processed consumer bill payments now processes merchant payments without
      rebuilding the network."
    source: Fawry EGX annual report 2022
"""

# ─────────────────────────────────────────────────────────────────────────────
# WRITE ALL FILES
# ─────────────────────────────────────────────────────────────────────────────

created = []
for path, content in files.items():
    dir_path = os.path.dirname(path)
    if dir_path:
        os.makedirs(dir_path, exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
    created.append(path)
    print(f"  created  {path}")

print(f"\n{len(created)} files created.")
print("\nNext: set -a && source .env.local && set +a && npx tsx loader/index.ts load")