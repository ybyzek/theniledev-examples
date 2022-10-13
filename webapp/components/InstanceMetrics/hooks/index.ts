import { Measurement, Metric, MetricTypeEnum } from '@theniledev/js';
import getConfig from 'next/config';
import { useRouter } from 'next/router';
import useInterval from 'global-hooks/useInterval';
import React from 'react';
import { useDeveloperNile } from 'global-hooks/useDeveloperNile';

type Config = {
  metricName: string;
  intervalTimeMs: number;
  measurement: () => Measurement;
};

export function useProduceMetric() {
  const _nile = useDeveloperNile();
  const router = useRouter();
  const instanceId = String(router.query.instance);

  return async (metricData: Metric) => {
    if (_nile && instanceId) {
      await _nile.metrics.produceBatchOfMetrics({
        metric: [metricData],
      });
    }
  };
}

export const useMetricsGenerator = (config: Config, cb?: () => void) => {
  const { metricName, intervalTimeMs, measurement } = config;
  const produceMetric = useProduceMetric();

  const { publicRuntimeConfig } = getConfig();
  const { NILE_ENTITY_NAME } = publicRuntimeConfig;

  const produceRequestMetrics = React.useCallback(async () => {
    const fakeMeasurement = measurement();
    const metricData = {
      name: metricName,
      type: MetricTypeEnum.Gauge,
      entityType: NILE_ENTITY_NAME,
      measurements: [fakeMeasurement],
    };
    await produceMetric(metricData);

    cb && cb();
  }, [NILE_ENTITY_NAME, cb, measurement, metricName, produceMetric]);

  const intervalFn = React.useCallback(() => {
    produceRequestMetrics();
  }, [produceRequestMetrics]);

  useInterval(intervalFn, intervalTimeMs);
};
