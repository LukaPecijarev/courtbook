import { useState } from 'react'
import { managementKeyNotice } from '../../content/ownerPage'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { SectionTitle } from '../ui/SectionTitle'

interface ManagementKeyNoticeProps {
  managementKey: string
  venuePath: string
  managePath: string
}

export function ManagementKeyNotice({ managementKey, venuePath, managePath }: ManagementKeyNoticeProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(managementKey)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Card className="owner-key" role="status" data-cursor-accent data-rise>
      <SectionTitle as="h1" size="md">
        {managementKeyNotice.title}
      </SectionTitle>
      <div className="owner-key__box">
        <p className="owner-key__label" id="management-key-label">
          {managementKeyNotice.keyLabel}
        </p>
        <code className="owner-key__value" aria-labelledby="management-key-label">
          {managementKey}
        </code>
        <Button label={copied ? managementKeyNotice.copied : managementKeyNotice.copy} quiet onClick={copy} />
      </div>
      <p className="owner-key__warning" role="alert">
        {managementKeyNotice.warning}
      </p>
      <div className="owner-key__links">
        <Button to={venuePath} label={managementKeyNotice.viewVenue} withArrow />
        <Button to={managePath} label={managementKeyNotice.manageVenue} withArrow quiet />
      </div>
    </Card>
  )
}
