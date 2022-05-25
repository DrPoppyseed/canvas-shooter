// extract the HUD
import State from './State'
import Component from './Component'

const scoreStatEl = document.querySelector('#scoreStatEl')!
const elimsStatEl = document.querySelector('#elimsStatEl')!
const shotsStatEl = document.querySelector('#shotsStatEl')!

export default class HUD extends Component {
  constructor(canvas: HTMLCanvasElement, state: State) {
    super(canvas, state)
  }

  public restart = () => {
    scoreStatEl.innerHTML = '0'
    elimsStatEl.innerHTML = '0'
    shotsStatEl.innerHTML = '0'
  }
}
