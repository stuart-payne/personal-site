import { Box, Container, HStack, Flex, Heading, Spacer, useColorMode, useColorModeValue } from "@chakra-ui/react";
import React from "react";
import ColorModeButton from "./ColorModeButton";

const Navbar = () => {
    return (
        <Box
            w="100%"
            h={16}
            position="fixed"
            zIndex={1}
            bg={useColorModeValue("blue.100", "gray.800")}
            >
            <Container h="100%" maxW="container.md">
                <Flex h="100%" justify="space-between" align="center">
                    <Heading as="h3" size="md">&gt; $  cd /home/</Heading>
                    <ColorModeButton/>
                </Flex>
            </Container>
        </Box>
    )
}


export default Navbar;