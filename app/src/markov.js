
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
    exits.push({state: state, probability: probability});
  }

  node.weight = opt.weight || 1.0;
  node.nextState = nextState;
  node.addExit = addExit;
  node.name = name;

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

var state = awesome;

for (var i = 0; i < 50; i += 1) {
  state = state.nextState();
  console.log("State: " + state.name);
}


