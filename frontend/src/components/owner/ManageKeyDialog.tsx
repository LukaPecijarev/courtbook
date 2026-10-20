import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { verifyManagementKey } from '../../api/venues'
import { manageKeyDialog } from '../../content/ownerPage'
import { storeManagementKey } from '../../utils/managementKeys'
import { manageVenuePath } from '../../utils/paths'
import { playPress } from '../../utils/ui'
import { Button } from '../ui/Button'
import { Dialog } from '../ui/Dialog'
import { Field } from '../ui/Field'
import { SectionTitle } from '../ui/SectionTitle'

interface ManageKeyDialogProps {
  venueId: number
  venueName: string
  onClose: () => void
}

function errorMessage(error: unknown): string {
  return error instanceof ApiError && error.status === 401 ? manageKeyDialog.mismatch : manageKeyDialog.error
}

export function ManageKeyDialog({ venueId, venueName, onClose }: ManageKeyDialogProps) {
  const navigate = useNavigate()
  const [key, setKey] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string>()
  const titleId = `manage-key-title-${venueId}`

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const submitter = (event.nativeEvent as SubmitEvent).submitter
    if (submitter) playPress(submitter)
    const managementKey = key.trim()
    if (!managementKey) return setError(manageKeyDialog.keyRequired)

    setChecking(true)
    setError(undefined)
    try {
      await verifyManagementKey(venueId, managementKey)
      storeManagementKey(venueId, managementKey)
      navigate(manageVenuePath(venueId))
    } catch (verifyError) {
      setError(errorMessage(verifyError))
      setChecking(false)
    }
  }

  return (
    <Dialog labelledBy={titleId} onClose={onClose}>
      <SectionTitle id={titleId} size="sm">
        {manageKeyDialog.title}
      </SectionTitle>
      <p className="dialog__text">
        <strong>{venueName}</strong> · {manageKeyDialog.intro}
      </p>
      <form className="owner-fields" onSubmit={submit} noValidate>
        <Field
          id={`manage-key-${venueId}`}
          label={manageKeyDialog.keyLabel}
          value={key}
          onChange={setKey}
          error={error}
          type="password"
          autoComplete="off"
        />
        <div className="dialog__actions">
          <Button label={manageKeyDialog.cancel} quiet onClick={onClose} />
          <Button
            type="submit"
            label={checking ? manageKeyDialog.checking : manageKeyDialog.submit}
            withArrow
            disabled={checking}
          />
        </div>
      </form>
    </Dialog>
  )
}
