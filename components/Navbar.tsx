import {
    LinkOverlay,
    LinkBox,
    Container,
    Center,
    Flex,
    Heading,
    Text,
    HStack,
    useColorModeValue,
} from "@chakra-ui/react";
import React from "react";
import Link from "next/link";
import ColorModeButton from "./ColorModeButton";

const Navbar = () => {
    return (
        <LinkBox
            w="100%"
            h={16}
            position="fixed"
            zIndex={1}
            bg={useColorModeValue("blue.100", "gray.800")}
        >
            <Container h="100%" maxW="container.md">
                <Flex h="100%" justify="space-between" align="center">
                    <Heading as="h3" size="md">
                        <LinkOverlay href="/" as={Link}>
                            &gt; $ cd /home/
                        </LinkOverlay>
                    </Heading>
                    <HStack spacing={8}>
                        <LinkOverlay href="/about" as={Link}>
                            About
                        </LinkOverlay>
                        <ColorModeButton />
                    </HStack>
                </Flex>
            </Container>
        </LinkBox>
    );
};

export default Navbar;
