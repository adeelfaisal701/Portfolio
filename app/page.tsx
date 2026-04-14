const WA_LINK = "https://wa.me/923091407288";

const MARQUEE_TAGS = [
  "React",
  "Next.js",
  "Python",
  "MongoDB",
  "FastAPI",
  "AI Dev",
  "Cursor AI",
  "Stripe",
  "Tailwind",
  "Vercel",
  "TypeScript",
  "REST APIs",
];

type ShowcaseProject = {
  imgClass: string;
  emoji: string;
  tag: string;
  title: string;
  impact: string;
  desc: string;
  pills: string[];
  liveUrl: string;
  ghUrl: string;
  glow?: string;
};

const PROJECTS: ShowcaseProject[] = [
  {
    imgClass: "pcard-img-1",
    emoji: "🛒",
    tag: "E-Commerce",
    title: "Multi-Vendor Store",
    impact: "Reduced checkout time by 40%",
    desc: "Full store with Stripe payments, real-time inventory, and admin analytics dashboard.",
    pills: ["Next.js", "Stripe", "MongoDB", "Tailwind"],
    liveUrl:
      "mailto:adeelfaisal701@gmail.com?subject=Live%20demo%20request%20%E2%80%94%20Multi-Vendor%20Store",
    ghUrl: "https://github.com/adeelfaisal701",
  },
  {
    imgClass: "pcard-img-2",
    emoji: "🤖",
    tag: "AI Powered",
    title: "AI Analytics Dashboard",
    impact: "Saved 6hrs/week of manual reporting",
    desc: "GPT-4 powered insights, auto-generated reports, and predictive analytics for businesses.",
    pills: ["Python", "FastAPI", "OpenAI", "React"],
    liveUrl:
      "mailto:adeelfaisal701@gmail.com?subject=Live%20demo%20request%20%E2%80%94%20AI%20Analytics",
    ghUrl: "https://github.com/adeelfaisal701",
    glow: "rgba(74,222,128,0.15)",
  },
  {
    imgClass: "pcard-img-3",
    emoji: "💻",
    tag: "Portfolio",
    title: "Full Stack Web Development",
    impact: "Production-ready personal brand site",
    desc: "This portfolio — Next.js App Router, TypeScript, and Tailwind CSS with responsive layout and contact flows.",
    pills: ["Next.js", "TypeScript", "Tailwind CSS", "GitHub"],
    liveUrl:
      "mailto:adeelfaisal701@gmail.com?subject=Portfolio%20%E2%80%94%20live%20walkthrough",
    ghUrl: "https://github.com/adeelfaisal701/Portfolio",
    glow: "rgba(192,132,252,0.15)",
  },
];

const HERO_SKILLS = [
  { name: "React / Next.js", pct: 90 },
  { name: "Python / FastAPI", pct: 82 },
  { name: "MongoDB", pct: 85 },
  { name: "AI Integration", pct: 78 },
];

const SKILL_BOXES = [
  { icon: "⚛️", name: "React / Next.js", level: "Advanced · 90%", pct: 90 },
  { icon: "🐍", name: "Python / FastAPI", level: "Advanced · 82%", pct: 82 },
  { icon: "🍃", name: "MongoDB", level: "Advanced · 85%", pct: 85 },
  { icon: "☁️", name: "Vercel / Cloud", level: "Proficient · 80%", pct: 80 },
  { icon: "🤖", name: "AI / Cursor AI", level: "Advanced · 78%", pct: 78 },
  { icon: "🎨", name: "Tailwind CSS", level: "Advanced · 88%", pct: 88 },
];

const EXPERIENCE = [
  {
    yr: "2025–Now",
    role: "Web Developer",
    co: "Hangport · Lahore, Pakistan",
  },
  { yr: "2024", role: "Freelance Full-Stack Dev", co: "Independent · Remote" },
  {
    yr: "2023–24",
    role: "Web Developer",
    co: "Startup & Agency Projects",
  },
  {
    yr: "2022–23",
    role: "Frontend Developer",
    co: "Learning & Freelance",
  },
];

