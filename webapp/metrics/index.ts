import * as DBMetrics from './DB';
import * as SkyNetMetrics from './SkyNet';
import * as BankingMetrics from './Banking';
import * as WorkloadMetrics from './Workload';

type Metrics = {
  gaugeGraph: string[];
  lineChart: string[];
  averageNum: string[];
};
export const getMetrics = (entity: string): void | Metrics => {
  if (entity === 'DB') {
    return DBMetrics;
  }
  if (entity === 'SkyNet') {
    return SkyNetMetrics;
  }
  if (entity === 'Banking') {
    return BankingMetrics;
  }
  if (entity === 'Workload') {
    return WorkloadMetrics;
  }
};
