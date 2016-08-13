/**
 * @module
 * @provides react-app
 */

import * as math from "./math";

export default React.createClass({
  getInitialState() {
    return { num: this.getRandomNumber() + math.sum(1,2,3) };
  },

  getRandomNumber(): number {
    return Math.ceil(Math.random() * 6);
  },

  render(): any {
    return <div>
    Your dice roll:
    {this.state.num}
  </div>;
  }
});