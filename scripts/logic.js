function formatTime(s) {
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return (m < 10 ? "0" + m : m) + ":" + (sec < 10 ? "0" + sec : sec);
}

function startTimer() {
    if (intTimer !== null) return;

    intTimer = setInterval(function () {
        if (!isPaused && gameStarted) {
            sekunde++;
            $("#cas").text(formatTime(sekunde));
        }
    }, 1000);
}

function showGameOver(isWin = false) {
    gameStarted = false;
    if (intTimer) {
        clearInterval(intTimer);
        intTimer = null;
    }

    // 1. Pripravi naslov
    var title = isWin ? "LEVEL COMPLETE!" : "GAME OVER";
    var titleColor = isWin ? "#0affeb" : "#ff4444";
    $("#gameOverScreen h1").text(title).css("color", titleColor);

    // 2. Izpis SCORE: trenutni/vsi
    $("#finalScore").text(score + " / " + totalBricks * 10);

    // 3. Logika za ČAS
    var currentTimeStr = formatTime(sekunde);
    $("#finalTime").text(currentTimeStr); // Dodaj <span id="finalTime"> v HTML

    // Rekord shranimo in prikažemo SAMO ob zmagi
    var bestTime = localStorage.getItem("bestTime");

    if (isWin) {
        if (bestTime === null || sekunde < parseInt(bestTime)) {
            localStorage.setItem("bestTime", sekunde);
            bestTime = sekunde;
            $("#bestTimeDisplay").text(formatTime(bestTime) + " (NEW RECORD!)");
        } else {
            $("#bestTimeDisplay").text(formatTime(bestTime));
        }
    } else {
        // Ob porazu samo pokaži star rekord, brez "New Record"
        $("#bestTimeDisplay").text(bestTime ? formatTime(bestTime) : "--:--");
    }

    $("#gameOverScreen").css("display", "flex");
}

function resetGame() {
    console.log("zbrisano");
    // 1. Skrij okno (uporabimo več načinov za vsak primer)
    $("#gameOverScreen").hide(); // JQuery način
    $("#gameOverScreen").css("display", "none"); // Prisilen CSS način

    // 2. Ponastavi vse ključne spremenljivke iz settings.js
    lives = 3;
    score = 0;
    sekunde = 0;
    gameStarted = false; // Igra naj čaka na klik za začetek

    if (intTimer) {
        clearInterval(intTimer);
        intTimer = null;
    }

    // 3. Posodobi napise na zaslonu (UI)
    $("#lives").text(lives);
    $("#points").text(score);
    $("#cas").text("00:00");

    // 4. Počisti tabele in pripravi prvo žogico
    powers = [];
    paddlew = basePaddleWidth;
    paddleWidthLevel = 0;

    // Postavi žogico na sredino ploščice
    balls = [{
        x: paddlex + paddlew / 2,
        y: HEIGHT - paddleh - PADDLE_OFFSET_BOTTOM - r,
        dx: 2,
        dy: -4
    }];

    // 5. Ponovno naloži opeke in ploščico
    initbricks();
    init_paddle();
}

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        if (intTimer) clearInterval(intTimer); // Ustavi štetje časa
    } else {
        // Ponovno zaženi timer, če je igra že tekla
        if (gameStarted) {
            intTimer = setInterval(function () {
                sekunde++;
                $("#cas").html(formatTime(sekunde));
            }, 1000);
        }
    }
}

function initbricks() {
    NROWS = levelMap.length;
    NCOLS = levelMap[0].length;
    bricks = [];
    brickPowers = [];
    totalBricks = 0;

    for (var i = 0; i < NROWS; i++) {
        bricks[i] = [];
        brickPowers[i] = [];

        for (var j = 0; j < NCOLS; j++) {
            var isBrickHere = levelMap[i][j];

            if (isBrickHere > 0) {
                totalBricks++;

                // --- NAKLJUČNO DOLOČANJE MOČI ---
                var strengthRand = Math.random();
                if (strengthRand < 0.10) {
                    bricks[i][j] = 3; // 10% možnosti za HP 3
                } else if (strengthRand < 0.30) {
                    bricks[i][j] = 2; // 20% možnosti za HP 2
                } else {
                    bricks[i][j] = 1; // 70% možnosti za HP 1
                }

                // Power-upi
                var rand = Math.random();
                if (rand < 0.15) {
                    var typeRand = Math.random();
                    if (typeRand < 0.4) brickPowers[i][j] = "extraBall";
                    else if (typeRand < 0.8) brickPowers[i][j] = "bigPaddle";
                    else brickPowers[i][j] = "slowPaddle";
                } else {
                    brickPowers[i][j] = null;
                }
            } else {
                bricks[i][j] = 0;
                brickPowers[i][j] = null;
            }
        }
    }
}

