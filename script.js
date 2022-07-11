(function() {
  var play = $("#start-game");
  var players = {
    player1: "Funky Chicken",
    player2: "Rubber Duck"
  };
  var currentPlayer = "player1";
  var board = $("#board");
  var slots = $(".slot");
  var userR;
  var userC;
  var movesCount = 1;
  var maxMoves;
  var winner;
  var str;

  // get current scores from localStorage
  var player1Wins;
  var player2Wins;
  function checkScore() {
    if (localStorage.getItem(players["player1"])) {
      player1Wins = localStorage.getItem(players["player1"]);
    } else {
      player1Wins = 0;
    }
    if (localStorage.getItem(players["player2"])) {
      player2Wins = localStorage.getItem(players["player2"]);
    } else {
      player2Wins = 0;
    }
  }
  var score;
  checkScore();

  // board size selector
  $(".standard").on("click", function() {
    $(".custom-game").removeClass("show");
    $(".custom").removeClass("selected");
    $(".standard-game").addClass("show");
    $(".standard").addClass("selected");
  });

  $(".custom").on("click", function() {
    $(".standard-game").removeClass("show");
    $(".standard").removeClass("selected");
    $(".custom").addClass("selected");
    $(".custom-game").addClass("show");
  });

  // settings: play button
  play.on("click", function() {
    if ($("#player1").val()) {
      players["player1"] = $("#player1").val();
    }
    if ($("#player2").val()) {
      players["player2"] = $("#player2").val();
    }
    if ($(".standard").hasClass("selected")) {
      userR = 6;
      userC = 7;
    } else if (
      ($(".custom").hasClass("selected") && !$("#userR").val()) ||
      !$("#userC").val()
    ) {
      return;
    } else if (
      $("#userR").val() >= 4 &&
      $("#userR").val() <= 8 &&
      $("#userC").val() >= 5 &&
      $("#userC").val() <= 10
    ) {
      userR = $("#userR").val();
      userC = $("#userC").val();
    }
    $("#settings").css("display", "none");
    maxMoves = userR * userC;
    createBoard(userR, userC);
    checkScore();
  });

  // alternate current player
  function switchPlayers() {
    if (currentPlayer == "player1") {
      currentPlayer = "player2";
    } else {
      currentPlayer = "player1";
    }
    movesCount++;
    str = "";
  }

  // create board grid
  function createBoard(x, y) {
    var headerColumns = "";
    var createColumns = "";
    var createRows = "";

    for (var i = 1; i <= x; i++) {
      createRows += "<div class='slot row" + i + "'></div>";
    }
    for (var j = 1; j <= y; j++) {
      headerColumns += "<div class='header col" + j + "'></div>";
      createColumns += "<div id='col" + j + "' class='column'></div>";
    }
    board.append("<div id='board-header'>" + headerColumns + "</div>");
    board.append("<div id='board-body'>" + createColumns + "</div>");
    board.append(
      "<div id='board-footer'><div class='player1'>" +
        players["player1"] +
        "</div>" +
        "<div class='player2'>" +
        players["player2"] +
        "</div></div>"
    );
    $(".column").html(createRows);

    $("#board-body").css({
      width: y * 80 + y * 20 + 40 + "px"
    });
    board.addClass("unlocked");

    // identify player piece on mousemove
    var headerSlots = $(".header");
    var currentColumn;
    $(".column").on("mouseover", function(event) {
      currentColumn = $(event.currentTarget).index();
      for (var p = 0; p < headerSlots.length; p++) {
        if (headerSlots.eq(p).index() == currentColumn) {
          headerSlots.removeClass(currentPlayer);
          headerSlots.eq(p).addClass(currentPlayer);
        }
      }
    });

    // add piece to the board
    $(".column").on("click", function(event) {
      if (board.hasClass("locked")) {
        return;
      } else {
        currentColumn = $(event.currentTarget).index();
        var slotsInColumn = $(event.currentTarget).find(".slot");

        for (var i = userR - 1; i >= 0; i--) {
          var slotInColumn = slotsInColumn.eq(i);
          if (
            !slotInColumn.hasClass("player1") &&
            !slotInColumn.hasClass("player2")
          ) {
            slotInColumn.addClass(currentPlayer);
            headerSlots.removeClass(currentPlayer);
            break;
          }
        }
        if (i == -1) {
          return;
        }
        var slotsInRow = $(".row" + (i + 1));

        // check for victory
        if (
          checkForVictory(slotsInColumn) ||
          checkForVictory(slotsInRow) ||
          checkDiagonals()
        ) {
          winner = currentPlayer;
          endGame();
        }
        if (movesCount >= maxMoves) {
          winner = "tie";
          endGame();
        }
        switchPlayers();
      }
    });
    // check if last play returns a set of 4 consecutive pieces for the same player
    function checkForVictory(slots) {
      for (var j = 0; j < movesCount; j++) {
        if (slots.eq(j).hasClass(currentPlayer)) {
          str += "x";
        } else {
          str += "o";
        }
      }
      if (str.indexOf("xxxx") > -1) {
        console.log(str);

        console.log("Horizontal or vertical win");
        return str.indexOf("xxxx");
      }
    }

    // check diagonals
    function checkDiagonals() {
      //row, column
      for (var c = 0; c <= userC; c++) {
        for (var r = 0; r <= userR; r++) {
          if (
            $(".column")
              .eq(c)
              .find(".row" + r)
              .hasClass(currentPlayer) &&
            $(".column")
              .eq(c + 1)
              .find(".row" + (r + 1))
              .hasClass(currentPlayer) &&
            $(".column")
              .eq(c + 2)
              .find(".row" + (r + 2))
              .hasClass(currentPlayer) &&
            $(".column")
              .eq(c + 3)
              .find(".row" + (r + 3))
              .hasClass(currentPlayer)
          ) {
            return true;
          } else if (
            $(".column")
              .eq(c)
              .find(".row" + r)
              .hasClass(currentPlayer) &&
            $(".column")
              .eq(c + 1)
              .find(".row" + (r - 1))
              .hasClass(currentPlayer) &&
            $(".column")
              .eq(c + 2)
              .find(".row" + (r - 2))
              .hasClass(currentPlayer) &&
            $(".column")
              .eq(c + 3)
              .find(".row" + (r - 3))
              .hasClass(currentPlayer)
          ) {
            return true;
          }
        }
      }
    }

    // winning screen
    function endGame() {
      if (winner == "tie") {
        setTimeout(function() {
          $(".reset-button").css({ color: "#3c4143" });
          $(".end-game").addClass("on");
          $(".end-text").html("No one wins!");
          board.removeClass("unlocked").addClass("locked");
        }, 2000);
      }
      var win = players[winner] + " WINS!";
      $(".reset-button").css({ color: winner });
      $(".end-game").addClass("on " + winner);
      $(".end-text").html(win);

      board.removeClass("unlocked").addClass("locked");
      if (currentPlayer == "player1") {
        player1Wins++;
        score = player1Wins;
      }
      if (currentPlayer == "player2") {
        player2Wins++;
        score = player2Wins;
      }
      localStorage.setItem(players[currentPlayer], score);
      var topWinners = "<p>RANKING</p>";
      for (var t = 0; t < 3; t++) {
        var sortedScores = sortScores();
        if (sortedScores[t]) {
          topWinners +=
            "<div class='top-winner'>" +
            sortedScores[t][0] +
            ": " +
            sortedScores[t][1] +
            "</div>";
        }
      }

      $(".top-winners").html(topWinners);
      movesCount = 0;
    }

    // new game button
    $(".reset-button").on("click", function() {
      for (var s = $(".slot").length; s >= 0; s--) {
        var slot = $(".slot").eq(s);
        slot.removeClass("player1");
        slot.removeClass("player2");
      }
      board.removeClass("locked").addClass("unlocked");
      $(".end-game").removeClass("on " + currentPlayer);
    });

    // settings button
    $(".settings-button").on("click", function() {
      location.reload();
    });
  }

  // order scores from localStorage
  function sortScores() {
    var sorted = [];
    for (var t = 0; t < localStorage.length; t++) {
      sorted.push([
        localStorage.key(t),
        localStorage.getItem(localStorage.key(t))
      ]);
    }
    sorted.sort(function(a, b) {
      return b[1] - a[1];
    });
    return sorted;
  }
})();
