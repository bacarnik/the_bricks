function draw() {
    if (isPaused) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText("PAVZA", WIDTH / 2 - 50, HEIGHT / 2);
        return;
    }

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
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
            ball.dx = 2; // Pripravi smer za start
            ball.dy = -4;
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

                    // Preverimo, če se žogica dotika opeke
                    if (ball.x + r > bx && ball.x - r < bx + BRICKWIDTH && ball.y + r > by && ball.y - r < by + BRICKHEIGHT) {

                        // Izračunamo prekrivanje (overlap), da vemo katero stran smo zadeli
                        var overlapX = Math.min(ball.x + r - bx, bx + BRICKWIDTH - (ball.x - r));
                        var overlapY = Math.min(ball.y + r - by, by + BRICKHEIGHT - (ball.y - r));

                        if (overlapX < overlapY) {
                            // Stranski trk
                            ball.dx = -ball.dx;
                            // Preprečimo lepljenje: premaknemo žogico izven opeke
                            ball.x += (ball.dx > 0) ? (overlapX + 0.1) : -(overlapX + 0.1);
                        } else {
                            // Navpični trk
                            ball.dy = -ball.dy;
                            // Preprečimo lepljenje
                            ball.y += (ball.dy > 0) ? (overlapY + 0.1) : -(overlapY + 0.1);
                        }

                        // LOGIKA ZA UNIČEVANJE
                        if (bricks[i][j] === 1) { // Samo navadne opeke se uničijo
                            bricks[i][j] = 0;
                            score += 10;
                            $("#points").html(score);

                            if (brickPowers[i][j]) {
                                powers.push({
                                    x: bx + BRICKWIDTH / 2,
                                    y: by + BRICKHEIGHT / 2,
                                    type: brickPowers[i][j],
                                    r: 8
                                });
                            }
                            if (score >= totalBricks * 10) {
                                showGameOver(true);
                            }
                        }
                        // Če je bricks[i][j] === 2 (siva), se koda ustavi tu, 
                        // odboj pa je že narejen zgoraj.

                        if (bricks[i][j] === 1) {
                            bricks[i][j] = 0;
                            score += 10;
                            $("#points").text(score);

                            // Preveri zmago
                            if (score === totalBricks) {
                                showGameOver(true);
                            }
                        }

                        hitAny = true;
                        break; // Izstop iz notranje zanke stolpcev
                    }
                }
            }
            if (hitAny) break; // Izstop iz zunanje zanke vrstic
        }

        // Preverjanje padca žogice pod spodnji rob
        if (ball.y + ball.dy > HEIGHT - r) {
            balls.splice(b, 1); // Odstrani to žogico

            if (balls.length === 0) {
                lives--;
                $("#lives").html(lives);
                gameStarted = false; // To ustavi vse prihodnje žogice

                if (lives > 0) {
                    setTimeout(function () {
                        // Dodamo novo žogico - ker je gameStarted=false, bo sledila ploščici
                        balls.push({
                            x: paddlex + paddlew / 2,
                            y: paddleTop - r,
                            dx: 2,
                            dy: -4
                        });
                    }, 500);
                } else {
                    showGameOver();
                }
            }
            continue;
        }
        ball.x += ball.dx;
        ball.y += ball.dy;
    }

    // 4. Padajoči power-upi
    for (var p = powers.length - 1; p >= 0; p--) {
        powers[p].y += 2;
        ctx.beginPath();
        if (powers[p].type == "extraBall") ctx.fillStyle = "#2bff00";
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
                setTimeout(function () { paddleSpeed = 5; }, 5000);
            }
            powers.splice(p, 1);
        } else if (powers[p].y > HEIGHT) {
            powers.splice(p, 1);
        }
    }

    // Tezavnost
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
        if (level === 'easy') {
            levelMap = easyMap;
            console.log("opica")
        } else if (level === 'medium') {
            levelMap = mediumMap;
        } else if (level === 'hard') {
            levelMap = hardMap;
        }

        // 3. RE-INITIALIZACIJA (Nova tabela opek in reset power-upov)
        powers = []; // Pobrišemo padajoče power-upe
        paddlew = basePaddleWidth; // Resetiramo širino ploščice
        paddleWidthLevel = 0;

        initbricks(); // Ponovno zgenerira bricks[][] iz levelMap
        init_paddle(); // Postavi ploščico na sredino
    };
}