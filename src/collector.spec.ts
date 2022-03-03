import { expect } from 'chai';
import 'mocha';
import { stateToValue } from './collector';

describe('GitHub job state', () => {

  it('should convert success to 0', () => {
    const result = stateToValue("success");
    expect(result).to.equal(0);
  });

  it('should convert failure to 1', () => {
    const result = stateToValue("failure");
    expect(result).to.equal(1);
  });

  it('should convert cancelled to 2', () => {
    const result = stateToValue("cancelled");
    expect(result).to.equal(2);
  });

  it('should convert unknown status to 99', () => {
    const result = stateToValue("unknown");
    expect(result).to.equal(99);
  });
});