# Brick Breaker 🧱⚡

A retro-modern arcade experience built with HTML5 Canvas and JavaScript. Navigate the paddle, bounce the ball, and shatter vibrant neon bricks while collecting power-ups to achieve the highest score.

---

## 🕹️ Game Preview

Experience high-speed action with neon aesthetics:

* **Dynamic Difficulty:** Choose between Easy, Medium, and Hard modes.
* **Power-up System:** Extra balls, paddle size manipulation, and speed challenges.
* **Progress Tracking:** Real-time score, lives, and persistent "Best Time" records.

---

## 📁 Project Structure

The project is organized into modular scripts and styles for clarity and performance:

```
BRICK-BREAKER/
├── css/
│   └── style.css          # Layout, neon glow effects, and responsive UI
├── scripts/
│   ├── jquery.js          # DOM manipulation library
│   ├── settings.js        # Global variables and level map definitions
│   ├── logic.js           # Core functions (timers, UI updates, grid init)
│   └── main.js            # Main game loop, physics, and collision detection
├── index.html             # Main entry point and game container
└── README.md              # Project documentation
```text

## 🚀 Key Features

* **Responsive Canvas:** The game dynamically adjusts to the browser window size while maintaining accurate collision physics.
* **Intelligent Grid System:** Level maps are generated from matrices, allowing for complex designs like the "T-Shape" or "Invader" patterns.
* **Power-Ups & Debuffs:**
    * 🔵 **Extra Ball:** Multiplies your chances of survival by adding more balls into play.
    * ↔️ **Big Paddle:** Temporarily increases the defensive area of the paddle.
    * ⚠️ **Slow Paddle:** A challenging debuff that reduces the paddle's responsiveness.
* **Smart Scoring:** Calculates final results based on the ratio between the current score and the maximum possible points on the map.

## 🛠️ Technologies Used

* **HTML5 Canvas:** Utilized for high-performance 2D graphics rendering.
* **CSS3 Flexbox:** Ensures a perfectly centered and responsive user interface.
* **JavaScript (ES6):** Custom physics engine for ball bounces and power-up gravity.
* **LocalStorage API:** Persists and tracks your "Best Time" records across different sessions.

## 🎮 How to Play

* **Start:** Click a difficulty button or press `Restart` to refresh the game state.
* **Move:** Control the paddle using your mouse or the arrow keys on your keyboard.
* **Objective:** Shatter all turquoise bricks. Gray bricks are indestructible obstacles!
* **Win:** Destroy all breakable bricks to complete the level and set a new record time.

## 📜 License

Distributed under the **MIT License**.
