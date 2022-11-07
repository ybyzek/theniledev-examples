import React from 'react';
import { Card, Typography } from '@mui/joy';
import { MetricsLineChart } from '@theniledev/react';
import { useRouter } from 'next/router';

import { useTheme } from '../../../global-context/theme';

import { getMetrics } from '~/metrics';

const now = new Date();

const TEN_MINUTES_AGO = new Date(now.getTime() - 0.5 * 60000);

export default function RequestLineChartLoader() {
  const router = useRouter();
  const instanceId = String(router.query.instance);
  const entityType = String(router.query.entity);
  const organizationId = String(router.query.org);

  if (Object.keys(router.query).length === 0) {
    return null;
  }
  return (
    <RequestLineChart
      instanceId={instanceId}
      entityType={entityType}
      organizationId={organizationId}
    />
  );
}
type Props = {
  instanceId: string;
  entityType: string;
  organizationId: string;
};
function RequestLineChart(props: Props) {
  const color = useTheme();
  const router = useRouter();
  const entity = String(router.query.entity);

  const { lineChart } = getMetrics(entity) ?? {};
  const METRIC_NAME = lineChart['metricName'];
  const METRIC_TITLE = lineChart['metricTitle'];

  const metricName = METRIC_NAME;
  const { instanceId, entityType, organizationId } = props;

  const [timestamp] = React.useState(TEN_MINUTES_AGO);

  const metricFilter = React.useMemo(
    () => ({
      entityType,
      metricName,
      organizationId,
      startTime: timestamp,
      instanceId: instanceId,
    }),
    [entityType, metricName, organizationId, timestamp, instanceId]
  );

  return (
    <Card variant="outlined">
      <Typography level="h4">{METRIC_TITLE}</Typography>
      <MetricsLineChart
        updateInterval={3000}
        filter={metricFilter}
        timeFormat="HH:mm:ss"
        dataset={{
          tension: 0.3,
          pointRadius: 0,
          borderColor: color.primary,
        }}
        chartOptions={{
          plugins: {
            legend: {
              display: false,
            },
          },
          animation: {
            duration: 400,
          },
          scales: {
            y: {
              suggestedMin: 35,
              suggestedMax: 432,
            },
          },
        }}
      />
    </Card>
  );
}
