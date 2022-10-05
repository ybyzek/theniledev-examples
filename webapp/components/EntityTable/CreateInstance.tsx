import React from 'react';
import { Alert, Button, Modal, ModalClose, Sheet, Stack } from '@mui/joy';
import { EntityForm, Attribute } from '@theniledev/react';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';

import { getFormFields } from '~/form-fields';

export function CreateInstance(props: {
  org: string;
  setReRender?: () => void;
  entity: string;
}) {
  const { org, setReRender, entity } = props;
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { fields } = getFormFields(entity) ?? {};
  return (
    <Stack>
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={open}
        onClose={() => setOpen(false)}
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <Sheet
          variant="outlined"
          sx={{
            maxWidth: '50rem',
            minWidth: '30rem',
            borderRadius: 'md',
            p: 3,
            boxShadow: 'lg',
          }}
        >
          <ModalClose
            variant="outlined"
            sx={{
              top: 'calc(-1/4 * var(--IconButton-size))',
              right: 'calc(-1/4 * var(--IconButton-size))',
              boxShadow: '0 2px 12px 0 rgba(0 0 0 / 0.2)',
              borderRadius: '50%',
              bgcolor: 'background.body',
            }}
          />
          {error && <Alert color="danger">{error}</Alert>}
          <EntityForm
            beforeMutate={(data) => {
              data.status = 'Submitted';
              data.connection = 'N/A';
              return data;
            }}
            fields={fields as Attribute[]}
            entityType={entity}
            onSuccess={() => {
              setOpen(false);
              setReRender && setReRender();
            }}
            org={org}
            onError={(e) => {
              if (e instanceof Error) {
                setError(`Failed to create ${entity}.`);
              }
            }}
          />
        </Sheet>
      </Modal>
      <Button
        sx={{ justifyContent: 'flex-start' }}
        startDecorator={<AddCircleOutlineOutlinedIcon />}
        onClick={() => setOpen(true)}
      >
        Create {entity}
      </Button>
    </Stack>
  );
}
