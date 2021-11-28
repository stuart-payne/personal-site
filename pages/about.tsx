import { Box, Heading } from "@chakra-ui/react";
import type { NextPage } from "next";
import { AnimatePage } from "../components";

const About: NextPage = () => {
    return (
		<AnimatePage>
			<Box>
				<Heading>Hi</Heading>
			</Box>
		</AnimatePage>
    );
};

export default About;
