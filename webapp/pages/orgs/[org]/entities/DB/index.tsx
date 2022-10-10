import { Stack } from '@mui/joy';
import type { NextPage } from 'next';
import Head from 'next/head';
import React from 'react';

import { GridView } from '~/components/db'; // https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping
import NavBar from '~/components/NavBar';

const Clusters: NextPage = () => {
  return (
    <Stack>
      <Head>
        <title>Databases | powered by Nile</title>
        <meta name="description" content="DB entity list page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar allowCreation={true} hasRightSidebar={true} entity="DB">
        <GridView />
      </NavBar>
    </Stack>
  );
};
export default Clusters;
