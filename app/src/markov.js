var markov = (function()
{
  var obj = {};
  ///
  /// Creates a node in a markov chain.
  ///
  function makeNode(name, object) {
    var node = object || {},
        exits = [],
        exit_mapping = {},
        name = name || "Unnamed";

    /// Returns
    function findExit(value) {
      var possibilities = exits.reduce(function (a, b) {
            return (b.probability * b.state.markov.weight) + a;
          }, 0),
          value = value * possibilities,
          state;
      exits.every(function (exit) {
        value -= exit.probability * exit.state.markov.weight;
        if (value <= 0.0) {
          state = exit.state;
          return false;
        }
        return true;
      });

      return state;
    }

    function addExit(state, probability) {
      if (exit_mapping.hasOwnProperty(state.markov.name)) {
        exit_mapping[state.markov.name].probability = probability;
      }
      else {
        var pair = {state: state, probability: probability};
        exits.push(pair);
        exit_mapping[state.markov.name] = pair;
      }
    }

    function findExitProbability(state) {
      if (! exit_mapping.hasOwnProperty(state.markov.name)) {
        return 0;
      }
      return exit_mapping[state.markov.name].probability * state.markov.weight;
    }

    var markov_properties = { weight: 1.0 };
    Object.defineProperty(markov_properties, "name", {value: name, writable: false});
    node.markov = markov_properties;
    node.findExit = findExit;
    node.randomExit = function () { return findExit(Math.random()); }
    node.addExit = addExit;
    node.findExitProbability = findExitProbability;

    addExit(node, 0);

    return node;
  }

  obj.makeNode = makeNode;
  return obj;
}());