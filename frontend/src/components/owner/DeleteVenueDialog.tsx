import { useRef, useState, type FormEvent } from 'react'
import { ApiError } from '../../api/client'
import { deleteVenue } from '../../api/venues'
import { deleteCourt } from '../../content/ownerPage'
import { playPress } from '../../utils/ui'
import { Button } from '../ui/Button'
import { Dialog } from '../ui/Dialog'
import { Field } from '../ui/Field'
import { SectionTitle } from '../ui/SectionTitle'

type DeleteState = { status: 'confirming'; error?: string } | { status: 'deleting' } | { status: 'deleted' }

function normalizedName(name: string): string {
  return name.trim().toLocaleLowerCase()
}

interface DeleteVenueDialogProps {
  venueId: number
  venueName: string
  managementKey: string
  onDeleted: () => void
  onClose: () => void
}

export function DeleteVenueDialog({ venueId, venueName, managementKey, onDeleted, onClose }: DeleteVenueDialogProps) {
  const [confirmation, setConfirmation] = useState('')
  const [state, setState] = useState<DeleteState>({ status: 'confirming' })
  const inFlight = useRef(false)
  const confirmed = normalizedName(confirmation) === normalizedName(venueName)
  const busy = state.status !== 'confirming'

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!confirmed || inFlight.current) return
    const submitter = (event.nativeEvent as SubmitEvent).submitter
    if (submitter) playPress(submitter)

    inFlight.current = true
    setState({ status: 'deleting' })
    try {
      await deleteVenue(venueId, managementKey)
      setState({ status: 'deleted' })
    } catch (error) {
      inFlight.current = false
      setState({ status: 'confirming', error: error instanceof ApiError ? error.message : deleteCourt.error })
    }
  }

  return (
    <Dialog
      labelledBy="delete-court-title"
      onClose={onClose}
      dismissible={!busy}
      leaving={state.status === 'deleted'}
      onLeft={onDeleted}
    >
      <SectionTitle id="delete-court-title" size="sm">
        {deleteCourt.title}
      </SectionTitle>
      <p className="dialog__text">{deleteCourt.intro}</p>
      <form className="owner-fields" onSubmit={submit} noValidate>
        <Field
          id="delete-court-confirmation"
          label={deleteCourt.confirmLabel}
          hint={
            <>
              {deleteCourt.confirmHintBefore} <strong>{venueName}</strong> {deleteCourt.confirmHintAfter}
            </>
          }
          value={confirmation}
          onChange={setConfirmation}
          error={state.status === 'confirming' ? state.error : undefined}
          disabled={busy}
          autoComplete="off"
        />
        <div className="dialog__actions">
          <Button label={deleteCourt.cancel} quiet disabled={busy} onClick={onClose} />
          <Button
            type="submit"
            tone="danger"
            label={busy ? deleteCourt.deleting : deleteCourt.submit}
            busy={busy}
            disabled={!confirmed}
          />
        </div>
      </form>
    </Dialog>
  )
}
