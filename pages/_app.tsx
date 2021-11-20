import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider, Box } from "@chakra-ui/react"
import Layout from '../components/Layout'
import Head from "next/head"

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <Box>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=-1" />
                <meta name="description" content="Stuart's Homepage"/>
                <meta name="author" content="Stuart Payne"/>
                <title>Stuart Payne - Homepage</title>
            </Head>
            <ChakraProvider>
                <Component {...pageProps} />
            </ChakraProvider>

        </Box>
   )
}

export default MyApp
