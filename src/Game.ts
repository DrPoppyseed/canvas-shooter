import { Enemy } from './entities/Enemy'
import { getVelocity, isColliding } from './utils'
import Player, { Particle } from './entities/Player'
import { MovingCircle } from './entities/Circle'
import gsap from 'gsap'
import { Coords, Stats } from './types'
import { gsapFadeIn, gsapFadeOut } from './animations'

export const GameStatusKeys = ['up', 'down', 'paused']
export type GameStatusTuple = typeof GameStatusKeys
export type GameStatus = GameStatusTuple[number]

export const defaultStats: Stats = {
  score: 0,
  projectiles: 0,
  eliminations: 0,
  deaths: 0,
  time: 0,
}

// querySelectors for HTML Elements
const gameOverPromptEl =
  document.querySelector<HTMLElement>('#gameOverPromptEl')!
const scoreStatEl = document.querySelector('#scoreStatEl')!
const elimsStatEl = document.querySelector('#elimsStatEl')!
const deathsStatEl = document.querySelector('#deathsStatEl')!
const shotsStatEl = document.querySelector('#shotsStatEl')!
const restartBtn = document.querySelector('#restartBtn')!
const canvasEl = document.querySelector('canvas')!

export default class Game {
  intervalId: any
  projectiles: Array<MovingCircle>
  particles: Array<Particle>
  enemies: Array<Enemy>
  player: Player
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  animationId: number | null
  stats: Stats
  gameStatus: GameStatus

  constructor(canvas: HTMLCanvasElement | null | undefined) {
    this.canvas = Game.validateCanvas(canvas)
    this.initializeCanvas()

    this.context = Game.validateContext(canvas)
    this.animationId = null

    this.intervalId = undefined
    this.player = this.createPlayer({})
    this.animationId = null
    this.projectiles = []
    this.particles = []
    this.enemies = []
    this.stats = defaultStats
    this.gameStatus = 'up'
    this.updatePersistentGameStatus()
  }

  static getGameStatus = (): GameStatus => {
    const gameStatus = sessionStorage.getItem('gameStatus')

    if (!gameStatus || !GameStatusKeys.includes(gameStatus)) {
      throw new Error(
        `gameStatus not initialized, or invalid value: ${gameStatus}`
      )
    }

    return gameStatus
  }

  static validateCanvas = (
    canvas: HTMLCanvasElement | null | undefined
  ): HTMLCanvasElement => {
    if (!canvas) throw new Error('could not retrieve canvas element')

    return canvas
  }

  static validateContext = (
    canvas: HTMLCanvasElement | null | undefined
  ): CanvasRenderingContext2D => {
    Game.validateCanvas(canvas)
    const context = canvas?.getContext('2d')

    if (!context) throw new Error('could not retrieve canvas context')
    return context
  }

  static run = () => {
    const canvas = document.querySelector('canvas')

    const game = new Game(canvas)

    canvasEl.addEventListener('click', event => {
      const { clientX, clientY } = event
      const { x, y } = game.player

      if (Game.getGameStatus() === 'up') {
        game.shootProjectile({ x, y }, { x: clientX, y: clientY })
      }
    })

    addEventListener('keydown', event => {
      switch (event.code) {
        case 'KeyD':
        case 'ArrowRight':
          game.player.velocity.x = 1
          break
        case 'KeyA':
        case 'ArrowLeft':
          game.player.velocity.x = -1
          break
        case 'KeyW':
        case 'ArrowUp':
          game.player.velocity.y = -1
          break
        case 'KeyS':
        case 'ArrowDown':
          game.player.velocity.y = 1
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
          game.player.velocity.x = 0
          break
        case 'KeyA':
        case 'ArrowLeft':
          game.player.velocity.x = 0
          break
        case 'KeyW':
        case 'ArrowUp':
          game.player.velocity.y = 0
          break
        case 'KeyS':
        case 'ArrowDown':
          game.player.velocity.y = 0
          break
        default:
          break
      }
    })

    game.animate()
    game.spawnEnemies()

    restartBtn.addEventListener('click', () => {
      game.restart()
    })
  }

  public resume = () => {
    this.animate()
    this.spawnEnemies()
  }

  public restart = () => {
    gsapFadeOut('#gameOverPromptEl', () => {
      gameOverPromptEl.style.display = 'none'
    })

    // initialize the class instance
    this.initialize({})
    this.animate()
    this.spawnEnemies()

    // initialize the HTML elements
    scoreStatEl.innerHTML = '0'
    elimsStatEl.innerHTML = '0'
    shotsStatEl.innerHTML = '0'
  }

  public updatePersistentGameStatus = (): void => {
    sessionStorage.setItem('gameStatus', this.gameStatus)
  }

