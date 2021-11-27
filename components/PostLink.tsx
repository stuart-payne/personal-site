import type { PostMetaData } from "../pages";
import { Flex, LinkBox, LinkOverlay, Heading, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { motion } from "framer-motion";

const MotionLinkBox = motion(LinkBox);
export const PostLink = ({ title, date, link }: PostMetaData) => {
    return (
        <MotionLinkBox minH="2.5rem" w="320px" whileHover={{ scale: 1.1 }}>
            <Flex justify="space-between" align="center">
                <Heading letterSpacing="wider" size="sm" isTruncated>
                    <LinkOverlay href={link} as={NextLink}>
                        {title}
                    </LinkOverlay>
                </Heading>
                <Text fontWeight="semibold" fontSize="md">
                    {date}
                </Text>
            </Flex>
        </MotionLinkBox>
    );
};
