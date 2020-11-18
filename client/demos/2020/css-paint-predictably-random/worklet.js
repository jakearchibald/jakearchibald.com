function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomGenerator(seed) {
  let state = seed;

  const next = () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    var t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    nextBetween: (from, to) => next() * (to - from) + from,
    fork: () => randomGenerator(next() * 2 ** 32),
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
      const seed = props.get('--pixel-gradient-seed').value;
      const size = props.get('--pixel-gradient-size').value;
      ctx.fillStyle = props.get('--pixel-gradient-color');
      const randomXs = randomGenerator(seed);

      for (let x = 0; x < bounds.width; x += size) {
        const randomYs = randomXs.fork();

        for (let y = 0; y < bounds.height; y += size) {
          const pos = (y + size / 2) / bounds.height;
          if (randomYs.next() < pos) ctx.fillRect(x, y, size, size);
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
          const pos = (y + size / 2) / bounds.height;
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
          const pos = (y + size / 2) / bounds.height;
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
          const pos = (y + size / 2) / bounds.height;
          if (rand() < pos) ctx.fillRect(x, y, size, size);
        }
      }
    }
  },
);

registerPaint(
  'confetti',
  class PixelGradient {
    static get inputProperties() {
      return [
        '--confetti-density',
        '--confetti-seed',
        '--confetti-length-variance',
        '--confetti-weight-variance',
      ];
    }

    paint(ctx, bounds, props) {
      const gridSize = 300;
      const density = props.get('--confetti-density').value;
      const seed = props.get('--confetti-seed').value;
      const lengthVar = props.get('--confetti-length-variance').value;
      const weightVar = props.get('--confetti-weight-variance').value;
      const minLength = 3;
      const maxLength = minLength + lengthVar;
      const minWeight = 1;
      const maxWeight = minWeight + weightVar;

      const randomXs = randomGenerator(seed);

      for (let x = 0; x < bounds.width; x += gridSize) {
        const randomYs = randomXs.fork();

        for (let y = 0; y < bounds.height; y += gridSize) {
          const randomItems = randomYs.fork();

          for (let _ = 0; _ < density; _++) {
            const confettiLength = randomItems.nextBetween(
              minLength,
              maxLength,
            );
            const confettiWeight = randomItems.nextBetween(
              minWeight,
              maxWeight,
            );
            const confettiX = randomItems.next() * gridSize + x;
            const confettiY = randomItems.next() * gridSize + y;

            // Set Color
            const hue = randomItems.next() * 360;
            const sat = randomItems.next() * 10 + 90;
            const light = randomItems.next() * 50 + 40;
            const color = `hsl(${hue}deg, ${sat}%, ${light}%)`;

            // Set Paint Info
            ctx.lineWidth = confettiWeight;
            ctx.strokeStyle = color;

            // Calculate New Position
            const angle = randomItems.next() * 89;
            const hypotenuse = confettiLength;
            const newX = confettiX + Math.cos(angle) * hypotenuse;
            const newY = confettiY + Math.sin(angle) * hypotenuse;

            // Paint
            ctx.beginPath();
            ctx.moveTo(confettiX, confettiY);
            ctx.lineTo(newX, newY);
            ctx.stroke();
          }
        }
      }
    }
  },
);
