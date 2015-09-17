var markov = (function()
{
  var obj = {};
  ///
  /// Creates a node in a markov chain.
  ///
  function createNode(opt) {
    if (typeof(opt) === "string") {
      opt = {name: opt};
    }
    else {
      opt = opt || {};
    }

    var node = {},
        exits = [],
        exit_mapping = {},
        name = opt.name || "Unnamed";

    /// Returns
    function findExit(value) {
      var possibilities = exits.reduce(function (a, b) {
            return (b.probability * b.state.weight) + a;
          }, 0),
          value = value * possibilities,
          state;
      if (exits.length === 0) {
        return node;
      }
      exits.every(function (exit) {
        value -= exit.probability * exit.state.weight;
        if (value <= 0.0) {
          state = exit.state;
          return false;
        }
        return true;
      });

      return state;
    }

    function addExit(state, probability) {
      if (exit_mapping.hasOwnProperty(state.name)) {
        exit_mapping[state.name].probability = probability;
      }
      else {
        var pair = {state: state, probability: probability};
        exits.push(pair);
        exit_mapping[state.name] = pair;
      }
    }

    function stateProbability(state) {
      if (! exit_mapping.hasOwnProperty(state.name)) {
        return 0;
      }
      return exit_mapping[state.name].probability * state.weight;
    }

    node.weight = opt.weight || 1.0;
    node.findExit = findExit;
    node.randomExit = function () { return findExit(Math.random()); }
    node.addExit = addExit;
    node.name = name;
    node.stateProbability = stateProbability;

    return node;
  }

  obj.createNode = createNode;
  return obj;
}());