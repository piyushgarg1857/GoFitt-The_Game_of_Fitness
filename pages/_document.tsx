import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                {/* Fonts */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@500;700&display=swap" rel="stylesheet" />

                {/* PWA & Icons */}
                <link rel="manifest" href="/manifest.json" />
                <link rel="icon" href="/logo.png" type="image/png" />
                <link rel="apple-touch-icon" href="/logo.png" />
                <meta name="theme-color" content="#111827" />
                <meta name="application-name" content="GoFit" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="GoFit" />
                <meta name="mobile-web-app-capable" content="yes" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
