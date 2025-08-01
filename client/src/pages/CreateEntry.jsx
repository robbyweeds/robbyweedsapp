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
import LivePreviewTable from "../components/LivePreviewTable";
import HeaderBar from "../components/HeaderBar";

const timeOptions = Array.from({ length: 96 }, (_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  const suffix = hour < 12 ? "AM" : "PM";
  const h12 = ((hour + 11) % 12) + 1;
  return {
    value: `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`,
    label: `${h12}:${minute.toString().padStart(2, "0")} ${suffix}`,
  };
});

// Helper to format date string "YYYY-MM-DD" to "Day MM/DD/YYYY"
function formatDateWithDay(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const options = { weekday: "short", month: "2-digit", day: "2-digit", year: "numeric" };
  return d.toLocaleDateString(undefined, options);
}

// Helper to format time "HH:mm" to "h:mm AM/PM"
function formatTimeHM(timeStr) {
  if (!timeStr) return "";
  const [hourStr, minStr] = timeStr.split(":");
  if (hourStr === undefined || minStr === undefined) return timeStr;
  let hour = parseInt(hourStr, 10);
  const minute = minStr;
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}

function CreateEntry() {
  const [foremen, setForemen] = useState([]);
  const [entry, setEntry] = useState({
    date: "",
    timeIn: "",
    timeOut: "",
    comment: "",
    foremanId: "", // ID of foreman selected
    property: "",
    workers: Array(7).fill({
      id: "",
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

  useEffect(() => {
    fetch("http://localhost:5000/api/foremen")
      .then((res) => res.json())
      .then((data) => setForemen(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!entry.foremanId) return;
    const selectedForeman = foremen.find(
      (f) => f.id.toString() === entry.foremanId.toString()
    );
    setEntry((prev) => {
      const newWorkers = [...prev.workers];
      if (selectedForeman) {
        newWorkers[0] = {
          ...newWorkers[0],
          id: selectedForeman.id,
          name: selectedForeman.username,
        };
      } else {
        newWorkers[0] = {
          ...newWorkers[0],
          id: "",
          name: "",
        };
      }
      return { ...prev, workers: newWorkers };
    });
  }, [entry.foremanId, foremen]);

  const totalWorkHours = () => {
    if (!entry.timeIn || !entry.timeOut) return "0.00";
    const [h1, m1] = entry.timeIn.split(":").map(Number);
    const [h2, m2] = entry.timeOut.split(":").map(Number);
    const start = h1 * 60 + m1;
    const end = h2 * 60 + m2;
    if (end < start) return "0.00";
    return ((end - start) / 60).toFixed(2);
  };

  const updateWorker = (idx, fieldOrObject, value) => {
    const newWorkers = [...entry.workers];
    if (typeof fieldOrObject === "string") {
      newWorkers[idx] = { ...newWorkers[idx], [fieldOrObject]: value };
    } else {
      newWorkers[idx] = { ...newWorkers[idx], ...fieldOrObject };
    }
    setEntry({ ...entry, workers: newWorkers });
  };

  const handleSubmit = async () => {
    const totalHours = totalWorkHours();

    const employeeTimes = {};
    const hoursData = {};

    entry.workers.forEach((w) => {
      if (w.id) {
        employeeTimes[w.id] = { timeIn: w.start, timeOut: w.end };
        hoursData[w.id] = {
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
          date: entry.date,
          timeIn: entry.timeIn,
          timeOut: entry.timeOut,
          totalHours,
          comment: entry.comment,
          foremanId: entry.foremanId,
          propertyName: entry.property,
          employeeTimes,
          hoursData,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast({
        title: "Entry saved",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/main");
    } catch (err) {
      toast({
        title: "Error saving entry",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4} maxW="1000px" mx="auto">
      <HeaderBar title="Create Entry" />
      <Box
        bg="gray.50"
        p={6}
        borderWidth={1}
        borderRadius="md"
        boxShadow="md"
        overflowX="auto"
      >
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
                value={entry.foremanId.toString()}
                onChange={(e) =>
                  setEntry({ ...entry, foremanId: e.target.value })
                }
              >
                {foremen.map((f) => (
                  <option key={f.id} value={f.id.toString()}>
                    {f.username}
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
                    <Input
                      isReadOnly
                      value={
                        foremen.find((f) => f.id.toString() === entry.foremanId)
                          ?.username || ""
                      }
                      placeholder="Foreman"
                    />
                  ) : (
                    <Select
                      placeholder="Select Worker"
                      value={worker.id ? worker.id.toString() : ""}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const selectedUser = foremen.find(
                          (f) => f.id.toString() === selectedId
                        );
                        updateWorker(idx, {
                          id: selectedUser ? selectedUser.id : "",
                          name: selectedUser ? selectedUser.username : "",
                        });
                      }}
                    >
                      <option value="">Select Worker</option>
                      {foremen.map((f) => (
                        <option key={f.id} value={f.id.toString()}>
                          {f.username}
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
                {["miscellaneous", "smallPower", "machine", "lunch"].map(
                  (cat) => (
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
                  )
                )}
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
          Save & Return to Dashboard
        </Button>

        <LivePreviewTable entry={entry} totalWorkHours={totalWorkHours} />
      </Box>
    </Box>
  );
}

export default CreateEntry;
