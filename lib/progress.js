function floorTwo (v) {
  return (Math.floor(v * 100) / 100).toFixed(2)
}

function noop () {}

class Progress {
  constructor () {
    this._stream = process.stdout
    this._width = process.stdout.getWindowSize()[0]
    this._percent = 0
    this._title = ''
    this._additional = ''

    this._oldLog = console.log
    console.log = noop
  }

  render (options) {
    this._stream.clearLine()
    this._stream.cursorTo(0)

    if (Object.prototype.toString.call(options) === '[object Object]') {
      const { title, percent, additional, width } = options
      if (typeof title === 'string') this._title = title
      if (typeof percent === 'number') this._percent = percent
      if (typeof additional === 'string') this._additional = additional
      if (typeof width === 'number') this._width = width
    } else if (typeof options === 'number') {
      this._percent = options
    }

    const totalWidth = this._width

    const title = this._title ? `${this._title} ` : ''
    const percent = floorTwo(this._percent)
    const additional = this._additional ? ` ${this._additional}` : ''

    const progressLength = totalWidth - title.length - 4 - percent.length - additional.length

    const loaded = percent < 0 ? 0 : (percent > 100 ? progressLength : Math.floor(progressLength * percent / 100))
    const eq = loaded - 1
    const blank = progressLength - loaded

    const line = `${title}[${('=').repeat(eq < 0 ? 0 : eq)}${loaded <= 0 ? '' : '>'}${(' ').repeat(blank < 0 ? 0 : blank)}] ${percent}%${additional}`

    this._stream.write(line)
  }

  dispose () {
    console.log = this._oldLog
    console.log('')
  }
}

module.exports = Progress
