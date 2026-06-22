# Cyber CTF — Real 3D Robots

This version upgrades the robot from a flat PNG sprite into a real Three.js 3D robot built from connected 3D parts.

## What is different?

The robot is now made of real 3D pieces:

- 3D head
- 3D torso
- 3D arms
- 3D legs / hover feet
- glowing eyes
- glowing chest core
- glowing circuit lines
- bronze trim
- different robot body shapes

## Controls

- Move: WASD or Arrow Keys
- Switch robots:
  - 1 = Tall robot
  - 2 = Tank robot
  - 3 = Round robot
  - 4 = Scout robot

## Goal

Capture the blue flag and bring it back to the red base.

Score 3 flags to win.

## How to put this on GitHub

1. Create a new GitHub repository.
2. Upload these files:
   - `index.html`
   - `style.css`
   - `game.js`
   - `README.md`
3. Go to Settings → Pages.
4. Choose Deploy from branch.
5. Choose `main` and `/root`.
6. Open the GitHub Pages link after it publishes.

## Important note

This is real 3D, but it is still built directly in code using Three.js.

Later, you could make an even better version by creating a full robot model in Blender and exporting it as a `.glb` file.
