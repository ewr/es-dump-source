var Writer,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = Writer = (function(_super) {
  __extends(Writer, _super);

  function Writer() {
    Writer.__super__.constructor.apply(this, arguments);
    this._writableState.objectMode = true;
    this._readableState.objectMode = false;
    this._writableState.highWaterMark = 1024;
  }

  Writer.prototype._transform = function(obj, encoding, cb) {
    var _ref, _ref1;
    if (obj != null ? (_ref = obj._source) != null ? _ref.message : void 0 : void 0) {
      this.push((obj != null ? (_ref1 = obj._source) != null ? _ref1.message : void 0 : void 0) + "\n");
    }
    return cb();
  };

  return Writer;

})(require("stream").Transform);

//# sourceMappingURL=writer.js.map
