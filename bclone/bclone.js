rows = 3;
tilesPerRow = 10;

canvasHeight = 480;
canvasWidth = 640;

tileMargin = 2;
tileWidth = canvasWidth / tilesPerRow - (2 * tileMargin);
tileHeight = canvasHeight / 20;

paddleWidth = 100;
paddleHeight = 10;

ballRadius = 10;

ballMaxX = (canvasWidth - 2 * ballRadius) / (2 * ballRadius);
ballMaxY = (canvasHeight - 2 * ballRadius) / (2 * ballRadius);

worldWidth = ballMaxX

function Tile(p_x, p_y, p_lifetime = 1) {
  this.x = p_x;
  this.y = p_y;
  this.alive = true;
  this.lifetime = p_lifetime;
  
  this.hit = function() {
    this.lifetime--;
    this.alive = this.lifetime != 0;
  }
}

function V2d(p_x, p_y) {
  this.x = p_x;
  this.y = p_y;
}

function Ball(p_pos, p_dir) {
  this.pos = p_pos;
  this.dir = p_dir; 
}

function Bonus(p_pos, p_points) {
  this.pos = p_pos;
  this.p_points;

  this.tick = function() {
    this.pos.y += 0.15;
  }
}

function Game(tiles) {
  this.tiles = tiles;
  this.running = true;

  this.reset = function() {
    this.paddle = new Paddle(31 * Math.random())
    this.ball = new Ball(
      new V2d(31 * Math.random(), 10),
      new V2d(Math.random() / 3, 0.1));
    this.running = true;
  }
}

function Paddle(pos) {
  this.setDir = function(p_dir) {
    this.dir = p_dir;
  }
  this.dir = 0;
  this.pos = pos;
}

// function create_tiles (rows, tilesPerRow) {
//   var tiles = [];
//   for(i = 0; i < rows; i++) {
//     for(j = 0; j < tilesPerRow; j++) {
//       tiles.push(new Tile(j, i, i + 1))
//     }
//   }
//   return tiles;
// }
function create_tiles (rows, tilesPerRow) {
  var tiles = [];
  for(j = 0; j < tilesPerRow; j++) {
    tiles.push(new Tile(j, 0, 3))
  }
  for(j = 0; j < tilesPerRow; j++) {
    tiles.push(new Tile(j, 3, j < 3 ? 1 : 3))
  }
  for(j = 0; j < tilesPerRow; j++) {
    tiles.push(new Tile(j, 4, j < 4 ? 1 : 3))
  }
  return tiles;
}

function render_tiles(tiles, ctx) {
  tiles.forEach(function(tile) {
    switch(tile.lifetime) {
      case 2:
        ctx.fillStyle = '#FFFF00';
        break;
      case 3:
        ctx.fillStyle = '#FF00FF';
        break;
      default: 
        ctx.fillStyle = '#FF0000';
    }
    ctx.fillRect(
        tileMargin + tile.x * (tileMargin * 2 + tileWidth),
        tileMargin + tile.y * (tileMargin * 2 + tileHeight),    
        tileWidth, tileHeight
    )
  })
}

function render_paddle(paddle, ctx) {
  ctx.fillStyle = '#00FFF0'
  ctx.fillRect(
    paddle.pos * (canvasWidth - paddleWidth) / worldWidth,
    canvasHeight - paddleHeight,
    paddleWidth / 4,
    paddleHeight
  )
  ctx.fillStyle = '#00FF00'
  ctx.fillRect(
    paddle.pos * (canvasWidth - paddleWidth) / worldWidth + paddleWidth / 4,
    canvasHeight - paddleHeight,
    paddleWidth / 2,
    paddleHeight
  )
  ctx.fillStyle = '#00FFF0'
  ctx.fillRect(
    paddle.pos * (canvasWidth - paddleWidth) / worldWidth + 3 * paddleWidth / 4,
    canvasHeight - paddleHeight,
    paddleWidth / 4,
    paddleHeight
  )

}

function render_ball(ball, ctx) {
  ctx.fillStyle = '#0000FF'
  ctx.beginPath();
  ctx.arc(
    ballRadius + (ball.pos.x * ballRadius * 2),
    ballRadius + (ball.pos.y * ballRadius * 2),
    ballRadius,
    0, 2 * Math.PI
  )
  ctx.fill()
}

function render_game (game, canvas) {
  if(!game.pause) tick(game);

  ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  render_tiles(game.tiles, ctx);
  render_paddle(game.paddle, ctx);
  render_ball(game.ball, ctx);

  if(game.running) {
    requestAnimationFrame(function() {
      render_game(game, canvas)
    })
  } else {
    alert('Hävisit')
    game.reset();
    requestAnimationFrame(function() {
      render_game(game, canvas)
    })
  }
}

