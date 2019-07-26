/*

Anforderungen:
 - Keinen inkonsistenten State
 	=> Alles auf einmal setzen mit einer Art setState
 - Einfaches subscriben auch zu mehreren global states
    => GlobState.subscribe(this, ['user', 'theme', 'counter']) ?

Fragen/Entscheidungen:
 - Wie aus Component auf globalen State zugreifen? 
   a) this.globals.user.username?
   b) user.username? -> Yes, easiest!
   c) this.state.user.username?

Beispiele:
 - Counter
 - User management (login/logout)
 - Side-wide option theme (bright/dark)


Noch Probleme:
 - 
*/

'use strict'

const React = require('react')



const globalsByName = {}



class GlobState {
	constructor(globalName) {
		if (globalName !== undefined) {
			globalsByName[globalName] = this
		}
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
		console.warn('GlobState: updateComponents is deprecated, please use updateListeners instead. It was renamed because you can now subscribe with simple functions as well: user.subscribe(() => console.log("Something about the user changed!")).')
		this.updateListeners()
	}

	updateListeners() {
		for (const subscriber of this._subscribers) {
			if (subscriber.forceUpdate) {
				subscriber.forceUpdate()
			} else if (typeof subscriber === 'function') {
				subscriber()
			}
		}
	}

	static subscribe(component, globalNames) {
		// Maybe the user accidentily passed a single global as a string instead of an array
		if (typeof globalNames === 'string') {
			globalNames = [globalNames]
		}
		for (const globalName of globalNames) {
			const global = globalsByName[globalName]
			if (!global) {
				throw new Error('GlobState.subscribe: Could not find global \''+globalName+'\'')
			}
			global.subscribe(component)
		}
	}

	static unsubscribe(component) {
		// Just call unsubscribe for this component on all globals
		for (const global of Object.values(globalsByName)) {
			global.unsubscribe(component)
		}
	}

	static connect(BaseComponent, globalNames) {
		return class extends React.Component {
			componentWillMount() {
				GlobState.subscribe(this, globalNames)
			}
			componentWillUnmount() {
				GlobState.unsubscribe(this)
			}
			render() {
				return <BaseComponent {...this.props}/>
			}
		}
	}
}


module.exports = GlobState