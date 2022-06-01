import Game from './Game'
import HUD from './HUD'
import { butcher } from 'butcherjs'
import Player from './entities/Player'

type State = {
  stats: {
    score: number
    projectiles: number
    eliminations: number
    deaths: number
    time: number
  }
  shootingIntervalId?: number
  intervalId?: number
  player: Player | null
}

const restartBtn = document.querySelector('#restartBtn')!
const canvasEl = document.querySelector('canvas')!

const defaultState: State = {
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

// initialize state
export const state = butcher({
  meat: defaultState,
  name: 'state',
})
;(() => {
  const canvas = document.querySelector('canvas')

  if (!canvas) throw new Error('could not retrieve canvas element')

  const game = new Game(canvas!)
  const hud = new HUD(canvas!)

  const player = state.player

  if (!player) {
    return
  }

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
})()
