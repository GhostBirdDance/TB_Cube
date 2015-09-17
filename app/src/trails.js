(function() {

  var root = this;
  var previousTrails = root.Trails || {};

  var Trails = root.Trails = function(c1, c2) {

    this.mesh = new THREE.Mesh(Trails.Geometry, Trails.Material.clone());

    if (c1) {
      this.mesh.material.uniforms.foreground.value.copy(c1);
    }

    if (c2) {
      this.mesh.material.uniforms.foreground.value.copy(c2);
    }

  };

  Trails.Shader = {

    uniforms: {
      iGlobalTime: { type: 'f', value: 0 },
      spread: { type: 'f', value: 10 },
      foreground: { type: 'v4', value: new THREE.Vector4(50, 150, 255, 1) },
      background: { type: 'v4', value: new THREE.Vector4(255, 255, 255, 0) }
    },

    vertex: [

      'varying vec2 vUv;',

      'void main() {',
        'vUv = uv;',
        'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
      '}'

    ].join('\n'),

    fragment: [

      'uniform float iGlobalTime;',
      'uniform vec4 foreground;',
      'uniform vec4 background;',
      'uniform float spread;',

      'varying vec2 vUv;',

      'vec3 mod289(vec3 x) {',
        'return x - floor(x * (1.0 / 289.0)) * 289.0;',
      '}',

      'vec4 mod289(vec4 x) {',
        'return x - floor(x * (1.0 / 289.0)) * 289.0;',
      '}',

      'vec4 permute(vec4 x) {',
        'return mod289(((x*34.0)+1.0)*x);',
      '}',

      'vec4 taylorInvSqrt(vec4 r) {',
        'return 1.79284291400159 - 0.85373472095314 * r;',
      '}',

      'float snoise(vec3 v) { ',
        'const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;',
        'const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);',

        '// First corner',
        'vec3 i  = floor(v + dot(v, C.yyy) );',
        'vec3 x0 =   v - i + dot(i, C.xxx) ;',

        '// Other corners',
        'vec3 g = step(x0.yzx, x0.xyz);',
        'vec3 l = 1.0 - g;',
        'vec3 i1 = min( g.xyz, l.zxy );',
        'vec3 i2 = max( g.xyz, l.zxy );',

        '   x0 = x0 - 0.0 + 0.0 * C.xxx;',
        'vec3   x1 = x0 - i1  + 1.0 * C.xxx;',
        'vec3   x2 = x0 - i2  + 2.0 * C.xxx;',
        'vec3   x3 = x0 - 1.0 + 3.0 * C.xxx;',

        'x1 = x0 - i1 + C.xxx;',
        'x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y',
        'x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y',

        '// Permutations',
        'i = mod289(i); ',
        'vec4 p = permute( permute( permute( ',
                   'i.z + vec4(0.0, i1.z, i2.z, 1.0 ))',
                 '+ i.y + vec4(0.0, i1.y, i2.y, 1.0 )) ',
                 '+ i.x + vec4(0.0, i1.x, i2.x, 1.0 ));',

        '// Gradients: 7x7 points over a square, mapped onto an octahedron.',
        '// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)',
        'float n_ = 0.142857142857; // 1.0/7.0',
        'vec3  ns = n_ * D.wyz - D.xzx;',

        'vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)',

        'vec4 x_ = floor(j * ns.z);',
        'vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)',

        'vec4 x = x_ *ns.x + ns.yyyy;',
        'vec4 y = y_ *ns.x + ns.yyyy;',
        'vec4 h = 1.0 - abs(x) - abs(y);',

        'vec4 b0 = vec4( x.xy, y.xy );',
        'vec4 b1 = vec4( x.zw, y.zw );',

        '//vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;',
        '//vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;',
        'vec4 s0 = floor(b0)*2.0 + 1.0;',
        'vec4 s1 = floor(b1)*2.0 + 1.0;',
        'vec4 sh = -step(h, vec4(0.0));',

        'vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;',
        'vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;',

        'vec3 p0 = vec3(a0.xy,h.x);',
        'vec3 p1 = vec3(a0.zw,h.y);',
        'vec3 p2 = vec3(a1.xy,h.z);',
        'vec3 p3 = vec3(a1.zw,h.w);',

        '//Normalise gradients',
        'vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));',
        'p0 *= norm.x;',
        'p1 *= norm.y;',
        'p2 *= norm.z;',
        'p3 *= norm.w;',

        '// Mix final noise value',
        'vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);',
        'm = m * m;',
        'return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), ',
                                      'dot(p2,x2), dot(p3,x3) ) );',
      '}',

      '/**',
      ' * Convert rgb 0 - 255 floats to vec3 component.',
      ' */',
      'vec3 rgb(float r, float g, float b) {',
        'return vec3( r / 255.0, g / 255.0, b / 255.0 );',
      '}',

      'void main() {',

        'vec2 uv = vUv;',
        // 'vec2 uv = vec2( fragCoord.x / iResolution.x, fragCoord.y / iResolution.y );',
        'float time = iGlobalTime + 2048.0;  // Offset so that iGlobalTime is in the same order of magnitude...',

        '// Parameters',
        'float scale = 512.0;',
        'float falloff = 64.0;',
        'float speed = 0.85;',
        // 'float spread = 10.0;',

        'vec3 field = time * vec3( uv.x, uv.y, 0.0 ) / scale;',
        'vec3 movement = vec3(',
        '    spread, // * iMouse.x / iResolution.x, // X Position',
        '    spread, // * iMouse.y / iResolution.y, // Y Position',
        '    speed * time                // Ebb of water',
        ');',
        'float t = clamp( falloff * snoise( field + movement ), 0.0, 1.0 );',

        '// Colors',
        'vec4 a = vec4( rgb( foreground.x, foreground.y, foreground.z ), foreground.w );',
        'vec4 b = vec4( rgb( background.x, background.y, background.z ), background.w );',

        'gl_FragColor = vec4( mix( a, b, t ) );',

      '}'

    ].join('\n')

  };

  Trails.Material = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(Trails.Shader.uniforms),
    vertexShader: Trails.Shader.vertex,
    fragmentShader: Trails.Shader.fragment,
    transparent: true,
    // side: THREE.BackSide
  });
  Trails.Geometry = new THREE.SphereBufferGeometry(1, 25, 25);

  Trails.prototype = {

    startTime: Date.now(),

    divisor: 1000,

    addTo: function(group) {
      group.add(this.mesh);
      return this;
    },

    update: function(t) {

      this.mesh.material.uniforms.iGlobalTime.value = (t - this.startTime) / this.divisor;

      return this;

    }

  };

})();