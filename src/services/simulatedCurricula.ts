import { AdvisorData, DiagnosticAssessment } from '../types/alter';

export function getCurriculumForTopic(
  topic: string,
  destination?: string,
  _diagnostic?: DiagnosticAssessment
): AdvisorData {
  const t = topic.toLowerCase();

  const isFinanceOrCredit =
    t.includes('credit') ||
    t.includes('funding') ||
    t.includes('capital') ||
    t.includes('loan') ||
    t.includes('finance') ||
    t.includes('banking') ||
    t.includes('cash flow');

  const isTrading =
    (t.includes('trading') ||
      t.includes('futures') ||
      t.includes('stock') ||
      t.includes('invest') ||
      t.includes('crypto') ||
      t.includes('forex') ||
      t.includes('options')) &&
    !isFinanceOrCredit;

  const isAgency =
    (t.includes('agency') ||
      t.includes('agent agency') ||
      t.includes('ai agency') ||
      t.includes('service business')) &&
    !isFinanceOrCredit;

  const isDigitalProduct =
    t.includes('digital product') ||
    t.includes('saas') ||
    t.includes('micro-saas') ||
    t.includes('web app');

  const isEBook =
    t.includes('e-book') ||
    t.includes('ebook') ||
    t.includes('book') ||
    t.includes('write') ||
    t.includes('publish') ||
    t.includes('author') ||
    t.includes('kindle');

  const isGardening =
    t.includes('garden') ||
    t.includes('plant') ||
    t.includes('herb') ||
    t.includes('hydroponic') ||
    t.includes('soil') ||
    t.includes('vegetable');

  const isSourdough =
    t.includes('sourdough') ||
    t.includes('bread') ||
    t.includes('baking') ||
    t.includes('ferment') ||
    t.includes('bakery');

  const isSpeaking =
    t.includes('speak') ||
    t.includes('presentation') ||
    t.includes('persuasion') ||
    t.includes('pitch') ||
    t.includes('speech');

  const isAgent =
    (t.includes('agent') && !t.includes('agency')) ||
    t.includes('autonomous') ||
    t.includes('multi-agent');

  // 1. Credit Stacking & Business Funding
  if (isFinanceOrCredit) {
    return {
      overview: `A disciplined, step-by-step 6-week roadmap to build an unshakeable business credit profile, sequence 0% APR bank credit lines ($50K-$150K+), and deploy capital into cash-flowing operations.`,
      estimatedWeeks: 6,
      phases: [
        {
          id: `phase-1-${Date.now()}`,
          phaseNumber: 1,
          title: 'Business Entity Structuring & Underwriting Optics',
          duration: 'Weeks 1-2',
          objective: 'Set up an unassailable commercial credit profile that satisfies Tier 1 bank underwriting algorithms before submitting any applications.',
          tangibleAsset: 'A fully compliant corporate entity (LLC/EIN, 411 listing, D-U-N-S, Experian/Equifax Commercial profiles) ready for underwriting.',
          coreConcepts: [
            'How Commercial Underwriting Algorithms Actually Evaluate Risk',
            'Corporate Entity Optics: NAICS Codes, Virtual Addresses & Phone Listings',
            'Personal Credit Cleaning & Primary Inquiry Washing Strategy'
          ],
          courses: [
            {
              id: `c-1-1-${Date.now()}`,
              courseNumber: '1.1',
              title: 'How Business Credit & Bank Underwriting Actually Work',
              description: 'Deconstruct Tier 1 vs Tier 2 banks, PG (Personal Guarantee) vs Non-PG credit, and the exact metrics underwriting bots use to score approvals.',
              estimatedMinutes: 12,
              completed: false
            },
            {
              id: `c-1-2-${Date.now()}`,
              courseNumber: '1.2',
              title: 'Structuring Your Entity for Maximum Tier 1 Approvals',
              description: 'Select low-risk NAICS industry codes, register legitimate commercial phone lines, and establish your Dun & Bradstreet Paydex foundation.',
              estimatedMinutes: 14,
              completed: false
            },
            {
              id: `c-1-3-${Date.now()}`,
              courseNumber: '1.3',
              title: 'Personal Credit Optimization & Inquiry Management',
              description: 'Optimize your credit utilization below 7%, eliminate negative reporting discrepancies, and prep your profile for zero-inquiry resistance.',
              estimatedMinutes: 15,
              completed: false
            }
          ],
          checkpoint: {
            id: 'cp-1',
            title: 'Phase 1 Milestone: Entity Compliance & Underwriting Readiness Audit',
            description: 'Run a 20-point compliance audit confirming business registration, D-U-N-S number, low-risk NAICS code, and clean personal bureau reports.',
            tangibleAsset: 'Completed 20-Point Business Underwriting Compliance Audit',
            completed: false
          },
          completed: false
        },
        {
          id: `phase-2-${Date.now()}`,
          phaseNumber: 2,
          title: 'The Stacking Algorithm: Sequencing 0% APR Credit Lines',
          duration: 'Weeks 3-4',
          objective: 'Execute a timed multi-bank application sequence across Chase, Amex, US Bank, and regional credit unions to secure $50K-$150K at 0% APR without cross-bureau inquiry contamination.',
          tangibleAsset: 'Approved portfolio of 0% APR business credit lines with documented limits and promo expiration dates.',
          coreConcepts: [
            'The Multi-Bank Application Sequencing Protocol',
            'Navigating Regional Credit Unions vs Big National Banks',
            'Reconsideration Line Negotiations & Overcoming Algorithmic Declines'
          ],
          courses: [
            {
              id: `c-2-1-${Date.now()}`,
              courseNumber: '2.1',
              title: 'The Sequencing Algorithm: Applying to 3-5 Banks Simultaneously',
              description: 'Map out which bureaus each lender pulls (Experian, TransUnion, Equifax) and sequence applications within 24 hours so inquiries do not cross-report.',
              estimatedMinutes: 15,
              completed: false
            },
            {
              id: `c-2-2-${Date.now()}`,
              courseNumber: '2.2',
              title: 'Targeting High-Limit 0% APR Business Credit Cards',
              description: 'Identify the top introductory 0% APR business cards (12-18 months zero interest) and tailor stated revenue to underwriting guidelines.',
              estimatedMinutes: 12,
              completed: false
            },
            {
              id: `c-2-3-${Date.now()}`,
              courseNumber: '2.3',
              title: 'Mastering the Reconsideration Call & Limit Increases',
              description: 'Verbatim phone scripts to call senior underwriters, turn conditional denials into approvals, and request credit limit reallocation.',
              estimatedMinutes: 14,
              completed: false
            }
          ],
          checkpoint: {
            id: 'cp-2',
            title: 'Phase 2 Milestone: Approved Credit Line Portfolio & Sequencing Log',
            description: 'Execute the application sequence and compile an active spreadsheet tracking approval amounts, 0% APR promotional periods, and payment dates.',
            tangibleAsset: 'Active Multi-Bank Credit Stacking Tracker ($50K-$150K Approved Lines)',
            completed: false
          },
          completed: false
        },
        {
          id: `phase-3-${Date.now()}`,
          phaseNumber: 3,
          title: 'Capital Deployment, Cash Conversion & Debt Service Safeguards',
          duration: 'Weeks 5-6',
          objective: 'Convert credit lines to liquid working capital at minimal fee overhead, deploy into positive cash-flow assets, and manage debt service safely.',
          tangibleAsset: 'A Capital Deployment Plan with strict Debt Service Coverage Ratio (DSCR) safeguards and repayment schedules.',
          coreConcepts: [
            'Low-Fee Cash Liquidation Protocols (Plastiq, Merchant Invoicing, Escrow)',
            'Debt Service Coverage Ratio (DSCR) & Cash-Flow Risk Controls',
            'Transitioning to Tier 3 Non-PG Corporate Lines of Credit'
          ],
          courses: [
            {
              id: `c-3-1-${Date.now()}`,
              courseNumber: '3.1',
              title: 'Liquidating Credit Lines to Working Capital with Low Fees',
              description: 'Lawfully convert card limits to liquid operating cash using invoice factoring, commercial payment processors, and payroll funding strategies.',
              estimatedMinutes: 12,
              completed: false
            },
            {
              id: `c-3-2-${Date.now()}`,
              courseNumber: '3.2',
              title: 'Cash Flow Protection & Minimum Payment Amortization',
              description: 'Calculate your exact DSCR safety margin so business operating profit effortlessly services minimum payments while principal is deployed.',
              estimatedMinutes: 15,
              completed: false
            },
            {
              id: `c-3-3-${Date.now()}`,
              courseNumber: '3.3',
              title: 'Graduating to Tier 3 Unsecured Corporate Lines of Credit',
              description: 'Leverage your established banking relationships to secure six-figure institutional revolving lines with zero personal liability.',
              estimatedMinutes: 14,
              completed: false
            }
          ],
          checkpoint: {
            id: 'cp-3',
            title: 'Phase 3 Milestone: Working Capital Deployment & Repayment Plan',
            description: 'Document your liquid capital allocation model with automated payment rules and 12-month return-on-capital targets.',
            tangibleAsset: 'Live Capital Deployment Dashboard with 12-Month Liquidity Forecast',
            completed: false
          },
          completed: false
        }
      ],
      cutList: [
        {
          id: 'cut-1',
          topic: 'Paying $5,000+ for "Shelf Corporations" or Aged Tradelines',
          reasonToSkip: 'Banks now flag artificial tradeline history instantly; high cost with zero durable underwriting value.',
          alternativeFocus: 'Build genuine Tier 1 banking relationships using compliant LLC registration and clean personal credit sequencing.'
        },
        {
          id: 'cut-2',
          topic: 'High-Interest Merchant Cash Advances (MCAs)',
          reasonToSkip: 'Predatory daily debits and effective APRs over 60% lead to cash-flow death spirals.',
          alternativeFocus: '0% APR introductory business credit lines giving you 12-18 months of non-dilutive, zero-interest leverage.'
        },
        {
          id: 'cut-3',
          topic: 'Haphazard Credit Card Applications without Sequencing',
          reasonToSkip: 'Random applications trigger hard inquiries that alert other banks and cause instant auto-declines.',
          alternativeFocus: 'Strict 24-hour multi-bureau sequencing strategy that keeps bureaus unpolluted.'
        }
      ],
      chatHistory: []
    };
  }

  // 2. Trading & Investing
  if (isTrading) {
    return {
      overview: `A disciplined, risk-first 6-week roadmap to build a verifiable trading edge, master order flow and liquidity, and manage drawdown like an institutional prop desk.`,
      estimatedWeeks: 6,
      phases: [
        {
          id: `phase-1-${Date.now()}`,
          phaseNumber: 1,
          title: 'Market Mechanics, Order Flow & Personal Risk Rules',
          duration: 'Weeks 1-2',
          objective: 'Understand how market makers provide liquidity, define strict 1% risk rules, and establish an uncompromising paper-trading routine.',
          tangibleAsset: 'A 1-page Trading Rulebook and an active trade-logging journal.',
          coreConcepts: [
            'How Order Books, Spreads & Liquidity Actually Move',
            'The 1% Maximum Risk Rule & Position Sizing Formulas',
            'Setting Up a Rigorous Paper-Trading Journal'
          ],
          courses: [
            {
              id: `c-1-1-${Date.now()}`,
              courseNumber: '1.1',
              title: 'Market Structure & How Order Books Move (Zero Indicators)',
              description: 'Learn how buyers and sellers transact at the bid/ask, why market orders cross the spread, and where real institutional liquidity sits.',
              estimatedMinutes: 12,
              completed: false
            },
            {
              id: `c-1-2-${Date.now()}`,
              courseNumber: '1.2',
              title: 'The Invariant of Trading: Risk Per Trade & Position Sizing',
              description: 'Calculate exact contract sizing based on stop-loss distance so no single trade ever risks more than 1% of total trading equity.',
              estimatedMinutes: 14,
              completed: false
            },
            {
              id: `c-1-3-${Date.now()}`,
              courseNumber: '1.3',
              title: 'Establishing Your Trade Logging & Journal Routine',
              description: 'Set up an institutional trading journal tracking entry trigger, invalidation level, trade thesis, and emotional state.',
              estimatedMinutes: 10,
              completed: false
            }
          ],
          checkpoint: {
            id: 'cp-1',
            title: 'Phase 1 Milestone: Written Risk Rulebook & 2-Week Paper Log',
            description: 'Document your non-negotiable risk rules and complete 10 logged paper trades with strict position sizing.',
            tangibleAsset: 'Written 1-Page Risk Rulebook & 10-Trade Paper Journal',
            completed: false
          },
          completed: false
        },
        {
          id: `phase-2-${Date.now()}`,
          phaseNumber: 2,
          title: 'Execution Precision & High-Probability Setups',
          duration: 'Weeks 3-4',
          objective: 'Identify high-probability setups at key liquidity sweeps and practice disciplined execution with strict limit order entry.',
          tangibleAsset: '20 executed trades with documented risk-to-reward ratios greater than 2:1.',
          coreConcepts: [
            'Liquidity Sweeps & Market Structure Shifts',
            'Limit Orders vs Market Chasing: Slippage Control',
            'Pre-Market Preparation Checklist & Invalidation Protocol'
          ],
          courses: [
            {
              id: `c-2-1-${Date.now()}`,
              courseNumber: '2.1',
              title: 'Identifying Liquidity Sweeps & High-Value Price Levels',
              description: 'Spot where retail stop orders cluster and how institutional participants absorb supply before initiating directional moves.',
              estimatedMinutes: 14,
              completed: false
            },
            {
              id: `c-2-2-${Date.now()}`,
              courseNumber: '2.2',
              title: 'Execution Precision: Eliminating Slippage and Chasing',
              description: 'Enter with resting limit orders at calculated retests and let the market come to you instead of chasing green candles.',
              estimatedMinutes: 12,
              completed: false
            },
            {
              id: `c-2-3-${Date.now()}`,
              courseNumber: '2.3',
              title: 'The Pre-Market Checklist & Routine',
              description: 'Execute a daily 15-minute preparation routine: check economic calendar events, identify key levels, and set price alerts.',
              estimatedMinutes: 12,
              completed: false
            }
          ],
          checkpoint: {
            id: 'cp-2',
            title: 'Phase 2 Milestone: 20-Trade Execution Audit',
            description: 'Audit 20 logged trades to verify whether you adhered 100% to stop-loss placement and minimum 2:1 R:R parameters.',
            tangibleAsset: '20-Trade Performance Audit & Win-Rate/R:R Distribution',
            completed: false
          },
          completed: false
        },
        {
          id: `phase-3-${Date.now()}`,
          phaseNumber: 3,
          title: 'Drawdown Circuit Breakers & Capital Scaling',
          duration: 'Weeks 5-6',
          objective: 'Implement institutional drawdown rules, manage psychology during losing streaks, and qualify for funded prop trading accounts.',
          tangibleAsset: 'A completed 30-day performance playbook and prop firm evaluation readiness.',
          coreConcepts: [
            'Daily & Weekly Drawdown Circuit Breakers',
            'The Psychology of Probabilities & Accepting Losses',
            'Passing Funded Trader Evaluations with Capital Preservation'
          ],
          courses: [
            {
              id: `c-3-1-${Date.now()}`,
              courseNumber: '3.1',
              title: 'Drawdown Circuit Breakers: Protecting Capital from Tilt',
              description: 'Establish automated hard stops: if you lose 2 trades in a day, platform locks for 24 hours to prevent revenge trading.',
              estimatedMinutes: 12,
              completed: false
            },
            {
              id: `c-3-2-${Date.now()}`,
              courseNumber: '3.2',
              title: 'Psychological Reframing: Trading as a Statistical Casino',
              description: 'Treat each trade as one coin flip in a 1,000-trade series where edge plays out over volume, not individual outcomes.',
              estimatedMinutes: 14,
              completed: false
            },
            {
              id: `c-3-3-${Date.now()}`,
              courseNumber: '3.3',
              title: 'Passing Prop Firm Challenges ($50K-$100K Funded Accounts)',
              description: 'Adapt your strategy to pass prop desk evaluation rules with conservative daily drawdown targets and consistent pacing.',
              estimatedMinutes: 15,
              completed: false
            }
          ],
          checkpoint: {
            id: 'cp-3',
            title: 'Phase 3 Milestone: Live Strategy Playbook & Prop Verification',
            description: 'Finalize your 1-page trading system manual with confirmed positive mathematical expectancy over 30 days.',
            tangibleAsset: 'Master Trading System Manual & Prop Verification Plan',
            completed: false
          },
          completed: false
        }
      ],
      cutList: [
        {
          id: 'cut-1',
          topic: 'Staring at 15 Lagging Indicators (RSI, MACD, Bollinger Bands, Stochastics)',
          reasonToSkip: 'Indicators derive from price and lag reality, causing analysis paralysis and conflicting signals.',
          alternativeFocus: 'Focus solely on raw price action, market structure levels, and volume/liquidity.'
        },
        {
          id: 'cut-2',
          topic: 'Paid Signal Groups and Telegram "Guru" Alerts',
          reasonToSkip: 'Creates external dependence with zero personal edge; slippage eats all theoretical profits.',
          alternativeFocus: 'Learn to read the market independently and follow your own documented rules.'
        },
        {
          id: 'cut-3',
          topic: 'Trading Real Capital Without a Documented 2-Week Paper Record',
          reasonToSkip: 'Guarantees emotional trading and blown accounts while you are still learning mechanics.',
          alternativeFocus: 'Prove consistency and risk management on a simulator before risking a single dollar.'
        }
      ],
      chatHistory: []
    };
  }

  // 3. E-Book Publishing & Author Platform
  if (isEBook) {
    return {
      overview: `A complete, practical 6-week sprint from blank page to outlining, writing, formatting, and launching a best-selling non-fiction e-book on Amazon Kindle & Gumroad.`,
      estimatedWeeks: 6,
      phases: [
        {
          id: `phase-1-${Date.now()}`,
          phaseNumber: 1,
          title: 'Topic Validation, Hook & The Rapid Outline Architecture',
          duration: 'Weeks 1-2',
          objective: 'Identify an urgent, specific problem readers will pay to solve, write an irresistible book hook, and architect a 10-chapter outline.',
          tangibleAsset: 'A validated book title, subtitle, hook, and complete 10-chapter bulleted roadmap.',
          coreConcepts: [
            'Finding High-Demand Non-Fiction Market Problems',
            'The "One Transformation" Promise & Title Architecture',
            'The 3-Tier Outline: Chapters, Core Lessons & Actionable Takeaways'
          ],
          courses: [
            {
              id: `c-1-1-${Date.now()}`,
              courseNumber: '1.1',
              title: 'Finding High-Demand Problems People Already Pay to Solve',
              description: 'Mine Amazon reviews, Reddit communities, and search volume to find painful bottlenecks with eager buyers.',
              estimatedMinutes: 12,
              completed: false
            },
            {
              id: `c-1-2-${Date.now()}`,
              courseNumber: '1.2',
              title: 'Crafting the Title, Subtitle & Single Big Promise',
              description: 'Write titles that command attention and clearly state the tangible transformation the reader achieves.',
              estimatedMinutes: 12,
              completed: false
            },
            {
              id: `c-1-3-${Date.now()}`,
              courseNumber: '1.3',
              title: 'The Rapid 10-Chapter Non-Fiction Outline Formula',
              description: 'Structure every chapter with Hook, Core Concept, Real-World Story, Framework, and Homework Exercise.',
              estimatedMinutes: 15,
              completed: false
            }
          ],
          checkpoint: {
            id: 'cp-1',
            title: 'Phase 1 Milestone: Completed Book Blueprint & Chapter 1 Draft',
            description: 'Finalize the full table of contents with detailed sub-bullets and draft a polished 1,500-word opening chapter.',
            tangibleAsset: 'Detailed 10-Chapter Book Blueprint & Sample Chapter 1',
            completed: false
          },
          completed: false
        },
        {
          id: `phase-2-${Date.now()}`,
          phaseNumber: 2,
          title: 'The 1,000-Word Daily Writing Sprint & Self-Editing',
          duration: 'Weeks 3-4',
          objective: 'Complete a 15,000 to 20,000-word manuscript using focused writing sprints, followed by ruthless editing for clarity.',
          tangibleAsset: 'A finished, edited manuscript formatted in Markdown / Google Docs.',
          coreConcepts: [
            'Separating Writing from Editing to Maintain Momentum',
            'The Analytical Editor Redline Method: Cutting Fluff & Passive Voice',
            'Formatting for Clean Digital Reading (Short Paragraphs, Callout Boxes)'
          ],
          courses: [
            {
              id: `c-2-1-${Date.now()}`,
              courseNumber: '2.1',
              title: 'The 1,000-Word Daily Sprint: Writing Fast Without Overthinking',
              description: 'Use timed sprints and voice transcription to write without letting your inner critic slow you down.',
              estimatedMinutes: 12,
              completed: false
            },
            {
              id: `c-2-2-${Date.now()}`,
              courseNumber: '2.2',
              title: 'Self-Editing: Cutting 20% of Word Count to Double Impact',
              description: 'Identify throat-clearing intros, remove filler words, and convert passive explanations into direct coaching.',
              estimatedMinutes: 14,
              completed: false
            },
            {
              id: `c-2-3-${Date.now()}`,
              courseNumber: '2.3',
              title: 'Designing Callouts, Framework Diagrams & Action Checklists',
              description: 'Break up text with visual tables, key takeaway callout boxes, and end-of-chapter implementation checklists.',
              estimatedMinutes: 12,
              completed: false
            }
          ],
          checkpoint: {
            id: 'cp-2',
            title: 'Phase 2 Milestone: Complete 15,000-Word Edited Manuscript',
            description: 'Complete the entire draft manuscript through 2 rounds of editing and proofreading.',
            tangibleAsset: 'Finished 15,000-Word Non-Fiction Manuscript',
            completed: false
          },
          completed: false
        },
        {
          id: `phase-3-${Date.now()}`,
          phaseNumber: 3,
          title: 'Cover Design, Amazon KDP / Gumroad Setup & Launch',
          duration: 'Weeks 5-6',
          objective: 'Design a professional 3D cover, compile EPUB/PDF files, publish to Amazon KDP and Gumroad, and execute launch outreach.',
          tangibleAsset: 'A live published e-book on Amazon / Gumroad with first 25 verified readers.',
          coreConcepts: [
            'High-Click-Through-Rate Book Cover Design (Thumbnail Test)',
            'Amazon KDP Metadata, Categories & Keyword Strategy',
            'The 5-Day Launch Week Promo & Reader Review Playbook'
          ],
          courses: [
            {
              id: `c-3-1-${Date.now()}`,
              courseNumber: '3.1',
              title: 'Cover Design That Converts at Thumbnail Size',
              description: 'Use bold typography, high-contrast colors, and clean layout so your book stands out on mobile screens.',
              estimatedMinutes: 12,
              completed: false
            },
            {
              id: `c-3-2-${Date.now()}`,
              courseNumber: '3.2',
              title: 'Publishing on Amazon KDP & Gumroad (EPUB & PDF Delivery)',
              description: 'Format your book properly with Kindle Create, set up Gumroad landing pages, and price for maximum sales velocity.',
              estimatedMinutes: 15,
              completed: false
            },
            {
              id: `c-3-3-${Date.now()}`,
              courseNumber: '3.3',
              title: 'The Launch Playbook: Landing Your First 25 Verified Reviews',
              description: 'Form an Advance Reader Team (ARC) and launch with momentum to rank on Amazon category bestseller lists.',
              estimatedMinutes: 14,
              completed: false
            }
          ],
          checkpoint: {
            id: 'cp-3',
            title: 'Phase 3 Milestone: Live Published E-Book & First Sales',
            description: 'Publish your e-book live on Amazon KDP and Gumroad, share it with your launch list, and secure first verified reviews.',
            tangibleAsset: 'Live Published Book on Amazon KDP / Gumroad',
            completed: false
          },
          completed: false
        }
      ],
      cutList: [
        {
          id: 'cut-1',
          topic: 'Waiting for a Traditional Publisher or Literary Agent',
          reasonToSkip: 'Takes 18 to 24 months, surrenders 85% of royalties, and publishers expect you to bring your own audience anyway.',
          alternativeFocus: 'Self-publish digitally on Amazon KDP and Gumroad in 6 weeks with 70-90% profit margins.'
        },
        {
          id: 'cut-2',
          topic: 'Writing 300-Page Exhaustive Tomes',
          reasonToSkip: 'Modern readers want concise, actionable solutions in under 100 pages; bloated books have lower completion rates.',
          alternativeFocus: 'A razor-sharp 50-80 page manual that delivers on a single core transformation.'
        },
        {
          id: 'cut-3',
          topic: 'Hiring $3,000 Formatting and Typesetting Agencies',
          reasonToSkip: 'Free tools like Kindle Create and Atticus handle professional responsive formatting in under 30 minutes.',
          alternativeFocus: 'Format cleanly with modern Markdown/Kindle tools and invest budget into a great cover design.'
        }
      ],
      chatHistory: []
    };
  }

  // 4. Urban & Culinary Herb Gardening
  if (isGardening) {
    return {
      overview: `A practical, soil-to-plate 6-week roadmap to build a flourishing indoor or balcony culinary herb garden, master seed germination, and harvest fresh organic herbs weekly.`,
      estimatedWeeks: 6,
      phases: [
        {
          id: `phase-1-${Date.now()}`,
          phaseNumber: 1,
          title: 'Light Assessment, Container Selection & Living Soil Setup',
          duration: 'Weeks 1-2',
          objective: 'Measure your sunlight hours, choose the right pots and drainage systems, and blend nutrient-dense potting soil.',
          tangibleAsset: 'An operational 5-pot herb growing station with balanced soil and optimized light exposure.',
          coreConcepts: [
            'Diagnosing Sunlight: Direct Light vs Indirect vs Full-Spectrum LEDs',
            'Pot Drainage, Aeration & Root Space Fundamentals',
            'Blending Living Organic Soil (Peat, Perlite & Worm Castings)'
          ],
          courses: [
            {
              id: `c-1-1-${Date.now()}`,
              courseNumber: '1.1',
              title: 'Light Assessment: Finding Your Garden’s Photoperiod',
              description: 'How to calculate your daily hours of usable sunlight and when to introduce a low-cost $25 full-spectrum grow light.',
              estimatedMinutes: 10,
              completed: false
            },
            {
              id: `c-1-2-${Date.now()}`,
              courseNumber: '1.2',
              title: 'Choosing Containers: Terracotta vs Fabric Pots & Drainage Holes',
              description: 'Avoid the #1 killer of container plants: root rot caused by containers without proper drainage.',
              estimatedMinutes: 12,
              completed: false
            },
            {
              id: `c-1-3-${Date.now()}`,
              courseNumber: '1.3',
              title: 'Blending Living Soil: Moisture Retention vs Aeration',
              description: 'Mix the perfect beginner soil: 40% coco coir/peat, 30% perlite for aeration, and 30% organic compost or worm castings.',
              estimatedMinutes: 12,
              completed: false
            }
          ],
          checkpoint: {
            id: 'cp-1',
            title: 'Phase 1 Milestone: Growing Station Setup & Soil Test',
            description: 'Assemble your pots, test drainage flow with water, and position your station in its optimal light location.',
            tangibleAsset: 'Assembled Growing Station with Tested Soil Mix',
            completed: false
          },
          completed: false
        },
        {
          id: `phase-2-${Date.now()}`,
          phaseNumber: 2,
          title: 'Seed Germination, Root Development & Water Routine',
          duration: 'Weeks 3-4',
          objective: 'Germinate 5 high-yield culinary herbs (basil, rosemary, mint, thyme, parsley), establish root systems, and master the moisture test.',
          tangibleAsset: 'Actively growing seedlings with true leaf development and healthy root systems.',
          coreConcepts: [
            'High-Success Seed Germination & Humidity Domes',
            'The "Knuckle Test": Preventing Overwatering and Fungus Gnats',
            'Organic Pest Defense (Neem Oil, Bottom-Watering & Airflow)'
          ],
          courses: [
            {
              id: `c-2-1-${Date.now()}`,
              courseNumber: '2.1',
              title: 'Seed Germination: Sowing Depth & The Humidity Dome',
              description: 'Plant seeds at proper depth (2x seed diameter) and maintain gentle moisture until green sprouts emerge.',
              estimatedMinutes: 10,
              completed: false
            },
            {
              id: `c-2-2-${Date.now()}`,
              courseNumber: '2.2',
              title: 'Watering Mastery: Bottom Watering & The Knuckle Test',
              description: 'Learn why watering from below promotes deep downward root growth and eliminates surface fungal gnats.',
              estimatedMinutes: 12,
              completed: false
            },
            {
              id: `c-2-3-${Date.now()}`,
              courseNumber: '2.3',
              title: 'Thinning Seedlings & Airflow Circulation',
              description: 'Thin crowded seedlings so the strongest shoots thrive without nutrient competition, and run a gentle fan for thick stems.',
              estimatedMinutes: 10,
              completed: false
            }
          ],
          checkpoint: {
            id: 'cp-2',
            title: 'Phase 2 Milestone: Thriving Seedlings with True Leaves',
            description: 'Verify seed emergence across all 5 pots, thin appropriately, and log consistent watering schedules.',
            tangibleAsset: '5 Containers of Vigorous Seedlings with True Leaves',
            completed: false
          },
          completed: false
        },
        {
          id: `phase-3-${Date.now()}`,
          phaseNumber: 3,
          title: 'Pruning for Exponential Yield, Harvesting & Preservation',
          duration: 'Weeks 5-6',
          objective: 'Use strategic pruning above leaf nodes to double branch growth, harvest fresh herbs weekly without killing the plants, and preserve surplus.',
          tangibleAsset: 'First fresh culinary harvest and a preserved herb spice rack.',
          coreConcepts: [
            'The 45-Degree Node Pruning Cut to Multiply Branches',
            'Perpetual Harvesting Cycles: Taking Never More Than 30%',
            'Herb Preservation: Drying, Freezing in Olive Oil & Salt Rubs'
          ],
          courses: [
            {
              id: `c-3-1-${Date.now()}`,
              courseNumber: '3.1',
              title: 'Pruning Techniques: Turning Single Stems into Bushy Plants',
              description: 'Pinch the center terminal bud to stimulate dormant side nodes, doubling foliage every two weeks.',
              estimatedMinutes: 12,
              completed: false
            },
            {
              id: `c-3-2-${Date.now()}`,
              courseNumber: '3.2',
              title: 'Harvesting Protocols: Timing & Clean Scissors Technique',
              description: 'Harvest in early morning when essential oil concentration is highest, leaving the bottom two-thirds for regeneration.',
              estimatedMinutes: 10,
              completed: false
            },
            {
              id: `c-3-3-${Date.now()}`,
              courseNumber: '3.3',
              title: 'Preserving Surplus: Herb Drying & Olive Oil Freezer Cubes',
              description: 'Dehydrate surplus herbs for pantry spice jars and freeze delicate herbs (basil, cilantro) in olive oil trays.',
              estimatedMinutes: 12,
              completed: false
            }
          ],
          checkpoint: {
            id: 'cp-3',
            title: 'Phase 3 Milestone: First Harvest & Fresh Culinary Meal',
            description: 'Harvest fresh basil, rosemary, and thyme, prepare a dish using your home-grown herbs, and bottle your first dried seasonings.',
            tangibleAsset: 'First Harvest Yield & Preserved Kitchen Herb Stock',
            completed: false
          },
          completed: false
        }
      ],
      cutList: [
        {
          id: 'cut-1',
          topic: 'Buying $500 Smart Countertop Pod Systems',
          reasonToSkip: 'Expensive proprietary seed pods, tiny yields, and plastic parts that break easily.',
          alternativeFocus: 'Standard terracotta or fabric pots with high-quality organic living soil for 10x the yield at 1/5th the price.'
        },
        {
          id: 'cut-2',
          topic: 'Chemical Synthetic Fertilizers (Miracle-Gro Blue Powder)',
          reasonToSkip: 'Salts build up in container soil, kill beneficial microbes, and alter the authentic flavor of culinary herbs.',
          alternativeFocus: 'Organic worm castings and diluted kelp meal for rich, aromatic terpene profiles.'
        },
        {
          id: 'cut-3',
          topic: 'Watering on a Strict Daily Calendar Schedule',
          reasonToSkip: 'Weather, humidity, and plant size fluctuate; watering on a rigid timer causes soggy root rot.',
          alternativeFocus: 'Check soil moisture with the finger test and water only when the top inch is completely dry.'
        }
      ],
      chatHistory: []
    };
  }

  // 5. Artisan Sourdough Micro-Bakery
  if (isSourdough) {
    return {
      overview: `A tactile, science-backed 6-week masterclass from cultivating a wild yeast starter to mastering hydration, fermentation, shaping, scoring, and baking bakery-quality sourdough loaves.`,
      estimatedWeeks: 6,
      phases: [
        {
          id: `phase-1-${Date.now()}`,
          phaseNumber: 1,
          title: 'Wild Yeast Starter Cultivation & Fermentation Biology',
          duration: 'Weeks 1-2',
          objective: 'Capture wild yeast and lactic acid bacteria from whole wheat flour, establish a predictable 1:1:1 feeding cycle, and pass the float test.',
          tangibleAsset: 'A bubbly, active sourdough starter that consistently doubles in volume within 4-6 hours.',
          coreConcepts: [
            'The Symbiosis of Wild Yeast & Lactic Acid Bacteria',
            'Feeding Ratios (1:1:1 vs 1:2:2) & Temperature Management (78°F)',
            'Flour Science: Unbleached Bread Flour vs Rye vs Whole Wheat'
          ],
          courses: [
            {
              id: `c-1-1-${Date.now()}`,
              courseNumber: '1.1',
              title: 'Cultivating Wild Yeast: Days 1-7 Starter Protocol',
              description: 'Step-by-step daily water/flour feeding schedule, identifying the false bacterial bloom on Day 3, and cultivating true yeast by Day 7.',
              estimatedMinutes: 12,
              completed: false
            },
            {
              id: `c-1-2-${Date.now()}`,
              courseNumber: '1.2',
              title: 'Reading Starter Readiness: The Dome, Bubbles & Float Test',
              description: 'How to judge peak rise timing before acidity breaks down gluten structure, and verifying readiness with a float test.',
              estimatedMinutes: 10,
              completed: false
            },
            {
              id: `c-1-3-${Date.now()}`,
              courseNumber: '1.3',
              title: 'Flour Selection: Protein Percentages & Ash Content',
              description: 'Understand why high-protein unbleached bread flour (12.7%+) is required to support open crumb gas pockets.',
              estimatedMinutes: 12,
              completed: false
            }
          ],
          checkpoint: {
            id: 'cp-1',
            title: 'Phase 1 Milestone: Active Sourdough Starter Passing Float Test',
            description: 'Feed your starter, log its rise time, photograph a 100% volume doubling within 5 hours, and pass the glass float test.',
            tangibleAsset: 'Mature, Verified 100% Active Sourdough Starter',
            completed: false
          },
          completed: false
        },
        {
          id: `phase-2-${Date.now()}`,
          phaseNumber: 2,
          title: 'Autolyse, Bulk Fermentation & Gluten Structure',
          duration: 'Weeks 3-4',
          objective: 'Master dough hydration (70-75%), the autolyse phase, stretch-and-fold techniques, and reading bulk fermentation volume.',
          tangibleAsset: 'A pillowy, well-aerated dough showing 50% rise and strong gluten windowpanes.',
          coreConcepts: [
            'The Autolyse Phase: Enzymatic Action & Salt Timing',
            'Stretch-and-Fold vs Coil Folds for Gluten Network Building',
            'Reading Bulk Fermentation: Temperature, Alveoli & The Jiggle Test'
          ],
          courses: [
            {
              id: `c-2-1-${Date.now()}`,
              courseNumber: '2.1',
              title: 'Autolyse & Baker’s Percentages (72% Hydration Baseline)',
              description: 'Calculate flour, water, starter, and salt percentages, and allow flour to fully hydrate before adding levain.',
              estimatedMinutes: 14,
              completed: false
            },
            {
              id: `c-2-2-${Date.now()}`,
              courseNumber: '2.2',
              title: 'Gluten Development: Stretch-and-Folds & The Windowpane Test',
              description: 'Execute 4 sets of folds spaced 30 minutes apart to build gluten elasticity without violent kneading.',
              estimatedMinutes: 12,
              completed: false
            },
            {
              id: `c-2-3-${Date.now()}`,
              courseNumber: '2.3',
              title: 'Mastering Bulk Fermentation: Judging the Rise by Eye, Not Clock',
              description: 'Look for rounded edges, domed top, visible gas bubbles beneath the surface, and a light jiggle when shaken.',
              estimatedMinutes: 12,
              completed: false
            }
          ],
          checkpoint: {
            id: 'cp-2',
            title: 'Phase 2 Milestone: Successful Bulk Fermentation & Windowpane Test',
            description: 'Complete the bulk fermentation cycle, pull a thin translucent windowpane without tearing, and prepare dough for shaping.',
            tangibleAsset: 'Proofed Aerated Sourdough Dough Ready for Shaping',
            completed: false
          },
          completed: false
        },
        {
          id: `phase-3-${Date.now()}`,
          phaseNumber: 3,
          title: 'Pre-Shaping, Scoring & Dutch Oven Baking',
          duration: 'Weeks 5-6',
          objective: 'Create taut surface tension in a boule or batard, cold-retard overnight in a banneton, score with a razor, and bake in a hot cast iron Dutch oven.',
          tangibleAsset: 'A finished, blistered golden sourdough loaf with an open crumb, singing crust, and prominent ear.',
          coreConcepts: [
            'Pre-Shaping & Creating Surface Tension (Bench Knife Mechanics)',
            'Overnight Cold Retardation in Bannetons for Sour Flavor Development',
            'Scoring Angle (45°) & High-Heat Steam Baking in a Dutch Oven'
          ],
          courses: [
            {
              id: `c-3-1-${Date.now()}`,
              courseNumber: '3.1',
              title: 'Shaping Boules & Batards: Creating Surface Tension',
              description: 'Roll and stitch the dough against the work surface to build tension that prevents the loaf from flattening out during baking.',
              estimatedMinutes: 14,
              completed: false
            },
            {
              id: `c-3-2-${Date.now()}`,
              courseNumber: '3.2',
              title: 'Scoring with a Lame: Getting the Coveted Sourdough "Ear"',
              description: 'Hold the blade at a 45-degree angle to create an intentional flap where expanding steam can erupt cleanly.',
              estimatedMinutes: 10,
              completed: false
            },
            {
              id: `c-3-3-${Date.now()}`,
              courseNumber: '3.3',
              title: 'Dutch Oven Baking: 450°F Steam Phase & Crust Caramelization',
              description: 'Bake covered for 20 minutes to trap internal steam, then uncover for 20 minutes to achieve deep mahogany blistered crust.',
              estimatedMinutes: 12,
              completed: false
            }
          ],
          checkpoint: {
            id: 'cp-3',
            title: 'Phase 3 Milestone: Fresh Artisan Loaf & Crumb Shot Review',
            description: 'Bake your sourdough loaf, let it cool completely for 2 hours, cut into the center, and inspect crumb openness and blistered ear.',
            tangibleAsset: 'Fresh Artisan Sourdough Loaf with Crumb Analysis',
            completed: false
          },
          completed: false
        }
      ],
      cutList: [
        {
          id: 'cut-1',
          topic: 'Starting with 85%+ Super-High Hydration Recipes',
          reasonToSkip: 'High hydration dough turns into sticky soup for beginners and destroys confidence.',
          alternativeFocus: 'Master 70-72% hydration first where dough holds its shape cleanly, then gradually increase water.'
        },
        {
          id: 'cut-2',
          topic: 'Expensive Commercial Proofing Boxes & Equipment',
          reasonToSkip: 'A warm oven with just the interior light turned on provides an ideal 78°F proofing environment for $0.',
          alternativeFocus: 'Use your home oven with the light bulb on as a natural, stable proofer.'
        },
        {
          id: 'cut-3',
          topic: 'Cutting Warm Sourdough Straight Out of the Oven',
          reasonToSkip: 'Trapped interior steam will turn the crumb gummy and damp before starches finish gelatinizing.',
          alternativeFocus: 'Let the loaf cool on a wire rack for a minimum of 2 full hours before slicing.'
        }
      ],
      chatHistory: []
    };
  }

  // 6. Public Speaking & High-Stakes Presentations
  if (isSpeaking) {
    return {
      overview: `A transformative 6-week speaking masterclass to overcome stage anxiety, craft captivating narrative throughlines, master vocal pacing, and deliver memorable keynotes.`,
      estimatedWeeks: 6,
      phases: [
        {
          id: `phase-1-${Date.now()}`,
          phaseNumber: 1,
          title: 'The Single Big Idea & Narrative Arc Architecture',
          duration: 'Weeks 1-2',
          objective: 'Identify your talk’s core "throughline", eliminate slide clutter, and write an opening 60-second hook that captures the room.',
          tangibleAsset: 'A 1-page Talk Blueprint with a proven narrative story arc and typed opening hook.',
          coreConcepts: [
            'The "Throughline": Finding the Single Irreducible Idea',
            'The Hero’s Journey Arc: Problem, Tension, Insight, Transformation',
            'The 60-Second Hook: Story, Provocative Question, or Bold Stat'
          ],
          courses: [
            {
              id: `c-1-1-${Date.now()}`,
              courseNumber: '1.1',
              title: 'Finding Your Throughline: The 15-Word Core Idea',
              description: 'Every great talk is about ONE thing. Summarize your core thesis in 15 words before drafting a single slide.',
              estimatedMinutes: 10,
              completed: false
            },
            {
              id: `c-1-2-${Date.now()}`,
              courseNumber: '1.2',
              title: 'Structuring the Narrative Arc (What Is vs What Could Be)',
              description: 'Alternate between the audience’s current struggle and the future possibilities to create tension and engagement.',
              estimatedMinutes: 12,
              completed: false
            },
            {
              id: `c-1-3-${Date.now()}`,
              courseNumber: '1.3',
              title: 'Crafting the First 60 Seconds: Hooks That Grab Attention',
              description: 'Skip boring housekeeping ("Hello everyone, glad to be here") and jump straight into high-contrast story tension.',
              estimatedMinutes: 10,
              completed: false
            }
          ],
          checkpoint: {
            id: 'cp-1',
            title: 'Phase 1 Milestone: 1-Page Talk Blueprint & Hook Script',
            description: 'Write out your 15-word throughline, 3 supporting pillars, and full verbatim opening 60-second hook.',
            tangibleAsset: '1-Page Talk Blueprint & Verbatim Opening Hook',
            completed: false
          },
          completed: false
        },
        {
          id: `phase-2-${Date.now()}`,
          phaseNumber: 2,
          title: 'Vocal Command, Breath Control & Eliminating Filler Words',
          duration: 'Weeks 3-4',
          objective: 'Master diaphragmatic breathing to eliminate shaky voice, use deliberate silence instead of filler words, and vary pitch and cadence.',
          tangibleAsset: 'A 3-minute video recording demonstrating vocal pacing, eye contact, and zero filler words.',
          coreConcepts: [
            'Diaphragmatic Breathing: Centering the Vagus Nerve Under Adrenaline',
            'The Power of the 3-Second Pause: Replacing "Um" and "Like"',
            'Vocal Dynamics: Speeding Up for Energy, Slowing Down for Gravity'
          ],
          courses: [
            {
              id: `c-2-1-${Date.now()}`,
              courseNumber: '2.1',
              title: 'Diaphragmatic Breathing: Overcoming Adrenaline Shakes',
              description: 'Box breathing routines to lower heart rate in the green room before walking onto the stage.',
              estimatedMinutes: 10,
              completed: false
            },
            {
              id: `c-2-2-${Date.now()}`,
              courseNumber: '2.2',
              title: 'The Silent Pause: Eradicating Filler Words Permanently',
              description: 'Train your brain to embrace silent pauses while thinking instead of emitting unconscious filler sounds.',
              estimatedMinutes: 12,
              completed: false
            },
            {
              id: `c-2-3-${Date.now()}`,
              courseNumber: '2.3',
              title: 'Vocal Variety: Pitch, Volume & Intentional Pacing',
              description: 'Vary your voice like music: modulate volume down to create intimacy, and vary speed to maintain hypnotic engagement.',
              estimatedMinutes: 12,
              completed: false
            }
          ],
          checkpoint: {
            id: 'cp-2',
            title: 'Phase 2 Milestone: 3-Minute Video Self-Review',
            description: 'Record yourself delivering the opening of your talk on camera, review for filler words, and score eye contact and posture.',
            tangibleAsset: 'Recorded 3-Minute Video Delivery & Self-Evaluation Rubric',
            completed: false
          },
          completed: false
        },
        {
          id: `phase-3-${Date.now()}`,
          phaseNumber: 3,
          title: 'Slide Minimalism, Q&A Sparring & Full Delivery',
          duration: 'Weeks 5-6',
          objective: 'Design minimalist slides that amplify your message rather than distract, handle tough audience Q&A with poise, and deliver the full talk.',
          tangibleAsset: 'A complete delivered 10-15 minute talk with minimalist visual deck and Q&A handling playbook.',
          coreConcepts: [
            'Visual Deck Minimalism: One Idea Per Slide, Zero Wall-of-Text',
            'Q&A Sparring: Rephrasing, Validating & Answering Directly',
            'Pre-Stage Rituals & Transforming Fear into Charismatic Presence'
          ],
          courses: [
            {
              id: `c-3-1-${Date.now()}`,
              courseNumber: '3.1',
              title: 'Slide Design for Speakers: High-Impact Visuals Only',
              description: 'Slides are backdrops, not your teleprompter. Use full-bleed imagery and large bold key takeaways.',
              estimatedMinutes: 10,
              completed: false
            },
            {
              id: `c-3-2-${Date.now()}`,
              courseNumber: '3.2',
              title: 'Handling Tough Q&A and Hostile Skeptics with Grace',
              description: 'Acknowledge the questioner’s perspective, clarify the premise, and bridge back to your core principle.',
              estimatedMinutes: 12,
              completed: false
            },
            {
              id: `c-3-3-${Date.now()}`,
              courseNumber: '3.3',
              title: 'The Final Rehearsal & Delivery Checklist',
              description: 'Rehearse standing up with a timer, test clickers, and deliver your full presentation with confidence.',
              estimatedMinutes: 14,
              completed: false
            }
          ],
          checkpoint: {
            id: 'cp-3',
            title: 'Phase 3 Milestone: Live Presentation Delivery',
            description: 'Deliver your complete 10-15 minute presentation in front of a live audience, video recording, or peer study group.',
            tangibleAsset: 'Delivered Keynote Presentation Recording & Audience Feedback',
            completed: false
          },
          completed: false
        }
      ],
      cutList: [
        {
          id: 'cut-1',
          topic: 'Reading Dense Bulleted Lists Off PowerPoint Slides',
          reasonToSkip: 'The audience reads faster than you speak; reading slides bores the room and kills speaker credibility.',
          alternativeFocus: 'Speak directly to the audience with eye contact; use slides solely for supporting photos or single stats.'
        },
        {
          id: 'cut-2',
          topic: 'Memorizing Word-for-Word Scripts',
          reasonToSkip: 'If you forget one word, you freeze up and panic on stage.',
          alternativeFocus: 'Memorize your narrative structure and throughline transitions, allowing conversational wording to flow naturally.'
        },
        {
          id: 'cut-3',
          topic: 'Trying to Cram 10 Separate Topics into One Speech',
          reasonToSkip: 'Audience memory drops exponentially when presented with too many disparate points.',
          alternativeFocus: 'Stick to one central big idea reinforced by 3 memorable supporting examples.'
        }
      ],
      chatHistory: []
    };
  }

  // 7. Autonomous AI Agents & Multi-Agent Systems
  if (isAgent) {
    return {
      overview: `A rigorous, code-first 6-week roadmap to build, orchestrate, and deploy production-grade autonomous AI agents and multi-agent collaborative systems from scratch.`,
      estimatedWeeks: 6,
      phases: [
        {
          id: `phase-1-${Date.now()}`,
          phaseNumber: 1,
          title: 'The ReAct Loop, Function Calling & Tool Protocols',
          duration: 'Weeks 1-2',
          objective: 'Build a working autonomous agent from raw API calls using the ReAct (Reason + Act) loop, function calling, and self-healing schema parsing.',
          tangibleAsset: 'A working Python/TypeScript agent script executing live web searches, calculators, and API queries.',
          coreConcepts: [
            'The ReAct Loop: Thought, Action, Observation, Reflection',
            'Model Context Protocol (MCP) & Native Function Calling',
            'Deterministic JSON Schema Validation with Zod / Pydantic'
          ],
          courses: [
            {
              id: `c-1-1-${Date.now()}`,
              courseNumber: '1.1',
              title: 'Deconstructing the Autonomous ReAct Agent Loop',
              description: 'Understand how agents differ from passive chatbots: maintaining state, choosing tools, and observing outputs in an execution loop.',
              estimatedMinutes: 12,
              completed: false
            },
            {
              id: `c-1-2-${Date.now()}`,
              courseNumber: '1.2',
              title: 'Function Calling & Tool Execution Security',
              description: 'Define schemas for external tools, handle parameter extraction, and execute tools safely in a sandbox.',
              estimatedMinutes: 14,
              completed: false
            },
            {
              id: `c-1-3-${Date.now()}`,
              courseNumber: '1.3',
              title: 'Error Recovery & Handling Hallucinated Tool Calls',
              description: 'Catch malformed model outputs, feed error messages back into the conversation context, and trigger automatic self-correction.',
              estimatedMinutes: 12,
              completed: false
            }
          ],
          checkpoint: {
            id: 'cp-1',
            title: 'Phase 1 Milestone: Working Single-Agent Tool Execution Engine',
            description: 'Deploy a command-line agent that receives arbitrary research questions, invokes search/calculator tools, and verifies answers.',
            tangibleAsset: 'Functional ReAct Single-Agent Engine with 3 Custom Tools',
            completed: false
          },
          completed: false
        },
        {
          id: `phase-2-${Date.now()}`,
          phaseNumber: 2,
          title: 'Multi-Agent Architectures, Orchestration & Memory',
          duration: 'Weeks 3-4',
          objective: 'Orchestrate teams of specialized agents (e.g. Researcher, Coder, Critic) with shared state machines, message buses, and persistent memory.',
          tangibleAsset: 'A multi-agent swarm solving complex multi-step analysis tasks with supervisor routing.',
          coreConcepts: [
            'Multi-Agent Topologies: Hierarchical Supervisor vs Network Swarms',
            'State Machines & Directed Acyclic Graphs (DAGs)',
            'Short-Term Working Memory vs Long-Term Vector Retrieval'
          ],
          courses: [
            {
              id: `c-2-1-${Date.now()}`,
              courseNumber: '2.1',
              title: 'Multi-Agent Patterns: Hierarchical Supervisors & Delegation',
              description: 'Build a lead orchestrator agent that breaks down user objectives and delegates sub-tasks to specialized domain agents.',
              estimatedMinutes: 14,
              completed: false
            },
            {
              id: `c-2-2-${Date.now()}`,
              courseNumber: '2.2',
              title: 'Shared State Management & Message Passing Protocols',
              description: 'Coordinate shared data contexts across agents without race conditions using structured state machines.',
              estimatedMinutes: 12,
              completed: false
            },
            {
              id: `c-2-3-${Date.now()}`,
              courseNumber: '2.3',
              title: 'Long-Term Memory: Vector Embeddings & Episodic Storage',
              description: 'Equip agents with past session memory using vector databases (Chroma/Pinecone) and episodic key-value stores.',
              estimatedMinutes: 14,
              completed: false
            }
          ],
          checkpoint: {
            id: 'cp-2',
            title: 'Phase 2 Milestone: 3-Agent Collaborative System',
            description: 'Deploy a multi-agent pipeline where an Analyst researches a topic, an Author drafts findings, and an Editor redlines the work.',
            tangibleAsset: 'Working 3-Agent Collaborative Pipeline with State Routing',
            completed: false
          },
          completed: false
        },
        {
          id: `phase-3-${Date.now()}`,
          phaseNumber: 3,
          title: 'Production Guardrails, Cost Optimization & Automated Evals',
          duration: 'Weeks 5-6',
          objective: 'Add safety guardrails, budget/latency rate limits, and build automated LLM-as-a-judge evaluation benchmarks.',
          tangibleAsset: 'A production-hardened agent system with automated test suites and cost telemetry.',
          coreConcepts: [
            'Prompt Injection Defense & Safe Code Execution Sandboxes',
            'Token Budget Management & Dynamic Context Window Pruning',
            'Automated Evaluation Benchmarks (LLM-as-a-Judge)'
          ],
          courses: [
            {
              id: `c-3-1-${Date.now()}`,
              courseNumber: '3.1',
              title: 'Hardening Agents: Guardrails, Injection Defense & Sandboxing',
              description: 'Prevent prompt injection, sanitize tool inputs, and isolate untrusted code execution in Docker/WebAssembly containers.',
              estimatedMinutes: 12,
              completed: false
            },
            {
              id: `c-3-2-${Date.now()}`,
              courseNumber: '3.2',
              title: 'Token & Cost Optimization: Context Compaction',
              description: 'Prune conversational history, summarize older observations, and route simple queries to smaller, faster models.',
              estimatedMinutes: 12,
              completed: false
            },
            {
              id: `c-3-3-${Date.now()}`,
              courseNumber: '3.3',
              title: 'Automated Evaluation Suites (Evals & Benchmarks)',
              description: 'Build automated CI/CD unit tests that score agent accuracy, tool selection correctness, and task completion rates.',
              estimatedMinutes: 15,
              completed: false
            }
          ],
          checkpoint: {
            id: 'cp-3',
            title: 'Phase 3 Milestone: Production-Ready Evaluated Agent System',
            description: 'Run an evaluation benchmark across 50 test cases, verifying that your agent achieves >90% accuracy within latency budgets.',
            tangibleAsset: 'Production Agent Repo with Automated Evaluation Test Suite',
            completed: false
          },
          completed: false
        }
      ],
      cutList: [
        {
          id: 'cut-1',
          topic: 'Over-Engineered 10-Agent Swarms with Circular Chat Loops',
          reasonToSkip: 'Uncontrolled multi-agent chat leads to compounding hallucinations, infinite loops, and massive API token bills.',
          alternativeFocus: 'Use deterministic state graphs (LangGraph/crewAI) with strict stop conditions and human-in-the-loop checkpoints.'
        },
        {
          id: 'cut-2',
          topic: 'Relying on Outdated LangChain Abstractions Without Understanding Core Prompts',
          reasonToSkip: 'Hides raw API payloads behind bloated wrappers that make debugging tool failures nearly impossible.',
          alternativeFocus: 'Understand raw function calling, native JSON schemas, and structured prompts directly.'
        },
        {
          id: 'cut-3',
          topic: 'Unbounded Context Window Dumping',
          reasonToSkip: 'Dumping 100,000 tokens of raw tool outputs degrades reasoning quality and spikes latency.',
          alternativeFocus: 'Aggressively extract only the relevant signals from tool outputs before injecting into prompt context.'
        }
      ],
      chatHistory: []
    };
  }

  // Universal Default for Any Arbitrary Topic
  const cleanTopic = topic.trim();
  return {
    overview: `A razor-sharp 6-week immersion roadmap engineered to take you from foundational concepts to building real-world proof-of-work in ${cleanTopic}.`,
    estimatedWeeks: 6,
    phases: [
      {
        id: `phase-1-${Date.now()}`,
        phaseNumber: 1,
        title: `Foundations, Core Principles & Starter Setup in ${cleanTopic}`,
        duration: 'Weeks 1-2',
        objective: `Master the essential foundational intuition of ${cleanTopic} and create your initial milestone draft or prototype.`,
        tangibleAsset: `A verified starter blueprint and initial working deliverable in ${cleanTopic}.`,
        coreConcepts: [
          `Core Principles & Foundational Mental Models of ${cleanTopic}`,
          `Practical Workflow Setup & Essential Execution Tools`,
          `Building Your First Working Milestone Deliverable`
        ],
        courses: [
          {
            id: `c-1-1-${Date.now()}`,
            courseNumber: '1.1',
            title: `What Is ${cleanTopic} & Core Intuition (Zero Jargon)`,
            description: `Understand the fundamental intuition, why beginners get confused, and the 3 core pillars of ${cleanTopic}.`,
            estimatedMinutes: 10,
            completed: false
          },
          {
            id: `c-1-2-${Date.now()}`,
            courseNumber: '1.2',
            title: `Essential Tools, Setup & Repeatable Execution Routines`,
            description: `Set up your core workspace, assemble your tools, and master the initial repeatable routine for ${cleanTopic}.`,
            estimatedMinutes: 12,
            completed: false
          },
          {
            id: `c-1-3-${Date.now()}`,
            courseNumber: '1.3',
            title: `Building Your Phase 1 Starter Deliverable`,
            description: `Apply your learnings to create your first tangible project asset and verify it against quality standards.`,
            estimatedMinutes: 15,
            completed: false
          }
        ],
        checkpoint: {
          id: 'cp-1',
          title: `Phase 1 Milestone: ${cleanTopic} Starter Project Draft`,
          description: `Build and validate your first working milestone project draft in ${cleanTopic}.`,
          tangibleAsset: `Validated Phase 1 Milestone Project Draft in ${cleanTopic}`,
          completed: false
        },
        completed: false
      },
      {
        id: `phase-2-${Date.now()}`,
        phaseNumber: 2,
        title: `Practical Execution, Core Mechanics & Deep Implementation`,
        duration: 'Weeks 3-4',
        objective: `Deepen your mastery, resolve edge-case mistakes, and complete your primary practical milestone in ${cleanTopic}.`,
        tangibleAsset: `A completed, functioning project build or practical case study in ${cleanTopic}.`,
        coreConcepts: [
          `Advanced Mechanics & High-Leverage Techniques in ${cleanTopic}`,
          `Troubleshooting Common Traps & Failure Modes`,
          `Applied Project Build & Real-World Quality Testing`
        ],
        courses: [
          {
            id: `c-2-1-${Date.now()}`,
            courseNumber: '2.1',
            title: `Advanced Mechanics & High-Leverage Techniques`,
            description: `Explore how top 1% practitioners achieve consistent high performance and speed in ${cleanTopic}.`,
            estimatedMinutes: 12,
            completed: false
          },
          {
            id: `c-2-2-${Date.now()}`,
            courseNumber: '2.2',
            title: `Troubleshooting Common Traps & Failure Modes`,
            description: `Learn the top 5 mistakes beginners make and exact protocols to diagnose and fix them.`,
            estimatedMinutes: 12,
            completed: false
          },
          {
            id: `c-2-3-${Date.now()}`,
            courseNumber: '2.3',
            title: `Constructing the Core Deliverable (Zero Fluff)`,
            description: `Hands-on execution guide to build the central milestone asset for your learning journey.`,
            estimatedMinutes: 15,
            completed: false
          }
        ],
        checkpoint: {
          id: 'cp-2',
          title: `Phase 2 Milestone: Functional Core Build in ${cleanTopic}`,
          description: `Complete and test your primary project deliverable against first-principles standards.`,
          tangibleAsset: `Functional Core Build & Completed Milestone in ${cleanTopic}`,
          completed: false
        },
        completed: false
      },
      {
        id: `phase-3-${Date.now()}`,
        phaseNumber: 3,
        title: `Refinement, Portfolio Proof & Real-World Launch`,
        duration: 'Weeks 5-6',
        objective: `Polish your work to industry standards, build verifiable portfolio proof, and present or launch your masterwork deliverable.`,
        tangibleAsset: `A public, verified portfolio artifact and launch showcase in ${cleanTopic}.`,
        coreConcepts: [
          `Quality Polish, Precision Redlines & Feedback Loops`,
          `Creating Public Verifiable Proof of Mastery`,
          `Distribution, Sharing & Next-Level Mastery`
        ],
        courses: [
          {
            id: `c-3-1-${Date.now()}`,
            courseNumber: '3.1',
            title: `Quality Polish, Redlines & High-Standard Review`,
            description: `Apply the Analytical Editor critique process to eliminate weak points and elevate your deliverable.`,
            estimatedMinutes: 10,
            completed: false
          },
          {
            id: `c-3-2-${Date.now()}`,
            courseNumber: '3.2',
            title: `Documenting Proof of Work: Building Your Public Showcase`,
            description: `Package your milestone deliverables into a clean, compelling portfolio showcase that proves your competence.`,
            estimatedMinutes: 12,
            completed: false
          },
          {
            id: `c-3-3-${Date.now()}`,
            courseNumber: '3.3',
            title: `Real-World Launch & Next-Level Trajectory`,
            description: `Share your project with your peers, gather real feedback, and chart your ongoing autodidactic roadmap.`,
            estimatedMinutes: 14,
            completed: false
          }
        ],
        checkpoint: {
          id: 'cp-3',
          title: `Phase 3 Milestone: Live Portfolio Deliverable in ${cleanTopic}`,
          description: `Publish and share your final deliverable, proving end-to-end mastery of ${cleanTopic}.`,
          tangibleAsset: `Live Published Deliverable & Portfolio Showcase in ${cleanTopic}`,
          completed: false
        },
        completed: false
      }
    ],
    cutList: [
      {
        id: 'cut-1',
        topic: `Consuming 50 hours of generic video tutorials before building anything in ${cleanTopic}`,
        reasonToSkip: 'Creates the illusion of competence without any muscle memory or retention.',
        alternativeFocus: 'Build tangible mini-deliverables every week using focused 15-minute Socratic sessions.'
      },
      {
        id: 'cut-2',
        topic: `Obsessing over secondary tools, templates, or cosmetics before validating the core mechanism`,
        reasonToSkip: 'Classic avoidance trap that burns cognitive energy on zero-leverage details.',
        alternativeFocus: 'Focus 100% on the single core principle that produces 80% of the real-world outcome.'
      },
      {
        id: 'cut-3',
        topic: `Passive reading without interactive testing or Feynman explanation drills`,
        reasonToSkip: 'Knowledge degrades within 48 hours without active recall and self-explanation.',
        alternativeFocus: 'Explain each concept out loud or in writing to your Socratic Tutor to cement deep understanding.'
      }
    ],
    chatHistory: []
  };
}
