// uncomment to disable console debugging messages
/*
_console_log = console.log;
console.log = function(){void()};
*/

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

$("#compile").click(function() {
  getMotorConfig();
  parseProgram();
});

function getMotorValues(id) {
  for (var i=0; i<motors.length;i++) {
    if (motors[i].motorId === id) {
      if (isNaN(motors[i].port) || isNaN(motors[i].daisy) || isNaN(motors[i].number)) {
        alert("Motor "+id+" is used, but is not configured correctly!");
        return null;
      } 
      return motors[i];
    }
  }
}

function addSleep(time) 
{
  programString += "Sleep("+time*1000+");";
}

function addMotorSpeed(motorId, speed) 
{
  var motor = getMotorValues(motorId);
  programString += "Motors_SetSpeed(S"+motor.port+", "+motor.daisy+", "+motor.number+", "+speed+");";
}

function addMotorRotation(motorId, rotations, speed) 
{
  var motor = getMotorValues(motorId);
  programString += "Motors_MoveRotations(S"+motor.port+", "+motor.daisy+", "+motor.number+", "+rotations+", "+speed+");";
}

function addMoveServo(motorId, position) 
{
  var motor = getMotorValues(motorId);
  programString += "Servos_SetPosition(S"+motor.port+", "+motor.daisy+", "+motor.number+", "+position+");";
}

function validateValues(blockname, values) 
{
  if (blockname=="sleep") 
  {
    if (isNaN(values.sleep) || values.sleep < 0) 
    {
      alert("Command: "+blockname+" has an invalid sleep time (positive floats allowed)");
      return false;
    }
  }
  if (blockname=="motor-speed" || blockname=="motor-rotations" || blockname=="move-servo") 
  {
    if (isNaN(values.motorId) || values.motorId >= window.motors.length) 
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
    if (isNaN(values.position) || values.position < 0 || values.position > 256) 
    {
      alert("Command: "+blockname+" has an invalid position number (0-256 integers allowed)");
      return false;
    }
  }
  return true;
}

function parseProgram() {
  programString = programheader;
  programString += "task main(){";
  
  var BuildSuccess = true;

  var elementList = $("#workbench").children();
  elementList.each(function() {
    var command = $(this);
    switch (command.attr("command-type")) {
      case "sleep":
        var sleepTime = parseFloat(command.children(".sleep-value")[0].value);
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
        var motorId = parseInt(command.children(".motor-id")[0].value);
        var speed = parseInt(command.children(".speed-value")[0].value);
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
        var motorId = parseInt(command.children(".motor-id")[0].value);
        var speed = parseInt(command.children(".speed-value")[0].value);
        var rotations = parseFloat(command.children(".rotation-value")[0].value);
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
        var motorId = parseInt(command.children(".motor-id")[0].value);
        var position = parseInt(command.children(".position-value")[0].value);
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

function toolboxDragStart(e) {
  console.log("toolbox drag start event fired");
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = 'move';
}

function trashDrop(e) {
    console.log("trash drop event fired");
  if(dragSrcEl.parentNode.getAttribute('id') == "workbench")
  {
  $(this).removeClass('selected');
    dragSrcEl.remove();
  }
  if (e.stopPropagation) {
    e.stopPropagation(); // Stops some browsers from redirecting.
  }
  return false;
}

function trashDragOver(e) {
  console.log("trash drag over event fired");
  $(this).addClass('selected');
  if (e.preventDefault) {
  e.preventDefault(); // Necessary. Allows us to drop.
  }

  e.dataTransfer.dropEffect = 'move'; // See the section on the DataTransfer object. 
  return false;
}

function trashDragLeave(e){
  console.log("trash drag leave event fired");
  $(this).removeClass('selected');
  return false;
}

function addDrop(e) {
  console.log("add drop event fired");
  this.classList.remove('selected');
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  if(dragSrcEl.parentNode.getAttribute('id') == "toolbox")
  {
    var NewNode = dragSrcEl.cloneNode(true);

    // var Inputs = dragSrcEl.querySelectorAll("input");

    // [].forEach.call(Inputs, function(Input) {
    //   alert("input");
    // });

    document.getElementById("workbench").appendChild(NewNode);

    NewNode.addEventListener('dragstart', programDragStart, false);
    NewNode.addEventListener('dragover', programDragOver, false);
    NewNode.addEventListener('drop', programDrop, false);
  }

  return false;
}

function programDragStart(e) 
{
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData('text/html', this)
  return false;
}

function programDrop(e)
{
  if (e.stopPropagation) 
  {
    e.stopPropagation(); // Stops some browsers from redirecting.
  }
  
    // Set the source column's HTML to the HTML of the column we dropped on.
  if(dragSrcEl != this && dragSrcEl.parentNode.id == "workbench")
  {
    dragSrcEl.innerHTML = this.innerHTML;
    this.innerHTML = e.dataTransfer.getData('text/html');
  }
}

function programDragOver(e) 
{

  if (e.preventDefault) 
  {
    e.preventDefault(); // Necessary. Allows us to drop.
  }

  e.dataTransfer.dropEffect = "move";  // See the section on the DataTransfer object.

  return false;
}

function addDragOver(e) {
  console.log("add drag over event fired");
  if(dragSrcEl.parentNode.getAttribute('id') == "toolbox")
  {
    $(this).addClass('selected');
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

var trashElement = $("#trash");
var add = $("#workbench");
var commandblocks = $('.command');

$("document").ready(function() {
	console.log("app init");

	// download the libraries
	requestLibrary("drivers/common");
	requestLibrary("I2C");
	requestLibrary("Servos");
	requestLibrary("Motors");
	console.log("all requests sent");
	
	trashElement.on('dragover', trashDragOver);
	trashElement.on('drop', trashDrop);
	trashElement.on('dragleave', trashDragLeave);
	
	add.on('dragover', addDragOver);
	add.on('drop', addDrop);
	add.on('dragleave', addDragLeave);
	
	for(var i = 0; i < commandblocks.length; i++) {
		$(commandblocks[i]).on('dragstart', toolboxDragStart);
	}
	
	console.log("everything initialized, starting the tutorial");
	
	introJs().start();
});
