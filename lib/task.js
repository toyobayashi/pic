const EventEmitter = require('events').EventEmitter

class Task extends EventEmitter {
  execute () {
    throw new Error('Abstract class: Task')
  }

  onSuccess (listener) {
    return this.on('success', listener)
  }

  emitSuccess (...args) {
    return this.emit('success', ...args)
  }

  onFail (listener) {
    return this.on('fail', listener)
  }

  emitFail (...args) {
    return this.emit('fail', ...args)
  }
}

class TaskList {
  constructor (allList = [], size = 5) {
    this.size = size
    this.list = []
    this.active = 0
    this.waiting = []
    this.defer = null
    this.allList = allList
    this.errors = []

    if (this.allList.length) {
      for (let i = 0; i < this.allList.length; i++) {
        this.push(this.allList[i])
      }
    }
  }

  _onTaskComplete (task, err) {
    if (err) {
      this.errors.push(err)
    }
    const i = this.list.indexOf(task)
    this.list.splice(i, 1)
    this.active--
    if (this.waiting.length > 0) {
      this.push(this.waiting.shift())
    } else {
      if (this.active === 0) {
        if (this.defer !== null) {
          if (this.errors.length) {
            const err = new Error('Exist failed task.')
            err.errors = this.errors
            this.defer.reject(err)
          } else {
            this.defer.resolve()
          }
        }
      }
    }
  }

  push (task) {
    if (this.active < this.size) {
      this.list.push(task)
      const callback = this._onTaskComplete.bind(this, task)
      task.onSuccess(callback)
      task.onFail(callback)
      task.execute()
      this.active++
    } else {
      this.waiting.push(task)
    }
    return this
  }

  promise () {
    return new Promise((resolve, reject) => {
      this.defer = { resolve, reject }
    })
  }
}

module.exports = {
  Task,
  TaskList
}
