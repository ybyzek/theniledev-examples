import { Box, Button, Stack, Typography } from "@mui/joy";
import { useNile } from "@theniledev/react";
import Link from 'next/link';

export default function Unauthorized() {
  const nile = useNile();
  // @ts-expect-error - hacky way, but don't want to make a circular dep
  const basePath = nile.developers.configuration.configuration.basePath;
  return (
    <Stack>
      <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        boxShadow: 24,
        p: 4,
      }}
    >
      <Stack spacing={4}>
        <Typography level="h2">401</Typography>
        <Typography level="h4">
          You don&apos;t have access to this page.
        </Typography>
        <Link href={`/`}>
          <Button>Log out</Button>
        </Link>
      </Stack>
    </Box>
    </Stack>
  );
}