import React from 'react';
import { Box, Stack, Typography } from '@mui/joy';
import Card from '@mui/joy/Card';
import { InstanceTable } from '@theniledev/react';
import { useRouter } from 'next/router';

import Unauthorized from '../Unauthorized';
import NavBar from '../NavBar';

import { CreateInstance } from './CreateInstance';
import { useFirstOrg } from './hooks';
import { columns } from './FormFields';

import paths from '~/paths';

export default function ClustersTable() {
  const router = useRouter();
  const [reRender, setReRender] = React.useState(false);
  const [isLoading, user, org, unauthorized] = useFirstOrg();

  // just a simple refresh for now.
  React.useEffect(() => {
    if (reRender === true) {
      setReRender(false);
    }
  }, [reRender]);

  if (unauthorized) {
    return <Unauthorized />;
  }

  if (isLoading || !user || !org) {
    return <>Loading...</>;
  }

  return (
    <NavBar>
      <Stack spacing={2}>
        <Card variant="outlined" sx={{ background: 'transparent' }}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center', marginBottom: 3 }}
          >
            <Typography>Instances:</Typography>
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <CreateInstance
                key="create-instance"
                org={org.id}
                setReRender={() => setReRender(true)}
              />
            </Box>
          </Stack>
          {reRender ? null : (
            <InstanceTable
              org={org.id}
              entity={String(router.query.entity)}
              handleRowClick={({ id }) => {
                router.push(
                  paths.entities({ ...router.query, id: String(id) }).view
                );
              }}
              columns={columns}
            />
          )}
        </Card>
      </Stack>
    </NavBar>
  );
}
