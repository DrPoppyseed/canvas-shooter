import { Enemy } from './Enemy'
import { getVelocity, isColliding } from './utils'
import Player from './Player'
import { MovingCircle } from './Circle'

export default class Game {
  projectiles: MovingCircle[]
  enemies: Enemy[]
  player: Player
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  animationId: number | null

  constructor(canvas: HTMLCanvasElement | null | undefined) {
    this.canvas = Game.validateCanvas(canvas)
    this.initializeCanvas()

    this.context = Game.validateContext(canvas)
    this.animationId = null

    this.projectiles = []
    this.enemies = []
    this.player = this.createPlayer({})
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

    addEventListener('click', event => {
      const { clientX, clientY } = event
      game.shootProjectile(clientX, clientY)
    })

    game.animate()
    game.spawnEnemies()
  }

  initializeCanvas = () => {
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
    setInterval(() => {
      this.enemies.push(Enemy.spawn(this.canvas.width, this.canvas.height))
    }, 1000)
  }

  public shootProjectile = (clientX: number, clientY: number): void => {
    const x = this.canvas.width / 2
    const y = this.canvas.height / 2
    const velocity = getVelocity({
      oX: x,
      tX: clientX,
      oY: y,
      tY: clientY,
      speed: 4,
    })
    this.projectiles.push(new MovingCircle(x, y, 5, 'white', velocity))
  }

  public animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate)
    this.context.fillStyle = 'rgba(0, 0, 0, 0.1)'
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height * 2)
    this.player.draw(this.context)

    this.projectiles.forEach((p, index) => {
      p.update(this.context)

      if (
        p.x - p.radius < 0 ||
        p.x - p.radius > this.canvas.width ||
        p.y + p.radius < 0 ||
        p.y - p.radius > this.canvas.height
      ) {
        setTimeout(() => {
          this.projectiles.splice(index, 1)
        }, 0)
      }
    })

    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i]
      enemy.update(this.context)

      if (isColliding(this.player, enemy)) {
        cancelAnimationFrame(this.animationId)
      }

      this.projectiles.forEach((projectile, projectileIdx) => {
        if (isColliding(projectile, enemy)) {
          if (enemy.radius > 10) {
            enemy.radius -= 10
            setTimeout(() => {
              this.projectiles.splice(projectileIdx, 1)
            }, 0)
          } else {
            setTimeout(() => {
              this.enemies.splice(i, 1)
              this.projectiles.splice(projectileIdx, 1)
            }, 0)
          }
        }
      })
    }
  }
}
