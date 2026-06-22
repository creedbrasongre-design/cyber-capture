# Cyber CTF — Blender/GLB Robot Version

This version uses a real `.glb` 3D model for the robot.

## Files

```text
index.html
style.css
game.js
assets/models/patch_robot.glb
blender_make_patch_robot.py
```

## What is the GLB file?

`patch_robot.glb` is a real 3D model file.

You can:

- load it in the Three.js game
- import it into Blender
- edit the parts in Blender
- export it again as a `.glb`

## How to open the robot in Blender

1. Open Blender.
2. Go to File → Import → glTF 2.0.
3. Choose:

```text
assets/models/patch_robot.glb
```

4. Edit the robot.
5. Export with File → Export → glTF 2.0.
6. Choose `.glb`.
7. Replace the old file at:

```text
assets/models/patch_robot.glb
```

## How to run the game on GitHub

1. Create a new GitHub repo.
2. Upload all files from this folder.
3. Go to Settings → Pages.
4. Choose Deploy from branch.
5. Choose `main` and `/root`.
6. Open your GitHub Pages link.

## Controls

- Move: WASD or Arrow Keys

## Goal

Capture the blue flag and bring it back to the red base.

Score 3 flags to win.

## Important note

The `.glb` model was generated here as a Blender-ready model. The included `blender_make_patch_robot.py` file is a script you can run inside Blender if you want Blender itself to rebuild the robot from editable primitive shapes.
