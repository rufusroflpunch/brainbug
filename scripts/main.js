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

// Execute the loaded instruction set all the way to instruction number finalInstruction.
var execute = function(finalInstruction) {
  var output = "";

  for (var i = 0; i < finalInstruction; i += 1) {
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
    };
  };

    if (bf_state.loops.length == 0) bf_state.loopSkip = false;

    // Output to proper dif
    $("#bf-output").text(output);
  
};

$("#bf-run").click(function() {
  resetState();

  var code = $( "#bf-code").val();
  bf_state.cmds = code.split('');

  execute(bf_state.cmds.length);

});

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
  new_code = new_code.replace(/([^\.\+-\[\]\,\<\>\w])\n/g, '$1');
  $('#bf-code').val(new_code);
});
