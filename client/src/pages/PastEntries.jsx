import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Button,
  Text,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import HeaderBar from "../components/HeaderBar";

function PastEntries() {
  const [entries, setEntries] = useState(null); // null = loading state
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/entries/latest")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        console.log("Fetched entries:", data); // Add this!
        setEntries(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("Failed to load past entries.");
        setEntries([]);
      });
  }, []);

  if (entries === null) {
    return (
      <Box p={4} textAlign="center" mt={20}>
        <HeaderBar title="Past Timesheets" />
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <HeaderBar title="Past Timesheets" />

      {error && (
        <Text color="red.500" mb={4}>
          {error}
        </Text>
      )}

      {entries.length === 0 ? (
        <Text>No past entries found.</Text>
      ) : (
        <Box overflowX="auto" bg="gray.50" p={4} borderRadius="md" border="1px solid #e2e8f0">
          <Table variant="simple" size="sm" minWidth="600px">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Time In</Th>
                <Th>Time Out</Th>
                <Th>Total Hours</Th>
                <Th>Comment</Th>
              </Tr>
            </Thead>
            <Tbody>
              {entries.map((entry) => (
                <Tr key={entry.id}>
                  <Td>{entry.date}</Td>
                  <Td>{entry.timeIn}</Td>
                  <Td>{entry.timeOut}</Td>
                  <Td>{entry.totalHours}</Td>
                  <Td>{entry.comment}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <Button mt={4} onClick={() => navigate("/main")}>
        Back to Dashboard
      </Button>
    </Box>
  );
}

export default PastEntries;
