import { Enemy } from './entities/Enemy'
import { getVelocity, isColliding } from './utils/utils'
import Player, { Particle } from './entities/Player'
import { MovingCircle } from './entities/Circle'
import { Coords } from './types'
import { gsapFadeIn, gsapFadeOut } from './utils/animations'
import { PLAYER_UPGRADES } from './utils/constants'
import { PowerUp } from './entities/PowerUp'
import Component from './Component'
import { state } from './index'
import { listen } from 'butcherjs'
import {
  initializeState,
  updateDeathCount,
  updateEliminationCount,
  updateProjectileCount,
  updateScore,
} from './stateChangers'

export type Mouse = {
  position: Coords
}

export const GameStatusKeys = ['up', 'down', 'paused']
export type GameStatusTuple = typeof GameStatusKeys
export type GameStatus = GameStatusTuple[number]

// querySelectors for HTML Elements
const gameOverPromptEl =
  document.querySelector<HTMLElement>('#gameOverPromptEl')!
//const resumeBtn = document.querySelector('#resumeBtn')!

export default class Game extends Component {
  projectiles: Array<MovingCircle>
  particles: Array<Particle>
  enemies: Array<Enemy>
  powerUps: Array<PowerUp>
  animationId: number | null
  gameStatus: GameStatus
  frames: number
  mouse: Mouse
  spawnPowerUpsId?: number

