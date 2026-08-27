/**
 * Ripple Good — all charity data lives here.
 * ---------------------------------------------------------------------------
 * Edit figures in this file only; no component hard-codes a number or a URL.
 *
 * Grep before every launch and every quarterly refresh:
 *     grep -rn "VERIFY:" src/
 *
 * House rules for the copy in here:
 *   1. Outcome first, dollars second. Write what happens, not what it costs.
 *   2. "provides" / "funds" / "delivers" — never "buys this exact pill." Every
 *      figure below is an AVERAGE program cost across a whole delivery
 *      operation, not the price tag on one item. See AVERAGE_COST_DISCLAIMER.
 *   3. We aggregate; we do not originate. Every pick names its evaluator and
 *      links to their research.
 */

/** Rendered site-wide wherever a dollar figure implies a specific purchase. */
export const AVERAGE_COST_DISCLAIMER =
  "These are average program costs, not price tags. Your gift joins a pool that funds an entire operation — supplies, delivery, staff, monitoring — and the figures we quote are what that whole operation costs per unit of good, divided out. No single donation is tracked to a single item, and honest charities don't claim otherwise.";

/** Every evaluator we lean on, credited on the methodology page. */
export const evaluators = [
  {
    id: "givewell",
    name: "GiveWell",
    url: "https://www.givewell.org/",
    focus: "Global health and poverty",
    description:
      "The most rigorous cost-effectiveness research in philanthropy. GiveWell publishes its full spreadsheets and its mistakes, and moves hundreds of millions of dollars a year on the strength of them.",
  },
  {
    id: "ace",
    name: "Animal Charity Evaluators",
    url: "https://animalcharityevaluators.org/",
    focus: "Animal welfare",
    description:
      "ACE reviews animal advocacy organizations on programmatic effectiveness, cost-effectiveness, and organizational health, and publishes an annual set of recommended charities.",
  },
  {
    id: "founders-pledge",
    name: "Founders Pledge",
    url: "https://www.founderspledge.com/research",
    focus: "Cross-cause research",
    description:
      "Founders Pledge publishes cost-effectiveness research across global health, climate, and policy, and has been an early backer of neglected interventions before larger funders reach them.",
  },
  {
    id: "giving-green",
    name: "Giving Green",
    url: "https://www.givinggreen.earth/",
    focus: "Climate",
    description:
      "Giving Green evaluates climate nonprofits on expected tons of CO₂-equivalent averted per dollar, with an explicit preference for policy and systems change over retail offsets.",
  },
];

const evaluatorById = Object.fromEntries(evaluators.map((e) => [e.id, e]));

/**
 * One entry per cause. The category and its single pick live together, because
 * on this site a cause IS its recommendation.
 *
 * Shape:
 *   id             slug used in the URL: /#/cause/:id
 *   category       human label for the cause
 *   icon           lucide-react icon name (see lib/icons.js for the registry)
 *   tagline        one line for the home-page card
 *   name           charity name
 *   evaluator      display name of the research org that made the call
 *   evaluatorUrl   deep link to the actual research page
 *   evaluatorNote  what, precisely, the evaluator said — no paraphrase creep
 *   headline       the big outcome statement at the top of the cause page
 *   subhead        one sentence of context under it
 *   costFigures[]  {label, value, source} — the math, shown in "How we know"
 *   outcomeFramings[]  short outcome sentences reused in cards and copy
 *   givingLevels[] {amount, outcomeText, emphasis} — middle one is emphasised
 *   evidenceNotes  {whatTheyDo, method, caveats[]} — the rigorous back half
 *   custom         live outcome for a typed amount (see lib/format.js):
 *                    perDollar  units per dollar — KEEP IN SYNC with costFigures
 *                    one/many   sentence templates; {n} is the rounded number
 *                    style      "money" renders {n} as dollars (GiveDirectly)
 *                    tooSmall   shown when the amount rounds below one unit
 *                    pictogram  {glyph, label} — draws the quantity as counted
 *                               icons. Only for genuinely countable units: cash
 *                               deliberately has none, since drawing 90 notes
 *                               for "$90 lands with a family" would invent a
 *                               quantity nobody promised.
 *   donateUrl      the charity's OWN donation page. We never touch money.
 *   lastVerified   ISO date the figures above were last checked against source
 *   provisional    optional. Set while an entry's figures have NOT yet been
 *                  checked against the evaluator's published research: the page
 *                  renders a visible "provisional" banner and the card is
 *                  flagged on the home grid. Delete the field once verified —
 *                  never delete it to make the banner go away.
 */
