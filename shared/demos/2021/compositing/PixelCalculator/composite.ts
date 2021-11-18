interface CompositeMethod {
  source(sourceAlpha: number, destinationAlpha: number): number;
  destination(sourceAlpha: number, destinationAlpha: number): number;
}

export type Pixel = [red: number, green: number, blue: number, alpha: number];

export const sourceOver: CompositeMethod = {
  source: () => 1,
  destination: (sourceAlpha) => 1 - sourceAlpha,
};

export const lighter: CompositeMethod = {
  source: () => 1,
  destination: () => 1,
};

function composite(
  method: CompositeMethod,
  sourcePixel: Pixel,
  destinationPixel: Pixel,
): Pixel {
  const sourceAlpha = sourcePixel[3];
  const destinationAlpha = destinationPixel[3];

  // Figure out how much of the source and destination to apply.
  // sourceAlpha, destinationAlpha are passed in,
  // as some compositing methods use one or both.
  const sourceFraction = method.source(sourceAlpha, destinationAlpha);
  const destinationFraction = method.destination(sourceAlpha, destinationAlpha);

  // Apply those fractions and add the result
  const result = sourcePixel.map((sourceChannel, i) => {
    const destinationChannel = destinationPixel[i];
    return (
      sourceChannel * sourceFraction + destinationChannel * destinationFraction
    );
  }) as Pixel;

  // The alpha channel is always clamped to 0-1
  result[3] = Math.max(0, Math.min(1, result[3]));

  return result;
}

function multiplyAlpha(pixel: Pixel): Pixel {
  return pixel.map((channel, i) => {
    // Pass the alpha channel through unchanged
    if (i === 3) return channel;
    // Otherwise, multiply by alpha
    return channel * pixel[3];
  }) as Pixel;
}

function unmultiplyAlpha(pixel: Pixel): Pixel {
  return pixel.map((channel, i) => {
    // Pass the alpha channel through unchanged
    if (i === 3) return channel;
    // Avoid divide-by-zero
    if (pixel[3] === 0) return channel;
    // Divide by alpha
    return channel / pixel[3];
  }) as Pixel;
}

export const compositeUnmultiplied = (
  method: CompositeMethod,
  sourcePixel: Pixel,
  destinationPixel: Pixel,
): Pixel =>
  unmultiplyAlpha(
    composite(
      method,
      multiplyAlpha(sourcePixel),
      multiplyAlpha(destinationPixel),
    ),
  );
