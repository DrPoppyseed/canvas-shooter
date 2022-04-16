import { MovingCircle } from './Circle'
import { Velocity } from './types'
import { getVelocity } from './utils'

export class Enemy extends MovingCircle {
  constructor(
    x: number,
    y: number,
    radius: number,
    color: string,
    velocity: Velocity
  ) {
    super(x, y, radius, color, velocity)
  }

  public static spawn = (canvasWidth: number, canvasHeight: number) => {
    const radius = Math.random() * 10 + 10

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
    return new Enemy(oX, oY, radius, color, velocity)
  }
}
