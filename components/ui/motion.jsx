"use client";

import { motion } from "framer-motion";

export const FadeIn = ({
    children,
    delay = 0,
    duration = 0.5,
    className = "",
    direction = "up"
}) => {
    const directions = {
        up: { y: 20 },
        down: { y: -20 },
        left: { x: 20 },
        right: { x: -20 },
        none: {}
    };

    return (
        <motion.div
            initial={{ opacity: 0, ...directions[direction] }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const ScaleOnHover = ({ children, scale = 1.05, className = "" }) => {
    return (
        <motion.div
            whileHover={{ scale }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const StaggerContainer = ({ children, delay = 0, stagger = 0.1, className = "" }) => {
    return (
        <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
                hidden: { opacity: 0 },
                show: {
                    opacity: 1,
                    transition: {
                        staggerChildren: stagger,
                        delayChildren: delay
                    }
                }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const StaggerItem = ({ children, className = "" }) => {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const GlowEffect = ({ children, color = "rgba(245, 158, 11, 0.5)", blur = 20 }) => {
    return (
        <motion.div
            whileHover={{
                boxShadow: `0 0 ${blur}px ${color}`,
            }}
            transition={{ duration: 0.3 }}
            style={{ borderRadius: "inherit" }}
        >
            {children}
        </motion.div>
    );
};
