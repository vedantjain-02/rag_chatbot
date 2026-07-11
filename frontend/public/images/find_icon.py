from PIL import Image
import numpy as np

img = Image.open('dotsquares-logo.png')
arr = np.array(img)
alpha = arr[:, :, 3]
rgb = arr[:, :, :3]

# Find ALL blocks where both orange AND blue pixels exist in a small area
print("Scanning for 9-square icon (blocks with both orange and blue)...")
block_size = 50
found = []
for y in range(0, 3426 - block_size, block_size // 2):
    for x in range(0, 4907 - block_size, block_size // 2):
        block = arr[y:y+block_size, x:x+block_size]
        block_alpha = block[:, :, 3]
        block_rgb = block[:, :, :3]
        mask = block_alpha > 10
        nz = np.count_nonzero(mask)
        if nz < 100:
            continue
        colors = block_rgb[mask]
        # Check for orange (R>200, G>100, B<80) and blue (R<80, G<100, B>100)
        has_orange = np.any((colors[:, 0] > 200) & (colors[:, 1] > 80) & (colors[:, 2] < 100))
        has_blue = np.any((colors[:, 2] > colors[:, 0] + 20) & (colors[:, 2] > 80))
        if has_orange and has_blue:
            found.append((x, y, nz))

print(f"Found {len(found)} blocks with both colors")
if found:
    # Find the bounding box of all such blocks
    xs = [f[0] for f in found]
    ys = [f[1] for f in found]
    print(f"  X range: {min(xs)}-{max(xs)}")
    print(f"  Y range: {min(ys)}-{max(ys)}")
    
    # Group by proximity to find the icon cluster
    # Look for the densest cluster
    from collections import defaultdict
    grid = defaultdict(int)
    for x, y, _ in found:
        gx, gy = x // 200, y // 200
        grid[(gx, gy)] += 1
    
    print("\nClusters (grid of 200px):")
    for (gx, gy), count in sorted(grid.items(), key=lambda kv: -kv[1])[:10]:
        print(f"  ({gx*200},{gy*200}): {count} blocks")
