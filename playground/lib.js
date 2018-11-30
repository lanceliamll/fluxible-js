"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initializeStore = initializeStore;
exports.updateStore = updateStore;
exports.addObserver = addObserver;
exports.addEvent = addEvent;
exports.emitEvent = emitEvent;
exports.store = void 0;

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/** @format */

/** @fluxible-no-synth-events */
var eventBus = {};
/** @end-fluxible-no-synth-events */

var observers = [];
var id = 0;
var removedObserverIndex = null;
/** @fluxible-config-no-persist */

var shouldPersist = false;
var persistStorage = 0;
var persistTimeout = 0;
var persistedStateKeys = 0;
var persistedStateKeysLen = 0;
/** @end-fluxible-config-no-persist */

/** @fluxible-config-no-useJSON */

var useJSON = true;
/** @end-fluxible-config-no-useJSON */

var store = {};
exports.store = store;

function exists(arr, needle) {
  for (var a = 0, len = arr.length; a < len; a += 1) {
    if (arr[a] === needle) {
      return true;
    }
  }

  return false;
}

function initializeStore(config) {
  exports.store = store = _objectSpread({}, config.initialStore);
  /** @fluxible-config-no-useJSON */

  if (config.useJSON === false) {
    useJSON = false;
  }
  /** @end-fluxible-config-no-useJSON */

  /** @fluxible-config-no-persist */

  /** @fluxible-config-persist */


  if ('persist' in config) {
    if ('asyncStorage' in config.persist) {
      /** @end-fluxible-config-persist */

      /** @fluxible-config-sync */
      config.persist.asyncStorage.getItem('fluxible-js').then(function (savedStore) {
        var persistedStates = config.persist.restore(savedStore ?
        /** @fluxible-config-no-useJSON */
        useJSON ?
        /** @end-fluxible-config-no-useJSON */
        JSON.parse(savedStore)
        /** @fluxible-config-no-useJSON */
        : savedStore
        /** @end-fluxible-config-no-useJSON */
        : {});
        persistedStateKeys = Object.keys(persistedStates);
        persistedStateKeysLen = persistedStateKeys.length;
        persistStorage = config.persist.asyncStorage;

        for (var a = 0; a < persistedStateKeysLen; a += 1) {
          store[persistedStateKeys[a]] = persistedStates[persistedStateKeys[a]];
        }
      });
      /** @end-fluxible-config-sync */

      /** @fluxible-config-persist */
    } else {
      /** @end-fluxible-config-persist */

      /** @fluxible-config-async */
      var savedStore = config.persist.syncStorage.getItem('fluxible-js');
      var persistedStates = config.persist.restore(savedStore ?
      /** @fluxible-config-no-useJSON */
      useJSON ?
      /** @end-fluxible-config-no-useJSON */
      JSON.parse(savedStore)
      /** @fluxible-config-no-useJSON */
      : savedStore
      /** @end-fluxible-config-no-useJSON */
      : {});
      persistedStateKeys = Object.keys(persistedStates);
      persistedStateKeysLen = persistedStateKeys.length;
      persistStorage = config.persist.syncStorage;

      for (var a = 0; a < persistedStateKeysLen; a += 1) {
        store[persistedStateKeys[a]] = persistedStates[persistedStateKeys[a]];
      }
      /** @end-fluxible-config-async */

      /** @fluxible-config-persist */

    }
  }
  /** @end-fluxible-config-persist */

  /** @end-fluxible-config-no-persist */

}

