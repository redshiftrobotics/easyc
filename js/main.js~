var CurrentBlock;
var ReturnCode = new Array();
var CodeAddition = $("#LibrariesText").text();
var BlocksAdded = 0;
var Context;
var Canvas;

function RefreshPage()
{
	document.getElementById("TextArea").value = "";
	location.reload();
}

function ShowModal()
{
	$('#Modal').modal('show');
}

function HideModal()
{
	$('#Modal').modal('hide');
}

function Initialize()
{
	Canvas = document.getElementById('canvas');
	Context = Canvas.getContext('2d');
	Context.fillStyle = "Black";
	Context.fillRect(0, 0, Canvas.width, Canvas.height);
	Sleep();
}

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
	else if(CurrentBlock == "TurnRotations" && document.getElementById("TurnRotationsMotor").value != "" && document.getElementById("TurnRotationsPort").value != "" && document.getElementById("TurnRotationsNumber").value != "" && document.getElementById("TurnRotationsSpeed").value != "")
	{
		var Encoder = "(getEncoderPosition(" + document.getElementById("TurnRotationsMotor").value + ", S" + document.getElementById("TurnRotationsPort").value + ")";
		var AmountToAdd =  " + " + document.getElementById("TurnRotationsNumber").value * 1440 + "" + ")";
		ReturnCode[ReturnCode.length] = "setEncoderPosition(" + document.getElementById("TurnRotationsMotor").value + ", S" + document.getElementById("TurnRotationsPort").value + ", " + Encoder + AmountToAdd + ");\n"; 
	
				
		Context.fillStyle = "Brown";
		Context.fillRect(5, 5 + BlocksAdded * 55, 300, 50);
		Context.fillStyle = "Black";
		Context.fillText("Turn for " + document.getElementById("TurnRotationsNumber").value + " rotations on port " + document.getElementById("TurnRotationsPort").value + " motor " + document.getElementById("TurnRotationsMotor").value + ".", 10, 25 + BlocksAdded * 55);
		AddedBlock = true;
	}	
	else if(CurrentBlock == "MoveSpeed" && document.getElementById("MoveSpeedSpeed").value != "" && document.getElementById("MoveSpeedPort").value != "" && document.getElementById("MoveSpeedMotor").value != "")
	{
		ReturnCode[ReturnCode.length] = "setMotorSpeed(" + document.getElementById("MoveSpeedSpeed").value + ", S"  + document.getElementById("MoveSpeedPort").value + ", " + document.getElementById("MoveSpeedMotor").value + ");\n";
	
		Context.fillStyle = "Green";
		Context.fillRect(5, 5 + BlocksAdded * 55, 300, 50);
		Context.fillStyle = "Black";
		Context.fillText("Move port " + document.getElementById("MoveSpeedPort").value + " motor " + document.getElementById("MoveSpeedMotor").value + " at " + document.getElementById("MoveSpeedSpeed").value + " percent speed.", 10, 25 + BlocksAdded * 55);
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
	document.getElementById("MoveSpeedMotor").value = "";
	document.getElementById("TurnRotationsSpeed").value = "";
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





