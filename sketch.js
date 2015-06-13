/**
 *  Draw a buffer of audio samples. Use the p5.FFT
 *  (Web Audio API Analyzer Node) as a fast way to
 *  get the time domain data, pre-fft.
 * 
 *  Press T to toggle input between soundFile, mic, and oscillator.
 *  Oscillator's frequency is mapped to mouse position.
 *
 *  This example includes drag & drop with p5.dom.
 */

var soundFile, mic, osc;

var analyzerArr;
var numSamples = 1024;

// Array of amplitude values (-1 to +1) over time.
var samples = [];
var currentSource = "soundFile";

var canvasHeight = 500;
var lineWidth = 10;
var numLines = 6;
var filter;
var colorArr;
var filterArr;
var freqArr = [[0,500],[600, 2000], [2100, 5000], [5100, 8000], [8100, 12000], [12100, 22000]];

function setup() {
  var cnv = createCanvas(numSamples, canvasHeight);
  noFill();
  stroke(240);

  // make canvas drag'n'dropablle with gotFile as the callback
  makeDragAndDrop(cnv, gotFile);

  soundFile = loadSound('./music/Atoms_For_Peace-Judge_Jury_and_Executioner.mp3');

  filterArr = createFilters(freqArr);
  analyzerArr = createAnalyzers(6);
  
  // set up various inputs. We'll toggle them when key "T" is pressed.
  mic = new p5.AudioIn();
  osc = new p5.Oscillator();
  osc.amp(0.3);
  osc.freq(10);

  // mic.start();

  // load the soundfile in setup, but we won't play it until user hits "T"
  setUpProcessing(soundFile);
  setUpInput(filterArr);

  console.log(filterArr[5]);
  console.log(analyzerArr);
}

function draw() {
  background(30, 30, 30, 220);

  // get a buffer of 1024 samples over time.
  // var colors = 

  strokeWeight(5);

  colorArr = [
    {red: 102, green: 0, blue: 204},
    {red: 55, green: 55, blue: 255},
    {red: 0, green: 255, blue: 55},
    {red: 255, green: 204, blue: 0},
    {red: 255, green: 153, blue: 0},
    {red: 204, green: 0, blue: 0},
  ];

  for(var index = colorArr.length - 1; index >= 0 ; index--){
    samples = analyzerArr[(5 - index)].waveform();
    var bufLen = samples.length;

    // draw snapshot of the samples
    stroke(colorArr[index].red, colorArr[index].green, colorArr[index].blue);
    beginShape();
    var upperLim = bufLen;
    for (var i = 0; i < upperLim; i++){
      var x = map(i, 0, upperLim, 0, width);
      var y = map(samples[i], -1, 1, -height/2, height/2);
      vertex(x, y + (3 * index * lineWidth + height/2));
    }
    endShape();
  }

  // map the oscillator frequency to mouse position
  var freq = map(mouseX, 0, windowWidth, 10, 22000);
  osc.freq(freq, 0.01);
  var amp = map(mouseY, height, 0, 0, 1);
  osc.amp(amp, 0.01);

  labelStuff(freq, amp);
}


// draw text
function labelStuff(freq, amp) {
  strokeWeight(1);
  text('Press T to toggle source', 20, 20);
  text('Source: '+ currentSource, 20, 40);

  // if currentSource is an oscillator:
  if (currentSource === 'sine' || currentSource == 'triangle' || currentSource == 'square' || currentSource == 'sawtooth') {
    text('Frequency: ' + freq, 20, 60);
    text('Amplitude: ' + amp, 20, 80);
  }
}

// ==================
// Handle Drag & Drop
// ==================

function makeDragAndDrop(canvas, callback) {
  var domEl = getElement(canvas.elt.id);
  domEl.drop(callback);
}

function gotFile(file) {
  soundFile.dispose();
  soundFile = loadSound(file, function() {
    toggleInput(0);
  });
}

// ============
// create anaylizers
// ============
  
function createAnalyzers(N) {
  var analyzerArr = new Array(6);
  for (var i = 0; i < N; i++) {
    analyzerArr[i] = new p5.FFT(0, numSamples);
  }
  return analyzerArr;
} 

// ============
// setup filters
// ============

function setUpInput() {
  filterArr.forEach(function (filter, i) {
    analyzerArr[i].setInput(filter);
  })
}

// ============
// create filters
// ============
  
function createFilters(freqArr) {
  var filterArr = new Array(6);
  freqArr.forEach(function(freqRange, i) {
    var filter = new p5.BandPass();
    // FFT spectrum range: 10Hz - 22050Hz
    var filterFreq = map(1, 0, 1, freqRange[0], freqRange[1]);
    // set filter parameters
    filter.set(filterFreq);
    filter.res(10);
    filterArr[i] = filter;
  })
  return filterArr;
} 

// ============
// setup filters
// ============

function setUpProcessing(soundSource) {
  filterArr.forEach(function(filter) {
    filter.process(soundSource);
  });
}

// ============
// toggle input
// ============

function keyPressed() {
  if (key == 'T') {
    toggleInput();
  }
}


// start with mic as input
var inputMode = 5;


function toggleInput(mode) {
  if (typeof(mode) === 'number') {
    inputMode = mode;
  } else {
    inputMode += 1;
    inputMode = inputMode % 6;
  }
  switch (inputMode) {
    case 0: // soundFile mode
      soundFile.play();
      osc.stop();
      mic.stop();
      setUpProcessing(soundFile);
      setUpInput();
      currentSource = 'soundFile';
      break;
    case 1: // mic mode
      mic.start();
      soundFile.pause();
      setUpProcessing(mic);
      setUpInput();
      currentSource = 'mic';
      break;
    case 2: // sine mode
      osc.setType('sine');
      osc.start();
      soundFile.pause();
      mic.stop();
      setUpProcessing(osc);
      setUpInput();
      currentSource = 'sine';
      break;
    case 3: // square mode
      osc.setType('triangle');
      currentSource = 'triangle';
      break;
    case 4: // square mode
      osc.setType('square');
      currentSource = 'square';
      break;
    case 5: // square mode
      osc.setType('sawtooth');
      currentSource = 'sawtooth';
      break;
  }
}

