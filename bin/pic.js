#!/usr/bin/env node

if (process.argv.length < 4 || !process.env.TINIFY_KEY) {
  console.log('Usage: pic <input> <output>')
  console.log('Environment variable: TINIFY_KEY')
  process.exit(0)
}

const tinify = require('tinify')
tinify.key = process.env.TINIFY_KEY

const { compress } = require('..')

compress(process.argv[2], process.argv[3]).catch(err => {
  console.error(err)
  process.exitCode = 1
})
