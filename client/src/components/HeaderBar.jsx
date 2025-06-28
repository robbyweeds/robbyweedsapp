import React, { useEffect, useState } from "react";
import { Box, Flex, Text, Image, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

function HeaderBar({ title }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateString = currentTime.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const timeString = currentTime.toLocaleTimeString();

  return (
    <Box bg="gray.700" color="white" p={3} mb={4} boxShadow="md">
      <Flex align="center" maxW="1200px" mx="auto">
        <Image
          src="/ShearonLogo.jpg"
          alt="Logo"
          boxSize="80px"
          objectFit="contain"
          mr={4}
        />

        <Box flex="1" textAlign="center">
          <Text fontSize="3xl" fontWeight="bold" lineHeight="1.1">
            {title}
          </Text>
        </Box>

        <Box textAlign="right" minWidth="220px">
          <Text fontSize="sm">{dateString}</Text>
          <Text fontSize="lg" fontWeight="medium">
            {timeString}
          </Text>
          <Text fontSize="sm" mt={1}>
            User: {user.username || "Guest"}
          </Text>
        </Box>
      </Flex>

      <Flex mt={3} maxW="1200px" mx="auto" justify="flex-end">
        <Button size="sm" colorScheme="teal" onClick={() => navigate("/main")}>
          Return to Dashboard
        </Button>
      </Flex>
    </Box>
  );
}

export default HeaderBar;
