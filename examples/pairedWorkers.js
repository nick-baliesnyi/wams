/*
 * This is the simplest example, simply showing how an arbitrary number of
 *  users can interact with a shared set of items.
 */

'use strict';

const path = require('path')
const WAMS = require('..');
const { image } = WAMS.predefined.items;

const app = new WAMS.Application({
  clientLimit: 2,
  staticDir: path.join(__dirname, './img'),
});

app.spawn(image('scream.png', {
  x: 400,
  y: 400,
  width: 800,
  height: 1013,
  scale: 0.25,
  allowDrag: true,
  allowRotate: true,
  allowScale: true,
}));

app.spawn(image('monaLisa.jpg', {
  x: 200,
  y: 200,
  width: 1200,
  height: 1815,
  scale: 0.2,
  allowDrag: true,
  allowRotate: true,
  allowScale: true,
}));

app.listen(9003);

