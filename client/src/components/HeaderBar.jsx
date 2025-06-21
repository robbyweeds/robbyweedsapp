import React from "react";
import { Box, Flex, Heading, Spacer, Text, Button, Image } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

function HeaderBar({ title, user }) {
  const navigate = useNavigate();

  const now = new Date();
  const dateString = now.toLocaleDateString();
  const timeString = now.toLocaleTimeString();

  return (
    <Flex
      bg="blue.600"
      color="white"
      px={4}
      py={3}
      align="center"
      boxShadow="md"
      mb={4}
      wrap="wrap"
    >
      <Image
        src={require("../ShearonLogo.jpg")}
        alt="Logo"
        boxSize="40px"
        objectFit="contain"
        mr={3}
      />
      <Heading size="md" mr={5} whiteSpace="nowrap">
        {title}
      </Heading>

      <Spacer />

      <Text fontSize="lg" fontWeight="bold" mr={5} whiteSpace="nowrap">
        Logged in: {user?.username || "Guest"}
      </Text>
      <Text mr={5} whiteSpace="nowrap">
        {dateString} {timeString}
      </Text>

      <Button
        colorScheme="teal"
        variant="outline"
        size="sm"
        onClick={() => navigate("/main")}
      >
        Dashboard
      </Button>
    </Flex>
  );
}

export default HeaderBar;
