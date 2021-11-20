import type { NextPage } from 'next'
import Layout from '../components/Layout'
import { Center, Heading, HStack, VStack, Icon } from '@chakra-ui/react'
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa"
import { LinkIcon } from '../components/LinkIcon'

const Home: NextPage = () => {
    return (
        <Layout>
            <Center h="100%">
                <VStack spacing="18px">
                    <Heading mb="8px" as="h1" size="2xl">Stuart Payne</Heading>
                    <HStack spacing="24px">
                        <LinkIcon url="mailto:paynestu@gmail.com" icon={FaEnvelope} />
                        <LinkIcon url="https://github.com/stuart-payne" icon={FaGithub} />
                        <LinkIcon url="https://linkedin.com/in/stuartrpayne" icon={FaLinkedin} />
                    </HStack>
                    <Heading as="h2" size="lg">DevBlog</Heading>
                </VStack>
            </Center>
        </Layout>
    )
}

export default Home
