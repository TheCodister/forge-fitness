import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth-options";
import "./landing.css";

const BrandMark = () => (
  <span className="ff-brand-mark" aria-hidden="true">
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect className="ff-bm-tile" width="32" height="32" rx="9" ry="9" />
      <path className="ff-bm-glyph" d="M 7 7 H 25 V 13 H 13 V 14 H 20 V 18 H 13 V 25 H 7 Z" />
      <path className="ff-bm-glyph" d="M 22.5 20 L 25 22.5 L 22.5 25 L 20 22.5 Z" />
    </svg>
  </span>
);

const IntensityBars = ({ level }: { level: number }) => (
  <div className="ff-intensity-bars">
    {Array.from({ length: 10 }, (_, i) => (
      <i key={i} className={i < level ? "on" : ""} />
    ))}
  </div>
);

export default async function Home() {
  const session = await getServerSession(authOptions);
  // if (session?.user) redirect("/dashboard");

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
            <a href="#programs">Programs</a>
            <a href="#trainers">Trainers</a>
            <Link href="/pricing">Pricing</Link>
            <a href="#schedule">Schedule</a>
            <a href="#locations">Locations</a>
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

      {/* HERO */}
      <section className="ff-hero">
        <div className="ff-container ff-hero-grid">
          <div>
            <div className="ff-hero-eye">
              <span className="ff-bar" />
              <span className="ff-eyebrow muted">Personal coaching · Est. 2018 · NYC + LA</span>
            </div>
            <h1 className="ff-hero-display">
              Train<br />like you<br /><em>mean&nbsp;it.</em>
            </h1>
            <p className="ff-hero-sub">
              One-on-one coaching, hybrid programming, and an AI training partner that knows
              your numbers. Built for people who want to get strong, not stay busy.
            </p>
            <div className="ff-hero-actions">
              <Link href="/dashboard" className="ff-btn ff-btn-primary ff-btn-arrow">
                Start Training
              </Link>
              <Link href="/trainer" className="ff-btn ff-btn-ghost ff-btn-arrow">
                Talk to AI Coach
              </Link>
            </div>
            <div className="ff-hero-meta">
              <div>
                <span className="ff-num">147</span>
                <span className="ff-label">Active members</span>
              </div>
              <div>
                <span className="ff-num">6</span>
                <span className="ff-label">AI trainers on staff</span>
              </div>
              <div>
                <span className="ff-num">24K+</span>
                <span className="ff-label">Sessions logged</span>
              </div>
              <div>
                <span className="ff-num">4.9<span style={{ fontSize: 18, color: "var(--ff-fg-subtle)" }}>/5</span></span>
                <span className="ff-label">Member rating</span>
              </div>
            </div>
          </div>

          {/* Live monitor card */}
          <aside className="ff-monitor" aria-label="Live session monitor">
            <div className="ff-monitor-head">
              <span className="ff-lbl">Live · Session 04:12</span>
            </div>
            <div className="ff-monitor-name">Devon R.</div>
            <div className="ff-monitor-session">Hybrid · Block C · Set 3 of 5</div>
            <div className="ff-metric-grid">
              <div className="ff-metric hot">
                <div className="ff-mlabel">Heart rate</div>
                <div className="ff-mval">162<span className="ff-unit">bpm</span></div>
              </div>
              <div className="ff-metric">
                <div className="ff-mlabel">Zone</div>
                <div className="ff-mval">Z4<span className="ff-unit">threshold</span></div>
              </div>
              <div className="ff-metric">
                <div className="ff-mlabel">Volume</div>
                <div className="ff-mval">8,420<span className="ff-unit">kg</span></div>
              </div>
              <div className="ff-metric">
                <div className="ff-mlabel">RPE avg</div>
                <div className="ff-mval">7.6<span className="ff-unit">/10</span></div>
              </div>
            </div>
            <div className="ff-hr-bar" aria-hidden="true">
              {[40, 60, 75, 55, 85, 70, 90, 65, 80, 55, 70, 85, 60, 75, 50, 65, 80, 45, 70, 85, 60, 75, 50, 65].map((h, i) => (
                <i key={i} style={{ height: `${h}%` }} />
              ))}
            </div>
          </aside>
        </div>
      </section>

      {/* TICKER */}
      <div className="ff-ticker" aria-hidden="true">
        <div className="ff-ticker-track">
          {["Strength", "Conditioning", "Hybrid", "Mobility", "Nutrition", "Recovery", "Powerlifting", "Endurance",
            "Strength", "Conditioning", "Hybrid", "Mobility", "Nutrition", "Recovery", "Powerlifting", "Endurance"].map((item, i) => (
            <span key={i} className={`ff-ticker-item${i % 2 === 1 ? " muted" : ""}`}>
              {i % 2 === 0 && <span className="ff-dot" />}
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* PROGRAMS */}
      <section className="ff-section" id="programs">
        <div className="ff-container">
          <div className="ff-section-head">
            <h2>Four<br />programs.<br /><span className="ff-accent-text">/ Zero filler.</span></h2>
            <div className="ff-section-meta">
              Each program is a 12-week block with weekly structure, video form checks,
              and a dedicated coach. Switch tracks anytime — your data follows you.
            </div>
          </div>
          <div className="ff-programs">
            <article className="ff-program">
              <div className="ff-program-head">
                <span className="ff-program-num">01 / Strength</span>
                <span className="ff-program-tier">Foundational</span>
              </div>
              <h3 className="ff-program-name">Forge<br /><em>Strength</em></h3>
              <p className="ff-program-desc">
                Linear and conjugate periodization. Squat, bench, deadlift, press —
                built around your numbers, not someone else&apos;s program.
              </p>
              <div className="ff-intensity">
                <div className="ff-intensity-lbl"><span>Intensity</span><span>8 / 10</span></div>
                <IntensityBars level={8} />
              </div>
              <div className="ff-program-tags">
                <span className="ff-program-tag">Powerlifting</span>
                <span className="ff-program-tag">3-4×/wk</span>
                <span className="ff-program-tag">90 min</span>
              </div>
            </article>

            <article className="ff-program">
              <div className="ff-program-head">
                <span className="ff-program-num">02 / Conditioning</span>
                <span className="ff-program-tier">High output</span>
              </div>
              <h3 className="ff-program-name">Engine<br /><em>Build</em></h3>
              <p className="ff-program-desc">
                Threshold work, intervals, and aerobic capacity. Heart-rate guided so you
                stay in the right zone instead of grinding yourself into the ground.
              </p>
              <div className="ff-intensity">
                <div className="ff-intensity-lbl"><span>Intensity</span><span>9 / 10</span></div>
                <IntensityBars level={9} />
              </div>
              <div className="ff-program-tags">
                <span className="ff-program-tag">Metcon</span>
                <span className="ff-program-tag">4×/wk</span>
                <span className="ff-program-tag">45 min</span>
              </div>
            </article>

            <article className="ff-program">
              <div className="ff-program-head">
                <span className="ff-program-num">03 / Hybrid</span>
                <span className="ff-program-tier">Most popular</span>
              </div>
              <h3 className="ff-program-name">Hybrid<br /><em>Athlete</em></h3>
              <p className="ff-program-desc">
                Strength on the bar, conditioning on the rower, mobility on the floor.
                A complete weekly stack for the people who want to be good at all of it.
              </p>
              <div className="ff-intensity">
                <div className="ff-intensity-lbl"><span>Intensity</span><span>7 / 10</span></div>
                <IntensityBars level={7} />
              </div>
              <div className="ff-program-tags">
                <span className="ff-program-tag">Strength + WOD</span>
                <span className="ff-program-tag">5×/wk</span>
                <span className="ff-program-tag">60 min</span>
              </div>
            </article>

            <article className="ff-program">
              <div className="ff-program-head">
                <span className="ff-program-num">04 / Recovery</span>
                <span className="ff-program-tier">Active rest</span>
              </div>
              <h3 className="ff-program-name">Mobility<br /><em>Reset</em></h3>
              <p className="ff-program-desc">
                Soft tissue, joint prep, breathwork. Run alongside any program to
                un-do the desk, the road, and the volume you&apos;ve been putting in.
              </p>
              <div className="ff-intensity">
                <div className="ff-intensity-lbl"><span>Intensity</span><span>3 / 10</span></div>
                <IntensityBars level={3} />
              </div>
              <div className="ff-program-tags">
                <span className="ff-program-tag">Prehab</span>
                <span className="ff-program-tag">2×/wk</span>
                <span className="ff-program-tag">30 min</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* TRAINERS */}
      <section className="ff-section ff-section-alt" id="trainers">
        <div className="ff-container">
          <div className="ff-section-head">
            <h2>Trainers who<br /><span className="ff-accent-text">never sleep.</span></h2>
            <div className="ff-section-meta">
              Six frontier models on the floor. Pick your primary, swap anytime
              — they all read from the same training log. No commute, no
              rescheduling, no human ego on the rack.
            </div>
          </div>
          <div className="ff-trainers">
            <article className="ff-trainer">
              <div className="ff-trainer-top">
                <div className="ff-monogram accent"><span>CL</span></div>
                <div>
                  <div className="ff-trainer-id">Trainer 01 · Anthropic</div>
                  <h3 className="ff-trainer-name">Claude</h3>
                  <div className="ff-trainer-spec">Form coach · Sonnet 4.5</div>
                </div>
              </div>
              <p className="ff-trainer-bio">
                Refuses to let you ego-lift. Reads every cue twice, explains why
                your bracing matters in three paragraphs. Will absolutely die on
                a &quot;neutral spine&quot; hill before letting you yank a PR.
              </p>
              <div className="ff-trainer-stats">
                <div className="ff-trainer-stat"><div className="v">200K</div><div className="l">Context</div></div>
                <div className="ff-trainer-stat"><div className="v">$3</div><div className="l">In / Mtok</div></div>
                <div className="ff-trainer-stat"><div className="v">$15</div><div className="l">Out / Mtok</div></div>
              </div>
            </article>

            <article className="ff-trainer">
              <div className="ff-trainer-top">
                <div className="ff-monogram"><span>GP</span></div>
                <div>
                  <div className="ff-trainer-id">Trainer 02 · OpenAI</div>
                  <h3 className="ff-trainer-name">GPT</h3>
                  <div className="ff-trainer-spec">Programming · GPT‑5</div>
                </div>
              </div>
              <p className="ff-trainer-bio">
                The default pick. Coached more first-time lifters than any other
                model in history because it read every rep scheme on the internet.
                Solid, predictable, occasionally hallucinates a deadlift cue.
              </p>
              <div className="ff-trainer-stats">
                <div className="ff-trainer-stat"><div className="v">400K</div><div className="l">Context</div></div>
                <div className="ff-trainer-stat"><div className="v">$1.25</div><div className="l">In / Mtok</div></div>
                <div className="ff-trainer-stat"><div className="v">$10</div><div className="l">Out / Mtok</div></div>
              </div>
            </article>

            <article className="ff-trainer">
              <div className="ff-trainer-top">
                <div className="ff-monogram"><span>GM</span></div>
                <div>
                  <div className="ff-trainer-id">Trainer 03 · Google</div>
                  <h3 className="ff-trainer-name">Gemini</h3>
                  <div className="ff-trainer-spec">Multimodal · 2.5 Pro</div>
                </div>
              </div>
              <p className="ff-trainer-bio">
                The only trainer with eyes. Watches your form video, reads your
                meal log, parses your wearable data — all in one breath. Long
                memory: remembers your warmups from two years ago.
              </p>
              <div className="ff-trainer-stats">
                <div className="ff-trainer-stat"><div className="v">2M</div><div className="l">Context</div></div>
                <div className="ff-trainer-stat"><div className="v">$1.25</div><div className="l">In / Mtok</div></div>
                <div className="ff-trainer-stat"><div className="v">$10</div><div className="l">Out / Mtok</div></div>
              </div>
            </article>

            <article className="ff-trainer">
              <div className="ff-trainer-top">
                <div className="ff-monogram accent"><span>GK</span></div>
                <div>
                  <div className="ff-trainer-id">Trainer 04 · xAI</div>
                  <h3 className="ff-trainer-name">Grok</h3>
                  <div className="ff-trainer-spec">No-BS strength · Grok 4</div>
                </div>
              </div>
              <p className="ff-trainer-bio">
                Will tell you your numbers are mid. Pulls live trends from the
                timeline mid-set to call out whatever fad routine you found on
                Sunday. Won&apos;t sugarcoat your peak week. Not for the easily roasted.
              </p>
              <div className="ff-trainer-stats">
                <div className="ff-trainer-stat"><div className="v">256K</div><div className="l">Context</div></div>
                <div className="ff-trainer-stat"><div className="v">$3</div><div className="l">In / Mtok</div></div>
                <div className="ff-trainer-stat"><div className="v">$15</div><div className="l">Out / Mtok</div></div>
              </div>
            </article>

            <article className="ff-trainer">
              <div className="ff-trainer-top">
                <div className="ff-monogram"><span>LM</span></div>
                <div>
                  <div className="ff-trainer-id">Trainer 05 · Meta</div>
                  <h3 className="ff-trainer-name">Llama</h3>
                  <div className="ff-trainer-spec">Open‑source · 405B</div>
                </div>
              </div>
              <p className="ff-trainer-bio">
                Free if you bring your own rack. Open weights, fully customizable,
                runs locally so your training data never leaves the gym. The
                garage-gym option for purists with a GPU under the squat bench.
              </p>
              <div className="ff-trainer-stats">
                <div className="ff-trainer-stat"><div className="v">128K</div><div className="l">Context</div></div>
                <div className="ff-trainer-stat"><div className="v">405B</div><div className="l">Params</div></div>
                <div className="ff-trainer-stat"><div className="v">Free</div><div className="l">Self-host</div></div>
              </div>
            </article>

            <article className="ff-trainer">
              <div className="ff-trainer-top">
                <div className="ff-monogram"><span>DS</span></div>
                <div>
                  <div className="ff-trainer-id">Trainer 06 · DeepSeek</div>
                  <h3 className="ff-trainer-name">DeepSeek</h3>
                  <div className="ff-trainer-spec">Budget powerhouse · V3</div>
                </div>
              </div>
              <p className="ff-trainer-bio">
                Punches twenty weight classes above its price. Mixture-of-Experts
                under the hood — different specialists wake up for different lifts.
                Quietly excellent at periodization. Surprised everyone by being good.
              </p>
              <div className="ff-trainer-stats">
                <div className="ff-trainer-stat"><div className="v">128K</div><div className="l">Context</div></div>
                <div className="ff-trainer-stat"><div className="v">671B</div><div className="l">MoE</div></div>
                <div className="ff-trainer-stat"><div className="v">$0.27</div><div className="l">In / Mtok</div></div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="ff-section" id="pricing">
        <div className="ff-container">
          <div className="ff-section-head">
            <h2>Three<br />tiers,<br /><span className="ff-accent-text">/ pay per token.</span></h2>
            <div className="ff-section-meta">
              Priced like the API, billed like a membership. Per million reps
              (input tokens). No human contracts, no peak-hour surge, cancel
              mid-set. Output billed separately, like cardio.{" "}
              <div style={{ marginTop: 16 }}>
                <Link href="/pricing" className="ff-btn ff-btn-ghost ff-btn-arrow" style={{ fontSize: 12 }}>
                  See full pricing
                </Link>
              </div>
            </div>
          </div>
          <div className="ff-pricing">
            <div className="ff-price">
              <div className="ff-price-tier">Tier 01 · Open source</div>
              <div className="ff-price-name">Self<br />host</div>
              <div>
                <div className="ff-price-amount">$0.27</div>
                <div className="ff-price-period">per 1M reps · input rate</div>
              </div>
              <div className="ff-price-includes">Trainers</div>
              <ul className="ff-price-list">
                <li>DeepSeek V3 + Llama 405B</li>
                <li>Run on your own hardware</li>
                <li>Open weights, full fine-tune access</li>
                <li>Data never leaves your gym</li>
                <li>No SLA, no apology emails</li>
              </ul>
              <Link href="/pricing" className="ff-btn ff-btn-dark ff-btn-arrow">Spin up locally</Link>
            </div>

            <div className="ff-price featured">
              <div className="ff-price-tag">Most chosen</div>
              <div className="ff-price-tier">Tier 02 · Mainstream</div>
              <div className="ff-price-name">Stand<br />ard</div>
              <div>
                <div className="ff-price-amount">$1.25</div>
                <div className="ff-price-period">per 1M reps · input rate</div>
              </div>
              <div className="ff-price-includes">Trainers</div>
              <ul className="ff-price-list">
                <li>GPT‑5 + Gemini 2.5 Pro</li>
                <li>400K – 2M token context window</li>
                <li>Multimodal — video, voice, text</li>
                <li>Real-time form analysis</li>
                <li>Output billed at $10 / 1M reps</li>
              </ul>
              <Link href="/dashboard" className="ff-btn ff-btn-arrow" style={{ background: "#0A0604", color: "#fff", marginTop: "auto" }}>
                Start training
              </Link>
            </div>

            <div className="ff-price">
              <div className="ff-price-tier">Tier 03 · Frontier</div>
              <div className="ff-price-name">Elite<br />1:1</div>
              <div>
                <div className="ff-price-amount">$15.00</div>
                <div className="ff-price-period">per 1M reps · input rate</div>
              </div>
              <div className="ff-price-includes">Trainers</div>
              <ul className="ff-price-list">
                <li>Claude Opus 4.1 + GPT‑5 Pro</li>
                <li>Extended thinking · deep reasoning</li>
                <li>Will refuse to let you ego-lift</li>
                <li>Output billed at $75 / 1M reps</li>
                <li>Priority access, no rate limits</li>
              </ul>
              <Link href="/pricing" className="ff-btn ff-btn-dark ff-btn-arrow">Request Frontier</Link>
            </div>
          </div>
        </div>
      </section>

      {/* SCHEDULE */}
      <section className="ff-section ff-section-alt" id="schedule">
        <div className="ff-container">
          <div className="ff-section-head">
            <h2>This<br />week<br /><span className="ff-accent-text">/ in session.</span></h2>
            <div className="ff-section-meta">
              Schedule shown for <strong style={{ color: "var(--ff-fg)" }}>Brooklyn — Atlantic Ave</strong>. All
              classes capped at 8 members. Book up to 7 days in advance.
            </div>
          </div>
          <div className="ff-schedule-wrap">
            <div className="ff-schedule-head">
              <div></div>
              <div>Mon<span className="ff-day-num">12</span></div>
              <div>Tue<span className="ff-day-num">13</span></div>
              <div>Wed<span className="ff-day-num">14</span></div>
              <div>Thu<span className="ff-day-num">15</span></div>
              <div>Fri<span className="ff-day-num">16</span></div>
              <div>Sat<span className="ff-day-num">17</span></div>
              <div>Sun<span className="ff-day-num">18</span></div>
            </div>
            {([
              { time: "06:00", cells: [
                { name: "Strength A", coach: "Claude", hot: true },
                { name: "Engine", coach: "GPT" },
                { name: "Strength B", coach: "Grok", hot: true },
                { name: "Engine", coach: "GPT" },
                { name: "Strength C", coach: "Claude", hot: true },
                null, null,
              ]},
              { time: "07:30", cells: [
                { name: "Hybrid", coach: "Gemini" },
                { name: "Olympic", coach: "Gemini", hot: true },
                { name: "Hybrid", coach: "DeepSeek" },
                { name: "Olympic", coach: "Gemini", hot: true },
                { name: "Hybrid", coach: "Grok" },
                { name: "Open Lift", coach: "Claude", hot: true },
                { name: "Mobility", coach: "Llama", recovery: true },
              ]},
              { time: "12:00", cells: [
                { name: "Engine", coach: "DeepSeek" },
                null,
                { name: "Engine", coach: "DeepSeek" },
                null,
                { name: "Engine", coach: "DeepSeek" },
                { name: "Engine", coach: "GPT" },
                null,
              ]},
              { time: "17:30", cells: [
                { name: "Strength A", coach: "Grok", hot: true },
                { name: "Hybrid", coach: "Gemini" },
                { name: "Strength B", coach: "Claude", hot: true },
                { name: "Hybrid", coach: "DeepSeek" },
                { name: "Strength C", coach: "Grok", hot: true },
                null, null,
              ]},
              { time: "19:00", cells: [
                { name: "Mobility", coach: "Llama", recovery: true },
                { name: "Engine+", coach: "GPT", hot: true },
                { name: "Mobility", coach: "Llama", recovery: true },
                { name: "Engine+", coach: "GPT", hot: true },
                null, null,
                { name: "Reset", coach: "Llama", recovery: true },
              ]},
            ] as { time: string; cells: ({ name: string; coach: string; hot?: boolean; recovery?: boolean } | null)[] }[]).map((row) => (
              <div key={row.time} className="ff-schedule-row">
                <div className="ff-schedule-time">{row.time}</div>
                {row.cells.map((cell, i) => (
                  <div key={i} className="ff-schedule-cell">
                    {cell && (
                      <div className={`ff-session${cell.hot ? " hot" : ""}${cell.recovery ? " recovery" : ""}`}>
                        <div className="ff-session-name">{cell.name}</div>
                        <div className="ff-session-coach">{cell.coach}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOCATIONS */}
      <section className="ff-section" id="locations">
        <div className="ff-container">
          <div className="ff-section-head">
            <h2>Three<br />floors,<br /><span className="ff-accent-text">two coasts.</span></h2>
            <div className="ff-section-meta">
              Train at any location on a single membership. Each space is built around
              a serious lifting platform plus a dedicated conditioning floor.
            </div>
          </div>
          <div className="ff-locations">
            <article className="ff-location">
              <div className="ff-location-num">Site / 01</div>
              <h3 className="ff-location-city">Brooklyn</h3>
              <div className="ff-location-area">Atlantic Ave · 8,400 sq ft</div>
              <div className="ff-location-meta">
                <div><strong>HOURS</strong> 05:30 – 21:00 daily</div>
                <div><strong>RACKS</strong> 6 platforms · 4 squat racks</div>
                <div><strong>FLOOR</strong> Concept2 row, ski, bike</div>
                <div className="ff-location-status">Open now · 14 in</div>
              </div>
            </article>
            <article className="ff-location">
              <div className="ff-location-num">Site / 02</div>
              <h3 className="ff-location-city">Manhattan</h3>
              <div className="ff-location-area">Flatiron · 6,200 sq ft</div>
              <div className="ff-location-meta">
                <div><strong>HOURS</strong> 05:00 – 22:00 daily</div>
                <div><strong>RACKS</strong> 4 platforms · 6 squat racks</div>
                <div><strong>FLOOR</strong> Sled track + assault bikes</div>
                <div className="ff-location-status">Open now · 22 in</div>
              </div>
            </article>
            <article className="ff-location">
              <div className="ff-location-num">Site / 03</div>
              <h3 className="ff-location-city">Venice</h3>
              <div className="ff-location-area">Abbot Kinney · 7,100 sq ft</div>
              <div className="ff-location-meta">
                <div><strong>HOURS</strong> 05:30 – 21:00 daily</div>
                <div><strong>RACKS</strong> 5 platforms · 5 squat racks</div>
                <div><strong>FLOOR</strong> Outdoor turf + sled lane</div>
                <div className="ff-location-status">Open now · 9 in</div>
              </div>
            </article>
          </div>

          {/* AI Callout */}
          <div className="ff-ai-callout">
            <div>
              <div className="ff-eyebrow" style={{ marginBottom: 16 }}>AI Coach · Always on</div>
              <h3>Stuck on form?<br />Got a question<br /><em>at 11pm?</em></h3>
              <p>
                Forge AI knows your numbers, your program, and the basics of every lift
                we coach. Ask it anything — exercise swaps, recovery questions, programming.
              </p>
              <Link href="/trainer" className="ff-btn ff-btn-primary ff-btn-arrow">Open the AI Coach</Link>
            </div>
            <div className="ff-ai-card">
              <div className="ff-ai-card-head">
                <span className="ff-ai-dot" />
                <span className="ff-eyebrow muted">Claude · Sonnet 4.5 · Online</span>
              </div>
              <div className="ff-ai-bubble user">My deadlift feels heavy on warmups today.</div>
              <div className="ff-ai-bubble">Drop top-set RPE to 7 and add 2 back-off sets at 75%. Sleep score?</div>
              <div className="ff-ai-bubble user">5h, rough night.</div>
              <div className="ff-ai-bubble">Then strip the back-offs too. We&apos;ll move volume to Wednesday.</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="ff-cta-strip">
        <div className="ff-container ff-cta-inner">
          <span className="ff-eyebrow">Ready when you are</span>
          <h2>Forge<br /><em>ahead.</em></h2>
          <p>Book a free 30-minute intake. Movement screen, goal-setting, and a
             walk-through of the floor with your potential coach.</p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/dashboard" className="ff-btn ff-btn-primary ff-btn-arrow">Start Training</Link>
            <Link href="/trainer" className="ff-btn ff-btn-ghost ff-btn-arrow">Ask AI Coach first</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="ff-footer">
        <div className="ff-container">
          <div className="ff-footer-top">
            <div className="ff-footer-brand">
              <div className="ff-brand" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <BrandMark />
                <span style={{ fontFamily: "var(--ff-font-display)", fontWeight: 900, fontSize: 22, textTransform: "uppercase", letterSpacing: "0.02em" }}>
                  Forge Fitness
                </span>
              </div>
              <p>Personal coaching, hybrid programming, and an AI training partner.
                 Built in Brooklyn since 2018.</p>
            </div>
            <div className="ff-footer-col">
              <h4>Train</h4>
              <ul>
                <li><a href="#programs">Programs</a></li>
                <li><a href="#schedule">Schedule</a></li>
                <li><Link href="/pricing">Membership</Link></li>
                <li><Link href="/trainer">AI Coach</Link></li>
              </ul>
            </div>
            <div className="ff-footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#trainers">Coaches</a></li>
                <li><a href="#locations">Locations</a></li>
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
