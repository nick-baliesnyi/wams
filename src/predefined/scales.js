/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: December 2018
 */

'use strict';

const { isView, isIncludedIn } = require('./utils.js');

/**
 * Returns a WAMS scale handler function which will allow users to scale their
 * view.
 *
 * workspace: The WorkSpace for which this function will be built.
 */
function view(workspace) {
  return function scale_view(view, target, scale, mx, my) {
    if (isView(target, view)) {
      view.scaleBy(scale, mx, my);
      workspace.scheduleUpdate(view);
    }
  };
}

/**
 * Returns a WAMS scale handler function which will allow users to scale items.
 *
 * workspace: The WorkSpace for which this function will be built.
 * itemTypes: Array of strings, the types of items for which to allow scaling.
 */
function items(workspace, itemTypes = []) {
  return function scale_item(view, target, scale, mx, my) {
    if (isIncludedIn(target, itemTypes)) {
      target.scaleBy(scale, mx, my);
      workspace.scheduleUpdate(target);
    }
  };
}

/**
 * Returns a WAMS scale handler function which will allow users to scale items
 * and their view.
 *
 * workspace: The WorkSpace for which this function will be built.
 * itemTypes: Array of strings, the types of items for which to allow scaling.
 */
function itemsAndView(workspace, itemTypes = []) {
  return function scale_itemsAndView(view, target, scale, mx, my) {
    if (isView(target, view)) {
      view.scaleBy(scale, mx, my);
      workspace.scheduleUpdate(view);
    } else if (isIncludedIn(target, itemTypes)) {
      target.scaleBy(scale, mx, my);
      workspace.scheduleUpdate(target);
    }
  };
}

module.exports = {
  items,
  view,
  itemsAndView,
};
