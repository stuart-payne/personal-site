import { NextPage, GetStaticPaths, GetStaticProps } from "next";
import { Heading, VStack } from "@chakra-ui/react";
import { getPostContent, getPostNamesWithoutExt } from "../../lib/helpers";
import { ParsedUrlQuery } from "querystring";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import ReactMarkdown from "react-markdown";
import { AnimatePage } from "../../components";

interface PostsParams extends ParsedUrlQuery {
    slug: string;
}

interface PostProps {
    name: string;
    content: string;
}

const Post: NextPage<PostProps> = ({ name, content }) => {
    return (
		<AnimatePage>
			<VStack mt="6rem" spacing="2rem" mb="4rem" align="start">
				<Heading>{name}</Heading>
				<ReactMarkdown components={ChakraUIRenderer()}>
					{content}
				</ReactMarkdown>
			</VStack>
		</AnimatePage>
    );
};

export const getStaticProps: GetStaticProps<PostProps, PostsParams> = async (
    context
) => {
    const { slug } = context?.params as PostsParams;
    return {
        props: {
            name: slug,
            content: await getPostContent(`${slug}.md`),
        },
    };
};

export const getStaticPaths: GetStaticPaths<PostsParams> = async () => {
    const postNames = await getPostNamesWithoutExt();
    return {
        paths: postNames.map((postName) => {
            return { params: { slug: postName } };
        }),
        fallback: false,
    };
};
export default Post;
