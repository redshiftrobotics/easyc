var CurrentBlock;
var ReturnCode = new Array();
var CodeAddition = $("#LibrariesText").text();
var BlocksAdded = 0;
var Context;
var Canvas;

var libraryRequests = ["saas_common", "I2C", "motors", "servos"];


function RefreshPage()
{
	document.getElementById("TextArea").value = "";
	location.reload();
}

function recieveLibrary(name)
{
	console.log("received" + name);
	document.getElementById("LibrariesText").textContent = document.getElementById("LibrariesText").textContent + libraryRequests[name].responseText;
	numberOfLoadedLibraries++;
	// someone please explain to me why I need to make this 3 instead of 4. -aj
	if (numberOfLoadedLibraries == 3) {
		// everything's done loading
		console.log("loaded all libraries");
		// filter out #include directives
		var array = document.getElementById("LibrariesText").textContent.split("\n");
		array = $.grep(array, function(string) {
			// this heuristic is pretty dismal, we should probably improve it
			if (string[0] == "#" && string[1] == "i" && string[2] == "n" && string[3] == "c") {
				return true;
			} else {
				return false;
			}
		}, true);
		document.getElementById("LibrariesText").textContent = array.join("\n");
		// get rid of the infobar
		$("#loadingAlert").remove();
	}
}
var numberOfLoadedLibraries = 0;
window.onready = function()
{
	console.log("app init");
	Canvas = document.getElementById('canvas');
	Context = Canvas.getContext('2d');
	Context.fillStyle = "Black";
	Context.fillRect(0, 0, Canvas.width, Canvas.height);
	Sleep();
	// download the libraries
	// we have to use rawgithub.com instead of raw.github.com because GitHub sends a MIME of text/plain XMLHttpRequest only accepts text/html, text/xml, etc.
	var library_base_url = "https://rawgithub.com/saasrobotics/Robotics2013-14/master/libraries/";
	
	libraryRequests["saas_common"] = new XMLHttpRequest();
	libraryRequests["saas_common"].onload = function(){recieveLibrary("common")};
	libraryRequests["saas_common"].open("get", library_base_url + "saas_common.h", true);
	libraryRequests["saas_common"].send();
	libraryRequests["I2C"] = new XMLHttpRequest();
	libraryRequests["I2C"].onload = function(){recieveLibrary("I2C")};
	libraryRequests["I2C"].open("get", library_base_url + "I2C.h", true);
	libraryRequests["I2C"].send();
	libraryRequests["motors"] = new XMLHttpRequest();
	libraryRequests["motors"].onload = function(){recieveLibrary("motors")};
	libraryRequests["motors"].open("get", library_base_url + "Motors.h", true);
	libraryRequests["motors"].send();
	libraryRequests["servos"] = new XMLHttpRequest();
	libraryRequests["servos"].onload = function(){recieveLibrary("servos")};
	libraryRequests["servos"].open("get", library_base_url + "Servos.h", true);
	libraryRequests["servos"].send();
};

