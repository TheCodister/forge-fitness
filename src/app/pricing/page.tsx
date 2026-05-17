import Link from "next/link";
import "../landing.css";

const BrandMark = () => (
  <span className="ff-brand-mark" aria-hidden="true">
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect className="ff-bm-tile" width="32" height="32" rx="9" ry="9" />
      <path className="ff-bm-glyph" d="M 7 7 H 25 V 13 H 13 V 14 H 20 V 18 H 13 V 25 H 7 Z" />
      <path className="ff-bm-glyph" d="M 22.5 20 L 25 22.5 L 22.5 25 L 20 22.5 Z" />
    </svg>
  </span>
);

export const metadata = {
  title: "Pricing — Forge Fitness",
  description: "Pay-per-token AI coaching. Three tiers, six frontier models. No contracts.",
};

export default function PricingPage() {
  return (
    <div className="forge-landing">
      {/* NAV */}
      <nav className="ff-nav">
        <div className="ff-container ff-nav-inner">
          <Link href="/" className="ff-brand">
            <BrandMark />
            Forge Fitness
          </Link>
          <div className="ff-nav-links">
            <Link href="/#programs">Programs</Link>
            <Link href="/#trainers">Trainers</Link>
            <Link href="/pricing" style={{ color: "var(--ff-accent)" }}>Pricing</Link>
            <Link href="/#schedule">Schedule</Link>
            <Link href="/#locations">Locations</Link>
          </div>
          <div className="ff-nav-cta">
            <Link href="/trainer" className="ff-nav-coach">
              <span className="ff-pulse" />
              Ask the AI Coach
            </Link>
            <Link href="/dashboard" className="ff-btn ff-btn-primary ff-btn-arrow">
              Start Training
            </Link>
          </div>
        </div>
      </nav>

      {/* PRICING HERO */}
      <section className="ff-section" style={{ paddingBottom: 0 }}>
        <div className="ff-container">
          <div style={{ textAlign: "center", paddingBottom: 80 }}>
            <div className="ff-eyebrow" style={{ marginBottom: 24 }}>Pricing · Pay per token</div>
            <h1
              style={{
                margin: 0,
                fontFamily: "var(--ff-font-display)",
                fontWeight: 900,
                fontSize: "clamp(48px, 8vw, 120px)",
                lineHeight: 0.88,
                letterSpacing: "-0.04em",
                textTransform: "uppercase",
                color: "var(--ff-fg)",
              }}
            >
              Three tiers,<br /><span style={{ color: "var(--ff-accent)", fontStyle: "italic" }}>no contracts.</span>
            </h1>
            <p
              style={{
                marginTop: 32,
                fontSize: 18,
                lineHeight: 1.55,
                color: "var(--ff-fg-muted)",
                maxWidth: 56,
              }}
            >
              Priced like the API, billed like a membership. Per million reps (input tokens).
              No peak-hour surge, no annual lock-in. Cancel mid-set if you want.
            </p>
          </div>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section className="ff-section ff-section-alt">
        <div className="ff-container">
          <div className="ff-pricing">
            {/* Tier 1 */}
            <div className="ff-price">
              <div className="ff-price-tier">Tier 01 · Open source</div>
              <div className="ff-price-name">Self<br />host</div>
              <div>
                <div className="ff-price-amount">$0.27</div>
                <div className="ff-price-period">per 1M reps · input rate</div>
              </div>
              <div className="ff-price-includes">What&apos;s included</div>
              <ul className="ff-price-list">
                <li>DeepSeek V3 + Llama 405B</li>
                <li>Run on your own hardware</li>
                <li>Open weights, full fine-tune access</li>
                <li>Data never leaves your gym</li>
                <li>128K context window</li>
                <li>No SLA, no apology emails</li>
                <li>Community support only</li>
              </ul>
              <Link href="/dashboard" className="ff-btn ff-btn-dark ff-btn-arrow">Spin up locally</Link>
            </div>

            {/* Tier 2 — featured */}
            <div className="ff-price featured">
              <div className="ff-price-tag">Most chosen</div>
              <div className="ff-price-tier">Tier 02 · Mainstream</div>
              <div className="ff-price-name">Stand<br />ard</div>
              <div>
                <div className="ff-price-amount">$1.25</div>
                <div className="ff-price-period">per 1M reps · input rate</div>
              </div>
              <div className="ff-price-includes">What&apos;s included</div>
              <ul className="ff-price-list">
                <li>GPT‑5 + Gemini 2.5 Pro</li>
                <li>400K – 2M token context window</li>
                <li>Multimodal — video, voice, text</li>
                <li>Real-time form analysis</li>
                <li>Conversation history + memory</li>
                <li>Output billed at $10 / 1M reps</li>
                <li>Email support, 24h response</li>
              </ul>
              <Link href="/dashboard" className="ff-btn ff-btn-arrow" style={{ background: "#0A0604", color: "#fff", marginTop: "auto" }}>
                Start training
              </Link>
            </div>

            {/* Tier 3 */}
            <div className="ff-price">
              <div className="ff-price-tier">Tier 03 · Frontier</div>
              <div className="ff-price-name">Elite<br />1:1</div>
              <div>
                <div className="ff-price-amount">$15.00</div>
                <div className="ff-price-period">per 1M reps · input rate</div>
              </div>
              <div className="ff-price-includes">What&apos;s included</div>
              <ul className="ff-price-list">
                <li>Claude Opus 4.1 + GPT‑5 Pro</li>
                <li>Extended thinking · deep reasoning</li>
                <li>Will refuse to let you ego-lift</li>
                <li>200K – 400K context window</li>
                <li>Priority access, no rate limits</li>
                <li>Output billed at $75 / 1M reps</li>
                <li>Dedicated Slack support channel</li>
              </ul>
              <Link href="/dashboard" className="ff-btn ff-btn-dark ff-btn-arrow">Request Frontier</Link>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="ff-section">
        <div className="ff-container">
          <div className="ff-section-head">
            <h2>All six<br /><span className="ff-accent-text">trainers.</span></h2>
            <div className="ff-section-meta">
              Every model on staff, their context window, and what they cost per million tokens.
              Mix and match within your tier at no extra charge.
            </div>
          </div>

          <div style={{
            background: "var(--ff-surface)",
            border: "1px solid var(--ff-line)",
            borderRadius: "var(--ff-r-12)",
            overflow: "hidden",
          }}>
            {/* Table header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 120px 120px 120px 180px",
              background: "var(--ff-bg-deep)",
              borderBottom: "1px solid var(--ff-line)",
              padding: "14px 24px",
              gap: 16,
            }}>
              {["Trainer", "Context", "In / 1M", "Out / 1M", "Tier"].map((h) => (
                <div key={h} style={{
                  fontFamily: "var(--ff-font-mono)",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--ff-fg-subtle)",
                }}>{h}</div>
              ))}
            </div>

            {[
              { monogram: "CL", accent: true, id: "Trainer 01 · Anthropic", name: "Claude", spec: "Sonnet 4.5", context: "200K", inRate: "$3.00", outRate: "$15.00", tier: "Frontier" },
              { monogram: "GP", id: "Trainer 02 · OpenAI", name: "GPT", spec: "GPT-5", context: "400K", inRate: "$1.25", outRate: "$10.00", tier: "Standard" },
              { monogram: "GM", id: "Trainer 03 · Google", name: "Gemini", spec: "2.5 Pro", context: "2M", inRate: "$1.25", outRate: "$10.00", tier: "Standard" },
              { monogram: "GK", accent: true, id: "Trainer 04 · xAI", name: "Grok", spec: "Grok 4", context: "256K", inRate: "$3.00", outRate: "$15.00", tier: "Frontier" },
              { monogram: "LM", id: "Trainer 05 · Meta", name: "Llama", spec: "405B", context: "128K", inRate: "Free*", outRate: "Free*", tier: "Self-host" },
              { monogram: "DS", id: "Trainer 06 · DeepSeek", name: "DeepSeek", spec: "V3", context: "128K", inRate: "$0.27", outRate: "$1.10", tier: "Self-host" },
            ].map((t, i) => (
              <div key={t.name} style={{
                display: "grid",
                gridTemplateColumns: "1fr 120px 120px 120px 180px",
                padding: "20px 24px",
                gap: 16,
                borderBottom: i < 5 ? "1px solid var(--ff-line-soft)" : undefined,
                alignItems: "center",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div className={`ff-monogram${t.accent ? " accent" : ""}`} style={{ width: 48, height: 48, fontSize: 16, borderRadius: 8 }}>
                    <span>{t.monogram}</span>
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--ff-font-mono)", fontSize: 10, color: "var(--ff-fg-subtle)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 2 }}>{t.id}</div>
                    <div style={{ fontFamily: "var(--ff-font-display)", fontWeight: 800, fontSize: 18, textTransform: "uppercase", letterSpacing: "-0.01em", color: "var(--ff-fg)" }}>{t.name} <span style={{ color: "var(--ff-fg-subtle)", fontWeight: 500, fontSize: 13 }}>{t.spec}</span></div>
                  </div>
                </div>
                <div style={{ fontFamily: "var(--ff-font-mono)", fontWeight: 700, color: "var(--ff-fg)" }}>{t.context}</div>
                <div style={{ fontFamily: "var(--ff-font-mono)", fontWeight: 700, color: "var(--ff-accent)" }}>{t.inRate}</div>
                <div style={{ fontFamily: "var(--ff-font-mono)", fontWeight: 700, color: "var(--ff-fg-muted)" }}>{t.outRate}</div>
                <div>
                  <span style={{
                    fontFamily: "var(--ff-font-mono)",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: t.tier === "Frontier" ? "rgba(255,90,31,0.12)" : "rgba(255,255,255,0.05)",
                    color: t.tier === "Frontier" ? "var(--ff-accent)" : "var(--ff-fg-muted)",
                    border: `1px solid ${t.tier === "Frontier" ? "rgba(255,90,31,0.3)" : "var(--ff-line-strong)"}`,
                  }}>{t.tier}</span>
                </div>
              </div>
            ))}
          </div>

          <p style={{ marginTop: 16, fontFamily: "var(--ff-font-mono)", fontSize: 11, color: "var(--ff-fg-subtle)", letterSpacing: "0.06em" }}>
            * Self-hosted models require your own infrastructure. Forge provides the tooling; compute costs are yours.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="ff-section ff-section-alt">
        <div className="ff-container">
          <div className="ff-section-head">
            <h2>Common<br /><span className="ff-accent-text">questions.</span></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
            {[
              {
                q: "What counts as a rep (token)?",
                a: "One token ≈ 4 characters of text. A typical coaching session exchanges 2,000–8,000 tokens. At Standard tier, a full week of daily check-ins costs under $0.10.",
              },
              {
                q: "Can I switch trainers mid-program?",
                a: "Yes. All six models read from the same training log. Swap at any time — your history, PRs, and notes travel with you.",
              },
              {
                q: "Is output really billed separately?",
                a: "Yes, just like the underlying APIs. Input (your messages + context) and output (the coach's replies) have different per-token rates. We show you a running cost estimate in the session view.",
              },
              {
                q: "Do I need a credit card to try it?",
                a: "No. Sign up free and explore the dashboard. You only enter payment when you send your first message to the AI Coach. First 10K tokens are on us.",
              },
              {
                q: "What is Self-host and do I need a server?",
                a: "Self-host means you run DeepSeek V3 or Llama 405B on your own hardware. Forge gives you the integration layer; you supply the GPU. A capable local machine or a cloud VM works fine.",
              },
              {
                q: "Is there a rate limit on Frontier?",
                a: "No hard limits on Frontier. Claude Opus and GPT-5 Pro operate at priority queue level. Heavy users (>50M tokens/month) get a dedicated capacity allocation by default.",
              },
            ].map((faq) => (
              <div key={faq.q} style={{
                background: "var(--ff-surface)",
                border: "1px solid var(--ff-line)",
                borderRadius: "var(--ff-r-12)",
                padding: "28px 32px",
              }}>
                <div style={{
                  fontFamily: "var(--ff-font-display)",
                  fontWeight: 700,
                  fontSize: 18,
                  letterSpacing: "-0.01em",
                  color: "var(--ff-fg)",
                  marginBottom: 12,
                }}>{faq.q}</div>
                <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ff-fg-muted)" }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="ff-cta-strip">
        <div className="ff-container ff-cta-inner">
          <span className="ff-eyebrow">Ready when you are</span>
          <h2>Start<br /><em>training.</em></h2>
          <p>First 10,000 tokens free. No credit card to sign up. Cancel anytime.</p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/dashboard" className="ff-btn ff-btn-primary ff-btn-arrow">Start Training</Link>
            <Link href="/trainer" className="ff-btn ff-btn-ghost ff-btn-arrow">Talk to AI Coach first</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="ff-footer">
        <div className="ff-container">
          <div className="ff-footer-top">
            <div className="ff-footer-brand">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <BrandMark />
                <span style={{ fontFamily: "var(--ff-font-display)", fontWeight: 900, fontSize: 22, textTransform: "uppercase", letterSpacing: "0.02em", color: "var(--ff-fg)" }}>
                  Forge Fitness
                </span>
              </div>
              <p>Personal coaching, hybrid programming, and an AI training partner.
                 Built in Brooklyn since 2018.</p>
            </div>
            <div className="ff-footer-col">
              <h4>Train</h4>
              <ul>
                <li><Link href="/#programs">Programs</Link></li>
                <li><Link href="/#schedule">Schedule</Link></li>
                <li><Link href="/pricing">Membership</Link></li>
                <li><Link href="/trainer">AI Coach</Link></li>
              </ul>
            </div>
            <div className="ff-footer-col">
              <h4>Company</h4>
              <ul>
                <li><Link href="/#trainers">Coaches</Link></li>
                <li><Link href="/#locations">Locations</Link></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Press</a></li>
              </ul>
            </div>
            <div className="ff-footer-col">
              <h4>Contact</h4>
              <ul>
                <li><a href="#">hello@forgefit.co</a></li>
                <li><a href="#">+1 (718) 555-0199</a></li>
                <li><a href="#">Instagram</a></li>
                <li><a href="#">Newsletter</a></li>
              </ul>
            </div>
          </div>
          <div className="ff-footer-bottom">
            <span>© 2026 Forge Fitness Co.</span>
            <span>NYC · Brooklyn · Venice</span>
            <span>v 4.2.0 · Crafted on the floor</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
