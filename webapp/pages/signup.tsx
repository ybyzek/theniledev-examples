import type { NextPage } from 'next';
import Head from 'next/head';

import MySignUpForm from '~/components/MySignupForm';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Your SaaS (built on Nile)</title>
        <meta name="description" content="Welcome to Your SaaS" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/** wrapper around the nile login form */}
      <MySignUpForm />
    </>
  );
};

export default Home;
