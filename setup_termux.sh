#!/bin/bash
# setup_termux_blender.sh
# Instructions to run the Logo 007 generator in Termux on Android.

echo "--- Logo 007 Termux Setup ---"

# Step 1: Install proot-distro to run a full Linux environment (Blender needs this on Android)
echo "Installing proot-distro..."
pkg update -y && pkg install proot-distro -y

# Step 2: Install Ubuntu (or your preferred distro)
echo "Setting up Ubuntu..."
proot-distro install ubuntu

# Step 3: Log into Ubuntu and install Blender
echo "
To finish setup, run these commands inside Termux:

1. Enter Ubuntu:
   proot-distro login ubuntu

2. Update and install Blender:
   apt update && apt install blender -y

3. Run the Logo 007 script (assuming the script is in your current folder):
   blender --background --python blender_logo_generator.py

Your logo will be generated as 'logo_007.glb' in the same folder.
"
