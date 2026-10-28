<script lang="ts">
	import InputComp from '@nahu/admin-kit/formComponents/InputComp.svelte';
	import TranslatedFields from '$lib/dashboard/TranslatedFields.svelte';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- as `InputComp` takes them
	type Store = any;
	let {
		form,
		errors,
		values,
		photo = '',
		idPrefix
	}: {
		form: Store;
		errors: Store;
		values: Record<string, unknown>;
		/** The stored photo, shown while editing. */
		photo?: string;
		idPrefix: string;
	} = $props();
</script>

<InputComp {form} {errors} name="id" type="hidden" id="{idPrefix}id" />
<InputComp
	{form}
	{errors}
	name="photo"
	id="{idPrefix}photo"
	type="file"
	accept="image/*"
	label="Photo"
	image={photo}
	description="A square portrait works best. Without one, the site shows their initials."
/>
<TranslatedFields
	{form}
	{errors}
	{values}
	{idPrefix}
	fields={[
		{ name: 'name', label: 'Name' },
		{ name: 'role', label: 'Role' },
		{
			name: 'summary',
			label: 'Short summary',
			type: 'textarea',
			rows: 3,
			description: 'Two or three sentences for the card on the home page.'
		},
		{
			name: 'bio',
			label: 'Full profile',
			type: 'textarea',
			rows: 10,
			description: 'Shown on the About page. Leave a blank line between paragraphs.'
		}
	]}
/>
<div class="grid gap-x-4 sm:grid-cols-2">
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
		name="slug"
		id="{idPrefix}slug"
		label="Profile link"
		description="The end of /about#…; made from the name if left empty."
	/>
</div>
<InputComp
	{form}
	{errors}
	name="active"
	id="{idPrefix}active"
	type="checkboxSingle"
	placeholder="Show on the website"
/>
