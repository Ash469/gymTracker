import os
import shutil

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

legacy_items = [
    os.path.join(base_dir, "src"),
    os.path.join(base_dir, "server.py"),
    os.path.join(base_dir, "requirements.txt"),
    os.path.join(base_dir, "app.py"),
    os.path.join(base_dir, "main.py"),
    os.path.join(base_dir, "Dockerfile")
]

for item in legacy_items:
    if os.path.exists(item):
        if os.path.isdir(item):
            shutil.rmtree(item)
            print(f"Removed legacy directory: {item}")
        else:
            os.remove(item)
            print(f"Removed legacy file: {item}")
