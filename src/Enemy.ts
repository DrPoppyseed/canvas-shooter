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
    const oX = Math.random() * canvasWidth
    const oY = Math.random() * canvasHeight
    const radius = Math.random() * 10 + 10
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
