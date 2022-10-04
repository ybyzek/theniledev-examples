import { Box, Button, Stack, Typography } from '@mui/joy';
import { Queries, useNile, useQuery } from '@theniledev/react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/router';

import NavBar from '../NavBar';
import { instanceName } from '../EntityTable/FormFields';

import RequestLineChart from './RequestsLineChart';
import ThroughputTotal from './ThroughputTotal';
import UpTime from './UpTime';

import paths from '~/paths';

export default function InstanceMetrics() {
  const router = useRouter();

  const entity = String(router.query.entity);
  const instanceId = String(router.query.instance);
  const org = String(router.query.org);

  const nile = useNile();
  const { data: instance } = useQuery(
    Queries.GetInstance(entity, org, instanceId),
    () =>
      nile.entities.getInstance({
        org,
        type: entity,
        id: instanceId,
      }),
    { enabled: Object.keys(router.query).length !== 0 }
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { properties } = instance ?? ({} as Record<string, any>);

  return (
    <NavBar>
      <Button
        href={paths.entities(router.query).index}
        component="a"
        variant="outlined"
        startDecorator={<ArrowBackIcon />}
      >
        Back
      </Button>
      <Stack direction="row" sx={{ justifyContent: 'space-between', pb: 2 }}>
        <Stack>
          <Typography level="h2">{properties?.[instanceName]}</Typography>
          <Typography level="body4">{instance?.id}</Typography>
        </Stack>
        <Stack>
          <Typography level="h2" sx={{ textAlign: 'end' }}>
            {properties?.cloud}
          </Typography>
          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
              gap: 1,
              justifyContent: 'flex-end',
            }}
          >
            <Typography level="body4">Size:</Typography>
            <Typography level="body4">{properties?.size}</Typography>
          </Stack>
        </Stack>
      </Stack>
      <UpTime />
      <Stack sx={{ flexWrap: 'wrap', mt: 2 }} direction="row">
        <Box sx={{ width: '50%' }}>
          <RequestLineChart />
        </Box>
        <Box sx={{ width: '50%' }}>
          <ThroughputTotal />
        </Box>
      </Stack>
    </NavBar>
  );
}
