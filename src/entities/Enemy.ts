import { Velocity } from '../types'
import { getVelocity } from '../utils'

export class Enemy {
  x: number
  y: number
  health: number
  radius: number
  color: string
  velocity: Velocity

  constructor({
    x,
    y,
    health,
    radius,
    color,
    velocity,
  }: {
    x: number
    y: number
    health: number
    radius: number
    color: string
    velocity: Velocity
  }) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.health = health
  }

  public static spawn = (canvasWidth: number, canvasHeight: number) => {
    const health = parseInt((Math.random() * 10 + 10).toFixed(0))
    const radius = health

    let oX
    let oY

    if (Math.random() < 0.5) {
      oX = Math.random() < 0.5 ? 0 - radius : canvasWidth + radius
      oY = Math.random() * canvasHeight
    } else {
      oX = Math.random() * canvasWidth
      oY = Math.random() < 0.5 ? 0 - radius : canvasHeight + radius
    }

    const color = `hsl(${Math.random() * 360}, 50%, 50%)`
    const velocity = getVelocity({
      oX,
      tX: canvasWidth / 2,
      oY,
      tY: canvasHeight / 2,
    })
    return new Enemy({ x: oX, y: oY, health, radius, color, velocity })
  }

  public draw = (c: CanvasRenderingContext2D) => {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    c.fillStyle = this.color
    c.fill()
  }

  public drawHealth = (c: CanvasRenderingContext2D) => {
    const fontSize = this.radius * 2

    c.font = `${fontSize}`
    c.textAlign = 'center'
    c.fillStyle = 'black'
    c.fillText(`${this.health}`, this.x, this.y + fontSize / 10)
  }

  public update = (c: CanvasRenderingContext2D) => {
    this.draw(c)
    this.drawHealth(c)
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}
