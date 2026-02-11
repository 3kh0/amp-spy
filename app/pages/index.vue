<script setup lang="ts">
const { data } = await useFetch<LineData<Time>[]>("/api/balance");
</script>

<template>
  <div class="x">
    <header>
      <h1>HQ Amp account balance</h1>
    </header>
    <main>
      <Chart ref="chartRef" :data="data || []" />
    </main>
    <div style="text-align: center; font-size: 0.875rem; color: white; margin-top: 1rem; border: 1px solid #f34e3f; padding: 0.5rem; border-radius: 0.25rem; color: #f34e3f;">
      Update: HQ has largely shifted over to Claude Code, so we can no longer reliably track the balance. This page will be left up for archival purposes, but it will not be updated anymore.
    </div>
  </div>
</template>

<style scoped>
.x {
  max-width: 1200px;
  margin: 0 auto;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;
}

header {
  display: flex;
  justify-content: center;
  align-items: center;
}

h1 {
  color: #f6fff5;
  margin: 0;
  font-stretch: 115%;
  letter-spacing: -.025em;
  font-weight: 600;
  font-size: 2rem;
  text-align: center;
  line-height: 2.25rem;
  padding: 1rem;
}

main {
  padding: 0.25rem;
}
</style>
