// src/pages/TestToast.jsx
import React from "react";
import { Button, useToast, Box } from "@chakra-ui/react";

function TestToast() {
  const toast = useToast();

  const showToast = () => {
    toast({
      title: "Success!",
      description: "The toast is working 🎉",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box p={4}>
      <Button colorScheme="teal" onClick={showToast}>
        Show Toast
      </Button>
    </Box>
  );
}

export default TestToast;
