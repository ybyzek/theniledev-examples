import { Button, Stack } from '@mui/joy';
import React from 'react';
import { ChromePicker } from 'react-color';

import { useTheme, useUpdateColor } from '../../../global-context/theme';

export default function Colorizor() {
  const theme = useTheme();
  const updateColor = useUpdateColor();
  const [isOpen, setIsOpen] = React.useState(false);
  const [color, setColor] = React.useState('');
  React.useEffect(() => {
    if (color) {
      updateColor({ primary: color });
    }
  }, [color, updateColor]);
  if (isOpen) {
    return (
      <Stack sx={{ alignItems: 'center' }}>
        <ChromePicker
          color={theme.primary}
          onChange={(color) => setColor(color.hex)}
        />

        <Button variant="plain" size="sm" onClick={() => setIsOpen(false)}>
          Close
        </Button>
      </Stack>
    );
  }
  return (
    <Button variant="plain" size="sm" onClick={() => setIsOpen(true)}>
      But I don&apos;t like the color...
    </Button>
  );
}
