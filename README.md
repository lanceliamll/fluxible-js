<!-- @format -->

# Fluxible-JS

Smaller, faster, better. A small state management system that supports the idea of asynchronous actions and state persistence out of the box.

# Tests

## Unit tests

<img src="docs/ss-test-unit.png">

## Performance tests

All performance test was ran on:

MacBook Pro (Retina, 15-inch, Mid 2015).
Processor: 2.5 GHz Intel Core i7, 1 processor, 4 cores.
Memory: 16 GB 1600 MHz DDR3

**Complete disclosure**

These tests may or may not be accurate. Consider these to be the cases under the best circumstances.

#### With a 10 key-store

<img src="docs/ss-test-perf-10.png">

#### With a 100 key-store

<img src="docs/ss-test-perf-100.png">

#### With a 1,000 key-store

<img src="docs/ss-test-perf-1000.png">

#### With a 10,000 key-store

<img src="docs/ss-test-perf-10000.png">

---

<img src="https://1.bp.blogspot.com/_Jj--y7nzkjo/TFMSsUC6qkI/AAAAAAAAJjo/KZu6JhzpCjI/s1600/DSC_0702.JPG">

###### I do not own the image you see above.

We developers are like cats. We like to fit ourselves inside a box. Sometimes the boxes we use are so small that our movements are so limited. Libraries are like boxes, basically, using a library is like saying:

> I like this box, I'm gonna use this box, I'm going to fit myself inside it.

Though libraries were not intended to limit but rather to extend our abilities, as time passes by, more advanced libraries tend to tie us so much to the pattern that it uses consequently limiting our abilities while at the same time extending it.

The goal of this state management library is to allow you to initialize, update, and share states while giving back the control to the developer. Think of it like a substantially bigger box.

# Run me

1. `git clone git@github.com:aprilmintacpineda/fluxible-js.git`
2. `npm i`
3. `npm run playground`

<img src="docs/playground-screenshot.png">

# Test me

- `npm run test-func` to run unit tests.
- `npm run test-perf` to run performance test.
- `npm run test` to run both.

# Install

`npm i -s fluxible-js`

# Usage

## Initialize store

```js
import { initializeStore } from 'fluxible-js';

initializeStore({
  initialStore: {
    user: null,
    someOtherState: 'value',
    anotherState: {
      value: 'value'
    }
  }
});
```

`initializeStore` function expects an object as the only parameter, the object have a required property called `initialStore` which would be used as the initial value of the store.

There's also the optional property called `persist` which must also be an object containing two required properties:

- `storage` which must be a reference to the storage that would be used to save the store. It must have `getItem` and `setItem` methods. Both methods must be synchronous. Example would be `window.localStorage`. The call to `setItem` is deferred by 200ms, this is to minimize and to improve performance.
- `restore` which must be a function that is synchronous. Restore will be called upon initialization and will receive the `savedStore` as the its only argument. The `savedStore` would be an object containing the states that were previously saved to the storage. It must return an object which would be the states that you want to restore.

Persist feature would only save keys that were returned by `config.persist.restore`. That means, other states that you did not return in that method wouldn't be saved. `config.persist.restore` must not do anything else other than return the states you want to persist. It is also being used for the `config.persist.storage.saveItem` instead of recalculating, it simply calls `config.persist.restore` and expect it to return the states you want to persist. This optimizes performance.

###### Example

```js
import { initializeStore } from 'fluxible-js';

initializeStore({
  initialStore: {
    user: null,
    someOtherState: 'value',
    anotherState: {
      value: 'value'
    }
  },
  persist: {
    storage: window.localStorage,
    restore: savedStore => ({
      user: savedStore.user || null
    })
  }
});
```

In the case above, only `user` would be saved and the rest wouldn't be saved.

## Listen to store updates

```jsx
import { addObserver, getStore } from 'fluxible-js';

const unsubscribeCallback = addObserver(
  () => {
    console.log('store has been updated!', getStore());
  },
  ['someOtherState', 'anotherState']
);
```

`addObserver` expects a function as the argument. This function would be called every **AFTER** store updates and will receive the updated store as it's only argument.

The second argument is an array of strings which lists the names of the states that you are listening to, it's important that this list has the same name as the states you want to listen to. In the example above, I wanted to listen to `someOtherState` and `anotherState`, so every time one of those two gets updated my listener will be called.

`addObserver` returns a function that you can call later on to remove _that_ observer.

## Update the store

```js
import { updateStore } from 'fluxible-js';

updateStore({
  someOtherState: 'updated value'
});
```

**Do not mutate the store directly. Doing so may lead to unwanted behaviors in your app.**

## Performing asynchronous operation

The library itself does not restrict you to anything. You could use promises, async/await, or even generator functions (using generator function might require you to have your own implementation). The only thing that the library does is manage state, that would be updating the state and calling observers upon state update.

Example:

```js
import { updateStore } from 'fluxible-js';

function myAction() {
  updateStore({
    someOtherState: someValue
  });

  Axios.get(url, config).then(response => {
    // do what you need to do
    // then update the store when you're good.
    updateStore({
      someOtherState: someValue
    });
  });
}
```

# Event bus

## Adding events and event listeners

```js
import { addEvent } from 'fluxible-js';

addEvent('my-event', payload => {
  console.log('first listener', payload);
});

addEvent('my-event', payload => {
  console.log('second listener', payload);
});
```

## Emitting events

```js
import { emitEvent } from 'fluxible-js';

// returns -1 if the emitted event does not exists
emitEvent('my-event', {
  value: 1,
  anotherValue: 2
});
```

The second argument to `emitEvent` is an object or value that would be passed to the event listeners as **payload**. Then from the event listeners, feel free to do whatever you need to do such as update the store.

```js
import { addEvent, updateStore } from 'fluxible-js';

addEvent('my-event', payload => {
  updateStore({
    newValue: payload.newValue
  });
});
```

# Contributing

Discussions, questions, suggestions, bug reports, feature request, etc are all welcome. Just create an issue.
