function degsToRads(degs: number) {
  return (degs * Math.PI) / 180;
}

interface GenerateCircularArcOpts {
  midX?: number;
  midY?: number;
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  arc?: 0 | 1;
  sweep?: 0 | 1;
  skipMove?: boolean;
}

export function circularArcPath({
  midX = 0,
  midY = 0,
  radius = 0,
  startAngle = 0,
  endAngle = 0,
  arc = 0,
  sweep = 1,
  skipMove = false,
}: GenerateCircularArcOpts): string {
  const startAngleRad = degsToRads(startAngle);
  const endAngleRad = degsToRads(endAngle);

  let path = '';

  if (!skipMove) {
    path +=
      `M ${Math.sin(startAngleRad) * radius + midX}` +
      ` ${Math.cos(startAngleRad) * (radius * -1) + midY}`;
  }

  path +=
    ` A ${radius} ${radius} 0 ${arc} ${sweep}` +
    ` ${Math.sin(endAngleRad) * radius + midX}` +
    ` ${Math.cos(endAngleRad) * (radius * -1) + midY}`;

  return path;
}

export function circlePath(radius: number) {
  return (
    circularArcPath({
      radius: radius,
      startAngle: 0,
      endAngle: 180,
    }) +
    circularArcPath({
      skipMove: true,
      radius: radius,
      startAngle: 180,
      endAngle: 0,
    }) +
    'z'
  );
}

export const rectSize = 18;
export const arcRadius = 100;
export const svgNS = 'http://www.w3.org/2000/svg';
