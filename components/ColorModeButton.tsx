import { motion } from "framer-motion";
import { IconButton, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";
import React from "react";

const ColorModeButton = () => {
    const { toggleColorMode } = useColorMode();
    const MotionIconButton = motion(IconButton);

    return (
        <MotionIconButton
            key="button"
            icon={useColorModeValue(<MoonIcon />, <SunIcon />)}
            onClick={toggleColorMode}
            bg={useColorModeValue("#eeeeee", "#111111")}
            whileHover={{ scale: 1.1 }}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2 }}
            _hover={{ bg: useColorModeValue("#dddddd", "#222222") }}
        ></MotionIconButton>
    );
};

export default ColorModeButton;
