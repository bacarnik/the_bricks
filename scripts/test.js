function drawIt() {
    var x = 150;
    var y = 150;
    var dx = 2;
    var dy = 4;
    var WIDTH;
    var HEIGHT;
    var r = 10;
    var ctx;
    var paddlex;
    var paddleh = 10;
    var paddlew = 75;
    var rightDown = false;
    var leftDown = false;
    var bricks;
    var NROWS = 5;
    var NCOLS = 5;
    var BRICKWIDTH;
    var BRICKHEIGHT = 20;
    var BRICK_OFFSET_TOP = 40;   // Prostor nad opekami (v pikslih)
    var BRICK_OFFSET_SIDES = 80;  // Prostor ob strani (v pikslih)
    var PADDING = 1;
    var rowcolors = ["#FF1C0A", "#FFFD0A", "#00A308", "#0008DB", "#EB0093"];
    var paddlecolor = "#ffffff";
    var PADDLE_OFFSET_BOTTOM = 20;
    var ballcolor = "#ffffff";
    var sekunde;
    var sekundeI;
    var minuteI;
    var intTimer;
    var izpisTimer;
    var intervalId; // Nova spremenljivka za nadzor igre

    function init() {
        ctx = $('#canvas')[0].getContext("2d");
        // Začetna nastavitev velikosti
        respondCanvas();
        // Poslušalec za spremembo velikosti okna
        $(window).resize(respondCanvas);

        sekunde = 0;
        intTimer = setInterval(timer, 1000);
        intervalId = setInterval(draw, 10); // Shranimo interval v spremenljivko
    }

    function respondCanvas() {
        var container = $('#container');
        var canvas = $('#canvas');

        // Nastavimo fizične piksle canvasa na velikost starša
        WIDTH = container.width();
        HEIGHT = container.height();

        canvas.attr('width', WIDTH);
        canvas.attr('height', HEIGHT);

        // Ponovno izračunamo širino opek glede na novo širino zaslona
        BRICKWIDTH = ((WIDTH - (2 * BRICK_OFFSET_SIDES)) / NCOLS) - PADDING;

        // Popravimo položaj ploščice, da ne ostane izven zaslona
        if (paddlex + paddlew > WIDTH) paddlex = WIDTH - paddlew;
    }

    function circle(x, y, r) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
    }

    function rect(x, y, w, h) {
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.closePath();
        ctx.fill();
    }

    function clear() {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
    }

    function init_paddle() {
        paddlex = WIDTH / 2;
        paddleh = 10;
        paddlew = 75;
    }

    function onKeyDown(evt) {
        if (evt.keyCode == 39) {
            rightDown = true;
        } else if (evt.keyCode == 37) leftDown = true;
    }

    function onKeyUp(evt) {
        if (evt.keyCode == 39) rightDown = false;
        else if (evt.keyCode == 37) leftDown = false;
    }
    $(document).keydown(onKeyDown);
    $(document).keyup(onKeyUp);

    function initbricks() { //inicializacija opek - polnjenje v tabelo
        NROWS = 10;
        NCOLS = 10;
        BRICKWIDTH = ((WIDTH - (2 * BRICK_OFFSET_SIDES)) / NCOLS) - PADDING;
        BRICKHEIGHT = 15;
        PADDING = 1;
        bricks = new Array(NROWS);
        for (i = 0; i < NROWS; i++) {
            bricks[i] = new Array(NCOLS);
            for (j = 0; j < NCOLS; j++) {
                bricks[i][j] = 1;
            }
        }
    }

    //timer
    function timer() {
        sekunde++;

        sekundeI = ((sekundeI = (sekunde % 60)) > 9) ? sekundeI : "0" + sekundeI;
        minuteI = ((minuteI = Math.floor(sekunde / 60)) > 9) ? minuteI : "0" + minuteI;
        izpisTimer = minuteI + ":" + sekundeI;

        $("#cas").html(izpisTimer);
    }
    //END LIBRARY CODE

    function draw() {
        clear();
        ctx.fillStyle = ballcolor;
        circle(x, y, r);

        // 1. Premik ploščice
        if (rightDown) {
            if ((paddlex + paddlew) < WIDTH) paddlex += 5;
            else paddlex = WIDTH - paddlew;
        } else if (leftDown) {
            if (paddlex > 0) paddlex -= 5;
            else paddlex = 0;
        }
        ctx.fillStyle = paddlecolor;
        rect(paddlex, HEIGHT - paddleh - PADDLE_OFFSET_BOTTOM, paddlew, paddleh);

        // 2. Risanje opek in logika za trke (z vseh strani)
        for (var i = 0; i < NROWS; i++) {
            for (var j = 0; j < NCOLS; j++) {
                if (bricks[i][j] == 1) {
                    var brickX = (j * (BRICKWIDTH + PADDING)) + BRICK_OFFSET_SIDES;
                    var brickY = (i * (BRICKHEIGHT + PADDING)) + BRICK_OFFSET_TOP;

                    ctx.fillStyle = rowcolors[i];
                    rect(brickX, brickY, BRICKWIDTH, BRICKHEIGHT);

                    // Detekcija trka
                    if (x + r > brickX && x - r < brickX + BRICKWIDTH &&
                        y + r > brickY && y - r < brickY + BRICKHEIGHT) {

                        bricks[i][j] = 0;
                        var prevY = y - dy;
                        // Če je bila žogica prej nad ali pod opeko, obrni vertikalno smer
                        if (prevY + r <= brickY || prevY - r >= brickY + BRICKHEIGHT) {
                            dy = -dy;
                        } else {
                            dx = -dx;
                        }
                    }
                }
            }
        }

        // 3. Odboji od sten (levo/desno) in stropa
        if (x + dx > WIDTH - r || x + dx < r) dx = -dx;
        if (y + dy < r) dy = -dy;

        var paddleTop = HEIGHT - paddleh - PADDLE_OFFSET_BOTTOM;
        
        // 4. LOGIKA ZA TLA IN PLOŠČICO
        if (dy > 0 && y + r >= paddleTop && y + r <= paddleTop + dy + 2) {
            if (x > paddlex && x < paddlex + paddlew) {
                var hitPos = (x - (paddlex + paddlew / 2)) / (paddlew / 2);
                dx = 6 * hitPos; 
                dy = -dy;
                y = paddleTop - r; // "Odlepi" žogico od ploščice
            }
        }
        /* if (y + dy > HEIGHT - r) {
            // Če zadane ploščico, se odbije
            if (x > paddlex && x < paddlex + paddlew) {
                dx = 8 * ((x - (paddlex + paddlew / 2)) / paddlew);
                dy = -dy;
            } else {
                // Žogica je padla na tla: ustavi se na dnu
                y = HEIGHT - r;
                dx = 0;
                dy = 0;

                 // Zakomentirana stara koda za konec igre
                clearInterval(intervalId); // Ustavimo risanje
                clearInterval(intTimer);   // Ustavimo uro
                alert("Konec igre! Vaš čas: " + $("#cas").text());
                location.reload(); // Osvežimo stran za novo igro 
            }
        } */

        if (y + r + dy > HEIGHT) {
            y = HEIGHT - r;
            dx = 0;
            dy = 0;
        }

        // 5. PONOVNI ODZIV: Če je žogica na tleh in jo zadeneš s ploščico, se spet odbije
        // To omogoča, da se žogica "aktivira", ko prineseš paddle do nje
        if (dy === 0 && y >= HEIGHT - r) {
            if (x > paddlex && x < paddlex + paddlew) {
                dx = 2; 
                dy = -4;
                y = paddleTop - r;
            }
        }

        x += dx;
        y += dy;
    }


    init();
    init_paddle();
    initbricks();
}