import React from 'react';
import Head from 'next/head';
import { Box, Heading } from 'rimble-ui';

export default function Header() {
  return (
    <>
      <Head>
        <title>Mime App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box bg="primary" p={1}>
        <Box maxWidth="400px" mx="auto">
          <Heading fontSize={4} color="#fff">
            🤡 Mime Protocol
          </Heading>
        </Box>
      </Box>
    </>
  );
}
