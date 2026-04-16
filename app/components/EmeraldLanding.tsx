"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import ReviewsSection from "./ReviewsSection";
import {
  IconAI,
  IconBolt,
  IconCloud,
  IconMongo,
  IconPython,
  IconReact,
  IconTailwind,
  IconWhatsApp,
} from "./portfolio-icons";

const WA = "https://wa.me/923091407288";
const MAIL = "mailto:adeelfaisal701@gmail.com";

const MARQUEE = [
  "React · Next.js",
  "Python · FastAPI",
  "MongoDB",
  "AI Integration",
  "Stripe Payments",
  "Full-Stack Dev",
  "Vercel · Cloud",
  "TypeScript",
];

function WhatsAppButton({ compact }: { compact?: boolean }) {
  return (
    <a
      className={`btn-whatsapp${compact ? " btn-whatsapp--compact" : ""}`}
      href={WA}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="btn-whatsapp-icon-wrap" aria-hidden>
        <IconWhatsApp className="btn-whatsapp-svg" />
      </span>
      <span className="btn-whatsapp-label">
        <span className="btn-whatsapp-title">WhatsApp</span>
        <span className="btn-whatsapp-sub">{compact ? "Chat" : "Open chat"}</span>
      </span>
    </a>
  );
}

export default function EmeraldLanding() {
  const rootRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const lfRef = useRef<HTMLDivElement>(null);
  const lpRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const curRef = useRef<HTMLDivElement>(null);
  const crRef = useRef<HTMLDivElement>(null);
  const cdRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const mx = useRef(0);
  const my = useRef(0);
  const rx = useRef(0);
  const ry = useRef(0);
  const mX = useRef(0);
  const mY = useRef(0);
  const trX = useRef(0);
  const trY = useRef(0);

  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    clock: THREE.Clock;
    icosahedron: THREE.Mesh;
    wireframe: THREE.Mesh;
    ring1: THREE.Mesh;
    ring2: THREE.Mesh;
    ring3: THREE.Mesh;
    pts1: THREE.Points;
    pts2: THREE.Points;
    raf: number;
  } | null>(null);

  useEffect(() => {
    const prevCursor = document.body.style.cursor;
    document.body.style.cursor = "none";
    return () => {
      document.body.style.cursor = prevCursor;
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const cur = curRef.current;
      const cr = crRef.current;
      const cd = cdRef.current;
      if (cur && cr && cd) {
        cur.style.left = `${mx.current}px`;
        cur.style.top = `${my.current}px`;
        cd.style.left = `${mx.current}px`;
        cd.style.top = `${my.current}px`;
        rx.current += (mx.current - rx.current) * 0.1;
        ry.current += (my.current - ry.current) * 0.1;
        cr.style.left = `${rx.current}px`;
        cr.style.top = `${ry.current}px`;
      }
      raf = requestAnimationFrame(tick);
    };
    const onMove = (e: MouseEvent) => {
      mx.current = e.clientX;
      my.current = e.clientY;
    };
    document.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const cards = rootRef.current?.querySelectorAll(".project-card");
    if (!cards?.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pending = new Map<HTMLElement, MouseEvent>();
    let scheduled = false;

    const flush = () => {
      scheduled = false;
      pending.forEach((ev, el) => {
        const rect = el.getBoundingClientRect();
        const glow = el.querySelector(".glow") as HTMLElement | null;
        if (glow) {
          glow.style.left = `${ev.clientX - rect.left}px`;
          glow.style.top = `${ev.clientY - rect.top}px`;
        }
        if (reduceMotion) {
          el.style.removeProperty("--tilt-x");
          el.style.removeProperty("--tilt-y");
          return;
        }
        const cx = (ev.clientX - rect.left) / rect.width - 0.5;
        const cy = (ev.clientY - rect.top) / rect.height - 0.5;
        el.style.setProperty("--tilt-x", `${cy * -5}deg`);
        el.style.setProperty("--tilt-y", `${cx * 5}deg`);
      });
      pending.clear();
    };

    const handlers: Array<{ el: HTMLElement; move: (e: Event) => void; leave: () => void }> = [];
    cards.forEach((card) => {
      const el = card as HTMLElement;
      const move = (e: Event) => {
        const ev = e as MouseEvent;
        pending.set(el, ev);
        if (!scheduled) {
          scheduled = true;
          requestAnimationFrame(flush);
        }
      };
      const leave = () => {
        pending.delete(el);
        el.style.removeProperty("--tilt-x");
        el.style.removeProperty("--tilt-y");
      };
      el.addEventListener("mousemove", move);
      el.addEventListener("mouseleave", leave);
      handlers.push({ el, move, leave });
    });

    return () => {
      handlers.forEach(({ el, move, leave }) => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
        el.style.removeProperty("--tilt-x");
        el.style.removeProperty("--tilt-y");
      });
    };
  }, []);

  useEffect(() => {
    const loader = loaderRef.current;
    const f = lfRef.current;
    const p = lpRef.current;
    if (!loader || !f || !p) return;

    let v = 0;
    let disposed = false;
    const iv = window.setInterval(() => {
      if (disposed) return;
      v += Math.random() * 14;
      if (v >= 100) {
        v = 100;
        window.clearInterval(iv);
      }
      f.style.width = `${v}%`;
      p.textContent = `${Math.floor(v)}%`;
      if (v === 100) {
        window.setTimeout(() => {
          if (disposed) return;
          gsap.to(loader, {
            opacity: 0,
            duration: 0.9,
            ease: "power2.inOut",
            onComplete: () => {
              if (disposed) return;
              loader.style.display = "none";
              startScene();
              startGsap();
            },
          });
        }, 300);
      }
    }, 60);

    const canvas = canvasRef.current;
    const nav = navRef.current;
    const scope = rootRef.current;

    function disposeThree() {
      const t = threeRef.current;
      if (!t) return;
      cancelAnimationFrame(t.raf);
      t.scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const mat = obj.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat.dispose();
        }
        if (obj instanceof THREE.Points) {
          obj.geometry.dispose();
          const mat = obj.material;
          if (!Array.isArray(mat)) mat.dispose();
        }
      });
      t.renderer.dispose();
      threeRef.current = null;
    }

    function initThree() {
      if (!canvas || disposed) return;
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        100,
      );
      camera.position.set(0, 0, 6);
      const clock = new THREE.Clock();

      scene.add(new THREE.AmbientLight(0x00ff88, 0.15));
      const d1 = new THREE.DirectionalLight(0x00ff88, 2.8);
      d1.position.set(3, 4, 4);
      scene.add(d1);
      const d2 = new THREE.DirectionalLight(0x4f9eff, 1.2);
      d2.position.set(-4, -2, 2);
      scene.add(d2);
      const pt = new THREE.PointLight(0x00d4ff, 3.5, 12);
      pt.position.set(0, 3, 3);
      scene.add(pt);
      const pt2 = new THREE.PointLight(0xa78bfa, 1.8, 8);
      pt2.position.set(-3, -2, 1);
      scene.add(pt2);

      const ig = new THREE.IcosahedronGeometry(1.1, 1);
      const icosahedron = new THREE.Mesh(
        ig,
        new THREE.MeshPhysicalMaterial({
          color: 0x00ff88,
          metalness: 0.9,
          roughness: 0.05,
          emissive: 0x003322,
          emissiveIntensity: 0.5,
          transparent: true,
          opacity: 0.82,
          wireframe: false,
        }),
      );
      scene.add(icosahedron);

      const wireframe = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.14, 1),
        new THREE.MeshBasicMaterial({
          color: 0x00ff88,
          wireframe: true,
          transparent: true,
          opacity: 0.08,
        }),
      );
      scene.add(wireframe);

      const ring1 = new THREE.Mesh(
        new THREE.TorusGeometry(2.0, 0.003, 4, 120),
        new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.18 }),
      );
      ring1.rotation.x = Math.PI / 2.2;
      scene.add(ring1);

      const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(2.5, 0.002, 4, 120),
        new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.1 }),
      );
      ring2.rotation.x = Math.PI / 3;
      ring2.rotation.z = 0.8;
      scene.add(ring2);

      const ring3 = new THREE.Mesh(
        new THREE.TorusGeometry(1.6, 0.002, 4, 80),
        new THREE.MeshBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.08 }),
      );
      ring3.rotation.y = Math.PI / 4;
      scene.add(ring3);

      const makeParticles = (count: number, spread: number, color: number, size: number, opacity: number) => {
        const g = new THREE.BufferGeometry();
        const arr = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i++) arr[i] = (Math.random() - 0.5) * spread;
        g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
        return new THREE.Points(g, new THREE.PointsMaterial({ color, size, transparent: true, opacity }));
      };
      const pts1 = makeParticles(1200, 22, 0x00ff88, 0.018, 0.3);
      scene.add(pts1);
      const pts2 = makeParticles(400, 16, 0x00d4ff, 0.025, 0.2);
      scene.add(pts2);

      const onMouseMove = (e: MouseEvent) => {
        mX.current = (e.clientX / window.innerWidth - 0.5) * 2;
        mY.current = -(e.clientY / window.innerHeight - 0.5) * 2;
      };
      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      document.addEventListener("mousemove", onMouseMove);
      window.addEventListener("resize", onResize);

      const store = {
        renderer,
        scene,
        camera,
        clock,
        icosahedron,
        wireframe,
        ring1,
        ring2,
        ring3,
        pts1,
        pts2,
        raf: 0,
      };
      threeRef.current = store;

      function animT() {
        if (disposed || !threeRef.current) return;
        const t = clock.getElapsedTime();
        trY.current += (mX.current * 0.25 - trY.current) * 0.05;
        trX.current += (-mY.current * 0.18 - trX.current) * 0.05;

        const sY = window.scrollY;
        const sc = Math.max(0.35, 1 - (sY / window.innerHeight) * 0.38);

        icosahedron.rotation.x = t * 0.14 + trX.current * 0.5;
        icosahedron.rotation.y = t * 0.18 + trY.current * 0.5;
        icosahedron.position.y = Math.sin(t * 0.6) * 0.1;
        icosahedron.scale.setScalar(sc);
        const mat = icosahedron.material as THREE.MeshPhysicalMaterial;
        mat.emissiveIntensity = 0.4 + Math.sin(t * 1.5) * 0.15;

        wireframe.rotation.copy(icosahedron.rotation);
        wireframe.position.copy(icosahedron.position);
        wireframe.scale.copy(icosahedron.scale);

        ring1.rotation.z += 0.0008;
        ring1.rotation.y += 0.0003;
        ring2.rotation.z -= 0.0006;
        ring2.rotation.x += 0.0004;
        ring3.rotation.y -= 0.0009;
        ring3.rotation.z += 0.0005;
        pts1.rotation.y += 0.00015;
        pts1.rotation.x += 0.00008;
        pts2.rotation.y -= 0.0002;
        pts2.rotation.z += 0.0001;

        renderer.render(scene, camera);
        store.raf = requestAnimationFrame(animT);
      }
      animT();

      return () => {
        document.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("resize", onResize);
        disposeThree();
      };
    }

    let gsapCleanup: (() => void) | null = null;

    function startGsap() {
      if (!scope || disposed) return;
      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        if (nav) {
          ScrollTrigger.create({
            start: "top -60",
            onUpdate: (self) => {
              nav.classList.toggle("sc", self.progress > 0);
            },
          });
        }

        gsap.set(["#hc", "#ht", "#hs", "#ha", "#hst"], { y: 30, opacity: 0 });
        const tl = gsap.timeline({ delay: 0.4 });
        tl.to("#hc", { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" })
          .to("#ht", { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" }, "<0.12")
          .to("#hs", { opacity: 1, y: 0, duration: 0.85, ease: "power3.out" }, "<0.3")
          .to("#ha", { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "<0.25")
          .to("#hst", { opacity: 1, y: 0, duration: 0.75, ease: "power3.out" }, "<0.2")
          .to("#si", { opacity: 1, duration: 0.6 }, "<0.8");

        scope.querySelectorAll(".reveal").forEach((el) => {
          gsap.to(el, {
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
          });
        });

        scope.querySelectorAll(".skill-bar").forEach((bar) => {
          const b = bar as HTMLElement;
          const w = b.dataset.width;
          ScrollTrigger.create({
            trigger: b,
            start: "top 85%",
            once: true,
            onEnter: () => {
              if (w) b.style.width = `${w}%`;
            },
          });
        });

        gsap.to("#o1", {
          scrollTrigger: { scrub: 1.5, start: "top top", end: "bottom bottom" },
          y: -240,
        });
        gsap.to("#o2", {
          scrollTrigger: { scrub: 1.5, start: "top top", end: "bottom bottom" },
          y: -380,
          x: 50,
        });
      }, scope);

      gsapCleanup = () => {
        ctx.revert();
      };
    }

    let threeTeardown: (() => void) | null = null;

    function startScene() {
      threeTeardown = initThree() ?? null;
    }

    return () => {
      disposed = true;
      window.clearInterval(iv);
      gsapCleanup?.();
      threeTeardown?.();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const mqLoop = [...MARQUEE, ...MARQUEE];

  return (
    <div className="emerald-portfolio" ref={rootRef}>
      <div id="cursor" ref={curRef} />
      <div id="cursor-ring" ref={crRef} />
      <div id="cursor-dot" ref={cdRef} />

      <div id="loader" ref={loaderRef}>
        <div className="ld-logo">FA.DEV</div>
        <div className="ld-sub">Faisal Adeel · Initializing</div>
        <div className="ld-bar">
          <div className="ld-fill" ref={lfRef} />
        </div>
        <div className="ld-pct" ref={lpRef}>
          0%
        </div>
      </div>

      <div className="orb" id="o1" />
      <div className="orb" id="o2" />
      <div className="orb" id="o3" />
      <div id="grid" />
      <div id="noise" />
      <div id="cv-wrap">
        <canvas id="three-canvas" ref={canvasRef} />
      </div>

      <div className="emerald-app">
        <nav id="nav" ref={navRef}>
          <a className="n-logo" href="#">
            FA.DEV
          </a>
          <ul className="n-links">
            <li>
              <a href="#work">Work</a>
            </li>
            <li>
              <a href="#about">About</a>
            </li>
            <li>
              <a href="#skills">Skills</a>
            </li>
            <li>
              <a href="#social">Proof</a>
            </li>
            <li>
              <a href="#reviews">Reviews</a>
            </li>
          </ul>
          <a className="n-cta" href={`${MAIL}?subject=Hire%20Me`}>
            <span className="n-cta-txt">Hire Me</span>
            <span className="n-cta-ico" aria-hidden>
              ↗
            </span>
          </a>
        </nav>

        <section id="hero">
          <div className="status-chip" id="hc">
            <span className="chip-icon-slot" aria-hidden>
              <IconBolt className="chip-icon" />
            </span>
            Available for freelance · Lahore, Pakistan
          </div>
          <h1 className="h-title" id="ht">
            <span className="name">
              FAISAL
              <br />
              ADEEL
            </span>
            <span className="role">Full-Stack Developer</span>
          </h1>
          <p className="h-sub" id="hs">
            I build fast, modern & scalable web apps. For businesses that want{" "}
            <strong>results, not just code</strong> — SaaS platforms, AI-powered tools, and e-commerce
            solutions that actually convert.
          </p>
          <div className="h-acts" id="ha">
            <a className="btn-p" href="#work">
              <span className="btn-p-txt">View My Work</span>
              <span className="btn-p-chev" aria-hidden>
                →
              </span>
            </a>
            <WhatsAppButton />
          </div>
          <div className="h-stats" id="hst">
            <div className="h-stat">
              <div className="h-stat-num">15+</div>
              <div className="h-stat-lbl">Projects</div>
            </div>
            <div className="h-stat">
              <div className="h-stat-num">2+</div>
              <div className="h-stat-lbl">Years Exp</div>
            </div>
            <div className="h-stat">
              <div className="h-stat-num">100%</div>
              <div className="h-stat-lbl">On Time</div>
            </div>
          </div>
          <div className="scroll-ind" id="si">
            <span>Scroll</span>
            <div className="s-line" />
          </div>
        </section>

        <div className="mq-wrap">
          <div className="mq-track">
            {mqLoop.map((t, i) => (
              <span key={`${t}-${i}`} className="mq-item">
                {t}
              </span>
            ))}
          </div>
        </div>

        <section className="section" id="work">
          <p className="s-label reveal">Selected Work</p>
          <h2 className="s-title reveal">
            Projects that <em>Shipped</em>
          </h2>
          <div className="proj-grid">
            <div className="project-card reveal">
              <div className="glow" />
              <div className="proj-icon-wrap proj-icon-wrap--image" aria-hidden>
                <img
                  className="proj-icon-img"
                  src="/images/projects/ecommerce-card-nobg.png"
                  alt=""
                  width={256}
                  height={142}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <p className="proj-cat">E-Commerce</p>
              <h3 className="proj-title">Multi-Vendor Store</h3>
              <p className="proj-impact">↑ Reduced checkout time by 40%</p>
              <p className="proj-desc">
                Full store with Stripe payments, real-time inventory, and admin analytics dashboard. Built to
                scale.
              </p>
              <div className="proj-tags">
                <span className="proj-tag">Next.js</span>
                <span className="proj-tag">Stripe</span>
                <span className="proj-tag">MongoDB</span>
                <span className="proj-tag">Tailwind</span>
              </div>
              <div className="proj-links">
                <a
                  className="proj-link primary"
                  href={`${MAIL}?subject=Demo%20Request%20%E2%80%94%20Multi-Vendor%20Store`}
                >
                  Live Demo ↗
                </a>
                <a
                  className="proj-link ghost"
                  href="https://github.com/adeelfaisal701"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </div>
            </div>

            <div className="project-card reveal">
              <div className="glow" />
              <div className="proj-icon-wrap proj-icon-wrap--image" aria-hidden>
                <img
                  className="proj-icon-img"
                  src="/images/projects/ai-analytics-card-nobg.png"
                  alt=""
                  width={250}
                  height={200}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <p className="proj-cat">AI Powered</p>
              <h3 className="proj-title">AI Analytics Dashboard</h3>
              <p className="proj-impact">↑ Saved 6hrs/week of manual reporting</p>
              <p className="proj-desc">
                GPT-4 powered insights, auto-generated reports, and predictive analytics for businesses.
              </p>
              <div className="proj-tags">
                <span className="proj-tag">Python</span>
                <span className="proj-tag">FastAPI</span>
                <span className="proj-tag">OpenAI</span>
                <span className="proj-tag">React</span>
              </div>
              <div className="proj-links">
                <a
                  className="proj-link primary"
                  href={`${MAIL}?subject=Demo%20Request%20%E2%80%94%20AI%20Analytics`}
                >
                  Live Demo ↗
                </a>
                <a
                  className="proj-link ghost"
                  href="https://github.com/adeelfaisal701"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </div>
            </div>

            <div className="project-card reveal">
              <div className="glow" />
              <div className="proj-icon-wrap proj-icon-wrap--image" aria-hidden>
                <img
                  className="proj-icon-img"
                  src="/images/projects/fullstack-card-nobg.png"
                  alt=""
                  width={1024}
                  height={576}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <p className="proj-cat">Portfolio</p>
              <h3 className="proj-title">Full Stack Web Dev</h3>
              <p className="proj-impact">↑ Production-ready personal brand</p>
              <p className="proj-desc">
                This portfolio — Next.js App Router, TypeScript, and Tailwind CSS with responsive layout and
                contact flows.
              </p>
              <div className="proj-tags">
                <span className="proj-tag">Next.js</span>
                <span className="proj-tag">TypeScript</span>
                <span className="proj-tag">Tailwind</span>
                <span className="proj-tag">GitHub</span>
              </div>
              <div className="proj-links">
                <a className="proj-link primary" href={`${MAIL}?subject=Portfolio%20walkthrough`}>
                  View ↗
                </a>
                <a
                  className="proj-link ghost"
                  href="https://github.com/adeelfaisal701/Portfolio"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="about">
          <p className="s-label reveal">About Me</p>
          <h2 className="s-title reveal">
            Developer who <em>ships,</em>
            <br />
            not just codes.
          </h2>
          <div className="about-grid">
            <div className="about-text reveal">
              <p>
                I&apos;m a <strong>Full-Stack developer from Lahore</strong> with 2+ years of real-world
                experience building products that actually launch and grow.
              </p>
              <p>
                I use <strong>AI-assisted workflows</strong> — Cursor AI, GitHub Copilot — to build and ship 3×
                faster without cutting quality. Every line of code I write has a purpose.
              </p>
              <p>
                Whether it&apos;s a <strong>SaaS platform, an AI-powered tool, or an e-commerce system</strong>{" "}
                — I handle it end to end, from architecture to deployment.
              </p>
              <div style={{ marginTop: 36, display: "flex", gap: 14, flexWrap: "wrap" }}>
                <a className="btn-p" href={`${MAIL}?subject=Start%20a%20Project`}>
                  <span className="btn-p-txt">Start a Project</span>
                  <span className="btn-p-chev" aria-hidden>
                    →
                  </span>
                </a>
                <WhatsAppButton compact />
              </div>
            </div>
            <div className="reveal">
              <div className="timeline">
                <div className="tl-item">
                  <div className="tl-year">2025–Now</div>
                  <div className="tl-content">
                    <h4>Web Developer</h4>
                    <span>Hangport · Lahore, Pakistan</span>
                  </div>
                </div>
                <div className="tl-item">
                  <div className="tl-year">2024</div>
                  <div className="tl-content">
                    <h4>Freelance Full-Stack Dev</h4>
                    <span>Independent · Remote</span>
                  </div>
                </div>
                <div className="tl-item">
                  <div className="tl-year">2023–24</div>
                  <div className="tl-content">
                    <h4>Web Developer</h4>
                    <span>Startup & Agency Projects</span>
                  </div>
                </div>
                <div className="tl-item">
                  <div className="tl-year">2022–23</div>
                  <div className="tl-content">
                    <h4>Frontend Developer</h4>
                    <span>Learning & Freelance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="skills">
          <p className="s-label reveal">Core Skills</p>
          <h2 className="s-title reveal">
            Built with the <em>Best</em> Stack
          </h2>
          <div className="skills-grid reveal">
            <div className="skill-card">
              <div className="skill-icon-wrap" aria-hidden>
                <IconReact className="skill-icon" />
              </div>
              <div className="skill-name">React / Next.js</div>
              <div className="skill-bar-wrap">
                <div className="skill-bar" data-width="90" />
              </div>
              <div className="skill-pct">Advanced · 90%</div>
            </div>
            <div className="skill-card">
              <div className="skill-icon-wrap" aria-hidden>
                <IconPython className="skill-icon" />
              </div>
              <div className="skill-name">Python / FastAPI</div>
              <div className="skill-bar-wrap">
                <div className="skill-bar" data-width="82" />
              </div>
              <div className="skill-pct">Advanced · 82%</div>
            </div>
            <div className="skill-card">
              <div className="skill-icon-wrap" aria-hidden>
                <IconMongo className="skill-icon" />
              </div>
              <div className="skill-name">MongoDB</div>
              <div className="skill-bar-wrap">
                <div className="skill-bar" data-width="85" />
              </div>
              <div className="skill-pct">Advanced · 85%</div>
            </div>
            <div className="skill-card">
              <div className="skill-icon-wrap" aria-hidden>
                <IconAI className="skill-icon" />
              </div>
              <div className="skill-name">AI / Cursor AI</div>
              <div className="skill-bar-wrap">
                <div className="skill-bar" data-width="78" />
              </div>
              <div className="skill-pct">Advanced · 78%</div>
            </div>
            <div className="skill-card">
              <div className="skill-icon-wrap" aria-hidden>
                <IconTailwind className="skill-icon" />
              </div>
              <div className="skill-name">Tailwind CSS</div>
              <div className="skill-bar-wrap">
                <div className="skill-bar" data-width="88" />
              </div>
              <div className="skill-pct">Advanced · 88%</div>
            </div>
            <div className="skill-card">
              <div className="skill-icon-wrap" aria-hidden>
                <IconCloud className="skill-icon" />
              </div>
              <div className="skill-name">Vercel / Cloud</div>
              <div className="skill-bar-wrap">
                <div className="skill-bar" data-width="80" />
              </div>
              <div className="skill-pct">Proficient · 80%</div>
            </div>
          </div>
        </section>

        <section className="section" id="social">
          <p className="s-label reveal">Social Proof</p>
          <h2 className="s-title reveal">
            Clients <em>Trust</em> Me
          </h2>
          <div className="test-grid">
            <div className="test-card reveal">
              <div className="test-stars">★★★★★</div>
              <p className="test-text">
                &quot;Faisal delivered our e-commerce platform ahead of schedule. The code was clean, the design
                was sharp, and he communicated perfectly throughout. Will hire again.&quot;
              </p>
              <div className="test-author">
                <div className="test-avatar">AK</div>
                <div className="test-info">
                  <h4>Ahmed K.</h4>
                  <span>CEO, TechBridge PK</span>
                </div>
              </div>
            </div>
            <div className="test-card reveal">
              <div className="test-stars">★★★★★</div>
              <p className="test-text">
                &quot;Best developer I&apos;ve worked with. He understood our vision immediately and built exactly
                what we needed — zero revisions, zero delays. Highly recommended.&quot;
              </p>
              <div className="test-author">
                <div className="test-avatar">SM</div>
                <div className="test-info">
                  <h4>Sara M.</h4>
                  <span>Product Lead, DataFlow</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ReviewsSection />

        <section id="cta">
          <h2 className="cta-title reveal">
            Let&apos;s Build
            <br />
            Something
            <br />
            Incredible.
          </h2>
          <p className="cta-sub reveal">
            I&apos;m available for freelance projects and full-time roles.{" "}
            <span className="cta-inline-icon" aria-hidden>
              <IconBolt className="cta-bolt" />
            </span>{" "}
            Response within 24 hours.
          </p>
          <div className="cta-acts reveal">
            <a className="btn-p" href={`${MAIL}?subject=Start%20a%20Project`}>
              <span className="btn-p-txt">Start a Project</span>
              <span className="btn-p-ico" aria-hidden>
                ↗
              </span>
            </a>
            <WhatsAppButton />
          </div>
          <div className="cta-contact reveal">adeelfaisal701@gmail.com · 0309-1407288</div>
        </section>

        <footer className="reveal">
          <div className="ft-logo">FA.DEV</div>
          <p>© 2026 Faisal Adeel · All rights reserved.</p>
          <div className="ft-links">
            <a href="https://github.com/adeelfaisal701" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/faisal-adeel-0246ab238" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
