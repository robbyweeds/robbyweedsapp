import React, { useEffect, useState } from "react";
import { Box, Flex, Text, VStack, HStack, Button, Spacer } from "@chakra-ui/react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

function HeaderBar({ title }) {
  const { user } = useUser();
  const navigate = useNavigate();

  const [dateTime, setDateTime] = useState({
    date: "",
    time: "",
  });

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setDateTime({
        date: now.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
        time: now.toLocaleTimeString(),
      });
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box bg="blue.600" color="white" p={4} borderRadius="md" mb={6}>
      <Flex align="center" mb={2}>
        <Spacer />
        {/* Title centered */}
        <Text
          fontWeight="bold"
          fontSize="3xl"
          textAlign="center"
          flex="1"
          userSelect="none"
          whiteSpace="nowrap"
        >
          {title}
        </Text>
        <Spacer />
        {/* Dashboard button on right */}
        <Button
          size="sm"
          colorScheme="yellow"
          onClick={() => navigate("/main")}
          ml={4}
        >
          Dashboard
        </Button>
      </Flex>

      {/* User info, date, and time below */}
      <HStack spacing={8} fontSize="md" opacity={0.9} justify="center">
        <Text>{user ? `User: ${user.username}` : "Not logged in"}</Text>
        <Text>{dateTime.date}</Text>
        <Text>{dateTime.time}</Text>
      </HStack>
    </Box>
  );
}

export default HeaderBar;
