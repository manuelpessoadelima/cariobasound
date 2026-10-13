// Flicker settings
const fastestFrames = 1;  // frames per color at the top of the screen
const slowestFrames = 5; // frames per color at the bottom of the screen

// Sound settings
const sineTop = 15000;    // sine pitch at the top of the screen (Hz)
const sineBottom = 60;    // sine pitch at the bottom of the screen (Hz)
const highpassTop = 15000; // high-pass cutoff at the top (Hz)
const highpassMiddle = 20; // high-pass cutoff just above the middle (Hz)
const lowpassMiddle = 20000; // low-pass cutoff just below the middle (Hz)
const lowpassBottom = 60;  // low-pass cutoff at the bottom (Hz)
const gateTime = 0.002;   // attack/release of each flash (seconds)
const masterLevel = 0.5;  // overall volume (0-1)

let isLight = false; // which of the two colors is showing
let framesHeld = 0;  // how many frames the current color has been shown
let randomColor;     // new random color picked on every flash

// Tone.js nodes, created on the first click
let audioStarted = false;
let noise, filter, sine, crossFade, gate;

function setup() {
  createCanvas(windowWidth, windowHeight);
  randomColor = color(random(255), random(255), random(255));
}


function draw() {
  // X axis: 0 at the center of the screen, 1 at the left/right edges
  const distFromCenter = constrain(abs(mouseX - width / 2) / (width / 2), 0, 1);
  // center = red, halfway out = random colors, edges = white
  let lightColor;
  let whiteness = 0; // 0 = not white at all, 1 = pure white
  if (distFromCenter < 0.5) {
    lightColor = lerpColor(color(255, 0, 0), randomColor, distFromCenter / 0.5);
  } else {
    whiteness = (distFromCenter - 0.5) / 0.5;
    lightColor = lerpColor(randomColor, color(255), whiteness);
  }
  const darkColor = color(0);

  // Y axis: top = fewest frames per color (fast), bottom = most (slow)
  const framesPerColor = round(map(mouseY, 0, height, fastestFrames, slowestFrames, true));

  framesHeld++;
  if (framesHeld >= framesPerColor) {
    isLight = !isLight;
    framesHeld = 0;
    if (isLight) {
      randomColor = color(random(255), random(255), random(255));
    }
  }

  background(isLight ? lightColor : darkColor);

  if (audioStarted) {
    updateSound(distFromCenter, whiteness);
  } else {
    fill(128);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(24);
    text('click to start sound', width / 2, height / 2);
  }
}


// Browsers only allow audio to start after the user clicks
async function mousePressed() {
  if (audioStarted) return;
  await Tone.start();

  // noise -> filter --\
  //                    crossFade -> gate -> master -> speakers
  // sine -------------/
  const master = new Tone.Gain(masterLevel).toDestination();
  gate = new Tone.Gain(0).connect(master);
  crossFade = new Tone.CrossFade(0).connect(gate);
  filter = new Tone.Filter({ type: 'highpass', frequency: highpassTop, rolloff: -24 }).connect(crossFade.a);
  noise = new Tone.Noise('white').connect(filter).start();
  sine = new Tone.Oscillator(sineTop, 'sine').connect(crossFade.b).start();

  audioStarted = true;
}


function updateSound(distFromCenter, whiteness) {
  const now = Tone.now();

  // Y axis: 0 at the top, 1 at the bottom
  const y = constrain(mouseY / height, 0, 1);

  // Sine pitch: high at the top, low at the bottom
  sine.frequency.rampTo(expMap(y, sineTop, sineBottom), 0.03, now);

  // Noise filter: high-pass in the top half, low-pass in the bottom half
  if (y < 0.5) {
    filter.type = 'highpass';
    filter.frequency.rampTo(expMap(y / 0.5, highpassTop, highpassMiddle), 0.03, now);
  } else {
    filter.type = 'lowpass';
    filter.frequency.rampTo(expMap((y - 0.5) / 0.5, lowpassMiddle, lowpassBottom), 0.03, now);
  }

  // X axis: edges = filtered noise, center = sine
  crossFade.fade.rampTo(1 - distFromCenter, 0.03, now);

  // Gate: black/color = sound, white = silence
  const level = isLight ? 1 - whiteness : 1;
  gate.gain.rampTo(level, gateTime, now);
}


// Maps t (0-1) from a to b on an exponential curve, so pitch changes evenly to the ear
function expMap(t, a, b) {
  return a * pow(b / a, t);
}

    

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