function respondCanvas() {
    var canvas = $('#canvas');
    var container = $('#game-container');

    // Širina naj bo 95% okna, vendar ne več kot 800px
    var targetWidth = Math.min($(window).width() * 0.95, 800);

    // Višina naj bo 70% okna, da zagotovo vidimo ploščico na dnu
    var targetHeight = $(window).height() * 0.7;

    WIDTH = targetWidth;
    HEIGHT = targetHeight;

    // Nastavimo atribute canvasu
    canvas.attr('width', WIDTH);
    canvas.attr('height', HEIGHT);

    // Nastavimo širino game-containerja, da se ujema s canvasom
    container.css('width', WIDTH + 'px');
    container.css('height', HEIGHT + 'px');

    // Ponovni izračun opek (ker se je širina spremenila)
    if (typeof levelMap !== 'undefined' && levelMap.length > 0) {
        NCOLS = levelMap[0].length;
        var innerWidth = WIDTH - 2 * BRICK_OFFSET_SIDES;
        var totalPadding = (NCOLS - 1) * PADDING;
        BRICKWIDTH = (innerWidth - totalPadding) / NCOLS;
    }

    // Popravek ploščice, da ne ostane zunaj nove širine
    if (paddlex + paddlew > WIDTH) paddlex = WIDTH - paddlew;
}


function drawIt() {

    function init() {
        ctx = $('#canvas')[0].getContext("2d");
        respondCanvas();
        $(window).resize(respondCanvas);
        initbricks();
        init_paddle();
        setInterval(draw, 10);
    }




    // --- Tipkovnica ---
    function onKeyDown(evt) {
        // Premikanje ploščice 
        if (evt.keyCode == 39) rightDown = true;
        else if (evt.keyCode == 37) leftDown = true;

        // Začetek igre na tipko Space (32) ali Enter (13)
        if ((evt.keyCode == 32 || evt.keyCode == 13) && !gameStarted) {
            if (balls.length > 0) {
                gameStarted = true;
                startTimer();
            }
        }

        if (evt.keyCode == 80) { // Tipka 'P'
            togglePause();
        }
    }

    function onKeyUp(evt) {
        if (evt.keyCode == 39) rightDown = false;
        else if (evt.keyCode == 37) leftDown = false;
    }
    $(document).off("keydown").on("keydown", onKeyDown);
    $(document).off("keyup").on("keyup", onKeyUp);

    init();
}

function formatTime(s) {
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return (m < 10 ? "0" + m : m) + ":" + (sec < 10 ? "0" + sec : sec);
}

function startTimer() {
    if (intTimer !== null) return;

    intTimer = setInterval(function () {
        if (!isPaused && gameStarted) {
            sekunde++;
            $("#cas").text(formatTime(sekunde));
        }
    }, 1000);
}

function showGameOver(isWin = false) {
    gameStarted = false;
    if (intTimer) {
        clearInterval(intTimer);
        intTimer = null;
    }

    // 1. Pripravi naslov
    var title = isWin ? "LEVEL COMPLETE!" : "GAME OVER";
    var titleColor = isWin ? "#0affeb" : "#ff4444";
    $("#gameOverScreen h1").text(title).css("color", titleColor);

    // 2. Izpis SCORE: trenutni/vsi
    $("#finalScore").text(score + " / " + totalBricks * 10);

    // 3. Logika za ČAS
    var currentTimeStr = formatTime(sekunde);
    $("#finalTime").text(currentTimeStr); // Dodaj <span id="finalTime"> v HTML

    // Rekord shranimo in prikažemo SAMO ob zmagi
    var bestTime = localStorage.getItem("bestTime");

    if (isWin) {
        if (bestTime === null || sekunde < parseInt(bestTime)) {
            localStorage.setItem("bestTime", sekunde);
            bestTime = sekunde;
            $("#bestTimeDisplay").text(formatTime(bestTime) + " (NEW RECORD!)");
        } else {
            $("#bestTimeDisplay").text(formatTime(bestTime));
        }
    } else {
        // Ob porazu samo pokaži star rekord, brez "New Record"
        $("#bestTimeDisplay").text(bestTime ? formatTime(bestTime) : "--:--");
    }

    $("#gameOverScreen").css("display", "flex");
}

function resetGame() {
    console.log("zbrisano");
    // 1. Skrij okno (uporabimo več načinov za vsak primer)
    $("#gameOverScreen").hide(); // JQuery način
    $("#gameOverScreen").css("display", "none"); // Prisilen CSS način

    // 2. Ponastavi vse ključne spremenljivke iz settings.js
    lives = 3;
    score = 0;
    sekunde = 0;
    gameStarted = false; // Igra naj čaka na klik za začetek

    if (intTimer) {
        clearInterval(intTimer);
        intTimer = null;
    }

    // 3. Posodobi napise na zaslonu (UI)
    $("#lives").text(lives);
    $("#points").text(score);
    $("#cas").text("00:00");

    // 4. Počisti tabele in pripravi prvo žogico
    powers = [];
    paddlew = basePaddleWidth;
    paddleWidthLevel = 0;

    // Postavi žogico na sredino ploščice
    balls = [{
        x: paddlex + paddlew / 2,
        y: HEIGHT - paddleh - PADDLE_OFFSET_BOTTOM - r,
        dx: 2,
        dy: -4
    }];

    // 5. Ponovno naloži opeke in ploščico
    initbricks();
    init_paddle();
}

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        if (intTimer) clearInterval(intTimer); // Ustavi štetje časa
    } else {
        // Ponovno zaženi timer, če je igra že tekla
        if (gameStarted) {
            intTimer = setInterval(function () {
                sekunde++;
                $("#cas").html(formatTime(sekunde));
            }, 1000);
        }
    }
}

function init_paddle() { paddlex = WIDTH / 2; }