  constructor(canvas: HTMLCanvasElement) {
    super(canvas)

    this.initializeCanvas()
    this.handleWindowResize()

    this.animationId = null

    state.player = Game.createPlayer(
      {
        canvasHeight: this.canvas.height,
        canvasWidth: this.canvas.width,
      },
      {}
    )

    this.animationId = null
    this.projectiles = []
    this.particles = []
    this.enemies = []
    this.gameStatus = 'up'
    this.updatePersistentGameStatus()

    this.powerUps = []
    this.frames = 0
    this.mouse = { position: { x: 0, y: 0 } }
    this.spawnPowerUpsId = undefined
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

  static createPlayer = (
    {
      canvasHeight,
      canvasWidth,
    }: {
      canvasHeight: number
      canvasWidth: number
    },
    {
      radius = 20,
      color = 'aqua',
    }: {
      radius?: number
      color?: string
    }
  ): Player => {
    const playerX = canvasWidth / 2
    const playerY = canvasHeight / 2
    return new Player({ x: playerX, y: playerY, radius, color })
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
    this.initialize()
    this.animate()
    this.spawnEnemies()
    this.spawnPowerUps()
  }

  public updatePersistentGameStatus = (): void => {
    sessionStorage.setItem('gameStatus', this.gameStatus)
  }

  public initialize = () => {
    initializeState({
      canvasHeight: this.canvas.height,
      canvasWidth: this.canvas.width,
    })

    this.animationId = null
    this.particles = []
    this.projectiles = []
    this.enemies = []
    this.gameStatus = 'up'
    this.updatePersistentGameStatus()
  }

  public initializeCanvas = () => {
    this.canvas.width = innerWidth
    this.canvas.height = innerHeight
  }

  public handleWindowResize = () => {
    addEventListener('resize', () => {
      this.canvas.width = innerWidth
      this.canvas.height = innerHeight
    })
  }

  public spawnEnemies = (): void => {
    state.intervalId = window.setInterval(() => {
      this.enemies.push(Enemy.spawn(this.canvas.width, this.canvas.height))
    }, Math.random() * 1000 + 500)
  }

  public spawnPowerUps = (): void => {
    this.spawnPowerUpsId = window.setInterval(() => {
      this.powerUps.push(
        new PowerUp({
          coords: {
            x: -30,
            y: Math.random() * this.canvas.height,
          },
          velocity: {
            x: Math.random() + 2,
            y: 0,
          },
        })
      )
    }, 5000)
  }

  public shootProjectile = (origin: Coords, client: Coords): void => {
    const { x, y } = origin
    const { x: clientX, y: clientY } = client

    const velocity = getVelocity({
      oX: x,
      tX: clientX,
      oY: y,
      tY: clientY,
      speed: 8,
    })

    this.projectiles.push(new MovingCircle(x, y, 4, 'white', velocity))

    // update the projectile stat on new projectile creation
    updateProjectileCount()
  }

  public stop = () => {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  public particleEffects = (projectile: MovingCircle, enemy: Enemy) => {
    for (let i = 0; i < enemy.radius * 2; i++) {
      this.particles.push(
        Particle.spawn({
          projectileCoords: {
            ...projectile,
          },
          color: enemy.color,
        })
      )
    }
  }

  public animate = (): void => {
    let player = state.player!
    listen(state, 'player', () => {
      player = state.player!
    })

    if (player == null) {
      return
    }

    this.animationId = requestAnimationFrame(this.animate)
    this.context.fillStyle = 'rgba(0, 0, 0, 0.5)'
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height * 2)
    player.update(this.context, this.canvas)
    this.frames += 1

    // handle PowerUp
    this.powerUps.forEach((powerUp, i) => {
      if (powerUp.coords.x > this.canvas.width) {
        this.powerUps.splice(i, 1)
      } else {
        powerUp.update(this.context)
      }

      const dist = Math.hypot(
        player.x - powerUp.coords.x,
        player.y - powerUp.coords.y
      )

      // when the player collides with powerUp
      if (dist < powerUp.image.height / 2 + player.radius) {
        this.powerUps.splice(i, 1)
        player.powerUp = 'machineGun'
        player.color = 'yellow'

        setTimeout(() => {
          player.powerUp = null
          player.color = 'white'
        }, 5000)
      }
    })

    if (player.powerUp === 'machineGun') {
      const angle = Math.atan2(
        this.mouse.position.y - player.y,
        this.mouse.position.x - player.x
      )
      const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5,
      }

      if (this.frames % 2 === 0)
        this.projectiles.push(
          new MovingCircle(player.x, player.y, 5, 'yellow', velocity)
        )
    }

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
      enemy.update(this.context, { x: player.x, y: player.y })

      // Game over
      if (isColliding(player, enemy)) {
        this.gameOver()
      }

      this.projectiles.forEach((projectile, projectileIdx) => {
        // handle what happens when the projectile hits the enemy
        if (isColliding(projectile, enemy)) {
          // decrease enemy health
          const updatedEnemyHealth = enemy.health - player.damage

          setTimeout(() => {
            if (updatedEnemyHealth > 0) {
              this.enemies.splice(
                i,
                1,
                new Enemy({
                  ...enemy,
                  health: updatedEnemyHealth,
                })
              )
            } else {
              // update the stats
              this.updateScoreFromEnemyRadius(enemy.radius)
              updateEliminationCount()

              // update player attack damage on score milestones
              player.damage = this.checkForAndGetUpgradeAttack()

              // Particle effects
              this.particleEffects(projectile, enemy)

              this.enemies.splice(i, 1)
            }
            this.projectiles.splice(projectileIdx, 1)
          }, 0)
        }
      })
    })
  }

  private checkForAndGetUpgradeAttack = (): number => {
    // get the upgrades that are applied to the player
    const appliedUpgrades = PLAYER_UPGRADES.filter(
      upgrade => state.stats.score >= upgrade.scoreRequired
    )
    const appliedUpgrade = appliedUpgrades[appliedUpgrades.length - 1]

    return appliedUpgrade.upgradedAttack
  }

  private gameOver = () => {
    updateDeathCount()
    this.stop()
    clearInterval(state.intervalId)

    // show game over prompt modal
    gsapFadeIn('#gameOverPromptEl')
    gameOverPromptEl.style.display = 'flex'

    this.gameStatus = 'down'
    this.updatePersistentGameStatus()
  }

  private updateScoreFromEnemyRadius = (enemyRadius: number): void => {
    const score = parseInt(enemyRadius.toFixed(2)) * 100
    updateScore(score)
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
