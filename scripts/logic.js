// --- OSNOVNE FUNKCIJE ---

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

function init_paddle() { 
    paddlex = WIDTH / 2 - paddlew / 2; 
}

// --- UPRAVLJANJE IGRE ---

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
    $("#finalTime").text(formatTime(sekunde)); 

    $("#gameOverScreen").css("display", "flex");
}

function resetGame() {
    // 1. Skrij okno 
    $("#gameOverScreen").hide();

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


    // Postavi žogico na sredino ploščice
    balls = [{
        x: paddlex + paddlew / 2,
        y: HEIGHT - paddleh - PADDLE_OFFSET_BOTTOM - r,
        dx: 2,
        dy: -4
    }];

    // 4. Ponovno naloži opeke in ploščico
    initbricks();
    init_paddle();
}

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        if (intTimer) clearInterval(intTimer); // Ustavi štetje časa
    } else {
        // Ponovno zaženi timer, če je igra že tekla
        if (gameStarted) startTimer();
    }
}

// --- INICIALIZACIJA OBJEKTOV ---

function initbricks() {
    NROWS = levelMap.length;
    NCOLS = levelMap[0].length;
    bricks = [];
    totalBricks = 0;

    for (var i = 0; i < NROWS; i++) {
        bricks[i] = [];

        for (var j = 0; j < NCOLS; j++) {
            var isBrickHere = levelMap[i][j];

            if (isBrickHere > 0) {
                totalBricks++;

                // --- NAKLJUČNO DOLOČANJE MOČI ---
                var strengthRand = Math.random();
                if (strengthRand < 0.10) bricks[i][j] = 3; // 10% možnosti za HP 3
                else if (strengthRand < 0.30) bricks[i][j] = 2; // 20% možnosti za HP 2
                else bricks[i][j] = 1; // 70% možnosti za HP 1
            } else {
                bricks[i][j] = 0;
            }
        }
    }
}

// --- OKNO IN KRMILJENJE ---

function respondCanvas() {
    var canvas = $('#canvas');
    WIDTH = Math.min($(window).width() * 0.95, 800);
    HEIGHT = $(window).height() * 0.7;

    canvas.attr('width', WIDTH).attr('height', HEIGHT);
    $('#game-container').css({width: WIDTH, height: HEIGHT});

    // Ponovni izračun opek (ker se je širina spremenila)
    if (levelMap.length > 0) {
        var innerWidth = WIDTH - 2 * BRICK_OFFSET_SIDES;
        BRICKWIDTH = (innerWidth - (levelMap[0].length - 1) * PADDING) / levelMap[0].length;
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
            gameStarted = true;
            startTimer();
        }

        if (evt.keyCode == 80) togglePause(); // Tipka 'P'
    }

    function onKeyUp(evt) {
        if (evt.keyCode == 39) rightDown = false;
        else if (evt.keyCode == 37) leftDown = false;
    }

    $(document).off("keydown").on("keydown", onKeyDown);
    $(document).off("keyup").on("keyup", onKeyUp);

    init();
}