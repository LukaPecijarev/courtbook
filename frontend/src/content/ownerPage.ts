export const addYourCourt = {
  cta: 'Add your court',
  tagline: 'Add your court',
  title: 'List your court',
  intro: 'Publish the hours you want to rent out. No account needed.',
  listingTitle: 'Your court',
  datesTitle: 'Select dates',
  hoursTitle: 'Select start times',
  summaryLabel: 'Your listing',
  slotCount: (count: number) => (count === 1 ? '1 slot to publish' : `${count} slots to publish`),
  pickSlots: 'Pick dates and start times',
  submit: 'Publish court',
  submitting: 'Publishing…',
  error: 'Could not publish the court. Please try again.',
  unknownSport: 'This sport does not exist.',
}

export const listingForm = {
  name: 'Court name',
  description: 'Description',
  pricePerHour: 'Price per hour (MKD)',
  imageUrl: 'Image URL (optional)',
  imageUrlHint: 'https://…',
  nameRequired: 'Enter a name.',
  descriptionRequired: 'Enter a description.',
  priceInvalid: 'Enter a whole number above 0.',
  imageUrlInvalid: 'Use an address that starts with https://',
  datesRequired: 'Pick at least one date.',
  hoursRequired: 'Pick at least one start time.',
}

export const managementKeyNotice = {
  title: 'Your court is live',
  keyLabel: 'Management key',
  copy: 'Copy',
  copied: 'Copied',
  warning: 'Save this key now. It is shown only once and cannot be recovered. You need it to edit the court or its slots.',
  viewVenue: 'View court',
  manageVenue: 'Manage court',
}

export const manageVenue = {
  tagline: 'Manage your court',
  keyTitle: 'Enter your management key',
  keyLabel: 'Management key',
  keySubmit: 'Open',
  listingTitle: 'Court details',
  save: 'Save changes',
  saving: 'Saving…',
  saved: 'Changes saved.',
  addSlotsTitle: 'Add slots',
  publish: 'Publish slots',
  publishing: 'Publishing…',
  published: (count: number) => (count === 1 ? '1 slot published.' : `${count} slots published.`),
  slotsTitle: 'Upcoming slots',
  slotsEmpty: 'No upcoming slots.',
  slotsError: 'Could not load the slots. Please try again.',
  booked: 'Booked',
  remove: 'Remove',
  viewVenue: 'View court',
  notFound: 'We could not find this venue.',
}

export const manageKeyDialog = {
  open: 'Manage',
  title: 'Manage this court',
  intro: 'Enter the management key you got when you added the court.',
  keyLabel: 'Management key',
  keyRequired: 'Enter the management key.',
  mismatch: 'Key does not match this court.',
  error: 'Could not check the key. Please try again.',
  cancel: 'Cancel',
  submit: 'Continue',
  checking: 'Checking…',
}

export const deleteCourt = {
  open: 'Delete court',
  title: 'Delete this court?',
  intro: 'This removes the court, all its slots and all its bookings. It cannot be undone.',
  confirmLabel: 'Court name',
  confirmHintBefore: 'Type',
  confirmHintAfter: 'to confirm.',
  cancel: 'Cancel',
  submit: 'Delete court',
  deleting: 'Deleting…',
  error: 'Could not delete the court. Please try again.',
  deleted: 'Court deleted',
}
