import React, { useEffect, useState } from "react";
import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Spinner } from "@chakra-ui/react";
import HeaderBar from "../components/HeaderBar";

function PastEntries() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    fetch("/api/entries")
      .then((res) => res.json())
      .then((data) => setEntries(data));
  }, []);

  return (
    <Box p={4}>
      <HeaderBar title="Past Entries" />
      <Box bg="gray.50" p={4} borderRadius="md" border="1px solid #e2e8f0">
        <Heading size="md" mb={4}>All Past Entries</Heading>
        {entries.length === 0 ? (
          <Spinner />
        ) : (
          <Table variant="simple" size="sm">
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
              {entries.map(entry => (
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

export default PastEntries;
