# Cyber CTF — Blender/GLB Robot FIXED Version

This is the fixed version.

## What was fixed?

The first Blender/GLB version could fail because the browser might not know how to resolve the Three.js `GLTFLoader` import.

This version adds:

- an `importmap` in `index.html`
- safer Three.js imports
- a backup robot made directly in code
- a visible robot immediately, even if the `.glb` model fails to load

## Important

Do **not** open `index.html` directly as a local file if the model does not load.

Use one of these:

- GitHub Pages
- VS Code Live Server
- a local server

## GitHub Pages steps

1. Unzip this folder.
2. Upload the contents to a GitHub repo.
3. Make sure this file exists exactly here:

```text
assets/models/patch_robot.glb
```

4. Go to Settings → Pages.
5. Choose Deploy from branch.
6. Choose `main` and `/root`.

## Blender steps

To open the model in Blender:

1. Open Blender.
2. File → Import → glTF 2.0.
3. Select:

```text
assets/models/patch_robot.glb
```

4. Edit it.
5. Export as `.glb`.
6. Replace the old file in:

```text
assets/models/patch_robot.glb
```

## Controls

- Move: WASD or Arrow Keys

## Goal

Capture the blue flag and bring it back to the red base.
Score 3 flags to win.
