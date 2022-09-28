import React from 'react';
import { useTheme } from '@mui/joy';

import RawLogo from '~/images/saas-logo.svg'; // https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping

export default function Logo({ width = 131 }: {width?: number}) {
  const theme = useTheme();
  const { colorSchemes } = theme;
  return (
    <RawLogo
      style={{ fill: "#FF9333" }}
      width={`${width}px`}
      height="100%"
    />
  );
}
