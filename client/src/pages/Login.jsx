import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Input, Button, Heading, VStack, FormControl, FormLabel, useToast } from "@chakra-ui/react";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/main");
      } else {
        toast({
          title: "Login failed",
          description: data.error || "Invalid credentials",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch {
      toast({
        title: "Network error",
        description: "Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxW="400px" mx="auto" mt={20} p={6} borderWidth={1} borderRadius="md" boxShadow="md">
      <Heading mb={6} textAlign="center">
        Worker Timesheet Login
      </Heading>
      <VStack spacing={4}>
        <FormControl>
          <FormLabel>Username</FormLabel>
          <Input placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Password</FormLabel>
          <Input
            placeholder="Enter password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>
        <Button colorScheme="blue" width="full" onClick={handleLogin}>
          Login
        </Button>
      </VStack>
    </Box>
  );
}

export default Login;
