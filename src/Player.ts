import { Circle, MovingCircle } from './Circle'
import { Velocity } from './types'

export default class Player extends Circle {
  constructor(x: number, y: number, radius: number, color: string) {
    super(x, y, radius, color)
  }
}

export class Particle extends MovingCircle {
  friction = 0.99
  alpha: number

  constructor(
    x: number,
    y: number,
    radius: number,
    color: string,
    velocity: Velocity
  ) {
    super(x, y, radius, color, velocity)
    this.alpha = 1
  }

  draw = (context: CanvasRenderingContext2D) => {
    context.save()
    context.globalAlpha = 0.1
    context.beginPath()
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    context.fillStyle = this.color
    context.fill()
    context.restore()
  }

  update = (context: CanvasRenderingContext2D) => {
    this.draw(context)
    this.velocity.x *= this.friction
    this.velocity.y *= this.friction
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
    this.alpha -= 0.02 * Math.random()
  }
}
