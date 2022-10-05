import React from 'react';

import RawLogo from '~/images/logo.svg'; // https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping

export default function Logo({
  width = 131,
  color = 'var(--mui-palette-primary-dark)',
}: {
  width?: number;
  color?: string;
}) {
  return <RawLogo style={{ fill: color }} width={`${width}px`} height="100%" />;
}
