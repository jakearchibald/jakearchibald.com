interface CompositeMethod {
  source(sourceAlpha: number, destinationAlpha: number): number;
  destination(sourceAlpha: number, destinationAlpha: number): number;
}

export type Pixel = [red: number, green: number, blue: number, alpha: number];

export function multiplyAlpha(pixel: Pixel): Pixel {
  return pixel.map((channel, i) => {
    // Pass the alpha channel through unchanged
    if (i === 3) return channel;
    // Otherwise, multiply by alpha
    return channel * pixel[3];
  }) as Pixel;
}

export function unmultiplyAlpha(pixel: Pixel): Pixel {
  return pixel.map((channel, i) => {
    // Pass the alpha channel through unchanged
    if (i === 3) return channel;
    // Avoid divide-by-zero
    if (pixel[3] === 0) return channel;
    // Divide by alpha
    return channel / pixel[3];
  }) as Pixel;
}

export function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}
