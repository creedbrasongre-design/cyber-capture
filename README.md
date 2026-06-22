# Cyber Capture the Flag Starter Game

This is a simple 3D browser game starter for GitHub Pages.

## What it does

- Uses Three.js for a 3D scene
- Uses generated robot images as 2.5D sprites
- Lets you switch between robot body shapes
- Lets you capture the blue flag and return it to the red base

## Controls

- Move: WASD or Arrow Keys
- Switch robots:
  - 1 = tall robot
  - 2 = short robot
  - 3 = round robot
  - 4 = scout robot

## How to put this on GitHub

1. Create a new GitHub repository.
2. Upload all files from this folder.
3. Go to Settings → Pages.
4. Under Branch, choose `main` and `/root`.
5. Open the GitHub Pages link after it publishes.

## Folder structure

```text
cyber_ctf_game_starter/
  index.html
  style.css
  game.js
  assets/
    robots/
      patch_tall.png
      patch_short.png
      patch_round.png
      patch_scout.png
    world/
      cyber_floor.png
      red_base.png
      blue_base.png
      blue_flag.png
      red_flag.png
```

## Next ideas

- Add scanner beams
- Add enemy patrol robots
- Add a timer
- Add a start menu
- Add sound effects
- Add online multiplayer later
