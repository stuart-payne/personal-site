import { NextPage, GetStaticPaths, GetStaticProps } from "next";
import { Box, Text } from "@chakra-ui/react";
import { getPostNames, getPostNamesWithoutExt } from "../../lib/helpers";
import { ParsedUrlQuery } from "querystring";

interface PostsParams extends ParsedUrlQuery {
    slug: string;
}

interface PostProps {
    name: string;
}

const Post: NextPage<PostProps> = ({ name }) => {
    return (
        <Box>
            <Text>{name}</Text>
        </Box>
    );
};

export const getStaticProps: GetStaticProps<PostProps, PostsParams> = async (
    context
) => {
    const params = context?.params as PostsParams;
    return {
        props: {
            name: params.slug,
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
