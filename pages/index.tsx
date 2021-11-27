import type { NextPage, GetStaticProps } from "next";
import { Center, Heading, HStack, VStack, Text } from "@chakra-ui/react";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { LinkIcon, PostLink } from "../components";
import { getPostNames, getAllPostMetaData } from "../lib/helpers";

interface IndexProps {
    posts: PostMetaData[];
}

export interface PostMetaData {
    title: string;
    date: string;
    link: string;
}

const Home: NextPage<IndexProps> = ({ posts }) => {
    return (
        <Center h="100%">
            <VStack spacing="1rem">
                <Heading mb="0.5rem" as="h1" size="2xl">
                    Stuart Payne
                </Heading>
                <HStack spacing="1.5rem">
                    <LinkIcon
                        url="mailto:paynestu@gmail.com"
                        icon={FaEnvelope}
                    />
                    <LinkIcon
                        url="https://github.com/stuart-payne"
                        icon={FaGithub}
                    />
                    <LinkIcon
                        url="https://linkedin.com/in/stuartrpayne"
                        icon={FaLinkedin}
                    />
                </HStack>
                <Heading as="h2" size="lg">
                    DevBlog
                </Heading>
                <VStack>
                    <Heading size="md" mt="1rem" mb="0.5rem">
                        Recent Posts
                    </Heading>
                    <VStack spacing="-4px">
                        {posts.slice(0, 5).map(({ title, date, link }) => (
                            <PostLink
                                key={title}
                                title={title}
                                date={date}
                                link={link}
                            />
                        ))}
                    </VStack>
                </VStack>
            </VStack>
        </Center>
    );
};

export const getStaticProps: GetStaticProps<IndexProps> = async () => {
    const postsMetaData = await getAllPostMetaData();
    return {
        props: {
            posts: postsMetaData,
        },
    };
};

export default Home;
