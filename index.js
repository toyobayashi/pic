const tinify = require("tinify")
const path = require('path')
const fs = require('fs')
const { TaskList, Task } = require("./lib/task")
const Progress = require('./lib/progress.js')

const supportType = ['.png', '.jpg', '.jpeg']

function walkDir (inputDir, outputDir) {
  const items = fs.readdirSync(inputDir)
  let src = []
  for (let i = 0; i < items.length; i++) {
    const name = items[i];
    const fullPath = path.join(inputDir, name)
    const fullPathOut = path.join(outputDir, name)

    if (fs.statSync(fullPath).isDirectory()) {
      src = [...src, ...walkDir(fullPath, fullPathOut)]
    } else {
      if (supportType.includes(path.extname(name))) {
        src.push({
          input: fullPath,
          output: fullPathOut
        })
      }
    }
  }

  return src
}

class CompressTask extends Task {
  constructor (input, output) {
    super()
    this.input = input
    this.output = output
  }

  execute () {
    const { input, output } = this
    const dir = path.dirname(output)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    const source = tinify.fromFile(input)
    return source.toFile(output).then(() => {
      this.emitSuccess()
    }).catch(err => {
      this.emitFail(err)
    })
  }
}

function compress (input, output) {
  if (!fs.existsSync(input)) {
    throw new Error(`Input does not exist: ${input}`)
  }

  const inputStat = fs.statSync(input)
  if (inputStat.isDirectory()) {
    const items = walkDir(input, output)
    if (fs.existsSync(output) && !fs.statSync(output).isDirectory()) {
      throw new Error(`Output is not a directory: ${output}`)
    }
    const p = new Progress()
    const total = items.length
    let done = -1
    const WIDTH = 60
    const render = () => {
      done++
      p.render({
        title: `${done} / ${total}`,
        percent: 100 * done / total,
        width: WIDTH
      })
    }
    render()
    return new TaskList(items.map(item => {
      const task = new CompressTask(item.input, item.output)
      task.on('success', render)
      task.on('fail', (err) => {
        console.error(err)
        render()
      })
      return task
    })).promise().then(() => {
      p.dispose()
      console.log('Done.')
    })
  } else {
    if (supportType.includes(path.extname(input))) {
      if (fs.existsSync(output) && fs.statSync(output).isDirectory()) {
        throw new Error(`Output is a directory: ${output}`)
      }
      
      return new TaskList([new CompressTask(input, output)]).promise().then(() => {
        console.log('Done.')
      })
    }
  }
}

exports.compress = compress
