/** @format */

import {
  updateStore,
  initializeStore,
  addObserver,
  addEvent,
  emitEvent
} from '../lib/index.min.js';

const maxKeys = 10000;
const initialStore = {};

let average = 0;
let timeTaken = 0;
let now = 0;
let tmp = null;

for (let a = 0; a < maxKeys; a++) {
  initialStore['test' + a] = 'test' + a;
}

function displayTotalTime () {
  // eslint-disable-next-line
  console.log('Total time taken (one time fire)', timeTaken, 'ms');
}

function displayAverageTimeAndReset () {
  // eslint-disable-next-line
  console.log('Average time (' + maxKeys + ' loops)', average / maxKeys, 'ms');
  // eslint-disable-next-line
  console.log('-----');

  average = 0;
  timeTaken = 0;
  now = 0;
  tmp = null;
}

// eslint-disable-next-line
console.log('created initialStore with', maxKeys, 'keys.');
// eslint-disable-next-line
console.log('\n-----');
// eslint-disable-next-line
console.log('NO PERSIST: Beginning of perf test');
// eslint-disable-next-line
console.log('-----\n');

// ----------
// eslint-disable-next-line
console.log('initializeStore:');

timeTaken = Date.now();
initializeStore({ initialStore });
timeTaken = Date.now() - timeTaken;

displayTotalTime();

for (let a = 0; a < maxKeys; a++) {
  now = Date.now();
  initializeStore({ initialStore });
  average += Date.now() - now;
}

displayAverageTimeAndReset();

// ----------
// eslint-disable-next-line
console.log('updateStore with ' + maxKeys + ' keys and 0 observers:');

timeTaken = Date.now();
updateStore(initialStore);
timeTaken = Date.now() - timeTaken;

displayTotalTime();

for (let a = 0; a < maxKeys; a++) {
  now = Date.now();
  updateStore(initialStore);
  average += Date.now() - now;
}

displayAverageTimeAndReset();

// ----------
// eslint-disable-next-line
console.log('addObserver:');

timeTaken = Date.now();
addObserver(() => {}, ['test1', 'test2', 'test3']);
timeTaken = Date.now() - timeTaken;

displayTotalTime();

for (let a = 0; a < maxKeys; a++) {
  now = Date.now();
  addObserver(() => {}, ['test1', 'test2', 'test3']);
  average += Date.now() - now;
}

displayAverageTimeAndReset();

// ----------
// eslint-disable-next-line
console.log('updateStore with ' + maxKeys + ' keys and ' + maxKeys + ' observers:');

timeTaken = Date.now();
updateStore(initialStore);
timeTaken = Date.now() - timeTaken;

displayTotalTime();

for (let a = 0; a < maxKeys; a++) {
  now = Date.now();
  updateStore(initialStore);
  average += Date.now() - now;
}

displayAverageTimeAndReset();

// ----------
// eslint-disable-next-line
console.log('removing an observer with ', maxKeys + 1, ' observers');

tmp = addObserver(() => {}, ['test1', 'test2', 'test3']);
timeTaken = Date.now();
tmp();
timeTaken = Date.now() - timeTaken;

displayTotalTime();

for (let a = 0; a < maxKeys; a++) {
  tmp = addObserver(() => {}, ['test1', 'test2', 'test3']);
  now = Date.now();
  tmp();
  average += Date.now() - now;
}

displayAverageTimeAndReset();

// ----------
// eslint-disable-next-line
console.log('Adding events');

timeTaken = Date.now();
addEvent('test-event', () => {});
timeTaken = Date.now() - timeTaken;

displayTotalTime();

let called = false;
let event;

for (let a = 0; a < maxKeys; a++) {
  now = Date.now();
  addEvent('test-event-' + Math.floor(Math.random() * 100 + 1), () => {
    called = true;
  });
  average += Date.now() - now;
}

displayAverageTimeAndReset();

// ----------
// eslint-disable-next-line
console.log('Emitting events with ' + maxKeys + ' previously added events');

do {
  event = 'test-event-' + Math.floor(Math.random() * 100 + 1);
  timeTaken = Date.now();
  emitEvent(event);
  timeTaken = Date.now() - timeTaken;
} while (!called);

displayTotalTime();

for (let a = 0; a < maxKeys; a++) {
  called = false;

  do {
    event = 'test-event-' + Math.floor(Math.random() * 100 + 1);
    now = Date.now();
    emitEvent(event);
  } while (!called);

  average += Date.now() - now;
}

displayAverageTimeAndReset();

// eslint-disable-next-line
console.log('END');
