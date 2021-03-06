/*
 * Contains the {@link PointerData} class
 */

'use strict';

const { Point2D } = require('../shared.js');
const PHASE   = require('./PHASE.js');

/**
 * Low-level storage of pointer data based on incoming data from an interaction
 * event.
 *
 * @memberof module:gestures
 *
 * @param {TouchEvent} event - The event object being wrapped.
 * @param {Touch} touch - The touch point data.
 */
class PointerData {
  constructor(event, touch) {
    /**
     * The type or 'phase' of this batch of pointer data. 'start' or 'move' or
     * 'end'.
     *
     * @type {string}
     */
    this.phase = PHASE[event.type];

    /**
     * The timestamp of the event in milliseconds elapsed since January 1, 1970,
     * 00:00:00 UTC.
     *
     * @type {number}
     */
    this.time = Date.now();

    /**
     * The (x,y) coordinate of the event, wrapped in a Point2D.
     *
     * @type {module:gestures.Point2D}
     */
    this.point = new Point2D(touch.clientX, touch.clientY);
  }

  /**
   * Calculates the angle between this event and the given event.
   *
   * @param {module:gestures.PointerData} pdata
   *
   * @return {number} Radians measurement between this event and the given
   *    event's points.
   */
  angleTo(pdata) {
    return this.point.angleTo(pdata.point);
  }

  /**
   * Calculates the distance between two PointerDatas.
   *
   * @param {module:gestures.PointerData} pdata
   *
   * @return {number} The distance between the two points, a.k.a. the
   *    hypoteneuse.
   */
  distanceTo(pdata) {
    return this.point.distanceTo(pdata.point);
  }
}

module.exports = PointerData;

