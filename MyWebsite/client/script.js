/* ═══════════════════════════════════════════════
   KUMAR AMAN PORTFOLIO — script.js
═══════════════════════════════════════════════ */

'use strict';

/* ── CURSOR GLOW ─────────────────────────────── */
const cursorGlow = document.getElementById('cursorGlow');
document.addEventListener('mousemove', e => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
});

/* ── NAVBAR SCROLL ───────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    updateActiveNav();
}, { passive: true });

/* ── MOBILE BURGER ───────────────────────────── */
const burger = document.getElementById('navBurger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});
navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
    });
});

/* ── ACTIVE NAV LINK ─────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const allNavLinks = document.querySelectorAll('.nav-link');

function updateActiveNav() {
    const scroll = window.scrollY + 120;
    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        const match = document.querySelector(`.nav-link[href="#${id}"]`);
        if (match) {
            match.classList.toggle('active', scroll >= top && scroll < top + height);
        }
    });
}

/* ── QUOTES ROTATOR ──────────────────────────── */
const quotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
    { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
    { text: "Spread love everywhere you go. Let no one ever come to you without leaving happier.", author: "Mother Teresa" },
    { text: "When you reach the end of your rope, tie a knot in it and hang on.", author: "Franklin D. Roosevelt" },
    { text: "Always remember that you are absolutely unique. Just like everyone else.", author: "Margaret Mead" },
    { text: "Don't judge each day by the harvest you reap but by the seeds that you plant.", author: "Robert Louis Stevenson" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "An unexamined life is not worth living.", author: "Socrates" },
    { text: "Spread love everywhere you go. Let no one ever come to you without leaving happier.", author: "Mother Teresa" },
    { text: "When the going gets tough, the tough get going.", author: "Joe Kennedy" },
    { text: "You will face many defeats in life, but never let yourself be defeated.", author: "Maya Angelou" },
    { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
    { text: "In the end, it's not the years in your life that count. It's the life in your years.", author: "Abraham Lincoln" },
    { text: "Never let the fear of striking out keep you from playing the game.", author: "Babe Ruth" },
    { text: "Life is either a daring adventure or nothing at all.", author: "Helen Keller" },
    { text: "Many of life's failures are people who did not realize how close they were to success when they gave up.", author: "Thomas Edison" },
    { text: "You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose.", author: "Dr. Seuss" }
];

const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const quoteTimerBar = document.getElementById('quoteTimerBar');
const quoteDisplay = document.getElementById('quoteDisplay');
let currentQuoteIdx = Math.floor(Math.random() * quotes.length);
const QUOTE_INTERVAL = 60000; // 60 seconds

function showQuote(idx, animate = false) {
    const q = quotes[idx];
    if (animate) {
        quoteDisplay.classList.add('quote-fade-out');
        setTimeout(() => {
            quoteText.textContent = '\u201C' + q.text + '\u201D';
            quoteAuthor.textContent = '\u2014 ' + q.author;
            quoteDisplay.classList.remove('quote-fade-out');
            quoteDisplay.classList.add('quote-fade-in');
            setTimeout(() => quoteDisplay.classList.remove('quote-fade-in'), 600);
        }, 400);
    } else {
        quoteText.textContent = '\u201C' + q.text + '\u201D';
        quoteAuthor.textContent = '\u2014 ' + q.author;
    }
    // Restart timer bar
    if (quoteTimerBar) {
        quoteTimerBar.style.transition = 'none';
        quoteTimerBar.style.width = '100%';
        setTimeout(() => {
            quoteTimerBar.style.transition = `width ${QUOTE_INTERVAL}ms linear`;
            quoteTimerBar.style.width = '0%';
        }, 50);
    }
}

// Show initial quote
if (quoteText) {
    showQuote(currentQuoteIdx);
    setInterval(() => {
        currentQuoteIdx = (currentQuoteIdx + 1) % quotes.length;
        showQuote(currentQuoteIdx, true);
    }, QUOTE_INTERVAL);
}

/* ── TYPING EFFECT ───────────────────────────── */
const phrases = [
    'Responsive Websites.',
    'Web Applications.',
    'Digital Experiences.',
    'Portfolio Sites.',
    'Full-Stack Solutions.',
];
const typedEl = document.getElementById('typedText');
let phraseIdx = 0, charIdx = 0, deleting = false;

function type() {
    const phrase = phrases[phraseIdx];
    if (!deleting) {
        charIdx++;
        typedEl.textContent = phrase.slice(0, charIdx);
        if (charIdx === phrase.length) {
            setTimeout(() => { deleting = true; type(); }, 2000);
            return;
        }
        setTimeout(type, 70);
    } else {
        charIdx--;
        typedEl.textContent = phrase.slice(0, charIdx);
        if (charIdx === 0) {
            deleting = false;
            phraseIdx = (phraseIdx + 1) % phrases.length;
            setTimeout(type, 400);
            return;
        }
        setTimeout(type, 35);
    }
}
setTimeout(type, 800);

/* ── INTERSECTION OBSERVER — REVEAL ─────────── */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 120);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

/* ── SKILL BARS ──────────────────────────────── */
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.skill-fill').forEach(bar => {
                const w = bar.dataset.width;
                setTimeout(() => { bar.style.width = w + '%'; }, 300);
            });
            skillObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll('.skill-cat').forEach(cat => skillObserver.observe(cat));

/* ── STAT COUNTER ────────────────────────────── */
function animateCount(el, target, duration = 1400) {
    const start = performance.now();
    const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.stat-num[data-target]').forEach(el => {
                animateCount(el, parseInt(el.dataset.target));
            });
            statObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.hero-stats').forEach(el => statObserver.observe(el));



/* ── SMOOTH SCROLL ───────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

/* ── PROJECT CARD 3D TILT ────────────────────── */
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cx = (e.clientX - rect.left) / rect.width - 0.5;
        const cy = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${cx * 6}deg) rotateX(${-cy * 6}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ── SKILL CAT HOVER GLOW ────────────────────── */
document.querySelectorAll('.skill-cat').forEach(cat => {
    cat.addEventListener('mousemove', (e) => {
        const rect = cat.getBoundingClientRect();
        cat.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
        cat.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
    });
});

/* ── INITIAL LOAD ────────────────────────────── */
window.addEventListener('load', () => {
    updateActiveNav();
});

/* ══════════════════════════════════════════════════════════════
   THEME TOGGLE
══════════════════════════════════════════════════════════════ */
const themeToggle = document.getElementById('themeToggle');

if (themeToggle) {
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

    // Set initial theme
    if (savedTheme === 'light' || (!savedTheme && prefersLight)) {
        document.body.setAttribute('data-theme', 'light');
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        if (currentTheme === 'light') {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });
}

/* ── CONTACT TEMPLATE COPY ───────────────────── */
window.copyTemplate = function () {
    const emailTemplate = `Hi Aman,\n\nI'm interested in starting a project with you. Here are my details:\n\n1. Business Name: \n2. Website Type (Portfolio/Small Biz/Custom): \n3. Existing Domain (Yes/No): \n4. Ideal Launch Date: \n5. Tell me a bit about your goals: \n\nLooking forward to chatting!`;

    navigator.clipboard.writeText(emailTemplate).then(() => {
        const btn = document.getElementById("copyBtn");
        const originalText = btn.innerHTML;

        btn.innerHTML = `Template Copied! <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        btn.style.borderColor = "#4dea7b";
        btn.style.color = "#4dea7b";

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.borderColor = "";
            btn.style.color = "";
        }, 3000);

    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert("Oops! Couldn't copy the text. Please try again.");
    });
};