function Add()
{
	var AddedBlock = false;
	if(CurrentBlock == "Sleep" && document.getElementById("SleepSeconds").value != "")
	{
		ReturnCode[ReturnCode.length] = "Sleep(" + document.getElementById("SleepSeconds").value + ");\n";
		
		Context.fillStyle = "Blue";
		Context.fillRect(5, 5 + BlocksAdded * 55, 300, 50);
		Context.fillStyle = "Black";
		Context.fillText("Sleep for " + document.getElementById("SleepSeconds").value + " seconds.", 10, 25 + BlocksAdded * 55);
		
		AddedBlock = true;
	}
	else if(CurrentBlock == "TurnRotations" && document.getElementById("TurnRotationsDaisyChain").value != "" && document.getElementById("TurnRotationsMotor").value != "" && document.getElementById("TurnRotationsPort").value != "" && document.getElementById("TurnRotationsNumber").value != "" && document.getElementById("TurnRotationsSpeed").value != "")
	{
		var Encoder = "(I2C_GetEncoderPosition(S" + document.getElementById("TurnRotationsPort").value + ", " +  document.getElementById("TurnRotationsDaisyChain").value + ", " + document.getElementById("TurnRotationsMotor").value + ")";
		var AmountToAdd =  document.getElementById("TurnRotationsNumber").value * 1440 + "" + ")";
		ReturnCode[ReturnCode.length] = "Motors_SetPosition(S" + document.getElementById("TurnRotationsPort").value + ", " + document.getElementById("TurnRotationsDaisyChain").value + ", " + document.getElementById("TurnRotationsMotor").value + ", "  + Encoder + " + " + AmountToAdd + ", " + document.getElementById("TurnRotationsSpeed").value + ");\n"; 
	
				
		Context.fillStyle = "Brown";
		Context.fillRect(5, 5 + BlocksAdded * 55, 300, 50);
		Context.fillStyle = "Black";
		Context.fillText("Turn for " + document.getElementById("TurnRotationsNumber").value + " rotations on port " + document.getElementById("TurnRotationsPort").value + ", daisy chain level " + document.getElementById("TurnRotationsDaisyChain").value + ", motor " + document.getElementById("TurnRotationsMotor").value + ".", 10, 25 + BlocksAdded * 55);
		AddedBlock = true;
	}	
	else if(CurrentBlock == "MoveSpeed" && document.getElementById("MoveSpeedSpeed").value != "" && document.getElementById("MoveSpeedPort").value != "" && document.getElementById("MoveSpeedMotor").value != "" && document.getElementById("MoveDaisyChain").value != "")
	{
		ReturnCode[ReturnCode.length] = "Motors_SetSpeed(S"  + document.getElementById("MoveSpeedPort").value + ", " + document.getElementById("MoveDaisyChain").value + ", " + document.getElementById("MoveSpeedMotor").value + ", " + document.getElementById("MoveSpeedSpeed").value + ");\n";
	
		Context.fillStyle = "Green";
		Context.fillRect(5, 5 + BlocksAdded * 55, 300, 50);
		Context.fillStyle = "Black";
		Context.fillText("Move port " + document.getElementById("MoveSpeedPort").value + ", daisy chain level " + document.getElementById("MoveDaisyChain").value + ", motor " + document.getElementById("MoveSpeedMotor").value + " at " + document.getElementById("MoveSpeedSpeed").value + " percent speed.", 10, 25 + BlocksAdded * 55);
		AddedBlock = true;
	}
	else
	{
		alert("Not all text boxes filled out");
	}
	
	if(AddedBlock)
	{
		BlocksAdded++;
		
		var TextAreaValue = "";
		
		for(i = 0; i < ReturnCode.length; i++)
		{
			TextAreaValue += ReturnCode[i];
		}
		document.getElementById("TextArea").value = CodeAddition;
		document.getElementById("TextArea").value += "task main() {\n";
		document.getElementById("TextArea").value += TextAreaValue;
		document.getElementById("TextArea").value += "}\n";
		
		
		ResetTextBoxes();
	}
}

function ResetTextBoxes()
{
	document.getElementById("SleepSeconds").value = "";
	document.getElementById("TurnRotationsMotor").value = "";
	document.getElementById("TurnRotationsPort").value = "";
	document.getElementById("TurnRotationsNumber").value = "";
	document.getElementById("MoveSpeedSpeed").value = "";
	document.getElementById("MoveSpeedPort").value = "";
	document.getElementById("MoveDaisyChain").value = "";
	document.getElementById("MoveSpeedMotor").value = "";
	document.getElementById("TurnRotationsSpeed").value = "";
	document.getElementById("TurnRotationsDaisyChain").value = "";
}

function Sleep()
{
	ShowElement("Sleep");
}

function TurnRotations()
{
	ShowElement("TurnRotations");
}

function MoveSpeed()
{
	ShowElement("MoveSpeed");
}

function ShowElement(ID)
{
	$("#Sleep").hide();
	$("#TurnRotations").hide();
	$("#MoveSpeed").hide();
	$("#" + ID).show();
	CurrentBlock = ID;
}





