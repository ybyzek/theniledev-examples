import type { AppProps } from 'next/app'
import { NileProvider } from '@theniledev/react';
import { Container } from '@mui/joy';

import getConfig from 'next/config'

import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  const { publicRuntimeConfig } = getConfig();
  const { NILE_WORKSPACE, NILE_URL } = publicRuntimeConfig;
  return (
    <NileProvider basePath={NILE_URL} workspace={NILE_WORKSPACE}>
      <Container>
        <Component {...pageProps} />
      </Container>
    </NileProvider>
  );
}

export default MyApp
