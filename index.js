import * as React from 'react'



export default class GlobState {
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
            if (subscriber.forceUpdate) {
                subscriber.forceUpdate()
            } else {
                subscriber()
            }
        }
    }


    static connect(BaseComponent, ...globals) {
        const globals2 = Array.isArray(globals[0])? globals[0] : globals  // so people can pass in array as first parameter

        return class extends React.Component {
            componentWillMount() {
                // Just call subscribe for this component on all globals
                for (const g of globals2) {
                    g.subscribe(this)
                }
            }
            componentWillUnmount() {
                // Just call unsubscribe for this component on all globals
                for (const g of globals2) {
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
