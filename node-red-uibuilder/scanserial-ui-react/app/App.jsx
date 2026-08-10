import { useEffect, useState } from "react";
import { Button, Field, Heading, HStack, Input, Spinner, Table, Text, VStack } from '@chakra-ui/react';

export default function App() {
  const [serial, setSerial] = useState("");
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [latestScans, setLatestScans] = useState([]);

  useEffect(() => {
    uibuilder.onChange("msg", msg => {
      setError(msg.payload.errormsg);
      setLastUpdated(msg.payload.lastUpdated);
      setLatestScans(msg.payload.latestScans ?? []);
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

  function sendScan() {
    uibuilder.send({
      payload: {
        serial,
        userId: 1,
        stationId: 1
      }
    });
  }

  return (
    <>
      <Heading size="2xl" paddingBottom="10px" textAlign="center">ScanSerial UI</Heading>

      <HStack align="flex-start">
        <Field.Root invalid={!!error}>
          <Input
            placeholder="Enter serial code"
            value={serial}
            onChange={e => setSerial(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendScan()}
          />
          <Field.ErrorText>{error}</Field.ErrorText>
        </Field.Root>
        <Button onClick={sendScan} variant="surface">
          Scan
        </Button>
      </HStack>

      <Table.ScrollArea>
        <Table.Root striped whiteSpace="normal">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>LogID</Table.ColumnHeader>
              <Table.ColumnHeader>SerialID</Table.ColumnHeader>
              <Table.ColumnHeader>ScanTime</Table.ColumnHeader>
              <Table.ColumnHeader>Result</Table.ColumnHeader>
              <Table.ColumnHeader>UserID</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {latestScans.map(scan => (
              <Table.Row key={scan.LogID}>
                <Table.Cell>{scan.LogID}</Table.Cell>
                <Table.Cell>{scan.SerialID}</Table.Cell>
                <Table.Cell>{new Date(scan.ScanTime).toLocaleString()}</Table.Cell>
                <Table.Cell>{scan.Result}</Table.Cell>
                <Table.Cell>{scan.UserID}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>

      {lastUpdated === null && <VStack paddingTop="10px"><Spinner /><Text>Loading...</Text></VStack>}
      {lastUpdated != null && <Text>Last updated: {new Date(lastUpdated).toString()}</Text>}
    </>
  );
}