  public initialize = ({
    animationId = null,
    projectiles = [],
    particles = [],
    enemies = [],
    player,
    stats = defaultStats,
    gameStatus = 'up',
  }: {
    animationId?: number | null
    projectiles?: Array<MovingCircle>
    particles?: Array<Particle>
    enemies?: Array<Enemy>
    player?: Player
    stats?: Stats
    gameStatus?: GameStatus
  }) => {
    // initialize with empty player object if parameter not given
    if (player === undefined) {
      this.player = this.createPlayer({})
    } else {
      this.player = player
    }

    this.animationId = animationId
    this.particles = particles
    this.projectiles = projectiles
    this.enemies = enemies
    this.stats = { ...stats, deaths: this.stats.deaths }
    this.gameStatus = gameStatus
    this.updatePersistentGameStatus()
  }

  public initializeCanvas = () => {
    this.canvas.width = innerWidth
    this.canvas.height = innerHeight
  }

  public createPlayer = ({
    radius = 20,
    color = 'aqua',
  }: {
    radius?: number
    color?: string
  }): Player => {
    const playerX = this.canvas.width / 2
    const playerY = this.canvas.height / 2
    return new Player(playerX, playerY, radius, color)
  }

  public spawnEnemies = (): void => {
    this.intervalId = setInterval(() => {
      this.enemies.push(Enemy.spawn(this.canvas.width, this.canvas.height))
    }, 1000)
  }

  public shootProjectile = (origin: Coords, client: Coords): void => {
    const { x, y } = origin
    const { x: clientX, y: clientY } = client

    const velocity = getVelocity({
      oX: x,
      tX: clientX,
      oY: y,
      tY: clientY,
      speed: 4,
    })

    this.projectiles.push(new MovingCircle(x, y, 5, 'white', velocity))

    // update the projectile stat on new projectile creation
    this.stats.projectiles += 1
    shotsStatEl.innerHTML = `${this.stats.projectiles}`
  }

  public stop = () => {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  public animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate)
    this.context.fillStyle = 'rgba(0, 0, 0, 0.2)'
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height * 2)
    this.player.update(this.context, this.canvas)

    this.particles.forEach((p, index) => {
      if (p.alpha <= 0) {
        setTimeout(() => {
          this.particles.splice(index, 1)
        }, 0)
      } else {
        p.update(this.context)
      }
      this.checkAndRemoveIfElOutOfBounds(p, index)
    })

    this.projectiles.forEach(p => {
      p.update(this.context)
    })

    this.enemies.forEach((enemy, i) => {
      enemy.update(this.context)

      // Game over
      if (isColliding(this.player, enemy)) {
        this.gameOver()
      }

      this.projectiles.forEach((projectile, projectileIdx) => {
        if (isColliding(projectile, enemy)) {
          for (let i = 0; i < enemy.radius * 2; i++) {
            this.particles.push(
              new Particle(
                projectile.x,
                projectile.y,
                Math.random() * 5,
                enemy.color,
                {
                  x: (Math.random() - 0.5) * (Math.random() * 8),
                  y: (Math.random() - 0.5) * (Math.random() * 8),
                }
              )
            )
          }

          if (enemy.radius - 10 > 5) {
            // update the stats
            this.updateScoreFromEnemyRadius(enemy.radius)

            // animate smooth enemy shrinking animation
            gsap.to(enemy, {
              radius: enemy.radius - 10,
            })

            // remove projectile after collision
            setTimeout(() => {
              this.projectiles.splice(projectileIdx, 1)
            }, 0)
          } else {
            // update the stats
            this.updateScoreFromEnemyRadius(enemy.radius)
            this.stats.eliminations += 1
            elimsStatEl.innerHTML = `${this.stats.eliminations}`

            setTimeout(() => {
              this.enemies.splice(i, 1)
              this.projectiles.splice(projectileIdx, 1)
            }, 0)
          }
        }
      })
    })
  }

  private gameOver = () => {
    this.stats.deaths += 1
    deathsStatEl.innerHTML = `${this.stats.deaths}`
    this.stop()
    clearInterval(this.intervalId)

    // show game over prompt modal
    gsapFadeIn('#gameOverPromptEl')
    gameOverPromptEl.style.display = 'flex'

    this.gameStatus = 'down'
    this.updatePersistentGameStatus()
  }

  private updateScoreFromEnemyRadius = (enemyRadius: number): void => {
    const score = parseInt(enemyRadius.toFixed(2)) * 100
    this.stats.score += score
    scoreStatEl.innerHTML = `${this.stats.score}`
  }

  // Check if the projectile coordinates is out of the canvas's bounds.
  // If so, remove the projectile from the array to keep the projectile array
  // length short.
  private checkAndRemoveIfElOutOfBounds = (
    p: Particle | MovingCircle,
    index: number
  ): void => {
    if (
      p.x - p.radius < 0 ||
      p.x - p.radius > this.canvas.width ||
      p.y + p.radius < 0 ||
      p.y - p.radius > this.canvas.height
    ) {
      if (p instanceof Particle) {
        setTimeout(() => {
          this.particles.splice(index, 1)
        }, 0)
      } else {
        setTimeout(() => {
          this.projectiles.splice(index, 1)
        }, 0)
      }
    }
  }
}
