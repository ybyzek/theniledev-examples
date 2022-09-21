import React from 'react';
import { Box, Button, Link, Stack, Typography } from '@mui/joy';
import Card from '@mui/joy/Card';
import { Organization, User } from '@theniledev/js';
import { useQuery, InstanceTable, useNile } from '@theniledev/react';
import Unauthorized from '../Unauthorized';

import getConfig from 'next/config'


const useFirstOrg = (): [boolean, User | undefined, Organization | undefined, boolean] => {
  const nile = useNile();
  const { isLoading, data: user, error } = useQuery(['/me'], () => nile.users.me())

  const _error: { response: { status: number } } = error as any;
  const errorStatus = _error ? _error?.response?.status : null;
  const unauthorized = errorStatus === 401;


  const { orgMemberships } = user ?? {};

  const theFirstOne = React.useMemo(() => {
    if (orgMemberships) {

    const ids = Object.keys(orgMemberships);
      return ids[0]
    }

  }, [orgMemberships])

  const { isLoading: orgLoading, data: org } = useQuery(['/orgs'], () => 
    nile.organizations.getOrganization({ org: String(theFirstOne) }), 
    { enabled: !!theFirstOne }
  )
  return [isLoading && orgLoading, user, org, unauthorized];
}


const CreateInstance = () => {
  return (
    <Button onClick={() => { 
        alert('Implement a form for a user to create a cluster instance')
      }}
    >
      Create SaaSDB
    </Button>
  );
}

export default function ClustersTable(){

  const [isLoading, user, org, unauthorized] = useFirstOrg();

  if (unauthorized) {
    return <Unauthorized />
  }

  if (isLoading || !user || !org) {
    return <>Loading...</>;
  }

  if (!org) {
    return (
      <Stack spacing={2}>
        <Typography level="h1">Welcome {user?.email}!</Typography>
        <Typography>No organizations have been found for you.</Typography>
        <Typography>
          To fix this for demo purposes,{' '}
          <Link 
            href="https://www.thenile.dev/docs/current/quick-start-ui#sign-up-as-a-tenant"
            target="_blank"
          >
            follow the quickstart for adding a tenant
          </Link>
          .
        </Typography>
      </Stack>
    );
 
  }

  const { publicRuntimeConfig } = getConfig();
  const { NILE_ENTITY_NAME } = publicRuntimeConfig;

  return (
    <Stack spacing={2}>
      <Typography level="h1">Welcome {user?.email}!</Typography>
      <Link href="/">Log out</Link>
      <Card variant="outlined" sx={{ background: 'transparent' }}>
        <Stack direction="row" spacing={2} sx={{alignItems: 'center', marginBottom: 3 }}>
          <Typography>Organization:</Typography>
          <Typography component="strong">{org.name}</Typography>
          <Box sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-end'
            }}
          >
            <CreateInstance key="create-instance"/>
          </Box>
        </Stack>
        <InstanceTable 
          org={org.id} 
          entity={NILE_ENTITY_NAME} 
          handleRowClick={() => alert('handle a row click')}
          columns={['dbName', 'cloud', 'environment', 'size']} 
        />
      </Card>
    </Stack>
  )
}
