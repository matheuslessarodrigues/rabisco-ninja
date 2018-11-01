const canvas = document.getElementById("the_canvas");
const context = canvas.getContext("2d");

const draw_style = "#888";
const draw_width = 3.0;

const clear_style = "#111";
const clear_width = 50.0;

const font_style = "#444";

var undo_buffer = null;

var prevX = 0.0;
var prevY = 0.0;
var currX = 0.0;
var currY = 0.0;

var drawing = false;
var first_click = true;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

context.fillStyle = clear_style;
context.fillRect(0, 0, canvas.width, canvas.height);
context.lineJoin = "round";
context.lineCap = "round";

context.font = "30px Arial";
context.textAlign = "center";
context.fillStyle = font_style;
context.fillText("left mouse button: sketch", canvas.width * 0.5, canvas.height * 0.5 - 60);
context.fillText("other mouse buttons: eraser", canvas.width * 0.5, canvas.height * 0.5 - 20);
context.fillText("f5: clear", canvas.width * 0.5, canvas.height * 0.5 + 20);
context.fillText("ctrl+z: undo once", canvas.width * 0.5, canvas.height * 0.5 + 60);
context.fillStyle = clear_style;

canvas.addEventListener("mousemove", function (e) {
	prevX = currX;
	prevY = currY;
	currX = e.clientX - canvas.offsetLeft;
	currY = e.clientY - canvas.offsetTop;

	if (drawing) {
		context.beginPath();
		context.moveTo(prevX, prevY);
		context.lineTo(currX, currY);
		context.stroke();
		context.closePath();
	}
}, false);
canvas.addEventListener("mousedown", function (e) {
	if (first_click) {
		context.fillRect(0, 0, canvas.width, canvas.height);
		first_click = false;
	}

	drawing = true;
	undo_buffer = canvas.toDataURL();

	if (e.button == 0) {
		context.lineWidth = draw_width;
		context.strokeStyle = draw_style;
	} else {
		context.lineWidth = clear_width;
		context.strokeStyle = clear_style;
	}
}, false);
canvas.addEventListener("mouseup", function (e) {
	drawing = false;
}, false);
canvas.addEventListener("mouseout", function (e) {
	drawing = false;
}, false);

document.onkeydown = function (e) {
	if (e.keyCode == 90 && e.ctrlKey) {
		var data = canvas.toDataURL();

		var undo_image = new Image();
		undo_image.src = undo_buffer;
		undo_image.onload = function () { context.drawImage(undo_image, 0, 0); }

		undo_buffer = data;
	}
};