import { Typography, Card, CircularProgress, Stack, Link } from '@mui/joy';
import { Queries, useNile, useQuery } from '@theniledev/react';
import { useRouter } from 'next/router';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import React from 'react';
import { Instance } from '@theniledev/js';
import useInterval from 'global-hooks/useInterval';
import CircleIcon from '@mui/icons-material/Circle';

import Aws from '~/images/aws.svg';
import Gcp from '~/images/gcp.svg';
import Azure from '~/images/azure.svg';
import NoCloud from '~/images/nocloud.svg';
import paths from '~/paths';

const DB_NAME = 'DB';
const CloudIcon = ({
  cloud,
  height,
}: {
  height: number;
  cloud: void | string;
}) => {
  if (cloud === 'aws') {
    return <Aws height={`${height}px`} />;
  }
  if (cloud === 'gcp') {
    return <Gcp height={`${height}px`} />;
  }
  if (cloud === 'azure') {
    return <Azure height={`${height}px`} />;
  }
  return null;
};

type Properties = {
  dbName: 'string';
  cloud: 'aws' | 'gcp' | 'azure';
  environment: 'test' | 'dev' | 'prod';
  size: number;
  connection: string;
  status: 'Submitted' | 'Provisioning' | 'Up' | 'Deleted';
};

const DbCard = ({
  properties,
  id,
  width,
}: {
  id: string;
  width: number;
  properties: void | Properties;
}) => {
  const router = useRouter();
  const status = React.useMemo(() => {
    switch (properties?.status) {
      case 'Up':
        return 'success';
      case 'Deleted':
        return 'danger';
      case 'Provisioning':
      default:
        return 'neutral';
    }
  }, [properties?.status]);
  return (
    <Link
      href={
        paths.entities({ ...router.query, entity: DB_NAME, id: String(id) })
          .view
      }
      sx={{ ':hover': { textDecoration: 'none' } }}
    >
      <Card
        variant="outlined"
        sx={(theme) => ({
          width,
          transition:
            'background 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
          cursor: 'pointer',
          '&:hover': {
            boxShadow: theme.shadow.lg,
            background: 'var(--mui-palette-primary-light)',
          },
        })}
      >
        <Stack spacing={2} sx={{ justifyContent: 'space-between' }}>
          <Stack
            direction="row"
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <CloudIcon cloud={properties?.cloud} height={40} />
            <ArrowForwardIcon
              sx={{ fill: 'var(--mui-palette-primary-dark)' }}
            />
          </Stack>
          <Stack
            direction="row"
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography>{properties?.dbName}</Typography>
          </Stack>
          <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
            <CircleIcon sx={{ color: status, fontSize: '10px' }} />
            <Typography level="body3">{properties?.status}</Typography>
          </Stack>
        </Stack>
      </Card>
    </Link>
  );
};

type EnvInstances = { test: []; prod: []; dev: [] };
export default function EntityGridView() {
  const nile = useNile();
  const router = useRouter();
  const type = 'DB';
  const org = String(router.query.org);
  const {
    isLoading,
    data: instances,
    refetch,
  } = useQuery(
    Queries.ListInstances(type, org),
    () => nile.entities.listInstances({ type, org }),
    { enabled: Boolean(router.query.entity) }
  );
  const instanceByEnv = React.useMemo<EnvInstances>(() => {
    if (!instances) {
      return { test: [], prod: [], dev: [] };
    }

    return instances?.reduce(
      (accum: EnvInstances, instance: Instance) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const properties = instance.properties as any;
        const env = properties?.environment;
        if (env === 'test' || env === 'prod' || env === 'dev') {
          // @ts-expect-error def check is above
          accum[env].push(instance);
        }

        return accum;
      },
      { test: [], prod: [], dev: [] }
    );
  }, [instances]);

  useInterval(refetch, 2000);

  if (isLoading) {
    return <CircularProgress />;
  }

  const { prod, dev, test } = instanceByEnv ?? { test: [], prod: [], dev: [] };
  if (prod.length === 0 && dev.length === 0 && test.length === 0) {
    return (
      <Stack sx={{ alignItems: 'center', mt: 8 }}>
        <NoCloud width="50em" />
        <Typography level="h4">No databases found.</Typography>
        <Typography level="body3">Cloud is very sad.</Typography>
      </Stack>
    );
  }
  return (
    <Stack spacing={12} sx={{ mt: 8 }}>
      {prod.length > 0 && (
        <Stack spacing={2}>
          <Typography sx={{ fontWeight: 600 }}>Production</Typography>
          <Stack spacing={2} sx={{ gap: 4 }} direction="row">
            {prod.map((instance: Instance) => {
              return (
                <DbCard
                  properties={instance.properties as Properties}
                  key={instance.id}
                  id={instance.id}
                  width={180}
                />
              );
            })}
          </Stack>
        </Stack>
      )}
      {dev.length > 0 && (
        <Stack spacing={2}>
          <Typography sx={{ fontWeight: 600 }}>Dev</Typography>
          <Stack
            sx={{ gap: 4, flexWrap: 'wrap', justifyContent: 'flex-start' }}
            direction="row"
          >
            {dev.map((instance: Instance) => {
              return (
                <DbCard
                  properties={instance.properties as Properties}
                  key={instance.id}
                  id={instance.id}
                  width={180}
                />
              );
            })}
          </Stack>
        </Stack>
      )}
      {test.length > 0 && (
        <Stack spacing={2}>
          <Typography sx={{ fontWeight: 600 }}>Test</Typography>
          <Stack
            sx={{ gap: 4, flexWrap: 'wrap', justifyContent: 'flex-start' }}
            direction="row"
          >
            {test.map((instance: Instance) => {
              return (
                <DbCard
                  properties={instance.properties as Properties}
                  key={instance.id}
                  id={instance.id}
                  width={180}
                />
              );
            })}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
