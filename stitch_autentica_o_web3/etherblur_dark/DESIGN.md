# Design System Strategy: The Electric Editorial

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Kinetic Gallery."** 

Unlike standard Web3 dashboards that feel cluttered and mechanical, this system treats high-stakes data as art. We are moving away from the "trading terminal" aesthetic toward a "high-end editorial" experience. By blending the precision of Swiss typography with the ethereal depth of Glassmorphism, we create a UI that feels both authoritative and immersive. 

We break the "template" look through **Intentional Asymmetry**. Large Serif Italic displays should overlap glass containers, and radial purple glows should bleed across section boundaries to create a sense of infinite, atmospheric space. This isn't just a platform; it’s a premium digital environment.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a "Deep Dark" foundation, using light not as a border, but as a medium.

### Surface Hierarchy & Nesting
Depth is achieved through a "Stacking" logic rather than shadows.
*   **Base Layer:** `surface-dim` (#131313) or `surface-container-lowest` (#0E0E0E) for the main canvas.
*   **Mid Layer:** `surface-container-low` (#1C1B1B) for secondary content areas.
*   **Top Layer:** `surface-container-highest` (#353534) for active interactive elements.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid hex-colored borders to define sections. Boundaries must be defined by background shifts (e.g., a `surface-container-low` card sitting on a `surface` background). This creates a sophisticated, seamless transition that feels carved rather than outlined.

### The Glass & Gradient Rule
To move beyond a "standard" feel, all primary cards must utilize **Glassmorphism**. Use a semi-transparent `surface-variant` with a `backdrop-filter: blur(20px)`. For main CTAs, use a linear gradient: `primary` (#DDB7FF) to `primary-container` (#B76DFF) at a 135-degree angle to provide visual "soul."

---

## 3. Typography
The typography system relies on the tension between the modern utility of **Inter** and the classic elegance of **Noto Serif (Italic)**.

*   **Display (Noto Serif Italic):** Reserved for high-impact hero statements and "Big Numbers." This conveys an editorial, "Old Money" authority in a New Money (Web3) world.
*   **Headlines (Noto Serif):** Used to introduce sections. The contrast against the dark background should feel like a premium magazine spread.
*   **UI & Body (Inter):** Used for all functional data. Inter provides the necessary legibility for complex crypto transactions and data tables.
*   **Labels (Inter Mono/All Caps):** Used for micro-copy and metadata to maintain a technical, precise "pro-tool" feel.

---

## 4. Elevation & Depth
In this system, light doesn't come from an external source—it glows from within the interface.

*   **Tonal Layering:** Avoid the "Drop Shadow" effect. Instead, elevate items by shifting to a lighter `surface-container` token. 
*   **Ambient Shadows:** If a floating element (like a modal) requires a shadow, use a large blur (40px+) at 4-8% opacity, tinted with `primary` (#DDB7FF). This mimics the soft glow of a neon light in a dark room.
*   **The "Ghost Border" Fallback:** If a container requires definition against a similar background, use a 1px border with `outline-variant` (#4D4354) at **10% opacity**. This is the only exception to the No-Line rule.
*   **Radial Glows:** Use large, absolute-positioned decorative divs with `radial-gradient` (from `primary` to transparent) at 5% opacity behind key components to create "pools of light."

---

## 5. Components

### Buttons
*   **Primary:** Gradient from `primary` (#DDB7FF) to `primary-container` (#B76DFF). No border. White text (`on-primary`).
*   **Secondary:** Glass background (`surface-variant` at 20% opacity) with a 10% white `outline-variant` "Ghost Border."
*   **Success (Bidding):** A vibrant gradient using `secondary` (#4DE082) to `on-secondary-fixed-variant` (#005227).

### Dark Glass Cards
*   **Construction:** `surface-container-low` at 60% opacity. 
*   **Effect:** `backdrop-filter: blur(16px)`.
*   **Edge:** A 1px top-and-left "light leak" using `outline-variant` at 20% to simulate a glass edge catching light.

### Data Tables
*   **Rule:** Forbid divider lines.
*   **Separation:** Use `spacing-4` (1rem) vertical padding and alternating row colors using `surface-container-lowest` and `surface-container-low`.
*   **Headers:** Use `label-md` in `on-surface-variant` with a tracking of 0.05em.

### Inputs
*   **Base:** `surface-container-lowest` (#0E0E0E).
*   **State:** On focus, the border shifts from 10% opacity to a 100% `primary` (#DDB7FF) "Ghost Border" and a subtle purple outer glow.

### Interactive Chips
*   **Web3 Status:** Use `secondary` (#4DE082) for "Connected" or "Success" states, but always with a 10% opacity background of the same color to ensure the text remains the hero.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** overlap elements. Let a Serif headline "break" the top edge of a glass card.
*   **Do** use extreme whitespace (`spacing-20` and above) to separate major content blocks.
*   **Do** use `notoSerif` for large, decorative numbers (e.g., "01", "02" in a list).

### Don’ts:
*   **Don't** use pure black (#000000). Use the `surface` tokens to maintain tonal depth.
*   **Don't** use 100% opaque, high-contrast borders. It kills the "Glass" illusion.
*   **Don't** use standard sans-serif for headlines. It makes the platform look like a generic SaaS dashboard rather than a premium Web3 experience.
*   **Don't** use shadows to create depth on cards; use background color shifts and backdrop blurs instead.