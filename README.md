# Harshveer Singh — Cinematic 3D Developer Portfolio

A modern, cinematic 3D animated developer portfolio website crafted for **Harshveer Singh** (Developer • BCA 1st Year Student).

The portfolio is structured as an interactive 3D digital journey where scrolling navigates through distinct scenes of a developer's story with smooth Three.js camera transitions, realistic lighting, and interactive micro-interactions.

---

## 🌟 Key Experience & Scenes

1. **Scene 1: Opening Scene (Hero) — Serene Celestial Horizon**
   - Soft, peaceful, cinematic celestial horizon with subtle stardust and gentle atmospheric aurora light rays.
   - Smooth, tranquil 3D celestial orb with a soft glowing halo drifting with calm meditative breathing cadence.
   - Clean, serene typography and high-contrast readable titles: **HARSHVEER SINGH** • Developer • BCA Student • Builder.
   - Smooth, gentle scroll cue.

2. **Scene 2: About Me & Workspace**
   - 3D developer workstation featuring a stylized laptop, MySQL database cylinder, and Git branch node network.
   - Honest developer profile text and focus skill pills.
   - Visual quick stats.

3. **Scene 3: Developer Journey (Cinematic Timeline)**
   - Sequential milestones from 12th Completed → Starting BCA → Python → Tkinter GUI → MySQL Database → Web Development → Git & GitHub → Building Real Projects → Currently Learning & Developing → Journey Continues... 🚀✨
   - Interactive milestone cards with high-contrast glowing beacon markers.

4. **Scene 4: Skills Universe**
   - Interactive 3D orbiting skill nodes around a central core.
   - Skills highlighted: Python, Tkinter, MySQL, Git, GitHub, HTML5, CSS3, JavaScript, Web Development, UI/UX, Database Development.
   - Honest, student-level skill assessments.

5. **Scene 5: Projects Showcase**
   - **Inventory Control System**: Python + Tkinter + MySQL desktop inventory application.
   - **AGNHUB**: Live institute and community web platform.
   - **Personal Portfolio**: 3D interactive web portfolio.
   - **Gen-Z Multilingual Chatbot**: Contextual dialog bot with Hinglish support and RORO 😎 / SHIVANI ✨ personas.
   - **Development Experiments Grid**: Login System, Calculator, Notepad, Student Management System, Pac-Man clone, Database scripts, Tkinter UI experiments.

6. **Scene 6: Currently Building (Live Deployment)**
   - Prominently showcases **AGNHUB** with an active glowing pulse indicator and direct link to [https://agnhub.vercel.app/](https://agnhub.vercel.app/).

7. **Scene 7: Code In Motion (3D Terminal)**
   - Floating developer code editor with realistic window controls.
   - Interactive language tabs (Python, SQL, JavaScript, CSS) and a one-click copy button.

8. **Scene 8: Education Scene**
   - Bachelor of Computer Applications (BCA) — 1st Year (Currently Studying).
   - Core curriculum focus areas.

9. **Scene 9: Future Vision**
   - "WHAT'S NEXT?" — Pragmatic engineering ambitions and long-term goals.
   - "The journey is still being written... Journey Continues... 🚀✨".

10. **Scene 10: Contact & Footer**
    - "Let's Build Something."
    - Direct copyable email: `harshveersingh.tech@gmail.com`.
    - Fully functional external links for GitHub, LinkedIn, Instagram, and Email.

---

## 🛠️ Architecture & Tech Stack

- **3D Graphics & Engine**: [Three.js](https://threejs.org/) via native ES Modules (lightweight, zero-build required).
- **Momentum Smooth Scrolling**: [Lenis](https://github.com/darkroomengineering/lenis) for silky smooth, inertia-driven cinema scrolling.
- **Styling**: Vanilla CSS3 with custom variables, cool-toned glassmorphism, responsive flex/grid layouts.
- **Audio & Micro-Interactions**: Web Audio API synthesizer for ambient clicks and chimes (muted by default, toggleable in the navigation bar).
- **Live Cinematic Studio Tuner**: Real-time adjustable sliders for speed, zoom depth, parallax, darkness, contrast, and blur.
- **Icons**: [Lucide Icons](https://lucide.dev/).
- **Typography**: Google Fonts (*Outfit*, *Inter*, *JetBrains Mono*).

---

## 📁 Project Structure

```
portfolio/
├── index.html                   # Semantic HTML5 markup, SEO meta tags, HUD overlay
├── style.css                    # Cool-toned cinematic styles & responsive rules
├── README.md                    # Project documentation
└── src/
    ├── data/
    │   └── portfolio.js         # Single centralized source of truth for all profile data
    ├── audio/
    │   └── soundEffects.js      # Web Audio API sound synthesizer
    ├── three/
    │   ├── objects.js           # 3D geometries, materials, particles & models
    │   └── sceneManager.js      # Three.js camera rig, lighting, and render loop
    ├── animations/
    │   └── scrollEffects.js     # Scroll choreography, HUD depth tracking & parallax
    └── main.js                  # Application initialization & DOM bindings
```

---

## ⚙️ Easy Customization

All personal details, project descriptions, skills, social links, and code snippets can be edited directly inside:

👉 [`src/data/portfolio.js`](file:///c:/Users/harshveer/OneDrive/Desktop/portfolio/src/data/portfolio.js)

Whenever you add new projects, update skills, or change contact links, edit this file and the changes will instantly reflect throughout the entire website.

---

## 🚀 How to Run Locally

You can preview the website locally using Python's built-in HTTP server:

```powershell
# From the portfolio folder:
py -3 -m http.server 3000
```

Then open your browser at:
`http://localhost:3000`

---

## 🌐 Free 1-Click Deployment

This project has zero build steps and is 100% static:

- **GitHub Pages**: Push this repository to GitHub and enable Pages in repository settings.
- **Vercel**: Run `vercel` or import your GitHub repository into [Vercel](https://vercel.com).
- **Netlify**: Drag and drop the `portfolio` folder directly onto [Netlify Drop](https://app.netlify.com/drop).
