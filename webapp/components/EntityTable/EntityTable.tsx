import React from 'react';
import { Box, Stack, Typography } from '@mui/joy';
import Card from '@mui/joy/Card';
import { InstanceTable } from '@theniledev/react';
import { useRouter } from 'next/router';

import Unauthorized from '../Unauthorized';
import NavBar from '../NavBar';

import { CreateInstance } from './CreateInstance';
import { useFirstOrg } from './hooks';

import { getFormFields } from '~/form-fields';
import paths from '~/paths';

export default function ClustersTable() {
  const router = useRouter();
  const [reRender, setReRender] = React.useState(false);
  const entity = String(router.query.entity);
  const [isLoading, user, org, unauthorized] = useFirstOrg();
  const { columns } = getFormFields(entity) ?? {};
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
      <Stack spacing={2} sx={{ mt: 8 }}>
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
                entity={String(router.query.entity)}
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
