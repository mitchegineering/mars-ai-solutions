// ---------- Starfield background ----------
(function starfield() {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let stars = [];

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const count = Math.floor((canvas.width * canvas.height) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.3 + 0.2,
      s: Math.random() * 0.015 + 0.003,
      o: Math.random() * 0.6 + 0.2,
    }));
  }

  function draw(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const star of stars) {
      const twinkle = star.o * (0.6 + 0.4 * Math.sin(t * star.s * 10 + star.x));
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 210, 255, ${twinkle})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(draw);
})();

// ---------- Hero helix background ----------
(function heroHelix() {
  const canvas = document.getElementById("hero-helix");
  const hero = document.querySelector(".hero");
  if (!canvas || !hero) return;
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let w = 0, h = 0, dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.offsetWidth;
    h = hero.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const strandColors = ["91, 140, 255", "168, 85, 247"];
  const pointsPerStrand = 70;

  function strandPoints(time) {
    const centerX = w / 2;
    const startY = h * 0.02;
    const spanY = h * 0.96;
    const amplitude = Math.min(w * 0.24, 280);

    return strandColors.map((color, s) => {
      const phase = s * Math.PI;
      const pts = [];
      for (let i = 0; i <= pointsPerStrand; i++) {
        const yFrac = i / pointsPerStrand;
        const y = startY + yFrac * spanY;
        const angle = yFrac * Math.PI * 3.2 + time + phase;
        const envelope = 0.35 + 0.65 * Math.sin(yFrac * Math.PI);
        const x = centerX + Math.sin(angle) * amplitude * envelope;
        const depth = Math.cos(angle);
        pts.push({ x, y, depth });
      }
      return { color, pts };
    });
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    const time = t * 0.00028;
    const strands = strandPoints(time);

    for (let i = 0; i <= pointsPerStrand; i += 5) {
      const p0 = strands[0].pts[i];
      const p1 = strands[1].pts[i];
      const glow = Math.max((p0.depth + p1.depth) / 2, 0);
      ctx.strokeStyle = `rgba(139, 120, 255, ${0.04 + glow * 0.1})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    }

    strands.forEach(({ color, pts }) => {
      ctx.beginPath();
      pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.strokeStyle = `rgba(${color}, 0.3)`;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      pts.forEach((p, i) => {
        if (i % 2 !== 0) return;
        const front = Math.max(p.depth, 0);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.1 + front * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${0.2 + front * 0.55})`;
        ctx.fill();
      });
    });

    if (!reduceMotion) requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(draw);
})();

// ---------- Scroll progress bar ----------
(function scrollProgress() {
  const bar = document.getElementById("scroll-progress");
  if (!bar) return;
  function update() {
    const scrollTop = window.scrollY;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (height > 0 ? (scrollTop / height) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", update, { passive: true });
  update();
})();

// ---------- Mobile nav toggle ----------
(function navToggle() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const open = links.style.display === "flex";
    links.style.display = open ? "none" : "flex";
    links.style.cssText += open
      ? ""
      : "position:absolute;top:76px;left:0;right:0;flex-direction:column;background:rgba(6,6,9,0.98);padding:24px;border-bottom:1px solid rgba(255,255,255,0.08);";
  });

  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      if (window.innerWidth <= 900) links.style.display = "none";
    })
  );
})();

// ---------- Scroll reveal ----------
(function reveal() {
  const items = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("in", entry.isIntersecting);
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((item) => observer.observe(item));
})();

// ---------- Prototype demo form (Make.com webhook) ----------
(function demoForm() {
  const form = document.getElementById("demo-form");
  if (!form) return;
  const WEBHOOK_URL = "https://hook.us2.make.com/o7e1v64lhhipp7nj7j6s2m8tgxne6js2";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector("button[type=submit]");
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Sending...";

    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      btn.textContent = res.ok ? "Sent! We'll be in touch." : "Something went wrong — try again";
      if (res.ok) form.reset();
    } catch (err) {
      btn.textContent = "Something went wrong — try again";
    }

    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
    }, 3000);
  });
})();

// ---------- Contact form (placeholder submit) ----------
(function contactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = form.querySelector("button[type=submit]");
    const original = btn.textContent;
    btn.textContent = "Not connected yet — email me directly";
    setTimeout(() => (btn.textContent = original), 2500);
  });
})();
