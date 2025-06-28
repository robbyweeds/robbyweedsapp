import React, { useEffect, useState } from "react";
import {
  Box,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Button,
  Text,
  Flex,
  Heading,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import HeaderBar from "../components/HeaderBar";

// Helper to format date string "YYYY-MM-DD" to "Day MM/DD/YYYY"
function formatDateWithDay(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const options = { weekday: "short", month: "2-digit", day: "2-digit", year: "numeric" };
  return d.toLocaleDateString(undefined, options); // e.g. "Mon, 06/15/2025"
}

// Helper to format time "HH:mm" to "h:mm AM/PM"
function formatTimeHM(timeStr) {
  if (!timeStr) return "";
  const [hourStr, minStr] = timeStr.split(":");
  if (hourStr === undefined || minStr === undefined) return timeStr;
  let hour = parseInt(hourStr, 10);
  const minute = minStr;
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12; // convert 0 -> 12, 13 -> 1, etc
  return `${hour}:${minute} ${ampm}`;
}

function PastEntries() {
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState(null);

  const [foremen, setForemen] = useState([]);
  const [properties, setProperties] = useState([]);

  const [selectedForeman, setSelectedForeman] = useState("");
  const [selectedProperty, setSelectedProperty] = useState("");
  const [selectedWeek, setSelectedWeek] = useState(""); // e.g. '2025-06-15' (week start)

  const navigate = useNavigate();

  // Fetch Foremen and Properties once
  useEffect(() => {
    fetch("/api/foremen")
      .then((res) => res.json())
      .then(setForemen)
      .catch(console.error);

    fetch("/api/properties")
      .then((res) => res.json())
      .then(setProperties)
      .catch(console.error);
  }, []);

  // Fetch entries filtered by selections
  useEffect(() => {
    setEntries(null); // loading state
    setError(null);

    // Build query params
    const params = new URLSearchParams();
    if (selectedForeman) params.append("foremanId", selectedForeman);
    if (selectedProperty) params.append("propertyName", selectedProperty);
    if (selectedWeek) params.append("weekStart", selectedWeek);

    fetch("/api/entries?" + params.toString())
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        setEntries(data);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("Failed to load past entries.");
        setEntries([]);
      });
  }, [selectedForeman, selectedProperty, selectedWeek]);

  // Helper: generate week options (last 12 weeks)
  const generateWeekOptions = () => {
    const weeks = [];
    const now = new Date();
    // get last Sunday for current week start
    const getWeekStartDate = (date) => {
      const d = new Date(date);
      const day = d.getDay();
      d.setDate(d.getDate() - day);
      return d;
    };

    for (let i = 0; i < 12; i++) {
      const d = getWeekStartDate(now);
      d.setDate(d.getDate() - i * 7);
      weeks.push(d.toISOString().slice(0, 10)); // yyyy-mm-dd
    }
    return weeks;
  };

  return (
    <Box p={4}>
      <HeaderBar title="Past Timesheets" />

      <Heading size="md" mb={4}>
        Filter Entries
      </Heading>

      <Flex gap={4} mb={6} flexWrap="wrap">
        <Box minWidth="180px">
          <Text mb={1}>Foreman</Text>
          <Select
            placeholder="All Foremen"
            value={selectedForeman}
            onChange={(e) => setSelectedForeman(e.target.value)}
          >
            {foremen.map((f) => (
              <option key={f.id} value={f.id}>
                {f.username}
              </option>
            ))}
          </Select>
        </Box>

        <Box minWidth="180px">
          <Text mb={1}>Property</Text>
          <Select
            placeholder="All Properties"
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
          >
            {properties.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </Box>

        <Box minWidth="180px">
          <Text mb={1}>Week Starting</Text>
          <Select
            placeholder="All Weeks"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
          >
            {generateWeekOptions().map((week) => (
              <option key={week} value={week}>
                {week}
              </option>
            ))}
          </Select>
        </Box>
      </Flex>

      {entries === null ? (
        <Spinner size="xl" />
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : entries.length === 0 ? (
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
                <Th>Foreman</Th>
                <Th>Property</Th>
              </Tr>
            </Thead>
            <Tbody>
              {entries.map((entry) => (
                <Tr key={entry.id}>
                  <Td>{formatDateWithDay(entry.date)}</Td>
                  <Td>{formatTimeHM(entry.timeIn)}</Td>
                  <Td>{formatTimeHM(entry.timeOut)}</Td>
                  <Td>{entry.totalHours}</Td>
                  <Td>{entry.comment}</Td>
                  <Td>{foremen.find((f) => f.id === entry.foremanId)?.username || "N/A"}</Td>
                  <Td>{entry.propertyName || "N/A"}</Td>
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
