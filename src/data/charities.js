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
  "These are average program costs, not price tags. Your gift joins a pool that funds an entire operation (supplies, delivery, staff, monitoring), and the figures we quote are what that whole operation costs per unit of good, divided out. No single donation is tracked to a single item, and honest charities don't claim otherwise.";

/** Every evaluator we lean on, credited on the methodology page. */
export const evaluators = [
  {
    id: "givewell",
    short: "GiveWell",
    name: "GiveWell",
    url: "https://www.givewell.org/",
    focus: "Global health and poverty",
    description:
      "The most rigorous cost-effectiveness research in philanthropy. GiveWell publishes its full spreadsheets and its mistakes, and moves hundreds of millions of dollars a year on the strength of them.",
  },
  {
    id: "ace",
    short: "ACE",
    name: "Animal Charity Evaluators",
    url: "https://animalcharityevaluators.org/",
    focus: "Animal welfare",
    description:
      "ACE reviews animal advocacy organizations on programmatic effectiveness, cost-effectiveness, and organizational health, and publishes an annual set of recommended charities.",
  },
  {
    id: "founders-pledge",
    short: "Founders Pledge",
    name: "Founders Pledge",
    url: "https://www.founderspledge.com/research",
    focus: "Cross-cause research",
    description:
      "Founders Pledge publishes cost-effectiveness research across global health, climate, and policy, and has been an early backer of neglected interventions before larger funders reach them.",
  },
  {
    id: "hli",
    short: "HLI",
    name: "Happier Lives Institute",
    url: "https://www.happierlivesinstitute.org/",
    focus: "Wellbeing",
    description:
      "HLI evaluates charities by their effect on how people feel about their own lives, measured in wellbeing-adjusted life years, and publishes the models behind every number.",
  },
  {
    id: "giving-green",
    short: "Giving Green",
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
 *   id             slug used in the URL: /cause/:id
 *   category       human label for the cause
 *   icon           the cause drawing, by name (see components/CauseIcon.jsx)
 *   tagline        one line for the home-page card
 *   name           charity name
 *   evaluator      display name of the research org that made the call
 *   evaluatorUrl   deep link to the actual research page
 *   evaluatorNote  what, precisely, the evaluator said — no paraphrase creep
 *   headline       the big outcome statement at the top of the cause page
 *   subhead        one sentence of context under it
 *   costFigures[]  {label, value, source} — the math, shown in "How we know"
 *   outcomeFramings[]  short outcome sentences reused in cards and copy
 *   givingLevels[] {amount, outcomeText} — the middle one opens selected
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
 *   directPrefill  optional {style, form}. Set ONLY where loading the real
 *                  page with the parameters has been seen to fill the amount
 *                  in. See lib/donate.js for the styles and what was tested.
 *   learnMoreIntro two to four sentences on the problem itself, for a reader
 *                  who arrived knowing the cause's name and little else
 *   learnMore[]    {title, source, url, note} — three places to read about
 *                  the problem itself, not the charity. A fact sheet from a
 *                  health body, a data page, and the evaluator's intervention
 *                  report where one exists. All checked by check:links.
 *   lastVerified   ISO date the figures were last checked against source, or
 *                  null when they have not been — a provisional entry shows no
 *                  freshness date at all rather than a placeholder one
 *   provisional    optional. Set while an entry's figures have NOT yet been
 *                  checked against the evaluator's published research: the page
 *                  renders a visible "provisional" banner and the card is
 *                  flagged on the home grid. Delete the field once verified —
 *                  never delete it to make the banner go away.
 */
export const charities = [
  {
    id: "malaria-nets",
    cardOutcome: "five nets",
    seoTitle: "The most effective malaria charity",
    defaultAmount: 30,
    category: "Malaria Nets",
    icon: "net",
    tagline:
      "Malaria still kills a child about every minute. Almost every one of those deaths is preventable.",
    name: "Against Malaria Foundation",
    evaluator: evaluatorById.givewell.name,
    evaluatorUrl: "https://www.givewell.org/charities/against-malaria-foundation",
    evaluatorNote: "A GiveWell Top Charity, and one of the longest-standing picks on their list.",
    headline: "Put a net over a sleeping family.",
    subhead:
      "Insecticide-treated bed nets are the single best-evidenced way to keep malaria away from a child while they sleep.",
    costFigures: [
      {
        // Confirmed 2026-09-02 against GiveWell's top charities page:
        // "About $6 to provide one net."
        label: "Cost per net delivered",
        value: "~$6",
        source: "GiveWell / AMF, all-in cost including distribution and follow-up monitoring",
      },
      {
        // Confirmed 2026-09-02: GiveWell's top charities page states an
        // "estimated average cost-effectiveness of $5,500 per life saved".
        // It moves with country mix, so re-read it at each refresh.
        label: "Cost per life saved (estimate)",
        value: "~$5,500",
        source:
          "GiveWell's stated average for AMF, checked 2026-09-01. The figure moves with where nets are sent.",
        comparable: 5500,
        range: { low: 3000, high: 8000 },
      },
    ],
    outcomeFramings: [
      "$12 funds two nets over sleeping families.",
      "$60 funds ten nets, covering a cluster of homes for years.",
    ],
    givingLevels: [
      // No tier below $10: Every.org silently ignores a prefilled amount under
      // that, landing the donor on an empty field. At ~$6 a net the old $6 tier
      // was the honest entry point, but a tier that loses the amount is worse
      // than one that starts higher. $30 replaces it at five nets.
      { amount: 12, outcomeText: "Funds two nets over sleeping families." },
      { amount: 30, outcomeText: "Funds five nets over sleeping families." },
      { amount: 60, outcomeText: "Funds ten nets, a cluster of homes." },
    ],
    evidenceNotes: {
      whatTheyDo:
        "AMF funds long-lasting insecticide-treated nets, works with in-country distribution partners to get them onto beds, and then sends people back months later to photograph and record whether the nets are still hanging.",
      method:
        "GiveWell models the number of nets funded, how many people sleep under them, local malaria burden and mortality rates, and how much of the effect would have happened anyway without AMF's money. The follow-up monitoring is a large part of why AMF survives that scrutiny: the effect is measured, not assumed.",
      caveats: [
        "Cost per life saved is a modeled average across many distributions, not a promise attached to your gift. Nets in a high-burden region avert far more harm than the same nets elsewhere.",
        "Insecticide resistance in mosquito populations is real and is factored into GiveWell's newer models, but it is a live source of uncertainty about the future.",
        "AMF sometimes holds funds while it negotiates a distribution. Money arriving today may be deployed in a later campaign.",
      ],
    },
    custom: {
      // Derived from the ~$6-per-net figure above. Keep the two in sync.
      perDollar: 1 / 6,
      one: "Funds one net, covering one sleeping space for years.",
      many: "Funds ~{n} nets over sleeping families.",
      tooSmall: "Joins the pooled fund behind the next net.",
      pictogram: { glyph: "net", label: "nets" },
    },
    // Verified 2026-08-17 by loading every.org/againstmalaria and reading back
    // the organization name. EIN 20-3069841 — The Against Malaria Foundation.
    // VERIFY: re-check the slug still resolves to this exact entity before launch.
    everyOrg: { slug: "againstmalaria", ein: "20-3069841" },
    donateUrl: "https://www.againstmalaria.com/Donation.aspx",
    lastVerified: "2026-09-02",
    learnMoreIntro:
      "Malaria is a parasite carried by mosquitoes that bite at night. It kills around six hundred thousand people a year, most of them children under five in sub-Saharan Africa. A net treated with insecticide stops the bite and kills the mosquito, which is why it protects the household around it and not only the person underneath.",
    learnMore: [
      {
        title: "Malaria",
        source: "World Health Organization",
        url: "https://www.who.int/news-room/fact-sheets/detail/malaria",
        note: "The fact sheet: who gets it, where, and what the death toll is each year.",
      },
      {
        title: "Malaria",
        source: "Our World in Data",
        url: "https://ourworldindata.org/malaria",
        note: "Charts of cases and deaths over time, by country, and how far nets and treatment have moved them.",
      },
      {
        title: "Insecticide-treated nets",
        source: "GiveWell",
        url: "https://www.givewell.org/international/technical/programs/insecticide-treated-nets",
        note: "The evidence that nets reduce child deaths, and what it costs to get one hung.",
      },
    ],
  },

  {
    id: "malaria-medicine",
    cardOutcome: "five children through the season",
    seoTitle: "The best charity for seasonal malaria prevention",
    defaultAmount: 35,
    category: "Malaria Medicine",
    icon: "medicine",
    tagline:
      "Malaria has a season. Most child deaths from it fall in a few predictable months.",
    name: "Malaria Consortium",
    evaluator: evaluatorById.givewell.name,
    evaluatorUrl: "https://www.givewell.org/charities/malaria-consortium",
    evaluatorNote:
      "A GiveWell Top Charity, historically the largest recipient of GiveWell-directed funding.",
    headline: "Shield a child through the entire malaria season.",
    subhead:
      "Seasonal malaria chemoprevention: a course of preventive medicine given monthly through the months when transmission peaks.",
    costFigures: [
      {
        // Confirmed 2026-09-02: "About $7 to protect a child from malaria."
        // Was shown as a $6-7 range; GiveWell states a single figure.
        // Old note: per-child, per-season cost from GiveWell's Malaria Consortium
        // review. Has sat around $6–7; confirm the current figure.
        label: "Full seasonal course for one child",
        value: "~$7",
        source: "GiveWell, covering the medicine and the community distribution that delivers it",
      },
      {
        // Confirmed 2026-09-02: GiveWell states $4,000 per life saved.
        label: "Cost per life saved (estimate)",
        // Was ~$3,600, which was stale: GiveWell's top-charities page states
        // $4,000 as the average for seasonal malaria chemoprevention.
        value: "~$4,000",
        source: "GiveWell's stated average for SMC, checked 2026-09-01",
        comparable: 4000,
      },
    ],
    outcomeFramings: [
      "$7 shields a child through the entire malaria season.",
      "$70 shields ten children.",
    ],
    givingLevels: [
      { amount: 10, outcomeText: "Shields one child through the entire malaria season." },
      { amount: 35, outcomeText: "Shields five children through the season." },
      { amount: 70, outcomeText: "Shields ten children through the season." },
    ],
    evidenceNotes: {
      whatTheyDo:
        "Malaria Consortium runs seasonal malaria chemoprevention across the Sahel: community distributors go door to door each month of the high-transmission season, giving young children a preventive antimalarial course.",
      method:
        "Chemoprevention has strong trial evidence for reducing malaria cases in children during the transmission season. GiveWell models delivered courses, local malaria burden, adherence to the full monthly regimen, and what the funding displaces or unlocks, then discounts for the share that other funders would likely have covered.",
      caveats: [
        "The intervention is seasonal by design. It protects during the transmission months, not year-round.",
        "Effectiveness depends on children completing the monthly courses, which is measured through household surveys rather than observed directly for every child.",
        "Drug resistance is monitored and is a genuine long-run risk to this intervention's cost-effectiveness.",
      ],
    },
    custom: {
      // Derived from the ~$7-per-course figure above. Keep the two in sync.
      perDollar: 1 / 7,
      one: "Shields one child through the malaria season.",
      many: "Shields ~{n} children through the malaria season.",
      tooSmall: "Joins the pool covering the next child's seasonal course.",
      pictogram: { glyph: "child", label: "children shielded" },
    },
    // Verified 2026-08-17 by loading every.org/malaria-consortium and reading back
    // the organization name. EIN 98-0627052 — Malaria Consortium.
    // VERIFY: re-check the slug still resolves to this exact entity before launch.
    everyOrg: { slug: "malaria-consortium", ein: "98-0627052" },
    donateUrl: "https://www.malariaconsortium.org/pages/donate.htm",
    lastVerified: "2026-09-02",
    learnMoreIntro:
      "Across the Sahel, malaria transmission is concentrated in a few rainy months each year. Seasonal malaria chemoprevention gives children under five a full course of antimalarial medicine once a month through that season, so the parasite is cleared before it can take hold. In the trials that established it, the children who received it had about three quarters fewer cases of malaria.",
    learnMore: [
      {
        title: "Malaria",
        source: "World Health Organization",
        url: "https://www.who.int/news-room/fact-sheets/detail/malaria",
        note: "The fact sheet, including why transmission is seasonal across the Sahel.",
      },
      {
        title: "Seasonal malaria chemoprevention",
        source: "GiveWell",
        url: "https://www.givewell.org/international/technical/programs/seasonal-malaria-chemoprevention",
        note: "The trial evidence behind giving preventive medicine monthly through the season.",
      },
      {
        title: "Malaria",
        source: "Our World in Data",
        url: "https://ourworldindata.org/malaria",
        note: "Cases and deaths over time, and the share that falls on children under five.",
      },
    ],
  },

  {
    id: "childhood-vaccines",
    cardOutcome: "half an infant's vaccinations",
    seoTitle: "The most effective vaccination charity",
    defaultAmount: 75,
    category: "Childhood Vaccines",
    icon: "syringe",
    tagline:
      "The vaccines are free. The infants who miss them have parents who couldn't afford the trip.",
    name: "New Incentives",
    evaluator: evaluatorById.givewell.name,
    evaluatorUrl: "https://www.givewell.org/charities/new-incentives",
    evaluatorNote:
      "A GiveWell Top Charity. Evidence rated \"exceptionally strong\", GiveWell's highest grade.",
    headline: "Get an infant every vaccine on the schedule.",
    subhead:
      "Small cash payments to caregivers in northern Nigeria, handed over at the clinic, for each routine vaccination visit an infant completes.",
    costFigures: [
      {
        label: "Cost per infant vaccinated",
        value: "~$146",
        source:
          "GiveWell's all-in figure: the incentive payments plus the whole operation that delivers them, checked 2026-09-02.",
      },
      {
        label: "Cost per life saved (estimate)",
        value: "~$4,500",
        source:
          "GiveWell's stated average, checked 2026-09-02. The state-by-state spread runs roughly $1,500 to $6,000, and the bar below shows it.",
        comparable: 4500,
        range: { low: 1500, high: 6000 },
      },
    ],
    outcomeFramings: [
      "$146 gets one infant every vaccine on the routine schedule.",
      "$4,500 saves a life, on GiveWell's estimate.",
    ],
    givingLevels: [
      { amount: 25, outcomeText: "About a sixth of one infant's full vaccination course." },
      { amount: 75, outcomeText: "About half of one infant's full vaccination course." },
      { amount: 146, outcomeText: "Gets one infant every vaccine on the schedule." },
    ],
    evidenceNotes: {
      whatTheyDo:
        "New Incentives pays caregivers in northern Nigeria a small cash incentive, about a dollar a visit, each time they bring an infant to a government clinic for a routine vaccination. The vaccines themselves are free. The money covers the trip and the day's lost earnings, and clinic staff explain why the full schedule matters.",
      method:
        "The program was tested in an independent randomised controlled trial from 2017 to 2020, which found large increases in vaccination rates. GiveWell then models how many deaths those extra vaccinations avert, using its own estimates of disease burden and vaccine efficacy in each state, and discounts for the children who would have been vaccinated anyway.",
      caveats: [
        "Cost per life saved spans about a fourfold range across the states the program runs in. The average hides that spread.",
        "The trial measured vaccination rates, not deaths. The life-saved figure rests on GiveWell's model of what those vaccinations prevent, which is well grounded but still a model.",
        "Cash incentives change behaviour while they are paid. Whether vaccination habits persist after a program leaves an area is less certain, and GiveWell's estimate does not assume they do.",
        "This is the fourth GiveWell Top Charity on this site. The four are close in cost per life saved; the choice between them is which problem you want your money on, not which is cheaper.",
      ],
    },
    custom: {
      // Derived from the ~$146-per-infant figure above. Update together.
      perDollar: 1 / 146,
      one: "Gets one infant every vaccine on the routine schedule.",
      many: "Gets ~{n} infants fully vaccinated.",
      tooSmall: "Joins the pool covering the next infant's vaccination course.",
      pictogram: { glyph: "child", label: "infants vaccinated" },
    },
    // Slug taken from New Incentives' own donate page on 2026-09-02, which
    // links to every.org/newincentives. The charity naming its own listing is
    // the strongest confirmation available.
    // VERIFY: Every.org sits behind a bot check, so the profile itself has not
    // been loaded and the EIN not read back. Do that before launch.
    everyOrg: { slug: "newincentives" },
    donateUrl: "https://www.newincentives.org/donate",
    lastVerified: "2026-09-02",
    learnMoreIntro:
      "The routine vaccines a child gets in the first year, against measles, whooping cough, diphtheria, pneumonia and more, are among the cheapest ways ever found to stop a child dying before five. Millions of infants still miss them, and rarely for lack of vaccine. The clinic is far, the trip costs money, and the full schedule needs several visits. Northern Nigeria has some of the lowest coverage in the world.",
    learnMore: [
      {
        title: "Immunization coverage",
        source: "World Health Organization",
        url: "https://www.who.int/news-room/fact-sheets/detail/immunization-coverage",
        note: "How many children get the routine schedule, and how many are still missed.",
      },
      {
        title: "Vaccination",
        source: "Our World in Data",
        url: "https://ourworldindata.org/vaccination",
        note: "Coverage by vaccine and country, and how many deaths vaccines prevent.",
      },
      {
        title: "Vaccines and immunization",
        source: "World Health Organization",
        url: "https://www.who.int/health-topics/vaccines-and-immunization",
        note: "WHO's programme page: what the routine schedule is and how many children miss it.",
      },
    ],
  },

  {
    id: "child-survival",
    cardOutcome: "ten children, a year each",
    seoTitle: "The most effective child survival charity",
    defaultAmount: 20,
    category: "Child Survival",
    icon: "capsule",
    tagline:
      "Most child deaths come from causes we already know how to stop, cheaply.",
    name: "Helen Keller Intl",
    evaluator: evaluatorById.givewell.name,
    evaluatorUrl: "https://www.givewell.org/charities/helen-keller-international",
    evaluatorNote: "A GiveWell Top Charity for its vitamin A supplementation program.",
    headline: "Protect one child for a whole year.",
    subhead:
      "Two vitamin A doses a year, from six months to five years old, measurably lowers a child's chance of dying.",
    costFigures: [
      {
        // Confirmed 2026-09-02: GiveWell gives "About $2 to provide vitamin A
        // supplements to a child for one year", and the protocol is two doses a
        // year, so ~$1 per supplement delivered. That is the capsule PLUS the
        // whole delivery operation, not the price of a capsule.
        label: "Cost per supplement delivered",
        value: "~$1",
        source: "GiveWell, all-in cost: capsule plus the campaign that gets it to the child",
      },
      {
        label: "Full year of protection for one child",
        value: "~$2",
        source: "Two doses per year is the protocol for children aged 6 months to 5 years",
      },
      {
        // Confirmed 2026-09-02: GiveWell states $3,500 per life saved. The
        // country-by-country spread is wide, which the bar below shows.
        label: "Cost per death averted",
        value: "~$3,500",
        source:
          "GiveWell's stated average for vitamin A supplementation, checked 2026-09-01. The country-by-country spread is wide, and the bar below shows it.",
        comparable: 3500,
        // Drawn as a bar rather than left as text: "$1,000-$8,500" is a number
        // nobody can feel, and the point is how wide it is.
        range: { low: 1000, high: 8500 },
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
      { amount: 10, outcomeText: "Protects five children for a full year, both doses." },
      { amount: 20, outcomeText: "Protects ten children for a full year." },
      { amount: 50, outcomeText: "Funds a year of protection for roughly 25 children." },
    ],
    evidenceNotes: {
      whatTheyDo:
        "Helen Keller Intl supports national vitamin A supplementation campaigns: the technical assistance, the logistics, and the funding gap that keeps a country's twice-yearly campaign running.",
      method:
        "The underlying evidence is a set of randomised trials showing meaningful reductions in child mortality from vitamin A supplementation. GiveWell then adjusts hard for present-day conditions: whether deficiency is still widespread in a given country, whether the government would have funded the campaign anyway, and how much of the trial-era effect should still be expected today.",
      caveats: [
        "The trials behind vitamin A supplementation are decades old, and child mortality has fallen a great deal since. GiveWell explicitly discounts the expected effect for this, and reasonable researchers disagree about how large the discount should be.",
        "Cost per death averted spans nearly an order of magnitude depending on the country. The low end is not the typical case.",
        "This is a supplement delivered alongside existing national campaigns, not a standalone clinic. The counterfactual, what happens without this funding, is a real part of the estimate.",
      ],
    },
    custom: {
      // Derived from the ~$1-per-supplement figure above. Keep the two in sync.
      perDollar: 1,
      one: "Delivers one vitamin A supplement.",
      many: "Delivers ~{n} vitamin A supplements.",
      tooSmall: "Joins the pooled fund behind the next campaign.",
      pictogram: { glyph: "capsule", label: "supplements" },
    },
    // Verified 2026-08-17 by loading every.org/hki and reading back
    // the organization name. EIN 13-5562162 — Helen Keller International.
    // VERIFY: re-check the slug still resolves to this exact entity before launch.
    everyOrg: { slug: "hki", ein: "13-5562162" },
    donateUrl: "https://helenkellerintl.org/donate/",
    // Verified 2026-09-02: this URL with the parameters renders $25 in the
    // amount field of the Fundraise Up form on giving.helenkellerintl.org.
    directPrefill: { style: "fundraiseup", form: "FUNUYQRJGHG" },
    lastVerified: "2026-09-02",
    learnMoreIntro:
      "Vitamin A keeps a child's immune system and eyes working. Where diets are short of it, a child who catches measles or a bad bout of diarrhoea is far more likely to die of it. Two high-dose capsules a year, from six months to five years old, measurably lower that risk, and cost almost nothing to deliver alongside campaigns that already exist.",
    learnMore: [
      {
        title: "Vitamin A supplementation",
        source: "GiveWell",
        url: "https://www.givewell.org/international/technical/programs/vitamin-A",
        note: "The trials behind supplementation and how much child mortality it reduces.",
      },
      {
        title: "Child mortality",
        source: "Our World in Data",
        url: "https://ourworldindata.org/child-mortality",
        note: "How child deaths have fallen, where they still happen, and from what.",
      },
      {
        title: "Micronutrients",
        source: "World Health Organization",
        url: "https://www.who.int/health-topics/micronutrients",
        note: "Why vitamin A deficiency weakens a child's immune system and sight.",
      },
    ],
  },

  {
    id: "malnutrition",
    cardOutcome: "one child treated",
    seoTitle: "The most effective malnutrition charity",
    estimateNote:
      "Cost per child is GiveWell's figure. The cost-per-life range in the evidence panel is Taimaka's own model.",
    defaultAmount: 105,
    category: "Malnutrition",
    icon: "bowl",
    tagline:
      "Severe malnutrition is treatable in weeks, if the clinic can afford to keep running.",
    name: "Taimaka",
    evaluator: evaluatorById.givewell.name,
    evaluatorUrl:
      "https://www.givewell.org/research/grants/taimaka-acute-malnutrition-treatment-in-gombe-state-nigeria-november-2024-and-program-monitoring-march-2025",
    evaluatorNote:
      "A GiveWell grantee, not a Top Charity: three years funded from November 2024, renewal decision due 2026.",
    headline: "Treat a severely malnourished child through to recovery.",
    subhead:
      "Community health workers in Gombe State, Nigeria, find the children, treat them with ready-to-use therapeutic food and basic medicine, and follow each one until they are well.",
    costFigures: [
      {
        label: "Cost per child treated",
        value: "~$105",
        source:
          "GiveWell's estimate in its November 2024 grant write-up. Taimaka's own 2025 projection is ~$87, and its website quotes $94.",
      },
      {
        label: "GiveWell's cost-effectiveness estimate",
        value: "~9× cash",
        source:
          "Roughly nine times as cost-effective as a direct cash transfer, against GiveWell's funding bar of 10× at the time, and 13× counting the value of what GiveWell expects to learn.",
      },
      {
        label: "Cost per WELLBY",
        value: "~$15",
        source:
          "Happier Lives Institute's estimate, July 2025. A WELLBY is one year of one point of life satisfaction on a 0–10 scale.",
      },
      {
        label: "Cost per life saved (Taimaka's own model)",
        value: "$1,500–4,500",
        source:
          "Taimaka's own estimate, not independently reproduced. GiveWell has not published a per-life figure for this program.",
      },
    ],
    outcomeFramings: [
      "$105 treats one severely malnourished child through to recovery.",
      "$500 treats five.",
    ],
    // Multiples of the $105 cost, so each claim is exactly true rather than
    // nearly true. At $100 and $500 these read "one child" and "five children"
    // against real costs of $105 and $525, which overstated by about 5%.
    givingLevels: [
      { amount: 25, outcomeText: "A quarter of one child's full course of treatment." },
      { amount: 105, outcomeText: "Treats one severely malnourished child through to recovery." },
      { amount: 210, outcomeText: "Treats two children through to recovery." },
    ],
    evidenceNotes: {
      whatTheyDo:
        "Taimaka runs outpatient treatment for severe acute malnutrition out of government health facilities in Gombe State, in northeastern Nigeria. Community health workers, rather than doctors and nurses, screen children, hand out ready-to-use therapeutic food and antibiotics, and see each case weekly until recovery. About 93% of admitted children recover.",
      method:
        "GiveWell reviewed Taimaka's program, cost and monitoring data before granting $4.8 million in November 2024 for three years of treatment, expected to reach around 45,000 children, and a further $0.5 million in 2025 for monitoring. Its model puts the program at roughly nine times the cost-effectiveness of cash, just under its funding bar, with a renewal decision due in 2026. Happier Lives Institute modelled the same program in wellbeing terms and estimates $15 per WELLBY.",
      caveats: [
        "GiveWell's estimate sits just below its own funding bar, and GiveWell says so. This is a promising program it is still learning about, not a Top Charity with a decade of evidence behind it.",
        "The cost-per-life-saved range is Taimaka's own model. We show it because readers ask, and flag it because nobody independent has reproduced it.",
        "GiveWell's stated uncertainties: how much death treatment actually averts, whether Taimaka can scale, what using less-qualified health workers does to quality of care, and whether the program displaces government services.",
        "The funding gaps are real and dated. Happier Lives Institute reports $400,000 unfilled for 2026 and $1.45 million for 2027, and a gap that closes changes what the next dollar does.",
      ],
    },
    custom: {
      // Derived from GiveWell's ~$105-per-child figure above. Update together.
      perDollar: 1 / 105,
      one: "Treats one severely malnourished child through to recovery.",
      many: "Treats ~{n} severely malnourished children through to recovery.",
      tooSmall: "Joins the pool funding the next child's course of treatment.",
      pictogram: { glyph: "child", label: "children treated" },
    },
    // Seen 2026-09-02 as "Taimaka | Every.org" at every.org/taimaka in search
    // results; the org is Taimaka Project, EIN 84-3964208, per its own site.
    // VERIFY: load the slug and read back the organization name before launch.
    everyOrg: { slug: "taimaka", ein: "84-3964208" },
    donateUrl: "https://taimaka.org/donate",
    lastVerified: "2026-09-02",
    learnMoreIntro:
      "Severe acute malnutrition is a child so undernourished that ordinary food will not bring them back. It is treated with ready-to-use therapeutic food, a fortified peanut paste, together with antibiotics, over several weeks of weekly visits. Untreated, a large share of these children die. Treated in the community rather than in hospital, most recover.",
    learnMore: [
      {
        title: "Malnutrition",
        source: "World Health Organization",
        url: "https://www.who.int/news-room/fact-sheets/detail/malnutrition",
        note: "The fact sheet on wasting, stunting and what severe acute malnutrition does to a child.",
      },
      {
        title: "Hunger and undernourishment",
        source: "Our World in Data",
        url: "https://ourworldindata.org/hunger-and-undernourishment",
        note: "Where undernourishment is concentrated and how it has changed.",
      },
      {
        title: "Community management of acute malnutrition",
        source: "GiveWell",
        url: "https://www.givewell.org/international/technical/programs/community-based-management-acute-malnutrition",
        note: "How outpatient treatment with therapeutic food works and what it costs.",
      },
    ],
  },

  {
    // Cost checked against GiveWell's 2022 grant page and its 2025 lookback on
    // 2026-09-02. The lookback is the important one: it revised the program's
    // REACH down, which raises the real cost per person actually served.
    id: "safe-water",
    cardOutcome: "ten people, a year of safe water",
    seoTitle: "The most effective safe water charity",
    estimateNote:
      "GiveWell's 2022 cost was $1.22 to $1.87 per person per year. Its 2025 review cut estimated reach by about 20%, and our figures apply that cut, so they understate.",
    defaultAmount: 25,
    category: "Safe Water",
    icon: "dispenser",
    tagline:
      "A chlorine dispenser at the spring people already walk to, and the water they carry home stops making children ill.",
    name: "Evidence Action's Dispensers for Safe Water",
    evaluator: evaluatorById.givewell.name,
    evaluatorUrl: "https://www.givewell.org/research/lookbacks/Dispensers-for-Safe-Water-2025",
    evaluatorNote:
      "A GiveWell grantee since 2022, now estimated at about 5x cash, down from 7x at the time of the grant.",
    headline: "Keep a family's drinking water clean all year.",
    subhead:
      "A dispenser of chlorine solution stands at the water source. People turn the valve as they fill their container, and the dose is already measured for them.",
    costFigures: [
      {
        label: "Cost per person per year, as published",
        value: "$1.22 to $1.87",
        source:
          "GiveWell's range across Kenya, Uganda and Malawi in its January 2022 grant write-up, checked 2026-09-02.",
      },
      {
        label: "Cost per person per year, reach-adjusted",
        value: "~$2.34",
        source:
          "The top of GiveWell's range, raised by the roughly 20% reach reduction it applied in its 2025 lookback. This is our arithmetic on GiveWell's two published numbers, not a figure GiveWell states.",
      },
      {
        label: "Versus cash transfers",
        value: "~5x",
        source:
          "GiveWell's current estimate as of the 2025 lookback, revised down from about 7x in 2022.",
      },
    ],
    outcomeFramings: [
      "$25 keeps about ten people on chlorinated water for a year.",
      "$75 covers about thirty people for a year.",
    ],
    givingLevels: [
      { amount: 5, outcomeText: "Two people on chlorinated water for a year." },
      { amount: 25, outcomeText: "Ten people on chlorinated water for a year." },
      { amount: 75, outcomeText: "About thirty people on chlorinated water for a year." },
    ],
    evidenceNotes: {
      whatTheyDo:
        "Evidence Action installs chlorine dispensers beside rural water sources in Kenya, Uganda and Malawi, keeps them stocked, and employs local promoters to encourage use. Placing the dispenser at the source is the whole idea: nobody has to remember to buy chlorine or carry it anywhere.",
      method:
        "Water chlorination has strong trial evidence behind it, and a 2022 meta-analysis raised GiveWell's estimate of how much it reduces child mortality. GiveWell models the number of people drinking treated water, how much diarrhoeal disease that prevents, and how many deaths follow from that, then discounts heavily for uncertainty about the mortality effect.",
      caveats: [
        "In 2025 GiveWell cut its estimate of the program's reach by about 20%, after an independent study and Evidence Action's own survey found far fewer people were drinking chlorinated water than routine monitoring reported. In Kenya the gap was around 40%. This is a measurement correction rather than a decline in the program, but it means earlier per-person figures were too optimistic.",
        "At roughly 5 times cash, this sits below GiveWell's bar for a Top Charity. GiveWell keeps funding it, but it is not one of their four strongest picks.",
        "The mortality benefit rests on a meta-analysis whose central estimate GiveWell itself treats as uncertain, and which it discounts substantially in its model.",
        "A dispenser only helps if people use it. Adoption is the number that moved, and it is the number most worth watching.",
      ],
    },
    custom: {
      // 1 / $2.34, the reach-adjusted figure above. Keep the two in sync.
      perDollar: 1 / 2.34,
      one: "Keeps one person on chlorinated water for a year.",
      many: "Keeps ~{n} people on chlorinated water for a year.",
      tooSmall: "Joins the pool that keeps the next dispenser stocked.",
      pictogram: { glyph: "child", label: "people, one year each" },
    },
    // Direct only on purpose. Every.org lists Evidence Action as a whole, so a
    // gift through it funds the organisation generally; only the charity's own
    // form can earmark this program, and it carries the amount across anyway.
    directOnlyReason:
      "Direct only: Every.org lists Evidence Action as a whole, and only its own form can earmark this program.",
    donateUrl: "https://www.evidenceaction.org/donate/",
    // Verified 2026-09-02: prefills the amount and shows "Designate to Safe
    // Water Now", Evidence Action's current umbrella brand for the dispensers
    // and its in-line chlorination work. GiveWell's lookback is on the
    // dispensers specifically, which is the larger part of it.
    directPrefill: { style: "fundraiseup", form: "safewaterdonate" },
    lastVerified: "2026-09-02",
    learnMoreIntro:
      "Diarrhoeal disease is one of the leading killers of children under five, and much of it comes from drinking water carrying faecal bacteria. Chlorine kills those bacteria cheaply and keeps working in the container on the walk home. The chemistry has never been the hard part. Getting people to use it every single day is.",
    learnMore: [
      {
        title: "Drinking water",
        source: "World Health Organization",
        url: "https://www.who.int/news-room/fact-sheets/detail/drinking-water",
        note: "How many people drink contaminated water and what it does to children.",
      },
      {
        title: "Clean water",
        source: "Our World in Data",
        url: "https://ourworldindata.org/clean-water",
        note: "Access to safe water by country, and the diarrhoeal disease burden it drives.",
      },
      {
        title: "Water quality interventions",
        source: "GiveWell",
        url: "https://www.givewell.org/international/technical/programs/water-quality-interventions",
        note: "The evidence on chlorination and child mortality, and why GiveWell revised it upward.",
      },
    ],
  },

  {
    // Cost checked against GiveWell's iron fortification pages on 2026-09-02.
    id: "micronutrients",
    cardOutcome: "a hundred people, a year of fortified flour",
    seoTitle: "The most effective food fortification charity",
    defaultAmount: 25,
    category: "Micronutrients",
    icon: "grain",
    tagline:
      "Iron costs cents a year per person when you add it to flour people are already buying.",
    name: "Fortify Health",
    evaluator: evaluatorById.givewell.name,
    evaluatorUrl: "https://www.givewell.org/international/technical/programs/iron-fortification",
    evaluatorNote:
      "A GiveWell grantee since 2018, most recently renewed for two years.",
    headline: "Put iron in the flour a family already eats.",
    subhead:
      "Fortify Health equips small wheat mills across India to add iron and folic acid to the flour they were milling anyway, so nobody has to buy anything new or change what they cook.",
    costFigures: [
      {
        label: "Cost per person per year",
        value: "~$0.22",
        source:
          "GiveWell's annualised figure across more than 11 million people reached, checked 2026-09-02. Fortify Health's own figure is lower, about $0.16.",
      },
      {
        label: "People reached",
        value: "11 million+",
        source:
          "Up from 410,000 a month in 2022, at roughly half the cost per person of GiveWell's original 2021 estimate.",
      },
    ],
    outcomeFramings: [
      "$25 fortifies a year of flour for over a hundred people.",
      "$100 covers about 450 people for a year.",
    ],
    givingLevels: [
      { amount: 5, outcomeText: "A year of fortified flour for about twenty people." },
      { amount: 25, outcomeText: "A year of fortified flour for over a hundred people." },
      { amount: 50, outcomeText: "A year of fortified flour for about 225 people." },
    ],
    evidenceNotes: {
      whatTheyDo:
        "Fortify Health works with open-market wheat flour mills in India, supplying the dosing equipment and the iron and folic acid premix, and covering the cost until fortification becomes routine for the miller. The flour reaches people through the shops they already use, at the same price.",
      method:
        "Iron deficiency anaemia is widespread in India and iron fortification of staples has a long evidence base. GiveWell models how much flour is fortified, how much of it people eat, how much that reduces anaemia, and what reduced anaemia is worth in earnings and wellbeing.",
      caveats: [
        "GiveWell red-teamed its own iron grantmaking and published the results. It found nothing that fundamentally undermines the case, but it did identify offsetting problems: newer meta-analyses suggest a smaller effect on anaemia than older ones, and there are publication bias concerns. GiveWell calls its findings a research agenda rather than settled conclusions.",
        "The benefit here is reduced anaemia rather than lives saved, so it does not sit on the same scale as the malaria and vaccination picks and cannot be compared with them directly.",
        "Fortification only helps people who eat enough of the fortified staple. GiveWell's model accounts for this, and it is a real source of uncertainty.",
        "This is a grantee, not a Top Charity. GiveWell funds it through its All Grants Fund.",
      ],
    },
    custom: {
      // 1 / $0.22, GiveWell's figure rather than Fortify Health's lower one,
      // so the sentence understates. Keep in sync with costFigures above.
      perDollar: 1 / 0.22,
      one: "Fortifies a year of flour for one person.",
      many: "Fortifies a year of flour for ~{n} people.",
      tooSmall: "Joins the pool equipping the next mill.",
      pictogram: { glyph: "child", label: "people, one year each" },
    },
    donateUrl: "https://www.fortifyhealth.global/donate",
    lastVerified: "2026-09-02",
    learnMoreIntro:
      "Iron deficiency is the most common nutritional deficiency in the world and the main cause of anaemia, which leaves people exhausted, makes pregnancy more dangerous and holds back children's development. India carries a large share of the global burden. Adding iron and folic acid to staple flour at the mill reaches people through the food they already buy, at no change in price or habit.",
    learnMore: [
      {
        title: "Anaemia",
        source: "World Health Organization",
        url: "https://www.who.int/news-room/fact-sheets/detail/anaemia",
        note: "Who is anaemic, why iron deficiency is the main cause, and what it costs a person.",
      },
      {
        title: "Micronutrient deficiency",
        source: "Our World in Data",
        url: "https://ourworldindata.org/micronutrient-deficiency",
        note: "The scale of iron, vitamin A and iodine deficiency worldwide.",
      },
      {
        title: "Food Fortification Initiative",
        source: "FFI",
        url: "https://ffinetwork.org/",
        note: "Which countries fortify which staples, and the case for doing it at the mill.",
      },
    ],
  },

  {
    // Checked against GiveWell's July 2022 grant page on 2026-09-02.
    id: "syphilis-in-pregnancy",
    cardOutcome: "the test that catches it",
    seoTitle: "The most effective charity for syphilis in pregnancy",
    estimateNote:
      "No published cost per woman screened, so the tiers describe the work rather than a price per test.",
    defaultAmount: 25,
    category: "Syphilis in Pregnancy",
    icon: "test",
    tagline:
      "A treatable infection, caught at a routine appointment, is the difference between a stillbirth and a birth.",
    name: "Evidence Action's syphilis screening program",
    evaluator: evaluatorById.givewell.name,
    evaluatorUrl: "https://www.givewell.org/research/grants/evidence-action-syphilis-july-2022",
    evaluatorNote:
      "A GiveWell grantee estimated at 29x cash, the highest multiple on this site.",
    headline: "Catch syphilis before it reaches the baby.",
    subhead:
      "Women already come to antenatal clinics and are already tested for HIV. Swapping in a test that checks for both, and stocking the penicillin that treats it, is most of the work.",
    costFigures: [
      {
        label: "Versus cash transfers",
        value: "~29x",
        source:
          "GiveWell's estimate for the Zambia and Cameroon grant, published February 2023 and checked 2026-09-02. The highest multiple of any cause on this site.",
      },
      {
        label: "Cost per life saved",
        value: "under $1,000",
        source: "GiveWell's estimate for the same grant.",
      },
      {
        label: "Extra cost of the dual test",
        value: "~$0.15",
        source:
          "What a combined HIV and syphilis rapid test costs above the HIV-only test clinics already use. The program's cost is the technical assistance around it, not the test.",
      },
    ],
    outcomeFramings: [
      "The dual test costs about 15 cents more than the one clinics already use.",
      "GiveWell puts this at 29 times the value of cash.",
    ],
    givingLevels: [
      { amount: 10, outcomeText: "Supports the switch to dual testing in routine antenatal care." },
      { amount: 25, outcomeText: "Supports the training and supply work behind that switch." },
      { amount: 100, outcomeText: "Supports a clinic network through the change and the follow-up." },
    ],
    evidenceNotes: {
      whatTheyDo:
        "Evidence Action advises the health ministries of Zambia and Cameroon on switching antenatal clinics from HIV-only rapid tests to dual HIV and syphilis tests, and on keeping benzathine penicillin in stock so that a positive result is actually treated. It is technical assistance to a system that already exists, not a parallel clinic.",
      method:
        "Treating syphilis in pregnancy with benzathine penicillin has good evidence behind it for reducing stillbirth, newborn death, preterm birth and congenital syphilis. GiveWell models how many additional women get tested and treated because of the switch, and what that prevents.",
      caveats: [
        "GiveWell assigns 33 quality-adjusted life years to a stillbirth averted, and says plainly that the moral weight of a stillbirth is highly uncertain. A large share of this program's estimated value rests on that judgment, and you may weigh it differently.",
        "The 29x figure is high partly because the marginal cost is small: the clinics, the visits and the HIV test already exist. That is a real advantage, and it also means the estimate depends on the existing system continuing to work.",
        "This is a grantee, not a Top Charity, and the grant runs to a fixed end date rather than being an open-ended recommendation.",
        "There is no published cost per woman screened, so we do not quote one. The tiers above describe the work, not a unit price.",
      ],
    },
    directOnlyReason:
      "Direct only: Every.org lists Evidence Action as a whole, and only its own form can earmark this program.",
    donateUrl: "https://www.evidenceaction.org/donate/",
    // Verified 2026-09-02: prefills the amount and shows "Designate to
    // Syphilis-Free Start", Evidence Action's name for this program.
    directPrefill: { style: "fundraiseup", form: "syphilisdonate" },
    lastVerified: "2026-09-02",
    learnMoreIntro:
      "Syphilis is a bacterial infection that passes from a pregnant woman to her baby. Left untreated it causes stillbirth, newborn death and lifelong disability in a large share of cases. A rapid test at a routine antenatal visit finds it, and an injection of benzathine penicillin, given in time, prevents almost all of that harm.",
    learnMore: [
      {
        title: "Syphilis",
        source: "World Health Organization",
        url: "https://www.who.int/news-room/fact-sheets/detail/syphilis",
        note: "The fact sheet, including what untreated syphilis in pregnancy does to the baby.",
      },
      {
        title: "Syphilis",
        source: "World Health Organization",
        url: "https://www.who.int/health-topics/syphilis",
        note: "WHO's programme page on eliminating mother-to-child transmission.",
      },
      {
        title: "Syphilis screening and treatment in pregnancy",
        source: "GiveWell",
        url: "https://www.givewell.org/international/technical/programs/syphilis-screening-and-treatment-during-pregnancy",
        note: "GiveWell's report on the intervention: the evidence, the cost, and the open questions.",
      },
    ],
  },

  {
    id: "animal-welfare",
    cardOutcome: "550 hens out of cages",
    seoTitle: "The most effective animal welfare charity",
    estimateNote:
      "Hens per dollar is ACE's central estimate. Its published range runs from a fifth of this figure to four times it.",
    defaultAmount: 50,
    category: "Animal Welfare",
    icon: "hen",
    tagline: "Most hens in the world live in a cage the size of a sheet of paper. That is changing, company by company.",
    name: "The Humane League",
    evaluator: evaluatorById.ace.name,
    evaluatorUrl: "https://animalcharityevaluators.org/charity-review/the-humane-league/",
    evaluatorNote: "An Animal Charity Evaluators Recommended Charity for 2025.",
    headline: "Take a hen out of a cage she can't turn around in.",
    subhead:
      "Corporate campaigns don't rescue one animal at a time. They change the purchasing policy above millions of them at once.",
    costFigures: [
      {
        label: "Hens helped per dollar (ACE's estimate)",
        value: "~11 hens per $1",
        source:
          "Animal Charity Evaluators' own cost-effectiveness analysis of THL's cage-free accountability work, 2025 review, checked 2026-09-02. An independent figure. THL's earlier self-reported estimate was about 2 hens per dollar.",
      },
      {
        label: "Suffering-adjusted days averted per dollar",
        value: "~88",
        source:
          "ACE's central estimate for the same program, with a published range of 17 to 351. A suffering-adjusted day is one day of an animal's life, weighted by how bad that day is.",
      },
    ],
    outcomeFramings: [
      "$10 spares roughly 110 hens from battery cages.",
      "$50 reaches roughly 550 hens.",
    ],
    givingLevels: [
      { amount: 10, outcomeText: "Spares roughly 110 hens from battery cages." },
      { amount: 50, outcomeText: "Spares roughly 550 hens from battery cages." },
      { amount: 100, outcomeText: "Spares roughly 1,100 hens from battery cages." },
    ],
    evidenceNotes: {
      whatTheyDo:
        "The Humane League runs corporate campaigns: public pressure on food companies to adopt cage-free egg policies, then years of follow-up work making sure the commitments are actually implemented on the promised date.",
      method:
        "ACE reviews THL on programmatic effectiveness, cost-effectiveness, and organizational health, and has recommended it for eleven years running. The hens-per-dollar figure is ACE's own cost-effectiveness analysis of THL's cage-free accountability program: commitments won, hens covered, expected implementation rates, and the share of each win attributable to THL rather than the wider movement.",
      caveats: [
        "ACE's central figure sits inside a wide range: its suffering-adjusted estimate runs from a fifth of the headline number to four times it. The figure is independent now; it is not precise. Attribution in a coalition campaign is hard, since many groups push the same company.",
        "Giving What We Can, which vets evaluators, currently relies on ACE's Movement Grants program and on EA Funds' Animal Welfare Fund, but not on ACE's charity evaluations, after reviewing them in 2023 and 2024. It still expects ACE-recommended charities to beat unevaluated ones; it is not yet confident enough in the evaluations to build its own recommendations on them.",
        "A corporate commitment is a promise about the future. Some are implemented late, and some are quietly walked back, which is why the follow-up enforcement work matters as much as the campaign.",
        "Cage-free is a large improvement in one dimension of a hen's life, not a good life. This is harm reduction at scale, and worth saying plainly.",
        "Comparing animal welfare to human health means putting a value on animal suffering. There is no objective exchange rate, and we won't pretend there is one.",
      ],
    },
    custom: {
      // Derived from ACE's ~11-hens-per-dollar estimate above. Update together.
      perDollar: 11,
      one: "Spares one hen from a battery cage.",
      many: "Spares ~{n} hens from battery cages.",
      tooSmall: "Joins the pooled fund behind the next corporate campaign.",
      pictogram: { glyph: "hen", label: "hens" },
    },
    // Verified 2026-08-17 by loading every.org/thehumaneleague and reading back
    // the organization name. EIN 04-3817491 — The Humane League.
    // VERIFY: re-check the slug still resolves to this exact entity before launch.
    everyOrg: { slug: "thehumaneleague", ein: "04-3817491" },
    donateUrl: "https://thehumaneleague.org/donate",
    // Verified 2026-09-02: ?am=25 renders "You are giving: $25" on the
    // EveryAction form, with a "change" link back to the amounts.
    directPrefill: { style: "everyaction" },
    lastVerified: "2026-09-02",
    learnMoreIntro:
      "Most of the world's egg-laying hens live in battery cages, each with less floor space than a sheet of paper, unable to spread their wings or turn around. Cage-free housing does not make a hen's life good, but it removes the worst of it. Because a handful of large food companies buy most of the eggs, a change in their purchasing policy changes the lives of millions of birds at once.",
    learnMore: [
      {
        title: "Animal welfare",
        source: "Our World in Data",
        url: "https://ourworldindata.org/animal-welfare",
        note: "How many animals are farmed, how they are housed, and how that is changing.",
      },
      {
        title: "Open Wing Alliance",
        source: "The Humane League",
        url: "https://openwingalliance.org/",
        note: "The coalition running cage-free campaigns worldwide, with progress by company.",
      },
      {
        title: "Welfare Footprint Project",
        source: "Welfare Footprint",
        url: "https://welfarefootprint.org/",
        note: "Research quantifying how much suffering a caged hen experiences compared with a cage-free one.",
      },
    ],
  },

  {
    id: "climate",
    cardOutcome: "the whole climate portfolio",
    seoTitle: "The most effective climate charity",
    directOnlyReason:
      "Direct only: Every.org lists Giving Green's research arm, not the fund we recommend.",
    estimateNote:
      "Giving Green publishes no cost per tonne for this fund, so the tiers describe what a gift joins, not a tonnage.",
    defaultAmount: 25,
    category: "Climate",
    icon: "turbine",
    tagline:
      "Emissions are still rising. The cheapest ton is the one never emitted.",
    name: "Giving Green Fund",
    evaluator: evaluatorById["giving-green"].name,
    evaluatorUrl: "https://www.givinggreen.earth/",
    evaluatorNote: "Built from Giving Green's 2025–2026 Top Climate Nonprofits research.",
    // Was "Ten tons of carbon that never reach the air", which put a tonnage
    // on a $10 gift that Giving Green does not publish and we cannot source.
    headline: "Fund the policy work, not the offset.",
    subhead:
      "Giving Green backs policy, advocacy, and neglected-technology work: the leverage points, not the retail offset market.",
    costFigures: [
      {
        label: "Cost per tonne of CO₂e",
        value: "not published",
        source:
          "Checked 2026-09-02: Giving Green publishes no cost per tonne for the fund and does not tell donors to expect one. It picks nonprofits on the strength of the strategy and the organisation. The only sub-$1 per tonne figure on its site is for one specific intervention, contrail mitigation, not for the fund.",
      },
      {
        label: "What a gift buys",
        value: "a share of the portfolio",
        source:
          "Giving Green regrants to its current top climate nonprofits, so a gift follows the research as it updates instead of being locked to one organisation.",
      },
    ],
    outcomeFramings: [
      "A gift joins the fund behind Giving Green's current top climate nonprofits.",
      "The fund follows their research as it updates, rather than one organisation.",
    ],
    givingLevels: [
      { amount: 10, outcomeText: "Joins the fund behind Giving Green's current top climate nonprofits." },
      { amount: 25, outcomeText: "Backs the whole portfolio rather than a single bet." },
      { amount: 100, outcomeText: "Funds policy and advocacy that pays off over years, not months." },
    ],
    evidenceNotes: {
      whatTheyDo:
        "The Giving Green Fund pools donations across Giving Green's current top climate nonprofits, so your gift follows their research as it updates rather than being locked to one organization. If you would rather back a single group, Clean Air Task Force, which does policy and advocacy for neglected clean-energy technologies, is the most common single pick from their list.", // VERIFY: confirm CATF is still on Giving Green's current top list before naming it here.
      method:
        "Giving Green estimates expected tons of CO₂-equivalent averted per dollar, explicitly modelling the probability that an advocacy effort succeeds at all. A policy campaign that fails averts nothing; one that succeeds can shift emissions far beyond what the donation could ever buy directly. The estimate is that gamble, multiplied out.",
      caveats: [
        "We do not put a tonnage on your gift, because Giving Green does not. Any figure of the form \"$50 removes fifty tonnes\" on a site like this one is either quoting a different organisation's offset arithmetic or inventing it.",
        "Policy advocacy is a probability-weighted bet, not a delivered unit. A given campaign may avert nothing at all, and the fund's value rests on the few that land.",
        "Systems change is harder to measure than offsets. An offset gives you a tidy receipt for a small, verifiable quantity; policy work gives you a large, uncertain one. Giving Green argues, and we agree, that the second is the better bet, but the honest cost of that is a much wider error bar.",
        "Attribution is contested. When a policy passes, many organizations pushed for it, and any share assigned to one of them is a judgment call.",
        "This is the only cause on the site where the outcome is a modeled expectation rather than a delivered unit. We kept it because the expected value is high, but it does not carry the same kind of certainty as a bed net.",
      ],
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
    lastVerified: "2026-09-02",
    learnMoreIntro:
      "Greenhouse gas emissions are still rising, and the warming they cause is already visible in heatwaves, floods and failed harvests. Most of the cheapest ways to cut emissions are decisions made by governments and large companies, not by individuals. That is why the most effective climate giving funds policy, research and advocacy rather than offsets.",
    learnMore: [
      {
        title: "CO₂ and greenhouse gas emissions",
        source: "Our World in Data",
        url: "https://ourworldindata.org/co2-and-greenhouse-gas-emissions",
        note: "Emissions by country, sector and over time.",
      },
      {
        title: "Giving Green's 2025 to 2026 top climate nonprofits",
        source: "Giving Green",
        url: "https://www.givinggreen.earth/post/2025-2026-top-climate-nonprofits",
        note: "Which organisations the fund backs and why.",
      },
      {
        title: "Sixth Assessment Synthesis Report",
        source: "IPCC",
        url: "https://www.ipcc.ch/report/ar6/syr/",
        note: "The scientific consensus on where the climate is heading and what changes it.",
      },
    ],
  },

  {
    id: "extreme-poverty",
    cardOutcome: "$43 straight to a family",
    seoTitle: "The best charity for extreme poverty",
    defaultAmount: 50,
    category: "Extreme Poverty",
    icon: "banknote",
    tagline: "Hundreds of millions of people live on under $2 a day. They know what they need.",
    name: "GiveDirectly",
    evaluator: evaluatorById.givewell.name,
    evaluatorUrl: "https://www.givewell.org/charities/give-directly",
    evaluatorNote:
      "A longtime GiveWell standout, and the benchmark other charities are measured against.",
    headline: "Send money straight to a family in extreme poverty.",
    subhead:
      "No program and no intermediary purchase: a direct mobile-money transfer to a household in extreme poverty, to spend as they judge best.",
    costFigures: [
      {
        label: "Share reaching recipients",
        value: "~$0.87 of every $1.00",
        source:
          "GiveDirectly's own current figure for flagship poverty relief, checked 2026-09-02: more than $87 of every $100 given reaches someone in extreme poverty as cash. It has retired the ~90% figure it used in earlier years and now reports efficiency separately for each kind of program.",
      },
    ],
    outcomeFramings: [
      "$100 puts about $87 directly into a family's hands.",
      "$1,000 is roughly a household's full transfer.",
    ],
    givingLevels: [
      { amount: 10, outcomeText: "About $8 lands directly with a family." },
      { amount: 50, outcomeText: "About $43 lands directly with a family." },
      { amount: 250, outcomeText: "About $217, a fifth of a household's full transfer." },
    ],
    evidenceNotes: {
      whatTheyDo:
        "GiveDirectly identifies households in extreme poverty, enrolls them, and sends money to their phones. Recipients decide what to do with it: a roof, school fees, a business, food, medicine.",
      method:
        "Direct cash is the most-studied intervention on this site. Multiple randomised controlled trials have tracked what recipients do with unconditional transfers and what happens afterwards to consumption, assets, earnings, and psychological wellbeing. GiveWell uses cash as the benchmark unit: every other charity's cost-effectiveness is expressed as a multiple of what the same money would do as a direct transfer.",
      caveats: [
        "Cash is the benchmark, not the maximum. GiveWell's top health charities are estimated to do considerably more good per dollar than cash, which is exactly why cash is the yardstick rather than the headline pick.",
        "The ~90% figure is a program-level efficiency ratio, not a guarantee about your specific gift, and it varies by program and country.",
        "The strongest long-run evidence covers a subset of programs and geographies. Effects measured years out are smaller and noisier than the effects measured immediately.",
      ],
    },
    custom: {
      // Derived from the ~$0.87-per-dollar figure above. Keep the two in sync.
      perDollar: 0.87,
      style: "money",
      many: "About {n} lands directly in a family's hands.",
      tooSmall: "Every cent joins the same transfer pool.",
    },
    // Verified 2026-08-17 by loading every.org/givedirectly and reading back
    // the organization name. EIN 27-1661997 — GiveDirectly.
    // VERIFY: re-check the slug still resolves to this exact entity before launch.
    everyOrg: { slug: "givedirectly", ein: "27-1661997" },
    donateUrl: "https://www.givedirectly.org/donate/",
    lastVerified: "2026-09-02",
    learnMoreIntro:
      "Hundreds of millions of people live below the World Bank's line for extreme poverty, most of them in sub-Saharan Africa. Cash given directly is spent on whatever the household judges most urgent: a roof, school fees, livestock, a small business. Decades of studies have found it is not squandered, and that the gains last.",
    learnMore: [
      {
        title: "Poverty",
        source: "Our World in Data",
        url: "https://ourworldindata.org/poverty",
        note: "How many people live in extreme poverty, where, and how that has changed.",
      },
      {
        title: "Cash transfers",
        source: "GiveWell",
        url: "https://www.givewell.org/international/technical/programs/cash-transfers",
        note: "The evidence on what people do with unconditional cash, and what it changes.",
      },
      {
        title: "Research",
        source: "GiveDirectly",
        url: "https://www.givedirectly.org/gdresearch/",
        note: "The randomised trials of GiveDirectly's own transfers.",
      },
    ],
  },

  {
    // Figures checked against GiveWell's Deworm the World review on 2026-09-02.
    // Read the caveats before touching them: GiveWell's own cost section dates
    // from November 2020, and nothing newer is published. The entry is honest
    // about that rather than pretending to a freshness it doesn't have.
    id: "intestinal-worms",
    cardOutcome: "75 children dewormed",
    seoTitle: "The most effective deworming charity",
    // Cost per child is country-dependent and GiveWell publishes no average, so
    // every figure here uses the more expensive of its two published costs.
    // The claims understate wherever treatment is cheaper, which is the safe
    // direction; the reverse would not be.
    estimateNote:
      "GiveWell publishes about $0.66 per child for Kenya and half that for India. We use the Kenya cost, so the figures understate elsewhere.",
    defaultAmount: 50,
    category: "Intestinal Worms",
    icon: "school",
    tagline:
      "Hundreds of millions of children carry worms that cost pennies a year to clear.",
    name: "Evidence Action — Deworm the World",
    evaluator: evaluatorById.givewell.name,
    // The old /charities/deworm-the-world URL was a hard 404, and checking it
    // turned up something more important: GiveWell REMOVED deworming from its
    // Top Charity list in August 2022 when it tightened its criteria. The entry
    // had claimed Top Charity status it does not have.
    evaluatorUrl: "https://www.givewell.org/charities/deworm-world-initiative",
    evaluatorNote:
      "Reviewed by GiveWell and eligible for its All Grants Fund. Not a Top Charity since 2022.",
    headline: "Deworm a whole classroom for a year.",
    subhead:
      "School-based mass treatment: one tablet, once or twice a year, delivered by teachers who are already standing in front of the children.",
    costFigures: [
      {
        label: "Cost per child dewormed, Kenya",
        value: "~$0.66",
        source:
          "GiveWell's all-in estimate for the Kenya program, or about $0.46 excluding in-kind contributions from governments. Checked 2026-09-02.",
      },
      {
        label: "Cost per child dewormed, India",
        value: "~$0.33",
        source:
          "GiveWell puts India at roughly half the Kenya cost. It expects other countries to sit closer to Kenya than to India, and to cost more in a program's early stages.",
      },
    ],
    outcomeFramings: [
      "$50 deworms about seventy-five children for a year.",
      "$10 deworms about fifteen children for a year.",
    ],
    givingLevels: [
      { amount: 10, outcomeText: "Deworms about fifteen children for a year." },
      { amount: 50, outcomeText: "Deworms about seventy-five children for a year, more than a classroom." },
      { amount: 100, outcomeText: "Deworms about 150 children for a year." },
    ],
    custom: {
      // 1 / $0.66, GiveWell's Kenya cost: the more expensive of the two figures
      // it publishes, so the live sentence understates rather than overstates.
      // Keep in sync with costFigures above.
      perDollar: 1 / 0.66,
      one: "Deworms one child for a year.",
      many: "Deworms ~{n} children for a year.",
      tooSmall: "Joins the pool funding the next school's treatment round.",
      pictogram: { glyph: "child", label: "children" },
    },
    evidenceNotes: {
      whatTheyDo:
        "Deworm the World supports governments running school-based deworming programs: training teachers, supplying tablets, and monitoring whether the children actually receive them. The delivery cost is low precisely because it rides on schools that already exist.",
      method:
        "GiveWell's case for deworming rests less on immediate health than on long-run economic effects: follow-up studies of dewormed children found higher earnings years later. GiveWell models that effect, then applies a large explicit discount for the chance it doesn't replicate, and still finds the intervention competitive, because the cost per child is so low.",
      caveats: [
        "GiveWell removed deworming from its Top Charity list in August 2022, when it raised the bar for that list. The program is still funded through GiveWell's All Grants Fund, but it no longer carries their strongest endorsement. You should weigh that before giving here rather than after.",
        "GiveWell's cost figures for this program were last updated in November 2020, and its review page in April 2023. We checked them against the source in September 2026 and they are still the current published numbers, but they are not recent ones, and no newer independent costing exists. Every other cause on this site rests on fresher research than this one.",
        "GiveWell itself no longer accepts donations earmarked for Deworm the World, which is why this cause sends you to Evidence Action instead. The form we link designates the gift to the deworming program rather than to Evidence Action's general fund.",
        "This is the most contested pick on the site, and we'd rather say so than bury it. The long-run income evidence rests on a small number of studies, one of which has been re-analyzed and disputed in public. GiveWell's own model applies a heavy discount for exactly this reason.",
        "The immediate health benefit for a typical treated child is modest. Most children treated do not have a heavy worm infection; the case rests on cheaply treating many to reach the few who do.",
        "If the long-run income effect turns out to be much smaller than estimated, this intervention's cost-effectiveness falls sharply, more than any other cause listed here.",
        "We include it because a low cost multiplied by a very uncertain benefit can still be a good bet. That's a judgment about risk, not a settled fact, and you may reasonably decline it.",
      ],
    },
    // Verified 2026-09-02 by loading every.org/evidence-action in a browser and
    // reading back the organization name and EIN. (Command-line requests hit a
    // bot check; a real browser does not.) EIN 90-0874591, Evidence Action.
    everyOrg: { slug: "evidence-action", ein: "90-0874591" },
    donateUrl: "https://www.evidenceaction.org/donate/",
    // Verified 2026-09-02: this form renders the chosen amount AND shows
    // "Designate to Deworm the World", so the gift lands on this cause's own
    // program rather than Evidence Action's general fund.
    directPrefill: { style: "fundraiseup", form: "dtwdonate" },
    // The date WE last checked the figures against GiveWell's page, which is
    // all the freshness badge claims. It does not claim GiveWell's underlying
    // costing is recent; the caveats say plainly that it dates from 2020.
    lastVerified: "2026-09-02",
    learnMoreIntro:
      "Hundreds of millions of children carry parasitic worms picked up from contaminated soil. Heavy infections cause anaemia, stunting and missed school. Most infections are light and do little harm, which is why the case rests on treating whole schools cheaply, with a single tablet, rather than trying to find the few children who are badly affected.",
    learnMore: [
      {
        title: "Soil-transmitted helminth infections",
        source: "World Health Organization",
        url: "https://www.who.int/news-room/fact-sheets/detail/soil-transmitted-helminth-infections",
        note: "What the worms are, who carries them, and how mass treatment works.",
      },
      {
        title: "Deworming",
        source: "GiveWell",
        url: "https://www.givewell.org/international/technical/programs/deworming",
        note: "The contested long-run evidence, laid out by the evaluator that funds it anyway.",
      },
      {
        title: "Deworm the World",
        source: "Evidence Action",
        url: "https://www.evidenceaction.org/dewormtheworld",
        note: "The program page: countries, scale, and how school-based delivery works.",
      },
    ],
  },

];

/**
 * Cause ids that have been renamed, old -> current.
 *
 * A cause id is not just an internal key. It is the URL someone bookmarked,
 * the /share/ path in a link already posted, the og/<id>.png a social card is
 * still hotlinking, and the cause_id written against every donation ever
 * recorded for it. Renaming one without leaving a forwarding address breaks
 * all four silently — the old link doesn't 404, it quietly lands you on the
 * home page, which is worse.
 *
 * So renames go in here and stay here. Entries are never removed: the cost of
 * keeping one is two lines, and the cost of dropping one is a dead link
 * somebody else is still holding.
 */
/**
 * `cardOutcome` — what defaultAmount buys, as a noun phrase for the grid.
 *
 * Not derived from the tier's outcomeText, which is a full sentence and reads
 * as one. A card has room for a fragment, and the job here is to turn browsing
 * into choosing: a label and a tagline ask for a click on faith.
 */

/**
 * `seoTitle` — the page title, written as the thing someone types into a
 * search box rather than as the name of the thing we happen to have. "The most
 * effective malaria charity" is a query; "Against Malaria Foundation · Global
 * Health" is a filing label, and nobody searches for a filing label.
 */

/**
 * `estimateNote` — the one place a cause's figures get their caveat.
 *
 * Three causes need the reader to know something before they choose an amount:
 * the number is the charity's own, or it is an expected value, or the tiers are
 * illustrative. That used to be repeated on every outcome line, which made it
 * wallpaper. It renders once, above the button, and nowhere else.
 */
export const CAUSE_ALIASES = {
  "global-health": "malaria-nets",
  "disease-prevention": "malaria-medicine",
  "child-nutrition": "child-survival",
  "direct-cash": "extreme-poverty",
  deworming: "intestinal-worms",
  "lead-exposure": "lead-poisoning",
};

/** The evaluator's short name, for surfaces with no room for the full one. */
export function evaluatorShort(charity) {
  return evaluators.find((e) => e.name === charity.evaluator)?.short ?? charity.evaluator;
}

/** The current id for a slug, following one rename hop. */
export function resolveCauseId(id) {
  return CAUSE_ALIASES[id] ?? id;
}

/**
 * Look up a single cause by its URL slug, current or retired.
 * Returns undefined for ids that were never ours.
 */
export function getCharityById(id) {
  const current = resolveCauseId(id);
  return charities.find((c) => c.id === current);
}

/**
 * The tier a cause opens on.
 *
 * Explicit per cause, because position isn't a rule — it's a coincidence that
 * held until GiveDirectly's tiers went 100/500/1000 and "the middle one" put a
 * $500 button in front of someone who hadn't touched anything yet.
 *
 * Falls back to the middle tier if defaultAmount is missing or no longer
 * matches a tier, so a mistyped figure degrades instead of crashing.
 */
export function getDefaultLevel(charity) {
  const named = charity.givingLevels.find((l) => l.amount === charity.defaultAmount);
  return named ?? charity.givingLevels[Math.floor(charity.givingLevels.length / 2)];
}
