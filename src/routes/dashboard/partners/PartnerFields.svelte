<script lang="ts">
	import InputComp from '@nahu/admin-kit/formComponents/InputComp.svelte';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- as `InputComp` takes them
	type Store = any;
	let {
		form,
		errors,
		logo = '',
		idPrefix
	}: { form: Store; errors: Store; logo?: string; idPrefix: string } = $props();
</script>

<InputComp {form} {errors} name="id" type="hidden" id="{idPrefix}id" />
<InputComp
	{form}
	{errors}
	name="name"
	id="{idPrefix}name"
	label="Name"
	description="Read by screen readers and shown when the logo is hovered."
	required
/>
<InputComp
	{form}
	{errors}
	name="logo"
	id="{idPrefix}logo"
	type="file"
	accept="image/*"
	label="Logo"
	image={logo}
	removable={false}
	compress={false}
	description="A PNG with a transparent background looks best; it is shown in one colour until hovered."
	required={!logo}
/>
<InputComp
	{form}
	{errors}
	name="url"
	id="{idPrefix}url"
	type="url"
	label="Website (optional)"
	placeholder="https://"
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
