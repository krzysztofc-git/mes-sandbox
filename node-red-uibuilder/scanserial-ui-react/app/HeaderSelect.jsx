import { Select, Portal } from "@chakra-ui/react";

export default function HeaderSelect({ valueCollection, value, setValue, placeholder = "", afterSetValue = () => {}, disabled = false}) {
  return (
    <Select.Root
      collection={valueCollection}
      variant="outline"
      value={value}
      onValueChange={(details) => {
        setValue(details.value);
        afterSetValue();
      }}
      disabled={disabled}
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder={placeholder}></Select.ValueText>
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content>
            {valueCollection.items.map((item) => (
              <Select.Item item={item} key={item.value}>
                {item.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
}