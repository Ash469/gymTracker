import numpy as np

def calculate_angle(a: list, b: list, c: list) -> float:
    """Calculates the 2D angle (in degrees) formed by three points (a, b, c) at vertex b."""
    a = np.array(a)  # First point (e.g., Shoulder)
    b = np.array(b)  # Vertex point (e.g., Elbow)
    c = np.array(c)  # End point (e.g., Wrist)

    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)

    if angle > 180.0:
        angle = 360 - angle

    return round(angle, 2)