export default function Home() {
  const marqueeLoop = [...MARQUEE_TAGS, ...MARQUEE_TAGS];

  return (
    <div className="landing-v3">
      <div className="orb orb1" aria-hidden />
      <div className="orb orb2" aria-hidden />
      <div className="orb orb3" aria-hidden />

      <nav className="nav" aria-label="Primary">
        <div className="logo">
          <span>FA</span>.dev
        </div>
        <div className="nav-links">
          <a href="#work" className="nav-link">
            Work
          </a>
          <a href="#about" className="nav-link">
            About
          </a>
          <a href="#skills" className="nav-link">
            Skills
          </a>
          <a
            href="mailto:adeelfaisal701@gmail.com?subject=Hire%20me%20%E2%80%94%20Portfolio"
            className="hire-btn"
          >
            Hire Me ↗
          </a>
        </div>
      </nav>

      <section className="hero">
        <div>
          <div className="avail-badge">
            <span className="avail-dot" aria-hidden />
            <span className="avail-text">Available for freelance</span>
          </div>
          <p className="hero-tag">Full-Stack Developer · Lahore, Pakistan</p>
          <h1 className="hero-h1">
            <span className="h1-white">I build fast,</span>
            <span className="h1-grad">modern &amp; scalable</span>
            <span className="h1-white">web apps.</span>
          </h1>
          <p className="hero-value">
            For businesses that want <strong>results, not just code</strong> — I
            ship SaaS platforms, AI-powered tools, and e-commerce solutions that
            actually convert.
          </p>
          <div className="hero-cta-row">
            <a
              href="https://github.com/adeelfaisal701"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-main"
            >
              View My Work →
            </a>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="cta-whatsapp">
              <span className="wa-icon">💬</span> WhatsApp Me
            </a>
          </div>
          <div className="stats-row">
            <div className="stat">
              <span className="stat-n">15+</span>
              <span className="stat-l">Projects</span>
            </div>
            <div className="stat">
              <span className="stat-n">2+</span>
              <span className="stat-l">Years Exp</span>
            </div>
            <div className="stat">
              <span className="stat-n">100%</span>
              <span className="stat-l">On Time</span>
            </div>
          </div>
        </div>

        <aside className="hcard" aria-label="Profile card">
          <div className="hcard-top">
            <div className="hcard-av">FA</div>
            <div>
              <div className="hcard-name">Faisal Adeel</div>
              <div className="hcard-role">Full-Stack Developer</div>
            </div>
            <div className="hcard-status">Online</div>
          </div>
          <div className="hcard-section">
            <div className="hcard-label">Expertise Level</div>
            {HERO_SKILLS.map((s) => (
              <div key={s.name} className="sbar">
                <span className="sbar-name">{s.name}</span>
                <div className="sbar-track">
                  <div className="sbar-fill" style={{ width: `${s.pct}%` }} />
                </div>
                <span className="sbar-pct">{s.pct}%</span>
              </div>
            ))}
          </div>
          <div className="hcard-section" style={{ marginBottom: 0 }}>
            <div className="hcard-label">Contact</div>
            <div className="contact-items">
              <div className="ci">
                <div className="ci-icon" aria-hidden>
                  ✉
                </div>
                <div className="ci-text">
                  <a href="mailto:adeelfaisal701@gmail.com">adeelfaisal701@gmail.com</a>
                </div>
              </div>
              <div className="ci">
                <div className="ci-icon" aria-hidden>
                  ☎
                </div>
                <div className="ci-text">0309-1407288</div>
              </div>
              <div className="ci">
                <div className="ci-icon" aria-hidden>
                  📍
                </div>
                <div className="ci-text">Lahore, Pakistan</div>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <div className="marquee-wrap" aria-hidden>
        <div className="marquee-inner">
          {marqueeLoop.map((label, i) => (
            <span key={`${label}-${i}`} className="mi">
              <span className="mi-dot" />
              {label}
            </span>
          ))}
        </div>
      </div>

      <section className="section" id="work">
        <p className="sec-eyebrow">Selected Work</p>
        <h2 className="sec-h2">
          Projects that <span>Shipped</span>
        </h2>
        <p className="sec-sub">
          Real products, real clients. Built with clean code and attention to detail
          — every project has measurable impact.
        </p>
        <div className="proj-grid">
          {PROJECTS.map((p) => (
            <article key={p.title} className="pcard">
              <div className={`pcard-img ${p.imgClass}`}>
                <div
                  className="pcard-glow"
                  style={p.glow ? { background: p.glow } : undefined}
                />
                <div className="pcard-emoji">{p.emoji}</div>
              </div>
              <div className="pcard-body">
                <p className="pcard-tag">{p.tag}</p>
                <h3 className="pcard-title">{p.title}</h3>
                <p className="pcard-impact">{p.impact}</p>
                <p className="pcard-desc">{p.desc}</p>
                <div className="pcard-pills">
                  {p.pills.map((pill) => (
                    <span key={pill} className="ppill">
                      {pill}
                    </span>
                  ))}
                </div>
                <div className="pcard-btns">
                  <a href={p.liveUrl} className="pbtn-live">
                    Live Demo ↗
                  </a>
                  <a
                    href={p.ghUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pbtn-gh"
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} id="about">
        <div className="about-grid">
          <div>
            <p className="sec-eyebrow">About Me</p>
            <h2 className="about-h">
              Developer who <span>ships</span>,<br />
              not just codes.
            </h2>
            <p className="about-p">
              I&apos;m a Full-Stack developer from Lahore with 2+ years of real-world
              experience. I use AI-assisted workflows (Cursor AI, GitHub Copilot) to
              build and ship 3x faster — without cutting quality. Every line of code I
              write has a purpose.
            </p>
            <div className="exp-list">
              {EXPERIENCE.map((e) => (
                <div key={e.yr + e.role} className="exp-item">
                  <div className="exp-yr">{e.yr}</div>
                  <div>
                    <div className="exp-role">{e.role}</div>
                    <div className="exp-co">{e.co}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div id="skills">
            <div className="skills-grid">
              {SKILL_BOXES.map((s) => (
                <div key={s.name} className="sbox">
                  <span className="sbox-icon">{s.icon}</span>
                  <div className="sbox-name">{s.name}</div>
                  <div className="sbox-level">{s.level}</div>
                  <div className="sbox-bar">
                    <div
                      className="sbox-bar-fill"
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <p className="sec-eyebrow">Social Proof</p>
        <h2 className="sec-h2">
          Clients <span>Trust Me</span>
        </h2>
        <p className="sec-sub">Real feedback from real clients. No templates, no fakes.</p>
        <div className="test-grid">
          <div className="tcard">
            <div className="stars">★★★★★</div>
            <p className="tquote">
              &quot;Faisal delivered our e-commerce platform ahead of schedule. The
              code was clean, the design was sharp, and he communicated perfectly
              throughout. Will hire again.&quot;
            </p>
            <div className="tauthor">
              <div
                className="tav"
                style={{
                  background: "linear-gradient(135deg,#7B61FF,#C084FC)",
                }}
              >
                AK
              </div>
              <div>
                <div className="tname">Ahmed K.</div>
                <div className="trole">CEO, TechBridge PK</div>
              </div>
            </div>
          </div>
          <div className="tcard">
            <div className="stars">★★★★★</div>
            <p className="tquote">
              &quot;Best developer I&apos;ve worked with. He understood our vision
              immediately and built exactly what we needed — zero revisions, zero
              delays. Highly recommended.&quot;
            </p>
            <div className="tauthor">
              <div
                className="tav"
                style={{
                  background: "linear-gradient(135deg,#059669,#10b981)",
                }}
              >
                SM
              </div>
              <div>
                <div className="tname">Sara M.</div>
                <div className="trole">Product Lead, DataFlow</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="cta-wrap" id="cta">
        <h2 className="cta-h">
          Ready to build something
          <br />
          <span>incredible?</span>
        </h2>
        <p className="cta-p">
          I&apos;m available for freelance projects and full-time roles. Let&apos;s talk
          about your idea.
        </p>
        <div className="resp-badge">⚡ Response within 24 hours</div>
        <div className="cta-btns">
          <a
            href="mailto:adeelfaisal701@gmail.com?subject=Start%20a%20project"
            className="cta-main cta-compact"
          >
            Start a Project ↗
          </a>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="cta-wa">
            <span>💬</span> WhatsApp Me
          </a>
          <a href="mailto:adeelfaisal701@gmail.com" className="cta-email">
            adeelfaisal701@gmail.com
          </a>
        </div>
      </div>

      <footer className="footer">
        <div className="f-logo">
          <span>FA</span>.dev
        </div>
        <div className="f-copy">© 2026 Faisal Adeel · All rights reserved.</div>
        <div className="f-links">
          <a
            className="f-link"
            href="https://github.com/adeelfaisal701"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            className="f-link"
            href="https://www.linkedin.com/in/faisal-adeel-0246ab238"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a className="f-link" href="#" title="Add your Twitter / X URL">
            Twitter
          </a>
        </div>
      </footer>
    </div>
  );
}
