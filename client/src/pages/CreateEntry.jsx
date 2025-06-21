import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Select,
  Text,
  Grid,
  GridItem,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import HeaderBar from "../components/HeaderBar";

const employees = [
  "John Doe",
  "Jane Smith",
  "Mike Johnson",
  "Emily Davis",
  "Chris Lee",
  "Sara White",
  "David Brown",
  "Anna Wilson",
  "Tom Clark",
  "Nancy Green",
];

const timeOptions = Array.from({ length: 96 }, (_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  const suffix = hour < 12 ? "AM" : "PM";
  const h12 = ((hour + 11) % 12) + 1;
  return {
    value: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
    label: `${h12}:${minute.toString().padStart(2, "0")} ${suffix}`,
  };
});

function CreateEntry() {
  const [entry, setEntry] = useState({
    date: "",
    timeIn: "",
    timeOut: "",
    comment: "",
    foreman: "",
    property: "",
    workers: Array(7).fill({
      name: "",
      start: "",
      end: "",
      miscellaneous: 0,
      smallPower: 0,
      machine: 0,
      lunch: 0,
    }),
  });

  const toast = useToast();
  const navigate = useNavigate();

  // When foreman changes, update first worker.name to foreman
  useEffect(() => {
    setEntry((prev) => {
      const newWorkers = [...prev.workers];
      newWorkers[0] = { ...newWorkers[0], name: prev.foreman };
      return { ...prev, workers: newWorkers };
    });
  }, [entry.foreman]);

  const totalWorkHours = () => {
    if (!entry.timeIn || !entry.timeOut) return "0.00";
    const [h1, m1] = entry.timeIn.split(":").map(Number);
    const [h2, m2] = entry.timeOut.split(":").map(Number);
    const start = h1 * 60 + m1;
    const end = h2 * 60 + m2;
    if (end < start) return "0.00";
    return ((end - start) / 60).toFixed(2);
  };

  const handleSubmit = async () => {
    const totalHours = totalWorkHours();

    // Prepare data to send with employeeTimes and hoursData keyed by employee name
    const employeeTimes = {};
    const hoursData = {};
    entry.workers.forEach((w) => {
      if (w.name) {
        employeeTimes[w.name] = { timeIn: w.start, timeOut: w.end };
        hoursData[w.name] = {
          miscellaneous: parseFloat(w.miscellaneous),
          smallPower: parseFloat(w.smallPower),
          machine: parseFloat(w.machine),
          lunch: parseFloat(w.lunch),
        };
      }
    });

    try {
      const res = await fetch("http://localhost:5000/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...entry,
          totalHours,
          foremanId: entry.foreman, // Adjust backend to accept username or map later
          employeeTimes,
          hoursData,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast({ title: "Entry saved", status: "success", duration: 3000, isClosable: true });
      navigate("/main");
    } catch (err) {
      toast({ title: "Error saving entry", status: "error", duration: 3000, isClosable: true });
    }
  };

  const updateWorker = (idx, field, value) => {
    const newWorkers = [...entry.workers];
    newWorkers[idx] = { ...newWorkers[idx], [field]: value };
    setEntry({ ...entry, workers: newWorkers });
  };

  return (
    <Box p={4} maxW="900px" mx="auto">
      <HeaderBar title="Create Entry" />
      <Box bg="gray.50" p={6} borderWidth={1} borderRadius="md" boxShadow="md" overflowX="auto">
        <Heading mb={6}>Create Timesheet Entry</Heading>
        <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={4}>
          <GridItem colSpan={1}>
            <FormControl>
              <FormLabel>Date</FormLabel>
              <Input
                type="date"
                value={entry.date}
                onChange={(e) => setEntry({ ...entry, date: e.target.value })}
              />
            </FormControl>
          </GridItem>
          <GridItem colSpan={1}>
            <FormControl>
              <FormLabel>Start Time</FormLabel>
              <Select
                value={entry.timeIn}
                onChange={(e) => setEntry({ ...entry, timeIn: e.target.value })}
                placeholder="Select time"
              >
                {timeOptions.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </FormControl>
          </GridItem>
          <GridItem colSpan={1}>
            <FormControl>
              <FormLabel>End Time</FormLabel>
              <Select
                value={entry.timeOut}
                onChange={(e) => setEntry({ ...entry, timeOut: e.target.value })}
                placeholder="Select time"
              >
                {timeOptions.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </FormControl>
          </GridItem>
          <GridItem colSpan={1} display="flex" alignItems="center">
            <Text fontWeight="bold" mt={6}>
              Total Hours: {totalWorkHours()}
            </Text>
          </GridItem>
        </Grid>

        <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={4}>
          <GridItem colSpan={2}>
            <FormControl>
              <FormLabel>Foreman</FormLabel>
              <Select
                placeholder="Select Foreman"
                value={entry.foreman}
                onChange={(e) => setEntry({ ...entry, foreman: e.target.value })}
              >
                {employees.map((emp) => (
                  <option key={emp} value={emp}>
                    {emp}
                  </option>
                ))}
              </Select>
            </FormControl>
          </GridItem>
          <GridItem colSpan={2}>
            <FormControl>
              <FormLabel>Property</FormLabel>
              <Input
                value={entry.property}
                onChange={(e) => setEntry({ ...entry, property: e.target.value })}
                placeholder="Property Name"
              />
            </FormControl>
          </GridItem>
        </Grid>

        <Divider mb={4} />

        <Table variant="simple" size="sm" minWidth="900px">
          <Thead>
            <Tr>
              <Th>Worker</Th>
              <Th>Start</Th>
              <Th>End</Th>
              <Th>Miscellaneous</Th>
              <Th>Small Power</Th>
              <Th>Machine</Th>
              <Th>Lunch</Th>
            </Tr>
          </Thead>
          <Tbody>
            {entry.workers.map((worker, idx) => (
              <Tr key={idx}>
                <Td>
                  {idx === 0 ? (
                    <Input isReadOnly value={entry.foreman} />
                  ) : (
                    <Select
                      placeholder="Select Worker"
                      value={worker.name}
                      onChange={(e) => updateWorker(idx, "name", e.target.value)}
                    >
                      {employees.map((emp) => (
                        <option key={emp} value={emp}>
                          {emp}
                        </option>
                      ))}
                    </Select>
                  )}
                </Td>
                <Td>
                  <Select
                    placeholder="Start"
                    value={worker.start}
                    onChange={(e) => updateWorker(idx, "start", e.target.value)}
                  >
                    {timeOptions.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                </Td>
                <Td>
                  <Select
                    placeholder="End"
                    value={worker.end}
                    onChange={(e) => updateWorker(idx, "end", e.target.value)}
                  >
                    {timeOptions.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                </Td>
                {["miscellaneous", "smallPower", "machine", "lunch"].map((cat) => (
                  <Td key={cat}>
                    <Select
                      value={worker[cat]}
                      onChange={(e) => updateWorker(idx, cat, e.target.value)}
                    >
                      {[...Array(17).keys()].map((n) => (
                        <option key={n} value={n * 0.25}>
                          {(n * 0.25).toFixed(2)}
                        </option>
                      ))}
                    </Select>
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>

        <FormControl mt={6}>
          <FormLabel>Comment</FormLabel>
          <Textarea
            value={entry.comment}
            onChange={(e) => setEntry({ ...entry, comment: e.target.value })}
            placeholder="Optional notes"
          />
        </FormControl>

        <Button mt={6} colorScheme="blue" onClick={handleSubmit}>
          Save Entry & Return to Dashboard
        </Button>
      </Box>
    </Box>
  );
}

export default CreateEntry;
