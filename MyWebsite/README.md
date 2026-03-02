# Kumar Aman — Portfolio Website

Personal portfolio and service platform for **Kumar Aman**, a developer focused on building high-performance, aesthetically stunning websites for small businesses. Features a custom design system, integrated billing, and SEO-first architecture.

🌐 **Live Demo:** [solitary-wildflower-fea9.aman0arc.workers.dev](https://solitary-wildflower-fea9.aman0arc.workers.dev/)

---

## Tech Stack

- **HTML5** — semantic, SEO-optimised markup
- **CSS3** — custom properties, animations, responsive grid
- **Vanilla JavaScript** — no frameworks or build tools required

## Features

- Dark / Light mode toggle (preference saved to `localStorage`)
- Typing animation in hero section
- Animated skill bars with Intersection Observer
- Animated stat counters
- 3D tilt effect on project cards
- Season-themed color palette switcher
- Floating "Hire Me" button
- Smooth scroll navigation
- Fully responsive (mobile, tablet, desktop)
- Open Graph & Twitter Card meta tags
- `robots.txt` + `sitemap.xml` for SEO
- Secure Payment Portal (`pay.html`) backed by Cloudflare Workers

## Project Structure

```
.
├── client/                 # Frontend Website
│   ├── index.html          # Homepage
│   ├── about.html          # Experience & About
│   ├── pricing.html        # Services & Packages
│   ├── pay.html            # Client Payment Portal
│   ├── assets/             # Structured Assets
│   │   ├── css/            # Stylesheets (style.css)
│   │   ├── js/             # Interactive Logic (script.js)
│   │   ├── icons/          # Favicons & Brand Icons
│   │   └── images/         # Project & Profile Photos
│   ├── sitemap.xml
│   ├── robots.txt
│   └── site.webmanifest
├── server/                 # Backend Worker
│   └── payment-worker.js   # Razorpay Integration logic
└── README.md
```

## Local Development

No build step needed. Just open `client/index.html` in your browser, or use a simple local server:

```bash
# Using VS Code Live Server extension (recommended)
# Right-click index.html → Open with Live Server

# Or using Python
cd client
python -m http.server 5500
```

## Deployment Configuration

This project is architected to be deployed seamlessly on **Cloudflare Pages**. 

1. Push this repository to GitHub/GitLab.
2. Connect the repository to your Cloudflare Dashboard.
3. Set the Framework preset to **None** and the output directory to `client`.
4. The site will automatically build and deploy.

**Payment Portal Backend (`server/payment-worker.js`)**
If utilizing the `pay.html` checkout functionality, deploy the `payment-worker.js` script to **Cloudflare Workers** and update the `workerUrl` configuration block inside `pay.html` with your production endpoint.

## Services Offered

This portfolio highlights my primary offerings:
1. **Website Building Packages:** 
   - Starter Portfolio (₹12,000)
   - Business Growth (₹25,000)
   - Custom Pro (₹45,000+)
2. **Specialized Web Solutions:** Small business solutions, personal portfolios, and performance-first designs, all delivered within a strict 14-day timeline.
3. **Peace of Mind Maintenance:** A recurring ₹1,500/month subscription providing Cloudflare hosting, enterprise security, WAF protection, weekly backups, and monthly traffic reports.

For a full breakdown, please review the [SERVICES.md](./SERVICES.md) file.

## Contact

- 📧 [aman9clean@gmail.com](mailto:aman9clean@gmail.com)
- 📱 [+91 8603075007](tel:+918603075007)
- 💼 [LinkedIn](https://www.linkedin.com/in/kaman0dev/)
- 📸 [Instagram](https://www.instagram.com/aman.kineo/)
- 🐦 [Twitter / X](https://x.com/ViranovaLabs)

---

© 2026 Kumar Aman. All rights reserved.
