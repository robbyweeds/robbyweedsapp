import React from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Divider,
} from "@chakra-ui/react";

function LivePreviewTable({ entry, totalWorkHours }) {
  const hasData = entry.date || entry.timeIn || entry.foremanId || entry.property || entry.comment;

  return (
    <Box mt={10} p={4} borderWidth={2} borderRadius="md" bg="gray.100" boxShadow="lg">
      <Heading size="md" mb={4}>Live Preview</Heading>

      {!hasData ? (
        <Text color="gray.500" fontStyle="italic">
          Start filling out the form above to see a live preview here!
        </Text>
      ) : (
        <>
          <Text><strong>Date:</strong> {entry.date || "N/A"}</Text>
          <Text><strong>Time In:</strong> {entry.timeIn || "N/A"}</Text>
          <Text><strong>Time Out:</strong> {entry.timeOut || "N/A"}</Text>
          <Text><strong>Total Hours:</strong> {totalWorkHours()}</Text>
          <Text><strong>Foreman:</strong> {entry.foremanId ? entry.foremanId : "N/A"}</Text>
          <Text><strong>Property:</strong> {entry.property || "N/A"}</Text>
          <Text><strong>Comment:</strong> {entry.comment || "N/A"}</Text>

          <Divider my={4} />

          <Heading size="sm" mb={2}>Workers</Heading>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Worker Name</Th>
                <Th>Start</Th>
                <Th>End</Th>
                <Th>Misc.</Th>
                <Th>Small Power</Th>
                <Th>Machine</Th>
                <Th>Lunch</Th>
              </Tr>
            </Thead>
            <Tbody>
              {entry.workers && entry.workers.filter(w => w.id || w.name).map((worker, idx) => (
                <Tr key={idx} bg={worker.id ? "white" : "gray.50"}>
                  <Td>{worker.name || "—"}</Td>
                  <Td>{worker.start || "—"}</Td>
                  <Td>{worker.end || "—"}</Td>
                  <Td>{worker.miscellaneous}</Td>
                  <Td>{worker.smallPower}</Td>
                  <Td>{worker.machine}</Td>
                  <Td>{worker.lunch}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </>
      )}
    </Box>
  );
}

export default LivePreviewTable;
