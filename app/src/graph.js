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
      height: 100
    }).appendTo(this.domElement);

    this.domElement.appendChild(this.ul);

    _.extend(this.two.renderer.domElement.style, {
      border: '1px solid #ccc'
    });

    this.channels = {};

  };

  _.extend(Graph, {

    Length: 30,

    Scalar: 10

  });

  _.extend(Graph.prototype, Backbone.Events, {

    lag: 1000,

    listening: true,

    startTime: Date.now(),

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
      shape.listening = true;
      shape.volume = 0;
      shape.peak = 0;

      shape.li = document.createElement('li');
      this.ul.appendChild(shape.li);

      shape.translation.y = this.two.height / 2;
      this.two.add(shape);

      return this;

    },

    updateChannel: function(prop, value) {

      var shape = this.channels[prop];
      var vr = Math.round(value);
      var vra = Math.abs(vr);
      shape.volume += vra;
      shape.peak = Math.max(shape.peak, vra);

      for (var i = shape.vertices.length - 1; i >= 0; i--) {

        var v = shape.vertices[i];
        var p = shape.vertices[i - 1];

        if (!p) {

          v.y = vr;
          shape.li.textContent = prop + ': ' + vra;

          if (v.y === 0 && shape.listening) {
            if (!shape.startTime) {
              shape.startTime = Date.now();
            } else if (Date.now() - shape.startTime > this.lag) {
              shape.startTime = 0;
              shape.listening = false;
            }
          } else if (v.y !== 0 && shape.listening) {
            shape.startTime = Date.now();
          }

          continue;

        }

        v.y = p.y;

      }

      return this;

    },

    update: function(obj) {

      var isListening = false;

      for (var k in obj) {
        var v = obj[k];
        v *= Graph.Scalar;
        this.updateChannel(k, v);
        if (this.channels[k].listening) {
          isListening = true;
        }
      }

      if (isListening !== this.listening) {
        this.listening = isListening;
        if (this.listening) {
          this.trigger('listening');
        } else {
          var volumes = {};
          var duration = Date.now() - this.startTime;
          var total = 0;
          for (var c in this.channels) {
            volumes[c] = {
              volume: this.channels[c].volume,
              peak: this.channels[c].peak
            };
            total += volumes[c].volume;
          }
          if (total > 0) {
            this.trigger('responding', volumes, duration);
          } else {
            this.listen();
          }
        }
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
    },

    listen: function() {

      this.startTime = Date.now();

      for (var c in this.channels) {
        var channel = this.channels[c];
        channel.listening = true;
        channel.volume = 0;
        channel.peak = 0;
      }

      return this;

    }

  });

})();
