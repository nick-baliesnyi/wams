/*
 * Contains the Swipe class.
 */

'use strict';

const Gesture = require('../core/Gesture.js');

const REQUIRED_INPUTS = 1;
const PROGRESS_STACK_SIZE = 7;
const MS_THRESHOLD = 300;

/**
 * Data returned when a Swipe is recognized.
 *
 * @typedef {Object} SwipeData
 * @mixes module:gestures.ReturnTypes.BaseData
 *
 * @property {number} velocity - The velocity of the swipe.
 * @property {number} direction - In radians, the direction of the swipe.
 * @property {module:gestures.Point2D} point - The point at which the swipe
 * ended.
 * @property {number} time - The epoch time, in ms, when the swipe ended.
 *
 * @memberof module:gestures.ReturnTypes
 */

/**
 * Calculates the angle of movement along a series of moves.
 *
 * @inner
 * @memberof module:gestures.Swipe
 * @see {@link https://en.wikipedia.org/wiki/Mean_of_circular_quantities}
 *
 * @param {{time: number, point: module:gestures.Point2D}} moves - The moves
 * list to process.
 * @param {number} vlim - The number of moves to process.
 *
 * @return {number} The angle of the movement.
 */
function calc_angle(moves, vlim) {
  const point = moves[vlim].point;
  let sin = 0;
  let cos = 0;
  for (let i = 0; i < vlim; ++i) {
    const angle = moves[i].point.angleTo(point);
    sin += Math.sin(angle);
    cos += Math.cos(angle);
  }
  sin /= vlim;
  cos /= vlim;
  return Math.atan2(sin, cos);
}

/**
 * Local helper function for calculating the velocity between two timestamped
 * points.
 *
 * @inner
 * @memberof module:gestures.Swipe
 *
 * @param {object} start
 * @param {module:gestures.Point2D} start.point
 * @param {number} start.time
 * @param {object} end
 * @param {module:gestures.Point2D} end.point
 * @param {number} end.time
 *
 * @return {number} velocity from start to end point.
 */
function velocity(start, end) {
  const distance = end.point.distanceTo(start.point);
  const time = end.time - start.time + 1;
  return distance / time;
}

/**
 * Calculates the veloctiy of movement through a series of moves.
 *
 * @inner
 * @memberof module:gestures.Swipe
 *
 * @param {{time: number, point: module:gestures.Point2D}} moves - The moves
 * list to process.
 * @param {number} vlim - The number of moves to process.
 *
 * @return {number} The velocity of the moves.
 */
function calc_velocity(moves, vlim) {
  let max = 0;
  for (let i = 0; i < vlim; ++i) {
    const current = velocity(moves[i], moves[i + 1]);
    if (current > max) max = current;
  }
  return max;
}

/**
 * A swipe is defined as input(s) moving in the same direction in an relatively
 * increasing velocity and leaving the screen at some point before it drops
 * below it's escape velocity.
 *
 * @extends module:gestures.Gesture
 * @see module:gestures.ReturnTypes.SwipeData
 * @memberof module:gestures
 */
class Swipe extends Gesture {
  /**
   * Constructor function for the Swipe class.
   */
  constructor() {
    super('swipe');

    /**
     * Moves list.
     *
     * @type {object[]}
     */
    this.moves = [];

    /**
     * Data to emit when all points have ended.
     *
     * @type {module:gestures.ReturnTypes.SwipeData}
     */
    this.saved = null;
  }

  /**
   * Refresh the swipe state.
   *
   */
  refresh() {
    this.moves = [];
    this.saved = null;
  }

  /**
   * Event hook for the start of a gesture. Resets the swipe state.
   *
   * @param {module:gestures.State} state - current input state.
   */
  start() {
    this.refresh();
  }

  /**
   * Event hook for the move of a gesture. Captures an input's x/y coordinates
   * and the time of it's event on a stack.
   *
   * @param {module:gestures.State} state - current input state.
   */
  move(state) {
    if (state.active.length >= REQUIRED_INPUTS) {
      this.moves.push({
        time:  Date.now(),
        point: state.centroid,
      });

      if (this.moves.length > PROGRESS_STACK_SIZE) {
        this.moves.splice(0, this.moves.length - PROGRESS_STACK_SIZE);
      }
    }
  }

  /**
   * Determines if the input's history validates a swipe motion.
   *
   * @param {module:gestures.State} state - current input state.
   * @return {?module:gestures.ReturnTypes.SwipeData} <tt>null</tt> if the
   * gesture is not recognized.
   */
  end(state) {
    const result = this.getResult();
    this.moves = [];

    if (state.active.length > 0) {
      this.saved = result;
      return null;
    }

    this.saved = null;
    return this.validate(result);
  }

  /**
   * Event hook for the cancel phase of a Swipe.
   *
   * @param {module:gestures.State} state - current input state.
   */
  cancel() {
    this.refresh();
  }

  /**
   * Get the swipe result.
   *
   */
  getResult() {
    if (this.moves.length < PROGRESS_STACK_SIZE) {
      return this.saved;
    }
    const vlim = PROGRESS_STACK_SIZE - 1;
    const { point, time } = this.moves[vlim];
    const velocity = calc_velocity(this.moves, vlim);
    const direction = calc_angle(this.moves, vlim);
    return { point, velocity, direction, time };
  }

  /**
   * Validates that an emit should occur with the given data.
   *
   * @param {?module:gestures.ReturnTypes.SwipeData} data
   */
  validate(data) {
    if (data == null) return null;
    return (Date.now() - data.time > MS_THRESHOLD) ? null : data;
  }
}

module.exports = Swipe;
