import React from 'react';



interface ReactlikeComponent {
    forceUpdate(): void;
}

declare type callback = () => void;

declare type Callable = ReactlikeComponent | callback;



export default class GlobState {
    constructor();
    subscribe(component: Callable): void;
    unsubscribe(component: Callable): void;
    updateComponents(): void;
    private _subscribers;
    static connect<T>(BaseComponent: T, globals: Array<GlobState>): T;
}


export {};