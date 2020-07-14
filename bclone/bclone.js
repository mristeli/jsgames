rows = 3;
tilesPerRow = 8;

canvasHeight = 480;
canvasWidth = 640;

tileMargin = 5;
tileWidth = canvasWidth / tilesPerRow - (2 * tileMargin);
tileHeight = canvasHeight / 20;

paddleWidth = 100;
paddleHeight = 10;

ballRadius = 10;

ballMaxX = (canvasWidth - 2 * ballRadius) / (2 * ballRadius);
ballMaxY = (canvasHeight - 2 * ballRadius) / (2 * ballRadius);

worldWidth = 32

function Tile(p_x, p_y) {
  this.x = p_x;
  this.y = p_y;
}

function V2d(p_x, p_y) {
  this.x = p_x;
  this.y = p_y;
}

function Ball(p_pos, p_dir) {
  this.pos = p_pos;
  this.dir = p_dir; 
}

function Game(tiles, paddle, ball_o) {
  this.tiles = tiles;
  this.paddle = paddle;
  this.ball = ball_o;
  this.running = true;
}

var dead_tile = new Tile(-1, -1)

function get_tiles (rows, tilesPerRow) {
  var tiles = [rows + tilesPerRow];
  for(i = 0; i < rows; i++) {
    for(j = 0; j < tilesPerRow; j++) {
      tiles[i * tilesPerRow + j] = new Tile(j, i)
    }
  }
  return tiles;
}

function render_tiles(tiles, ctx) {
  ctx.fillStyle = '#FF0000';
  for (i = 0; i < rows; i++) {
    for(j = 0; j < tilesPerRow; j++) {
      tile = tiles[i * tilesPerRow + j];
      if(tile.x < 0) continue;
      ctx.fillRect(
        tileMargin + tile.x * (tileMargin * 2 + tileWidth),
        tileMargin + tile.y * (tileMargin * 2 + tileHeight),    
        tileWidth, tileHeight
      )
    }
  }
}

function render_paddle(paddle, ctx) {
  ctx.fillStyle = '#00FF00'
  ctx.fillRect(
    paddle * (canvasWidth - paddleWidth) / worldWidth,
    canvasHeight - paddleHeight,
    paddleWidth,
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
  tick(game);

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
    alert('stop')
  }
}

function tick(game) {
  var ball = game.ball;

  ball.pos.x += ball.dir.x;
  ball.pos.y += ball.dir.y;

  if(ball.pos.x < 0) {
    ball.pos.x *= -1; 
    ball.dir.x *= -1;
  } else if ( ball.pos.x > ballMaxX ) {
    ball.pos.x = 2 * ballMaxX - ball.pos.x;
    ball.dir.x *= -1;
  }
  
  if(ball.pos.y < 0) {
    ball.pos.y *= -1; 
    ball.dir.y *= -1;
  } else if ( ball.pos.y > ballMaxY ) {
    ball.pos.y = 2 * ballMaxY - ball.pos.y;
    ball.dir.y *= -1;
  }

  var paddlePosY = ballMaxY - 0.5;
  var ballPaddleD = ball.pos.x - game.paddle;
  var worldPaddleWidth = worldWidth / canvasWidth * paddleWidth;

  if( (ballPaddleD > 0 && ballPaddleD < worldPaddleWidth)  
      && ball.pos.y > paddlePosY ) {
         ball.pos.y = 2 * paddlePosY - ball.pos.y;
         ball.dir.y *= -1;        
  }
}

function rungame(canvas) {
  var game = new Game(
    get_tiles(rows, tilesPerRow),
    2,
    new Ball(
      new V2d(4.0, 10.0), 
      new V2d(0.15, 0.10)), 
  );
  canvas.addEventListener('onkeydown', function check(e) {
    alert(e.keyCode);
  })
  requestAnimationFrame(function() {
    render_game(game, canvas)
  });
}