import type { PostMetaData } from "../pages";
import { Flex, LinkBox, LinkOverlay, Heading, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { motion } from "framer-motion";

const MotionLinkBox = motion(LinkBox);
export const PostLink = ({ title, date, link }: PostMetaData) => {
    return (
        <MotionLinkBox h="30px" w="260px" whileHover={{ scale: 1.1 }}>
            <Flex justify="space-between" align="center">
                <Heading size="sm" isTruncated>
                    <LinkOverlay href={link} as={NextLink}>
                        {title}
                    </LinkOverlay>
                </Heading>
                <Text fontSize="md">{date}</Text>
            </Flex>
        </MotionLinkBox>
    );
};
