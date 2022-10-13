import { Box, Stack, Typography } from '@mui/joy';
import { Queries, useNile } from '@theniledev/react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import React from 'react';

type Metadata = {
  [key: string]: {
    sizeTotal: number;
    instanceTotal: number;
  };
};
export default function ProviderUsage() {
  const nile = useNile();
  const router = useRouter();
  const org = String(router.query.org);
  const type = String(router.query.entity);
  const { isLoading, data: dbs } = useQuery(
    Queries.ListEntities,
    () => nile.entities.listInstances({ org, type }),
    { enabled: Boolean(router.query.org && router.query.entity) }
  );

  const { aws, gcp, azure } = React.useMemo(() => {
    if (!dbs) {
      return {};
    }
    return dbs.reduce(
      (totals: Metadata, instance) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const properties: any = instance.properties;
        const size = Number(properties?.size);
        const cloud = properties?.cloud;
        if (!isNaN(size)) {
          totals[cloud].sizeTotal += size;
          totals[cloud].instanceTotal += 1;
        }
        return totals;
      },
      {
        aws: { sizeTotal: 0, instanceTotal: 0 },
        gcp: { sizeTotal: 0, instanceTotal: 0 },
        azure: { sizeTotal: 0, instanceTotal: 0 },
      }
    );
  }, [dbs]);

  if (isLoading) {
    return null;
  }
  return (
    <Stack spacing={3}>
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Box>
          <Typography>AWS</Typography>
          <Typography level="body4">{aws.sizeTotal} resources</Typography>
        </Box>
        <Typography sx={{ fontWeight: '800' }}>
          {aws.instanceTotal} {`Instance${aws.instanceTotal === 1 ? '' : 's'}`}
        </Typography>
      </Stack>
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Box>
          <Typography>GCP</Typography>
          <Typography level="body4">{gcp.sizeTotal} resources</Typography>
        </Box>
        <Typography sx={{ fontWeight: '800' }}>
          {gcp.instanceTotal} {`Instance${gcp.instanceTotal === 1 ? '' : 's'}`}
        </Typography>
      </Stack>
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Box>
          <Typography>Azure</Typography>
          <Typography level="body4">{azure.sizeTotal} resources</Typography>
        </Box>
        <Typography sx={{ fontWeight: '800' }}>
          {azure.instanceTotal}{' '}
          {`Instance${aws.instanceTotal === 1 ? '' : 's'}`}
        </Typography>
      </Stack>
    </Stack>
  );
}
