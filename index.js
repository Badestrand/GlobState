'use strict'

const React = require('react')



class GlobState {
	constructor() {
		this._subscribers = []
	}

	subscribe(component) {
		this._subscribers.push(component)
	}

	unsubscribe(component) {
		const index = this._subscribers.indexOf(component)
		if (index !== -1) {
			this._subscribers.splice(index, 1)
		}
	}

	updateComponents() {
		for (const subscriber of this._subscribers) {
			subscriber.forceUpdate()
		}
	}


	static connect(BaseComponent, ...globals) {
		return class extends React.Component {
			componentWillMount() {
				// Just call subscribe for this component on all globals
				for (const g of globals) {
					g.subscribe(this)
				}
			}
			componentWillUnmount() {
				// Just call unsubscribe for this component on all globals
				for (const g of globals) {
					g.unsubscribe(this)
				}
			}
			render() {
				return React.createElement(
					BaseComponent,
					this.props
				)
			}
		}
	}
}


module.exports = GlobState