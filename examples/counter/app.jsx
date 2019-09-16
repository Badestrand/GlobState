'use strict'

const React = require('react')
const ReactDOM = require('react-dom')
const GlobState = require('../../index')

const counter = require('./counter')



class CounterField extends React.Component {
	render() {
		return (
			<div className="counter">
				<span>{counter.get()}</span>
				<button type="button" onClick={e => this.onIncrement()}>+</button>
			</div>
		)
	}

	onIncrement() {
		counter.inc()
	}
}
CounterField = GlobState.connect(CounterField, counter)  // CounterField will be redrawn every time counter updates



class App extends React.Component {
	render() {
		return (
			<div>
				<p>Here we have a counter:</p>
				<CounterField/>

				<p>Here is another one:</p>
				<CounterField/>

				<p>And here a third:</p>
				<CounterField/>

				<p>All three are connected by global state management using <code>globstate</code>.</p>
			</div>
		)
	}
}



const container = document.createElement('div')
document.body.appendChild(container)
ReactDOM.render(<App/>, container)
