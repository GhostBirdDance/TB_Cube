(function() {

  var root = this;
  var previousResponder = root.Responder || {};

  var Ease = function(parent, value, dest) {

    this.value = value;
    this.dest = dest;

    parent.eases.push(this);

  };

  _.extend(Ease.prototype, {

    drag: 0.125,

    update: function() {

      this.value += (this.dest - this.value) * this.drag;
      return this;

    }

  });

  var Responder = root.Responder = function() {

    this.eases = [];

    var two = this.two = new Two({
      fullscreen: true,
      autostart: true
    });

    this.background = two.makeRectangle(two.width / 2, two.height / 2, two.width, two.height);
    this.background.noStroke();
    this.background.eases = {
      red: new Ease(this, 0, 255),
      green: new Ease(this, 150, 150),
      blue: new Ease(this, 255, 0)
    };

    this.two.bind('update', _.bind(this.update, this));

  };

  _.extend(Responder, {

    Resolution: 12,

    TimeDivisor: 5000

  });

  _.extend(Responder.prototype, {

    appendTo: function(elem) {
      this.two.appendTo(elem);
      return this;
    },

    respond: function(volumes, duration, callback) {

      this.background.eases.red.dest = 0;
      this.background.eases.green.dest = 150;
      this.background.eases.blue.dest = 255;

      var total = 0;
      for (var v in volumes) {
        total += volumes[v].volume;
      }

      var xpct = volumes.x.volume / total;
      var ypct = volumes.y.volume / total;
      var zpct = volumes.z.volume / total;

      var tp = volumes.x.peak + volumes.y.peak + volumes.z.peak;

      var two = this.two;

      var points = _.map(_.range(Math.floor(Responder.Resolution * duration / Responder.TimeDivisor)), function(i) {
        var x = xpct * 2 * (Math.random() - 0.5) * (two.width / 8 + two.width * total / 5000);
        var y = zpct * 2 * (Math.random() - 0.5) * (two.height / 8 + two.height * total / 5000);
        return new Two.Anchor(x, y);
      });

      TWEEN.removeAll();

      var path = new Two.Path(points);
      path.translation.set(two.width / 2, two.height / 2);
      path.noFill().stroke = 'white';
      path.linewidth = (two.width / 8) * total / 5000;
      path.cap = tp < 100 ? 'round' : 'butt';
      path.join = tp < 100 ? 'round' : 'miter';
      path.curved = tp < 100;
      // path.miter = tp < 100 ? 4 : 12;
      path.tweens = {
        i: new TWEEN.Tween(path),
        o: new TWEEN.Tween(path)
      };
      two.add(path);

      path.subdivide();

      path.beginning = 0;
      path.ending = 0;

      path.tweens.i.to({ ending: 1 }, duration)
        .easing(TWEEN.Easing.Sinusoidal.InOut);

      path.tweens.o.to({ beginning: 1 }, duration)
        .easing(TWEEN.Easing.Sinusoidal.InOut)
        .delay(duration / 8)
        .onComplete(_.bind(function() {
          this.background.eases.red.dest = 255;
          this.background.eases.green.dest = 150;
          this.background.eases.blue.dest = 0;
          path.visible = false;
          callback();
        }, this));

      path.tweens.i.start();
      path.tweens.o.start();

      return this;

    },

    update: function() {

      TWEEN.update();

      for (var i = 0; i < this.eases.length; i++) {
        this.eases[i].update();
      }

      this.background.fill = [
        'rgb(', Math.round(this.background.eases.red.value),
        ',', Math.round(this.background.eases.green.value),
        ',', Math.round(this.background.eases.blue.value),
        ')'
      ].join('');

      return this;

    },

    pause: function() {
      this.two.pause();
      return this;
    },

    play: function() {
      this.two.play();
      return this;
    }

  });

})();