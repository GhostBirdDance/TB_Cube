(function() {

  var root = this;
  var previousGraph = root.Graph || {};

  var Graph = root.Graph = function() {

    this.domElement = document.createElement('div');
    this.domElement.classList.add('graph');

    this.ul = document.createElement('ul');

    this.two = new Two({
      type: Two.Types.canvas,
      width: 200,
      height: 100,
      autostart: true
    }).appendTo(this.domElement);

    this.domElement.appendChild(this.ul);

    _.extend(this.two.renderer.domElement.style, {
      border: '1px solid #ccc'
    });

    this.channels = {};

  };

  _.extend(Graph, {

    Length: 30

  });

  _.extend(Graph.prototype, {

    appendTo: function(domElement) {
      domElement.appendChild(this.domElement);
      return this;
    },

    addChannel: function(prop, color) {

      var points = _.map(_.range(Graph.Length), function(i) {
        var pct = i / (Graph.Length - 1);
        return new Two.Anchor(pct * this.two.width, 0);
      }, this);
      var shape = this.channels[prop] = new Two.Path(points);
      shape.noFill().stroke = color;
      shape.linewidth = 2;
      shape.opacity = 0.66;

      shape.li = document.createElement('li');
      this.ul.appendChild(shape.li);

      shape.translation.y = this.two.height / 2;
      this.two.add(shape);

      return this;

    },

    updateChannel: function(prop, value) {

      var shape = this.channels[prop];

      for (var i = shape.vertices.length - 1; i >= 0; i--) {

        var v = shape.vertices[i];
        var p = shape.vertices[i - 1];

        v.y = !p ? value : p.y;
        shape.li.textContent = prop + ': ' + Math.round(v.y);

      }

      return this;

    },

    start: function() {
      this.two.play();
      return this;
    },

    pause: function() {
      this.two.pause();
      return this;
    }

  });

})();
