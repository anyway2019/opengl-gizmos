const canvas = document.getElementById('myCanvas');
let context2d = canvas.getContext('2d');


drawRect('red', 0, 0, 100, 100);

drawStrokeLine('blue', 100, 100, 50, 0, Math.PI * 2);

drawText(100, 100, 'green', '30px Arial');

function drawRect(color, x, y, width, height) {
    context2d.fillStyle = 'color';
    context2d.fillRect(x, y, width, height);
}

function drawStrokeLine(color, x, y, radius, startAngle, endAngle) {
    context2d.strokeStyle = color;
    context2d.lineWidth = 10;
    context2d.beginPath();
    context2d.arc(x, y, radius, startAngle, endAngle, true);
    context2d.stroke();
    context2d.closePath();
}

function drawText(x, y, color, font) {
    context2d.fillStyle = color || 'black';
    context2d.font = font || '30px Arial';
    context2d.fillText('Hello World', x, y);
}

