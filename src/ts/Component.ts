import State from './State'

export default class Component {
  protected state: State
  protected canvas: HTMLCanvasElement
  protected context: CanvasRenderingContext2D

  constructor(canvas: HTMLCanvasElement, state: State) {
    this.canvas = canvas
    this.state = state
    this.context = this.getValidContext(canvas)
  }

  private getValidContext = (canvas: HTMLCanvasElement) => {
    const context = canvas?.getContext('2d')
    if (!context) throw new Error('could not retrieve canvas context')
    return context
  }
}
