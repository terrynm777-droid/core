export type QuizQuestion = {
  question: string;
  questionJa?: string;
  options: string[];
  optionsJa?: string[];
  answerIndex: number;
  explanation?: string;
  explanationJa?: string;
};

export type LessonVisual = {
  src: string;
  srcJa?: string;
  alt: string;
  altJa?: string;
  caption?: string;
  captionJa?: string;
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

export const CORELEARN_DISCLAIMER_EN =
  "Educational purposes only. This content is general education and is not financial advice, investment advice, or a recommendation to buy, sell, or take any position. Examples are simplified for learning and do not represent real investment guidance.";

export const CORELEARN_DISCLAIMER_JA =
  "教育目的のみの内容です。これは一般的な学習コンテンツであり、金融アドバイス、投資助言、または売買や特定のポジション取得を勧めるものではありません。例は学習用に単純化されており、実際の投資助言ではありません。";

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
          CORELEARN_DISCLAIMER_EN,
          "A stock is a small piece of ownership in a company.",
          "When you buy one share, you are buying a claim on part of that business.",
          "If the company grows and becomes more valuable, investors may be willing to pay more for that ownership.",
          "Stocks represent real businesses, not just numbers moving on a screen."
        ],
        body_ja: [
          CORELEARN_DISCLAIMER_JA,
          "株とは、会社の所有権の一部です。",
          "1株を持つということは、その会社の一部に対する権利を持つことです。",
          "会社が成長し価値が高まれば、その所有権により高い価格がつくことがあります。",
          "株は画面上の数字ではなく、実際の事業を表しています。"
        ],
        example_en: "If you own Apple stock, you own a tiny fraction of Apple.",
        example_ja: "Appleの株を持つということは、Appleのごく小さな一部を持つということです。",
        mistake_en: "A common mistake is thinking a stock is just a chart. Ownership comes first.",
        mistake_ja: "よくある間違いは、株をただのチャートだと思うことです。まず所有権です。",
        quickCheck: {
          question: "What are you getting when you own a stock?",
          questionJa: "株を持つと、何を持つことになりますか？",
          options: [
            "A company’s debt",
            "A piece of ownership in a company",
            "A government guarantee",
            "A fixed savings product"
          ],
          optionsJa: [
            "会社の借金",
            "会社の所有権の一部",
            "政府の保証",
            "固定型の貯蓄商品"
          ],
          answerIndex: 1,
          explanation: "A stock represents ownership, not debt or a guaranteed product.",
          explanationJa: "株は借金や保証商品ではなく、所有権を表します。"
        },
        visuals: []
      },
      {
        slug: "why-companies-go-public",
        title: "Why do companies issue stock?",
        desc: "Why companies raise money and why investors participate.",
        title_ja: "なぜ会社は株を発行するのか？",
        desc_ja: "会社が資金を集める理由と、市場参加者が注目する理由を学ぶ。",
        body_en: [
          CORELEARN_DISCLAIMER_EN,
          "Companies issue stock to raise capital.",
          "That money can be used to expand, hire, build products, or enter new markets.",
          "People follow stock issuance because it affects ownership, growth plans, and future expectations.",
          "The company gets capital, and shareholders receive ownership."
        ],
        body_ja: [
          CORELEARN_DISCLAIMER_JA,
          "会社は資金調達のために株を発行します。",
          "その資金は、拡大、人材採用、製品開発、新市場進出などに使われます。",
          "株の発行は、所有権、成長計画、将来期待に影響するため注目されます。",
          "会社は資金を得て、株主は所有権を得ます。"
        ],
        example_en: "A company may raise money from the stock market to fund expansion.",
        example_ja: "会社は事業拡大のために株式市場から資金を集めることがあります。",
        mistake_en: "Issuing stock does not automatically mean a company is strong.",
        mistake_ja: "株を発行しているからといって、その会社が強いとは限りません。",
        quickCheck: {
          question: "Why do companies issue stock?",
          questionJa: "なぜ会社は株を発行するのですか？",
          options: [
            "To raise capital",
            "To eliminate risk",
            "To guarantee profit",
            "To avoid employees"
          ],
          optionsJa: [
            "資金を集めるため",
            "リスクをなくすため",
            "利益を保証するため",
            "従業員を避けるため"
          ],
          answerIndex: 0,
          explanation: "Issuing stock is mainly a way to raise money for the business.",
          explanationJa: "株の発行は、主に事業のための資金調達手段です。"
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
          CORELEARN_DISCLAIMER_EN,
          "An exchange is a marketplace where buyers and sellers trade stocks.",
          "Examples include NYSE, NASDAQ, and the Tokyo Stock Exchange.",
          "Exchanges help organize price discovery and transactions.",
          "Most individuals access exchanges through brokers."
        ],
        body_ja: [
          CORELEARN_DISCLAIMER_JA,
          "取引所とは、買い手と売り手が株を売買する市場です。",
          "例として、NYSE、NASDAQ、東京証券取引所があります。",
          "取引所は価格形成と売買の仕組みを整理します。",
          "多くの個人参加者は証券会社を通じて取引所にアクセスします。"
        ],
        example_en: "A stock listed in Tokyo trades on the Tokyo Stock Exchange.",
        example_ja: "東京に上場している株は、東京証券取引所で取引されます。",
        mistake_en: "Do not confuse a broker with an exchange.",
        mistake_ja: "証券会社と取引所を混同しないでください。",
        quickCheck: {
          question: "What does an exchange do?",
          questionJa: "取引所は何をしますか？",
          options: [
            "Organizes stock trading between buyers and sellers",
            "Guarantees profits",
            "Prints company products",
            "Removes all risk"
          ],
          optionsJa: [
            "買い手と売り手の株取引を整理する",
            "利益を保証する",
            "会社の商品を作る",
            "すべてのリスクをなくす"
          ],
          answerIndex: 0,
          explanation: "An exchange is a marketplace for trading, not a profit guarantee.",
          explanationJa: "取引所は利益保証ではなく、売買の市場です。"
        },
        visuals: []
      },
      {
        slug: "why-stock-prices-move-basic",
        title: "Why stock prices move",
        desc: "Understand supply, demand, and changing expectations at a basic level.",
        title_ja: "なぜ株価は動くのか",
        desc_ja: "需給と期待の変化という基本から株価の動きを理解する。",
        body_en: [
          CORELEARN_DISCLAIMER_EN,
          "Stock prices move because buyers and sellers disagree on value.",
          "New information can change expectations about growth, risk, or future profits.",
          "A price can rise even if the business is unchanged, if more people suddenly want exposure to it.",
          "Price movement is often a reaction to changing expectations rather than a simple fact."
        ],
        body_ja: [
          CORELEARN_DISCLAIMER_JA,
          "株価は、買い手と売り手が価値について異なる考えを持つことで動きます。",
          "新しい情報は、成長、リスク、将来利益への期待を変えることがあります。",
          "会社自体が変わっていなくても、持ちたい人が増えれば価格は上がることがあります。",
          "値動きは、単純な事実だけでなく期待の変化への反応で起こることが多いです。"
        ],
        example_en: "A strong earnings report can make people raise their expectations, pushing the stock price higher.",
        example_ja: "良い決算によって期待が上がり、株価が上昇することがあります。",
        mistake_en: "Do not assume price movement always means the business changed dramatically.",
        mistake_ja: "値動きが大きいからといって、事業そのものが大きく変わったとは限りません。",
        quickCheck: {
          question: "Why do stock prices move?",
          questionJa: "なぜ株価は動くのですか？",
          options: [
            "Because expectations and supply-demand change",
            "Because governments fix all stock prices",
            "Because stocks never react to information",
            "Because all market participants think the same way"
          ],
          optionsJa: [
            "期待や需給が変化するから",
            "政府がすべての株価を固定するから",
            "株は情報に反応しないから",
            "全員が同じ考えだから"
          ],
          answerIndex: 0,
          explanation: "Prices move when the market’s view of value changes.",
          explanationJa: "市場の価値判断が変わると価格も動きます。"
        },
        visuals: []
      }
    ],
    levelQuiz: [
      {
        question: "What is a stock?",
        questionJa: "株とは何ですか？",
        options: [
          "A loan to the government",
          "A piece of ownership in a company",
          "A type of savings account",
          "A tax payment"
        ],
        optionsJa: [
          "政府への貸付",
          "会社の所有権の一部",
          "貯蓄口座の一種",
          "税金の支払い"
        ],
        answerIndex: 1,
        explanation: "A stock represents ownership in a business.",
        explanationJa: "株は会社の所有権を表します。"
      },
      {
        question: "Why do companies issue stock?",
        questionJa: "なぜ会社は株を発行するのですか？",
        options: [
          "To raise capital",
          "To eliminate costs",
          "To guarantee success",
          "To avoid customers"
        ],
        optionsJa: [
          "資金を集めるため",
          "コストをなくすため",
          "成功を保証するため",
          "顧客を避けるため"
        ],
        answerIndex: 0,
        explanation: "Stock issuance helps companies raise money.",
        explanationJa: "株の発行は会社の資金調達に使われます。"
      },
      {
        question: "What is an exchange?",
        questionJa: "取引所とは何ですか？",
        options: [
          "A place where stocks are traded",
          "A private savings vault",
          "A company’s office",
          "A tax agency"
        ],
                optionsJa: [
          "株が取引される場所",
          "個人用の金庫",
          "会社のオフィス",
          "税務機関"
        ],
        answerIndex: 0,
        explanation: "Exchanges organize stock trading.",
        explanationJa: "取引所は株の売買を整理する市場です。"
      },
      {
        question: "Why do stock prices move?",
        questionJa: "なぜ株価は動くのですか？",
        options: [
          "Because expectations and supply-demand change",
          "Because governments fix all stock prices",
          "Because stocks never react to information",
          "Because all market participants think the same way"
        ],
        optionsJa: [
          "期待や需給が変化するから",
          "政府がすべての株価を固定するから",
          "株は情報に反応しないから",
          "全員が同じ考えだから"
        ],
        answerIndex: 0,
        explanation: "Prices move when the market’s view of value changes.",
        explanationJa: "市場の価値判断が変わると価格も動きます。"
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
          CORELEARN_DISCLAIMER_EN,
          "Market cap means market capitalization.",
          "It is stock price multiplied by shares outstanding.",
          "It reflects the market’s total valuation of the company.",
          "A lower stock price does not automatically mean a company is cheaper."
        ],
        body_ja: [
          CORELEARN_DISCLAIMER_JA,
          "時価総額とは、市場全体がその会社に付けている価値です。",
          "株価 × 発行済株式数で計算されます。",
          "これは会社全体の評価額を示します。",
          "株価が低いから安いとは限りません。"
        ],
        example_en: "A $10 stock can still be a larger company than a $300 stock.",
        example_ja: "10ドルの株でも、300ドルの株より大きい会社であることがあります。",
        mistake_en: "Do not judge value only by the sticker price of one share.",
        mistake_ja: "1株の値段だけで価値を判断しないでください。",
        quickCheck: {
          question: "How is market cap calculated?",
          questionJa: "時価総額はどう計算されますか？",
          options: [
            "Revenue × profit",
            "Stock price × shares outstanding",
            "Cash × debt",
            "Profit × employees"
          ],
          optionsJa: [
            "売上 × 利益",
            "株価 × 発行済株式数",
            "現金 × 借金",
            "利益 × 従業員数"
          ],
          answerIndex: 1,
          explanation: "Market cap is a total company value estimate based on price and share count.",
          explanationJa: "時価総額は、株価と株数から見る会社全体の評価です。"
        },
        visuals: []
      },
      {
        slug: "shares-outstanding",
        title: "Shares outstanding",
        desc: "Learn what shares outstanding means and why it matters.",
        title_ja: "発行済株式数",
        desc_ja: "発行済株式数の意味と、なぜ重要なのかを学ぶ。",
        body_en: [
          CORELEARN_DISCLAIMER_EN,
          "Shares outstanding means the total number of shares a company has issued that are currently held by investors.",
          "This number matters because it affects market cap and per-share metrics.",
          "Two companies can have very different share counts, which changes how price should be interpreted.",
          "Looking only at stock price without share count can create weak conclusions."
        ],
        body_ja: [
          CORELEARN_DISCLAIMER_JA,
          "発行済株式数とは、会社が発行し、現在投資家に保有されている株式の総数です。",
          "この数字は、時価総額や1株あたり指標に影響するため重要です。",
          "2社の株数が大きく違えば、株価の見方も変わります。",
          "株数を見ずに株価だけを見ると、弱い結論になりやすいです。"
        ],
        example_en: "A company with a low share price can still be very large if it has many shares outstanding.",
        example_ja: "株価が低くても、発行済株式数が多ければ大きな会社であることがあります。",
        mistake_en: "Do not assume a lower share price means a smaller or cheaper company.",
        mistake_ja: "株価が低いからといって、小さい会社や割安な会社だと決めつけないでください。",
        quickCheck: {
          question: "Why do shares outstanding matter?",
          questionJa: "なぜ発行済株式数が重要なのですか？",
          options: [
            "Because they affect market cap and per-share interpretation",
            "Because they guarantee profit",
            "Because they remove volatility",
            "Because they replace business analysis"
          ],
          optionsJa: [
            "時価総額や1株あたりの見方に影響するから",
            "利益を保証するから",
            "ボラティリティをなくすから",
            "企業分析の代わりになるから"
          ],
          answerIndex: 0,
          explanation: "Share count changes how stock price and company size should be understood.",
          explanationJa: "株数は、株価や会社規模の理解の仕方を変えます。"
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
          CORELEARN_DISCLAIMER_EN,
          "An ETF is a fund that trades like a stock.",
          "It can hold many assets at once, such as many stocks.",
          "ETFs are often used for diversification and simplicity.",
          "Some ETFs are broad and stable, while others are narrow and riskier."
        ],
        body_ja: [
          CORELEARN_DISCLAIMER_JA,
          "ETFは、株のように売買できるファンドです。",
          "1つのETFで複数の資産をまとめて持てます。",
          "ETFは分散とシンプルさのためによく使われます。",
          "ただし、ETFにも広く分散されたものと、狭くリスクの高いものがあります。"
        ],
        example_en: "An S&P 500 ETF gives you exposure to many large U.S. companies.",
        example_ja: "S&P500 ETFを通じて、多くの米国大型企業にまとめて触れられます。",
        mistake_en: "Do not assume every ETF is automatically safe.",
        mistake_ja: "すべてのETFが自動的に安全だと思わないでください。",
        quickCheck: {
          question: "What is one advantage of an ETF?",
          questionJa: "ETFの利点の一つは何ですか？",
          options: [
            "It can hold many assets",
            "It cannot fall in price",
            "It guarantees profit",
            "It does not trade"
          ],
          optionsJa: [
            "複数の資産をまとめて持てる",
            "価格が下がらない",
            "利益を保証する",
            "取引されない"
          ],
          answerIndex: 0,
          explanation: "ETFs can provide multiple holdings in one product.",
          explanationJa: "ETFは1つで複数の保有対象を持てることがあります。"
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
          CORELEARN_DISCLAIMER_EN,
          "Volume is how many shares traded.",
          "Volatility is how much price moves.",
          "High volume can signal strong participation.",
          "High volatility means bigger price swings and usually more uncertainty."
        ],
        body_ja: [
          CORELEARN_DISCLAIMER_JA,
          "出来高は取引された株数です。",
          "ボラティリティは価格変動の大きさです。",
          "出来高が多いと参加者が多い可能性があります。",
          "ボラティリティが高いと値動きが大きく、不確実性も高まりやすいです。"
        ],
        example_en: "A stock jumping 8% on high volume often means something important happened.",
        example_ja: "高い出来高を伴って8%上昇する株は、重要な出来事が起きた可能性があります。",
        mistake_en: "Do not chase volatility just because it looks exciting.",
        mistake_ja: "激しい値動きだけを見て飛びつかないでください。",
        quickCheck: {
          question: "What does volatility describe?",
          questionJa: "ボラティリティは何を表しますか？",
          options: [
            "How many employees a company has",
            "How much the stock price moves",
            "How old a company is",
            "How much tax it pays"
          ],
          optionsJa: [
            "会社の従業員数",
            "株価がどれだけ動くか",
            "会社の年数",
            "税金の額"
          ],
          answerIndex: 1,
          explanation: "Volatility is about price movement size.",
          explanationJa: "ボラティリティは値動きの大きさを表します。"
        },
        visuals: []
      },{
slug: "what-is-a-broker",
title: "What is a broker?",
desc: "Understand the role of brokers in accessing financial markets.",
title_ja: "証券会社とは何か？",
desc_ja: "証券会社が市場アクセスで果たす役割を理解する。",
body_en: [
"A broker is a company that allows individuals to access financial markets.",
"You cannot normally trade directly on an exchange as an individual.",
"Brokers connect your account to the exchange infrastructure.",
"They handle order routing, settlement, and account custody."
],
body_ja: [
"証券会社とは、個人が金融市場にアクセスするための仲介会社です。",
"通常、個人が取引所に直接注文を出すことはできません。",
"証券会社はあなたの口座を取引所の仕組みに接続します。",
"注文処理、決済、資産管理などを行います。"
],
example_en: "Apps like brokerage platforms allow individuals to access stock markets through a broker.",
example_ja: "証券アプリなどは、証券会社を通じて株式市場にアクセスできる仕組みです。",
mistake_en: "A broker is not the same thing as the stock exchange itself.",
mistake_ja: "証券会社は取引所そのものではありません。",
quickCheck: {
question: "What does a broker do?",
questionJa: "証券会社の役割は何ですか？",
options: [
"Connect investors to the market",
"Guarantee profits",
"Control stock prices",
"Replace the stock exchange"
],
optionsJa: [
"投資家を市場に接続する",
"利益を保証する",
"株価を決める",
"取引所の代わりになる"
],
answerIndex: 0,
explanation: "Brokers provide access to financial markets.",
explanationJa: "証券会社は投資家が市場にアクセスするための窓口です。"
},
visuals: []
},{
slug: "what-is-an-index",
title: "What is a stock index?",
desc: "Understand what market indexes measure.",
title_ja: "株価指数とは何か？",
desc_ja: "株価指数が何を測るのかを理解する。",
body_en: [
"A stock index tracks the performance of a group of companies.",
"It acts as a snapshot of how a market segment is performing.",
"Examples include the S&P 500, NASDAQ, and Nikkei 225.",
"Indexes help investors understand overall market movement."
],
body_ja: [
"株価指数とは、複数の企業の株価をまとめて追跡する指標です。",
"市場の一部がどのように動いているかを示します。",
"例としてS&P500、NASDAQ、日経225があります。",
"指数は市場全体の動きを理解する助けになります。"
],
example_en: "If the S&P 500 rises, it means many large U.S. companies increased in value.",
example_ja: "S&P500が上がると、多くの米国大型企業の価値が上昇したことを意味します。",
mistake_en: "An index is not a single company.",
mistake_ja: "指数は1つの会社ではありません。",
quickCheck: {
question: "What does a stock index represent?",
questionJa: "株価指数は何を表していますか？",
options: [
"A group of companies",
"A single company",
"A government bond",
"A bank account"
],
optionsJa: [
"複数企業のグループ",
"1つの会社",
"国債",
"銀行口座"
],
answerIndex: 0,
explanation: "Indexes represent groups of companies.",
explanationJa: "株価指数は複数の企業の集合を表します。"
},
visuals: []
},{
slug: "dividends",
title: "What are dividends?",
desc: "Understand how companies distribute profits to shareholders.",
title_ja: "配当とは何か？",
desc_ja: "企業が株主に利益を分配する仕組みを理解する。",
body_en: [
"A dividend is a payment some companies distribute to shareholders.",
"It usually comes from company profits.",
"Not all companies pay dividends.",
"Many growth companies reinvest profits instead."
],
body_ja: [
"配当とは、企業が株主に支払う利益分配です。",
"通常は会社の利益から支払われます。",
"すべての企業が配当を出すわけではありません。",
"成長企業の多くは利益を再投資します。"
],
example_en: "Some companies pay quarterly dividends to shareholders.",
example_ja: "企業によっては四半期ごとに配当を支払います。",
mistake_en: "A dividend does not guarantee that a company is strong.",
mistake_ja: "配当があるからといって会社が必ず強いとは限りません。",
quickCheck: {
question: "What is a dividend?",
questionJa: "配当とは何ですか？",
options: [
"A profit distribution to shareholders",
"A tax payment",
"A government bond",
"A stock split"
],
optionsJa: [
"株主への利益分配",
"税金支払い",
"国債",
"株式分割"
],
answerIndex: 0,
explanation: "Dividends are profit distributions.",
explanationJa: "配当は企業利益の分配です。"
},
visuals: []
},
      {
        slug: "bid-ask-and-order-types",
        title: "Bid, ask, and basic order types",
        desc: "Learn the spread and the difference between market and limit orders.",
        title_ja: "買値・売値と基本注文方法",
        desc_ja: "スプレッドと成行注文・指値注文の違いを学ぶ。",
        body_en: [
          CORELEARN_DISCLAIMER_EN,
          "The bid is the highest current buy offer, and the ask is the lowest current sell offer.",
          "The difference between them is called the spread.",
          "A market order prioritizes execution. A limit order prioritizes price.",
          "These are trading mechanics, not guarantees of good outcomes."
        ],
        body_ja: [
          CORELEARN_DISCLAIMER_JA,
          "買値（bid）は現在の最高買い注文、売値（ask）は現在の最低売り注文です。",
          "その差をスプレッドといいます。",
          "成行注文は約定を優先し、指値注文は価格を優先します。",
          "これは取引の仕組みであり、良い結果を保証するものではありません。"
        ],
        example_en: "If the bid is 99 and the ask is 100, the spread is 1.",
        example_ja: "買値が99、売値が100なら、スプレッドは1です。",
        mistake_en: "Do not assume the last traded price is the exact price you will get.",
        mistake_ja: "最後の約定価格が、そのままあなたの約定価格になるとは限りません。",
        quickCheck: {
          question: "What does a limit order mainly prioritize?",
          questionJa: "指値注文は主に何を優先しますか？",
          options: [
            "Price",
            "Speed at any price",
            "Guaranteed profit",
            "No volatility"
          ],
          optionsJa: [
            "価格",
            "どんな価格でもすぐ約定すること",
            "利益の保証",
            "ボラティリティがないこと"
          ],
          answerIndex: 0,
          explanation: "A limit order is mainly about controlling the price you are willing to accept.",
          explanationJa: "指値注文は、自分が受け入れる価格をコントロールするための注文です。"
        },
        visuals: []
      }
    ],
    levelQuiz: [
      {
        question: "What does market cap represent?",
        questionJa: "時価総額は何を表しますか？",
        options: [
          "One share’s dividend",
          "The company’s total market value",
          "The company’s debt only",
          "The CEO’s salary"
        ],
        optionsJa: [
          "1株の配当",
          "会社全体の市場評価額",
          "会社の負債だけ",
          "社長の給料"
        ],
        answerIndex: 1,
        explanation: "Market cap refers to the total market valuation of the company.",
        explanationJa: "時価総額は会社全体の市場評価額です。"
      },
      {
        question: "Why do shares outstanding matter?",
        questionJa: "なぜ発行済株式数が重要なのですか？",
        options: [
          "Because they affect market cap and per-share interpretation",
          "Because they guarantee profit",
          "Because they remove volatility",
          "Because they replace business analysis"
        ],
        optionsJa: [
          "時価総額や1株あたりの見方に影響するから",
          "利益を保証するから",
          "ボラティリティをなくすから",
          "企業分析の代わりになるから"
        ],
        answerIndex: 0,
        explanation: "Share count changes how company size and price should be understood.",
        explanationJa: "株数は会社規模や株価の見方に影響します。"
      },
      {
        question: "What is an ETF?",
        questionJa: "ETFとは何ですか？",
        options: [
          "A tax document",
          "A fund that trades like a stock",
          "A type of company loan",
          "A fixed-interest bond"
        ],
        optionsJa: [
          "税務書類",
          "株のように取引されるファンド",
          "会社向け融資の一種",
          "固定利付債券"
        ],
        answerIndex: 1,
        explanation: "ETFs are funds that trade on exchanges like stocks.",
        explanationJa: "ETFは取引所で株のように売買されるファンドです。"
      },
      {
        question: "What does high volatility usually mean?",
        questionJa: "高いボラティリティは通常何を意味しますか？",
        options: [
          "Smaller price movement",
          "Bigger price movement",
          "Guaranteed return",
          "No risk"
        ],
        optionsJa: [
          "小さい値動き",
          "大きい値動き",
          "利益の保証",
          "リスクがない"
        ],
        answerIndex: 1,
        explanation: "High volatility means prices move more sharply.",
        explanationJa: "高いボラティリティは値動きが大きいことを意味します。"
      },
      {
        question: "What does a limit order mainly prioritize?",
        questionJa: "指値注文は主に何を優先しますか？",
        options: [
          "Price",
          "Speed at any price",
          "Guaranteed profit",
          "No volatility"
        ],
        optionsJa: [
          "価格",
          "どんな価格でもすぐ約定すること",
          "利益の保証",
          "ボラティリティがないこと"
        ],
        answerIndex: 0,
        explanation: "A limit order mainly helps control the price you are willing to accept.",
        explanationJa: "指値注文は主に、自分が受け入れる価格をコントロールするための注文です。"
      }
    ]
  },
  {
  id: "level-2",
  title: "Level 2 — Reading a Stock",
  desc: "Understand the basic information people examine when studying a stock.",
  title_ja: "レベル2 — 株を読む",
  desc_ja: "株を見るときに確認される基本情報を理解する。",
  lessons: [
    {
      slug: "earnings-basics",
      title: "Earnings basics",
      desc: "Revenue, profit, and why earnings reports matter.",
      title_ja: "決算の基礎",
      desc_ja: "売上、利益、そして決算が重要な理由を学ぶ。",
      body_en: [
        CORELEARN_DISCLAIMER_EN,
        "Earnings are the financial results a company reports publicly.",
        "These reports usually include revenue, profit, and key financial updates.",
        "Investors follow earnings because they update expectations about company performance.",
        "However, a single earnings report does not define the entire future of a company."
      ],
      body_ja: [
        CORELEARN_DISCLAIMER_JA,
        "決算とは、会社が公開する財務結果です。",
        "通常、売上、利益、その他の重要な財務情報が含まれます。",
        "決算は会社の状況に関する期待を更新するため注目されます。",
        "ただし、1回の決算だけで会社の将来すべてが決まるわけではありません。"
      ],
      example_en: "A company reporting stronger revenue than expected may change market expectations.",
      example_ja: "予想より強い売上を報告すると、市場の期待が変わることがあります。",
      mistake_en: "Do not judge a company entirely from one quarterly result.",
      mistake_ja: "1回の四半期決算だけで会社全体を判断しないでください。",
      quickCheck: {
        question: "What do earnings reports usually contain?",
        questionJa: "決算には通常何が含まれますか？",
        options: [
          "Revenue and profit information",
          "Only the CEO biography",
          "Government policy",
          "Weather forecasts"
        ],
        optionsJa: [
          "売上や利益の情報",
          "CEOの経歴だけ",
          "政府の政策",
          "天気予報"
        ],
        answerIndex: 0,
        explanation: "Earnings reports mainly share financial performance information.",
        explanationJa: "決算は主に財務パフォーマンスを共有します。"
      },
      visuals: []
    },
    {
      slug: "revenue-profit-margin",
      title: "Revenue, profit, and margin",
      desc: "Three core financial terms used in company analysis.",
      title_ja: "売上・利益・利益率",
      desc_ja: "企業分析で使われる3つの基本指標。",
      body_en: [
        CORELEARN_DISCLAIMER_EN,
        "Revenue is the total money a company earns from selling goods or services.",
        "Profit is what remains after costs are subtracted.",
        "Margin measures how much profit exists relative to revenue.",
        "High revenue does not automatically mean a company is very profitable."
      ],
      body_ja: [
        CORELEARN_DISCLAIMER_JA,
        "売上とは商品やサービスから得た総収入です。",
        "利益はコストを差し引いた後に残る金額です。",
        "利益率は売上に対してどれだけ利益が出ているかを示します。",
        "売上が高くても利益が高いとは限りません。"
      ],
      example_en: "A company with $100 revenue and $20 profit has a 20% margin.",
      example_ja: "売上100、利益20なら利益率は20%です。",
      mistake_en: "Do not confuse revenue growth with strong profitability.",
      mistake_ja: "売上成長と利益を混同しないでください。",
      quickCheck: {
        question: "What does profit represent?",
        questionJa: "利益とは何を表しますか？",
        options: [
          "Money remaining after costs",
          "Total sales before costs",
          "Employee salaries only",
          "Taxes"
        ],
        optionsJa: [
          "コストを引いた後の残り",
          "コスト前の売上",
          "従業員の給料だけ",
          "税金"
        ],
        answerIndex: 0,
        explanation: "Profit is what remains after expenses.",
        explanationJa: "利益は費用を差し引いた後の金額です。"
      },
      visuals: []
    },
    {
  slug: "how-to-read-a-stock-chart",
  title: "How to read a stock chart",
  desc: "Learn how to read a basic stock chart step by step without treating it like a prediction machine.",
  title_ja: "株価チャートの読み方",
  desc_ja: "株価チャートを予言の道具としてではなく、基本情報として段階的に読む方法を学ぶ。",
  body_en: [
    CORELEARN_DISCLAIMER_EN,
    "A stock chart is a visual record of price movement over time.",
    "The first step is identifying the time frame. A one-day chart, a one-year chart, and a five-year chart can tell very different stories.",
    "The second step is identifying direction. Ask whether the stock has generally been rising, falling, or moving sideways.",
    "The third step is identifying volatility. Some charts move smoothly, while others swing sharply up and down.",
    "The fourth step is identifying major price areas, such as recent highs, recent lows, and places where price repeatedly reacted.",
    "A chart helps you organize observation. It does not tell you what must happen next."
  ],
  body_ja: [
    CORELEARN_DISCLAIMER_JA,
    "株価チャートは、価格の動きを時間軸で見せる図です。",
    "最初のステップは時間軸を見ることです。1日のチャート、1年のチャート、5年のチャートでは見える話が大きく変わります。",
    "次のステップは方向を見ることです。全体として上がっているのか、下がっているのか、横ばいなのかを確認します。",
    "その次はボラティリティを見ることです。なめらかに動く銘柄もあれば、上下に大きく振れる銘柄もあります。",
    "さらに、直近高値、直近安値、何度も反応している価格帯など、主要な価格エリアを見ます。",
    "チャートは観察を整理する助けになりますが、次に何が必ず起こるかを教えるものではありません。"
  ],
  example_en: "A one-year chart that trends upward with moderate pullbacks shows a very different situation from a one-week chart with violent swings.",
  example_ja: "1年チャートで緩やかに上昇している銘柄は、1週間チャートで激しく上下している銘柄とはまったく違う状況を示します。",
  mistake_en: "Do not treat one short-term chart move as full proof of business quality or future direction.",
  mistake_ja: "短期チャートの一つの動きだけで、企業の質や将来の方向が証明されたと思わないでください。",
  quickCheck: {

    question: "What should you check first when reading a stock chart?",
    questionJa: "株価チャートを読むとき、最初に何を確認するべきですか？",
    options: [
      "The time frame",
      "The CEO’s age",
      "The company logo",
      "The tax rate"
    ],
    optionsJa: [
      "時間軸",
      "CEOの年齢",
      "会社のロゴ",
      "税率"
    ],
    answerIndex: 0,
    explanation: "The same stock can look completely different depending on whether you view one day, one year, or multiple years.",
    explanationJa: "同じ銘柄でも、1日・1年・数年のどれを見るかで見え方が大きく変わるため、まず時間軸の確認が重要です。",
    },
    visuals: [
  {
    src: "/education/corelearn/charts/chart-trend-example.png",
    alt: "Example chart showing an uptrend",
    caption: "Trend shows the general direction of price over time.",
    captionJa: "トレンドとは、価格が時間とともに進む全体的な方向を示します。",
  },
  {
    src: "/education/corelearn/charts/chart-volatility-example.png",
    alt: "Example chart showing volatility",
    caption: "Volatility shows how sharply price moves up and down.",
    captionJa: "ボラティリティとは、価格がどれだけ大きく上下するかを示します。",
  },
  {
    src: "/education/corelearn/charts/chart-timeframe-example.png",
    alt: "Example chart showing timeframe",
    caption: "Timeframe changes what you are actually observing.",
    captionJa: "時間軸によって、同じチャートでも見え方が変わります。",
  },
]
    
},
    {
      slug: "management-guidance",
      title: "Management guidance",
      desc: "Learn why company leadership expectations matter.",
      title_ja: "経営陣のガイダンス",
      desc_ja: "経営陣の見通しがなぜ注目されるかを学ぶ。",
      body_en: [
        CORELEARN_DISCLAIMER_EN,
        "Management guidance refers to what company leaders say about future expectations.",
        "It may include growth forecasts, spending plans, or business outlook.",
        "Guidance influences how investors interpret upcoming performance.",
        "However, guidance is still an estimate and not a guarantee."
      ],
      body_ja: [
        CORELEARN_DISCLAIMER_JA,
        "ガイダンスとは、会社の経営陣が将来について示す見通しです。",
        "成長予測、支出計画、事業見通しなどが含まれることがあります。",
        "ガイダンスは投資家の期待に影響を与えることがあります。",
        "ただし、ガイダンスは保証ではなく予測です。"
      ],
      example_en: "A company raising guidance may increase confidence in its outlook.",
      example_ja: "会社がガイダンスを引き上げると、将来への期待が高まることがあります。",
      mistake_en: "Do not treat guidance as certainty.",
      mistake_ja: "ガイダンスを確実な結果だと思わないでください。",
      quickCheck: {
        question: "What is management guidance?",
        questionJa: "ガイダンスとは何ですか？",
        options: [
          "Management expectations about future performance",
          "A government rule",
          "A stock chart pattern",
          "A trading order"
        ],
        optionsJa: [
          "経営陣の将来見通し",
          "政府の規則",
          "チャートパターン",
          "注文方法"
        ],
        answerIndex: 0,
        explanation: "Guidance reflects leadership expectations about future performance.",
        explanationJa: "ガイダンスは経営陣の将来見通しを示します。"
      },
      visuals: []
    },
    {
      slug: "news-and-catalysts",
      title: "News and catalysts",
      desc: "Understand events that can influence expectations.",
      title_ja: "ニュースとカタリスト",
      desc_ja: "期待を変える出来事を理解する。",
      body_en: [
        CORELEARN_DISCLAIMER_EN,
        "A catalyst is an event that may change expectations about a company.",
        "Examples include earnings, product launches, regulation changes, or industry news.",
        "Some headlines matter a lot, while others are mostly noise.",
        "The key habit is asking whether the news actually changes the business outlook."
      ],
      body_ja: [
        CORELEARN_DISCLAIMER_JA,
        "カタリストとは、会社への期待を変える可能性のある出来事です。",
        "例として、決算、新製品、規制変更、業界ニュースなどがあります。",
        "重要なニュースもあれば、ほとんど雑音のものもあります。",
        "重要なのは、そのニュースが本当に会社の見通しを変えるかを考えることです。"
      ],
      example_en: "A new regulation affecting an industry may change expectations about company growth.",
      example_ja: "業界の規制変更は、会社の成長期待を変えることがあります。",
      mistake_en: "Do not treat every headline as equally important.",
      mistake_ja: "すべてのニュースを同じ重要度だと思わないでください。",
      quickCheck: {
        question: "What is a catalyst?",
        questionJa: "カタリストとは何ですか？",
        options: [
          "An event that may change expectations about a company",
          "A tax rule",
          "A chart color",
          "A dividend payment"
        ],
        optionsJa: [
          "会社への期待を変える出来事",
          "税金ルール",
          "チャートの色",
          "配当金"
        ],
        answerIndex: 0,
        explanation: "Catalysts are events that may change expectations.",
        explanationJa: "カタリストは期待を変える出来事です。"
      },
      visuals: []
    },
    {
      slug: "52-week-high-low",
      title: "52-week high and low",
      desc: "Understand what the yearly price range tells you.",
      title_ja: "52週高値と安値",
      desc_ja: "年間の価格レンジが示す意味を理解する。",
      body_en: [
        CORELEARN_DISCLAIMER_EN,
        "The 52-week high is the highest price reached in the past year.",
        "The 52-week low is the lowest price reached in the past year.",
        "These numbers help show where the current price sits within its yearly range.",
        "They provide context but do not predict future price movement."
      ],
      body_ja: [
        CORELEARN_DISCLAIMER_JA,
        "52週高値は過去1年間で最も高かった株価です。",
        "52週安値は過去1年間で最も低かった株価です。",
        "これらは現在の価格が年間レンジのどこにあるかを示します。",
        "ただし将来の価格を予測するものではありません。"
      ],
      example_en: "A stock trading near its 52-week high is near the top of its yearly range.",
      example_ja: "株価が52週高値付近なら、年間レンジの上に近い位置です。",
      mistake_en: "Do not assume a stock cannot go higher just because it is near a high.",
      mistake_ja: "高値圏だから上がらないと決めつけないでください。",
      quickCheck: {
        question: "What does the 52-week high represent?",
        questionJa: "52週高値は何を表しますか？",
        options: [
          "The highest price during the past year",
          "Company revenue",
          "Employee count",
          "Debt level"
        ],
        optionsJa: [
          "過去1年の最高株価",
          "会社の売上",
          "従業員数",
          "負債額"
        ],
        answerIndex: 0,
        explanation: "It shows the highest price reached in the last year.",
        explanationJa: "過去1年間の最高価格です。"
      },
      visuals: []
    },
    {
      slug: "chart-basics",
      title: "Basic chart reading",
      desc: "Learn simple ways to read a price chart without over-interpreting it.",
      title_ja: "チャートの基本",
      desc_ja: "過度な解釈をせずに価格チャートを読む基本を学ぶ。",
      body_en: [
        CORELEARN_DISCLAIMER_EN,
        "A stock chart shows how price moved over time.",
        "Charts can help visualize trends, volatility, and price history.",
        "They do not explain everything about the business.",
        "Charts are context tools, not guarantees."
      ],
      body_ja: [
        CORELEARN_DISCLAIMER_JA,
        "株価チャートは、価格が時間とともにどう動いたかを示します。",
        "チャートはトレンドやボラティリティ、価格履歴を視覚化します。",
        "ただし会社のすべてを説明するものではありません。",
        "チャートは文脈ツールであり、結果を保証するものではありません。"
      ],
      example_en: "A chart may show whether price has been trending upward or moving sideways.",
      example_ja: "チャートは価格が上昇傾向か横ばいかを示すことがあります。",
      mistake_en: "Do not assume a chart alone explains a company’s future.",
      mistake_ja: "チャートだけで会社の将来が分かると思わないでください。",
      quickCheck: {
        question: "What does a stock chart mainly show?",
        questionJa: "株価チャートは主に何を示しますか？",
        options: [
          "Price movement over time",
          "Company profits only",
          "Government regulation",
          "Employee salaries"
        ],
        optionsJa: [
          "時間とともに価格がどう動いたか",
          "会社の利益だけ",
          "政府規制",
          "従業員給与"
        ],
        answerIndex: 0,
        explanation: "Charts visualize price movement through time.",
        explanationJa: "チャートは価格の時間変化を示します。"
      },
      visuals: []
    }
  ],
  levelQuiz: [
    {
      question: "What do earnings reports mainly show?",
      questionJa: "決算は主に何を示しますか？",
      options: [
        "Financial performance like revenue and profit",
        "Employee ages",
        "Government taxes",
        "Office size"
      ],
      optionsJa: [
        "売上や利益などの財務結果",
        "従業員の年齢",
        "税金",
        "オフィスの大きさ"
      ],
      answerIndex: 0,
      explanation: "Earnings reports share financial results.",
      explanationJa: "決算は財務結果を共有します。"
    },
    {
      question: "What is management guidance?",
      questionJa: "ガイダンスとは何ですか？",
      options: [
        "Management expectations about future performance",
        "A tax law",
        "A chart indicator",
        "A dividend rule"
      ],
      optionsJa: [
        "経営陣の将来見通し",
        "税法",
        "チャート指標",
        "配当ルール"
      ],
      answerIndex: 0,
      explanation: "Guidance reflects expectations about the future.",
      explanationJa: "ガイダンスは将来への期待を示します。"
    },
    {
      question: "What is a catalyst?",
      questionJa: "カタリストとは何ですか？",
      options: [
        "An event that may change expectations",
        "A chart pattern",
        "A tax document",
        "A dividend payment"
      ],
      optionsJa: [
        "期待を変える出来事",
        "チャートパターン",
        "税務書類",
        "配当"
      ],
      answerIndex: 0,
      explanation: "Catalysts are events that change expectations.",
      explanationJa: "カタリストは期待を変える出来事です。"
    },
    {
      question: "What does a stock chart show?",
      questionJa: "株価チャートは何を示しますか？",
      options: [
        "Price movement over time",
        "Company revenue",
        "Employee salaries",
        "Tax rules"
      ],
      optionsJa: [
        "時間とともに価格がどう動いたか",
        "会社の売上",
        "従業員給与",
        "税ルール"
      ],
      answerIndex: 0,
      explanation: "Charts show price history through time.",
      explanationJa: "チャートは価格履歴を示します。"
    }
  ]
} ,
  {
    id: "level-3",
    title: "Level 3 — Beginner Decision Making",
    desc: "Learn to think before acting and avoid basic mistakes.",
    title_ja: "レベル3 — 初心者の意思決定",
    desc_ja: "行動する前に考え、基本的な失敗を避ける方法を学ぶ。",
    lessons: [
      {
        slug: "risk-first",
        title: "Risk first",
        desc: "Learn why downside matters before excitement.",
        title_ja: "まずリスク",
        desc_ja: "興奮より先に下振れを見る重要性を学ぶ。",
        body_en: [
          CORELEARN_DISCLAIMER_EN,
          "Many beginners focus too much on upside and not enough on downside.",
          "A stronger first question is not 'what looks exciting?' but 'what can go wrong?'",
          "Thinking about downside helps protect both capital and confidence.",
          "Good habits start with caution and clarity."
        ],
        body_ja: [
          CORELEARN_DISCLAIMER_JA,
          "多くの初心者は上振ればかり見て、下振れを十分に見ません。",
          "より強い最初の質問は『何が楽しそうか』ではなく、『何が間違うか』です。",
          "下振れを考えることは、お金だけでなく自信を守る助けにもなります。",
          "良い習慣は慎重さと明確さから始まります。"
        ],
        example_en: "A company may sound exciting, but one weak point can still matter a lot.",
        example_ja: "会社が魅力的に見えても、1つの弱点が大きく重要になることがあります。",
        mistake_en: "Do not build your whole view around the best-case scenario.",
        mistake_ja: "最良ケースだけで全体像を作らないでください。",
        quickCheck: {
          question: "What should usually come first in beginner analysis?",
          questionJa: "初心者の分析で通常最初に来るべきものは何ですか？",
          options: ["Risk", "Hype", "Excitement", "Speed"],
          optionsJa: ["リスク", "盛り上がり", "興奮", "速さ"],
          answerIndex: 0,
          explanation: "Strong beginner thinking starts by asking what could go wrong.",
          explanationJa: "強い初心者思考は、何が間違うかを考えることから始まります。"
        },
        visuals: []
      },
      {
        slug: "position-sizing",
        title: "Position sizing",
        desc: "Understand why size changes risk.",
        title_ja: "ポジションサイズ",
        desc_ja: "サイズがリスクをどう変えるかを理解する。",
        body_en: [
          CORELEARN_DISCLAIMER_EN,
          "Position sizing means how much money is allocated to one idea.",
          "The same idea can feel very different depending on how large it is.",
          "Larger size increases the effect of being wrong.",
          "This concept helps beginners think in terms of exposure, not just opinions."
        ],
        body_ja: [
          CORELEARN_DISCLAIMER_JA,
          "ポジションサイズとは、1つの考えにどれだけ資金を配分するかです。",
          "同じ考えでも、サイズが違えば意味は大きく変わります。",
          "サイズが大きいほど、間違ったときの影響も大きくなります。",
          "この概念を学ぶと、初心者は意見だけでなく露出量でも考えられるようになります。"
        ],
        example_en: "A 5% allocation and a 50% allocation do not carry the same risk.",
        example_ja: "5%の配分と50%の配分では、同じリスクではありません。",
        mistake_en: "Do not think a good idea automatically deserves large size.",
        mistake_ja: "良い考えなら自動的に大きなサイズで良いと思わないでください。",
        quickCheck: {
          question: "Why does position sizing matter?",
          questionJa: "なぜポジションサイズが重要なのですか？",
          options: [
            "Because size changes risk",
            "Because bigger is always better",
            "Because it guarantees profit",
            "Because it removes uncertainty"
          ],
          optionsJa: [
            "サイズがリスクを変えるから",
            "大きいほど常に良いから",
            "利益を保証するから",
            "不確実性をなくすから"
          ],
          answerIndex: 0,
          explanation: "Sizing changes how much damage or benefit one idea can create.",
          explanationJa: "サイズによって、1つの考えが生むダメージや影響が変わります。"
        },
        visuals: []
      },
      {
        slug: "risk-management-basics",
        title: "Risk management",
        desc: "Learn the basic idea of controlling downside instead of thinking only about upside.",
        title_ja: "リスク管理",
        desc_ja: "上振れだけでなく、下振れを管理する基本的な考え方を学ぶ。",
        body_en: [
          CORELEARN_DISCLAIMER_EN,
          "Risk management means thinking about how to limit damage when you are wrong.",
          "It includes sizing, diversification, patience, and avoiding weak decisions.",
          "Strong learners do not ask only how much they could gain. They also ask what they could lose.",
          "Decision-making becomes stronger when downside is taken seriously."
        ],
        body_ja: [
          CORELEARN_DISCLAIMER_JA,
          "リスク管理とは、自分が間違ったときに損失をどう抑えるかを考えることです。",
          "これには、サイズ、分散、忍耐、弱い判断を避けることなどが含まれます。",
          "強い学習者は、どれだけ増えるかだけでなく、どれだけ失うかも考えます。",
          "下振れを真剣に考えるほど、意思決定は強くなります。"
        ],
        example_en: "A learner may reduce exposure to one idea instead of becoming overconfident in a single story.",
        example_ja: "1つの話に過信するのではなく、その考えへの露出を抑えることがあります。",
        mistake_en: "Do not treat risk management as fear. It is structure.",
        mistake_ja: "リスク管理を臆病さだと思わないでください。これは構造です。",
        quickCheck: {
          question: "What is the purpose of risk management?",
          questionJa: "リスク管理の目的は何ですか？",
          options: [
            "To control downside when you are wrong",
            "To guarantee upside",
            "To eliminate uncertainty completely",
            "To avoid all decisions"
          ],
          optionsJa: [
            "間違ったときの下振れを抑えるため",
            "上振れを保証するため",
            "不確実性を完全になくすため",
            "すべての判断を避けるため"
          ],
          answerIndex: 0,
          explanation: "Risk management is about controlling damage, not guaranteeing outcomes.",
          explanationJa: "リスク管理は結果保証ではなく、損失管理の考え方です。"
        },
        visuals: []
      },
      {
        slug: "fomo-and-bad-decisions",
        title: "FOMO and bad decisions",
        desc: "Learn how hype and urgency distort thinking.",
        title_ja: "FOMOと悪い判断",
        desc_ja: "熱狂や焦りが思考をどうゆがめるかを学ぶ。",
        body_en: [
          CORELEARN_DISCLAIMER_EN,
          "FOMO means fear of missing out.",
          "It pushes people to react because others seem excited, not because they understand the situation.",
          "This often leads to poor timing, weak reasoning, and emotional choices.",
          "Calm observation is usually stronger than panic."
        ],
        body_ja: [
          CORELEARN_DISCLAIMER_JA,
          "FOMOとは、取り残されることへの恐れです。",
          "これは、状況を理解しているからではなく、周りが盛り上がっているから反応してしまう状態です。",
          "その結果、タイミングの悪さ、弱い理由づけ、感情的な判断につながりやすくなります。",
          "多くの場合、焦りより落ち着いた観察の方が強いです。"
        ],
        example_en: "A fast-moving story online may create urgency even when understanding is weak.",
        example_ja: "ネットで急に話題になると、理解が浅くても焦りが生まれることがあります。",
        mistake_en: "Do not confuse urgency with quality.",
        mistake_ja: "緊急性と質を同じものだと思わないでください。",
        quickCheck: {
          question: "What does FOMO often cause?",
          questionJa: "FOMOは何を引き起こしやすいですか？",
          options: [
            "Late and emotional decisions",
            "Better discipline",
            "Guaranteed clarity",
            "Lower uncertainty"
          ],
          optionsJa: [
            "遅くて感情的な判断",
            "より良い規律",
            "明確さの保証",
            "不確実性の低下"
          ],
          answerIndex: 0,
          explanation: "FOMO often weakens patience and clear thinking.",
          explanationJa: "FOMOは忍耐と明確な思考を弱めやすいです。"
        },
        visuals: []
      }
    ],
    levelQuiz: [
      {
        question: "What should beginners usually think about before upside?",
        questionJa: "初心者は通常、上振れの前に何を考えるべきですか？",
        options: ["Risk", "Popularity", "Speed", "Excitement"],
        optionsJa: ["リスク", "人気", "速さ", "興奮"],
        answerIndex: 0,
        explanation: "Risk-first thinking helps protect against avoidable mistakes.",
        explanationJa: "リスクを先に考えることで、避けられる失敗から身を守りやすくなります。"
      },
      {
        question: "What does position sizing affect?",
        questionJa: "ポジションサイズは何に影響しますか？",
        options: ["Risk exposure", "Company age", "News quality", "Office size"],
        optionsJa: ["リスクの大きさ", "会社の年数", "ニュースの質", "オフィスの大きさ"],
        answerIndex: 0,
        explanation: "The larger the size, the greater the impact of being wrong.",
        explanationJa: "サイズが大きいほど、間違ったときの影響も大きくなります。"
      },
      {
        question: "What is the purpose of risk management?",
        questionJa: "リスク管理の目的は何ですか？",
        options: [
          "To control downside when you are wrong",
          "To guarantee upside",
          "To remove all uncertainty",
          "To avoid all decisions"
        ],
        optionsJa: [
          "間違ったときの下振れを抑えるため",
          "上振れを保証するため",
          "すべての不確実性をなくすため",
          "すべての判断を避けるため"
        ],
        answerIndex: 0,
        explanation: "Risk management focuses on limiting damage.",
        explanationJa: "リスク管理は損失を抑えることに重点があります。"
      },
      {
        question: "What is FOMO?",
        questionJa: "FOMOとは何ですか？",
        options: [
          "Fear of missing out",
          "A valuation ratio",
          "A tax rule",
          "A chart pattern"
        ],
        optionsJa: [
          "取り残されることへの恐れ",
          "バリュエーション指標",
          "税金ルール",
          "チャートパターン"
        ],
        answerIndex: 0,
        explanation: "FOMO is emotional pressure caused by not wanting to miss a move.",
        explanationJa: "FOMOは、取り残されたくない気持ちから生まれる感情的な圧力です。"
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
        desc: "Practice comparing businesses instead of staring at random prices.",
        title_ja: "2つの株を比較する",
        desc_ja: "ランダムな価格ではなく、会社同士を比較する練習をする。",
        body_en: [
          CORELEARN_DISCLAIMER_EN,
          "A useful beginner habit is comparing two businesses directly.",
          "You can compare size, growth, margins, stability, and risk.",
          "Comparison makes thinking more structured.",
          "It is easier to notice strengths and weaknesses when two companies are side by side."
        ],
        body_ja: [
          CORELEARN_DISCLAIMER_JA,
          "初心者に役立つ習慣の一つは、2つの会社を直接比較することです。",
          "規模、成長、利益率、安定性、リスクなどを比べることができます。",
          "比較は思考をより構造的にします。",
          "2社を並べると、強みと弱みが見えやすくなります。"
        ],
        example_en: "Two companies in the same sector can be compared on growth and margins.",
        example_ja: "同じセクターの2社を、成長や利益率で比較できます。",
        mistake_en: "Do not compare only the share price.",
        mistake_ja: "株価だけを比較しないでください。",
        quickCheck: {
          question: "What helps beginner stock thinking?",
          questionJa: "初心者の株の考え方に役立つのは何ですか？",
          options: [
            "Comparing companies",
            "Ignoring all context",
            "Following random hype",
            "Watching only price color"
          ],
          optionsJa: [
            "会社を比較すること",
            "文脈をすべて無視すること",
            "根拠のない盛り上がりに乗ること",
            "値動きの色だけを見ること"
          ],
          answerIndex: 0,
          explanation: "Comparison helps build clearer and more structured judgment.",
          explanationJa: "比較は、より明確で構造的な判断を作る助けになります。"
        },
        visuals: []
      },
      {
        slug: "spot-strengths-and-weaknesses",
        title: "Spot strengths and weaknesses",
        desc: "Practice identifying simple strengths and weaknesses in a business.",
        title_ja: "強みと弱みを見つける",
        desc_ja: "会社のシンプルな強みと弱みを見つける練習をする。",
        body_en: [
          CORELEARN_DISCLAIMER_EN,
          "A useful beginner skill is separating strengths from weaknesses clearly.",
          "Strengths may include growth, strong margins, stability, or a strong position in the industry.",
          "Weaknesses may include weak profitability, slowing demand, heavy debt, or unclear direction.",
          "This habit builds balanced judgment instead of one-sided opinions."
        ],
        body_ja: [
          CORELEARN_DISCLAIMER_JA,
          "初心者に役立つ技能の一つは、強みと弱みをはっきり分けて考えることです。",
          "強みには、成長、利益率の強さ、安定性、業界内での強い立場などがあります。",
          "弱みには、利益の弱さ、需要の鈍化、重い負債、方向性の不明確さなどがあります。",
          "この習慣は、一方的な意見ではなくバランスの取れた判断を育てます。"
        ],
        example_en: "A company may have strong revenue growth but weak margins, meaning it has both strengths and weaknesses.",
        example_ja: "売上成長は強くても利益率が弱い会社なら、強みと弱みの両方があります。",
        mistake_en: "Do not force a company into only good or only bad.",
        mistake_ja: "会社を『良いだけ』『悪いだけ』に無理やり分けないでください。",
        quickCheck: {
          question: "Why identify both strengths and weaknesses?",
          questionJa: "なぜ強みと弱みの両方を見つけるのですか？",
          options: [
            "Because it leads to more balanced judgment",
            "Because it guarantees correct decisions",
            "Because weaknesses do not matter",
            "Because strengths alone are enough"
          ],
          optionsJa: [
            "よりバランスの取れた判断につながるから",
            "正しい判断を保証するから",
            "弱みは重要ではないから",
            "強みだけで十分だから"
          ],
          answerIndex: 0,
          explanation: "Balanced thinking improves when both positives and negatives are considered.",
          explanationJa: "プラス面とマイナス面の両方を見ることで、判断はよりバランスよくなります。"
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
          CORELEARN_DISCLAIMER_EN,
          "Not every headline deserves a strong conclusion.",
          "A useful habit is asking: what changed, and does it matter?",
          "Some headlines change expectations meaningfully. Others are mostly noise.",
          "Context matters more than dramatic wording."
        ],
        body_ja: [
          CORELEARN_DISCLAIMER_JA,
          "すべての見出しが強い結論に値するわけではありません。",
          "役立つ習慣は、『何が変わったのか、それは重要か』と考えることです。",
          "期待を大きく変える見出しもあれば、ほとんど雑音にすぎないものもあります。",
          "刺激的な言葉より、文脈の方が重要です。"
        ],
        example_en: "A regulation change may matter far more than a vague rumor post.",
        example_ja: "規制変更は、あいまいな噂投稿よりずっと重要な場合があります。",
        mistake_en: "Do not let a dramatic headline replace actual thinking.",
        mistake_ja: "刺激的な見出しに思考を置き換えさせないでください。",
        quickCheck: {
          question: "What should you ask when reading a headline?",
          questionJa: "見出しを読むとき、何を考えるべきですか？",
          options: [
            "What changed, and does it matter?",
            "How exciting is it?",
            "How short is it?",
            "How often was it reposted?"
          ],
          optionsJa: [
            "何が変わり、それは重要か？",
            "どれだけ刺激的か？",
            "どれだけ短いか？",
            "何回再投稿されたか？"
          ],
          answerIndex: 0,
          explanation: "The real question is whether the information changes value, risk, or expectations.",
          explanationJa: "本当に重要なのは、その情報が価値・リスク・期待を変えるかどうかです。"
        },
        visuals: []
      },
      {
        slug: "study-avoid-wait",
        title: "Study, avoid, or pause",
        desc: "Beginner judgment is often about choosing patience instead of acting immediately.",
        title_ja: "調べる・避ける・一度立ち止まる",
        desc_ja: "初心者の判断では、すぐ行動するより一度立ち止まることが重要な場合があります。",
        body_en: [
          CORELEARN_DISCLAIMER_EN,
          "This is not a recommendation system. It is a thinking framework.",
          "A beginner can ask whether a situation looks stronger, weaker, or still unclear after reviewing the facts.",
          "If a situation looks strong and understandable, it may deserve more study. If it looks weak, inconsistent, or poorly understood, it may suggest caution rather than action. If the picture is incomplete, waiting may be the strongest response.",
          "The point is not prediction. The point is structured thinking.",
          "This framework is educational and should not be treated as personal financial advice."
        ],
        body_ja: [
          CORELEARN_DISCLAIMER_JA,
          "これは推奨システムではなく、考え方を整理するためのフレームワークです。",
          "初心者は、事実を見た後に状況が強いのか、弱いのか、まだ不明なのかを整理して考えることができます。",
          "内容が強く理解しやすければ、さらに調べる価値があるかもしれません。内容が弱い、矛盾している、または理解不足なら、行動より慎重さが必要だと示しているかもしれません。判断材料が足りなければ、待つことが最も強い対応になることがあります。",
          "重要なのは予測ではなく、構造的に考えることです。",
          "このフレームワークは教育用であり、個別の投資助言として扱うべきではありません。"
        ],
        example_en: "If the facts are mixed and your understanding is weak, waiting may be more disciplined than forcing a view.",
        example_ja: "事実がまちまちで理解も浅いなら、無理に結論を出すより待つ方が規律ある対応かもしれません。",
        mistake_en: "Do not treat this framework as a recommendation engine or a profit guarantee.",
        mistake_ja: "このフレームワークを推奨システムや利益保証として扱わないでください。",
        quickCheck: {
          question: "What is the purpose of the study / avoid / wait framework in this course?",
          questionJa: "この講座での『調べる・避ける・待つ』フレームワークの目的は何ですか？",
          options: [
            "To organize thinking without giving financial advice",
            "To guarantee correct trades",
            "To replace research completely",
            "To remove all uncertainty"
          ],
          optionsJa: [
            "金融助言ではなく思考を整理するため",
            "正しい売買を保証するため",
            "調査を完全に不要にするため",
            "不確実性をなくすため"
          ],
          answerIndex: 0,
          explanation: "The framework is educational. It helps organize judgment, not guarantee outcomes.",
          explanationJa: "このフレームワークは教育用です。結果保証ではなく、判断整理を助けます。"
        },
        visuals: []
      },
      {
        slug: "study-step-back-or-wait",
        title: "Study, step back, or wait",
        desc: "Learn that patience is often stronger than impulsive action.",
        title_ja: "調べる・一歩引く・待つ",
        desc_ja: "衝動的な行動より、待つことが強い場合が多いと学ぶ。",
        body_en: [
          CORELEARN_DISCLAIMER_EN,
          "Not every situation requires immediate action.",
          "Sometimes the strongest beginner response is to study more, step back, or wait.",
          "Waiting is not weakness when understanding is incomplete.",
          "Observation is often a better teacher than impulse."
        ],
        body_ja: [
          CORELEARN_DISCLAIMER_JA,
          "すべての場面で、すぐに行動する必要はありません。",
          "初心者にとって最も強い対応は、さらに調べる、一歩引く、または待つことの場合があります。",
          "理解が不十分なときに待つことは弱さではありません。",
          "多くの場合、衝動より観察の方がよい先生になります。"
        ],
        example_en: "If you do not understand a business or its risks, waiting may be the most disciplined response.",
        example_ja: "事業やリスクを理解していないなら、待つことが最も規律ある対応かもしれません。",
        mistake_en: "Do not force movement just because you feel you should do something.",
        mistake_ja: "何かしなければと感じるだけで、無理に動かないでください。",
        quickCheck: {
          question: "What is often a disciplined beginner response?",
          questionJa: "初心者にとって規律ある対応になりやすいのはどれですか？",
          options: [
            "Wait and study more",
            "React to everything immediately",
            "Copy others blindly",
            "Assume action is always needed"
          ],
          optionsJa: [
            "待ってさらに調べる",
            "すべてにすぐ反応する",
            "他人を盲目的に真似する",
            "常に行動が必要だと思い込む"
          ],
          answerIndex: 0,
          explanation: "Patience and understanding are often stronger than impulsive reactions.",
          explanationJa: "忍耐と理解は、衝動的な反応より強いことが多いです。"
        },
        visuals: []
      }
    ],
    levelQuiz: [
      {
        question: "What is useful when comparing stocks?",
        questionJa: "株を比較するときに役立つのは何ですか？",
        options: [
          "Comparing businesses on real factors",
          "Looking only at share price",
          "Ignoring risk",
          "Copying strangers"
        ],
        optionsJa: [
          "実際の要素で会社を比較すること",
          "株価だけを見ること",
          "リスクを無視すること",
          "知らない人を真似すること"
        ],
        answerIndex: 0,
        explanation: "Useful comparison looks at the business, not just the price sticker.",
        explanationJa: "役立つ比較は、株価だけでなく会社そのものを見ます。"
      },
      {
        question: "Why identify both strengths and weaknesses?",
        questionJa: "なぜ強みと弱みの両方を見つけるのですか？",
        options: [
          "Because it leads to more balanced judgment",
          "Because it guarantees correct decisions",
          "Because weaknesses do not matter",
          "Because strengths alone are enough"
        ],
        optionsJa: [
          "よりバランスの取れた判断につながるから",
          "正しい判断を保証するから",
          "弱みは重要ではないから",
          "強みだけで十分だから"
        ],
        answerIndex: 0,
        explanation: "Balanced judgment improves when both positives and negatives are considered.",
        explanationJa: "プラス面とマイナス面の両方を見ることで、判断はよりバランスよくなります。"
      },
      {
        question: "What should you ask when reading a headline?",
        questionJa: "見出しを読むとき、何を考えるべきですか？",
        options: [
          "What changed, and does it matter?",
          "How exciting is it?",
          "How short is it?",
          "How often was it reposted?"
        ],
        optionsJa: [
          "何が変わり、それは重要か？",
          "どれだけ刺激的か？",
          "どれだけ短いか？",
          "何回再投稿されたか？"
        ],
        answerIndex: 0,
        explanation: "The point is to judge meaning, not excitement.",
        explanationJa: "見るべきなのは刺激ではなく意味です。"
      },
      {
        question: "What is the purpose of the study / avoid / wait framework in this course?",
        questionJa: "この講座での『買う・避ける・待つ』フレームワークの目的は何ですか？",
        options: [
          "To organize thinking without giving financial advice",
          "To guarantee correct trades",
          "To replace research completely",
          "To remove all uncertainty"
        ],
        optionsJa: [
          "金融助言ではなく思考を整理するため",
          "正しい売買を保証するため",
          "調査を完全に不要にするため",
          "不確実性をなくすため"
        ],
        answerIndex: 0,
        explanation: "It is an educational thinking tool, not a recommendation engine.",
        explanationJa: "これは推奨システムではなく、教育用の思考整理ツールです。"
      },
      {
        question: "What is often a strong beginner response?",
        questionJa: "初心者にとって強い対応になりやすいのは何ですか？",
        options: [
          "Wait and study more",
          "Force action",
          "Chase faster",
          "Assume urgency is quality"
        ],
        optionsJa: [
          "待ってさらに調べる",
          "無理に行動する",
          "もっと急いで追いかける",
          "緊急性が質だと思い込む"
        ],
        answerIndex: 0,
        explanation: "Patience is often more disciplined than impulse.",
        explanationJa: "忍耐は多くの場合、衝動より規律があります。"
      }
    ]
  },  {
    id: "level-5",
    title: "Level 5 — Risk and Probability",
    desc: "Learn how uncertainty, probability, and outcomes shape stock decisions.",
    title_ja: "レベル5 — リスクと確率",
    desc_ja: "不確実性、確率、結果の考え方が株の判断にどう関わるかを学ぶ。",
    lessons: [
      {
        slug: "uncertainty-is-normal",
        title: "Uncertainty is normal",
        desc: "Learn that uncertainty is part of markets and not something you can fully remove.",
        title_ja: "不確実性は普通である",
        desc_ja: "不確実性は市場の一部であり、完全には消せないことを学ぶ。",
        body_en: [
          CORELEARN_DISCLAIMER_EN,
          "Markets involve uncertainty by nature.",
          "No company, price, or outcome can ever be known with complete certainty.",
          "Strong learners do not wait for perfect certainty before thinking carefully.",
          "The goal is not to remove uncertainty, but to make better decisions within it."
        ],
        body_ja: [
          CORELEARN_DISCLAIMER_JA,
          "市場には本質的に不確実性があります。",
          "どの会社、価格、結果も、完全な確実性をもって知ることはできません。",
          "強い学習者は、完璧な確実性を待つのではなく、不確実な中で丁寧に考えます。",
          "目標は不確実性をなくすことではなく、その中でより良い判断をすることです。"
        ],
        example_en: "Even a strong business can face unexpected competition, regulation, or demand changes.",
        example_ja: "強い会社でも、予想外の競争、規制、需要変化に直面することがあります。",
        mistake_en: "Do not assume uncertainty means analysis is useless.",
        mistake_ja: "不確実性があるからといって、分析が無意味だと思わないでください。",
        quickCheck: {
          question: "What is the goal when dealing with uncertainty in markets?",
          questionJa: "市場の不確実性に向き合うときの目標は何ですか？",
          options: [
            "To make better decisions within uncertainty",
            "To remove all uncertainty completely",
            "To ignore uncertainty",
            "To predict every outcome perfectly"
          ],
          optionsJa: [
            "不確実性の中でより良い判断をすること",
            "すべての不確実性を完全になくすこと",
            "不確実性を無視すること",
            "すべての結果を完璧に予測すること"
          ],
          answerIndex: 0,
          explanation: "Markets always contain uncertainty, so the aim is better judgment, not perfect certainty.",
          explanationJa: "市場には常に不確実性があるため、目指すべきは完璧な確実性ではなく、より良い判断です。"
        },
        visuals: []
      },
      {
        slug: "probability-not-certainty",
        title: "Probability, not certainty",
        desc: "Learn to think in probabilities instead of absolute yes-or-no predictions.",
        title_ja: "確実性ではなく確率で考える",
        desc_ja: "白黒の断定ではなく、確率で考える方法を学ぶ。",
        body_en: [
          CORELEARN_DISCLAIMER_EN,
          "A strong market habit is thinking in probabilities.",
          "Instead of asking whether something is guaranteed, ask what outcome looks more likely and why.",
          "This helps reduce overconfidence and rigid thinking.",
          "Good analysis often means weighing scenarios, not pretending one future is certain."
        ],
        body_ja: [
          CORELEARN_DISCLAIMER_JA,
          "市場で強い習慣の一つは、確率で考えることです。",
          "何かが保証されているかを問うのではなく、どの結果がより起こりやすいか、そしてなぜそう考えるのかを問います。",
          "これは過信や硬直した思考を減らす助けになります。",
          "良い分析とは、1つの未来を断定することではなく、複数のシナリオを比べることです。"
        ],
        example_en: "A company may have a decent chance of growing, but that does not make growth guaranteed.",
        example_ja: "会社が成長する可能性が十分あっても、それは成長が保証されているという意味ではありません。",
        mistake_en: "Do not confuse a likely outcome with a certain outcome.",
        mistake_ja: "起こりやすい結果と、確実な結果を混同しないでください。",
        quickCheck: {
          question: "What does probability-based thinking help reduce?",
          questionJa: "確率で考えることは何を減らす助けになりますか？",
          options: [
            "Overconfidence",
            "The need to think",
            "All risk",
            "All uncertainty"
          ],
          optionsJa: [
            "過信",
            "考える必要そのもの",
            "すべてのリスク",
            "すべての不確実性"
          ],
          answerIndex: 0,
          explanation: "Probability-based thinking helps people stay flexible and less overconfident.",
          explanationJa: "確率で考えることは、柔軟性を保ち、過信を減らす助けになります。"
        },
        visuals: []
      },
      {
        slug: "expected-outcomes",
        title: "Expected outcomes",
        desc: "Learn that decisions should be judged by process and possible outcomes, not only one result.",
        title_ja: "期待される結果",
        desc_ja: "1つの結果だけでなく、判断の過程と起こりうる結果全体で考えることを学ぶ。",
        body_en: [
          CORELEARN_DISCLAIMER_EN,
          "A single good result does not always mean the decision was strong.",
          "A single bad result does not always mean the decision was weak.",
          "What matters is whether the thinking process was reasonable given the information available.",
          "This helps learners separate luck from judgment."
        ],
        body_ja: [
          CORELEARN_DISCLAIMER_JA,
          "1回うまくいったからといって、その判断が強かったとは限りません。",
          "1回悪い結果になったからといって、その判断が弱かったとは限りません。",
          "重要なのは、その時点で使えた情報に対して思考プロセスが妥当だったかどうかです。",
          "これは運と判断力を分けて考える助けになります。"
        ],
        example_en: "A weak decision can still work once by luck, and a strong decision can still fail once by chance.",
        example_ja: "弱い判断でも運で一度うまくいくことがあり、強い判断でも偶然で一度失敗することがあります。",
        mistake_en: "Do not judge every decision only by its immediate outcome.",
        mistake_ja: "すべての判断を目先の結果だけで評価しないでください。",
        quickCheck: {
          question: "Why should decisions not be judged only by one outcome?",
          questionJa: "なぜ判断を1つの結果だけで評価してはいけないのですか？",
          options: [
            "Because luck can affect short-term results",
            "Because outcomes never matter",
            "Because analysis is useless",
            "Because every decision is equally good"
          ],
          optionsJa: [
            "運が短期的な結果に影響することがあるから",
            "結果はまったく重要ではないから",
            "分析は無意味だから",
            "すべての判断が同じくらい良いから"
          ],
          answerIndex: 0,
          explanation: "One result can be influenced by luck, so process matters too.",
          explanationJa: "1つの結果には運が影響することがあるため、プロセスも重要です。"
        },
        visuals: []
      },
      {
        slug: "base-rates-and-context",
        title: "Base rates and context",
        desc: "Learn why broader patterns and context matter before making special assumptions.",
        title_ja: "ベースレートと文脈",
        desc_ja: "特別な結論を出す前に、全体の傾向や文脈を見る重要性を学ぶ。",
        body_en: [
          CORELEARN_DISCLAIMER_EN,
          "A base rate is the broader pattern you should consider before assuming something unusual.",
          "Looking at context helps prevent extreme conclusions from limited evidence.",
          "Strong learners ask what usually happens in similar situations before claiming this case is unique.",
          "This helps improve realism and discipline."
        ],
        body_ja: [
          CORELEARN_DISCLAIMER_JA,
          "ベースレートとは、何か特別なことを想定する前に見るべき全体的な傾向のことです。",
          "文脈を見ることで、限られた証拠から極端な結論を出しにくくなります。",
          "強い学習者は、このケースが特別だと決めつける前に、似た状況で通常何が起こるかを考えます。",
          "これは現実性と規律を高めます。"
        ],
        example_en: "Before assuming a stock will become a huge winner, it helps to ask how often similar companies actually do.",
        example_ja: "ある株が大きな勝ち組になると考える前に、似た会社が実際にどれくらいそうなるのかを考えることが役立ちます。",
        mistake_en: "Do not jump to extreme conclusions from one exciting story.",
        mistake_ja: "1つの魅力的な話だけで極端な結論に飛ばないでください。",
        quickCheck: {
          question: "Why are base rates useful?",
          questionJa: "なぜベースレートが役立つのですか？",
          options: [
            "Because they add broader context before special assumptions",
            "Because they guarantee outcomes",
            "Because they remove the need for analysis",
            "Because they predict exact prices"
          ],
          optionsJa: [
            "特別な仮定の前に、広い文脈を加えるから",
            "結果を保証するから",
            "分析を不要にするから",
            "正確な株価を予測するから"
          ],
          answerIndex: 0,
          explanation: "Base rates help keep conclusions grounded in wider reality.",
          explanationJa: "ベースレートは、結論をより広い現実に基づかせる助けになります。"
        },
        visuals: []
      }
    ],
    levelQuiz: [
      {
        question: "What is the goal when dealing with market uncertainty?",
        questionJa: "市場の不確実性に向き合うときの目標は何ですか？",
        options: [
          "To make better decisions within uncertainty",
          "To remove all uncertainty",
          "To predict perfectly",
          "To ignore risk"
        ],
        optionsJa: [
          "不確実性の中でより良い判断をすること",
          "すべての不確実性をなくすこと",
          "完璧に予測すること",
          "リスクを無視すること"
        ],
        answerIndex: 0,
        explanation: "The aim is stronger judgment, not perfect certainty.",
        explanationJa: "目標は完璧な確実性ではなく、より強い判断です。"
      },
      {
        question: "What does probability-based thinking help reduce?",
        questionJa: "確率で考えることは何を減らす助けになりますか？",
        options: [
          "Overconfidence",
          "The need to think",
          "All uncertainty",
          "All downside"
        ],
        optionsJa: [
          "過信",
          "考える必要そのもの",
          "すべての不確実性",
          "すべての下振れ"
        ],
        answerIndex: 0,
        explanation: "Probability thinking reduces rigid certainty and overconfidence.",
        explanationJa: "確率思考は、硬直した断定や過信を減らします。"
      },
      {
        question: "Why should a decision not be judged only by one outcome?",
        questionJa: "なぜ判断を1つの結果だけで評価してはいけないのですか？",
        options: [
          "Because luck can affect short-term results",
          "Because outcomes do not matter at all",
          "Because all decisions are equal",
          "Because analysis should be ignored"
        ],
        optionsJa: [
          "運が短期結果に影響することがあるから",
          "結果はまったく重要ではないから",
          "すべての判断が同じだから",
          "分析は無視すべきだから"
        ],
        answerIndex: 0,
        explanation: "A single result may reflect luck as well as judgment.",
        explanationJa: "1つの結果には、判断だけでなく運も反映されることがあります。"
      },
      {
        question: "Why are base rates useful?",
        questionJa: "なぜベースレートが役立つのですか？",
        options: [
          "Because they add broader context before special assumptions",
          "Because they guarantee winning ideas",
          "Because they remove uncertainty",
          "Because they replace all research"
        ],
        optionsJa: [
          "特別な仮定の前に広い文脈を加えるから",
          "勝てる考えを保証するから",
          "不確実性をなくすから",
          "すべての調査の代わりになるから"
        ],
        answerIndex: 0,
        explanation: "Base rates help keep analysis realistic and grounded.",
        explanationJa: "ベースレートは、分析を現実的で地に足のついたものにする助けになります。"
      }
    ]
  },

  {
    id: "level-6",
    title: "Level 6 — Understanding Business Models",
    desc: "Learn how companies actually make money and why that changes analysis.",
    title_ja: "レベル6 — ビジネスモデルを理解する",
    desc_ja: "企業が実際にどうお金を稼ぐのか、そしてそれが分析をどう変えるのかを学ぶ。",
    lessons: [
      {
        slug: "how-a-business-makes-money",
        title: "How a business makes money",
        desc: "Learn the basic question behind every company: where the money comes from.",
        title_ja: "会社はどうやってお金を稼ぐのか",
        desc_ja: "すべての会社でまず考えるべき、『収益はどこから来るのか』を学ぶ。",
        body_en: [
          CORELEARN_DISCLAIMER_EN,
          "A business model explains how a company makes money.",
          "It includes what the company sells, who it sells to, and why customers pay for it.",
          "Understanding the business model helps make financial numbers more meaningful.",
          "Before judging a stock, it helps to understand the engine behind the business."
        ],
        body_ja: [
          CORELEARN_DISCLAIMER_JA,
          "ビジネスモデルとは、会社がどのようにお金を稼ぐかを説明するものです。",
          "そこには、何を売るのか、誰に売るのか、なぜ顧客がお金を払うのかが含まれます。",
          "ビジネスモデルを理解すると、財務数字の意味も分かりやすくなります。",
          "株を見る前に、その会社の稼ぐ仕組みを理解することが役立ちます。"
        ],
        example_en: "A software company may earn money from subscriptions, while a retailer earns money from selling products.",
        example_ja: "ソフトウェア会社はサブスクリプションで稼ぎ、小売会社は商品の販売で稼ぐことがあります。",
        mistake_en: "Do not look at stock price without understanding how the company actually earns money.",
        mistake_ja: "会社がどう稼ぐのかを理解せずに株価だけを見ないでください。",
        quickCheck: {
          question: "What does a business model explain?",
          questionJa: "ビジネスモデルは何を説明しますか？",
          options: [
            "How a company makes money",
            "Only the company logo",
            "Only the stock chart",
            "Only the CEO’s background"
          ],
          optionsJa: [
            "会社がどうお金を稼ぐか",
            "会社のロゴだけ",
            "株価チャートだけ",
            "CEOの経歴だけ"
          ],
          answerIndex: 0,
          explanation: "A business model explains how the company generates revenue.",
          explanationJa: "ビジネスモデルは、その会社がどう収益を生み出すかを説明します。"
        },
        visuals: []
      },
      {
        slug: "different-business-models",
        title: "Different types of business models",
        desc: "Learn that companies can earn money in very different ways.",
        title_ja: "さまざまなビジネスモデル",
        desc_ja: "企業によって稼ぎ方が大きく異なることを学ぶ。",
        body_en: [
          CORELEARN_DISCLAIMER_EN,
          "Not all companies make money in the same way.",
          "Some sell products, some sell services, some charge subscriptions, and some earn from advertising or platforms.",
          "Different business models often have different risks, margins, and growth patterns.",
          "This is why two companies with similar revenue can still be very different businesses."
        ],
        body_ja: [
          CORELEARN_DISCLAIMER_JA,
          "すべての会社が同じ方法でお金を稼ぐわけではありません。",
          "商品を売る会社もあれば、サービスを売る会社、定額課金を行う会社、広告やプラットフォーム収益で稼ぐ会社もあります。",
          "ビジネスモデルが違えば、リスク、利益率、成長パターンも違いやすいです。",
          "そのため、売上が似ていても、まったく違う会社であることがあります。"
        ],
        example_en: "A grocery chain and a software company may both be large, but their margins and business models can be very different.",
        example_ja: "スーパー企業とソフトウェア会社は、どちらも大きくても、利益率やビジネスモデルが大きく異なることがあります。",
        mistake_en: "Do not compare two companies as if they work the same way when their models are very different.",
        mistake_ja: "ビジネスモデルが大きく違う会社を、同じ仕組みで動いているかのように比較しないでください。",
        quickCheck: {
          question: "Why do different business models matter?",
          questionJa: "なぜビジネスモデルの違いが重要なのですか？",
          options: [
            "Because risks, margins, and growth patterns can differ",
            "Because stock prices never change",
            "Because all businesses work the same way",
            "Because it removes the need for analysis"
          ],
          optionsJa: [
            "リスク、利益率、成長パターンが異なることがあるから",
            "株価が変わらないから",
            "すべての会社が同じ仕組みで動くから",
            "分析が不要になるから"
          ],
          answerIndex: 0,
          explanation: "Different business models create different business realities.",
          explanationJa: "ビジネスモデルが違えば、会社の現実も違ってきます。"
        },
        visuals: []
      },
      {
        slug: "recurring-vs-one-time-revenue",
        title: "Recurring vs one-time revenue",
        desc: "Learn why some revenue streams may look steadier than others.",
        title_ja: "継続収益と一回限りの収益",
        desc_ja: "収益の中には、他より安定して見えやすいものがある理由を学ぶ。",
        body_en: [
          CORELEARN_DISCLAIMER_EN,
          "Recurring revenue means money that tends to repeat over time, such as subscriptions or long-term contracts.",
          "One-time revenue depends more on each separate sale.",
          "Recurring revenue may suggest more visibility, while one-time revenue may be less predictable.",
          "This distinction helps explain why some business models are valued differently."
        ],
        body_ja: [
          CORELEARN_DISCLAIMER_JA,
          "継続収益とは、サブスクリプションや長期契約のように、時間を通じて繰り返し入りやすい収益です。",
          "一回限りの収益は、その都度の販売により強く依存します。",
          "継続収益は見通しの立てやすさを示すことがあり、一回限りの収益は予測しにくい場合があります。",
          "この違いを理解すると、なぜ一部の会社が違う評価を受けるのかが分かりやすくなります。"
        ],
        example_en: "A subscription software company may have more recurring revenue than a company that relies only on one-time hardware sales.",
        example_ja: "サブスクリプション型ソフトウェア会社は、一回限りの機器販売に頼る会社より継続収益が多いことがあります。",
        mistake_en: "Do not assume all revenue has the same quality or predictability.",
        mistake_ja: "すべての収益が同じ質や予測可能性を持つと思わないでください。",
        quickCheck: {
          question: "What is recurring revenue?",
          questionJa: "継続収益とは何ですか？",
          options: [
            "Revenue that tends to repeat over time",
            "A one-time sale only",
            "A company expense",
            "A stock market fee"
          ],
          optionsJa: [
            "時間とともに繰り返し入りやすい収益",
            "一回限りの販売だけ",
            "会社の費用",
            "市場手数料"
          ],
          answerIndex: 0,
          explanation: "Recurring revenue is revenue that tends to come back regularly.",
          explanationJa: "継続収益とは、定期的に繰り返し入りやすい収益のことです。"
        },
        visuals: []
      },
      {
        slug: "customers-and-dependence",
        title: "Customers and dependence",
        desc: "Learn why customer concentration and dependence matter.",
        title_ja: "顧客と依存度",
        desc_ja: "顧客集中や依存の大きさがなぜ重要かを学ぶ。",
        body_en: [
          CORELEARN_DISCLAIMER_EN,
          "A company is often stronger when it is not overly dependent on one customer, one product, or one source of demand.",
          "Heavy dependence can create fragility.",
          "If one relationship matters too much, the business may face bigger risk if that relationship weakens.",
          "Understanding dependence helps reveal hidden concentration risk."
        ],
        body_ja: [
          CORELEARN_DISCLAIMER_JA,
          "1社の顧客、1つの商品、1つの需要源に過度に依存していない会社は、より強いことが多いです。",
          "依存が大きいと、事業はもろくなりやすいです。",
          "1つの関係の重要性が高すぎると、それが弱まったときに大きなリスクを抱える可能性があります。",
          "依存度を理解すると、見えにくい集中リスクに気づきやすくなります。"
        ],
        example_en: "If one customer generates a huge portion of company revenue, losing that customer could hurt the business badly.",
        example_ja: "1社の顧客が売上の大部分を占めるなら、その顧客を失うことは会社に大きな打撃を与える可能性があります。",
        mistake_en: "Do not assume revenue is automatically safe without asking where it comes from.",
        mistake_ja: "収益がどこから来ているかを見ずに、自動的に安全だと思わないでください。",
        quickCheck: {
          question: "Why can heavy customer dependence be risky?",
          questionJa: "なぜ顧客への強い依存はリスクになりうるのですか？",
          options: [
            "Because losing one key relationship can hurt the business a lot",
            "Because it guarantees stronger growth",
            "Because it removes competition",
            "Because it makes all revenue recurring"
          ],
          optionsJa: [
            "重要な1つの関係を失うと大きな打撃になることがあるから",
            "より強い成長を保証するから",
            "競争をなくすから",
            "すべての収益を継続収益にするから"
          ],
          answerIndex: 0,
          explanation: "Heavy dependence increases fragility if one major source weakens.",
          explanationJa: "強い依存は、1つの大きな源が弱まったときのもろさを高めます。"
        },
        visuals: []
      }
    ],
    levelQuiz: [
      {
        question: "What does a business model explain?",
        questionJa: "ビジネスモデルは何を説明しますか？",
        options: [
          "How a company makes money",
          "Only the stock chart",
          "Only the CEO’s background",
          "Only the company logo"
        ],
        optionsJa: [
          "会社がどうお金を稼ぐか",
          "株価チャートだけ",
          "CEOの経歴だけ",
          "会社のロゴだけ"
        ],
        answerIndex: 0,
        explanation: "A business model explains how a company generates revenue.",
        explanationJa: "ビジネスモデルは、会社がどう収益を生み出すかを説明します。"
      },
      {
        question: "Why do different business models matter?",
        questionJa: "なぜビジネスモデルの違いが重要なのですか？",
        options: [
          "Because risks, margins, and growth patterns can differ",
          "Because all businesses work the same way",
          "Because stock prices never move",
          "Because analysis becomes unnecessary"
        ],
        optionsJa: [
          "リスク、利益率、成長パターンが異なることがあるから",
          "すべての会社が同じ仕組みで動くから",
          "株価がまったく動かないから",
          "分析が不要になるから"
        ],
        answerIndex: 0,
        explanation: "Different business models often create different business economics.",
        explanationJa: "ビジネスモデルが違えば、会社の経済構造も違いやすくなります。"
      },
      {
        question: "What is recurring revenue?",
        questionJa: "継続収益とは何ですか？",
        options: [
          "Revenue that tends to repeat over time",
          "A one-time sale only",
          "A company expense",
          "A market fee"
        ],
        optionsJa: [
          "時間とともに繰り返し入りやすい収益",
          "一回限りの販売だけ",
          "会社の費用",
          "市場手数料"
        ],
        answerIndex: 0,
        explanation: "Recurring revenue tends to come back repeatedly over time.",
        explanationJa: "継続収益は、時間とともに繰り返し入りやすい収益です。"
      },
      {
        question: "Why can customer concentration be risky?",
        questionJa: "なぜ顧客集中はリスクになりうるのですか？",
        options: [
          "Because losing one major customer can hurt the business a lot",
          "Because it guarantees stability",
          "Because it removes uncertainty",
          "Because it makes revenue higher quality automatically"
        ],
        optionsJa: [
          "大口顧客を1社失うだけで大きな打撃になることがあるから",
          "安定を保証するから",
          "不確実性をなくすから",
          "収益の質を自動的に高めるから"
        ],
        answerIndex: 0,
        explanation: "Customer concentration can make a business more fragile.",
        explanationJa: "顧客集中は、事業をよりもろくする可能性があります。"
      }
    ]
  },
{
  id: "level-7",
  title: "Level 7 — Competitive Advantage",
  desc: "Learn why some businesses stay strong while others struggle.",
  title_ja: "レベル7 — 競争優位",
  desc_ja: "なぜ強い会社は長く強く、弱い会社は苦しくなるのかを学ぶ。",
  lessons: [
    {
      slug: "what-is-competitive-advantage",
      title: "What is competitive advantage?",
      desc: "Understand why some companies maintain strong positions in their industry.",
      title_ja: "競争優位とは何か",
      desc_ja: "なぜ一部の会社は業界で強い立場を維持できるのかを理解する。",
      body_en: [
        CORELEARN_DISCLAIMER_EN,
        "A competitive advantage is something that allows a company to perform better than its competitors.",
        "It may come from cost advantages, brand strength, technology, network effects, or scale.",
        "Companies with stronger advantages may maintain profitability or market share longer.",
        "Understanding advantage helps explain why some companies remain dominant."
      ],
      body_ja: [
        CORELEARN_DISCLAIMER_JA,
        "競争優位とは、会社が競合より有利に事業を行える要因です。",
        "コスト優位、ブランド力、技術、ネットワーク効果、規模などが含まれることがあります。",
        "競争優位が強い会社は、利益や市場シェアを長く維持できる場合があります。",
        "この概念を理解すると、なぜ一部の会社が長く強いのかが分かりやすくなります。"
      ],
      example_en: "A company with strong brand loyalty may keep customers even when competitors appear.",
      example_ja: "強いブランドを持つ会社は、競合が現れても顧客を維持できることがあります。",
      mistake_en: "Do not assume a company is strong forever just because it is strong today.",
      mistake_ja: "今強いからといって、永遠に強いとは限りません。",
      quickCheck: {
        question: "What is a competitive advantage?",
        questionJa: "競争優位とは何ですか？",
        options: [
          "Something that allows a company to perform better than competitors",
          "A government tax rule",
          "A stock chart pattern",
          "A dividend payment"
        ],
        optionsJa: [
          "会社が競合より有利に事業を行える要因",
          "政府の税制",
          "チャートパターン",
          "配当金"
        ],
        answerIndex: 0,
        explanation: "Competitive advantage helps companies outperform competitors.",
        explanationJa: "競争優位は会社が競合より有利になる要因です。"
      },
      visuals: []
    },
    {
      slug: "economies-of-scale",
      title: "Economies of scale",
      desc: "Learn why larger companies sometimes gain cost advantages.",
      title_ja: "規模の経済",
      desc_ja: "大きな会社がコスト優位を持つ理由を学ぶ。",
      body_en: [
        CORELEARN_DISCLAIMER_EN,
        "Economies of scale occur when a company lowers costs as production increases.",
        "Larger companies may spread fixed costs across more units.",
        "This can allow them to price competitively while remaining profitable.",
        "Scale advantages can make it harder for smaller competitors to compete."
      ],
      body_ja: [
        CORELEARN_DISCLAIMER_JA,
        "規模の経済とは、生産量が増えるほどコストが下がる現象です。",
        "大きな会社は固定費をより多くの製品に分散できます。",
        "その結果、競争力のある価格でも利益を保てる場合があります。",
        "規模の優位は小さな競合にとって参入を難しくすることがあります。"
      ],
      example_en: "A large retailer may negotiate lower supplier prices than smaller competitors.",
      example_ja: "大規模な小売企業は、小さな競合より低い仕入れ価格を得られることがあります。",
      mistake_en: "Do not assume size always guarantees strength.",
      mistake_ja: "会社が大きいから必ず強いとは限りません。",
      quickCheck: {
        question: "What is economies of scale?",
        questionJa: "規模の経済とは何ですか？",
        options: [
          "Costs decreasing as production increases",
          "Stock price always rising",
          "Government subsidies",
          "Tax deductions"
        ],
        optionsJa: [
          "生産量が増えるほどコストが下がること",
          "株価が常に上がること",
          "政府補助金",
          "税控除"
        ],
        answerIndex: 0,
        explanation: "Economies of scale describe cost advantages from larger production.",
        explanationJa: "規模の経済は、生産拡大によるコスト優位を示します。"
      },
      visuals: []
    },
    {
      slug: "network-effects",
      title: "Network effects",
      desc: "Learn why some platforms become stronger as more users join.",
      title_ja: "ネットワーク効果",
      desc_ja: "利用者が増えるほど強くなるビジネスを理解する。",
      body_en: [
        CORELEARN_DISCLAIMER_EN,
        "A network effect occurs when a product becomes more valuable as more people use it.",
        "This is common in platforms, marketplaces, and social networks.",
        "As usage grows, it may become harder for new competitors to attract users.",
        "Network effects can strengthen competitive advantages over time."
      ],
      body_ja: [
        CORELEARN_DISCLAIMER_JA,
        "ネットワーク効果とは、利用者が増えるほど製品やサービスの価値が高まる現象です。",
        "プラットフォーム、マーケットプレイス、SNSなどでよく見られます。",
        "利用者が増えるほど、新しい競合が顧客を集めにくくなることがあります。",
        "ネットワーク効果は競争優位を強めることがあります。"
      ],
      example_en: "A messaging platform becomes more useful as more friends join.",
      example_ja: "メッセージアプリは友人が増えるほど便利になります。",
      mistake_en: "Do not assume every tech company automatically has strong network effects.",
      mistake_ja: "すべてのテック企業が強いネットワーク効果を持つわけではありません。",
      quickCheck: {
        question: "What is a network effect?",
        questionJa: "ネットワーク効果とは何ですか？",
        options: [
          "Value increasing as more users join",
          "A government regulation",
          "A stock market fee",
          "A dividend policy"
        ],
        optionsJa: [
          "利用者が増えるほど価値が高まること",
          "政府規制",
          "市場手数料",
          "配当政策"
        ],
        answerIndex: 0,
        explanation: "Network effects make products more valuable as usage grows.",
        explanationJa: "ネットワーク効果は利用者が増えるほど価値が高まる仕組みです。"
      },
      visuals: []
    },
    {
      slug: "moats-and-durability",
      title: "Moats and durability",
      desc: "Understand why some advantages last longer than others.",
      title_ja: "モートと持続性",
      desc_ja: "競争優位がどれくらい続くかを考える。",
      body_en: [
        CORELEARN_DISCLAIMER_EN,
        "A moat refers to a durable competitive advantage protecting a company.",
        "Strong moats may come from brand, scale, technology, switching costs, or network effects.",
        "Durability matters because advantages can weaken over time.",
        "Long-lasting advantages often explain sustained profitability."
      ],
      body_ja: [
        CORELEARN_DISCLAIMER_JA,
        "モートとは、会社を守る持続的な競争優位のことです。",
        "ブランド、規模、技術、乗り換えコスト、ネットワーク効果などが含まれます。",
        "持続性が重要なのは、優位性が時間とともに弱まることがあるためです。",
        "長く続く優位性は、持続的な利益の理由になることがあります。"
      ],
      example_en: "A global brand may maintain customer trust for decades.",
      example_ja: "世界的ブランドは何十年も顧客の信頼を維持できることがあります。",
      mistake_en: "Do not assume every advantage lasts forever.",
      mistake_ja: "すべての優位性が永遠に続くと思わないでください。",
      quickCheck: {
        question: "What does a moat describe?",
        questionJa: "モートとは何を表しますか？",
        options: [
          "A durable competitive advantage",
          "A dividend payment",
          "A trading strategy",
          "A stock split"
        ],
        optionsJa: [
          "持続的な競争優位",
          "配当金",
          "トレード戦略",
          "株式分割"
        ],
        answerIndex: 0,
        explanation: "A moat protects a company from competition.",
        explanationJa: "モートは会社を競争から守る優位性です。"
      },
      visuals: []
    }
  ],
  levelQuiz: [
    {
      question: "What is a competitive advantage?",
      questionJa: "競争優位とは何ですか？",
      options: [
        "Something that allows a company to outperform competitors",
        "A tax rule",
        "A dividend policy",
        "A chart indicator"
      ],
      optionsJa: [
        "競合より有利になる要因",
        "税ルール",
        "配当政策",
        "チャート指標"
      ],
      answerIndex: 0,
      explanation: "Competitive advantage explains why some firms outperform others.",
      explanationJa: "競争優位は、なぜ一部の企業が他より強いのかを説明します。"
    },
    {
      question: "What is economies of scale?",
      questionJa: "規模の経済とは何ですか？",
      options: [
        "Costs falling as production grows",
        "Stock price rising automatically",
        "Government subsidies",
        "A dividend increase"
      ],
      optionsJa: [
        "生産拡大でコストが下がること",
        "株価が自動的に上がること",
        "政府補助金",
        "配当増加"
      ],
      answerIndex: 0,
      explanation: "Economies of scale create cost advantages.",
      explanationJa: "規模の経済はコスト優位を生みます。"
    },
    {
      question: "What is a network effect?",
      questionJa: "ネットワーク効果とは何ですか？",
      options: [
        "Value increasing as more users join",
        "Tax policy",
        "A market fee",
        "A dividend rule"
      ],
      optionsJa: [
        "利用者が増えるほど価値が上がること",
        "税政策",
        "市場手数料",
        "配当ルール"
      ],
      answerIndex: 0,
      explanation: "Network effects strengthen platforms as users grow.",
      explanationJa: "ネットワーク効果は利用者が増えるほど強くなります。"
    },
    {
      question: "What does a moat represent?",
      questionJa: "モートとは何を意味しますか？",
      options: [
        "A durable competitive advantage",
        "A trading signal",
        "A dividend policy",
        "A stock chart"
      ],
      optionsJa: [
        "持続的な競争優位",
        "売買シグナル",
        "配当政策",
        "株価チャート"
      ],
      answerIndex: 0,
      explanation: "A moat protects a company from competition.",
      explanationJa: "モートは競争から会社を守る優位性です。"
    }
  ]
},
{
  id: "level-8",
  title: "Level 8 — Market Cycles",
  desc: "Learn how broader market conditions influence stocks.",
  title_ja: "レベル8 — 市場サイクル",
  desc_ja: "市場全体の環境が株にどう影響するかを学ぶ。",
  lessons: [
    {
      slug: "markets-move-in-cycles",
      title: "Markets move in cycles",
      desc: "Understand that markets move through phases over time.",
      title_ja: "市場はサイクルで動く",
      desc_ja: "市場が時間とともに段階的に動くことを理解する。",
      body_en: [
        CORELEARN_DISCLAIMER_EN,
        "Markets do not move in a straight line.",
        "They tend to move through periods of expansion, optimism, slowdown, and recovery.",
        "These phases are often called market cycles.",
        "Understanding cycles helps learners avoid assuming current conditions last forever."
      ],
      body_ja: [
        CORELEARN_DISCLAIMER_JA,
        "市場は一直線には動きません。",
        "拡大、楽観、減速、回復といった段階を繰り返すことがあります。",
        "これらの段階は市場サイクルと呼ばれます。",
        "サイクルを理解すると、現在の状況が永遠に続くと考える誤りを避けやすくなります。"
      ],
      example_en: "After strong growth periods, markets may slow before recovering again.",
      example_ja: "強い成長期の後、市場は減速してから再び回復することがあります。",
      mistake_en: "Do not assume the current market environment will last forever.",
      mistake_ja: "現在の市場環境が永遠に続くと思わないでください。",
      quickCheck: {
        question: "What are market cycles?",
        questionJa: "市場サイクルとは何ですか？",
        options: [
          "Phases markets move through over time",
          "Daily trading rules",
          "Tax changes",
          "Dividend schedules"
        ],
        optionsJa: [
          "時間とともに繰り返す市場の段階",
          "日々の取引ルール",
          "税制変更",
          "配当スケジュール"
        ],
        answerIndex: 0,
        explanation: "Market cycles describe repeating phases in markets.",
        explanationJa: "市場サイクルは市場の段階的変化を指します。"
      },
      visuals: []
    },
    {
      slug: "bull-and-bear-markets",
      title: "Bull and bear markets",
      desc: "Learn the basic difference between rising and falling market environments.",
      title_ja: "ブル市場とベア市場",
      desc_ja: "上昇市場と下降市場の基本を理解する。",
      body_en: [
        CORELEARN_DISCLAIMER_EN,
        "A bull market refers to a period where prices trend upward.",
        "A bear market refers to a period where prices trend downward.",
        "These environments often influence investor sentiment and behavior.",
        "Recognizing the environment helps provide context for market movements."
      ],
      body_ja: [
        CORELEARN_DISCLAIMER_JA,
        "ブル市場とは、価格が上昇傾向にある期間です。",
        "ベア市場とは、価格が下降傾向にある期間です。",
        "これらの環境は投資家心理に影響を与えることがあります。",
        "環境を理解すると市場の動きの文脈が見えやすくなります。"
      ],
      example_en: "Strong economic periods often coincide with bull markets.",
      example_ja: "強い経済環境はブル市場と重なることがあります。",
      mistake_en: "Do not assume bull markets last forever.",
      mistake_ja: "ブル市場が永遠に続くと思わないでください。",
      quickCheck: {
        question: "What describes a bull market?",
        questionJa: "ブル市場とは何ですか？",
        options: [
          "A period of rising prices",
          "A tax increase",
          "A trading order",
          "A dividend cut"
        ],
        optionsJa: [
          "価格が上昇する期間",
          "税金の増加",
          "注文方法",
          "配当削減"
        ],
        answerIndex: 0,
        explanation: "Bull markets describe rising price environments.",
        explanationJa: "ブル市場は価格上昇の環境です。"
      },
      visuals: []
    },
    {
      slug: "sentiment-and-expectations",
      title: "Sentiment and expectations",
      desc: "Understand how market psychology influences prices.",
      title_ja: "センチメントと期待",
      desc_ja: "市場心理が価格に与える影響を理解する。",
      body_en: [
        CORELEARN_DISCLAIMER_EN,
        "Market sentiment refers to the overall mood or attitude of investors.",
        "Optimistic sentiment may push prices higher, while pessimistic sentiment may push prices lower.",
        "Prices often move based on changing expectations rather than current facts alone.",
        "Recognizing sentiment helps explain short-term volatility."
      ],
      body_ja: [
        CORELEARN_DISCLAIMER_JA,
        "センチメントとは投資家全体の心理や雰囲気を指します。",
        "楽観的な心理は価格を押し上げ、悲観的な心理は価格を押し下げることがあります。",
        "価格は現在の事実だけでなく、期待の変化によって動くことがあります。",
        "センチメントを理解すると短期的な値動きが説明しやすくなります。"
      ],
      example_en: "Markets may fall quickly when expectations suddenly worsen.",
      example_ja: "期待が急に悪化すると市場は急落することがあります。",
      mistake_en: "Do not confuse short-term sentiment with long-term business quality.",
      mistake_ja: "短期的な心理と長期的な企業価値を混同しないでください。",
      quickCheck: {
        question: "What does market sentiment describe?",
        questionJa: "市場センチメントとは何を表しますか？",
        options: [
          "Investor mood and expectations",
          "Tax policies",
          "Stock dividends",
          "Company salaries"
        ],
        optionsJa: [
          "投資家の心理や期待",
          "税政策",
          "配当",
          "給与"
        ],
        answerIndex: 0,
        explanation: "Sentiment reflects investor psychology.",
        explanationJa: "センチメントは投資家心理を表します。"
      },
      visuals: []
    },
    {
      slug: "macro-environment",
      title: "Economic environment",
      desc: "Learn how broader economic conditions influence companies.",
      title_ja: "経済環境",
      desc_ja: "経済環境が企業に与える影響を学ぶ。",
      body_en: [
        CORELEARN_DISCLAIMER_EN,
        "Economic conditions such as growth, inflation, and interest rates influence businesses.",
        "Some industries perform differently depending on economic conditions.",
        "Understanding the macro environment provides context for company performance.",
        "It helps explain why entire sectors may rise or fall together."
      ],
      body_ja: [
        CORELEARN_DISCLAIMER_JA,
        "成長率、インフレ、金利などの経済環境は企業に影響します。",
        "業界によっては経済環境によって業績が変わることがあります。",
        "マクロ環境を理解すると企業の状況を広い視点で見られます。",
        "それにより業界全体が同時に動く理由が分かりやすくなります。"
      ],
      example_en: "Rising interest rates may affect borrowing-dependent businesses.",
      example_ja: "金利上昇は借入依存の企業に影響することがあります。",
      mistake_en: "Do not analyze companies completely in isolation from the economy.",
      mistake_ja: "経済環境を無視して企業を完全に個別で分析しないでください。",
      quickCheck: {
        question: "Why does the economic environment matter?",
        questionJa: "なぜ経済環境が重要なのですか？",
        options: [
          "Because it influences companies and industries",
          "Because it controls stock charts",
          "Because it eliminates risk",
          "Because it guarantees profit"
        ],
        optionsJa: [
          "企業や業界に影響するから",
          "チャートを操作するから",
          "リスクを消すから",
          "利益を保証するから"
        ],
        answerIndex: 0,
        explanation: "Economic conditions influence businesses and markets.",
        explanationJa: "経済環境は企業や市場に影響します。"
      },
      visuals: []
    }
  ],
  levelQuiz: [
    {
      question: "What are market cycles?",
      questionJa: "市場サイクルとは何ですか？",
      options: [
        "Phases markets move through over time",
        "Trading fees",
        "Dividend payments",
        "Tax changes"
      ],
      optionsJa: [
        "時間とともに繰り返す市場の段階",
        "取引手数料",
        "配当",
        "税制変更"
      ],
      answerIndex: 0,
      explanation: "Market cycles describe repeating phases.",
      explanationJa: "市場サイクルは繰り返される段階です。"
    },
    {
      question: "What describes a bull market?",
      questionJa: "ブル市場とは何ですか？",
      options: [
        "A period of rising prices",
        "A tax rule",
        "A dividend cut",
        "A market closure"
      ],
      optionsJa: [
        "価格が上昇する期間",
        "税ルール",
        "配当削減",
        "市場閉鎖"
      ],
      answerIndex: 0,
      explanation: "Bull markets are rising price environments.",
      explanationJa: "ブル市場は価格上昇の環境です。"
    },
    {
      question: "What does market sentiment describe?",
      questionJa: "市場センチメントとは何ですか？",
      options: [
        "Investor mood and expectations",
        "Tax law",
        "Stock splits",
        "Company salaries"
      ],
      optionsJa: [
        "投資家の心理や期待",
        "税法",
        "株式分割",
        "給与"
      ],
      answerIndex: 0,
      explanation: "Sentiment reflects investor psychology.",
      explanationJa: "センチメントは投資家心理です。"
    },
    {
      question: "Why does the economic environment matter?",
      questionJa: "なぜ経済環境が重要ですか？",
      options: [
        "Because it influences companies and industries",
        "Because it guarantees profits",
        "Because it removes risk",
        "Because it predicts prices perfectly"
      ],
      optionsJa: [
        "企業や業界に影響するから",
        "利益を保証するから",
        "リスクをなくすから",
        "価格を完全に予測するから"
      ],
      answerIndex: 0,
      explanation: "Economic conditions influence business performance.",
      explanationJa: "経済環境は企業業績に影響します。"
    }
  ]
},
{
  id: "level-9",
  title: "Level 9 — Building a Thesis",
  desc: "Learn how to organize a structured view about a company.",
  title_ja: "レベル9 — 投資仮説を組み立てる",
  desc_ja: "企業について構造的な考え方を整理する方法を学ぶ。",
  lessons: [
    {
      slug: "what-is-a-thesis",
      title: "What is a thesis?",
      desc: "Understand the idea of forming a structured view about a company.",
      title_ja: "仮説とは何か",
      desc_ja: "企業について構造的な見方を作る考え方を理解する。",
      body_en: [
        CORELEARN_DISCLAIMER_EN,
        "A thesis is a structured explanation of how you understand a company and its situation.",
        "It combines information about the business, risks, opportunities, and expectations.",
        "A thesis is not a prediction of certainty.",
        "It is simply a way to organize your thinking."
      ],
      body_ja: [
        CORELEARN_DISCLAIMER_JA,
        "仮説とは、企業やその状況についての理解を整理した説明です。",
        "そこには事業、リスク、機会、期待などの要素が含まれます。",
        "仮説は確実な予測ではありません。",
        "思考を整理するための方法です。"
      ],
      example_en: "Someone might believe a company will grow because its market is expanding and its product is competitive.",
      example_ja: "市場が拡大しており製品競争力があるため成長すると考えることがあります。",
      mistake_en: "Do not confuse a thesis with guaranteed outcomes.",
      mistake_ja: "仮説を結果保証だと思わないでください。",
      quickCheck: {
        question: "What is a thesis in stock analysis?",
        questionJa: "株の分析における仮説とは何ですか？",
        options: [
          "A structured explanation of how you understand a company",
          "A guaranteed forecast",
          "A government policy",
          "A chart pattern"
        ],
        optionsJa: [
          "企業理解を整理した説明",
          "保証された予測",
          "政府政策",
          "チャートパターン"
        ],
        answerIndex: 0,
        explanation: "A thesis organizes reasoning about a company.",
        explanationJa: "仮説は企業についての考え方を整理します。"
      },
      visuals: []
    },
    {
      slug: "thesis-components",
      title: "Parts of a thesis",
      desc: "Learn the basic elements that make up a structured view.",
      title_ja: "仮説の構成要素",
      desc_ja: "仮説を構成する基本要素を学ぶ。",
      body_en: [
        CORELEARN_DISCLAIMER_EN,
        "A basic thesis usually includes several components.",
        "These may include the business model, growth drivers, risks, and competitive position.",
        "It also considers broader factors such as market conditions.",
        "Combining these ideas creates a clearer view."
      ],
      body_ja: [
        CORELEARN_DISCLAIMER_JA,
        "基本的な仮説にはいくつかの要素があります。",
        "ビジネスモデル、成長要因、リスク、競争環境などが含まれます。",
        "市場環境などの広い要素も考慮されます。",
        "これらを組み合わせるとより明確な視点になります。"
      ],
      example_en: "Someone analyzing a company might look at growth, competition, and industry demand together.",
      example_ja: "企業分析では成長、競争、業界需要を一緒に考えることがあります。",
      mistake_en: "Do not focus on only one factor while ignoring the rest.",
      mistake_ja: "1つの要素だけを見て他を無視しないでください。",
      quickCheck: {
        question: "What are common parts of a thesis?",
        questionJa: "仮説の一般的な要素は何ですか？",
        options: [
          "Business model, growth, risks, competition",
          "Only stock price",
          "Only dividends",
          "Only chart patterns"
        ],
        optionsJa: [
          "ビジネスモデル、成長、リスク、競争",
          "株価だけ",
          "配当だけ",
          "チャートだけ"
        ],
        answerIndex: 0,
        explanation: "A thesis usually combines several perspectives.",
        explanationJa: "仮説は複数の視点を組み合わせます。"
      },
      visuals: []
    },
    {
  slug: "how-to-judge-a-single-company",
  title: "How to judge a single company",
  desc: "Learn a simple step-by-step way to judge one company without turning analysis into hype or guessing.",
  title_ja: "1社をどう判断するか",
  desc_ja: "1つの会社を、熱狂や当てずっぽうにせず段階的に判断する基本方法を学ぶ。",
  body_en: [
    CORELEARN_DISCLAIMER_EN,
    "A simple beginner framework for judging one company is: understand the business, check the numbers, check the risks, compare it to peers, and explain your reasoning clearly.",
    "First, understand what the company actually does and how it makes money.",
    "Second, check basic financial signs such as revenue, profit, margin, and guidance.",
    "Third, identify the main risks. Ask what could weaken the business or market expectations.",
    "Fourth, compare the company with similar businesses in the same sector.",
    "Fifth, explain your view in plain language. If you cannot explain it clearly, your understanding may still be weak."
  ],
  body_ja: [
    CORELEARN_DISCLAIMER_JA,
    "初心者向けに1社を判断する基本フレームは、『事業を理解する、数字を見る、リスクを見る、同業他社と比べる、理由を言葉で説明する』です。",
    "まず、その会社が実際に何をしていて、どうお金を稼ぐのかを理解します。",
    "次に、売上、利益、利益率、ガイダンスなどの基本的な数字を見ます。",
    "その後、何がその会社や市場の期待を弱めるのかという主なリスクを確認します。",
    "さらに、同じセクターの似た会社と比較します。",
    "最後に、自分の見方をシンプルな言葉で説明します。はっきり説明できないなら、理解はまだ浅い可能性があります。"
  ],
  example_en: "A beginner might say: this company has strong revenue growth, decent margins, clear demand, but also faces heavy competition and high expectations.",
  example_ja: "初心者なら、『この会社は売上成長が強く、利益率も悪くなく、需要も明確だが、競争が激しく期待も高い』のように整理して説明できます。",
  mistake_en: "Do not judge a company from only one number, one headline, or one chart move.",
  mistake_ja: "1つの数字、1つのニュース、1回のチャート変動だけで会社を判断しないでください。",
  quickCheck: {
    question: "Which of these is part of a strong beginner company review?",
    questionJa: "初心者の会社分析として適切なのはどれですか？",
    options: [
      "Understand the business, numbers, risks, peers, and explain the reasoning",
      "Look only at the stock price",
      "Copy a social media opinion",
      "Judge from one green candle"
    ],
    optionsJa: [
      "事業、数字、リスク、同業比較を見て、理由を説明する",
      "株価だけを見る",
      "SNSの意見をそのまま真似する",
      "1本の陽線だけで判断する"
    ],
    answerIndex: 0,
    explanation: "A stronger review combines business understanding, financial basics, risk awareness, peer comparison, and explanation.",
    explanationJa: "より強い分析は、事業理解、基本的な数字、リスク意識、同業比較、理由の説明を組み合わせます。"
  },
  visuals: [
    {
      src: "/education/corelearn/frameworks/single-company-checklist.png",
      alt: "Simple framework for reviewing one company",
      caption: "Business, numbers, risks, peers, and reasoning."
    }
  ]
},
    {
      slug: "upside-and-risk",
      title: "Upside and risk",
      desc: "Learn why balanced thinking includes both opportunity and risk.",
      title_ja: "上振れとリスク",
      desc_ja: "機会とリスクの両方を考える重要性を学ぶ。",
      body_en: [
        CORELEARN_DISCLAIMER_EN,
        "Strong analysis considers both potential upside and possible risks.",
        "Upside refers to reasons a company could improve or grow.",
        "Risk refers to factors that could weaken results or expectations.",
        "Balanced thinking improves decision quality."
      ],
      body_ja: [
        CORELEARN_DISCLAIMER_JA,
        "強い分析では上振れとリスクの両方を考えます。",
        "上振れとは会社が成長する理由です。",
        "リスクとは結果を弱める可能性のある要因です。",
        "バランスの取れた思考は判断の質を高めます。"
      ],
      example_en: "A strong product may support growth, but competition may still create risk.",
      example_ja: "製品が強くても競争がリスクになることがあります。",
      mistake_en: "Do not focus only on optimistic outcomes.",
      mistake_ja: "楽観的な結果だけに集中しないでください。",
      quickCheck: {
        question: "What should balanced analysis include?",
        questionJa: "バランスの取れた分析には何が必要ですか？",
        options: [
          "Both upside and risk",
          "Only upside",
          "Only charts",
          "Only headlines"
        ],
        optionsJa: [
          "上振れとリスクの両方",
          "上振れだけ",
          "チャートだけ",
          "ニュースだけ"
        ],
        answerIndex: 0,
        explanation: "Balanced thinking includes opportunity and risk.",
        explanationJa: "バランスの思考には機会とリスクが含まれます。"
      },
      visuals: []
    },
    {
  slug: "risk-vs-reward",
  title: "Risk vs reward",
  desc: "Understand why a possible gain must be judged against possible loss.",
  title_ja: "リスクとリワード",
  desc_ja: "得られる可能性のある利益を、失う可能性のある損失と比較して考える。",
  body_en: [
    CORELEARN_DISCLAIMER_EN,
    "A basic question in analysis is whether the possible reward is worth the possible risk.",
    "A situation can sound exciting and still be weak if the downside is large and the upside is unclear.",
    "Stronger judgment comes from comparing both sides instead of staring only at what could go right.",
    "This does not require perfect prediction. It requires honest comparison."
  ],
  body_ja: [
    CORELEARN_DISCLAIMER_JA,
    "分析の基本的な問いの一つは、得られる可能性のあるリワードが、負う可能性のあるリスクに見合うかどうかです。",
    "魅力的に見える状況でも、下振れが大きく上振れが不明確なら弱いことがあります。",
    "強い判断は、うまくいく可能性だけを見るのではなく、両面を比較することで生まれます。",
    "これに完璧な予測は必要ありません。必要なのは正直な比較です。"
  ],
  example_en: "A stock with limited upside but severe downside is not automatically attractive just because the story sounds exciting.",
  example_ja: "上振れが小さく下振れが大きい株は、話が魅力的でも自動的に良いとは言えません。",
  mistake_en: "Do not focus only on the best-case outcome.",
  mistake_ja: "最良ケースだけに集中しないでください。",
  quickCheck: {
    question: "What does risk vs reward compare?",
    questionJa: "リスクとリワードは何を比較しますか？",
    options: [
      "Possible loss against possible gain",
      "Price against company logo",
      "Comments against rumors",
      "Dividend against chart color"
    ],
    optionsJa: [
      "失う可能性と得る可能性",
      "株価と会社ロゴ",
      "コメントと噂",
      "配当とチャートの色"
    ],
    answerIndex: 0,
    explanation: "It compares downside and upside.",
    explanationJa: "下振れと上振れを比較します。"
  },
  visuals: []
},
    {
      slug: "updating-your-view",
      title: "Updating your view",
      desc: "Learn that good thinking changes as new information appears.",
      title_ja: "見方を更新する",
      desc_ja: "新しい情報で考え方を更新することを学ぶ。",
      body_en: [
        CORELEARN_DISCLAIMER_EN,
        "A thesis is not permanent.",
        "New information may strengthen or weaken your view.",
        "Updating your thinking is part of learning.",
        "Flexible thinking often produces stronger understanding."
      ],
      body_ja: [
        CORELEARN_DISCLAIMER_JA,
        "仮説は永久ではありません。",
        "新しい情報によって考え方が強まったり弱まったりします。",
        "思考を更新することは学習の一部です。",
        "柔軟な思考はより強い理解につながります。"
      ],
      example_en: "A change in regulation may alter expectations about a company's future.",
      example_ja: "規制変更は企業の将来期待を変えることがあります。",
      mistake_en: "Do not treat your first idea as permanent truth.",
      mistake_ja: "最初の考えを絶対的な真実だと思わないでください。",
      quickCheck: {
        question: "Why should views be updated?",
        questionJa: "なぜ考え方を更新する必要がありますか？",
        options: [
          "Because new information appears",
          "Because markets never change",
          "Because opinions never matter",
          "Because charts decide everything"
        ],
        optionsJa: [
          "新しい情報が現れるから",
          "市場は変わらないから",
          "意見は重要でないから",
          "チャートがすべて決めるから"
        ],
        answerIndex: 0,
        explanation: "New information can change understanding.",
        explanationJa: "新しい情報は理解を変えることがあります。"
      },
      visuals: []
    }
  ],
  levelQuiz: [
    {
      question: "What is a thesis?",
      questionJa: "仮説とは何ですか？",
      options: [
        "A structured explanation of how you understand a company",
        "A guaranteed prediction",
        "A tax rule",
        "A trading signal"
      ],
      optionsJa: [
        "企業理解を整理した説明",
        "保証された予測",
        "税ルール",
        "売買シグナル"
      ],
      answerIndex: 0,
      explanation: "A thesis organizes reasoning about a company.",
      explanationJa: "仮説は企業理解を整理します。"
    },
    {
      question: "What should a thesis include?",
      questionJa: "仮説には何が含まれるべきですか？",
      options: [
        "Business model, growth, risk, competition",
        "Only stock price",
        "Only dividends",
        "Only charts"
      ],
      optionsJa: [
        "ビジネスモデル、成長、リスク、競争",
        "株価だけ",
        "配当だけ",
        "チャートだけ"
      ],
      answerIndex: 0,
      explanation: "Strong theses consider multiple factors.",
      explanationJa: "強い仮説は複数の要素を考えます。"
    },
    {
      question: "What improves balanced thinking?",
      questionJa: "バランスの取れた思考を作るものは何ですか？",
      options: [
        "Considering both upside and risk",
        "Ignoring risk",
        "Only optimism",
        "Only charts"
      ],
      optionsJa: [
        "上振れとリスクの両方を考える",
        "リスクを無視する",
        "楽観だけ",
        "チャートだけ"
      ],
      answerIndex: 0,
      explanation: "Balance requires thinking about opportunity and risk.",
      explanationJa: "バランスには機会とリスクの両方が必要です。"
    },
    {
  question: "What does risk vs reward compare?",
  questionJa: "リスクとリワードは何を比較しますか？",
  options: [
    "Possible loss against possible gain",
    "Price against company logo",
    "Comments against rumors",
    "Dividend against chart color"
  ],
  optionsJa: [
    "失う可能性と得る可能性",
    "株価と会社ロゴ",
    "コメントと噂",
    "配当とチャートの色"
  ],
  answerIndex: 0,
  explanation: "It compares downside and upside honestly.",
  explanationJa: "下振れと上振れを正直に比較する考え方です。"
},
    {
      question: "Why update a thesis?",
      questionJa: "なぜ仮説を更新する必要がありますか？",
      options: [
        "Because new information appears",
        "Because markets never change",
        "Because opinions never matter",
        "Because price decides everything"
      ],
      optionsJa: [
        "新しい情報が現れるから",
        "市場は変わらないから",
        "意見は重要でないから",
        "価格がすべて決めるから"
      ],
      answerIndex: 0,
      explanation: "Good thinking adapts to new information.",
      explanationJa: "良い思考は新しい情報に適応します。"
   }
  ]
},
  {
  id: "level-10",
  title: "Level 10 — Practical Readiness",
  desc: "Bridge theory and real-world restraint before touching a broker seriously.",
  title_ja: "レベル10 — 実践準備",
  desc_ja: "実際に証券口座で行動する前に、理論と慎重な実践判断をつなぐ。",
  lessons: [
    {
      slug: "read-a-stock-chart",
      title: "How to read a stock chart",
      desc: "Understand trend, volatility, range, and timeframe without pretending the chart tells you everything.",
      title_ja: "株価チャートの読み方",
      desc_ja: "チャートがすべてを語ると勘違いせずに、トレンド、ボラティリティ、レンジ、時間軸を理解する。",
      body_en: [
        CORELEARN_DISCLAIMER_EN,
        "A stock chart shows price movement over time.",
        "The first things to notice are direction, volatility, and timeframe.",
        "Direction asks whether price is broadly rising, falling, or moving sideways.",
        "Volatility asks how violently price moves within that path.",
        "Timeframe matters because a chart can look strong on one timeframe and messy on another.",
        "A chart is useful context, but it is not a complete explanation of business quality or future results."
      ],
      body_ja: [
        CORELEARN_DISCLAIMER_JA,
        "株価チャートは、価格が時間とともにどう動いたかを示します。",
        "まず見るべきなのは、方向、ボラティリティ、時間軸です。",
        "方向とは、価格が全体として上昇、下降、横ばいのどれに近いかを見ることです。",
        "ボラティリティとは、その流れの中で値動きがどれほど激しいかを見ることです。",
        "時間軸は重要です。短期では強く見えても、長期では不安定に見えることがあります。",
        "チャートは有用な文脈ですが、企業の質や将来の結果を完全に説明するものではありません。"
      ],
      example_en: "A stock may look strong on a 1-year chart but extremely unstable on a 1-week chart.",
      example_ja: "ある株は1年チャートでは強く見えても、1週間チャートでは非常に不安定に見えることがあります。",
      mistake_en: "Do not treat one chart snapshot as proof that you understand the business.",
      mistake_ja: "1枚のチャートだけで、その企業を理解したと思い込まないでください。",
      quickCheck: {
        question: "What should you notice first when reading a stock chart?",
        questionJa: "株価チャートを読むとき、最初に何を見るべきですか？",
        options: [
          "Trend, volatility, and timeframe",
          "Only the chart color",
          "Only the last price print",
          "Only what other people say online"
        ],
        optionsJa: [
          "トレンド、ボラティリティ、時間軸",
          "チャートの色だけ",
          "最後の価格だけ",
          "ネット上の他人の意見だけ"
        ],
        answerIndex: 0,
        explanation: "Basic chart reading starts with direction, movement size, and timeframe.",
        explanationJa: "基本的なチャート読解は、方向、値動きの大きさ、時間軸から始まります。"
      },
      visuals: [
        {
          src: "/education/corelearn/charts/chart-trend-example.png",
          alt: "Example stock chart showing trend",
          caption: "Trend shows whether price is broadly rising, falling, or sideways."
        },
        {
          src: "/education/corelearn/charts/chart-volatility-example.png",
          alt: "Example stock chart showing volatility",
          caption: "Volatility shows how sharply price moves."
        },
        {
          src: "/education/corelearn/charts/chart-timeframe-example.png",
          alt: "Example stock chart showing timeframe differences",
          caption: "Timeframe changes what story the chart is telling."
        }
      ]
    },
    {
      slug: "read-a-stock-page",
      title: "How to read a stock page",
      desc: "Understand what a typical broker or finance page is showing you.",
      title_ja: "株の情報ページの見方",
      desc_ja: "証券会社や金融サイトの株ページに何が表示されているかを理解する。",
      body_en: [
        CORELEARN_DISCLAIMER_EN,
        "A stock page usually combines price, chart, market cap, volume, 52-week range, and recent news.",
        "These are context signals, not automatic buy or sell instructions.",
        "A stronger habit is asking what each section tells you and what it does not tell you.",
        "For example, market cap tells you company size in market terms, while volume tells you how active trading has been.",
        "The stock page is a summary screen, not a substitute for understanding the business."
      ],
      body_ja: [
        CORELEARN_DISCLAIMER_JA,
        "株の情報ページには通常、株価、チャート、時価総額、出来高、52週レンジ、最近のニュースなどが表示されます。",
        "これらは文脈を与える情報であり、自動的な売買指示ではありません。",
        "より良い習慣は、それぞれの項目が何を示し、何を示していないかを考えることです。",
        "たとえば、時価総額は市場から見た企業規模を示し、出来高は取引の活発さを示します。",
        "株ページは要約画面であって、企業理解の代わりではありません。"
      ],
      example_en: "A stock page may show a rising price, but that alone does not tell you why it rose.",
      example_ja: "株ページで価格上昇が見えても、それだけではなぜ上がったのかは分かりません。",
      mistake_en: "Do not confuse a clean stock page with real understanding.",
      mistake_ja: "見やすい株ページを、理解そのものと勘違いしないでください。",
      quickCheck: {
        question: "What is a stock page mainly useful for?",
        questionJa: "株の情報ページは主に何のために役立ちますか？",
        options: [
          "Quick context and summary",
          "Guaranteed trade decisions",
          "Replacing business analysis completely",
          "Eliminating uncertainty"
        ],
        optionsJa: [
          "素早い文脈把握と要約",
          "売買判断の保証",
          "企業分析を完全に不要にすること",
          "不確実性をなくすこと"
        ],
        answerIndex: 0,
        explanation: "A stock page is a summary tool, not a certainty machine.",
        explanationJa: "株ページは要約ツールであり、確実性を与える機械ではありません。"
      },
      visuals: []
    },
    {
      slug: "review-company-step-by-step",
      title: "How to review one company step-by-step",
      desc: "A simple sequence for looking at one company without jumping around randomly.",
      title_ja: "1社を順番に見る方法",
      desc_ja: "あちこち飛ばずに、1社を順番に確認するシンプルな流れを学ぶ。",
      body_en: [
        CORELEARN_DISCLAIMER_EN,
        "A simple beginner sequence is: understand the business, check the numbers, review recent news, look at the chart, then write your reasoning.",
        "Understanding the business comes first because numbers without context are weak.",
        "Checking the numbers helps you see revenue, profit, margin, and scale.",
        "Recent news helps you spot whether something important changed.",
        "The chart can then add context about trend and volatility.",
        "Writing your reasoning forces you to see whether your view is actually clear."
      ],
      body_ja: [
        CORELEARN_DISCLAIMER_JA,
        "初心者向けの基本的な順序は、事業を理解する、数字を見る、最近のニュースを確認する、チャートを見る、最後に自分の考えを書く、です。",
        "最初に事業理解が必要なのは、文脈のない数字は弱いからです。",
        "数字を見ることで、売上、利益、利益率、規模などが見えてきます。",
        "最近のニュースを見ることで、何か重要な変化があったかを確認できます。",
        "その後でチャートを見ると、トレンドやボラティリティの文脈が加わります。",
        "最後に理由を書くことで、自分の見方が本当に明確かどうかが分かります。"
      ],
      example_en: "If you cannot explain what the company does in one or two sentences, you are not ready to judge it well.",
      example_ja: "その会社が何をしているかを1〜2文で説明できないなら、まだ十分に判断する準備ができていません。",
      mistake_en: "Do not start with the chart and pretend that is full analysis.",
      mistake_ja: "チャートから始めて、それが完全な分析だと思い込まないでください。",
      quickCheck: {
        question: "What should usually come first when reviewing a company?",
        questionJa: "1社を確認するとき、通常最初に来るべきものは何ですか？",
        options: [
          "Understanding the business",
          "Buying quickly",
          "Copying online opinions",
          "Watching only one candle"
        ],
        optionsJa: [
          "事業を理解すること",
          "すぐ買うこと",
          "ネット意見を真似すること",
          "1本のローソク足だけを見ること"
        ],
        answerIndex: 0,
        explanation: "You need business understanding before the rest has meaning.",
        explanationJa: "他の情報が意味を持つ前に、まず事業理解が必要です。"
      },
      visuals: []
    },
    {
      slug: "avoid-forcing-conviction",
      title: "How to avoid forcing conviction",
      desc: "Learn why sounding certain is not the same as understanding.",
      title_ja: "無理に確信を作らない",
      desc_ja: "自信ありげに見えることと、本当に理解していることは別だと学ぶ。",
      body_en: [
        CORELEARN_DISCLAIMER_EN,
        "Many weak decisions come from trying to feel certain too early.",
        "Conviction should come from understanding, not from urgency, ego, or repeated exposure to hype.",
        "If your reasons are vague, borrowed, or emotional, your conviction is probably forced.",
        "It is stronger to admit uncertainty than to fake clarity."
      ],
      body_ja: [
        CORELEARN_DISCLAIMER_JA,
        "弱い判断の多くは、早すぎる段階で確信を持とうとすることから生まれます。",
        "確信は、焦り、見栄、繰り返し見た話題ではなく、理解から生まれるべきです。",
        "自分の理由が曖昧、借り物、感情的なら、その確信は無理に作られた可能性が高いです。",
        "偽りの明確さより、不確実性を認める方が強いです。"
      ],
      example_en: "If you keep saying 'it just feels strong' but cannot explain why, that is not real conviction.",
      example_ja: "『なんとなく強そう』と言うだけで理由を説明できないなら、それは本当の確信ではありません。",
      mistake_en: "Do not confuse confidence in your tone with quality in your reasoning.",
      mistake_ja: "話し方の自信を、理由の質と混同しないでください。",
      quickCheck: {
        question: "Where should real conviction come from?",
        questionJa: "本当の確信はどこから来るべきですか？",
        options: [
          "Understanding",
          "Urgency",
          "Hype",
          "Ego"
        ],
        optionsJa: [
          "理解",
          "焦り",
          "盛り上がり",
          "自尊心"
        ],
        answerIndex: 0,
        explanation: "Real conviction should come from understanding, not emotional pressure.",
        explanationJa: "本当の確信は、感情的圧力ではなく理解から来るべきです。"
      },
      visuals: []
    },
    {
      slug: "i-dont-know-yet",
      title: "When 'I don't know yet' is the correct answer",
      desc: "Recognize incomplete understanding before doing something irreversible.",
      title_ja: "『まだ分からない』が正解なとき",
      desc_ja: "取り返しのつかない行動をする前に、理解不足を認識する。",
      body_en: [
        CORELEARN_DISCLAIMER_EN,
        "Sometimes the strongest answer is 'I don't know yet.'",
        "That answer is appropriate when the business is unclear, the numbers are weakly understood, the news is confusing, or your reasons are still shallow.",
        "Waiting for more clarity is not weakness.",
        "It is usually better to delay action than to act from incomplete understanding."
      ],
      body_ja: [
        CORELEARN_DISCLAIMER_JA,
        "ときには『まだ分からない』が最も強い答えです。",
        "それは、事業が不明確、数字の理解が浅い、ニュースが複雑、自分の理由がまだ浅い場合に適切です。",
        "より明確になるまで待つことは弱さではありません。",
        "理解が不十分なまま行動するより、行動を遅らせる方が通常は良いです。"
      ],
      example_en: "If you cannot explain both the opportunity and the risk, you probably do not know enough yet.",
      example_ja: "機会とリスクの両方を説明できないなら、まだ十分に分かっていない可能性が高いです。",
      mistake_en: "Do not assume you must always form an opinion immediately.",
      mistake_ja: "常にすぐ意見を持たなければならないと思い込まないでください。",
      quickCheck: {
        question: "When is 'I don't know yet' often the right answer?",
        questionJa: "どんなときに『まだ分からない』が正しい答えになりやすいですか？",
        options: [
          "When understanding is incomplete",
          "When you want to sound smart",
          "When hype is strong",
          "When other people are buying"
        ],
        optionsJa: [
          "理解が不十分なとき",
          "賢く見せたいとき",
          "盛り上がりが強いとき",
          "他人が買っているとき"
        ],
        answerIndex: 0,
        explanation: "Incomplete understanding is a valid reason to stop and study more.",
        explanationJa: "理解不足は、立ち止まってもっと学ぶ十分な理由です。"
      },
      visuals: []
    },
    {
      slug: "using-a-broker-safely",
      title: "Using a broker without rushing",
      desc: "Understand that market access should not be mistaken for readiness.",
      title_ja: "焦らず証券会社を使う",
      desc_ja: "口座を持っていることと、準備ができていることは別だと理解する。",
      body_en: [
        CORELEARN_DISCLAIMER_EN,
        "Having a broker account does not mean you are ready to act.",
        "Access comes before discipline for many people, and that often creates mistakes.",
        "A stronger approach is learning the screen, understanding order types, checking size, and slowing down before any action.",
        "Broker access should be treated as a tool, not as pressure to do something."
      ],
      body_ja: [
        CORELEARN_DISCLAIMER_JA,
        "証券口座を持っているからといって、すぐ行動する準備ができているわけではありません。",
        "多くの人は規律より先にアクセスを得るため、それが失敗を生みやすくなります。",
        "より強い方法は、画面の見方を学び、注文方法を理解し、サイズを確認し、行動前に意図的に速度を落とすことです。",
        "証券会社へのアクセスは道具であって、何かをしなければならない圧力ではありません。"
      ],
      example_en: "You can open a broker app, review the order ticket, and still choose not to place anything.",
      example_ja: "証券アプリを開いて注文画面を確認しても、何も発注しない選択はできます。",
      mistake_en: "Do not treat access as a reason to act.",
      mistake_ja: "アクセスできることを、行動理由にしないでください。",
      quickCheck: {
        question: "What should broker access be treated as?",
        questionJa: "証券会社へのアクセスは何として扱うべきですか？",
        options: [
          "A tool",
          "A command to trade",
          "A guarantee of readiness",
          "A replacement for judgment"
        ],
        optionsJa: [
          "道具",
          "取引しろという命令",
          "準備完了の保証",
          "判断力の代わり"
        ],
        answerIndex: 0,
        explanation: "Access is a tool. It does not replace readiness or judgment.",
        explanationJa: "アクセスは道具です。準備や判断の代わりにはなりません。"
      },
      visuals: []
    }
  ],
  levelQuiz: [
    {
      question: "What should you notice first when reading a stock chart?",
      questionJa: "株価チャートを読むとき、最初に何を見るべきですか？",
      options: [
        "Trend, volatility, and timeframe",
        "Only the chart color",
        "Only the last price print",
        "Only online opinions"
      ],
      optionsJa: [
        "トレンド、ボラティリティ、時間軸",
        "チャートの色だけ",
        "最後の価格だけ",
        "ネット上の意見だけ"
      ],
      answerIndex: 0,
      explanation: "Basic chart reading starts with direction, movement size, and timeframe.",
      explanationJa: "基本的なチャート読解は、方向、値動きの大きさ、時間軸から始まります。"
    },
    {
      question: "What is a stock page mainly useful for?",
      questionJa: "株の情報ページは主に何のために役立ちますか？",
      options: [
        "Quick context and summary",
        "Guaranteed trade decisions",
        "Replacing business analysis completely",
        "Removing uncertainty"
      ],
      optionsJa: [
        "素早い文脈把握と要約",
        "売買判断の保証",
        "企業分析を完全に不要にすること",
        "不確実性をなくすこと"
      ],
      answerIndex: 0,
      explanation: "A stock page is a summary tool, not a certainty machine.",
      explanationJa: "株ページは要約ツールであり、確実性を与えるものではありません。"
    },
    {
      question: "What should usually come first when reviewing a company?",
      questionJa: "1社を確認するとき、通常最初に来るべきものは何ですか？",
      options: [
        "Understanding the business",
        "Buying quickly",
        "Copying opinions",
        "Watching one candle"
      ],
      optionsJa: [
        "事業を理解すること",
        "すぐ買うこと",
        "他人の意見を真似すること",
        "1本のローソク足だけを見ること"
      ],
      answerIndex: 0,
      explanation: "Business understanding gives meaning to everything else.",
      explanationJa: "事業理解があって初めて、他の情報に意味が生まれます。"
    },
    {
      question: "When is 'I don't know yet' often correct?",
      questionJa: "どんなときに『まだ分からない』が正しい答えになりやすいですか？",
      options: [
        "When understanding is incomplete",
        "When hype is strong",
        "When others are buying",
        "When you want to sound smart"
      ],
      optionsJa: [
        "理解が不十分なとき",
        "盛り上がりが強いとき",
        "他人が買っているとき",
        "賢く見せたいとき"
      ],
      answerIndex: 0,
      explanation: "Incomplete understanding is a valid reason to stop and study more.",
      explanationJa: "理解不足は、立ち止まってもっと学ぶ正当な理由です。"
   }
  ]
},
 {
  id: "level-11",
  title: "Financial Statements Basics",
  title_ja: "財務諸表の基礎",

  desc: "Learn how to read core financial statements and spot basic financial strength or weakness.",
  desc_ja: "主要な財務諸表を読み、基本的な財務の強さや弱さを見抜く方法を学ぶ。",

  lessons: [

    {
      slug: "financial-statements-overview",

      title: "Financial Statements Overview",
      title_ja: "財務諸表の全体像",

      desc: "Understanding the three main financial statements used to analyze companies.",
      desc_ja: "企業分析に使われる3つの主要な財務諸表を理解する。",

      visuals: [
        {
          src: "/education/corelearn/level-11/financial-statements-overview.png",
          srcJa: "/education/corelearn/level-11/financial-statements-overview-ja.png",
          alt: "Financial statements overview",
          altJa: "財務諸表の全体像",
          caption: "The income statement, balance sheet, and cash flow statement work together.",
          captionJa: "損益計算書・貸借対照表・キャッシュフロー計算書はセットで見る必要があります。"
        }
      ],

      body_en: [
        "Public companies report financial data through three primary statements.",
        "These statements help investors understand profitability, financial stability, and cash generation.",
        "Professional investors read them together rather than individually."
      ],

      body_ja: [
        "上場企業は主に3つの財務諸表で財務状況を報告します。",
        "これらは企業の収益性、財務の安定性、そして現金の流れを理解するために重要です。",
        "プロの投資家はこれらを個別ではなく、必ずセットで分析します。"
      ],

      example_en: "A company might show strong profit on the income statement but weak cash flow, which signals risk.",
      example_ja: "損益計算書では利益が出ていても、キャッシュフローが弱い場合はリスクの可能性があります。",

      mistake_en: "Looking at only one financial statement instead of understanding the full picture.",
      mistake_ja: "1つの財務諸表だけを見ること。全体を理解する必要があります。",

      quickCheck: {
        question: "Which three statements make up the core financial reports?",
        questionJa: "主要な財務諸表はどれですか？",

        options: [
          "Income statement, balance sheet, cash flow statement",
          "Revenue report, market report, earnings report",
          "Stock chart, balance sheet, dividend report"
        ],

        optionsJa: [
          "損益計算書・貸借対照表・キャッシュフロー計算書",
          "売上レポート・市場レポート・利益レポート",
          "株価チャート・貸借対照表・配当レポート"
        ],

        answerIndex: 0,

        explanation: "These three statements together show profit, financial position, and real cash movement.",
        explanationJa: "この3つを合わせて見ることで、利益・財務状態・実際の現金の動きを理解できます。"
      }
    },

    {
      slug: "revenue-profit-margin",

      title: "Revenue, Profit, and Margin",
      title_ja: "売上・利益・利益率",

      desc: "Understanding how companies actually make money.",
      desc_ja: "企業がどのように利益を生み出しているかを理解する。",

      visuals: [
        {
          src: "/education/corelearn/level-11/revenue-profit-margin.png",
          srcJa: "/education/corelearn/level-11/revenue-profit-margin-ja.png",
          alt: "Revenue profit margin chart",
          altJa: "売上・利益・利益率の図",
          caption: "Revenue shows sales, profit shows what remains after costs.",
          captionJa: "売上は販売額、利益は費用を引いた後の残りを示します。"
        }
      ],

      body_en: [
        "Revenue represents the total sales generated by a company.",
        "Profit represents what remains after all expenses are paid.",
        "Profit margin shows how efficient the company is at turning revenue into profit."
      ],

      body_ja: [
        "売上は企業が生み出した総販売額です。",
        "利益はすべての費用を支払った後に残る金額です。",
        "利益率は売上をどれだけ効率的に利益へ変えているかを示します。"
      ],

      example_en: "Two companies may generate the same revenue, but the one with higher margins is usually stronger.",
      example_ja: "同じ売上でも、利益率が高い企業の方が一般的に強い企業です。",

      mistake_en: "Assuming high revenue always means a strong business.",
      mistake_ja: "売上が高いだけで強い企業だと考えること。",

      quickCheck: {
        question: "What does profit margin measure?",
        questionJa: "利益率は何を示しますか？",

        options: [
          "Profit relative to revenue",
          "Company size",
          "Stock price growth"
        ],

        optionsJa: [
          "売上に対する利益の割合",
          "企業の規模",
          "株価の成長"
        ],

        answerIndex: 0,

        explanation: "Profit margin measures how efficiently a company converts revenue into profit.",
        explanationJa: "利益率は売上をどれだけ効率よく利益へ変えているかを示します。"
      }
    },

    {
      slug: "cash-flow-vs-profit",

      title: "Cash Flow vs Profit",
      title_ja: "キャッシュフローと利益",

      desc: "Understanding the difference between accounting profit and real cash.",
      desc_ja: "会計上の利益と実際の現金の違いを理解する。",

      visuals: [
        {
          src: "/education/corelearn/level-11/cash-flow-vs-profit.png",
          srcJa: "/education/corelearn/level-11/cash-flow-vs-profit-ja.png",
          alt: "Cash flow vs profit",
          altJa: "キャッシュフローと利益の比較",
          caption: "Profit does not always equal real cash flow.",
          captionJa: "利益がそのまま現金とは限りません。"
        }
      ],

      body_en: [
        "Accounting profit can include non-cash items.",
        "Cash flow tracks actual money entering and leaving the business.",
        "Strong investors watch cash flow carefully."
      ],

      body_ja: [
        "会計上の利益には現金が動いていない項目も含まれます。",
        "キャッシュフローは実際の現金の出入りを示します。",
        "優れた投資家はキャッシュフローを重視します。"
      ],

      example_en: "A company selling products on credit may report profit before the cash is actually received.",
      example_ja: "掛売りの場合、現金を受け取る前に利益が計上されることがあります。",

      mistake_en: "Confusing accounting profit with real cash generation.",
      mistake_ja: "会計上の利益と実際の現金を混同すること。",

      quickCheck: {
        question: "Why can profit differ from cash flow?",
        questionJa: "なぜ利益とキャッシュフローは違うことがありますか？",

        options: [
          "Because accounting includes non-cash items",
          "Because companies hide money",
          "Because stock prices change"
        ],

        optionsJa: [
          "会計には現金を伴わない項目が含まれるから",
          "企業が現金を隠しているから",
          "株価が変動するから"
        ],

        answerIndex: 0,

        explanation: "Accounting profit may include non-cash items such as depreciation.",
        explanationJa: "減価償却など、現金が動かない項目が利益に含まれる場合があります。"
      }
    }

  ],

  levelQuiz: [
    {
      question: "Why should investors read the three financial statements together?",
      questionJa: "なぜ投資家は3つの財務諸表をセットで見るべきですか？",

      options: [
        "Because together they show profit, financial position, and cash movement",
        "Because only one statement is never published",
        "Because charts cannot be used",
        "Because stock prices depend only on accounting rules"
      ],

      optionsJa: [
        "利益、財務状態、現金の動きをまとめて理解できるから",
        "1つの財務諸表だけは公開されないから",
        "チャートが使えないから",
        "株価は会計ルールだけで決まるから"
      ],

      answerIndex: 0,

      explanation: "The three statements work together to show different parts of business reality.",
      explanationJa: "3つの財務諸表は、それぞれ違う側面から企業の実態を示します。"
    }
  ]
},
{
  id: "level-12",
  title: "Valuation Basics",
  title_ja: "バリュエーションの基礎",
  desc: "Understanding how investors think about price relative to business value.",
  desc_ja: "企業の価値に対して株価がどう評価されるかを理解する。",

  lessons: [

  {
    slug: "price-vs-value",

    title: "Price vs Value",
    title_ja: "価格と価値",

    desc: "Understanding the difference between what a stock costs and what a business may be worth.",
    desc_ja: "株価（価格）と企業価値の違いを理解する。",

    visuals: [],

    body_en: [
      "A stock price is simply the amount someone is willing to pay at a moment in time.",
      "Business value refers to what the company may realistically produce over time.",
      "Markets often confuse price with value, especially during hype cycles.",
      "Investors try to judge whether the price reasonably reflects the business."
    ],

    body_ja: [
      "株価とは、その瞬間に誰かが支払う意思のある価格です。",
      "企業価値とは、その企業が長期的に生み出す可能性のある価値を指します。",
      "市場では、特に話題が盛り上がる時期に価格と価値が混同されることがあります。",
      "投資家は株価が企業価値を妥当に反映しているかを考えます。"
    ],

    example_en: "A great business can still be a poor investment if the price is excessively high.",
    example_ja: "優れた企業でも、株価が高すぎれば投資としては良くない場合があります。",

    mistake_en: "Assuming that a rising stock price automatically means the business is improving.",
    mistake_ja: "株価が上がっているだけで企業が改善していると考えること。",

    quickCheck: {
      question: "What is the difference between price and value?",
      questionJa: "価格と価値の違いは何ですか？",
      options: [
        "Price is what you pay, value is what the business may be worth",
        "Price and value are always identical",
        "Value only means dividends",
        "Price measures company employees"
      ],
      optionsJa: [
        "価格は支払う金額、価値は企業の実質的な価値",
        "価格と価値は常に同じ",
        "価値とは配当のみ",
        "価格は従業員数を示す"
      ],
      answerIndex: 0,
      explanation: "Price is the market quote. Value relates to the business itself.",
      explanationJa: "価格は市場での値段であり、価値は企業そのものの実質的な評価です。"
    }
  },

  {
    slug: "pe-ratio",

    title: "The P/E Ratio",
    title_ja: "PER（株価収益率）",

    desc: "Understanding one of the most common valuation metrics.",
    desc_ja: "最も一般的なバリュエーション指標の一つを理解する。",

    visuals: [],

    body_en: [
      "The P/E ratio compares a company's stock price to its earnings.",
      "It shows how much investors are paying for each dollar of profit.",
      "Higher P/E ratios usually reflect higher growth expectations.",
      "Lower P/E ratios may reflect slower growth or higher risk."
    ],

    body_ja: [
      "PER（株価収益率）は株価と利益を比較する指標です。",
      "投資家が利益1単位に対していくら支払っているかを示します。",
      "PERが高い場合、通常は高い成長期待が反映されています。",
      "PERが低い場合、成長が遅い、またはリスクが高い可能性があります。"
    ],

    example_en: "A company trading at 20× earnings means investors pay $20 for every $1 of annual profit.",
    example_ja: "PERが20倍とは、利益1に対して株価が20の評価を受けていることを意味します。",

    mistake_en: "Assuming a low P/E automatically means a stock is cheap.",
    mistake_ja: "PERが低いだけで割安だと考えること。",

    quickCheck: {
      question: "What does the P/E ratio measure?",
      questionJa: "PERは何を測る指標ですか？",
      options: [
        "Stock price relative to earnings",
        "Company revenue growth",
        "Number of employees",
        "Dividend yield"
      ],
      optionsJa: [
        "株価と利益の関係",
        "売上成長率",
        "従業員数",
        "配当利回り"
      ],
      answerIndex: 0,
      explanation: "P/E shows how much investors pay for each unit of earnings.",
      explanationJa: "PERは利益1単位に対して投資家がいくら払うかを示します。"
    }
  },

  {
    slug: "compare-companies",

    title: "Comparing Similar Companies",
    title_ja: "同業他社との比較",

    desc: "Why investors compare companies within the same industry.",
    desc_ja: "投資家が同業他社を比較する理由を理解する。",

    visuals: [],

    body_en: [
      "Valuation becomes more meaningful when comparing similar companies.",
      "Companies in the same industry often face similar economics.",
      "If one company trades at much higher valuation, investors ask why.",
      "The difference may reflect growth, risk, or profitability."
    ],

    body_ja: [
      "バリュエーションは同業他社と比較することで意味を持ちます。",
      "同じ業界の企業は似た経済条件で競争しています。",
      "1社だけ評価が大きく違う場合、投資家は理由を考えます。",
      "その違いは成長性、リスク、利益率などを反映している可能性があります。"
    ],

    example_en: "Two software companies may both grow fast, but one might be valued much higher due to stronger margins.",
    example_ja: "2つのソフトウェア企業が同じ成長でも、利益率の違いで評価が変わることがあります。",

    mistake_en: "Comparing companies from completely different industries.",
    mistake_ja: "全く違う業界の企業を比較すること。",

    quickCheck: {
      question: "Why do investors compare companies in the same industry?",
      questionJa: "なぜ投資家は同業他社を比較するのですか？",
      options: [
        "Because similar businesses allow more meaningful valuation comparisons",
        "Because stock prices must always match",
        "Because industries never change",
        "Because revenue must be identical"
      ],
      optionsJa: [
        "似た企業同士の方が評価比較が意味を持つから",
        "株価は必ず同じになるから",
        "業界は変化しないから",
        "売上は必ず同じだから"
      ],
      answerIndex: 0,
      explanation: "Peer comparison helps evaluate whether pricing differences make sense.",
      explanationJa: "同業比較により評価の違いが妥当か判断できます。"
    }
  }

  ],

  levelQuiz: [

  {
    question: "What is the difference between price and value?",
    questionJa: "価格と価値の違いは何ですか？",

    options: [
      "Price is market cost, value is business worth",
      "They are always identical",
      "Value means dividends only",
      "Price measures employees"
    ],

    optionsJa: [
      "価格は市場の値段、価値は企業の実質価値",
      "常に同じ",
      "価値は配当のみ",
      "価格は従業員数"
    ],

    answerIndex: 0,
    explanation: "Price is the market quote while value reflects business fundamentals.",
    explanationJa: "価格は市場の値段で、価値は企業の実態を反映します。"
  },

  {
    question: "What does the P/E ratio measure?",
    questionJa: "PERは何を測る指標ですか？",

    options: [
      "Price relative to earnings",
      "Revenue growth",
      "Employee count",
      "Market volatility"
    ],

    optionsJa: [
      "株価と利益の関係",
      "売上成長",
      "従業員数",
      "市場ボラティリティ"
    ],

    answerIndex: 0,
    explanation: "The P/E ratio compares price to profit.",
    explanationJa: "PERは株価と利益を比較します。"
  },

  {
    question: "Why compare companies within the same industry?",
    questionJa: "なぜ同業他社を比較するのですか？",

    options: [
      "Because similar businesses allow fair comparison",
      "Because all companies grow equally",
      "Because prices must match",
      "Because markets require it"
    ],

    optionsJa: [
      "似た企業同士の方が比較しやすいから",
      "すべての企業が同じ成長をするから",
      "株価は一致する必要があるから",
      "市場のルールだから"
    ],

    answerIndex: 0,
    explanation: "Industry peers provide context for valuation.",
    explanationJa: "同業企業の比較で評価の妥当性が分かります。"
  },

  {
    question: "Why might a company have a higher P/E ratio than competitors?",
    questionJa: "なぜある企業のPERが他社より高いことがありますか？",

    options: [
      "Investors expect stronger growth",
      "Accounting errors",
      "More employees",
      "Lower revenue"
    ],

    optionsJa: [
      "成長期待が高いから",
      "会計ミス",
      "従業員が多いから",
      "売上が低いから"
    ],

    answerIndex: 0,
    explanation: "Higher P/E often reflects higher expected growth.",
    explanationJa: "PERが高いのは通常、成長期待が高いためです。"
  },

  {
    question: "What is a common valuation mistake?",
    questionJa: "よくあるバリュエーションの間違いは何ですか？",

    options: [
      "Assuming low P/E automatically means cheap",
      "Comparing companies in the same industry",
      "Looking at profit margins",
      "Reading financial statements"
    ],

    optionsJa: [
      "PERが低いだけで割安だと思うこと",
      "同業企業を比較すること",
      "利益率を見ること",
      "財務諸表を読むこと"
    ],

    answerIndex: 0,
    explanation: "Low P/E may also reflect risk or weak growth.",
    explanationJa: "PERが低い理由はリスクや成長の弱さの可能性もあります。"
  }
  ]
}
];