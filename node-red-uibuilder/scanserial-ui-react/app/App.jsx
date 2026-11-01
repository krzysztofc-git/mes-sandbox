import { useEffect, useState, useRef } from "react";
import { Button, createListCollection, Field, HStack, Input, Spinner, Table, Text, VStack } from '@chakra-ui/react';
import { toaster } from '@/components/ui/toaster';
import Header from "./Header";

export default function App() {
  const [serial, setSerial] = useState("");
  const serialInputRef = useRef(null);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [latestScans, setLatestScans] = useState([]);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState();
  const [stations, setStations] = useState([]);
  const [station, setStation] = useState();
  const [isDisabled, setIsDisabled] = useState(true);

  const usersCollection = createListCollection({
    items: users.map(user => ({
      label: user.Username,
      value: String(user.UserID)
    }))
  });

  const stationsCollection = createListCollection({
    items: stations.map(station => ({
      label: station.StationName,
      value: String(station.StationID)
    }))
  });

  useEffect(() => {
    uibuilder.onChange("msg", msg => {
      setError(msg.payload.errormsg);
      setLastUpdated(msg.payload.lastUpdated);
      setLatestScans(msg.payload.latestScans ?? []);
      setUsers(msg.payload.users ?? []);
      setStations(msg.payload.stations ?? []);

      if (msg.payload.result) {
        toaster.create({
          title: msg.payload.result.message,
          description: msg.payload.result.productName,
          type: msg.payload.result.type
        });
      }
    });

    uibuilder.onChange("ctrlMsg", msg => {
      if (msg.uibuilderCtrl === "client connect") {
        uibuilder.send({
          payload: {
            refresh: true
          }
        });
      }
    });
  }, []);

  useEffect(() => {
    if (!isDisabled) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          serialInputRef.current?.focus();
        }, 0);
      });
    }
  }, [isDisabled, user, station, lastUpdated]);

  function sendScan() {
    setLatestScans(prev => [
      {
        LogID: '',
        SerialID: '',
        ScanTime: Date.now(),
        Result: '',
        UserID: Number(user),
        pending: true
      },
      ...prev
    ]);

    uibuilder.send({
      payload: {
        serial,
        userId: Number(user),
        stationId: Number(station)
      }
    });
  }

  return (
    <>
      <Header
        users={users}
        usersCollection={usersCollection}
        user={user}
        setUser={setUser}
        station={station}
        stationsCollection={stationsCollection}
        setStation={setStation}
        setIsDisabled={setIsDisabled}
      />

      <HStack align="flex-start">
        <Field.Root invalid={!!error}>
          <Input
            placeholder="Enter serial code"
            value={serial}
            onChange={e => setSerial(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendScan()}
            ref={serialInputRef}
            disabled={isDisabled}
          />
          <Field.ErrorText>{error}</Field.ErrorText>
        </Field.Root>
        <Button
          onClick={sendScan}
          variant="surface"
          disabled={isDisabled}
        >
          Scan
        </Button>
      </HStack>

      <Table.ScrollArea>
        <Table.Root striped whiteSpace="normal">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>LogID</Table.ColumnHeader>
              <Table.ColumnHeader>SerialCode</Table.ColumnHeader>
              <Table.ColumnHeader>ScanTime</Table.ColumnHeader>
              <Table.ColumnHeader>Result</Table.ColumnHeader>
              <Table.ColumnHeader>Username</Table.ColumnHeader>
              <Table.ColumnHeader>CurrentStation</Table.ColumnHeader>
              <Table.ColumnHeader>PreviousStation</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {latestScans.map(scan => (
              scan.LogID != "" ?
              <Table.Row key={scan.LogID}>
                <Table.Cell>{scan.LogID}</Table.Cell>
                <Table.Cell>{scan.SerialCode}</Table.Cell>
                <Table.Cell>{new Date(scan.ScanTime).toLocaleString()}</Table.Cell>
                <Table.Cell>{scan.Result}</Table.Cell>
                <Table.Cell>{scan.Username}</Table.Cell>
                <Table.Cell>{scan.CurrentStation}</Table.Cell>
                <Table.Cell>{scan.PreviousStation}</Table.Cell>
              </Table.Row>
              :
              <Table.Row key="pending" animation="slide-from-top 1s">
                <Table.Cell></Table.Cell>
                <Table.Cell><Spinner size="xs" /></Table.Cell>
                <Table.Cell>Loading...</Table.Cell>
                <Table.Cell></Table.Cell>
                <Table.Cell></Table.Cell>
                <Table.Cell></Table.Cell>
                <Table.Cell></Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>

      {lastUpdated === null && <VStack paddingTop="10px" animation="slide-from-top 1s"><Spinner size="lg" /><Text>Loading...</Text></VStack>}
      {lastUpdated != null && <Text>Last updated: {new Date(lastUpdated).toString()}</Text>}
    </>
  );
}