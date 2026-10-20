-- Venues added through "Add your court" have no street address; Hibernate's ddl-auto=update never relaxes NOT NULL.
ALTER TABLE venues ALTER COLUMN address DROP NOT NULL;
