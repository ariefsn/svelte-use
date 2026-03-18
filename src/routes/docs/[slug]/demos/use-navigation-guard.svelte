<script lang="ts">
	// useNavigationGuard requires SvelteKit's $app/navigation
	// This demo shows the concept but cannot be interactive without page navigation
</script>
<div class="demo-wrap">
	<p class="hint">
		<code>useNavigationGuard</code> blocks SvelteKit navigation when there are unsaved changes.
		It provides <code>confirm()</code> and <code>cancel()</code> to handle the blocked navigation.
	</p>
	<div style="background:#111;padding:1rem;border-radius:8px;font-family:monospace;font-size:0.85rem;color:#888;line-height:1.8">
		<div style="color:#a78bfa">const {'{'} confirm, cancel {'}'} = useNavigationGuard({'{'}</div>
		<div style="padding-left:1rem">shouldBlock: () =&gt; hasUnsavedChanges,</div>
		<div style="padding-left:1rem">onBlock: () =&gt; showDialog = true</div>
		<div style="color:#a78bfa">{'}'});</div>
	</div>
	<p class="hint">This utility works in SvelteKit page components with navigation events.</p>
</div>
