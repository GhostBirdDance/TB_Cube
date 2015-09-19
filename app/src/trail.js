(function() {

  var Trail = THREE.Trail = function(spline) {

    var geometry = new THREE.TubeGeometry(spline);
    var material = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(Trail.Shader.uniforms),
      vertexShader: Trail.Shader.vertexShader,
      fragmentShader: Trail.Shader.fragmentShader
    });

    THREE.Mesh.call(this, geometry, material);

  };

  Trail.Shader = {
    uniforms: {
      t: { type: 'f', value: 0.5 }
    },
    vertexShader: [

    ].join('\n'),
    fragmentShader: [

    ].join('\n')
  };

  Trail.prototype = Object.extend(THREE.Mesh.prototype);

})();