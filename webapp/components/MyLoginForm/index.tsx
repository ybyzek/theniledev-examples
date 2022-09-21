import { Chip, Link, Stack, Typography } from '@mui/joy';
import Card from '@mui/joy/Card';
import { LoginForm, useQuery, useNile } from '@theniledev/react';
import { useRouter } from 'next/router';
import React from 'react';
import ChipDelete from '@mui/joy/ChipDelete';
import Logo from '~/components/Logo';

export default function MyLoginForm() {

  const router = useRouter();

  const signup = String(router.query.signup);
  const [error, setErrorMessage] = React.useState<null | string>(null);

  const nile = useNile();
  const [hadLoginSuccess, setHadLoginSuccess] = React.useState(false);
  const { isLoading, data: me = {}, error2 } = useQuery(['/anythingelse'], () => nile.users.me(), {
    enabled: hadLoginSuccess,
  });

  React.useEffect((): void => {
    const orgMemberships = me.orgMemberships;
    if (hadLoginSuccess && orgMemberships != null) {
      if (Object.keys(orgMemberships).length < 1) {
        router.push('/createorg');
      } else {
        router.push('/instances/clusters');
      }
    }
  }, [router, me, hadLoginSuccess]);

  return (
    <Stack
      sx={{
        height: '98vh',
        alignItems:"center",
        justifyContent:"center",
      }}
    >
    <Card variant="outlined" sx={{ background: 'transparent', padding: 14, paddingTop: 10}}>
      <Stack spacing={10}>
        <Logo width={300}/>
        {error && (
          <Chip 
            variant="soft" 
            color="danger" 
            endDecorator={
              <ChipDelete 
                variant="plain"  
                onClick={() => { setErrorMessage(null) }}
              />
            }
          >
            {error}
          </Chip>
        )}
        {signup != "undefined" && signup == "success" && (
          <Chip
            variant="soft"
            color="success"
          >
            Signup success
          </Chip>
        )}
        <LoginForm 
          onSuccess={() => {
            setHadLoginSuccess(true);
            // router.push('/instances/clusters');
          }}
          onError={(error) => {
            // for demo purposes only
            if (/workspace .* not found/.test(error.message)) {
              setErrorMessage('Double check your workspace name in pages/_app.tsx')
            } else {
              setErrorMessage(error.message);
            }
          }}
        />
      </Stack>
      <Typography level="body4" sx={{ marginTop: 1 }}>
        Sign in using an organization user email and password.
      </Typography>
      <Typography level="body4" sx={{ marginTop: 1 }}>
        New user? {' '}
        <Link href="signup" target="_blank">
          Signup
        </Link>
      </Typography>
    </Card>
    </Stack>
  );
}
