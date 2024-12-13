import {expect} from 'chai';
import sum from 'hazel/sum.js';


describe('sum', function () {
  it('should return sum of arguments', function () {
    expect(sum(1, 2)).to.equal(3);
  });
});
