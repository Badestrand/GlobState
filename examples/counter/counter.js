'use strict'

const GlobState = require('../../index')



class Counter extends GlobState {
	constructor() {
		super()
		this._n = 0
	}

	get() {
		return this._n
	}

	inc() {
		this._n += 1
		this.updateComponents()  // <- update all listening components
	}
}



module.exports = new Counter()
