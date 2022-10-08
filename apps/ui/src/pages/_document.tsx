import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'

/**
 * Custom NextJS Document.
 *
 * @see tailwind-preset.js for styles applied to top-level elements in the component tree.
 */
class CustomDocument extends Document {
  static async getInitialProps(ctx: DocumentContext): ReturnType<typeof Document.getInitialProps> {
    const initialProps = await Document.getInitialProps(ctx)

    return { ...initialProps }
  }

  render(): JSX.Element {
    return (
      <Html>
        <Head>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default CustomDocument