export const charities = [
  {
    id: "global-health",
    category: "Global Health",
    icon: "MoonStar",
    tagline: "Malaria still kills a child about every minute. A net is the cheapest wall we know how to build.",
    name: "Against Malaria Foundation",
    evaluator: evaluatorById.givewell.name,
    evaluatorUrl: "https://www.givewell.org/charities/against-malaria-foundation",
    evaluatorNote: "A GiveWell Top Charity, and one of the longest-standing picks on their list.",
    headline: "Hang a net over a sleeping family tonight.",
    subhead:
      "Insecticide-treated bed nets are the single best-evidenced way to keep malaria away from a child while they sleep.",
    costFigures: [
      {
        // VERIFY: AMF/GiveWell cost per net delivered — check AMF's current
        // cost-per-net page and GiveWell's latest AMF review before launch.
        label: "Cost per net delivered",
        value: "~$6",
        source: "GiveWell / AMF, all-in cost including distribution and follow-up monitoring",
      },
      {
        // VERIFY: GiveWell's per-life-saved figure moves with country mix and
        // funding gaps. GiveWell's 2022–2024 materials have used ~$5,500; some
        // of their materials cite a $3,000–$5,000 range. Confirm the current
        // number and quote ONE with its date, rather than averaging them.
        label: "Cost per life saved (estimate)",
        value: "~$5,500",
        source:
          "GiveWell estimate, 2022–2024. Some GiveWell materials cite a $3,000–$5,000 range; the figure moves with where nets are sent.",
      },
    ],
    outcomeFramings: [
      "$12 hangs two nets over sleeping families.",
      "$60 funds ten nets — a cluster of homes covered for years.",
    ],
    givingLevels: [
      // No tier below $10: Every.org silently ignores a prefilled amount under
      // that, landing the donor on an empty field. At ~$6 a net the old $6 tier
      // was the honest entry point, but a tier that loses the amount is worse
      // than one that starts higher. $30 replaces it at five nets.
      { amount: 12, outcomeText: "Hangs two nets over sleeping families.", emphasis: true },
      { amount: 30, outcomeText: "Funds five nets over sleeping families." },
      { amount: 60, outcomeText: "Funds ten nets — a cluster of homes covered." },
    ],
    evidenceNotes: {
      whatTheyDo:
        "AMF funds long-lasting insecticide-treated nets, works with in-country distribution partners to get them onto beds, and then sends people back months later to photograph and record whether the nets are still hanging.",
      method:
        "GiveWell models the number of nets funded, how many people sleep under them, local malaria burden and mortality rates, and how much of the effect would have happened anyway without AMF's money. The follow-up monitoring is a large part of why AMF survives that scrutiny: the effect is measured, not assumed.",
      caveats: [
        "Cost per life saved is a modelled average across many distributions, not a promise attached to your gift. Nets in a high-burden region avert far more harm than the same nets elsewhere.",
        "Insecticide resistance in mosquito populations is real and is factored into GiveWell's newer models, but it is a live source of uncertainty about the future.",
        "AMF sometimes holds funds while it negotiates a distribution. Money arriving today may be deployed in a later campaign.",
      ],
    },
    custom: {
      // VERIFY: derived from the ~$6-per-net figure above — update together.
      perDollar: 1 / 6,
      one: "Funds one net — one sleeping space covered for years.",
      many: "Funds ~{n} nets over sleeping families.",
      tooSmall: "Joins the pooled fund that hangs the next net.",
      pictogram: { glyph: "net", label: "nets" },
    },
    // Verified 2026-08-17 by loading every.org/againstmalaria and reading back
    // the organisation name. EIN 20-3069841 — The Against Malaria Foundation.
    // VERIFY: re-check the slug still resolves to this exact entity before launch.
    everyOrg: { slug: "againstmalaria", ein: "20-3069841" },
    donateUrl: "https://www.againstmalaria.com/Donation.aspx",
    lastVerified: "2026-08-14", // VERIFY: set to the date YOU last checked the sources — this renders publicly.
  },

  {
    id: "child-nutrition",
    category: "Child Nutrition",
    icon: "Baby",
    tagline: "A vitamin most of us have never thought about, and the children who die without it.",
    name: "Helen Keller Intl",
    evaluator: evaluatorById.givewell.name,
    evaluatorUrl: "https://www.givewell.org/charities/helen-keller-international",
    evaluatorNote: "A GiveWell Top Charity for its vitamin A supplementation program.",
    headline: "Protect one child for a whole year.",
    subhead:
      "Two vitamin A doses a year, from six months to five years old, measurably lowers a child's chance of dying.",
    costFigures: [
      {
        // VERIFY: per-supplement delivered cost, GiveWell's Helen Keller Intl
        // vitamin A page. This is the capsule PLUS the whole delivery operation.
        label: "Cost per supplement delivered",
        value: "~$1",
        source: "GiveWell, all-in cost — capsule plus the campaign that gets it to the child",
      },
      {
        label: "Full year of protection for one child",
        value: "~$2",
        source: "Two doses per year is the protocol for children aged 6 months to 5 years",
      },
      {
        // VERIFY: the per-death-averted range is wide and country-dependent.
        // Confirm against GiveWell's current review before launch.
        label: "Cost per death averted",
        value: "$1,000–$8,500",
        source: "GiveWell estimate, varying widely by country and baseline mortality",
      },
    ],
    outcomeFramings: [
      "$2 protects one child for a full year.",
      "$10 delivers ten vitamin A supplements.",
    ],
    givingLevels: [
      // At ~$1 a supplement and two doses a child a year, these are 10, 20 and
      // 50 supplements. The old $2 tier was a year for one child and was this
      // cause's default — and, being under $10, the one Every.org dropped most
      // often. Same arithmetic, starting where the amount survives.
      { amount: 10, outcomeText: "Protects five children for a full year — both doses.", emphasis: true },
      { amount: 20, outcomeText: "Protects ten children for a full year." },
      { amount: 50, outcomeText: "Funds a year of protection for roughly 25 children." },
    ],
    evidenceNotes: {
      whatTheyDo:
        "Helen Keller Intl supports national vitamin A supplementation campaigns — the technical assistance, the logistics, and the funding gap that keeps a country's twice-yearly campaign running.",
      method:
        "The underlying evidence is a set of randomised trials showing meaningful reductions in child mortality from vitamin A supplementation. GiveWell then adjusts hard for present-day conditions: whether deficiency is still widespread in a given country, whether the government would have funded the campaign anyway, and how much of the trial-era effect should still be expected today.",
      caveats: [
        "The trials behind vitamin A supplementation are decades old, and child mortality has fallen a great deal since. GiveWell explicitly discounts the expected effect for this, and reasonable researchers disagree about how large the discount should be.",
        "Cost per death averted spans nearly an order of magnitude depending on the country. The low end is not the typical case.",
        "This is a supplement delivered alongside existing national campaigns, not a standalone clinic. The counterfactual — what happens without this funding — is a real part of the estimate.",
      ],
    },
    custom: {
      // VERIFY: derived from the ~$1-per-supplement figure above — update together.
      perDollar: 1,
      one: "Delivers one vitamin A supplement.",
      many: "Delivers ~{n} vitamin A supplements.",
      tooSmall: "Joins the pooled fund behind the next campaign.",
      pictogram: { glyph: "capsule", label: "supplements" },
    },
    // Verified 2026-08-17 by loading every.org/hki and reading back
    // the organisation name. EIN 13-5562162 — Helen Keller International.
    // VERIFY: re-check the slug still resolves to this exact entity before launch.
    everyOrg: { slug: "hki", ein: "13-5562162" },
    donateUrl: "https://helenkellerintl.org/donate/",
    lastVerified: "2026-08-14", // VERIFY: set to the date YOU last checked the sources.
  },

  {
    id: "disease-prevention",
    category: "Disease Prevention",
    icon: "Pill",
    tagline: "Malaria has a season. Medicine given ahead of it keeps children out of the hospital.",
    name: "Malaria Consortium",
    evaluator: evaluatorById.givewell.name,
    evaluatorUrl: "https://www.givewell.org/charities/malaria-consortium",
    evaluatorNote:
      "A GiveWell Top Charity, and historically the recipient of the largest share of GiveWell-directed funding.",
    headline: "Shield a child through the entire malaria season.",
    subhead:
      "Seasonal malaria chemoprevention: a course of preventive medicine given monthly through the months when transmission peaks.",
    costFigures: [
      {
        // VERIFY: per-child, per-season cost from GiveWell's Malaria Consortium
        // review. Has sat around $6–7; confirm the current figure.
        label: "Full seasonal course for one child",
        value: "~$6–7",
        source: "GiveWell, covering the medicine and the community distribution that delivers it",
      },
      {
        // VERIFY: GiveWell Top Charities Fund per-life-saved estimate.
        label: "Cost per life saved (estimate)",
        value: "~$3,600",
        source: "GiveWell Top Charities Fund estimate",
      },
    ],
    outcomeFramings: [
      "$7 shields a child through the entire malaria season.",
      "$70 shields ten children.",
    ],
    givingLevels: [
      // Two courses rather than one, at ~$7 each: the single-child tier fell
      // under Every.org's $10 floor and arrived with no amount filled in.
      { amount: 14, outcomeText: "Shields two children through the entire malaria season." },
      { amount: 70, outcomeText: "Shields ten children through the season.", emphasis: true },
      { amount: 210, outcomeText: "Shields thirty children — most of a village's under-fives." },
    ],
    evidenceNotes: {
      whatTheyDo:
        "Malaria Consortium runs seasonal malaria chemoprevention across the Sahel: community distributors go door to door each month of the high-transmission season, giving young children a preventive antimalarial course.",
      method:
        "Chemoprevention has strong trial evidence for reducing malaria cases in children during the transmission season. GiveWell models delivered courses, local malaria burden, adherence to the full monthly regimen, and what the funding displaces or unlocks — then discounts for the share that other funders would likely have covered.",
      caveats: [
        "The intervention is seasonal by design. It protects during the transmission months, not year-round.",
        "Effectiveness depends on children completing the monthly courses, which is measured through household surveys rather than observed directly for every child.",
        "Drug resistance is monitored and is a genuine long-run risk to this intervention's cost-effectiveness.",
      ],
    },
    custom: {
      // VERIFY: derived from the ~$7-per-course figure above — update together.
      perDollar: 1 / 7,
      one: "Shields one child through the malaria season.",
      many: "Shields ~{n} children through the malaria season.",
      tooSmall: "Joins the pool covering the next child's seasonal course.",
      pictogram: { glyph: "shield", label: "children shielded" },
    },
    // Verified 2026-08-17 by loading every.org/malaria-consortium and reading back
    // the organisation name. EIN 98-0627052 — Malaria Consortium.
    // VERIFY: re-check the slug still resolves to this exact entity before launch.
    everyOrg: { slug: "malaria-consortium", ein: "98-0627052" },
    donateUrl: "https://www.malariaconsortium.org/pages/donate.htm",
    lastVerified: "2026-08-14", // VERIFY: set to the date YOU last checked the sources.
  },

  {
    id: "animal-welfare",
    category: "Animal Welfare",
    icon: "Bird",
    tagline: "Most hens in the world live in a cage the size of a sheet of paper. That is changing, company by company.",
    name: "The Humane League",
    evaluator: evaluatorById.ace.name,
    evaluatorUrl: "https://animalcharityevaluators.org/charity-review/the-humane-league/",
    evaluatorNote: "An Animal Charity Evaluators Recommended Charity for 2025.",
    headline: "Take a hen out of a cage she can't turn around in.",
    subhead:
      "Corporate campaigns don't rescue one animal at a time — they change the purchasing policy above millions of them at once.",
    costFigures: [
      {
        // VERIFY: this is THE HUMANE LEAGUE'S OWN estimate, not an independent
        // ACE figure. Confirm the current number and the years it covers, and
        // keep the "their own estimate" attribution — it matters.
        label: "Hens spared per dollar (THL's own estimate)",
        value: "~2 hens per $1",
        source:
          "The Humane League's own estimate from its corporate cage-free campaigns, 2015–2024. This is a self-reported figure, not an independently reproduced one.",
      },
    ],
    outcomeFramings: [
      "$10 spares roughly 20 hens from battery cages.",
      "$50 reaches roughly 100 hens.",
    ],
    givingLevels: [
      { amount: 10, outcomeText: "Spares roughly 20 hens from battery cages." },
      { amount: 50, outcomeText: "Reaches roughly 100 hens.", emphasis: true },
      { amount: 150, outcomeText: "Reaches roughly 300 hens." },
    ],
    evidenceNotes: {
      whatTheyDo:
        "The Humane League runs corporate campaigns: public pressure on food companies to adopt cage-free egg policies, then years of follow-up work making sure the commitments are actually implemented on the promised date.",
      method:
        "ACE reviews THL on programmatic effectiveness, cost-effectiveness, and organizational health, and has recommended it repeatedly. The hens-per-dollar figure comes from THL's own modelling: commitments won, hens covered by those commitments, expected implementation rates, and the share of the win attributable to THL rather than the wider movement.",
      caveats: [
        "The 2-hens-per-dollar figure is The Humane League's own estimate, not an independently reproduced one. We flag it as such because attribution in a coalition campaign is genuinely hard: many groups push the same company, and each may reasonably claim the win.",
        "A corporate commitment is a promise about the future. Some are implemented late, and some are quietly walked back — which is why the follow-up enforcement work matters as much as the campaign.",
        "Cage-free is a large improvement in one dimension of a hen's life, not a good life. This is harm reduction at scale, and worth saying plainly.",
        "Comparing animal welfare to human health means putting a value on animal suffering. There is no objective exchange rate, and we won't pretend there is one.",
      ],
    },
    custom: {
      // VERIFY: derived from THL's own ~2-hens-per-dollar estimate above — update together.
      perDollar: 2,
      one: "Spares one hen from a battery cage, by THL's own estimate.",
      many: "Spares ~{n} hens from battery cages, by THL's own estimate.",
      tooSmall: "Joins the pooled fund behind the next corporate campaign.",
      pictogram: { glyph: "hen", label: "hens" },
    },
    // Verified 2026-08-17 by loading every.org/thehumaneleague and reading back
    // the organisation name. EIN 04-3817491 — The Humane League.
    // VERIFY: re-check the slug still resolves to this exact entity before launch.
    everyOrg: { slug: "thehumaneleague", ein: "04-3817491" },
    donateUrl: "https://thehumaneleague.org/donate",
    lastVerified: "2026-08-14", // VERIFY: set to the date YOU last checked the sources.
  },

  {
    id: "climate",
    category: "Climate",
    icon: "Wind",
    tagline: "Not offsets. The policy and technology work that bends the whole curve.",
    name: "Giving Green Fund",
    evaluator: evaluatorById["giving-green"].name,
    evaluatorUrl: "https://www.givinggreen.earth/",
    evaluatorNote: "Built from Giving Green's 2025–2026 Top Climate Nonprofits research.",
    headline: "Ten tons of CO₂-equivalent, in expectation.",
    subhead:
      "Giving Green backs policy, advocacy, and neglected-technology work — the leverage points, not the retail offset market.",
    costFigures: [
      {
        // VERIFY: Giving Green's cost-effectiveness bar and how they currently
        // phrase it. Their public threshold has been roughly "$1 or less per
        // tCO2e in expectation" for top-tier recommendations.
        label: "Giving Green's bar for a top recommendation",
        value: "≲ $1 per tCO₂e",
        source:
          "Giving Green's stated threshold: roughly a dollar or less per metric ton of CO₂-equivalent reduced, in expectation",
      },
    ],
    outcomeFramings: [
      "$10 is roughly ten tons of CO₂-equivalent reduced, in expectation.",
      "$50 is roughly fifty tons, in expectation.",
    ],
    givingLevels: [
      { amount: 10, outcomeText: "Roughly ten tons of CO₂e reduced, in expectation." },
      { amount: 50, outcomeText: "Roughly fifty tons of CO₂e, in expectation.", emphasis: true },
      { amount: 250, outcomeText: "Roughly 250 tons of CO₂e, in expectation." },
    ],
    evidenceNotes: {
      whatTheyDo:
        "The Giving Green Fund pools donations across Giving Green's current top climate nonprofits, so your gift follows their research as it updates rather than being locked to one organization. If you would rather back a single group, Clean Air Task Force — policy and advocacy for neglected clean-energy technologies — is the most common single pick from their list.", // VERIFY: confirm CATF is still on Giving Green's current top list before naming it here.
      method:
        "Giving Green estimates expected tons of CO₂-equivalent averted per dollar, explicitly modelling the probability that an advocacy effort succeeds at all. A policy campaign that fails averts nothing; one that succeeds can shift emissions far beyond what the donation could ever buy directly. The estimate is that gamble, multiplied out.",
      caveats: [
        "\"In expectation\" is doing real work in that sentence. This is a probability-weighted average across outcomes, not tons you can point at. A given campaign may avert nothing at all.",
        "Systems change is genuinely harder to measure than offsets. An offset gives you a tidy receipt for a small, verifiable quantity; policy work gives you a large, uncertain one. Giving Green argues — and we agree — that the second is the better bet, but the honest cost of that is a much wider error bar.",
        "Attribution is contested. When a policy passes, many organizations pushed for it, and any share assigned to one of them is a judgment call.",
        "This is the only cause on the site where the outcome is a modelled expectation rather than a delivered unit. We kept it because the expected value is high, but it does not carry the same kind of certainty as a bed net.",
      ],
    },
    custom: {
      // VERIFY: derived from the ≲$1-per-ton threshold above — update together.
      perDollar: 1,
      one: "Roughly one ton of CO₂-equivalent reduced, in expectation.",
      many: "Roughly {n} tons of CO₂-equivalent reduced, in expectation.",
      tooSmall: "Joins the pooled fund, in expectation of the next ton.",
      pictogram: { glyph: "cloud", label: "tons of CO₂e, in expectation" },
    },
    // Deliberately no everyOrg entry. every.org/giving-green is "Giving Green
    // Research Group Inc", EIN 33-2390990 — the same EIN Giving Green publishes
    // for Fund gifts, so it is one legal entity. But the Fund (which regrants to
    // top climate nonprofits) and Giving Green's own research operations are
    // separate designations within it, and an Every.org donation gives us no
    // reliable way to specify which. Their own /give portal asks the donor
    // directly, so we send people there instead of guessing on their behalf.
    // VERIFY: every.org supports a `designation` parameter — if Giving Green
    // confirms they honour "Giving Green Fund", this could become a route.
    everyOrg: null,
    // VERIFY 2026-08-17: /donate returned a hard 404 — Giving Green's donation
    // page is /give. Re-check on every refresh; this one has moved before.
    donateUrl: "https://www.givinggreen.earth/give",
    lastVerified: "2026-08-14", // VERIFY: set to the date YOU last checked the sources, and confirm the donate URL resolves.
  },

  {
    id: "direct-cash",
    category: "Direct Cash",
    icon: "HandCoins",
    tagline: "The humbling option: skip the program, and let people in extreme poverty decide.",
    name: "GiveDirectly",
    evaluator: evaluatorById.givewell.name,
    evaluatorUrl: "https://www.givewell.org/charities/give-directly",
    evaluatorNote:
      "A longtime GiveWell standout, and the benchmark other charities are measured against.",
    headline: "About 90 cents of your dollar lands in a family's hands.",
    subhead:
      "No program, no intermediary purchase — a direct mobile-money transfer to a household in extreme poverty, to spend as they judge best.",
    costFigures: [
      {
        // VERIFY: GiveDirectly's current efficiency ratio. It has held around
        // 90% for standard cash programs but varies by program and country.
        label: "Share reaching recipients",
        value: "~$0.90 of every $1.00",
        source: "GiveDirectly, for standard cash transfer programs delivered by mobile money",
      },
    ],
    outcomeFramings: [
      "$100 puts about $90 directly into a family's hands.",
      "$1,000 is roughly a household's full transfer.",
    ],
    givingLevels: [
      { amount: 100, outcomeText: "About $90 lands directly with a family." },
      { amount: 500, outcomeText: "About $450 — roughly half a household's full transfer.", emphasis: true },
      { amount: 1000, outcomeText: "Roughly one household's full transfer: a year of transformative income." },
    ],
    evidenceNotes: {
      whatTheyDo:
        "GiveDirectly identifies households in extreme poverty, enrolls them, and sends money to their phones. Recipients decide what to do with it — a roof, school fees, a business, food, medicine.",
      method:
        "Direct cash is the most-studied intervention on this site. Multiple randomised controlled trials have tracked what recipients do with unconditional transfers and what happens afterwards to consumption, assets, earnings, and psychological wellbeing. GiveWell uses cash as the benchmark unit: every other charity's cost-effectiveness is expressed as a multiple of what the same money would do as a direct transfer.",
      caveats: [
        "Cash is the benchmark, not the maximum. GiveWell's top health charities are estimated to do considerably more good per dollar than cash — which is exactly why cash is the honest yardstick rather than the headline pick.",
        "The ~90% figure is a program-level efficiency ratio, not a guarantee about your specific gift, and it varies by program and country.",
        "The strongest long-run evidence covers a subset of programs and geographies. Effects measured years out are smaller and noisier than the effects measured immediately.",
      ],
    },
    custom: {
      // VERIFY: derived from the ~$0.90-per-dollar figure above — update together.
      perDollar: 0.9,
      style: "money",
      many: "About {n} lands directly in a family's hands.",
      tooSmall: "Every cent joins the same transfer pool.",
    },
    // Verified 2026-08-17 by loading every.org/givedirectly and reading back
    // the organisation name. EIN 27-1661997 — GiveDirectly.
    // VERIFY: re-check the slug still resolves to this exact entity before launch.
    everyOrg: { slug: "givedirectly", ein: "27-1661997" },
    donateUrl: "https://www.givedirectly.org/donate/",
    lastVerified: "2026-08-14", // VERIFY: set to the date YOU last checked the sources.
  },

  {
    // VERIFY — PLACEHOLDER ENTRY. Every figure below was drafted without being
    // checked against Evidence Action's or GiveWell's current published pages.
    // `provisional: true` keeps that visible to readers until you do.
    id: "deworming",
    provisional: true,
    category: "Deworming",
    icon: "Worm",
    tagline:
      "Pennies per child — and the most openly argued-over result in effective giving.",
    name: "Evidence Action — Deworm the World",
    evaluator: evaluatorById.givewell.name,
    // VERIFY 2026-08-17: the old /charities/deworm-the-world URL was a hard 404,
    // and checking it turned up something more important — GiveWell REMOVED
    // deworming from its Top Charity list in August 2022 when it tightened its
    // criteria. The entry claimed Top Charity status it does not have. Corrected
    // below; re-read the review before this cause leaves `provisional`.
    evaluatorUrl: "https://www.givewell.org/charities/deworm-world-initiative",
    evaluatorNote:
      "Reviewed by GiveWell and still eligible for their All Grants Fund — but no longer a Top Charity. GiveWell dropped deworming from that list in 2022.",
    headline: "Deworm a whole classroom this term.",
    subhead:
      "School-based mass treatment: one tablet, once or twice a year, delivered by teachers who are already standing in front of the children.",
    costFigures: [
      {
        // VERIFY — PLACEHOLDER: check GiveWell's current Deworm the World review.
        // Published per-treatment costs have ranged roughly $0.50–$1.50 by country;
        // the figure below is the conservative end of that range, not a source quote.
        label: "Cost to deworm one child for a year",
        value: "~$1 or less",
        source:
          "Drafted from the conservative end of published per-treatment ranges — not yet checked against GiveWell's current review",
      },
    ],
    outcomeFramings: [
      "$50 deworms roughly 50 children for a year.",
      "$10 deworms a classroom's worth of children.",
    ],
    givingLevels: [
      { amount: 10, outcomeText: "Deworms about ten children for a year." },
      { amount: 50, outcomeText: "Deworms about fifty children for a year.", emphasis: true },
      { amount: 150, outcomeText: "Deworms a small school — about 150 children." },
    ],
    custom: {
      // VERIFY — PLACEHOLDER: keep in sync with the cost figure above.
      perDollar: 1,
      one: "Deworms one child for a year.",
      many: "Deworms ~{n} children for a year.",
      tooSmall: "Joins the pool funding the next school's treatment round.",
      pictogram: { glyph: "child", label: "children" },
    },
    evidenceNotes: {
      whatTheyDo:
        "Deworm the World supports governments running school-based deworming programs — training teachers, supplying tablets, and monitoring whether the children actually receive them. The delivery cost is low precisely because it rides on schools that already exist.",
      method:
        "GiveWell's case for deworming rests less on immediate health than on long-run economic effects: follow-up studies of dewormed children found higher earnings years later. GiveWell models that effect, then applies a large explicit discount for the chance it doesn't replicate — and still finds the intervention competitive, because the cost per child is so low.",
      caveats: [
        "GiveWell removed deworming from its Top Charity list in August 2022, when it raised the bar for that list. The programme is still funded through GiveWell's All Grants Fund, but it no longer carries their strongest endorsement — and you should weigh that before giving here rather than after.",
        "This is the most contested pick on the site, and we'd rather say so than bury it. The long-run income evidence rests on a small number of studies, one of which has been re-analysed and disputed in public. GiveWell's own model applies a heavy discount for exactly this reason.",
        "The immediate health benefit for a typical treated child is modest. Most children treated do not have a heavy worm infection; the case rests on cheaply treating many to reach the few who do.",
        "If the long-run income effect turns out to be much smaller than estimated, this intervention's cost-effectiveness falls sharply — more than any other cause listed here.",
        "We include it because a low cost multiplied by a genuinely uncertain benefit can still be a good bet. That's a judgment about risk, not a settled fact, and you may reasonably decline it.",
      ],
    },
    // Verified 2026-08-17 by loading every.org/evidence-action and reading back
    // the organisation name. EIN 90-0874591 — Evidence Action.
    // VERIFY: re-check the slug still resolves to this exact entity before launch.
    everyOrg: { slug: "evidence-action", ein: "90-0874591" },
    donateUrl: "https://www.evidenceaction.org/donate/",
    lastVerified: "2026-08-14", // VERIFY — PLACEHOLDER: not yet checked. Also confirm this donate URL resolves.
  },

  {
    // VERIFY — PLACEHOLDER ENTRY. Figures below are illustrative and were NOT
    // checked against Founders Pledge's or LEEP's published research.
    // `provisional: true` keeps that visible to readers until you do.
    id: "lead-exposure",
    provisional: true,
    category: "Lead Exposure",
    icon: "Brain",
    tagline:
      "Lead paint is still sold legally across much of the world. A child's brain does not recover.",
    name: "Lead Exposure Elimination Project",
    evaluator: evaluatorById["founders-pledge"].name,
    evaluatorUrl: "https://www.founderspledge.com/research",
    evaluatorNote:
      "Identified through Founders Pledge research and backed by other effective-giving funders.",
    headline: "Get the lead out before the paint is ever sold.",
    subhead:
      "LEEP works with governments to test paint, write lead regulations, and enforce them — protecting children who will never know they were at risk.",
    costFigures: [
      {
        // VERIFY — PLACEHOLDER: replace with a figure quoted directly from
        // Founders Pledge or LEEP, with its date. Do not publish an invented
        // number for a cause whose whole appeal is the size of the multiplier.
        label: "Cost per child protected",
        value: "Pending verification",
        source:
          "Published estimates are strikingly low but vary widely by country and by how much of a regulatory win is attributed to LEEP. We won't quote a figure until we've checked one.",
      },
    ],
    outcomeFramings: [
      "Regulation reaches children a program never could.",
      "One national paint standard outlives every donation that funded it.",
    ],
    givingLevels: [
      { amount: 25, outcomeText: "Funds testing that shows a government its own paint is poisoned." },
      { amount: 100, outcomeText: "Funds the regulatory work behind a national lead standard.", emphasis: true },
      { amount: 500, outcomeText: "Helps carry one country's programme from evidence to enforcement." },
    ],
    // No `custom` block: with no verified cost-per-child figure, a live
    // "your $25 protects ~N children" sentence would be fabricated precision.
    // The custom-amount field hides itself for this cause until one exists.
    evidenceNotes: {
      whatTheyDo:
        "LEEP tests paint on sale in low- and middle-income countries, brings the results to regulators who often did not know, and then supports the drafting and enforcement of lead paint standards. Where it succeeds, the exposure stops for every child in the country, indefinitely.",
      method:
        "The case is a leverage argument rather than a delivery one: a small team's costs, set against the number of children in a country whose future exposure a regulation prevents, discounted by the probability the regulation passes and is enforced. That structure makes the expected value very high and the error bars very wide.",
      caveats: [
        "We have not yet verified a cost-per-child figure, and we would rather show you that gap than fill it with a number we like the look of.",
        "Like climate policy, this is expected value, not delivered units. A campaign that fails protects no one; the estimate is an average across outcomes that includes those failures.",
        "Attribution is genuinely hard. When a country adopts a lead standard, many actors contributed, and any share assigned to one organization is a judgment call.",
        "The benefit is counterfactual and invisible: nobody can point to the child whose lead exposure never happened. That's what makes the cause neglected — and it's also why it resists the kind of photograph a bed net gets.",
      ],
    },
    // Verified 2026-08-17 by loading every.org/leep and reading back
    // the organisation name. EIN 87-3016729 — Lead Exposure Elimination Project (LEEP).
    // VERIFY: re-check the slug still resolves to this exact entity before launch.
    everyOrg: { slug: "leep", ein: "87-3016729" },
    donateUrl: "https://leadelimination.org/donate/",
    lastVerified: "2026-08-14", // VERIFY — PLACEHOLDER: not yet checked. Also confirm this donate URL resolves.
  },
];

/** Look up a single cause by its URL slug. Returns undefined for unknown ids. */
export function getCharityById(id) {
  return charities.find((c) => c.id === id);
}

/** The other five causes, for the "keep looking" strip at the foot of a page. */
export function getOtherCharities(id) {
  return charities.filter((c) => c.id !== id);
}

/** The level marked `emphasis`, falling back to the middle one. */
export function getDefaultLevel(charity) {
  return (
    charity.givingLevels.find((l) => l.emphasis) ||
    charity.givingLevels[Math.floor(charity.givingLevels.length / 2)]
  );
}
