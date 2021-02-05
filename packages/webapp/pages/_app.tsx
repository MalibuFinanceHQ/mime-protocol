import React from 'react';
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import '../styles/globals.css';
import BasePage from '../components/BasePage';

const App = ({ Component, pageProps }: AppProps) => (
    <BasePage>
        <Component {...pageProps} />
    </BasePage>
);

export default dynamic(() => Promise.resolve(App), {
    ssr: false,
});
