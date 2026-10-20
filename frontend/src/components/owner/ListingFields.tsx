import { listingForm } from '../../content/ownerPage'
import { Field } from '../ui/Field'
import { DESCRIPTION_MAX, IMAGE_URL_MAX, NAME_MAX, type ListingErrors, type ListingValues } from './listing'

interface ListingFieldsProps {
  values: ListingValues
  errors: ListingErrors
  onChange: (values: ListingValues) => void
}

export function ListingFields({ values, errors, onChange }: ListingFieldsProps) {
  const set = (field: keyof ListingValues) => (value: string) => onChange({ ...values, [field]: value })
  return (
    <div className="owner-fields">
      <Field id="listing-name" label={listingForm.name} value={values.name} onChange={set('name')}
        error={errors.name} maxLength={NAME_MAX} autoComplete="off" />
      <Field id="listing-description" label={listingForm.description} value={values.description}
        onChange={set('description')} error={errors.description} maxLength={DESCRIPTION_MAX} multiline />
      <Field id="listing-price" label={listingForm.pricePerHour} value={values.pricePerHour}
        onChange={set('pricePerHour')} error={errors.pricePerHour} inputMode="numeric" maxLength={8} />
      <Field id="listing-image" label={listingForm.imageUrl} value={values.imageUrl} onChange={set('imageUrl')}
        error={errors.imageUrl} type="url" inputMode="url" maxLength={IMAGE_URL_MAX}
        placeholder={listingForm.imageUrlHint} />
    </div>
  )
}
