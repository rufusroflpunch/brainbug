var bf_state = {};

// Rest VM and interface to zero
var resetState = function() {
  bf_state = {
    pos: 0,
    loops: [],
    loopSkip: false,
    cmds: [],
    mem: new Array(30000),
    input: []
  };
  bf_state.mem.fill(0);
};

var arrayToString = function(array) {
  var str = "";
  $(array).each(function(i,c) { str += String.fromCharCode(c); });
  return str;
};


$("#bf-run").click(function() {
  resetState();

  var code = $( "#bf-code").val();
  bf_state.cmds = code.split('');

  var output = "";

  for (var i = 0; i < bf_state.cmds.length; i += 1) {
    switch(bf_state.cmds[i]) {
      case "[":
        bf_state.loops.push(i);
        if (bf_state.loopSkip == true) break;
        if (bf_state.mem[bf_state.pos] == 0) bf_state.loopSkip = true;
        // console.log("Begin loop.");
        break;
      case "]":
        var new_i = bf_state.loops.pop();
        if (bf_state.loopSkip == true) break;
        if (bf_state.mem[bf_state.pos] != 0) {
          i = new_i;
          bf_state.loops.push(new_i);
        }
        // console.log("End loop.");
        break;
      case ">":
        if (bf_state.loopSkip == true) break;
        bf_state.pos += 1;
        // console.log("Increment data pointer.");
        break;
      case "<":
        if (bf_state.loopSkip == true) break;
        bf_state.pos -= 1;
        // console.log("Decrement data pointer.");
        break;
      case "+":
        if (bf_state.loopSkip == true) break;
        bf_state.mem[bf_state.pos] += 1;
        // console.log("Increment value at data pointer.");
        break;
      case "-":
        if (bf_state.loopSkip == true) break;
        bf_state.mem[bf_state.pos] -= 1;
        // console.log("Decrement value at data pointer.");
        break;
      case ".":
        if (bf_state.loopSkip == true) break;
        var chr = String.fromCodePoint(bf_state.mem[bf_state.pos]);
        output += chr;
        // console.log(chr);
        // console.log("Output value at data pointer: " + bf_state.mem[bf_state.pos]);
        break;
      case ",":
        if (bf_state.loopSkip == true) break;
        if (bf_state.input.length == 0)
          bf_state.input = prompt("Enter input:").split('');
        if (bf_state.input == "" || bf_state.input == null) break;
        bf_state.mem[bf_state.pos] = bf_state.input.shift().codePointAt(0);
        // console.log("Accept one byte of input, store at data pointer.");
        break;
    }

    if (bf_state.loops.length == 0) bf_state.loopSkip = false;

    // Output to proper dif
    $("#bf-output").text(output);
  }

});
