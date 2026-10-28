<script lang="ts">
	import type { SuperForm } from 'sveltekit-superforms';
	import InputComp from '@nahu/admin-kit/formComponents/InputComp.svelte';
	import * as Tabs from '@nahu/admin-kit/components/ui/tabs/index.js';
	import { LANGUAGES } from '$lib/translated';

	/**
	 * The same fields once per site language, one tab each. English is required; a tab with a dot
	 * still has an empty field, which the site fills with the English text. Field names follow
	 * `$lib/translated`: `title` becomes `titleEn`, `titleAm`, `titleZh`, `titleAr`.
	 */
	type Field = {
		name: string;
		label: string;
		type?: 'text' | 'textarea';
		rows?: number;
		description?: string;
		/** English may be left empty, as for an optional subtitle. */
		optional?: boolean;
	};

	type Form = SuperForm<Record<string, unknown>>;

	let {
		form,
		errors,
		values,
		fields,
		idPrefix = ''
	}: {
		/** The superforms stores; the fields are named at run time. */
		form: Form['form'];
		errors: Form['errors'];
		/** The form's current values, to mark the tabs that are missing text. */
		values: Record<string, unknown>;
		fields: Field[];
		/** Set when two of these share a page (an add and an edit dialog), so ids stay unique. */
		idPrefix?: string;
	} = $props();

	const missing = (suffix: string) =>
		suffix !== 'En' &&
		fields.some(
			(f) => String(values[`${f.name}En`] ?? '').trim() && !String(values[`${f.name}${suffix}`] ?? '').trim()
		);
	const invalid = (suffix: string) => fields.some((f) => $errors[`${f.name}${suffix}`]);
</script>

<Tabs.Root value="en" class="w-full">
	<Tabs.List class="w-full">
		{#each LANGUAGES as language (language.locale)}
			<Tabs.Trigger value={language.locale} class="gap-1.5">
				{language.name}
				{#if invalid(language.suffix)}
					<span class="size-1.5 rounded-full bg-destructive" title="Has an error"></span>
				{:else if missing(language.suffix)}
					<span class="size-1.5 rounded-full bg-warning" title="Not translated yet"></span>
				{/if}
			</Tabs.Trigger>
		{/each}
	</Tabs.List>
	{#each LANGUAGES as language (language.locale)}
		<Tabs.Content value={language.locale} class="pt-2" dir={language.locale === 'ar' ? 'rtl' : 'ltr'}>
			{#if language.locale !== 'en'}
				<p class="mb-2 text-xs text-muted-foreground">
					Leave a field empty to show the English text on the {language.name} site.
				</p>
			{/if}
			{#each fields as field (field.name)}
				<InputComp
					{form}
					{errors}
					name="{field.name}{language.suffix}"
					id="{idPrefix}{field.name}{language.suffix}"
					label="{field.label} ({language.name})"
					type={field.type ?? 'text'}
					rows={field.rows}
					description={field.description}
					required={language.locale === 'en' && !field.optional}
				/>
			{/each}
		</Tabs.Content>
	{/each}
</Tabs.Root>
