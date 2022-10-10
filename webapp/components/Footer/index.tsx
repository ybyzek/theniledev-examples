import { Typography, Box, Stack, Link } from '@mui/joy';

import Nile from '~/images/nile.svg';

export default function Footer() {
  return (
    <Stack
      component="footer"
      sx={{
        alignItems: 'center',
        p: 1,
        position: 'fixed',
        bottom: 6,
        zIndex: 4,
        background: 'var(--mui-palette-background-surface)',
        borderTopRightRadius: '3rem',
        borderBottomRightRadius: '3rem',
        border: '1px solid var(--mui-palette-Chip-defaultBorder)',
        borderLeft: 'none',
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', px: 2 }}>
        <Typography level="body2">Powered by</Typography>
        <Box sx={{ pl: 0.5 }}>
          <Link target="_blank" href="https://thenile.dev">
            <Nile
              width={60}
              style={{ fill: 'var(--mui-palette-text-primary)' }}
            />
          </Link>
        </Box>
      </Stack>
    </Stack>
  );
}
