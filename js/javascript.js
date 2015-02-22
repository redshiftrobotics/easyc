// uncomment to disable console debugging messages
/*
_console_log = console.log;
console.log = function(){void()};
*/
var motors;
var programString;

function getMotorConfig()
{
  motors = [];
  var motorConfigs = $("#motor-config").children(".command");

  for(i = 0; i < motorConfigs.length; i++)
  {
    var current = $(motorConfigs[i]);
    var motorId = i+1;
    var motorPort = parseInt(current.children(".motor-port")[0].value);
    var motorDaisychain = parseInt(current.children(".motor-daisychain")[0].value);
    var motorNumber = parseInt(current.children(".motor-number")[0].value);
    motors.push({
      motorId: motorId,
      port: motorPort,
      daisy: motorDaisychain,
      number: motorNumber
    });
  }
}

$("#clear").click(function() 
{
  $("#workbench .command").remove();
});

$("#compile").click(function() 
{
  getMotorConfig();
  parseProgram();
});

$("#tutorial").click(function() 
{
  introJs().start();
});

$("#robotc-download").click(function() 
{
  window.location = "http://www.robotc.net/files/ROBOTCforMINDSTORMS_362.exe";
});

function getMotorValues(id) {
	for (var i=0; i<motors.length;i++) {
		if (motors[i].motorId === id) {
			if (isNaN(motors[i].port)
			    || isNaN(motors[i].daisy)
			    || isNaN(motors[i].number))
			{
				alert("Motor " + id + " is used, but is not configured correctly!");
				return null;
			} 
			return motors[i];
		}
	}
}

function addSleep(time) 
{
  programString += "Sleep("+time*1000+");\n";
}

function addMotorSpeed(motorId, speed) 
{
  var motor = getMotorValues(motorId);
  programString += "Motors_SetSpeed(S"+motor.port+", "+motor.daisy+", "+motor.number+", "+speed+");\n";
}

function addMotorRotation(motorId, rotations, speed) 
{
  var motor = getMotorValues(motorId);
  programString += "Motors_MoveRotations(S"+motor.port+", "+motor.daisy+", "+motor.number+", "+rotations+", "+speed+");\n";
}

function addMoveServo(motorId, position) 
{
  var motor = getMotorValues(motorId);
  programString += "Servos_SetPosition(S"+motor.port+", "+motor.daisy+", "+motor.number+", "+position+");\n";
}

function validateValues(blockname, values) 
{
  if (blockname == "sleep") 
  {
    if (isNaN(values.sleep) || values.sleep < 0) 
    {
      alert("Command: "+blockname+" has an invalid sleep time (positive floats allowed)");
      return false;
    }
  }
  if (blockname=="motor-speed" || blockname=="motor-rotations" || blockname=="move-servo") 
  {
    if (isNaN(values.motorId) || values.motorId >= motors.length) 
    {
      alert("Command: "+blockname+" has an invalid motorId");
      return false;
    }
  }

  if (blockname=="motor-speed" || blockname=="motor-rotations") 
  {
    if (isNaN(values.speed) || values.speed < -100 || values.speed > 100) 
    {
      alert("Command: "+blockname+" has an invalid speed value (-100 through 100 integer allowed)");
      return false;
    }
  }
  if (blockname=="motor-rotations") 
  {
    if (isNaN(values.rotations)) 
    {
      alert("Command: "+blockname+" has an invalid rotation number (positive or negative floats allowed)");
      return false;
    }
  }
  if (blockname=="motor-servo") {
    if (isNaN(values.position) || values.position < 0 || values.position > 255) 
    {
      alert("Command: "+blockname+" has an invalid position number (0-256 integers allowed)");
      return false;
    }
  }
  return true;
}

function parseProgram() {
  programString = programheader;
  programString += "task main()\n{\n";
  
  var BuildSuccess = true;

  var elementList = $("#workbench").children();

  elementList.each(function() {
    var command = $(this);
    switch (command.attr("command-type")) {

      case "sleep":
	var sleepTime = parseFloat($(command).children(".sleep-value")[0].value);
	var values = {
	  sleep: sleepTime
	};
	if (validateValues("sleep",values)) {
	  addSleep(sleepTime);
	}
	else
	{
	  BuildSuccess = false;
	}
      break;

      case "motor-speed":
	var motorId = parseInt($(command).children(".motor-id")[0].value);
	var speed = parseInt($(command).children(".speed-value")[0].value);
	var values = {
	  motorId: motorId,
	  speed: speed
	};
	if (validateValues("motor-speed",values)) {
	  addMotorSpeed(motorId, speed);
	}
	else
	{
	  BuildSuccess = false;
	}
      break;

      case "motor-rotations":
	var motorId = parseInt($(command).children(".motor-id")[0].value);
	var speed = parseInt($(command).children(".speed-value")[0].value);
	var rotations = parseFloat($(command).children(".rotation-value")[0].value);
	var values = {
	  motorId: motorId,
	  speed: speed,
	  rotations: rotations
	};
	if (validateValues("motor-rotations", values)) {
	  addMotorRotation(motorId, rotations, speed);
	}
	else
	{
	  BuildSuccess = false;
	}
      break;

      case "move-servo":
	var motorId = parseInt($(command).children(".motor-id")[0].value);
	var position = parseInt($(command).children(".position-value")[0].value);
	var values = {
	  motorId: motorId,
	  position: position
	};
	if (validateValues("move-servo", values)) {
	  addMoveServo(motorId, position);
	}
	else
	{
	  BuildSuccess = false;
	}
      break;
	
	case "stop-all-motors":
		var str = "";
		str += "Servos_StopAll();\n";
		str += "Motors_StopAllMotors();\n";
		programString += str;
		break;
      default:
      break;
    }
  });
  
  programString += "}";

  //if there have been no build failures, draw the code to the screen
  if(BuildSuccess)
  {
    $("#program").text(programString);
    $("body, html").animate({scrollTop: $(".program-window").offset().top-45});
  }
}