function updateStore(updatedStates) {
  /** @fluxible-config-no-persist */
  if (persistTimeout !== 0) {
    clearTimeout(persistTimeout);
    persistTimeout = 0;
  }
  /** @end-fluxible-config-no-persist */


  var updatedStateKeys = Object.keys(updatedStates);
  var updatedStateKeysLen = updatedStateKeys.length;

  for (var a = 0; a < updatedStateKeysLen; a += 1) {
    store[updatedStateKeys[a]] = updatedStates[updatedStateKeys[a]];
    /** @fluxible-config-no-persist */

    /**
     * We only want to do this if
     * - we have not previously stopped the persist timeout.
     * - The persist feature is turned on.
     * - There's no scheduled persist to run.
     * - One of the updated states was persisted.
     */

    if (!shouldPersist && persistedStateKeys !== 0 && exists(persistedStateKeys, updatedStateKeys[a])) {
      shouldPersist = true;
    }
    /** @end-fluxible-config-no-persist */

  } // only notify observers that observes the store keys that were updated


  for (var _a = 0, observersLen = observers.length; _a < observersLen; _a += 1) {
    if (observers[_a]) {
      var wantedKeysLen = observers[_a].wantedKeys.length; // we want to maximize performance, so we loop as little as possible

      if (updatedStateKeysLen < wantedKeysLen) {
        for (var b = 0; b < updatedStateKeysLen; b += 1) {
          if (exists(observers[_a].wantedKeys, updatedStateKeys[b])) {
            observers[_a].callback();

            break;
          }
        }
      } else {
        // they are either of the same length or
        // the wantedKeys is less than the updatedStateKeys
        for (var _b = 0; _b < updatedStateKeysLen; _b += 1) {
          if (exists(updatedStateKeys, observers[_a].wantedKeys[_b])) {
            observers[_a].callback();

            break;
          }
        }
      }
      /**
       * this will ensure that we don't miss an observer due
       * to unsubscription during update
       */


      if (removedObserverIndex !== null) {
        if (removedObserverIndex <= _a) {
          _a -= 1;
        }

        removedObserverIndex = null;
      }
    }
  }
  /** @fluxible-config-no-persist */

  /**
   * We should only save states to the store when a
   * persisted state has been updated.
   *
   * We also take into consideration if we have previously
   * stopped a persist timeout.
   */


  if (shouldPersist) {
    // Wait 200ms relative to the last updateStore
    persistTimeout = setTimeout(function () {
      /**
       * in case we are next in stack and the persistTimeout
       * has just been cleared, we shouldn't save states to the store.
       */
      if (persistTimeout !== 0) {
        var statesToSave = {};

        for (var _a2 = 0; _a2 < persistedStateKeysLen; _a2 += 1) {
          statesToSave[persistedStateKeys[_a2]] = store[persistedStateKeys[_a2]];
        }

        persistStorage.setItem('fluxible-js',
        /** @fluxible-config-no-useJSON */
        useJSON ?
        /** @end-fluxible-config-no-useJSON */
        JSON.stringify(statesToSave)
        /** @fluxible-config-no-useJSON */
        : statesToSave
        /** @end-fluxible-config-no-useJSON */
        );
        shouldPersist = false;
      }
    }, 200);
  }
  /** @end-fluxible-config-no-persist */

}

function addObserver(callback, wantedKeys) {
  var thisId = id;
  observers.push({
    callback: callback,
    wantedKeys: wantedKeys,
    id: thisId
  });
  id += 1;
  return function () {
    for (var a = 0, observersLen = observers.length; a < observersLen; a += 1) {
      if (observers[a] && observers[a].id === thisId) {
        removedObserverIndex = a;
        return observers.splice(a, 1);
      }
    }
  };
}
/** @fluxible-no-synth-events */


function addEvent(ev, callback) {
  if (ev in eventBus) {
    eventBus[ev].push(callback);
  } else {
    eventBus[ev] = [callback];
  }
}

function emitEvent(ev, payload) {
  if (ev in eventBus) {
    var eventBusLen = eventBus[ev].length;

    for (var a = 0; a < eventBusLen; a += 1) {
      if (eventBus[ev][a]) {
        eventBus[ev][a](payload);
      }
    }
  }

  return -1;
}
/** @end-fluxible-no-synth-events */