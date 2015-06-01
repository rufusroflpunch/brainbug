var bf_state = {};

// Rest VM and interface to zero
var resetState = function() {
  bf_state = {
  pos: 0,                             // The memory position of the pointer
  loops: [],                          // The queue used to store the open positions of a loop
  loopSkip: false,                    // Are we skipping the inner portion of a loop?
  cmds: [],                           // The complete program stored as a character array
  mem: new Array(30000),              // Memory array
  input: [],                          // Character input stream
  debugCP: 0                          // Debug code pointer. Debugging can pause in the middle of execution, so the
                                      // code pointer is stored in the state to allow Debug to be continued
  };
  bf_state.mem.fill(0);               // Make sure the memory is completely ZERO'd out

  $("#bf-output").text("");           // Execute interface resets
  $("#bf-debug-pos").text("");
  $("#bf-debug-input").text("");
  $("#bf-debug-output").text("");
  $("#bf-debug-pointerval").text("");
  $("#bf-debug-memval").text("");
};

// Execute the loaded instruction set all the way to instruction number finalInstruction.
var execute = function(finalInstruction, debug) {
  var output = "";
  var i = 0;
  if (debug)
    i = bf_state.debugCP;

  for (; i < finalInstruction; i += 1) {
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
      case "*":
        if (debug) {
          bf_state.debugCP = i+1;
          $("#bf-debug-pos").text(i);
          $("#bf-debug-input").text(bf_state.input.join(''));
          $("#bf-debug-output").text(output);
          $("#bf-debug-pointerval").text(bf_state.mem[bf_state.pos]);
          return;
        }
        break;
    };
  };

    if (bf_state.loops.length == 0) bf_state.loopSkip = false;

    // Output to proper dif
    $("#bf-output").text(output);
  
};

// Standard code execution
$("#bf-run").click(function() {
  resetState();

  var code = $( "#bf-code").val();
  bf_state.cmds = code.split('');

  execute(bf_state.cmds.length, false);

});

// Initiate debug mode
$("#bf-debug").click(function () {
  resetState();

  var code = $("#bf-code").val();
  bf_state.cmds = code.split('');

  execute(bf_state.cmds.length, true)
});

// Continue debugging after a breakpoint
$("#bf-continue").click(function() {
  execute(bf_state.cmds.length, true);
});

$("#bf-reset").click(function () {
  resetState();
});

// Peek into memory location
$("#bf-debug-peek").click(function () {
  var memval = bf_state.mem[$("#bf-debug-memloc").val()];
  $("#bf-debug-memval").text(memval + "(" + String.fromCharCode(memval) + ")");
});

// Beautify the code
$("#bf-beautify").click(function() {
  var code = $("#bf-code").val();
  code = code.split('');

  var new_code = "";
  var last_char = "";
  var indent_lev = 0;
  $(code).each(function (i,c) {
    if (c == last_char) {
      new_code += c;
    }
    else if (c == "[") {
      new_code += "\n" + "\t".repeat(indent_lev) + "[";
      indent_lev += 1;
    }
    else if (c == "]"){
      indent_lev -= 1;
      new_code += "\n" + "\t".repeat(indent_lev) + "]";
    }
    else if (c.match(/[\.\+\-\[\]\,\<\>]/)){
      new_code += "\n" + "\t".repeat(indent_lev) + c;
    }
    else {
      new_code += c;
    }

    last_char = c;
  });

  new_code = new_code.trim(); // Remove unnecessary whitespace
  new_code = new_code.replace(/([^\.\+-\[\]\,\<\>\w])\n/g, '$1'); // Combine all lines that have only one thing
  $('#bf-code').val(new_code);
});
