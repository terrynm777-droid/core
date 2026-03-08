export type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
};

export type LessonVisual = {
  src: string;
  alt: string;
  caption?: string;
};

export type LessonContent = {
  slug: string;
  title: string;
  desc: string;
  title_ja: string;
  desc_ja: string;
  body_en: string[];
  body_ja: string[];
  example_en: string;
  example_ja: string;
  mistake_en: string;
  mistake_ja: string;
  quickCheck: QuizQuestion;
  visuals?: LessonVisual[];
};

export type LevelContent = {
  id: string;
  title: string;
  desc: string;
  title_ja: string;
  desc_ja: string;
  lessons: LessonContent[];
  levelQuiz: QuizQuestion[];
};

export const coreLearnContent: LevelContent[] = [
  {
    id: "level-0",
    title: "Level 0 — What Stocks Even Are",
    desc: "Absolute zero. Understand what stocks are before anything else.",
    title_ja: "レベル0 — 株とは何か",
    desc_ja: "完全初心者向け。まずは株式そのものを理解する。",
    lessons: [
      {
        slug: "what-is-a-stock",
        title: "What is a stock?",
        desc: "Understand ownership, shares, and why stocks exist.",
        title_ja: "株とは何か？",
        desc_ja: "所有権、株式、そして株が存在する理由を理解する。",
        body_en: [
          "A stock is a small piece of ownership in a company.",
          "When you buy one share, you are buying a claim on part of that business.",
          "If the company grows and becomes more valuable, investors may be willing to pay more for that ownership.",
          "Stocks represent real businesses, not just numbers moving on a screen."
        ],
        body_ja: [
          "株とは、会社の所有権の一部です。",
          "1株を買うということは、その会社の一部に対する権利を買うことです。",
          "会社が成長し価値が高まれば、その所有権により高い価格がつくことがあります。",
          "株は画面上の数字ではなく、実際の事業を表しています。"
        ],
        example_en: "If you own Apple stock, you own a tiny fraction of Apple.",
        example_ja: "Appleの株を持つということは、Appleのごく小さな一部を持つということです。",
        mistake_en: "A common mistake is thinking a stock is just a chart. Ownership comes first.",
        mistake_ja: "よくある間違いは、株をただのチャートだと思うことです。まず所有権です。",
        quickCheck: {
          question: "What are you buying when you buy a stock?",
          options: [
            "A company’s debt",
            "A piece of ownership in a company",
            "A government guarantee",
            "A fixed savings product"
          ],
          answerIndex: 1
        },
        visuals: []
      },
      {
        slug: "why-companies-go-public",
        title: "Why do companies issue stock?",
        desc: "Why companies raise money and why investors buy in.",
        title_ja: "なぜ会社は株を発行するのか？",
        desc_ja: "会社が資金を集める理由と、投資家が株を買う理由を学ぶ。",
        body_en: [
          "Companies issue stock to raise capital.",
          "That money can be used to expand, hire, build products, or enter new markets.",
          "Investors buy stock because they believe the company can grow in value.",
          "The company gets money. Investors get ownership."
        ],
        body_ja: [
          "会社は資金調達のために株を発行します。",
          "その資金は、拡大、人材採用、製品開発、新市場進出などに使われます。",
          "投資家は、その会社の価値が将来高まると考えるため株を買います。",
          "会社は資金を得て、投資家は所有権を得ます。"
        ],
        example_en: "A company may raise money from the stock market to fund expansion.",
        example_ja: "会社は事業拡大のために株式市場から資金を集めることがあります。",
        mistake_en: "Issuing stock does not automatically mean a company is strong.",
        mistake_ja: "株を発行しているからといって、その会社が強いとは限りません。",
        quickCheck: {
          question: "Why do companies issue stock?",
          options: [
            "To raise capital",
            "To eliminate risk",
            "To guarantee profit",
            "To avoid employees"
          ],
          answerIndex: 0
        },
        visuals: []
      },
      {
        slug: "what-is-an-exchange",
        title: "What is an exchange?",
        desc: "Understand where stocks trade and how markets are organized.",
        title_ja: "取引所とは何か？",
        desc_ja: "株がどこで取引され、市場がどう成り立っているかを理解する。",
        body_en: [
          "An exchange is a marketplace where buyers and sellers trade stocks.",
          "Examples include NYSE, NASDAQ, and the Tokyo Stock Exchange.",
          "Exchanges organize price discovery and transactions.",
          "Most people access exchanges through brokers."
        ],
        body_ja: [
          "取引所とは、買い手と売り手が株を売買する市場です。",
          "例として、NYSE、NASDAQ、東京証券取引所があります。",
          "取引所は価格形成と売買の仕組みを整理します。",
          "多くの個人投資家は証券会社を通じて取引所にアクセスします。"
        ],
        example_en: "A stock listed in Tokyo trades on the Tokyo Stock Exchange.",
        example_ja: "東京に上場している株は、東京証券取引所で取引されます。",
        mistake_en: "Do not confuse a broker with an exchange.",
        mistake_ja: "証券会社と取引所を混同しないでください。",
        quickCheck: {
          question: "What does an exchange do?",
          options: [
            "Organizes stock trading between buyers and sellers",
            "Guarantees profits",
            "Prints company products",
            "Removes all risk"
          ],
          answerIndex: 0
        },
        visuals: []
      }
    ],
    levelQuiz: [
      {
        question: "What is a stock?",
        options: [
          "A loan to the government",
          "A piece of ownership in a company",
          "A type of savings account",
          "A tax payment"
        ],
        answerIndex: 1
      },
      {
        question: "Why do companies issue stock?",
        options: [
          "To raise capital",
          "To eliminate costs",
          "To guarantee success",
          "To avoid customers"
        ],
        answerIndex: 0
      },
      {
        question: "What is an exchange?",
        options: [
          "A place where stocks are traded",
          "A private savings vault",
          "A company’s office",
          "A tax agency"
        ],
        answerIndex: 0
      }
    ]
  },
  {
    id: "level-1",
    title: "Level 1 — First Market Literacy",
    desc: "Basic market terms that stop you from being completely lost.",
    title_ja: "レベル1 — 市場の基本用語",
    desc_ja: "完全に迷わないための基本的な市場用語を学ぶ。",
    lessons: [
      {
        slug: "market-cap",
        title: "Market cap",
        desc: "What market capitalization means and why it matters.",
        title_ja: "時価総額",
        desc_ja: "時価総額の意味と、なぜ重要なのかを理解する。",
        body_en: [
          "Market cap means market capitalization.",
          "It is stock price multiplied by shares outstanding.",
          "It reflects the market’s total valuation of the company.",
          "A lower stock price does not automatically mean a company is cheaper."
        ],
        body_ja: [
          "時価総額とは、市場全体がその会社に付けている価値です。",
          "株価 × 発行済株式数 で計算されます。",
          "これは会社全体の評価額を示します。",
          "株価が低いから安いとは限りません。"
        ],
        example_en: "A $10 stock can still be a larger company than a $300 stock.",
        example_ja: "10ドルの株でも、300ドルの株より大きい会社であることがあります。",
        mistake_en: "Do not judge value only by the sticker price of one share.",
        mistake_ja: "1株の値段だけで価値を判断しないでください。",
        quickCheck: {
          question: "How is market cap calculated?",
          options: [
            "Revenue × profit",
            "Stock price × shares outstanding",
            "Cash × debt",
            "Profit × employees"
          ],
          answerIndex: 1
        },
        visuals: []
      },
      {
        slug: "etf-basics",
        title: "ETF basics",
        desc: "What ETFs are and how they differ from individual stocks.",
        title_ja: "ETFの基礎",
        desc_ja: "ETFとは何か、個別株とどう違うのかを学ぶ。",
        body_en: [
          "An ETF is a fund that trades like a stock.",
          "It can hold many assets at once, such as many stocks.",
          "ETFs are often used for diversification and simplicity.",
          "Some ETFs are broad and stable, while others are narrow and risky."
        ],
        body_ja: [
          "ETFは、株のように売買できるファンドです。",
          "1つのETFで複数の資産に投資できます。",
          "ETFは分散投資とシンプルさのためによく使われます。",
          "ただし、ETFにも広く安定したものと、狭く高リスクなものがあります。"
        ],
        example_en: "An S&P 500 ETF gives you exposure to many large U.S. companies.",
        example_ja: "S&P500 ETFを買えば、多くの米国大型企業にまとめて投資できます。",
        mistake_en: "Do not assume every ETF is automatically safe.",
        mistake_ja: "すべてのETFが自動的に安全だと思わないでください。",
        quickCheck: {
          question: "What is one advantage of an ETF?",
          options: [
            "It can hold many assets",
            "It cannot fall in price",
            "It guarantees profit",
            "It does not trade"
          ],
          answerIndex: 0
        },
        visuals: []
      },
      {
        slug: "volume-and-volatility",
        title: "Volume and volatility",
        desc: "Read basic activity and movement in the market.",
        title_ja: "出来高とボラティリティ",
        desc_ja: "市場での取引量と値動きの大きさを理解する。",
        body_en: [
          "Volume is how many shares traded.",
          "Volatility is how much price moves.",
          "High volume can signal strong participation.",
          "High volatility means bigger price swings and usually more risk."
        ],
        body_ja: [
          "出来高は取引された株数です。",
          "ボラティリティは価格変動の大きさです。",
          "出来高が多いと参加者が多い可能性があります。",
          "ボラティリティが高いと、値動きが大きくリスクも高くなりやすいです。"
        ],
        example_en: "A stock jumping 8% on high volume often means something important happened.",
        example_ja: "高い出来高を伴って8%上昇する株は、重要な出来事が起きた可能性があります。",
        mistake_en: "Do not chase volatility just because it looks exciting.",
        mistake_ja: "激しい値動きだけを見て飛びつかないでください。",
        quickCheck: {
          question: "What does volatility describe?",
          options: [
            "How many employees a company has",
            "How much the stock price moves",
            "How old a company is",
            "How much tax it pays"
          ],
          answerIndex: 1
        },
        visuals: []
      }
    ],
    levelQuiz: [
      {
        question: "What does market cap represent?",
        options: [
          "One share’s dividend",
          "The company’s total market value",
          "The company’s debt only",
          "The CEO’s salary"
        ],
        answerIndex: 1
      },
      {
        question: "What is an ETF?",
        options: [
          "A tax document",
          "A fund that trades like a stock",
          "A type of company loan",
          "A fixed-interest bond"
        ],
        answerIndex: 1
      },
      {
        question: "What does high volatility usually mean?",
        options: [
          "Smaller price movement",
          "Bigger price movement",
          "Guaranteed return",
          "No risk"
        ],
        answerIndex: 1
      }
    ]
  },
  {
    id: "level-2",
    title: "Level 2 — Reading a Stock",
    desc: "Understand the basic information people look at when studying a stock.",
    title_ja: "レベル2 — 株を読む",
    desc_ja: "株を見るときに何を確認するのか、その基本を学ぶ。",
    lessons: [
      {
        slug: "earnings-basics",
        title: "Earnings basics",
        desc: "Revenue, profit, expectations, and why earnings matter.",
        title_ja: "決算の基礎",
        desc_ja: "売上、利益、期待値、そして決算が重要な理由を学ぶ。",
        body_en: [
          "Earnings are the financial results a company reports.",
          "Investors look at revenue, profit, margins, and guidance.",
          "Stocks often move not just on the result itself, but on whether the result beat or missed expectations.",
          "A company can grow revenue and still disappoint the market if expectations were even higher."
        ],
        body_ja: [
          "決算とは、会社が発表する財務結果のことです。",
          "投資家は売上、利益、利益率、ガイダンスを見ます。",
          "株価は結果そのものだけでなく、市場予想を上回ったか下回ったかでも動きます。",
          "売上が成長していても、期待が高すぎると株価が下がることがあります。"
        ],
        example_en: "A company reports strong profit growth, but the stock still falls because guidance was weak.",
        example_ja: "利益が大きく伸びても、今後の見通しが弱ければ株価が下がることがあります。",
        mistake_en: "Do not assume “good results” automatically means the stock must rise.",
        mistake_ja: "「良い決算なら必ず上がる」と思い込まないでください。",
        quickCheck: {
          question: "Why can a stock fall even after a good earnings report?",
          options: [
            "Because expectations were higher",
            "Because earnings never matter",
            "Because revenue is illegal",
            "Because exchanges reject profit"
          ],
          answerIndex: 0
        },
        visuals: []
      },
      {
        slug: "news-and-catalysts",
        title: "News and catalysts",
        desc: "How headlines move stocks and what actually matters.",
        title_ja: "ニュースと材料",
        desc_ja: "ニュースが株をどう動かすのか、本当に重要な材料は何かを学ぶ。",
        body_en: [
          "A catalyst is an event that can change how investors view a stock.",
          "Examples include earnings, product launches, regulation, lawsuits, macro data, and M&A.",
          "Not all news matters equally. Some headlines are noise, others change the company’s future.",
          "The key question is not “is this news?” but “does this change value, risk, or expectations?”"
        ],
        body_ja: [
          "材料とは、投資家の見方を変える可能性のある出来事です。",
          "例として、決算、新製品、規制、訴訟、マクロ経済指標、M&Aがあります。",
          "すべてのニュースが同じ重みを持つわけではありません。",
          "重要なのは「ニュースかどうか」ではなく、「価値・リスク・期待を変えるかどうか」です。"
        ],
        example_en: "A small PR update may not matter, but a major earnings surprise or regulation change can matter a lot.",
        example_ja: "小さな広報発表は重要でないこともありますが、大きな決算サプライズや規制変更は重要です。",
        mistake_en: "Beginners often react to every headline instead of judging importance.",
        mistake_ja: "初心者は重要度を見ずに、すべての見出しに反応しがちです。",
        quickCheck: {
          question: "What makes a catalyst important?",
          options: [
            "It changes value, risk, or expectations",
            "It is long",
            "It uses complex words",
            "It appears on social media"
          ],
          answerIndex: 0
        },
        visuals: []
      },
      {
        slug: "basic-chart-reading",
        title: "Basic chart reading",
        desc: "What a chart can and cannot tell you.",
        title_ja: "チャートの基本",
        desc_ja: "チャートで分かること、分からないことを学ぶ。",
        body_en: [
          "A chart shows price history, not certainty about the future.",
          "Charts can help you see trend, momentum, volatility, and key levels.",
          "They do not tell you the quality of a business by themselves.",
          "Charts are useful tools, but they should not replace thinking."
        ],
        body_ja: [
          "チャートは過去の価格推移を示すものであり、未来を保証するものではありません。",
          "チャートからはトレンド、勢い、ボラティリティ、重要な価格帯が見えます。",
          "ただし、それだけで会社の質までは分かりません。",
          "チャートは便利な道具ですが、思考の代わりにはなりません。"
        ],
        example_en: "A chart may show a strong uptrend, but you still need to understand why the stock is moving.",
        example_ja: "チャートが強い上昇トレンドを示していても、なぜ上がっているのかを理解する必要があります。",
        mistake_en: "Do not treat chart patterns like magic guarantees.",
        mistake_ja: "チャートパターンを魔法の保証のように扱わないでください。",
        quickCheck: {
          question: "What does a chart mainly show?",
          options: [
            "Price history",
            "Guaranteed future returns",
            "Company ethics",
            "Tax law"
          ],
          answerIndex: 0
        },
        visuals: []
      }
    ],
    levelQuiz: [
      {
        question: "Why do stocks react to earnings?",
        options: [
          "Because earnings affect expectations",
          "Because earnings are meaningless",
          "Because all profits are the same",
          "Because charts disappear"
        ],
        answerIndex: 0
      },
      {
        question: "What makes a news catalyst important?",
        options: [
          "It changes value, risk, or expectations",
          "It is exciting",
          "It is long",
          "It has many numbers"
        ],
        answerIndex: 0
      },
      {
        question: "What can charts help you see?",
        options: [
          "Trend and volatility",
          "Guaranteed future price",
          "Management honesty only",
          "Tax refunds"
        ],
        answerIndex: 0
      }
    ]
  },
  {
    id: "level-3",
    title: "Level 3 — Beginner Decision-Making",
    desc: "Learn to think before acting and avoid stupid early mistakes.",
    title_ja: "レベル3 — 初心者の意思決定",
    desc_ja: "行動する前に考え、初歩的な失敗を避ける方法を学ぶ。",
    lessons: [
      {
        slug: "risk-first",
        title: "Risk first",
        desc: "Why protecting downside matters more than sounding smart.",
        title_ja: "まずリスク",
        desc_ja: "賢く見えることより、下振れを守ることが重要な理由を学ぶ。",
        body_en: [
          "Most beginners focus too much on upside and not enough on downside.",
          "The first question should not be “how much can I make?” but “what can go wrong?”",
          "Good investing starts with survival and discipline.",
          "A bad loss can damage both capital and confidence."
        ],
        body_ja: [
          "多くの初心者は上昇余地ばかり見て、下落リスクを見ません。",
          "最初に考えるべきは「いくら儲かるか」ではなく「何が間違うか」です。",
          "良い投資は、生き残ることと規律から始まります。",
          "大きな損失は資金だけでなく自信も傷つけます。"
        ],
        example_en: "A stock may have upside, but if one bad event can crush it, you must respect that risk.",
        example_ja: "上昇余地があっても、1つの悪材料で大きく崩れるなら、そのリスクを重く見る必要があります。",
        mistake_en: "Do not build decisions around best-case fantasy.",
        mistake_ja: "最良ケースの妄想だけで判断しないでください。",
        quickCheck: {
          question: "What should come first in decision-making?",
          options: [
            "Risk",
            "Hype",
            "Excitement",
            "Random tips"
          ],
          answerIndex: 0
        },
        visuals: []
      },
      {
        slug: "position-sizing",
        title: "Position sizing",
        desc: "Why size matters even if your idea is good.",
        title_ja: "ポジションサイズ",
        desc_ja: "アイデアが良くてもサイズが重要な理由を学ぶ。",
        body_en: [
          "Position sizing means how much of your money you allocate to one idea.",
          "Even a good idea can hurt you if the position is too large.",
          "Sizing is a risk decision, not just a confidence decision.",
          "Strong investors protect themselves by controlling size."
        ],
        body_ja: [
          "ポジションサイズとは、1つのアイデアにどれだけ資金を配分するかです。",
          "良いアイデアでも、サイズが大きすぎれば傷つくことがあります。",
          "サイズは自信ではなくリスク管理の判断です。",
          "強い投資家は、サイズを管理して自分を守ります。"
        ],
        example_en: "Putting 5% into an idea is very different from putting 60% into it.",
        example_ja: "1つのアイデアに5%入れるのと、60%入れるのでは意味が全く違います。",
        mistake_en: "Beginners often size based on emotion instead of risk.",
        mistake_ja: "初心者はリスクではなく感情でサイズを決めがちです。",
        quickCheck: {
          question: "What is position sizing?",
          options: [
            "How much money you put into one idea",
            "How many apps you use",
            "How big the company office is",
            "How often you trade each hour"
          ],
          answerIndex: 0
        },
        visuals: []
      },
      {
        slug: "fomo-and-bad-decisions",
        title: "FOMO and bad decisions",
        desc: "How people get trapped by hype and noise.",
        title_ja: "FOMOと悪い判断",
        desc_ja: "人がどうやって熱狂や雑音に巻き込まれるかを学ぶ。",
        body_en: [
          "FOMO means fear of missing out.",
          "It pushes people to buy because others are excited, not because they understand the situation.",
          "This often leads to late entries, poor sizing, and emotional mistakes.",
          "A calm process beats panic and chasing."
        ],
        body_ja: [
          "FOMOとは、取り残されることへの恐れです。",
          "理解しているから買うのではなく、周りが興奮しているから買ってしまう状態です。",
          "その結果、遅いエントリー、悪いサイズ、感情的な失敗につながりやすくなります。",
          "落ち着いたプロセスは、焦りや追いかけより強いです。"
        ],
        example_en: "Buying after a stock already exploded just because everyone online is talking about it is classic FOMO.",
        example_ja: "株がすでに急騰した後に、ネットが盛り上がっているという理由だけで買うのは典型的なFOMOです。",
        mistake_en: "Do not confuse urgency with quality.",
        mistake_ja: "緊急性と質を混同しないでください。",
        quickCheck: {
          question: "What does FOMO often cause?",
          options: [
            "Better discipline",
            "Late and emotional decisions",
            "Guaranteed returns",
            "Lower risk"
          ],
          answerIndex: 1
        },
        visuals: []
      }
    ],
    levelQuiz: [
      {
        question: "What should you think about before upside?",
        options: [
          "Risk",
          "Popularity",
          "Noise",
          "Speed"
        ],
        answerIndex: 0
      },
      {
        question: "Why does position sizing matter?",
        options: [
          "Because size changes risk",
          "Because bigger is always better",
          "Because charts demand it",
          "Because everyone does it"
        ],
        answerIndex: 0
      },
      {
        question: "What is FOMO?",
        options: [
          "Fear of missing out",
          "A valuation model",
          "A tax rule",
          "An exchange"
        ],
        answerIndex: 0
      }
    ]
  },
  {
    id: "level-4",
    title: "Level 4 — Starter Practice",
    desc: "Start applying beginner knowledge to simple stock thinking.",
    title_ja: "レベル4 — 初歩の実践",
    desc_ja: "学んだ知識を簡単な株の考え方に応用し始める。",
    lessons: [
      {
        slug: "compare-two-stocks",
        title: "Compare two stocks",
        desc: "Start comparing businesses instead of looking at random tickers.",
        title_ja: "2つの株を比較する",
        desc_ja: "ランダムに見るのではなく、会社同士を比較し始める。",
        body_en: [
          "A basic stock decision is often comparative.",
          "Instead of asking whether one stock is 'good', compare two businesses on size, growth, risk, and story.",
          "Comparison helps you think more clearly.",
          "It trains you to judge relative strength instead of reacting blindly."
        ],
        body_ja: [
          "基本的な株の判断は、比較から始まることが多いです。",
          "1つの株が良いかどうかだけでなく、2社を規模、成長、リスク、ストーリーで比べてみましょう。",
          "比較は思考を明確にします。",
          "盲目的に反応するのではなく、相対的な強さを判断する訓練になります。"
        ],
        example_en: "Compare two companies in the same sector and ask which one has stronger growth and lower risk.",
        example_ja: "同じセクターの2社を比べ、どちらがより強い成長と低いリスクを持つか考えます。",
        mistake_en: "Do not compare only stock price.",
        mistake_ja: "株価だけで比較しないでください。",
        quickCheck: {
          question: "What helps beginner stock thinking?",
          options: [
            "Comparing companies",
            "Ignoring all context",
            "Buying every rumor",
            "Following random hype"
          ],
          answerIndex: 0
        },
        visuals: []
      },
      {
        slug: "read-a-simple-headline",
        title: "Read a simple headline",
        desc: "Learn to ask whether a headline matters or is just noise.",
        title_ja: "シンプルな見出しを読む",
        desc_ja: "見出しが重要なのか、ただの雑音なのかを考える。",
        body_en: [
          "Not every headline deserves a trade or investment decision.",
          "A useful beginner habit is to ask: what changed, and does it matter?",
          "Headlines can affect expectations, but some are only short-term noise.",
          "Context matters more than excitement."
        ],
        body_ja: [
          "すべての見出しが売買判断に値するわけではありません。",
          "初心者に有効な習慣は、『何が変わったのか、それは重要か』と考えることです。",
          "見出しは期待を動かしますが、短期的な雑音にすぎないこともあります。",
          "興奮より文脈が重要です。"
        ],
        example_en: "A major regulation headline may matter far more than a vague rumor article.",
        example_ja: "大きな規制変更のニュースは、あいまいな噂記事よりはるかに重要なことがあります。",
        mistake_en: "Do not let a dramatic headline replace actual thinking.",
        mistake_ja: "刺激的な見出しに思考を乗っ取られないでください。",
        quickCheck: {
          question: "What should you ask when reading a headline?",
          options: [
            "What changed, and does it matter?",
            "How exciting is it?",
            "How long is it?",
            "How many people reposted it?"
          ],
          answerIndex: 0
        },
        visuals: []
      },
      {
        slug: "buy-avoid-wait",
        title: "Buy, avoid, or wait",
        desc: "Beginner judgment is often about choosing patience over impulse.",
        title_ja: "買う・避ける・待つ",
        desc_ja: "初心者の判断は、衝動より待つことを選べるかどうかでもある。",
        body_en: [
          "Not every decision must end with buying.",
          "Sometimes the best beginner decision is to avoid or wait.",
          "Waiting is not weakness. It is discipline when the setup or understanding is not strong enough.",
          "A simple framework is: buy, avoid, or wait."
        ],
        body_ja: [
          "すべての判断が『買う』で終わる必要はありません。",
          "初心者にとって最善なのは、避けるか待つことの場合もあります。",
          "待つことは弱さではなく、理解や状況が十分でないときの規律です。",
          "シンプルな判断枠組みは『買う・避ける・待つ』です。"
        ],
        example_en: "If you do not understand the business or risk, 'wait' is often the right answer.",
        example_ja: "事業やリスクが理解できていないなら、『待つ』が正しい答えであることが多いです。",
        mistake_en: "Do not force action just because you feel like you should do something.",
        mistake_ja: "何かしなければと思って無理に行動しないでください。",
        quickCheck: {
          question: "Which choice is sometimes the best beginner decision?",
          options: [
            "Wait",
            "Always buy",
            "Always sell",
            "Always copy others"
          ],
          answerIndex: 0
        },
        visuals: []
      }
    ],
    levelQuiz: [
      {
        question: "What is useful when comparing stocks?",
        options: [
          "Comparing businesses on real factors",
          "Looking only at share price",
          "Ignoring risk",
          "Copying strangers"
        ],
        answerIndex: 0
      },
      {
        question: "What should you ask about a headline?",
        options: [
          "What changed, and does it matter?",
          "Is it dramatic?",
          "Is it viral?",
          "Is it short?"
        ],
        answerIndex: 0
      },
      {
        question: "What is often a disciplined decision?",
        options: [
          "Wait",
          "Chase faster",
          "Force action",
          "Buy blindly"
        ],
        answerIndex: 0
      }
    ]
  }
];