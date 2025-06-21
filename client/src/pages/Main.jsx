import React, { useEffect, useState } from "react";
import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Spinner } from "@chakra-ui/react";
import HeaderBar from "../components/HeaderBar";

function Main() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/entries/latest")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        setEntries(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <Box p={4}>
      <HeaderBar title="Dashboard" />
      <Box
        bg="gray.50"
        p={4}
        borderRadius="md"
        border="1px solid #e2e8f0"
        overflowX="auto"
        maxW="100%"
      >
        <Heading size="md" mb={4}>
          Last Entries
        </Heading>
        {loading ? (
          <Spinner />
        ) : (
          <Table variant="simple" size="sm" minWidth="700px">
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
