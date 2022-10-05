import {
  Avatar,
  Badge,
  Box,
  CircularProgress,
  Container,
  IconButton,
  Sheet,
  Stack,
} from '@mui/joy';
import React from 'react';

import { useFirstOrg } from '../EntityTable/hooks';
import RightSidebar from '../db/RightSidebar';

import LeftNavigation from './LeftNavigation';

export default function NavBar(
  props: React.PropsWithChildren & {
    hasRightSidebar?: boolean;
    allowCreation?: boolean;
    entity?: string;
  }
) {
  const { children, hasRightSidebar = false, allowCreation, entity } = props;
  const [isLoading, user] = useFirstOrg();

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  if (isLoading) {
    return <CircularProgress />;
  }
  const [name] = user?.email.split('@') ?? [];

  const shortName = name?.length > 1 ? `${name[0]}${name[1]}` : name[0];
  return (
    <Stack
      direction="row"
      sx={{
        width: '100%',
      }}
    >
      <LeftNavigation allowCreation={allowCreation} entity={entity} />
      <Sheet
        sx={{
          width: '100%',
        }}
      >
        <Container>
          <Box
            sx={{
              pl: 2,
              width: '100%',
              position: 'relative',
            }}
          >
            {children}
          </Box>
        </Container>
        {hasRightSidebar && (
          <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
            <IconButton
              sx={{ m: 2 }}
              variant="plain"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Badge>
                <Avatar size="lg">{shortName}</Avatar>
              </Badge>
            </IconButton>
          </Box>
        )}
      </Sheet>
      {hasRightSidebar && (
        <RightSidebar
          setIsSidebarOpen={setIsSidebarOpen}
          isSidebarOpen={isSidebarOpen}
        />
      )}
    </Stack>
  );
}
