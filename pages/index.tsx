import type { NextPage, GetStaticProps, } from 'next'
import { Center, Heading, HStack, VStack, Text } from '@chakra-ui/react'
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa"
import { LinkIcon } from '../components/LinkIcon'
import { getPostNames, getFrontMatterForAllPosts } from '../lib/helpers'

interface IndexProps {
    posts : PostMatter[]
}

interface PostMatter {
	title: string,
	date: string,
}

const Home: NextPage<IndexProps>  = ({ posts }) => {
    return (
        <Center h="100%">
            <VStack spacing="18px">
                <Heading mb="8px" as="h1" size="2xl">Stuart Payne</Heading>
                <HStack spacing="24px">
                    <LinkIcon url="mailto:paynestu@gmail.com" icon={FaEnvelope} />
                    <LinkIcon url="https://github.com/stuart-payne" icon={FaGithub} />
                    <LinkIcon url="https://linkedin.com/in/stuartrpayne" icon={FaLinkedin} />
                </HStack>
                <Heading as="h2" size="lg">DevBlog</Heading>
                <VStack>
                    { posts.slice(0, 5).map((post) => <Text key={post.title}>{post.title}</Text>)}
                </VStack>
            </VStack>
        </Center>
    )
}

export const getStaticProps: GetStaticProps<IndexProps> = async() => {
	const frontMatterArray = await getFrontMatterForAllPosts();
	const posts = [];
	for(const frontMatter of frontMatterArray) {
		const { title, date } = frontMatter.data;
		posts.push({ title, date: date.toDateString() } as PostMatter);
		console.log(date);
	}
    return {
        props: {
            posts: posts
        },
    }
}

export default Home
