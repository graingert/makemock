"use strict";

var has = require('lodash.has');
var set = require('lodash.set');
var find = require('lodash.find');

var UnverifiedCallException = function () {
  function UnverifiedCallException(path) {
    this.path = path;
  }

  UnverifiedCallException.prototype.toString = function toString() {
    return "uncalled path " + this.path;
  };

  return UnverifiedCallException;
}();

var Mock = function () {
  function Mock() {
    this._called = [];
    this._obj = null;
  }

  Mock.prototype.calledWith = function calledWith(path, cb) {
    var verified = false;
    this._called.push({ path: path, cb: cb, verified: verified });
    return this;
  };

  Mock.prototype.obj = function obj() {
    if (this._obj) {
      return this._obj;
    }

    var newObj = {};
    var paths = {};

    function addToObject(item) {
      var path = item.path;

      function call() {
        var localItem = paths[path].pop();
        var ret = localItem.cb.apply(this, arguments);
        localItem.verified = true;
        return ret;
      }

      if (!has(newObj, path)) {
        set(newObj, path, call);
      }
      var pathItems = paths[path] = paths[path] || [];
      pathItems.push(item);
    }

    this._called.forEach(addToObject);
    this._obj = newObj;

    return newObj;
  };

  Mock.prototype.verify = function verify() {
    var unverified = find(this._called, function (item) {
      return !item.verified;
    });
    if (unverified) {
      throw new UnverifiedCallException(unverified.path);
    }
  };

  return Mock;
}();

module.exports = Mock;
