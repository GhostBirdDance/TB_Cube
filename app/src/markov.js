
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

  function nextState() {
    var possibilities = exits.reduce(function (a, b) {
          return (b.probability * b.state.weight) + a;
        }, 0),
        value = Math.random() * possibilities,
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
      console.log("reusing exit ", state.name);
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
  node.nextState = nextState;
  node.addExit = addExit;
  node.name = name;
  node.stateProbability = stateProbability;

  return node;
}

var awesome = createNode("Awesome");
var good = createNode("Good");
var okay = createNode("Okay");
var decent = createNode("Decent");
var whatever = createNode("Whatever");

awesome.addExit(awesome, 0.5);
awesome.addExit(good, 1.0);
awesome.addExit(okay, 0.5);

good.addExit(good, 0.5);
good.addExit(awesome, 1.0);
good.addExit(decent, 0.5);

decent.addExit(decent, 0.5);
decent.addExit(awesome, 1.0);
decent.addExit(whatever, 0.2);

okay.addExit(okay, 0.2);
okay.addExit(whatever, 1.0);

whatever.addExit(whatever, 0.5);
whatever.addExit(decent, 1.0);
whatever.addExit(okay, 0.5);
whatever.addExit(okay, 1.0);

var state = awesome;

for (var i = 0; i < 50; i += 1) {
  state = state.nextState();
  console.log("State: " + state.name);
}
