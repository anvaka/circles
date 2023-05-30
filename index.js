/* globals queryState */

// We try to restore spiral definition from query string first
var qs = queryState({}, {
  useSearch: true
});
var appState = qs.get();

// Spirograph is defined as a collection of nested circles.
var spiralDefinition = getFromQuery() || {
  // Radius of this spiral, relative to the parent radius.
  radiusRatio: 1,
  color: '#B8AD83',
  children: [{
    // color of the spiral
    color: '#B8AD83',
    // Radius relative to parent circle
    radiusRatio: 0.52,
    // where is the hole for a pen relative the radius of this circle
    holeRadius: 0.15,
    // Where is the hole located inside this circle
    initialAngle: 2.1,
  }, {
    // color of the spiral
    color: '#ADADAD',
    // Radius relative to parent circle
    radiusRatio: 0.15,
    // where is the hole for a pen relative the radius of this circle
    holeRadius: 0.53,
    // Where is the hole located inside this circle
    initialAngle: .1,
  }] 
}

// Indicates whether we should draw circles instead of trajectories.
var drawCircles = false;

// How fast should we move with each frame.
var alphaStep = Math.PI/30;
//if (drawCircles) alphaStep *= 0.01;

var scene = document.getElementById('scene');
var width = scene.width = Math.min(480, window.innerWidth);
var height = scene.height = Math.min(480, width);

var ctx = scene.getContext('2d');
ctx.lineWidth = window.devicePixelRatio;
var isPlaying = true;

document.getElementById('btn-randomize').addEventListener('click', randomize);
scene.addEventListener('click', togglePlaying);

clear();

// Radius of the outer circle
var r = 10;
// Size of the scene
var size = r * 1.2;

var alpha = 0;

var raf = requestAnimationFrame(frame);

function frame() {
  raf = requestAnimationFrame(frame);
  if (drawCircles) {
    clear()
  }

  alpha += alphaStep; 
  drawSpiral(spiralDefinition, 0, 0, alpha, r);
}

function drawSpiral(spiral, cx, cy, alpha, parentR) {
  var radius = spiral.radiusRatio * parentR;
  alpha += (spiral.initialAngle || 0);
  if (!spiral.children || spiral.children.length === 0) {
    var x1 = cx + Math.cos(alpha) * radius * spiral.holeRadius;
    var y1 = cy + Math.sin(alpha) * radius * spiral.holeRadius;

    if(drawCircles) {
      circle(cx, cy, radius, spiral.color || '#550000');
      line(cx, cy, x1, y1, spiral.color || '#550000');
    }

    if (spiral.ppx === undefined) {
      // this is our first point. Could be used to check when to stop
      spiral.startX = x1;
      spiral.startY = y1;
    } else {
      line(spiral.ppx, spiral.ppy, x1, y1, spiral.color || '#003399');
    }
    spiral.ppx = x1;
    spiral.ppy = y1;
    return;
  }

  for (var i = 0; i < spiral.children.length; ++i) {
    var child = spiral.children[i];
    var childRadius = child.radiusRatio * radius;
    var childCenter = radius - childRadius;
    var x = cx + Math.cos(alpha) * childCenter;
    var y = cy + Math.sin(alpha) * childCenter;
    if (drawCircles) {
      circle(cx, cy, radius, spiral.color || '#0033aa'); 
      line(cx, cy, x, y, spiral.color || '#003399');
    }

    var childAlpha = -alpha * radius/childRadius;
    drawSpiral(child, x, y, childAlpha, radius);
  }
}

function circle(cx, cy, radius, color) {
  ctx.beginPath();

  ctx.strokeStyle = color;
  var sx = transformX(cx);
  var sy = transformY(cy);
  ctx.arc(sx, sy,
          0.5*width * radius/size,
          0, 
          2*Math.PI);
  ctx.stroke();
}

function line(x1, y1, x2, y2, color) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  x1 = transformX(x1);
  y1 = transformY(y1);
  x2 = transformX(x2);
  y2 = transformY(y2);
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function clear() {
  ctx.fillStyle = '#2A231E'
  ctx.fillRect(0, 0, width, height);
}

function transformX(x) {
  return Math.round(width * x/(2.*size) + width/2);
}

function transformY(y) {
  return Math.round(height * y/(2.*size) + height/2);
}

function togglePlaying() {
  if (isPlaying) {
    window.cancelAnimationFrame(raf);
    raf = 0;
  } else {
    if (!raf) {
      raf = window.requestAnimationFrame(frame)
    }
  }
  isPlaying = !isPlaying;
  var pauseMonitor = document.querySelector('.pause-monitor');

  if (!pauseMonitor.classList.contains('playing')) {
    pauseMonitor.classList.add('playing');
    setTimeout(removePlaying, 600);
  }
  var pausedBtn = document.querySelector('.paused');
  var notPausedBtn = document.querySelector('.not-paused');
  if (isPlaying) {
    pausedBtn.classList.remove('active');
    notPausedBtn.classList.add('active');
  } else {
    notPausedBtn.classList.remove('active');
    pausedBtn.classList.add('active');
  }

  function removePlaying() {
    pauseMonitor.classList.remove('playing');
  }
}

function randomize(e){
  e.preventDefault();
  clear()
  if (!isPlaying) togglePlaying();

  var children = [];
  children.push(randomSpiral())
  if (Math.random() < 0.5) {
    children.push(randomSpiral())
  }
  if (Math.random() < 0.15) {
    children.push(randomSpiral())
  }
  
  spiralDefinition = {
    radiusRatio: 1,
    color: 'white',
    children: children
  };
  qs.set('s', JSON.stringify(spiralDefinition));
}

function randomSpiral() {
  var spiral = {
    color: Math.random() < 0.5 ? '#B8AD83' : 'white',
    radiusRatio: (Math.round(Math.random() * 42)/42),
    holeRadius: Math.random() * 0.8+ 0.2,
    initialAngle: Math.random() * 2 * Math.PI 
  }
  return spiral
}

function getFromQuery() {
  if (!appState.s) return;

  try {
    return JSON.parse(appState.s)
  } catch(e) {
    // We failed to restore it from the query string. Sad. Normally we would log it
    // and notify a visitor about the error. But in case of this website - we just
    // ignore it. Feel free to send me a PR for a better UX.
  }
}