import { Circle, MovingCircle } from './Circle'
import { Coords, Dimensions, Velocity } from '../types'

export default class Player extends Circle {
  velocity: Velocity
  damage: number
  health: number

  constructor({
    x,
    y,
    damage = 1,
    health = 1,
    radius,
    color,
    velocity,
  }: {
    x: number
    y: number
    damage?: number
    health?: number
    radius: number
    color: string
    velocity?: Velocity
  }) {
    if (velocity === undefined) {
      velocity = {
        x: 0,
        y: 0,
      }
    }
    super(x, y, radius, color)

    this.damage = damage
    this.health = health
    this.velocity = velocity
  }

  draw = (context: CanvasRenderingContext2D) => {
    context.beginPath()
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    context.fillStyle = this.color
    context.fill()
  }

  update = (
    context: CanvasRenderingContext2D,
    { width, height }: Dimensions
  ) => {
    this.draw(context)

    // make sure the player doesn't go out of bounds
    if (this.x + this.radius + this.velocity.x <= width - 1) {
      this.x += this.velocity.x
    } else {
      this.velocity.x = 0
    }
    if (this.y + this.radius + this.velocity.y <= height - 1) {
      this.y += this.velocity.y
    }
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

  static spawn = ({
    projectileCoords,
    radius,
    color,
    velocity,
  }: {
    projectileCoords: Coords
    radius?: number
    color: string
    velocity?: Velocity
  }): Particle => {
    // create reasonable defaults
    // velocity:
    if (velocity === undefined) {
      velocity = {
        x: (Math.random() - 0.5) * (Math.random() * 8),
        y: (Math.random() - 0.5) * (Math.random() * 8),
      }
    }

    // radius:
    if (radius === undefined) {
      radius = Math.random() * 5
    }

    return new Particle(
      projectileCoords.x,
      projectileCoords.y,
      radius,
      color,
      velocity
    )
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
