function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

registerPaint(
  'pixel-gradient-final',
  class PixelGradient {
    static get inputProperties() {
      return [
        '--pixel-gradient-color',
        '--pixel-gradient-seed',
        '--pixel-gradient-size',
      ];
    }

    paint(ctx, bounds, props) {
      let seed = props.get('--pixel-gradient-seed').value;
      const size = props.get('--pixel-gradient-size').value;
      ctx.fillStyle = props.get('--pixel-gradient-color');

      for (let x = 0; x < bounds.width; x += size) {
        const rand = mulberry32(seed);
        seed = rand() * 2 ** 32;

        for (let y = 0; y < bounds.height; y += size) {
          const pos = y / bounds.height;
          if (rand() < pos) ctx.fillRect(x, y, size, size);
        }
      }
    }
  },
);

registerPaint(
  'pixel-gradient-v1',
  class PixelGradient {
    static get inputProperties() {
      return ['--pixel-gradient-color', '--pixel-gradient-size'];
    }

    paint(ctx, bounds, props) {
      const size = props.get('--pixel-gradient-size').value;
      ctx.fillStyle = props.get('--pixel-gradient-color');

      // Loop over columns
      for (let x = 0; x < bounds.width; x += size) {
        // Loop over rows
        for (let y = 0; y < bounds.height; y += size) {
          // Convert our vertical position to 0-1
          const pos = y / bounds.height;
          // Only draw a box if a random number is less than pos
          if (Math.random() < pos) ctx.fillRect(x, y, size, size);
        }
      }
    }
  },
);

registerPaint(
  'pixel-gradient-v2',
  class PixelGradient {
    static get inputProperties() {
      return [
        '--pixel-gradient-color',
        '--pixel-gradient-size',
        '--pixel-gradient-seed',
      ];
    }

    paint(ctx, bounds, props) {
      const size = props.get('--pixel-gradient-size').value;
      ctx.fillStyle = props.get('--pixel-gradient-color');

      // Get the seed, and create our random function:
      const seed = props.get('--pixel-gradient-seed').value;
      const rand = mulberry32(seed);

      for (let x = 0; x < bounds.width; x += size) {
        for (let y = 0; y < bounds.height; y += size) {
          const pos = y / bounds.height;
          // …and use it rather than Math.random()
          if (rand() < pos) ctx.fillRect(x, y, size, size);
        }
      }
    }
  },
);

registerPaint(
  'pixel-gradient-v3',
  class PixelGradient {
    static get inputProperties() {
      return [
        '--pixel-gradient-color',
        '--pixel-gradient-size',
        '--pixel-gradient-seed',
      ];
    }

    paint(ctx, bounds, props) {
      const size = props.get('--pixel-gradient-size').value;
      ctx.fillStyle = props.get('--pixel-gradient-color');

      let seed = props.get('--pixel-gradient-seed').value;

      for (let x = 0; x < bounds.width; x += size) {
        // Create a new rand() for this column:
        const rand = mulberry32(seed);
        // Increment the seed for next time:
        seed++;

        for (let y = 0; y < bounds.height; y += size) {
          const pos = y / bounds.height;
          if (rand() < pos) ctx.fillRect(x, y, size, size);
        }
      }
    }
  },
);
