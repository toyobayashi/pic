const tinify = require("tinify")
const path = require('path')
const fs = require('fs')

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

async function compressFile (input, output) {
  console.log(`Compress "${input}" to "${output}"`)
  const dir = path.dirname(output)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  const source = tinify.fromFile(input)
  await source.toFile(output)
}

async function compress (input, output) {
  if (!fs.existsSync(input)) {
    throw new Error(`Input does not exist: ${input}`)
  }

  const inputStat = fs.statSync(input)
  if (inputStat.isDirectory()) {
    const items = walkDir(input, output)
    if (fs.existsSync(output) && !fs.statSync(output).isDirectory()) {
      throw new Error(`Output is not a directory: ${output}`)
    }
    for (let i = 0; i < items.length; i++) {
      await compressFile(items[i].input, items[i].output)
    }
  } else {
    if (supportType.includes(path.extname(input))) {
      if (fs.existsSync(output) && fs.statSync(output).isDirectory()) {
        throw new Error(`Output is a directory: ${output}`)
      }
  
      await compressFile(input, output)
    }
  }
}

exports.compress = compress
