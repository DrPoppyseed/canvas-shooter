// extract the HUD
import Component from './Component'

const scoreStatEl = document.querySelector('#scoreStatEl')!
const elimsStatEl = document.querySelector('#elimsStatEl')!
const shotsStatEl = document.querySelector('#shotsStatEl')!

export default class HUD extends Component {
  constructor(canvas: HTMLCanvasElement) {
    super(canvas)
  }

  public restart = () => {
    scoreStatEl.innerHTML = '0'
    elimsStatEl.innerHTML = '0'
    shotsStatEl.innerHTML = '0'
  }
}
