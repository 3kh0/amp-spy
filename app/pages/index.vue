<template>
  <div class="x">
    <header>
      <h1>HQ Amp account balance</h1>
    </header>
    <main>
      <Chart ref="chartRef" />
    </main>
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
