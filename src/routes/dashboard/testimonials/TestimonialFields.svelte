<script lang="ts">
	import InputComp from '@nahu/admin-kit/formComponents/InputComp.svelte';
	import TranslatedFields from '$lib/dashboard/TranslatedFields.svelte';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- as `InputComp` takes them
	type Store = any;
	let {
		form,
		errors,
		values,
		idPrefix
	}: { form: Store; errors: Store; values: Record<string, unknown>; idPrefix: string } = $props();
</script>

<InputComp {form} {errors} name="id" type="hidden" id="{idPrefix}id" />
<InputComp
	{form}
	{errors}
	name="author"
	id="{idPrefix}author"
	label="Who said it"
	placeholder="Meron Tadesse"
	required
/>
<TranslatedFields
	{form}
	{errors}
	{values}
	{idPrefix}
	fields={[
		{ name: 'quote', label: 'Quote', type: 'textarea', rows: 5 },
		{
			name: 'position',
			label: 'Role and company',
			optional: true,
			description: 'As it should be printed: “Import Manager, Abyssinia Foods”.'
		}
	]}
/>
<InputComp
	{form}
	{errors}
	name="sortOrder"
	id="{idPrefix}sortOrder"
	type="number"
	min="0"
	label="Position"
	description="Lower numbers come first."
/>
<InputComp
	{form}
	{errors}
	name="active"
	id="{idPrefix}active"
	type="checkboxSingle"
	placeholder="Show on the website"
/>
