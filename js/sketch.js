// Swarm settings
const dotsPerMegapixel = 120; // how many dots for every 1000x1000 pixels of screen
const dotSize = 1.2;            // diameter of each dot (pixels)
const dotAlpha = 125;          // dot opacity (0 = invisible, 255 = solid)
const maxSpeed = 0.9;         // fastest a dot can move (pixels per frame)
const noiseScale = 0.0015;    // how smooth the swarm's paths are (smaller = smoother)
const noiseDrift = 0.0008;    // how fast the flow pattern changes over time
const mouseRadius = 120;      // dots within this distance drift away from the mouse
const mousePush = 0.05;       // how strongly the mouse pushes dots away

const backgroundColor = 255;  // page background (white)
const dotColor = 0;          // dot color (near black)

let dots = [];
let speedFactor = 1; // lowered in setup() for reduced-motion visitors

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  // Visitors who asked their system for less motion get a slower swarm
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    speedFactor = 0.3;
  }

  createDots();
}


function draw() {
  background(backgroundColor);
  fill(dotColor, dotAlpha);

  for (const dot of dots) {
    dot.update();
    dot.show();
  }
}


class Dot {
  constructor() {
    this.position = createVector(random(width), random(height));
    this.velocity = createVector(0, 0);
  }

  update() {
    // Perlin noise gives each spot on the screen a direction that changes slowly,
    // so neighbouring dots move together like a loose swarm
    const angle = noise(this.position.x * noiseScale, this.position.y * noiseScale, frameCount * noiseDrift) * TWO_PI * 2;
    const steer = p5.Vector.fromAngle(angle).mult(0.02);
    this.velocity.add(steer);

    // Drift away from the mouse
    const away = p5.Vector.sub(this.position, createVector(mouseX, mouseY));
    const distance = away.mag();
    if (distance < mouseRadius && distance > 0) {
      away.setMag(mousePush * (1 - distance / mouseRadius));
      this.velocity.add(away);
    }

    this.velocity.limit(maxSpeed * speedFactor);
    this.position.add(this.velocity);
    this.wrapAround();
  }

  // Dots leaving one edge come back on the opposite edge
  wrapAround() {
    if (this.position.x < -dotSize) this.position.x = width + dotSize;
    if (this.position.x > width + dotSize) this.position.x = -dotSize;
    if (this.position.y < -dotSize) this.position.y = height + dotSize;
    if (this.position.y > height + dotSize) this.position.y = -dotSize;
  }

  show() {
    circle(this.position.x, this.position.y, dotSize);
  }
}


// Adds or removes dots so the count matches the screen size,
// keeping the ones already moving so a resize doesn't make the swarm jump
function createDots() {
  const count = round((width * height) / 1000000 * dotsPerMegapixel);
  while (dots.length < count) dots.push(new Dot());
  dots.length = count;
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createDots();
}
