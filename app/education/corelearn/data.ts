export const coreLearnLevels = [
  {
    id: "level-0",
    title: "Level 0 — What Stocks Even Are",
    desc: "Absolute zero. What a stock is, why markets exist, and how people even start.",
    lessons: [
      {
        slug: "what-is-a-stock",
        title: "What is a stock?",
        desc: "Understand ownership, shares, and why stocks exist.",
      },
      {
        slug: "why-companies-go-public",
        title: "Why do companies issue stock?",
        desc: "Why companies raise money and why investors buy in.",
      },
      {
        slug: "what-is-an-exchange",
        title: "What is an exchange?",
        desc: "Understand where stocks trade and how markets are organized.",
      },
    ],
  },
  {
    id: "level-1",
    title: "Level 1 — First Market Literacy",
    desc: "Basic terms like market cap, ETF, volume, volatility, exchange, broker, and order types.",
    lessons: [
      {
        slug: "market-cap",
        title: "Market cap",
        desc: "What market capitalization means and why it matters.",
      },
      {
        slug: "etf-basics",
        title: "ETF basics",
        desc: "What ETFs are and how they differ from individual stocks.",
      },
      {
        slug: "volume-and-volatility",
        title: "Volume and volatility",
        desc: "Read basic activity and movement in the market.",
      },
    ],
  },
  {
    id: "level-2",
    title: "Level 2 — Reading a Stock",
    desc: "How to understand a stock page, earnings, headlines, charts, and basic company metrics.",
    lessons: [
      {
        slug: "earnings-basics",
        title: "Earnings basics",
        desc: "Revenue, profit, expectations, and why earnings matter.",
      },
      {
        slug: "news-and-catalysts",
        title: "News and catalysts",
        desc: "How headlines move stocks and what actually matters.",
      },
      {
        slug: "basic-chart-reading",
        title: "Basic chart reading",
        desc: "What a chart can and cannot tell you.",
      },
    ],
  },
  {
    id: "level-3",
    title: "Level 3 — Beginner Decision-Making",
    desc: "Why people buy, why people lose, how risk works, and how to think before acting.",
    lessons: [
      {
        slug: "risk-first",
        title: "Risk first",
        desc: "Why protecting downside matters more than sounding smart.",
      },
      {
        slug: "position-sizing",
        title: "Position sizing",
        desc: "Why size matters even if your idea is good.",
      },
      {
        slug: "fomo-and-bad-decisions",
        title: "FOMO and bad decisions",
        desc: "How people get trapped by hype and noise.",
      },
    ],
  },
] as const;