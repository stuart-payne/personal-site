import type { PostMatter } from "../pages";
import { Flex, LinkBox, LinkOverlay, Heading, Text } from "@chakra-ui/react";
import NextLink from "next/link";

export const PostLink = ({ title, date, link }: PostMatter) => {
    return (
        <LinkBox>
            <Flex justify="space-between">
                <Heading>
                    <LinkOverlay href={link} as={NextLink}>
                        {title}
                    </LinkOverlay>
                </Heading>
                <Text>{date}</Text>
            </Flex>
        </LinkBox>
    );
};