function tick(game) {
  function updatePaddle() {
    var paddle = game.paddle;
    paddle.pos += paddle.dir;
    if (paddle.pos < 0) {
      paddle.pos = 0;
      paddle.setDir(0);
    }
    else if (paddle.pos > worldWidth) {
      paddle.pos = worldWidth;
      paddle.setDir(0);
    }
    return paddle;
  }
  function updateBall() {
    var ball = game.ball;

    ball.pos.x += ball.dir.x;
    ball.pos.y += ball.dir.y;

    if (ball.pos.x < 0) {
      ball.pos.x *= -1;
      ball.dir.x *= -1;
    }
    else if (ball.pos.x > ballMaxX) {
      ball.pos.x = 2 * ballMaxX - ball.pos.x;
      ball.dir.x *= -1;
    }
    return ball;
  }

  function checkPaddleHit() {
    var paddleMinY = ballMaxY - paddleHeight / (2 * ballRadius);

    var ballLeft = ball.pos.x * 2 * ballRadius;
    var ballRight = (ball.pos.x + 1) * 2 * ballRadius;
    var ballCenter = (ball.pos.x + 0.5) * 2 * ballRadius; 

    var paddleLeft = paddle.pos * (canvasWidth - paddleWidth) / worldWidth;
    var paddleRight = paddle.pos * (canvasWidth - paddleWidth) / worldWidth + paddleWidth;

    var hit = (ballLeft < paddleRight & ballRight > paddleLeft);

    if (ball.pos.y < 0) {
      ball.pos.y *= -1;
      ball.dir.y *= -1;
    }
    else if (hit && ball.pos.y > paddleMinY) {
      ball.pos.y = 2 * paddleMinY - ball.pos.y;
      ball.dir.y *= -1;
      
      var hitSpot = (ballCenter - paddleLeft) / paddleWidth;
      if (hitSpot < 0.25) {
        if(hitSpot < 0.05) {
          ball.dir.x = ball.dir.x < 0 ? 2 * ball.dir.x : -0.05;
        } else {
          ball.dir.x -= 0.5*Math.abs(ball.dir.x);
        }
      } else if (hitSpot > 0.75) {
        if(hitSpot > 0.95) {
          ball.dir.x = ball.dir.x > 0 ? 3 * ball.dir.x : 0.05;  
        } else {
          ball.dir.x += 0.5*Math.abs(ball.dir.x);
        }
      }

      if(paddle.dir < 0 && ball.dir.x < 0 ||
         paddle.dir > 0 && ball.dir.x > 0) {
        console.log('accelleeraaateee');
        ball.dir.x *= 1.1;
        ball.dir.y *= 1.1;
      }

      return true;
    }
    else if (ball.pos.y > ballMaxY) {
      game.running = false;
      ball.pos.y = 2 * ballMaxY - ball.pos.y;
      ball.dir.y *= -1;
    }
    return false;
  }
  
  function checkTileHit() {
    var tiles = game.tiles;
    var ballLeft = ball.pos.x * 2 * ballRadius;
    var ballRight = (ball.pos.x + 1) * 2 * ballRadius;

    var ballUp = ball.pos.y * 2 * ballRadius;
    var ballDown = (ball.pos.y + 1) * 2 * ballRadius;
    
    var potentialHits = tiles.filter(function(tile) {
      var tileLeft = tile.x * (tileWidth + 2 * tileMargin), 
        tileRight = (tile.x + 1) * (tileWidth + 2 * tileMargin),
        tileUp = tile.y * (tileHeight + 2 * tileMargin),
        tileDown = (tile.y + 1) * (tileHeight + 2 * tileMargin) 
  
        return (ballRight > tileLeft && ballLeft < tileRight) 
        && (ballDown > tileUp && ballUp < tileDown);
    });
    
    var tileWasHit = false;
    for(i = 0; i < potentialHits.length; i++) {
      var tile = potentialHits[i];
      var dir = ball.dir;
      var checkUp = dir.y > 0, checkLeft = dir.y > 0;

      var tileUp = tile.y * (tileHeight + 2 * tileMargin);
      var tileDown = (tile.y + 1) * (tileHeight + 2 * tileMargin);
      
      if(checkUp && ballUp < tileUp && ballDown > tileUp ||
        ballUp < tileDown && ballDown > tileDown) {
        tile.hit()
        ball.pos.y += checkUp 
          ? (ballDown - tileUp) / - ballRadius
          : (tileDown - ballUp) / ballRadius 
        ball.dir.y *= -1;
        tileWasHit = true;
        return true;
      }

      var tileLeft = tile.x * (tileWidth + 2 * tileMargin); 
      var tileRight = (tile.x + 1) * (tileWidth + 2 * tileMargin);

      if(checkLeft && ballLeft < tileLeft && ballRight > tileLeft ||
          ballLeft < tileRight && ballRight > tileRight) {
          tile.hit()
          ball.pos.x += checkLeft 
            ? (ballRight - tileLeft) / - ballRadius
            : (tileRight - ballLeft) / ballRadius 
          ball.dir.x *= -1;
          tileWasHit = true;
      }
    }
    return tileWasHit;
  }

  var ball = updateBall();  
  var paddle = updatePaddle();

  if(!checkPaddleHit() && checkTileHit()) {
    game.tiles = game.tiles.filter(function(tile) {
      return tile.alive;
    });
  } 
}

function rungame(canvas) {
  var game = new Game(
    create_tiles(rows, tilesPerRow)
  );
  game.reset();
  document.addEventListener('keydown', function(e) {
    switch(e.keyCode) {
      case 37:
        game.paddle.setDir(-0.25)
        break;
      case 39:
        game.paddle.setDir(0.25)
        break;
      case 32:
        game.pause = !game.pause;
        break;
    }
  });
  document.addEventListener('keyup', function(e) {
    switch(e.keyCode) {
      case 37:
      case 39:
        game.paddle.setDir(0)
        break;
    }
  })

  requestAnimationFrame(function() {
    render_game(game, canvas)
  });
}