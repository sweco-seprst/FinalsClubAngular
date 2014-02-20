// Generated by CoffeeScript 1.6.2
var type;

if (typeof WEB !== "undefined" && WEB !== null) {
  type = exports.types.text2;
} else {
  type = require('./text2');
}

type.api = {
  provides: {
    text: true
  },
  getLength: function() {
    return this.snapshot.length;
  },
  getText: function() {
    return this.snapshot;
  },
  insert: function(pos, text, callback) {
    var op;

    op = type.normalize([pos, text]);
    this.submitOp(op, callback);
    return op;
  },
  del: function(pos, length, callback) {
    var op;

    op = type.normalize([
      pos, {
        d: length
      }
    ]);
    this.submitOp(op, callback);
    return op;
  },
  _register: function() {
    return this.on('remoteop', function(op, snapshot) {
      var component, pos, spos, _i, _len, _results;

      pos = spos = 0;
      _results = [];
      for (_i = 0, _len = op.length; _i < _len; _i++) {
        component = op[_i];
        switch (typeof component) {
          case 'number':
            pos += component;
            _results.push(spos += component);
            break;
          case 'string':
            this.emit('insert', pos, component);
            _results.push(pos += component.length);
            break;
          case 'object':
            this.emit('delete', pos, snapshot.slice(spos, spos + component.d));
            _results.push(spos += component.d);
            break;
          default:
            _results.push(void 0);
        }
      }
      return _results;
    });
  }
};