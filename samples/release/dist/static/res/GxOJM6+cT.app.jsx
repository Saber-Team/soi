__d("react-app", function(require, exports, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _math = require("math");

var math = _interopRequireWildcard(_math);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = React.createClass({
  displayName: "unknown",

  getInitialState: function getInitialState() {
    return { num: this.getRandomNumber() + math.sum(1, 2, 3) };
  },
  getRandomNumber: function getRandomNumber() {
    return Math.ceil(Math.random() * 6);
  },
  render: function render() {
    return React.createElement("div", null, "Your dice roll:", this.state.num);
  }
}); /**
     * @module
     * @provides react-app
     */
});