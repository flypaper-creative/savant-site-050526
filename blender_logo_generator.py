import bpy
import bmesh
import math

def create_logo_007():
    """
    Generates a highly symmetrical, ideally-modeled, and robust version of 'Logo 007'.
    Includes correct beveling, topology, and proportions.
    """
    
    # 1. Clean up existing objects named 'Logo_007'
    if "Logo_007" in bpy.data.objects:
        bpy.data.objects.remove(bpy.data.objects["Logo_007"], do_unlink=True)
    for mesh in bpy.data.meshes:
        if mesh.name.startswith("Logo_007"):
            bpy.data.meshes.remove(mesh)

    # 2. Create the base path/curve for the '7' shape
    # We use a Bezier curve with sharp corners for a modern look
    curve_data = bpy.data.curves.new('Logo_007_Path', type='CURVE')
    curve_data.dimensions = '3D'
    curve_data.resolution_u = 12
    
    polyline = curve_data.splines.new('POLY')
    polyline.points.add(2) # We need 3 points total for a basic '7'
    
    # Proportions: Top bar is wide, stem is slightly diagonal
    points = [
        (-2.0, 3.0, 0.0), # Top Left
        ( 2.0, 3.0, 0.0), # Top Right
        ( 0.5, -3.0, 0.0) # Bottom Center/Right
    ]
    
    for i, p in enumerate(points):
        polyline.points[i].co = (p[0], p[1], p[2], 1.0)
    
    # 3. Add geometry to the curve (Beveling)
    curve_data.bevel_depth = 0.4
    curve_data.bevel_resolution = 4
    curve_data.fill_mode = 'FULL'
    curve_data.extrude = 0.1
    
    # 4. Convert curve to mesh for robust modeling
    obj = bpy.data.objects.new("Logo_007", curve_data)
    bpy.context.collection.objects.link(obj)
    
    # Make active and convert
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target='MESH')
    
    # 5. BMesh cleanup and refinement
    mesh = obj.data
    bm = bmesh.new()
    bm.from_mesh(mesh)
    
    # Remove doubles and merge close vertices
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.01)
    
    # Recalculate normals
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    
    bm.to_mesh(mesh)
    bm.free()
    
    # 6. Add Modifiers for "Photorealistic" finish
    subsurf = obj.modifiers.new(name="Subdivision", type='SUBSURF')
    subsurf.levels = 3
    subsurf.render_levels = 4
    
    bevel = obj.modifiers.new(name="Bevel", type='BEVEL')
    bevel.width = 0.03
    bevel.segments = 5
    bevel.limit_method = 'ANGLE'
    
    # Smooth shading
    for poly in obj.data.polygons:
        poly.use_smooth = True
        
    # 7. Export to GLB (Production Ready)
    export_path = "logo_007.glb"
    bpy.ops.export_scene.gltf(filepath=export_path, export_format='GLB', use_selection=True)
    
    print(f"Logo_007 created and exported to: {export_path}")

if __name__ == "__main__":
    create_logo_007()
