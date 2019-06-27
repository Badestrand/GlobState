# GlobState

Super simple global state management for React JS and preact.

Managing global state in React/preact can be hard and the Redux library is overkill for many applications and can result in overly verbose and complicated code when very simple and easy to understand mechanisms often do just as fine.

## Installation

```sh
npm i --save globstate
```
or
```sh
yarn add globstate
```


## How to use

We will use the example of a site wide search field here. You have two steps:

.1. Construct a class for the state with methods to modify it, and export an object of that class from the file:
```js
// globals/search.js
import GlobState from 'globstate'
 
class Search extends GlobState {
    _results = null

    constructor() {
        super('search')
    }
    results() {
        return this._results
    }
    doSearch(text) {
        fetch('https://example.org/api/search?q='+text).then(r => r.json()).then(json => {
            this._results = JSON.parse(json)
            this.updateComponents() // This triggers a re-render on all connected components
        })
    }
}
 
// Note that we export an object of type Search, not the class itself
export default new Search()
```
 
.2. Create a component that uses that global object and gets updated each time it changes:
```js
// SearchField.jsx
import GlobState from 'globstate'
import search from './globals/search'
 
class SearchResults extends Component {
    render() {
        // Note that in the render function you can access the global `search` object directly
        return (
            <ul>
                {search.results().map(result => (
                <li>{result.title}</li>
                ))}
            </ul>
        )
    }
}
 
// Export a connected version of the component that will update every time the search results change
export default GlobState.connect(SearchResults, ['search'])
```
```js
import search from './globals/search'
 
class SearchField extends Component {
    constructor() {
        super()
        this.state = {
            text: ''
        }
    }
    render() {
        return (
            <form onSubmit={e => {e.preventDefault(); this.submit(); return false}}>
                <input type="text" value={text} onInput={e => this.setState({text: e.target.value})}/>
                <button type="submit">go</button>
            </form>
        )
    }
    submit() {
        search.doSearch(this.state.text)
    }
}
```
 
 That's it! You can use several global objects in the same component without problems and also use asynchronous methods (like setTimeout or API calls) to update global objects.


## How it works

Global state is actually really simple. To make it work you need to have some global object that 
1) can be read and modified from everywhere in your web app
2) updates the components that use it when it changes

The first part is easy, just make an object that has variables and functions, put it in a file and wherever you need it, just import/require the file. In Javascript every file itself is loaded exactly once and thus is a global object already:
```js
// myGlobalCounter.js
class MyGlobalCounter {
	_value = 0

	read() {
		return this._value
	}
	increment() {
		this._value += 1
	}
}
const myGlobalCounter = new MyGlobalCounter()
export default myGlobalCounter
```

So how to update all necessary components when the counter gets incremented? Components re-draw themselves whenever their `state` changes, their `props` change or if `forceUpdate()` is called. We will use the latter. And some subscription system is needed as well:
```js
// myGlobalCounter.js
class MyGlobalCounter {
    _value = 0
    _subscribers = []

    subscribe(component) {
        this._subscribers.push(component)
    }
    unsubscribe(component) {
        const index = this._subscribers.indexOf(component)
        if (index !== -1)  this._subscribers.splice(index, 1)
    }
    updateComponents() {
        for (const subscriber of this._subscribers) {
            subscriber.forceUpdate()
        }
    }
    read() {
        return this._value
    }
    increment() {
        this._value += 1
        this.updateComponents()
    }
}
const myGlobalCounter = new MyGlobalCounter()
export default myGlobalCounter
```
```js
// CounterDisplay.jsx
import counter from './MyGlobalCounter'

class CounterDisplay extends Component {
    componentWillMount() {
        counter.subscribe(this)
    }
    componentDidUnmount() {
        counter.unsubscribe(this)
    }
    render() {
        return (
            <div>
                Counter: {counter.read()}
                <span onClick={e => counter.increment()}>+</span>
            </div>
        )
    }
}
```
Now you can use the <CounterDisplay/> component in multiple places in your web app and they are all connected to each other through the myGlobalCounter variable. The `subscribe` and `forceUpdate` is by the way exactly how React Redux does (or, at least, did) it as well!

