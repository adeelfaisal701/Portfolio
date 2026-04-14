const MARQUEE_TAGS = [
  "React",
  "Next.js",
  "Python",
  "MongoDB",
  "FastAPI",
  "AI Development",
  "Cursor AI",
  "Full-Stack",
  "REST APIs",
  "Vercel Deploy",
];

type ProjectCard = {
  thumbClass: string;
  icon: string;
  badge: string;
  title: string;
  desc: string;
  pills: string[];
  repoUrl?: string;
  repoLabel?: string;
};

const PROJECTS: ProjectCard[] = [
  {
    thumbClass: "proj-thumb-1",
    icon: "🛒",
    badge: "E-Commerce",
    title: "Multi-Vendor Store",
    desc: "Full e-commerce platform with Stripe payments, real-time inventory, and admin analytics dashboard.",
    pills: ["Next.js", "Stripe", "MongoDB", "Tailwind"],
  },
  {
    thumbClass: "proj-thumb-2",
    icon: "🤖",
    badge: "AI Powered",
    title: "AI Analytics Platform",
    desc: "Business dashboard with GPT-4 powered insights, auto-generated reports, and predictive analytics.",
    pills: ["Python", "FastAPI", "OpenAI", "React"],
  },
  {
    thumbClass: "proj-thumb-3",
    icon: "💻",
    badge: "Portfolio",
    title: "Full Stack Web Development",
    desc: "This portfolio — Next.js App Router, TypeScript, and Tailwind CSS with a responsive layout, project showcase, and contact flows. Source on GitHub.",
    pills: ["Next.js", "TypeScript", "Tailwind CSS", "GitHub"],
    repoUrl: "https://github.com/adeelfaisal701/Portfolio",
    repoLabel: "View on GitHub",
  },
];

const SKILL_BOXES = [
  { icon: "⚛️", name: "React / Next.js", level: "Advanced" },
  { icon: "🐍", name: "Python / FastAPI", level: "Advanced" },
  { icon: "🍃", name: "MongoDB", level: "Advanced" },
  { icon: "☁️", name: "Vercel / Cloud", level: "Proficient" },
  { icon: "🤖", name: "AI / Cursor AI", level: "Advanced" },
  { icon: "🎨", name: "Tailwind CSS", level: "Advanced" },
];

const HERO_SKILLS = [
  { name: "React / Next.js", pct: 90 },
  { name: "Python / FastAPI", pct: 82 },
  { name: "MongoDB", pct: 85 },
  { name: "AI Integration", pct: 78 },
];

