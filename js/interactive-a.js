(function () {
  "use strict";

  var canvas = document.getElementById("heroA");
  var hero = document.querySelector(".hero");
  var cursor = document.getElementById("heroACursor");
  if (!canvas || !hero) return;

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
  });
  if (!gl || reduce) {
    canvas.hidden = true;
    if (cursor) cursor.hidden = true;
    return;
  }

  var vertexSource = [
    "precision highp float;",
    "attribute vec2 aBase;",
    "attribute float aSeed;",
    "attribute float aSize;",
    "attribute float aLayer;",
    "uniform vec2 uResolution;",
    "uniform vec2 uPointer;",
    "uniform float uTime;",
    "uniform float uDpr;",
    "uniform float uActive;",
    "varying float vSeed;",
    "varying float vPulse;",
    "varying float vLayer;",
    "float wave(float value, float seed) {",
    "  return sin(value + seed * 6.28318530718);",
    "}",
    "void main() {",
    "  vec2 pos = aBase;",
    "  float parallax = mix(0.88, 1.18, aLayer);",
    "  vec2 pointer = uPointer * parallax;",
    "  float dist = distance(pos, pointer);",
    "  float radius = mix(0.30, 0.52, aLayer);",
    "  float influence = smoothstep(radius, 0.0, dist) * uActive;",
    "  vec2 dir = normalize(pos - pointer + vec2(0.0001));",
    "  float drift = wave(uTime * mix(0.45, 1.15, aLayer) + pos.x * 2.2 + pos.y * 1.8, aSeed);",
    "  float shimmer = wave(uTime * 1.9 + aSeed * 23.0 + aLayer * 4.0, aSeed);",
    "  pos += dir * influence * (0.15 + 0.16 * aLayer + 0.05 * shimmer);",
    "  pos.x += wave(uTime * 0.38 + pos.y * 2.8, aSeed) * mix(0.004, 0.016, aLayer);",
    "  pos.y += drift * mix(0.004, 0.018, aLayer);",
    "  pos *= 1.0 + aLayer * 0.035 * sin(uTime * 0.34 + aSeed * 8.0);",
    "  float aspect = uResolution.x / uResolution.y;",
    "  gl_Position = vec4(pos.x / aspect, pos.y, 0.0, 1.0);",
    "  gl_PointSize = (aSize + influence * 10.0 + shimmer * 1.6) * uDpr;",
    "  vSeed = aSeed;",
    "  vPulse = influence;",
    "  vLayer = aLayer;",
    "}"
  ].join("\n");

  var fragmentSource = [
    "precision highp float;",
    "varying float vSeed;",
    "varying float vPulse;",
    "varying float vLayer;",
    "void main() {",
    "  vec2 p = gl_PointCoord - 0.5;",
    "  float d = length(p);",
    "  float particle = smoothstep(0.5, 0.07, d);",
    "  float core = smoothstep(0.19, 0.01, d);",
    "  vec3 aqua = vec3(0.00, 0.79, 0.70);",   // brand teal #00cab2
    "  vec3 ice = vec3(0.68, 0.73, 0.96);",    // periwinkle #aebaf4
    "  vec3 sun = vec3(0.94, 0.00, 0.78);",    // brand magenta #f000c6
    "  vec3 deep = vec3(0.33, 0.43, 0.98);",   // brand blue #536dfa
    "  vec3 color = mix(deep, aqua, vLayer);",
    "  color = mix(color, ice, fract(vSeed * 9.73) * 0.58);",
    "  color = mix(color, sun, vPulse * 0.72);",
    "  color += core * vec3(0.30, 0.42, 0.72);",
    "  float alpha = particle * mix(0.22, 0.80, vLayer) * (0.72 + vPulse * 0.42);",
    "  gl_FragColor = vec4(color, alpha);",
    "}"
  ].join("\n");

  function shader(type, source) {
    var s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s));
    }
    return s;
  }

  function program(vertex, fragment) {
    var p = gl.createProgram();
    gl.attachShader(p, shader(gl.VERTEX_SHADER, vertex));
    gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(p));
    }
    return p;
  }

  var prog = program(vertexSource, fragmentSource);
  var loc = {
    base: gl.getAttribLocation(prog, "aBase"),
    seed: gl.getAttribLocation(prog, "aSeed"),
    size: gl.getAttribLocation(prog, "aSize"),
    layer: gl.getAttribLocation(prog, "aLayer"),
    resolution: gl.getUniformLocation(prog, "uResolution"),
    pointer: gl.getUniformLocation(prog, "uPointer"),
    time: gl.getUniformLocation(prog, "uTime"),
    dpr: gl.getUniformLocation(prog, "uDpr"),
    active: gl.getUniformLocation(prog, "uActive")
  };

  var buffers = {
    base: gl.createBuffer(),
    seed: gl.createBuffer(),
    size: gl.createBuffer(),
    layer: gl.createBuffer()
  };
  var state = {
    dpr: 1,
    width: 1,
    height: 1,
    count: 0,
    pointer: { x: 0.34, y: 0.06 },
    smooth: { x: 0.34, y: 0.06 },
    active: 0
  };

  function pushParticle(data, x, y, seed, size, layer) {
    data.base.push(x, y);
    data.seed.push(seed);
    data.size.push(size);
    data.layer.push(layer);
  }

  function buildParticles() {
    var side = 900;          // offscreen height (px)
    var width = 1500;        // offscreen width (px) — wide enough for "AI"
    var off = document.createElement("canvas");
    off.width = width;
    off.height = side;
    var ctx = off.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "800 680px Arial, Helvetica, sans-serif";
    ctx.fillText("AI", width / 2, side / 2 + 46);

    var pixels = ctx.getImageData(0, 0, width, side).data;
    var data = { base: [], seed: [], size: [], layer: [] };
    var narrow = window.innerWidth < 760;
    var step = narrow ? 8 : 6;
    var xOffset = narrow ? 0.04 : 0.46;
    var xScale = narrow ? 1.02 : 1.30;
    var yScale = narrow ? 1.38 : 1.60;

    for (var y = 0; y < side; y += step) {
      for (var x = 0; x < width; x += step) {
        var alpha = pixels[(y * width + x) * 4 + 3];
        if (alpha < 42 || Math.random() > 0.76) continue;
        var nx = ((x - width / 2) / side) * xScale + xOffset;
        var ny = (0.5 - y / side) * yScale + 0.02;
        var layer = 0.58 + Math.random() * 0.42;
        pushParticle(
          data,
          nx + (Math.random() - 0.5) * 0.006,
          ny + (Math.random() - 0.5) * 0.006,
          Math.random(),
          1.8 + Math.random() * 4.8 + alpha / 255,
          layer
        );
      }
    }

    for (var i = 0; i < 620; i++) {
      var angle = Math.random() * Math.PI * 2;
      var radius = Math.pow(Math.random(), 0.56) * 1.2;
      pushParticle(
        data,
        xOffset + Math.cos(angle) * radius,
        0.02 + Math.sin(angle) * radius * 0.78,
        Math.random(),
        0.8 + Math.random() * 2.4,
        Math.random() * 0.42
      );
    }

    state.count = data.seed.length;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.base);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.base), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.seed);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.seed), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.size);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.size), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.layer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.layer), gl.STATIC_DRAW);
  }

  function resize() {
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    var rect = hero.getBoundingClientRect();
    state.width = Math.max(1, Math.floor(rect.width * state.dpr));
    state.height = Math.max(1, Math.floor(rect.height * state.dpr));
    canvas.width = state.width;
    canvas.height = state.height;
    gl.viewport(0, 0, state.width, state.height);
  }

  function updatePointer(clientX, clientY) {
    var rect = hero.getBoundingClientRect();
    var aspect = rect.width / rect.height;
    state.pointer.x = ((clientX - rect.left) / rect.width * 2 - 1) * aspect;
    state.pointer.y = 1 - ((clientY - rect.top) / rect.height) * 2;
    state.active = 1;
    if (cursor) {
      cursor.style.transform = "translate(" + clientX + "px, " + clientY + "px)";
      cursor.style.opacity = "1";
    }
  }

  hero.addEventListener("pointermove", function (event) {
    updatePointer(event.clientX, event.clientY);
  });
  hero.addEventListener("pointerdown", function (event) {
    updatePointer(event.clientX, event.clientY);
  });
  hero.addEventListener("pointerleave", function () {
    state.active = 0;
    if (cursor) cursor.style.opacity = "0";
  });
  window.addEventListener("resize", function () {
    resize();
    buildParticles();
  });

  function bind(buffer, location, size) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
  }

  buildParticles();
  resize();
  gl.useProgram(prog);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

  function render(now) {
    var time = now * 0.001;
    var idleX = 0.40 + Math.cos(time * 0.31) * 0.26;
    var idleY = 0.03 + Math.sin(time * 0.37) * 0.18;
    var targetX = state.active ? state.pointer.x : idleX;
    var targetY = state.active ? state.pointer.y : idleY;
    state.smooth.x += (targetX - state.smooth.x) * 0.07;
    state.smooth.y += (targetY - state.smooth.y) * 0.07;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(loc.resolution, state.width, state.height);
    gl.uniform2f(loc.pointer, state.smooth.x, state.smooth.y);
    gl.uniform1f(loc.time, time);
    gl.uniform1f(loc.dpr, state.dpr);
    gl.uniform1f(loc.active, state.active ? 1 : 0.68);

    bind(buffers.base, loc.base, 2);
    bind(buffers.seed, loc.seed, 1);
    bind(buffers.size, loc.size, 1);
    bind(buffers.layer, loc.layer, 1);
    gl.drawArrays(gl.POINTS, 0, state.count);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
