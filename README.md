# ⚔️ Pentavow

<p align="center">
  <img src="https://img.shields.io/badge/Status-Live%20on%20GitHub%20Pages-brightgreen?style=for-the-badge&logo=github" alt="Live Status" />
  <img src="https://img.shields.io/badge/Platform-Web%20%7C%20Mobile%20%7C%20Desktop-blue?style=for-the-badge" alt="Platform" />
  <img src="https://img.shields.io/badge/Architecture-100%25%20Zero--Cost%20%7C%20P2P%20WebRTC-orange?style=for-the-badge" alt="P2P WebRTC" />
  <img src="https://img.shields.io/badge/Audio-FEH%20High--Fidelity%20128kbps%20MP3-purple?style=for-the-badge" alt="Audio" />
</p>

<p align="center">
  <strong>A 2D retro action-JRPG featuring real-time P2P co-op multiplayer, a 5-weapon no-mana hotbar, drop-in MMO battle encounters, and cloud save synchronization.</strong>
</p>

<p align="center">
  <a href="https://n0ctus.github.io/pentavow/">
    <img src="https://img.shields.io/badge/▶%20PLAY%20NOW%20IN%20BROWSER-CLICK%20HERE-red?style=for-the-badge&logo=googlechrome&logoColor=white" height="42" alt="Play Now" />
  </a>
</p>

---

## 🎮 Play Immediately in Your Browser
You can jump straight into the realm of **Pentavow** without installing any plugins or apps:

### 🔗 **[https://n0ctus.github.io/pentavow/](https://n0ctus.github.io/pentavow/)**

*(Runs on PC, Mac, Linux, iOS Safari, Android Chrome, and modern mobile browsers with full touch controls!)*

---

## 🌟 Game Inspiration

**Pentavow** was created out of deep love for classic Japanese role-playing games and combines the best elements of two iconic titles:

1. **Logres: Japanese RPG (Sword and Magic / 剣と魔法のログレス):**
   - **No-Mana / No-Potion Combat:** Goodbye MP bars and tedious mana potions! Instead, your character wields a 5-weapon hotbar where every weapon delivers continuous 2.0s auto-attacks alongside its own independent active skill cooldown (6s–15s).
   - **Ether Synergy & Ultimates:** Unleashing weapon skills builds up Ether (+25% to +40%). When a weapon hits 100% Ether, its card radiates radiant gold—triggering supreme elemental Ultimates!
   - **Drop-In Mid-Battle MMO Experience:** Roaming encounters aren't locked into private instances. You can see ongoing battles on the overworld map indicated by animated crossed-swords markers. Tap any battle to drop straight into the fight mid-action with the boss's current HP intact!
   - **AI Allies:** Nearby friendly Hunter NPCs will see you fighting tough bosses, pathfind toward you, and leap in to assist!

2. **Classic 16-Bit JRPGs & Fire Emblem:**
   - Visual aesthetics, strategic elemental affinities (Fire, Water, Earth, Wind, Light, Dark), and a studio-grade audio landscape featuring authentic retro impact soundscapes and fanfare.

---

## 🗡️ Key Gameplay Features

### 1. ⚔️ Hero Onboarding & 3 Archetype Classes
Upon embarking on their journey, every new hero selects their destiny from three foundational classes:
- **🛡️ Vanguard:** High HP, indomitable physical armor, crowd-control stun mechanics, and aggressive frontline threat generation.
- **🔮 Elementalist (Mage):** High burst magical DPS, elemental counter-affinity specialization, and devastating screen-wide AOE nukes.
- **🏹 Shadow Ranger:** Lightning-fast attack frequency, evasion buffs, crit-rate mastery, and precision piercing shots.

### 2. 🌾 Zero-Weapon Start & Equipment Farming
In **Pentavow**, true hunters earn their steel!
- You start the game **completely unarmed**, relying on your bare fists for basic strikes.
- Explore overworld regions, defeat roaming beasts, conquer waves in dungeon monoliths, and slay world bosses to farm rare, epic, and legendary weapon drops.
- Mix and match swords, staves, bows, daggers, and relics across your 5 equipment slots to craft unique combat builds.

### 3. 🌐 Real-Time P2P Co-op Multiplayer (Zero Server Cost)
- **Built on WebRTC (Trystero / Nostr):** Play with friends across the world without centralized game servers.
- **Easy Room Sharing:** Click **Co-op / Multiplayer**, share your Room Code (e.g., `PENTAVOW-1`), or send an instant invite link to a friend on Discord or WhatsApp.
- **Shared World:** See each other walking the overworld in real-time, emote, drop into the same monster battles, and defeat world bosses cooperatively!

### 4. ☁️ Google Cloud Save Sync & Guest Mode
- **Guest Mode:** Start playing instantly with local storage (IndexedDB/LocalStorage) with zero login required.
- **Google Drive AppData Sync:** Link your Google account anytime to securely synchronize your character level, farmed inventory, and quest progress across devices with no subscription or database fees.

---

## 🕹️ Controls

| Action | PC / Keyboard & Mouse | Mobile / Touch Screen |
| :--- | :--- | :--- |
| **Movement** | `W`, `A`, `S`, `D` or Arrow Keys | On-screen Virtual D-Pad / Tap map |
| **Interact / Attack** | Click on Mob / NPC / Portal | Tap on Mob / NPC / Portal |
| **Weapon Skills (1-5)** | Keys `1`, `2`, `3`, `4`, `5` | Tap Weapon Card in Bottom Bar |
| **Ultimate Skills** | Tap weapon card when Ether hits 100% | Tap weapon card when Ether hits 100% |
| **Menu / Codex** | Click HUD icons (Top Bar / Bottom Dock) | Tap HUD icons |

---

## ⚡ Technical Highlights & Optimization

- **Ultra-Lean Package:** Built with **React 18**, **TypeScript**, and **Vite 6**.
- **Heavy Optimization:** Shrunk from **228 MB → 35.9 MB** (an 84% reduction!) by pruning unused files and encoding all active audio to 128 kbps MP3 via LAME.
- **Sub-Second First Load:** Optimized bundle splitting ensures the initial screen renders in milliseconds.
- **Automated CI/CD:** Powered by GitHub Actions (`.github/workflows/deploy.yml`) with automated zero-downtime builds on every push to `main`.

---

## 🛠️ Local Development

To run the game locally on your machine:

```bash
# 1. Clone the repository
git clone https://github.com/N0ctus/pentavow.git

# 2. Enter directory
cd pentavow

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

To create a production build:
```bash
npm run build
```

---

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).

---

<p align="center">
  <strong>Ready for the hunt? Step into <a href="https://n0ctus.github.io/pentavow/">Pentavow</a> today!</strong>
</p>
