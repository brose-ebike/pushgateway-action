import { expect } from 'chai';
import 'mocha';
import { serialize } from './serializer';

describe('Serialize metric', () => {

  it('should return metric with correct value', async () => {
    const metric: Metric = {
      name: "test",
      description: null,
      type: "gauge",
      labels: {},
      value: 1.23
    }
    const result = await serialize(metric);
    expect(result).to.equal('# TYPE test gauge\ntest 1.23');
  });

  it('should return metric name only for empty labels', async () => {
    const metric: Metric = {
      name: "test",
      description: null,
      type: "gauge",
      labels: {},
      value: 1.0
    }
    const result = await serialize(metric);
    expect(result).to.equal('# TYPE test gauge\ntest 1');
  });

  it('should return metric with one label', async () => {
    const metric: Metric = {
      name: "test",
      description: null,
      type: "gauge",
      labels: { a: "b" },
      value: 1.0
    }
    const result = await serialize(metric);
    expect(result).to.equal('# TYPE test gauge\ntest{a="b"} 1');
  });

  it('should return metric with two labels', async () => {
    const metric: Metric = {
      name: "test",
      description: null,
      type: "gauge",
      labels: { a: "b", c: "d" },
      value: 1.0
    }
    const result = await serialize(metric);
    expect(result).to.equal('# TYPE test gauge\ntest{a="b",c="d"} 1');
  });

});