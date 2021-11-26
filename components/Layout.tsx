import React from "react";
import { Box, Container, useColorModeValue } from "@chakra-ui/react";
import Head from "next/head";
import Navbar from "./Navbar";

export interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Box>
      <Navbar />
      <Container h="100vh" maxW="container.sm" centerContent pt={16}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;
