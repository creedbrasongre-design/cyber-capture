
# Run this inside Blender's Python console or Text Editor.
# It creates a simple editable Patch robot from Blender primitives.
import bpy, math
from mathutils import Vector

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

def make_mat(name, color, emission=False):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = color
        bsdf.inputs["Roughness"].default_value = 0.5
        bsdf.inputs["Metallic"].default_value = 0.4
        if emission:
            bsdf.inputs["Emission Color"].default_value = color
            bsdf.inputs["Emission Strength"].default_value = 2.0
    return mat

stone = make_mat("cracked_dark_stone", (0.18, 0.19, 0.22, 1))
bronze = make_mat("aged_bronze_trim", (0.70, 0.48, 0.20, 1))
dark = make_mat("black_glass_visor", (0.02, 0.025, 0.035, 1))
cyan = make_mat("cyan_glow", (0.05, 0.85, 1.0, 1), True)

def add_uv_sphere(name, loc, scale, material):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    obj.data.materials.append(material)
    return obj

def add_cube(name, loc, scale, material):
    bpy.ops.mesh.primitive_cube_add(location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    obj.data.materials.append(material)
    return obj

def add_cylinder(name, loc, radius, depth, material, rotation=(0,0,0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=radius, depth=depth, location=loc, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(material)
    return obj

# Body
add_uv_sphere("round_torso_stone", (0, 1.2, 0), (0.78, 0.95, 0.55), stone)
add_uv_sphere("helmet_head_stone", (0, 2.35, 0), (0.86, 0.58, 0.58), stone)
add_cube("black_face_visor", (0, 2.34, 0.55), (0.41, 0.14, 0.03), dark)
add_cube("left_square_eye_glow", (-0.24, 2.38, 0.60), (0.08, 0.08, 0.03), cyan)
add_cube("right_square_eye_glow", (0.24, 2.38, 0.60), (0.08, 0.08, 0.03), cyan)
add_uv_sphere("glowing_chest_core", (0, 1.25, 0.61), (0.18, 0.18, 0.07), cyan)

# Trim and circuits
add_cube("front_bronze_belt", (0, 0.74, 0.48), (0.68, 0.05, 0.06), bronze)
add_cube("upper_bronze_band", (0, 1.72, 0.46), (0.55, 0.05, 0.06), bronze)
add_cube("cyan_torso_line_center", (0, 1.58, 0.61), (0.025, 0.25, 0.02), cyan)

# Antenna
add_cylinder("antenna_pole", (0.25, 2.98, 0), 0.035, 0.55, bronze, rotation=(0.38,0,0))
add_uv_sphere("antenna_cyan_orb", (0.34, 3.27, 0.08), (0.12,0.12,0.12), cyan)

# Arms and legs
for side in [-1, 1]:
    add_uv_sphere(f"{side}_shoulder_stone", (side*0.78, 1.5, 0), (0.26,0.23,0.23), stone)
    add_cylinder(f"{side}_upper_arm_stone", (side*0.98, 1.12, 0), 0.09, 0.7, stone, rotation=(0,0,0.42*side))
    add_uv_sphere(f"{side}_elbow_bronze", (side*1.15, 0.78, 0), (0.13,0.13,0.13), bronze)
    add_cylinder(f"{side}_forearm_stone", (side*1.22, 0.5, 0), 0.095, 0.55, stone, rotation=(0,0,0.16*side))
    add_cube(f"{side}_blocky_hand", (side*1.27, 0.18, 0.02), (0.14,0.11,0.11), stone)

    add_cylinder(f"{side}_upper_leg", (side*0.34, 0.48, 0.02), 0.095, 0.58, stone, rotation=(0,0,0.12*side))
    bpy.ops.mesh.primitive_cone_add(vertices=20, radius1=0.23, depth=0.45, location=(side*0.42, -0.15, 0.06), rotation=(math.pi,0,0))
    foot = bpy.context.object
    foot.name = f"{side}_hover_foot"
    foot.data.materials.append(stone)

# Camera and light
bpy.ops.object.light_add(type='AREA', location=(3, 5, 4))
bpy.context.object.name = "Key Light"
bpy.context.object.data.energy = 600
bpy.context.object.data.size = 5

bpy.ops.object.camera_add(location=(0, 3.4, 6), rotation=(math.radians(62), 0, 0))
bpy.context.scene.camera = bpy.context.object

# Export as GLB
bpy.ops.export_scene.gltf(filepath="patch_robot_from_blender.glb", export_format='GLB')
print("Created Patch robot and exported patch_robot_from_blender.glb")
