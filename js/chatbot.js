/* ============================================================
   EPLANET — Chat assistant (frontend demo, rule-based)
   Greeting · quick replies · typing indicator ·
   anchors & contact-modal links · WhatsApp handoff
   ============================================================ */
(() => {
  "use strict";

  const WA_NUMBER = "910000000000"; // TODO: replace with the real store number

  const root    = document.getElementById("chatRoot");
  if (!root) return;

  const fab     = document.getElementById("chatFab");
  const win     = document.getElementById("chatWindow");
  const minBtn  = document.getElementById("chatMin");
  const body    = document.getElementById("chatBody");
  const quick   = document.getElementById("chatQuick");
  const form    = document.getElementById("chatForm");
  const input   = document.getElementById("chatInput");
  const badge   = document.getElementById("fabBadge");

  let greeted = false;

  /* ---------------------------------------------------------
     Message rendering
  ---------------------------------------------------------- */
  const addMsg = (who, html) => {
    const el = document.createElement("div");
    el.className = `msg msg-${who}`;
    el.innerHTML = html;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  };

  const addTyping = () => {
    const el = addMsg("bot", "<i></i><i></i><i></i>");
    el.classList.add("msg-typing");
    body.scrollTop = body.scrollHeight;
    return el;
  };

  const botReply = (html, delay) => {
    const t = addTyping();
    const wait = delay ?? 700 + Math.random() * 500;
    setTimeout(() => {
      t.remove();
      addMsg("bot", html);
    }, wait);
  };

  /* ---------------------------------------------------------
     The brain — small, friendly, rule-based
  ---------------------------------------------------------- */
  const waLink = (text) =>
    `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

  const RULES = [
    {
      re: /^(hi|hii+|hello|hey|namaste|good\s*(morning|afternoon|evening))\b/i,
      reply: `Hello! 👋 Welcome to <strong>EPLANET</strong>. I can tell you about our services, the three laptop stores (HP · ASUS · Lenovo), or help you start a project. What would you like to know?`,
    },
    {
      re: /(thank|thanks|thx|great|awesome|nice|cool)/i,
      reply: `Happy to help! 😊 Anything else — services, stores, or laptops?`,
    },
    {
      re: /\b(hp|pavilion|envy|spectre|probook)\b/i,
      reply: `The <strong>HP Store</strong> covers Pavilion, Envy, Spectre and ProBook — from everyday machines to premium convertibles like the Spectre x360. <a href="#laptops">See the line-up</a> or <a href="${waLink("Hi EPLANET! I'm interested in HP laptops.")}" target="_blank" rel="noopener">enquire on WhatsApp →</a>`,
    },
    {
      re: /\b(asus|zenbook|vivobook|rog|tuf)\b/i,
      reply: `The <strong>ASUS Store</strong> is all about performance — Zenbook and Vivobook for creators, ROG and TUF for gaming. <a href="#laptops">See the line-up</a> or <a href="${waLink("Hi EPLANET! I'm interested in ASUS laptops.")}" target="_blank" rel="noopener">enquire on WhatsApp →</a>`,
    },
    {
      re: /\b(lenovo|thinkpad|ideapad|yoga|legion)\b/i,
      reply: `The <strong>Lenovo Store</strong> covers ThinkPad, IdeaPad, Yoga and Legion — business, student and gaming picks. <a href="#laptops">See the line-up</a> or <a href="${waLink("Hi EPLANET! I'm interested in Lenovo laptops.")}" target="_blank" rel="noopener">enquire on WhatsApp →</a>`,
    },
    {
      re: /(start|begin|hire|quote|budget|estimat)/i,
      reply: `Love it. 🚀 The fastest way is our contact form — it takes under a minute: <a href="#" data-contact-open>Open the contact form →</a>`,
    },
    {
      re: /(price|cost|rate|buy|purchase|availability|stock)/i,
      reply: `We never guess prices online — they change too often. Prices are confirmed in store or on WhatsApp, always honest and current. <a href="#laptops">Browse laptops</a> · <a href="${waLink("Hi EPLANET! I'd like a laptop price quote.")}" target="_blank" rel="noopener">Get a price on WhatsApp →</a>`,
    },
    {
      re: /(store|shop|showroom|location|address|visit|where|direction)/i,
      reply: `We run <strong>three exclusive stores in Bhubaneswar</strong> — HP, ASUS and Lenovo — so you can compare brands side by side, hands-on. <a href="#stores">Explore the stores →</a>`,
    },
    {
      re: /(contact|phone|email|call|number|whatsapp|timing|hour|open|reach)/i,
      reply: `The quickest route to a human is WhatsApp — we reply during store hours (10 am – 8 pm IST). <a href="${waLink("Hi EPLANET! I have a question.")}" target="_blank" rel="noopener">Chat on WhatsApp →</a> · <a href="#" data-contact-open>or use the contact form</a>`,
    },
    {
      re: /(project|portfolio|case stud|work|client|built)/i,
      reply: `We've delivered <strong>100+ projects</strong> — enterprise dashboards, e-commerce platforms and mobile apps. <a href="#projects">See selected work →</a>`,
    },
    {
      re: /(service|software|develop|website|web|app|cloud|secur|erp|crm|infra|network|design|support|amc|maintain)/i,
      reply: `We cover the full stack: software &amp; ERP, web &amp; e-commerce, mobile apps, infrastructure, cloud, cybersecurity, UI/UX and year-round IT support. <a href="#services">Explore services →</a> · <a href="#" data-contact-open>Request a consultation</a>`,
    },
    {
      re: /(laptop|notebook|computer|device|machine)/i,
      reply: `We're the exclusive retail destination for <strong>HP, ASUS and Lenovo</strong> in Bhubaneswar. Tell me a brand or a use (gaming, business, student…) and I'll point you the right way. <a href="#laptops">See flagships →</a>`,
    },
  ];

  const FALLBACK = `I'm a lightweight demo assistant, so I only know EPLANET topics 🙂 Try a quick topic below — or <a href="${waLink("Hi EPLANET!")}" target="_blank" rel="noopener">WhatsApp the team</a> for anything else.`;

  const getReply = (text) => {
    for (const rule of RULES) {
      if (rule.re.test(text)) return rule.reply;
    }
    return FALLBACK;
  };

  /* ---------------------------------------------------------
     Quick replies
  ---------------------------------------------------------- */
  const CHIPS = [
    "Our services",
    "Stores &amp; location",
    "HP laptops",
    "ASUS laptops",
    "Lenovo laptops",
    "Laptop prices",
    "Start a project",
  ];

  CHIPS.forEach((label) => {
    const b = document.createElement("button");
    b.type = "button";
    b.innerHTML = label;
    b.addEventListener("click", () => {
      send(label.replace("&amp;", "&"), 350);
    });
    quick.appendChild(b);
  });

  /* ---------------------------------------------------------
     Sending
  ---------------------------------------------------------- */
  const send = (text, delay) => {
    const clean = text.trim();
    if (!clean) return;
    addMsg("user", clean.replace(/</g, "&lt;"));
    input.value = "";
    botReply(getReply(clean), delay);
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    send(input.value);
  });

  /* ---------------------------------------------------------
     Links inside bot messages
  ---------------------------------------------------------- */
  body.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;

    if (a.hasAttribute("data-contact-open")) {
      e.preventDefault();
      setChat(false);
      window.EPLANET?.openContact(a.dataset.topic || "");
      return;
    }
    if (a.getAttribute("href")?.startsWith("#")) {
      e.preventDefault();
      setChat(false);
      const target = document.querySelector(a.getAttribute("href"));
      target?.scrollIntoView({ behavior: "smooth" });
    }
    // external links (WhatsApp) behave normally in a new tab
  });

  /* ---------------------------------------------------------
     Open / close
  ---------------------------------------------------------- */
  const setChat = (openState) => {
    fab.classList.toggle("open", openState);
    fab.setAttribute("aria-expanded", String(openState));
    win.classList.toggle("open", openState);
    win.setAttribute("aria-hidden", String(!openState));

    if (openState) {
      if (badge) badge.style.display = "none";
      if (!greeted) {
        greeted = true;
        botReply(
          `Hi there! 👋 I'm the <strong>EPLANET Assistant</strong> — ask me about our services, the three laptop stores, or starting a project.`,
          900
        );
      }
      setTimeout(() => input.focus(), 300);
    } else {
      fab.focus();
    }
  };

  fab.addEventListener("click", () =>
    setChat(!win.classList.contains("open"))
  );
  minBtn.addEventListener("click", () => setChat(false));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && win.classList.contains("open")) setChat(false);
  });

  document.addEventListener("mousedown", (e) => {
    if (win.classList.contains("open") && !root.contains(e.target)) setChat(false);
  });
})();