export default function Home() {
  const marqueeLoop = [...MARQUEE_TAGS, ...MARQUEE_TAGS];

  return (
    <div className="portfolio-shell">
      <nav className="nav" aria-label="Primary">
        <div className="logo">
          <span>FA</span>.dev
        </div>
        <div className="nav-right">
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
            className="nav-btn"
          >
            Hire Me ↗
          </a>
        </div>
      </nav>

      <section className="hero">
        <div>
          <div className="avail">
            <span className="avail-dot" aria-hidden />
            <span className="avail-text">Open to work</span>
          </div>
          <p className="hero-eyebrow">Full-Stack Web Developer · Lahore, PK</p>
          <h1 className="hero-h1">
            <span className="line1">Faisal</span>
            <span className="line2">Adeel</span>
          </h1>
          <p className="hero-desc">
            I build <b>fast, modern web apps</b> that clients love — from SaaS
            platforms to AI-powered tools. Clean code, sharp UI, shipped on time.
          </p>
          <div className="hero-actions">
            <a
              href="https://github.com/adeelfaisal701"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              aria-label="View my work on GitHub (opens in new tab)"
            >
              View My Work →
            </a>
            <a
              href="mailto:adeelfaisal701@gmail.com?subject=CV%20request"
              className="btn-ghost"
            >
              Download CV
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-n">15+</span>
              <span className="stat-l">Projects Done</span>
            </div>
            <div className="stat">
              <span className="stat-n">2+</span>
              <span className="stat-l">Years Exp</span>
            </div>
            <div className="stat">
              <span className="stat-n">100%</span>
              <span className="stat-l">Client Satisfaction</span>
            </div>
          </div>
        </div>

        <aside className="hero-card" aria-label="Profile card">
          <div className="hc-top">
            <div className="avatar">FA</div>
            <div>
              <div className="hc-name">Faisal Adeel</div>
              <div className="hc-role">Full-Stack Developer</div>
            </div>
            <div className="hc-online">Online</div>
          </div>
          <div className="hc-section">
            <div className="hc-label">Expertise</div>
            <div className="skill-row">
              {HERO_SKILLS.map((s) => (
                <div key={s.name} className="skill-item">
                  <span className="skill-name-s">{s.name}</span>
                  <div className="skill-bar-bg">
                    <div
                      className="skill-bar-fill"
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                  <span className="skill-pct">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hc-section">
            <div className="hc-label">Contact</div>
            <div className="hc-contact">
              <div className="contact-row">
                <div className="contact-icon" aria-hidden>
                  ✉
                </div>
                <a href="mailto:adeelfaisal701@gmail.com">
                  adeelfaisal701@gmail.com
                </a>
              </div>
              <div className="contact-row">
                <div className="contact-icon" aria-hidden>
                  ☎
                </div>
                <span>0309-1407288</span>
              </div>
              <div className="contact-row">
                <div className="contact-icon" aria-hidden>
                  📍
                </div>
                <span>Lahore, Pakistan</span>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <div className="marquee-wrap" aria-hidden>
        <div className="marquee-inner">
          {marqueeLoop.map((label, i) => (
            <span key={`${label}-${i}`} className="marquee-item">
              <span className="marquee-dot" />
              {label}
            </span>
          ))}
        </div>
      </div>

      <section className="section" id="work">
        <p className="sec-tag">Selected Work</p>
        <h2 className="sec-title">
          Projects that <span>Shipped</span>
        </h2>
        <p className="sec-sub">
          Real products, real clients. Every project is built with production-grade
          code and attention to detail.
        </p>
        <div className="proj-grid">
          {PROJECTS.map((p) => (
            <article key={p.title} className="proj-card">
              <div className={`proj-thumb ${p.thumbClass}`}>
                <div className="proj-thumb-icon">{p.icon}</div>
              </div>
              <div className="proj-body">
                <p className="proj-badge">{p.badge}</p>
                <h3 className="proj-title">{p.title}</h3>
                <p className="proj-desc">{p.desc}</p>
                <div className="proj-pills">
                  {p.pills.map((pill) => (
                    <span key={pill} className="pill">
                      {pill}
                    </span>
                  ))}
                </div>
                {p.repoUrl && p.repoLabel ? (
                  <a
                    href={p.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="proj-footer-link"
                  >
                    {p.repoLabel} →
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} id="about">
        <div className="about-grid">
          <div>
            <p className="sec-tag">About Me</p>
            <h2 className="about-big">
              Developer who <span>ships</span>, not just codes.
            </h2>
            <p className="about-text">
              I&apos;m a Full-Stack developer from Lahore with 2+ years of experience
              building scalable web apps. I use AI-assisted workflows (Cursor AI,
              GitHub Copilot) to deliver 3x faster without cutting quality.
            </p>
            <div className="exp-item">
              <div className="exp-year">2026</div>
              <div>
                <div className="exp-role">Web Developer</div>
                <div className="exp-co">Hangport · Lahore, Pakistan</div>
              </div>
            </div>
            <div className="exp-item">
              <div className="exp-year">2025</div>
              <div>
                <div className="exp-role">Web Developer</div>
                <div className="exp-co">Hangport · Lahore, Pakistan</div>
              </div>
            </div>
            <div className="exp-item">
              <div className="exp-year">2024</div>
              <div>
                <div className="exp-role">Freelance Full-Stack Developer</div>
                <div className="exp-co">Independent · Remote</div>
              </div>
            </div>
            <div className="exp-item">
              <div className="exp-year">2023–24</div>
              <div>
                <div className="exp-role">Web Developer</div>
                <div className="exp-co">Startup / Agency Projects</div>
              </div>
            </div>
            <div className="exp-item">
              <div className="exp-year">2022–23</div>
              <div>
                <div className="exp-role">Frontend Developer</div>
                <div className="exp-co">Learning & Freelance</div>
              </div>
            </div>
          </div>
          <div id="skills">
            <div className="skills-right">
              {SKILL_BOXES.map((s) => (
                <div key={s.name} className="skill-box">
                  <div className="sb-icon">{s.icon}</div>
                  <div className="sb-name">{s.name}</div>
                  <div className="sb-level">{s.level}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <p className="sec-tag">Social Proof</p>
        <h2 className="sec-title">
          Clients <span>Trust Me</span>
        </h2>
        <p className="sec-sub">
          Don&apos;t take my word for it — here&apos;s what clients say after we ship
          together.
        </p>
        <div className="test-grid">
          <div className="test-card">
            <div className="stars">★★★★★</div>
            <p className="test-quote">
              &quot;Faisal delivered our e-commerce platform ahead of schedule. The
              code was clean, the design was sharp, and he communicated perfectly
              throughout.&quot;
            </p>
            <div className="test-author">
              <div
                className="test-av"
                style={{
                  background: "linear-gradient(135deg,#7B61FF,#C084FC)",
                }}
              >
                AK
              </div>
              <div>
                <div className="test-name">Ahmed K.</div>
                <div className="test-role-t">CEO, TechBridge PK</div>
              </div>
            </div>
          </div>
          <div className="test-card">
            <div className="stars">★★★★★</div>
            <p className="test-quote">
              &quot;Best developer I&apos;ve worked with on Upwork. He understood our
              vision immediately and built exactly what we needed — zero revisions
              needed.&quot;
            </p>
            <div className="test-author">
              <div
                className="test-av"
                style={{
                  background: "linear-gradient(135deg,#10b981,#059669)",
                }}
              >
                SM
              </div>
              <div>
                <div className="test-name">Sara M.</div>
                <div className="test-role-t">Product Lead, DataFlow</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="cta-section" id="cta">
        <h2 className="cta-title">
          Ready to build
          <br />
          something <span>incredible?</span>
        </h2>
        <p className="cta-sub">
          I&apos;m available for freelance projects and full-time roles. Let&apos;s talk
          about your idea.
        </p>
        <div className="cta-row-center">
          <a
            href="mailto:adeelfaisal701@gmail.com?subject=Start%20a%20project"
            className="btn-primary"
          >
            Start a Project ↗
          </a>
          <a href="mailto:adeelfaisal701@gmail.com" className="btn-ghost">
            adeelfaisal701@gmail.com
          </a>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-logo">
          <span>FA</span>.dev
        </div>
        <div className="footer-copy">© 2026 Faisal Adeel. All rights reserved.</div>
        <div className="footer-links">
          <a
            className="footer-link"
            href="https://github.com/adeelfaisal701"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            className="footer-link"
            href="https://www.linkedin.com/in/faisal-adeel-0246ab238"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a className="footer-link" href="#" title="Add your Twitter / X URL">
            Twitter
          </a>
        </div>
      </footer>
    </div>
  );
}