var dragSrcEl = null;

function toolboxDragStart(e) 
{
  dragSrcEl = this;

  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
  return false;
}

function trashDrop(e) 
{
  if(dragSrcEl.parentNode.getAttribute('id') == "workbench")
  {
    $(this).removeClass("selected");
    dragSrcEl.remove();
  }
  if (e.stopPropagation) {
    e.stopPropagation(); // Stops some browsers from redirecting.
  }
  return false;
}

function trashDragOver(e) {
  if(dragSrcEl.parentNode.id == "workbench")
  {
    $(this).addClass("selected");
  }

  if (e.preventDefault) {
  e.preventDefault(); // Necessary. Allows us to drop.
  }

  e.dataTransfer.dropEffect = 'move'; // See the section on the DataTransfer object. 
  return false;
}

function trashDragLeave(e){
  $(this).removeClass('selected');
  return false;
}

function programDragStart(e) 
{
  //copies value attributes to the inner html so they can be read and copied
  $("input").each(function(index, data) 
  {
     var Value = $(this).val();
     $(this).attr("value", Value);
  });

  $("select").each(function(index, data) 
  {
     var Value = this.value;
     $(this).attr("value", Value);
  });

  dragSrcEl = this;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData('text/html', this.innerHTML);
  return false;
}

function programDrop(e)
{
  $(this).removeClass("selected");

  if (e.stopPropagation) 
  {
    e.stopPropagation(); // Stops some browsers from redirecting.
  }
  
    // Set the source column's HTML to the HTML of the column we dropped on.
  if(dragSrcEl != this && dragSrcEl.parentNode.id == "workbench")
  {
    $(document).unbind("keydown");
    $(this).css("background","#cccccc");
    $(dragSrcEl).css("background","#cccccc");

    dragSrcEl.innerHTML = this.innerHTML;
    this.innerHTML = e.dataTransfer.getData('text/html');
  }

  $("select").each(function(index, data) 
  {
     var Value = $(this).attr("value");
     this.value = Value;
  });
}

function programDragLeave(e)
{
  $(this).removeClass("selected");
}

function programDragOver(e) 
{
  if(dragSrcEl != this && dragSrcEl.parentNode.id == "workbench")
  {
    $(this).addClass("selected");
  }

  if (e.preventDefault) 
  {
    e.preventDefault(); // Necessary. Allows us to drop.
  }

  e.dataTransfer.dropEffect = "move";  // See the section on the DataTransfer object.

  return false;
}

function addDrop(e) {
	$(this).removeClass("selected");
	
	if (e.stopPropagation) {
		e.stopPropagation();
	}
	
	if(dragSrcEl.parentNode.getAttribute('id') == "toolbox")
	{
		var NewNode = dragSrcEl.cloneNode(true);
		var Parent = document.getElementById("workbench");
		Parent.insertBefore(NewNode, document.getElementById("add"));
		
		NewNode.addEventListener('dragstart', programDragStart, false);
		NewNode.addEventListener('dragover', programDragOver, false);
		NewNode.addEventListener('drop', programDrop, false);
		NewNode.addEventListener('dragleave', programDragLeave, false);
	}
	
	return false;
}

function addDragOver(e) 
{
  console.log("Start Item Drag");
  if(dragSrcEl.parentNode.getAttribute('id') == "toolbox")
  {
    $(this).addClass("selected");
  }

  if (e.preventDefault) 
  {
  e.preventDefault(); // Necessary. Allows us to drop.
  }
  //e.dataTransfer.dropEffect = 'move'; // See the section on the DataTransfer object. 
  return false;
}

function addDragLeave(e) {
  $(this).removeClass('selected');
  return false;
}

$("document").ready(function() 
{
  $("body").on("mouseover","#workbench .command", function(e) {
    var hoveredE = e.currentTarget;
    $(hoveredE).css("background","#aaaaaa");
    $(document).keydown(function(e) {
    console.log(e);
      if ((e.keyCode == "8" || e.keyCode == "46") && (e.target.nodeName != "INPUT"))
      {
	hoveredE.remove();
      }
    });
  });
  
  $("body").on("mouseleave","#workbench .command", function(e) {
    $(document).unbind("keydown");
    $(e.currentTarget).css("background","#cccccc");
  });


  var trashElement = document.getElementById("trash");
  var add = document.getElementById("add");
  var commandblocks = $('.command');

	// download the libraries
	requestLibrary("drivers/common");
	requestLibrary("I2C");
	requestLibrary("Servos");
	requestLibrary("Motors");
	
	trashElement.addEventListener('dragover', trashDragOver, false);
	trashElement.addEventListener('drop', trashDrop, false);
	trashElement.addEventListener('dragleave', trashDragLeave, false);
	
	add.addEventListener('dragover', addDragOver, false);
	add.addEventListener('drop', addDrop, false);
	add.addEventListener('dragleave', addDragLeave, false);
	
	for(var i = 0; i < commandblocks.length; i++) {
		commandblocks[i].addEventListener('dragstart', toolboxDragStart, false);
	}
	
	introJs().start();

});
