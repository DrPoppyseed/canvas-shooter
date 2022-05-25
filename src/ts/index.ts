import Game from './Game'
import State from './State'
import HUD from './HUD'

const restartBtn = document.querySelector('#restartBtn')!
const canvasEl = document.querySelector('canvas')!

;(() => {
  const canvas = document.querySelector('canvas')

  if (!canvas) throw new Error('could not retrieve canvas element')

  const defaultState = {
    stats: {
      score: 0,
      projectiles: 0,
      eliminations: 0,
      deaths: 0,
      time: 0,
    },
    shootingIntervalId: undefined,
    intervalId: undefined,
    player: null,
  }
  const state = new State(defaultState)
  const game = new Game(canvas!, state)
  const hud = new HUD(canvas!, state)

  const player = state.get('player')

  canvasEl.addEventListener('click', event => {
    const { clientX, clientY } = event
    const { x, y } = player

    if (Game.getGameStatus() === 'up') {
      game.shootProjectile({ x, y }, { x: clientX, y: clientY })
    }
  })

  addEventListener('mousemove', event => {
    game.mouse.position.x = event.clientX
    game.mouse.position.y = event.clientY
  })

  addEventListener('keydown', event => {
    switch (event.code) {
      case 'KeyD':
      case 'ArrowRight':
        player.velocity.x = 1
        break
      case 'KeyA':
      case 'ArrowLeft':
        player.velocity.x = -1
        break
      case 'KeyW':
      case 'ArrowUp':
        player.velocity.y = -1
        break
      case 'KeyS':
      case 'ArrowDown':
        player.velocity.y = 1
        break
      case 'Escape':
        if (game.gameStatus === 'paused') {
          game.resume()
          game.gameStatus = 'up'
        } else {
          game.stop()
          game.gameStatus = 'paused'
        }
        break
      case 'Tab':
        game.restart()
        break
      default:
        break
    }
  })

  addEventListener('keyup', event => {
    switch (event.code) {
      case 'KeyD':
      case 'ArrowRight':
        player.velocity.x = 0
        break
      case 'KeyA':
      case 'ArrowLeft':
        player.velocity.x = 0
        break
      case 'KeyW':
      case 'ArrowUp':
        player.velocity.y = 0
        break
      case 'KeyS':
      case 'ArrowDown':
        player.velocity.y = 0
        break
      default:
        break
    }
  })

  game.animate()
  game.spawnEnemies()
  game.spawnPowerUps()

  restartBtn.addEventListener('click', () => {
    game.restart()
    hud.restart()
  })

  // save game state every 5 minutes
  window.setInterval(() => {
    state.save()
  }, 300000)
})()
