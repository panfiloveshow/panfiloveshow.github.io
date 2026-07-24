import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, '..');
const outputDirectory = resolve(projectRoot, 'public/assets/landing-v2/vector');

const WIDTH = 2400;
const HEIGHT = 720;

const layers = [
  {
    name: 'back',
    seed: 17,
    count: 420,
    radius: [4, 15],
    reach: 0.9,
    opacity: [0.46, 0.76],
    lines: true,
  },
  {
    name: 'mid',
    seed: 43,
    count: 240,
    radius: [11, 30],
    reach: 0.76,
    opacity: [0.64, 0.9],
    lines: false,
  },
  {
    name: 'front',
    seed: 89,
    count: 108,
    radius: [25, 58],
    reach: 0.62,
    opacity: [0.82, 1],
    lines: false,
  },
];

function randomGenerator(seed) {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function fixed(value) {
  return Number(value.toFixed(2));
}

function createPoints(layer) {
  const random = randomGenerator(layer.seed);
  const points = [];

  for (let index = 0; index < layer.count; index += 1) {
    const radius = layer.radius[0] + random() * (layer.radius[1] - layer.radius[0]);
    const horizontal = Math.pow(random(), 1.72);
    const x = -radius + horizontal * (WIDTH * layer.reach + radius * 2);
    const wave = Math.sin(x / 190) * 24 + Math.sin(x / 83) * 8;
    const y = -radius + random() * (HEIGHT + radius * 2) + wave;
    const opacity = layer.opacity[0] + random() * (layer.opacity[1] - layer.opacity[0]);
    const gradient = Math.floor(random() * 5);

    points.push({
      x: fixed(x),
      y: fixed(y),
      radius: fixed(radius),
      opacity: fixed(opacity),
      gradient,
    });
  }

  return points.sort((left, right) => left.radius - right.radius);
}

function createDefinitions(prefix) {
  const gradients = [
    ['#f9fffc', '#bfe8d3', '#3c9f74'],
    ['#eafff4', '#72c89f', '#167452'],
    ['#ffffff', '#d8eee3', '#76ad91'],
    ['#dff8ec', '#53b88a', '#0b6246'],
    ['#f2fff8', '#9cdbbc', '#25865f'],
  ];

  return gradients
    .map(
      ([highlight, middle, edge], index) => `
    <radialGradient id="${prefix}-${index}" cx="30%" cy="24%" r="76%">
      <stop offset="0" stop-color="${highlight}"/>
      <stop offset="0.34" stop-color="${middle}"/>
      <stop offset="0.78" stop-color="${edge}"/>
      <stop offset="1" stop-color="${edge}"/>
    </radialGradient>`,
    )
    .join('');
}

function createConnections(points) {
  const lines = [];

  for (let index = 0; index < points.length && lines.length < 115; index += 1) {
    const point = points[index];
    let closest = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (let candidateIndex = index + 1; candidateIndex < Math.min(index + 18, points.length); candidateIndex += 1) {
      const candidate = points[candidateIndex];
      const distance = Math.hypot(candidate.x - point.x, candidate.y - point.y);

      if (distance < closestDistance && distance < 112) {
        closest = candidate;
        closestDistance = distance;
      }
    }

    if (closest) {
      lines.push(
        `<path d="M${point.x} ${point.y}L${closest.x} ${closest.y}" stroke="#2e936d" stroke-width="1.1" stroke-opacity="0.16" vector-effect="non-scaling-stroke"/>`,
      );
    }
  }

  return lines.join('\n    ');
}

function createSvg(layer) {
  const prefix = `particle-${layer.name}`;
  const points = createPoints(layer);
  const connections = layer.lines ? createConnections(points) : '';
  const circles = points
    .map(
      (point) =>
        `<circle cx="${point.x}" cy="${point.y}" r="${point.radius}" fill="url(#${prefix}-${point.gradient})" fill-opacity="${point.opacity}" stroke="#edfff6" stroke-width="0.9" stroke-opacity="0.5" vector-effect="non-scaling-stroke"/>`,
    )
    .join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" fill="none" shape-rendering="geometricPrecision">
  <defs>${createDefinitions(prefix)}
  </defs>
  <g>
    ${connections}
    ${circles}
  </g>
</svg>
`;
}

await mkdir(outputDirectory, { recursive: true });

await Promise.all(
  layers.map((layer) =>
    writeFile(resolve(outputDirectory, `ai-particle-field-${layer.name}.svg`), createSvg(layer), 'utf8'),
  ),
);

console.log(`Generated ${layers.length} vector particle layers in ${outputDirectory}`);
