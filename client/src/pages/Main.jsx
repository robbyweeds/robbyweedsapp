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
  HStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import HeaderBar from "../components/HeaderBar";

function Main() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/entries/latest")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => setEntries(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box p={4}>
      <HeaderBar title="Dashboard" />
      
      <HStack spacing={4} mb={4}>
        <Button colorScheme="green" onClick={() => navigate("/create")}>
          Create Timesheet
        </Button>
        <Button colorScheme="blue" onClick={() => navigate("/past")}>
          View Past Timesheets
        </Button>
      </HStack>
      
      <Box bg="gray.50" p={4} borderRadius="md" border="1px solid #e2e8f0" overflowX="auto">
        <Heading size="md" mb={4}>Last Entries</Heading>
        
        {loading ? (
          <Spinner />
        ) : entries.length === 0 ? (
          <Box>No entries found.</Box>
        ) : (
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
        )}
      </Box>
    </Box>
  );
}

export default Main;
