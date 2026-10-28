<script lang="ts">
	import { fromAction } from 'svelte/attachments';
	import Save from '@lucide/svelte/icons/save';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import PageHeader from '@nahu/admin-kit/components/PageHeader.svelte';
	import ConfirmAction from '@nahu/admin-kit/components/ConfirmAction.svelte';
	import Statuses from '@nahu/admin-kit/components/Table/statuses.svelte';
	import InputComp from '@nahu/admin-kit/formComponents/InputComp.svelte';
	import LoadingBtn from '@nahu/admin-kit/formComponents/LoadingBtn.svelte';
	import Errors from '@nahu/admin-kit/formComponents/Errors.svelte';
	import { createForm } from '@nahu/admin-kit/forms/createForm';
	import * as Card from '@nahu/admin-kit/components/ui/card/index.js';
	import { Button } from '@nahu/admin-kit/components/ui/button/index.js';
	import { ethiopianDateTime } from '@nahu/admin-kit/tableCells';
	import { resolve } from '$app/paths';
	import RichTranslated from '$lib/dashboard/RichTranslated.svelte';
	import { newsSchema } from '../schema';

	let { data } = $props();

	const post = $derived(data.post);

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, delayed, allErrors } = createForm(data.form, newsSchema, {
		resetForm: false
	});
</script>

<form
	method="POST"
	action="?/save"
	enctype="multipart/form-data"
	{@attach fromAction(enhance)}
	class="flex max-w-5xl flex-col gap-4"
>
	<a href={resolve('/dashboard/news')} class="text-sm text-muted-foreground hover:text-foreground"
		>← All posts</a
	>

	<PageHeader
		title={post?.titleEn ?? 'New post'}
		tabTitle="{post ? post.titleEn : 'New post'} | EthioLink"
		description={post?.publishedAt
			? `Published ${ethiopianDateTime(post.publishedAt)}`
			: 'Not published yet: only staff can see it.'}
	>
		{#snippet badges()}
			{#if post}
				<Statuses
					status={post.published ? 'published' : 'pending'}
					label={post.published ? 'Published' : 'Draft'}
				/>
			{/if}
		{/snippet}
		{#snippet actions()}
			{#if post?.published}
				<Button
					href={resolve('/(site)/news/[slug]', { slug: post.slug })}
					target="_blank"
					variant="outline"
					size="sm"><ExternalLink /> View on the site</Button
				>
			{/if}
			{#if post}
				<ConfirmAction
					action="?/delete"
					label="Delete"
					title="Delete this post?"
					description="It is removed from the site and from here, for good. To take it down for now, untick “Published” instead."
					icon={Trash2}
					variant="destructive"
				/>
			{/if}
		{/snippet}
	</PageHeader>

	<Errors allErrors={$allErrors} />

	<Card.Root>
		<Card.Content class="pt-6">
			<RichTranslated
				{form}
				{errors}
				lines={[
					{ name: 'title', label: 'Title' },
					{
						name: 'excerpt',
						label: 'Summary',
						optional: true,
						description:
							'One or two sentences for the News list and search results. Taken from the article if left empty.'
					}
				]}
				rich={{ name: 'body', label: 'Article', placeholder: 'Write the post…' }}
			/>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header><Card.Title>Publishing</Card.Title></Card.Header>
		<Card.Content class="grid gap-x-6 md:grid-cols-2">
			<InputComp
				{form}
				{errors}
				name="cover"
				type="file"
				accept="image/*"
				label="Cover picture"
				image={post?.cover ?? ''}
				description="Shown at the top of the post and in the list. A wide image (16:9) works best."
			/>
			<div>
				<InputComp
					{form}
					{errors}
					name="slug"
					label="Link"
					description="The end of the post's address, /news/…. Made from the English title if left empty; changing it later breaks links already shared."
				/>
				<InputComp
					{form}
					{errors}
					name="published"
					type="checkboxSingle"
					placeholder="Published"
					description="Shown on the News page, in every language, as soon as you save."
				/>
			</div>
		</Card.Content>
	</Card.Root>

	<Button type="submit" class="self-end" disabled={$delayed}>
		{#if $delayed}<LoadingBtn name="Saving" />{:else}<Save /> Save{/if}
	</Button>
</form>
