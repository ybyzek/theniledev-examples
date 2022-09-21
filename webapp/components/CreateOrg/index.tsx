import React from 'react';
import { useRouter } from 'next/router';
import { Alert, Stack } from '@mui/material';
import { CreateOrganizationRequest } from '@theniledev/js';
import { Queries, useMutation, useNile } from '@theniledev/react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Typography } from '@mui/joy';

import Link from 'next/link';

export default function AddOrgForm() {
  const nile = useNile();
  const router = useRouter();
  const { register, handleSubmit } = useForm();
  const [error, setError] = React.useState<null | string>();
  const mutation = useMutation(
    (data: CreateOrganizationRequest) =>
      nile.organizations.createOrganization({
        createOrganizationRequest: data,
      }),
    {
      onSuccess: (data) => {
          router.push('instances/clusters');
      },
      onError: (e: Error) => {
        if (typeof e.message === 'string') {
          setError(e.message);
        }
      },
    }
  );

  const handleUpdate = React.useCallback(
    async (data: CreateOrganizationRequest) => {
      setError(null);
      mutation.mutate(data);
    },
    [mutation]
  );

  return (
      <Stack spacing={2} mt={3}>
        <Typography level="h5">Organization name</Typography>
        <Stack
          component="form"
          sx={{
            width: '40ch',
          }}
          spacing={1}
          onSubmit={handleSubmit((data) =>
            handleUpdate(data as CreateOrganizationRequest)
          )}
        >
          <TextField
            {...register('name')}
            fullWidth
            id="name"
            name="name"
            label="Name"
            required
            helperText={<>{error && <Alert severity="error">{error}</Alert>}</>}
            onChange={() => setError(null)}
            error={Boolean(error)}
          />
          <Button type="submit">Save</Button>
        </Stack>
      </Stack>
  );
}
