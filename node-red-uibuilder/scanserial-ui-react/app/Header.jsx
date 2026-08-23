import { Heading, HStack } from '@chakra-ui/react';
import HeaderSelect from './HeaderSelect';

export default function Header({ users, usersCollection, user, setUser, station, stationsCollection, setStation, setIsDisabled }) {
  return (
    <HStack align="flex-start" paddingBottom="10px">
      <Heading size="2xl" whiteSpace="nowrap">ScanSerial UI</Heading>
      <HeaderSelect
        valueCollection={usersCollection}
        value={user}
        setValue={setUser}
        placeholder="Select user"
        disabled={users.length == 0}
      />
      <HeaderSelect
        valueCollection={stationsCollection}
        value={station}
        setValue={setStation}
        placeholder="Select station"
        afterSetValue={() => setIsDisabled(false)}
        disabled={!user}
      />
    </HStack>
  );
}