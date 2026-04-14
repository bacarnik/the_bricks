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

function showGameOver() {
    gameStarted = false;
    if (intTimer) {
        clearInterval(intTimer);
        intTimer = null;
    }

    // 1. Pridobi trenutni rekord iz shrambe (v sekundah)
    var bestTime = localStorage.getItem("bestTime");

    // 2. Preveri, če je trenutni čas boljši (manjši) od rekorda
    // (bestTime == null pomeni, da igramo prvič)
    if (bestTime === null || sekunde < parseInt(bestTime)) {
        localStorage.setItem("bestTime", sekunde);
        bestTime = sekunde;
    }

    // 3. Pretvori sekunde v format MM:SS za izpis
    function formatTime(s) {
        var m = Math.floor(s / 60);
        var sec = s % 60;
        return (m < 10 ? "0" + m : m) + ":" + (sec < 10 ? "0" + sec : sec);
    }

    // 4. Izpis v HTML
    $("#finalTime").text(formatTime(sekunde)); // Trenutni čas
    $("#bestTimeDisplay").text(formatTime(bestTime) + "  !!!NEW  RECORD!!!"); // Rekordni čas
    $("#gameOverScreen").css("display", "flex").fadeIn(500);
}

function resetGame() {
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

function drawIt() {

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

        // NCOLS vzamemo iz naše mape
        NCOLS = levelMap[0].length;
        BRICKWIDTH = ((WIDTH - (2 * BRICK_OFFSET_SIDES)) / NCOLS) - PADDING;

        if (paddlex + paddlew > WIDTH) paddlex = WIDTH - paddlew;
    }

    function init_paddle() { paddlex = WIDTH / 2; }

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

    // --- Inicializacija opek ---
    function initbricks() {
        NROWS = levelMap.length;    // Število vrstic iz tabele
        NCOLS = levelMap[0].length; // Število stolpcev

        bricks = new Array(NROWS);
        brickPowers = new Array(NROWS);

        for (var i = 0; i < NROWS; i++) {
            bricks[i] = new Array(NCOLS);
            brickPowers[i] = new Array(NCOLS);
            for (var j = 0; j < NCOLS; j++) {

                // Nastavimo tip opeke direktno iz levelMap
                var brickType = levelMap[i][j];
                bricks[i][j] = brickType;

                // Power-upe določimo samo tam, kjer je opeka (tip 1)
                if (brickType === 1) {
                    var rand = Math.random();
                    if (rand < 0.04) brickPowers[i][j] = "extraBall";
                    else if (rand < 0.08) brickPowers[i][j] = "bigPaddle";
                    else if (rand < 0.016) brickPowers[i][j] = "slowPaddle";
                    else brickPowers[i][j] = null;
                } else {
                    brickPowers[i][j] = null;
                }
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
    init();
}