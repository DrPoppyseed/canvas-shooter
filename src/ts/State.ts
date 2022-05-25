type StateMap = Map<string, any>
type LocalStorageSave = {
  key: string
  timestamp: number
  value: string
}

// Work as an in-memory datastore like zustand.
// Basically, a glorified object
// However, in extracting the game state with the view component, we can
// break down the logic without fear of not being able to access the game state.
export default class State {
  // We use a Map instead of a vanilla object because of its faster access
  // source: https://stackoverflow.com/a/62351925/11435461
  public state: StateMap

  // A prefix before each key when storing an object to localStorage.
  // By setting a unique prefix, we can, with some level of certainty, get only
  // the values stored by the game.
  KEY_PREFIX = '__sgk__'

  // We want to hide the fact that we're using Maps in our implementation,
  // because vanilla objects are much more regularly used.
  // However, we also want to accept Map as the data structure because forcing
  // the consumer to use a different data structure from its implementation for
  // no good reason, leads to confusion.
  constructor(defaultState?: object | StateMap) {
    if (defaultState === undefined) defaultState = new Map()

    // Check if data structure given is of vanilla object, in which case we want
    // to convert it to a Map instance.
    if (!(defaultState instanceof Map))
      defaultState = new Map(Object.entries(defaultState))

    this.state = defaultState as StateMap
  }

  public get = (key: string) => {
    return this.state.get(key)
  }

  public set = ({ key, value }: { key: string; value: any }): void => {
    this.state.set(key, value)
  }

  public save = (): void => {
    // We use the Linux epoch timestamp because it's easier for us to get the
    // latest save; by just getting the largest value.
    const now = new Date().getTime()
    const key = `${this.KEY_PREFIX}-${now}`
    window.localStorage.setItem(key, this.state.toString())
  }

  // Looks for the most recent save value in localStorage.
  // If found, we override the local state with the updated state.
  // If not, we continue with the local state.
  public load = (): void => {
    const saves: Array<LocalStorageSave> = []
    const regex = new RegExp(`^${this.KEY_PREFIX}`)

    for (const key in window.localStorage) {
      if (key.match(regex)) {
        const value = window.localStorage.getItem(key)
        value &&
          saves.push({
            key,
            timestamp: this.getTimestampFromKey(key),
            value,
          })
      }
    }

    // Set the local state to latestSave
    const latestSave = this.getLatestSave(saves)
    if (latestSave) {
      this.state = JSON.parse(latestSave.value)
    }
  }

  private getTimestampFromKey = (key: string): number => {
    return parseInt(key.split(this.KEY_PREFIX)[1])
  }

  private getLatestSave = (
    saves: Array<LocalStorageSave>
  ): LocalStorageSave | undefined => {
    const latestTimestamp = Math.max(...saves.map(save => save.timestamp))
    return saves.find(save => save.timestamp === latestTimestamp)
  }
}
