import { Link, Icon, Center } from "@chakra-ui/react";
import type { IconType } from "react-icons";
import { motion } from "framer-motion";

export interface LinkIconProps {
    url: string;
    icon: IconType;
}

export const LinkIcon = ({ icon, url }: LinkIconProps) => {
    const MotionLink = motion(Link);
    return (
        <MotionLink
            href={url}
            isExternal
            whileHover={{ scale: 1.2 }}
            transition={{ duration: 0.2 }}
        >
            <Center>
                <Icon boxSize="1.6em" as={icon} />
            </Center>
        </MotionLink>
    );
};
