const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const draw_style = "#888";
const draw_width = 3.0;

const erase_style = "#111";
const erase_width = 50.0;

const font_style = "#444";

let prev_x = 0.0;
let prev_y = 0.0;
let curr_x = 0.0;
let curr_y = 0.0;

let is_pressing_mouse = false;
let is_drawing = false;
let is_first_action = true;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

context.lineJoin = "round";
context.lineCap = "round";
context.font = "30px Arial";
context.textAlign = "center";

canvas.addEventListener("mousemove", function (e) {
	prev_x = curr_x;
	prev_y = curr_y;
	curr_x = e.clientX - canvas.offsetLeft;
	curr_y = e.clientY - canvas.offsetTop;

	if (is_pressing_mouse) {
		if (is_drawing) {
			api.draw(prev_x, prev_y, curr_x, curr_y);
			api.on_draw(prev_x, prev_y, curr_x, curr_y);
		} else {
			api.erase(prev_x, prev_y, curr_x, curr_y);
			api.on_erase(prev_x, prev_y, curr_x, curr_y);
		}

		undo_api.add_undo_line(api.local_user_id, prev_x, prev_y, curr_x, curr_y);
	}
}, false);
canvas.addEventListener("mousedown", function (e) {
	is_pressing_mouse = true;

	if (e.button == 0) {
		is_drawing = true;
	} else {
		is_drawing = false;
	}
}, false);
canvas.addEventListener("mouseup", function (e) {
	is_pressing_mouse = false;
	undo_api.add_undo_command(api.local_user_id, is_drawing);
}, false);
canvas.addEventListener("mouseout", function (e) {
	if (is_pressing_mouse)
		undo_api.add_undo_command(api.local_user_id, is_drawing);
	is_pressing_mouse = false;
}, false);

document.onkeydown = function (e) {
	if (e.keyCode == 90 && e.ctrlKey) {
		if (e.shiftKey) {
			undo_api.request_undo(1);
		} else {
			undo_api.request_undo(-1);
		}
	}
};

function trace_line(x0, y0, x1, y1) {
	context.beginPath();
	context.moveTo(x0, y0);
	context.lineTo(x1, y1);
	context.stroke();
	context.closePath();
}

function clear_screen_if_first_action() {
	if (is_first_action) {
		context.fillStyle = erase_style;
		context.fillRect(0, 0, canvas.width, canvas.height);
		is_first_action = false;
	}
}

const api = {
	enabled: true,
	local_user_id: 0,
	draw: function (x0, y0, x1, y1) {
		if (!this.enabled) {
			return;
		}

		clear_screen_if_first_action();

		context.lineWidth = draw_width;
		context.strokeStyle = draw_style;
		trace_line(x0, y0, x1, y1);
	},
	erase: function (x0, y0, x1, y1) {
		if (!this.enabled) {
			return;
		}

		clear_screen_if_first_action();

		context.lineWidth = erase_width;
		context.strokeStyle = erase_style;
		trace_line(x0, y0, x1, y1);
	},
	on_draw: function (x0, y0, x1, y1) { },
	on_erase: function (x0, y0, x1, y1) { },
	draw_background_info: function (extra_info) {
		context.fillStyle = erase_style;
		context.fillRect(0, 0, canvas.width, canvas.height);

		context.fillStyle = font_style;
		context.fillText("left mouse button: sketch", canvas.width * 0.5, canvas.height * 0.5 - 60);
		context.fillText("other mouse buttons: eraser", canvas.width * 0.5, canvas.height * 0.5 - 20);
		context.fillText("f5: clear", canvas.width * 0.5, canvas.height * 0.5 + 20);
		context.fillText("ctrl+z: undo", canvas.width * 0.5, canvas.height * 0.5 + 60);
		context.fillText("ctrl+shift+z: redo", canvas.width * 0.5, canvas.height * 0.5 + 100);

		context.fillText(extra_info, canvas.width * 0.5, canvas.height * 0.5 + 200);
	}
};

api.draw_background_info("");

window.onhashchange = function () {
	window.location.reload();
}