import { Circle } from './Circle'

export default class Player extends Circle {
  constructor(x: number, y: number, radius: number, color: string) {
    super(x, y, radius, color)
  }
}
