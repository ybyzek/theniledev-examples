const gaugeGraph = {
  metricName: 'custom.DB.instance.uptime',
  metricTitle: 'Up time',
};

const lineChart = {
  metricName: 'custom.DB.instance.qps',
  metricTitle: 'Queries per second (QPS)',
};

const averageNum = {
  metricName: 'custom.DB.instance.throughput',
  metricTitle: 'Average write latency (ms)',
};

export { gaugeGraph, lineChart, averageNum };
