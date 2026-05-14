import type { AppProps } from 'next/app';
import '../styles/globals.css';
import Head from 'next/head';
import { ToastProvider } from '../components/Toast';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <ToastProvider>
                <Component {...pageProps} />
            </ToastProvider>
        </>
    );
}

export default MyApp;
