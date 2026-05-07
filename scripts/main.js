function draw() {
    // 0. PAVZA
    if (isPaused) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText("PAUSE", WIDTH / 2 - 50, HEIGHT / 2);
        return;
    }

    // 1. ČIŠČENJE OZADJA
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    var paddleTop = HEIGHT - paddleh - PADDLE_OFFSET_BOTTOM;

    // 2. PLOŠČICA
    if (rightDown && (paddlex + paddlew) < WIDTH) paddlex += paddleSpeed;
    if (leftDown && paddlex > 0) paddlex -= paddleSpeed;

    ctx.fillStyle = paddlecolor;
    ctx.fillRect(paddlex, paddleTop, paddlew, paddleh);

    // 3. OPEKE (Izris)
    for (var i = 0; i < NROWS; i++) {
        for (var j = 0; j < NCOLS; j++) {
            var hp = bricks[i][j];
            if (hp > 0) {
                var bx = (j * (BRICKWIDTH + PADDING)) + BRICK_OFFSET_SIDES;
                var by = (i * (BRICKHEIGHT + PADDING)) + BRICK_OFFSET_TOP;

                if (hp === 3) ctx.fillStyle = "#00396e";
                else if (hp === 2) ctx.fillStyle = "#0060c0";
                else ctx.fillStyle = rowcolors[i % rowcolors.length];

                ctx.fillRect(bx, by, BRICKWIDTH, BRICKHEIGHT);
                ctx.strokeStyle = "rgba(255,255,255,0.2)";
                ctx.strokeRect(bx, by, BRICKWIDTH, BRICKHEIGHT);
            }
        }
    }

    // 4. ŽOGICE
    for (var b = balls.length - 1; b >= 0; b--) {
        var ball = balls[b];

        ctx.beginPath();
        ctx.fillStyle = ballcolor;
        ctx.arc(ball.x, ball.y, r, 0, Math.PI * 2);
        ctx.fill();

        if (!gameStarted) {
            ball.x = paddlex + paddlew / 2;
            ball.y = paddleTop - r;
            continue;
        }

        // Premik
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Odboj od sten
        if (ball.x + r > WIDTH || ball.x - r < 0) ball.dx = -ball.dx;
        if (ball.y - r < 0) ball.dy = -ball.dy;

        // Odboj od ploščice
        if (ball.dy > 0 && ball.y + r >= paddleTop && ball.x > paddlex && ball.x < paddlex + paddlew) {
            var hitPos = (ball.x - (paddlex + paddlew / 2)) / (paddlew / 2);
            ball.dx = 6 * hitPos;
            ball.dy = -Math.abs(ball.dy); // Vedno odbij navzgor
            ball.y = paddleTop - r;
        }

        // --- STABILNI TRKI Z OPEKAMI ---
        var hitAny = false;
        for (var i = 0; i < NROWS; i++) {
            for (var j = 0; j < NCOLS; j++) {
                if (bricks[i][j] > 0) {
                    var bx = (j * (BRICKWIDTH + PADDING)) + BRICK_OFFSET_SIDES;
                    var by = (i * (BRICKHEIGHT + PADDING)) + BRICK_OFFSET_TOP;

                    if (ball.x + r > bx && ball.x - r < bx + BRICKWIDTH &&
                        ball.y + r > by && ball.y - r < by + BRICKHEIGHT) {

                        // Izračun prekrivanja za določitev strani odboja
                        var overlapX = Math.min(ball.x + r - bx, bx + BRICKWIDTH - (ball.x - r));
                        var overlapY = Math.min(ball.y + r - by, by + BRICKHEIGHT - (ball.y - r));

                        if (overlapX < overlapY) {
                            ball.dx = -ball.dx;
                            ball.x += (ball.dx > 0) ? (overlapX + 0.1) : -(overlapX + 0.1);
                        } else {
                            ball.dy = -ball.dy;
                            ball.y += (ball.dy > 0) ? (overlapY + 0.1) : -(overlapY + 0.1);
                        }

                        bricks[i][j] -= 1;
                        if (bricks[i][j] === 0) {
                            score += 10;
                            $("#points").html(score);
                        }

                        // Zmaga
                        if (score >= totalBricks * 10) showGameOver(true);

                        hitAny = true; break;
                    }
                }
            }
            if (hitAny) break;
        }

        // Padec žogice ven
        if (ball.y + r > HEIGHT) {
            balls.splice(b, 1);
            if (balls.length === 0) {
                lives--;
                $("#lives").html(lives);
                gameStarted = false;
                if (lives <= 0) showGameOver();
                else balls.push({ x: paddlex + paddlew / 2, y: paddleTop - r, dx: 2, dy: -4 });
            }
        }
    }

    window.setDifficulty = function (level) {
        // 1. Ustavimo trenutni timer in igro
        gameStarted = false;
        if (intTimer) {
            clearInterval(intTimer);
            intTimer = null;
        }
        sekunde = 0;
        $("#cas").html("00:00");
        score = 0;
        $("#points").html("0");

        // 2. Nastavimo parametre glede na težavnost
        if (level === 'BOR') {
            levelMap = borMap;
        } else if (level === 'TIM') {
            levelMap = timMap;
        } else if (level === 'VID') {
            levelMap = vidMap;
        }

        // 3. RE-INITIALIZACIJA (Nova tabela opek)
        paddlew = basePaddleWidth; // Resetiramo širino ploščice
        paddleWidthLevel = 0;

        respondCanvas();
        initbricks(); // Ponovno zgenerira bricks[][] iz levelMap
        init_paddle(); // Postavi ploščico na sredino
    };
}