import type { AppProps } from 'next/app'
import { NileProvider } from '@theniledev/react';
import { Container } from '@mui/joy';

import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NileProvider basePath={process.env.NEXT_PUBLIC_NILE_URL} workspace={process.env.NEXT_PUBLIC_NILE_WORKSPACE}>
      <Container>
        <Component {...pageProps} />
      </Container>
    </NileProvider>
  );
}

export default MyApp
