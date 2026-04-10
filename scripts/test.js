function drawIt() {
    // --- Nastavitve in spremenljivke ---
    var gameStarted = false;
    var powers = [];
    var brickPowers = [];
    var paddleSpeed = 5;
    var balls = [{ x: 150, y: 150, dx: 2, dy: -4 }];

    // Logika za stackanje širine
    var paddleWidthLevel = 0;
    var basePaddleWidth = 75;
    var paddleTimers = []; // Tabela za shranjevanje aktivnih timeoutov

    var WIDTH, HEIGHT, ctx, paddlex;
    var r = 10;
    var paddleh = 10;
    var paddlew = basePaddleWidth;
    var rightDown = false;
    var leftDown = false;
    var bricks;
    var NROWS = 10, NCOLS = 10;
    var BRICKWIDTH, BRICKHEIGHT = 15;
    var BRICK_OFFSET_TOP = 40, BRICK_OFFSET_SIDES = 80, PADDING = 1;
    var rowcolors = ["#0affeb", "#FFFD0A", "#00A308", "#0008DB", "#EB0093"];
    var paddlecolor = "#ffffff";
    var PADDLE_OFFSET_BOTTOM = 20;
    var ballcolor = "#ffffff";
    var sekunde = 0;
    var intTimer = null;

    function init() {
        ctx = $('#canvas')[0].getContext("2d");
        respondCanvas();
        $(window).resize(respondCanvas);
        initbricks();
        init_paddle();
        setInterval(draw, 10);
    }

    function respondCanvas() {
        var container = $('#container');
        var canvas = $('#canvas');
        WIDTH = container.width();
        HEIGHT = container.height();
        canvas.attr('width', WIDTH);
        canvas.attr('height', HEIGHT);
        BRICKWIDTH = ((WIDTH - (2 * BRICK_OFFSET_SIDES)) / NCOLS) - PADDING;
        if (paddlex + paddlew > WIDTH) paddlex = WIDTH - paddlew;
    }

    function init_paddle() { paddlex = WIDTH / 2; }

    // --- Tipkovnica ---
    function onKeyDown(evt) {
        if (evt.keyCode == 39) rightDown = true;
        else if (evt.keyCode == 37) leftDown = true;
        else if (evt.keyCode == 32) {
            if (!gameStarted) {
                gameStarted = true;
                balls[0].dx = (Math.random() * 4) - 2;
                balls[0].dy = -4;
                if (!intTimer) intTimer = setInterval(timer, 1000);
            }
        }
    }
    function onKeyUp(evt) {
        if (evt.keyCode == 39) rightDown = false;
        else if (evt.keyCode == 37) leftDown = false;
    }
    $(document).off("keydown").on("keydown", onKeyDown);
    $(document).off("keyup").on("keyup", onKeyUp);

    // --- Inicializacija opek ---
    function initbricks() {
        bricks = new Array(NROWS);
        brickPowers = new Array(NROWS);
        for (var i = 0; i < NROWS; i++) {
            bricks[i] = new Array(NCOLS);
            brickPowers[i] = new Array(NCOLS);
            for (var j = 0; j < NCOLS; j++) {
                bricks[i][j] = (i === 5/* katera vrstica bo siva*/) ? 2 : 1; // 2 je neuničljiva (siva)
                var rand = Math.random();
                if (bricks[i][j] === 1 && rand < 0.15) brickPowers[i][j] = "extraBall";
                else if (bricks[i][j] === 1 && rand < 0.25) brickPowers[i][j] = "bigPaddle";
                else if (bricks[i][j] === 1 && rand < 0.35) brickPowers[i][j] = "slowPaddle";
                else brickPowers[i][j] = null;
            }
        }
    }

    function timer() {
        if (!gameStarted) return;
        sekunde++;
        var s = (sekunde % 60).toString().padStart(2, '0');
        var m = Math.floor(sekunde / 60).toString().padStart(2, '0');
        $("#cas").html(m + ":" + s);
    }

    // --- Glavna funkcija risanja ---
    function draw() {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        var paddleTop = HEIGHT - paddleh - PADDLE_OFFSET_BOTTOM;

        // 1. Premik in izris ploščice
        if (rightDown && (paddlex + paddlew) < WIDTH) paddlex += paddleSpeed;
        else if (leftDown && paddlex > 0) paddlex -= paddleSpeed;

        ctx.beginPath();
        ctx.fillStyle = paddlecolor;
        ctx.rect(paddlex, paddleTop, paddlew, paddleh);
        ctx.fill();
        ctx.closePath();

        // 2. Izris opek
        for (var i = 0; i < NROWS; i++) {
            for (var j = 0; j < NCOLS; j++) {
                if (bricks[i][j] > 0) {
                    var bx = (j * (BRICKWIDTH + PADDING)) + BRICK_OFFSET_SIDES;
                    var by = (i * (BRICKHEIGHT + PADDING)) + BRICK_OFFSET_TOP;
                    ctx.fillStyle = (bricks[i][j] === 2) ? "#888888" : rowcolors[i % rowcolors.length];
                    ctx.fillRect(bx, by, BRICKWIDTH, BRICKHEIGHT);

                    if (brickPowers[i][j]) { // Indikator power-upa
                        ctx.fillStyle = "#000000";
                        ctx.beginPath();
                        ctx.arc(bx + BRICKWIDTH / 2, by + BRICKHEIGHT / 2, 2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        }

        // 3. Logika žogic
        for (var b = balls.length - 1; b >= 0; b--) {
            var ball = balls[b];
            ctx.beginPath();
            ctx.fillStyle = ballcolor;
            ctx.arc(ball.x, ball.y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();

            if (!gameStarted) {
                ball.x = paddlex + paddlew / 2;
                ball.y = paddleTop - r;
                continue;
            }

            // Odboji od sten
            if (ball.x + ball.dx > WIDTH - r || ball.x + ball.dx < r) ball.dx = -ball.dx;
            if (ball.y + ball.dy < r) ball.dy = -ball.dy;

            // Odboj od ploščice
            if (ball.dy > 0 && ball.y + r >= paddleTop && ball.y + r <= paddleTop + 10) {
                if (ball.x > paddlex && ball.x < paddlex + paddlew) {
                    var hitPos = (ball.x - (paddlex + paddlew / 2)) / (paddlew / 2);
                    ball.dx = 6 * hitPos;
                    ball.dy = -Math.abs(ball.dy);
                    ball.y = paddleTop - r;
                }
            }

            // Trki z opekami
            var hitAny = false;
            for (var i = 0; i < NROWS; i++) {
                for (var j = 0; j < NCOLS; j++) {
                    if (bricks[i][j] > 0) {
                        var bx = (j * (BRICKWIDTH + PADDING)) + BRICK_OFFSET_SIDES;
                        var by = (i * (BRICKHEIGHT + PADDING)) + BRICK_OFFSET_TOP;

                        if (ball.x + r > bx && ball.x - r < bx + BRICKWIDTH &&
                            ball.y + r > by && ball.y - r < by + BRICKHEIGHT) {

                            if (bricks[i][j] === 1) {
                                bricks[i][j] = 0; // Uniči
                                if (brickPowers[i][j]) { // Ustvari padajoči power-up
                                    powers.push({ x: bx + BRICKWIDTH / 2, y: by, type: brickPowers[i][j], r: 8 });
                                }
                            }
                            ball.dy = -ball.dy;
                            hitAny = true; break;
                        }
                    }
                }
                if (hitAny) break;
            }

            if (ball.y + ball.dy > HEIGHT) {
                balls.splice(b, 1);
                if (balls.length === 0) { gameStarted = false; balls.push({ x: 150, y: 150, dx: 2, dy: -4 }); }
                continue;
            }
            ball.x += ball.dx;
            ball.y += ball.dy;
        }

        // 4. Padajoči power-upi
        for (var p = powers.length - 1; p >= 0; p--) {
            powers[p].y += 2;
            ctx.beginPath();
            if (powers[p].type == "extraBall") ctx.fillStyle = "#00ffff";
            else if (powers[p].type == "bigPaddle") ctx.fillStyle = "#ff00ff";
            else if (powers[p].type == "slowPaddle") ctx.fillStyle = "#ffa500";
            ctx.arc(powers[p].x, powers[p].y, powers[p].r, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();

            // Preverjanje pobiranja
            if (powers[p].y + powers[p].r >= paddleTop && powers[p].x > paddlex && powers[p].x < paddlex + paddlew) {
                var type = powers[p].type;

                if (type == "extraBall") {
                    balls.push({ x: paddlex + paddlew / 2, y: paddleTop - 20, dx: 3, dy: -4 });
                }
                else if (type == "bigPaddle") {
                    // Logika za stackanje in reset timerja
                    if (paddleWidthLevel < 2) paddleWidthLevel++;

                    paddlew = basePaddleWidth + (paddleWidthLevel * 40);

                    // Počistimo prejšnje timerje za krčenje, če obstajajo
                    paddleTimers.forEach(clearTimeout);
                    paddleTimers = [];

                    // Nastavimo nov timer za krčenje (čez 10s se vrne na normalno)
                    var t = setTimeout(function () {
                        paddleWidthLevel = 0;
                        paddlew = basePaddleWidth;
                    }, 10000);
                    paddleTimers.push(t);
                }
                else if (type == "slowPaddle") {
                    paddleSpeed = 2;
                    setTimeout(function () { paddleSpeed = 5; }, 10000);
                }
                powers.splice(p, 1);
            } else if (powers[p].y > HEIGHT) {
                powers.splice(p, 1);
            }
        }
    }
    init();
}