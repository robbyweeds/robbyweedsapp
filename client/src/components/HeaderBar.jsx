import React from "react";
import { Box, Flex, Text, Button, Spacer } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

function HeaderBar({ title }) {
  const navigate = useNavigate();

  return (
    <Flex
      as="header"
      bg="teal.600"
      color="white"
      align="center"
      padding="12px 24px"
      boxShadow="md"
      position="sticky"
      top="0"
      zIndex="1000"
    >
      <Text fontSize="xl" fontWeight="bold">
        {title}
      </Text>
      <Spacer />
      <Button
        onClick={() => navigate("/main")}
        colorScheme="orange"
        size="md"
        fontWeight="bold"
        _hover={{ bg: "orange.400" }}
        _active={{ bg: "orange.500" }}
        borderRadius="md"
        boxShadow="md"
        // Optionally, add a slight animation or scale effect on hover/focus
        _focus={{ boxShadow: "outline" }}
      >
        Dashboard
      </Button>
    </Flex>
  );
}

export default HeaderBar;