The subscription management should go into its separate class of course. And to shorten all the subscribing/unsubscribing you can create a simple High Order Component (HOC) that takes care of that:
```js
// Updater.js
let globalNamesMap = {}

class Updater {
    _subscribers = []

    constructor(globalName) {
        globalNamesMap[globalName] = this
    }
    subscribe(component) {
		this._subscribers.push(component)
	}
	unsubscribe(component) {
		const index = this._subscribers.indexOf(component)
		if (index !== -1)  this._subscribers.splice(index, 1)
	}
	updateComponents() {
		for (const subscriber of this._subscribers) {
			subscriber.forceUpdate()
		}
	}
    static connect(BaseComponent, globalNames) {
    	return class extends Component {
    		componentWillMount() {
    			for (const globalName of globalNames) {
        			const global = globalsByName[globalName]
        			if (!global)  throw new Error('connect: Could not find global \''+globalName+'\'')
        			global.subscribe(component)
        		}
    		}
    		componentWillUnmount() {
    			for (const global of Object.values(globalsByName)) {
		        	global.unsubscribe(component)
		        }
    		}
    		render() {
    			return <BaseComponent {...this.props}/>
    		}
    	}
    }
}
```
And `Updater` here is basically `GlobState`. See, global state management can be that simple!

## Examples

### Counter
The usual example, a counter:
```js
// globals/counter.js
const GlobState = require('globstate')

class Counter extends GlobState {
	_value = 0

	constructor() {
		super('counter')  // Provide the name that components can use in 'connect'
	}
	read() {
		return this._value
	}
	increment() {
		this._value += 1
		this.updateComponents()  // This will update all subscribed components
	}
}

export default new Counter()
```
```js
// Counter.jsx
import counter from './globals/counter'

class Counter extends Component {
	render() {
		return (
			<div>
				Counter: {counter.read()}
				<span onClick={e => counter.increment()}>+</span>
			</div>
		)
	}
}

export default GlobState.connect(Counter, ['counter'])
```


### User management
Many web apps have a mechanism to login, register and logout a user. The user then of course is a global state and can be managed with the GlobState library. This example includes async state changes as login/register/logout are done via API calls.
```js
// globals/user.js
const GlobState = require('globstate')

class User extends GlobState {
    loggedin = false
    username = false

	constructor() {
		super('user')
	}

	login(email, password, next) {
		setTimeout(() => {  // Simulate an api call..
		    if (email==='some@one.com' && password==='123') {
			    this.loggedin = true
			    this.username = 'Michel'
			    next(null) // tell caller that we finished
		    } else {
		        this.loggedin = false
		        next(new Error('Wrong credentials!'))
		    }
			this.updateComponents()
		}, 500)
	}
}

export default new User()
```
```js
// App.jsx
import user from './globals/user'

// Just some component that uses the global user object
class SomeComponent extends Component {
	render() {
		return (
			<div>
				{user.loggedin? (
					<span>Logged in!</span>
				) : (
					<span>Not logged in!</span>
				)}
			</div>
		)
	}
}
SomeComponent = GlobState.connect(SomeComponent, ['user'])

class Header extends Component {
    render() {
        return (
            <header>
				{user.loggedin? (
				<span>Hello {user.username}!</span>
				) : (
				<button type="button" onClick={e => this.tryLogin()}>login</button>
				)}
			</header>
		)
    }
    tryLogin() {
        const email = prompt('E-Mail')
        const password = prompt('Password')
		user.login(username, password, (err) => {
			if (err) alert('Wrong username or password')
		})
	}
}
Header = GlobState.connect(Header, ['user'])

function App() {
	return (
		<div>
			<Header/>
			<main>
				<SomeComponent/>
			</main>
		</div>
	)
}
```

# License

MIT