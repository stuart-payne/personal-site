import { AnimatePresence, motion } from "framer-motion"
import { Box } from "@chakra-ui/react"
import { FunctionComponent } from "react"

const variants = {
	hidden : { opacity: 0, y: 100 },
	normal: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: 100 }
};

export const AnimatePage: FunctionComponent= ({ children }) => {
	const MotionBox = motion(Box);
	return (
		<MotionBox 
			h="100%"
			initial="hidden"
			animate="normal"
			exit="exit"
			variants={variants}
			transition={{ duration: 0.4}}>
			{children}
		</MotionBox>
	);
}
