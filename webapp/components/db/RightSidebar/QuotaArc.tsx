import React from 'react';
import { Box, Stack, Typography } from '@mui/joy';
import { Queries, useNile } from '@theniledev/react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';

import SvgArc from '~/components/SvgArc';

const colors = [
  'rgb(251 165 65)',
  'rgb(72 187 132)',
  'rgb(251 53 63)',
  'rgb(57 144 251)',
];
const svgConfig = {
  svgHeight: 180,
  x: 150,
  y: 160,
  radius: 120,
  strokeWidth: 20,
};
/** make based on the sizes of the entity, to a quota */
export default function QuotaArc() {
  const nile = useNile();
  const router = useRouter();
  const org = String(router.query.org);
  const type = String(router.query.entity);
  const { isLoading, data: dbs } = useQuery(
    Queries.ListEntities,
    () => nile.entities.listInstances({ org, type }),
    { enabled: Boolean(router.query.org && router.query.entity) }
  );

  const total = React.useMemo(() => {
    return dbs?.reduce((total, instance) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const properties: any = instance.properties;
      const size = Number(properties?.size);
      if (!isNaN(size)) {
        total += size;
      }
      return total;
    }, 0);
  }, [dbs]);
  const sortedDbs = React.useMemo(() => {
    return dbs?.sort((i1, i2) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p1: any = i1.properties;
      const s1 = Number(p1?.size);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p2: any = i2.properties;
      const s2 = Number(p2?.size);

      return s2 - s1;
    });
  }, [dbs]);

  if (isLoading || !total || isNaN(total)) {
    return null;
  }

  const max = Math.max(400, Math.round(total / 100) * 100 + 100);
  let remaining = Math.round(total / 100) * 100;
  return (
    <Box
      sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}
    >
      <Box sx={{ position: 'absolute' }}>
        <SvgArc
          {...svgConfig}
          color="var(--mui-palette-neutral-300)"
          startAngle={270}
          endAngle={90}
        />
      </Box>
      {sortedDbs?.map((instance, index) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const properties: any = instance.properties;
        const size = Number(properties?.size);
        const endAngle = 180 * (remaining / max);
        remaining -= size;
        return (
          <Box key={instance.id} sx={{ position: 'absolute' }}>
            <SvgArc
              {...svgConfig}
              color={colors[index % 4]}
              startAngle={270}
              endAngle={endAngle - 90}
            />
          </Box>
        );
      })}
      <Stack sx={{ alignItems: 'center', px: 2, pt: 14 }}>
        <Typography level="h3">{total}</Typography>
        <Typography level="body3">of {max} capacity</Typography>
      </Stack>
    </Box>
  );
}
