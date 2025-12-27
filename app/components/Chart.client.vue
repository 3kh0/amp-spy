<script setup lang="ts">
// i deadass just stole this from the docs
import {
  createChart,
  ColorType,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type WhitespaceData,
  type Time,
  createTextWatermark,
} from "lightweight-charts";

const chartContainer = ref<HTMLElement | null>(null);
const legendEl = ref<HTMLElement | null>(null);
let chart: IChartApi | null = null;
let lineSeries: ISeriesApi<"Line"> | null = null;

const props = defineProps<{
  data: LineData<Time>[];
}>();

const HOUR_IN_SECONDS = 3600;

function fillTimeGaps(data: LineData<Time>[]): (LineData<Time> | WhitespaceData<Time>)[] {
  if (data.length < 2) return data;

  const result: (LineData<Time> | WhitespaceData<Time>)[] = [];
  const sorted = [...data].sort((a, b) => (a.time as number) - (b.time as number));
  
  const deduped: LineData<Time>[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const current = sorted[i];
    if (!deduped.some(d => d.time === current.time)) {
      deduped.unshift(current);
    }
  }

  for (let i = 0; i < deduped.length; i++) {
    const current = deduped[i];
    result.push(current);

    if (i < deduped.length - 1) {
      const next = deduped[i + 1];
      const currentTime = current.time as number;
      const nextTime = next.time as number;
      const gap = nextTime - currentTime;

      if (gap > HOUR_IN_SECONDS * 1.5) {
        let t = currentTime + HOUR_IN_SECONDS;
        while (t < nextTime - HOUR_IN_SECONDS / 2) {
          result.push({ time: t as Time });
          t += HOUR_IN_SECONDS;
        }
      }
    }
  }

  return result;
}

const data = computed(() => fillTimeGaps(props.data));

async function refresh() {
  const { data } = await useFetch<LineData<Time>[]>("/api/balance");
  data.value = data;
}

function fp(price: number): string {
  return "$" + Math.round(price).toString();
}

function ft(time: Time): string {
  const date = new Date((time as number) * 1000);
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${month} ${day}, ${hours}:${minutes}`;
}

function updateLegend(price: number | undefined, time?: Time) {
  if (!legendEl.value) return;
  const priceText = price !== undefined ? fp(price) : "";
  const timeText = time !== undefined ? ft(time) : "";
  legendEl.value.innerHTML = `
    <div class="legend-title">AMP-SPY / HACKCLUB</div>
    <div class="legend-row">
      <span class="legend-label">Balance:</span>
      <span class="legend-value">${priceText}</span>
    </div>
    <div class="legend-row">
      <span class="legend-label">Time:</span>
      <span class="legend-value">${timeText}</span>
    </div>
  `;
}

onMounted(async () => {
  await nextTick();

  updateLegend(undefined);

  if (!chartContainer.value) return;

  chart = createChart(chartContainer.value, {
    layout: {
      background: { type: ColorType.Solid, color: "#111311" },
      textColor: "#d1d4dc",
    },
    grid: {
      vertLines: { color: "#878b861f" },
      horzLines: { color: "#878b861f" },
    },
    width: chartContainer.value.clientWidth,
    height: 500,
    timeScale: {
      timeVisible: true,
      secondsVisible: false,
      fixLeftEdge: true,
      uniformDistribution: false,
    },
  });

  lineSeries = chart.addSeries(LineSeries, {
    color: "#f34e3f",
    lineWidth: 2,
    crossHairMarkerVisible: false,
  });

  lineSeries.priceScale().applyOptions({
    minValue: 0,
    scaleMargins: {
      top: 0.3,
      bottom: 0.01,
    },
  });

  chart.applyOptions({
    crosshair: {
      horzLine: {
        visible: true,
        labelVisible: true,
      },
      vertLine: {
        labelVisible: true,
      },
    },
    grid: {
      vertLines: {
        visible: true,
      },
      horzLines: {
        visible: true,
      },
    },
  });

  if (data.value) {
    lineSeries.setData(data.value);
    const lastData = props.data[props.data.length - 1];
    if (lastData) updateLegend(lastData.value, lastData.time);
  }

  const firstPane = chart.panes()[0];
  const textWatermark = createTextWatermark(firstPane, {
    horzAlign: "center",
    vertAlign: "center",
    lines: [
      {
        text: "AMP-SPY",
        color: "#1b1c1b",
        fontSize: 50,
      },
    ],
  });

  chart.timeScale().fitContent();

  chart.subscribeCrosshairMove((param) => {
    if (!lineSeries) return;
    let price: number | undefined;
    let time: Time | undefined;
    if (param.time) {
      const dataPoint = param.seriesData.get(lineSeries) as LineData<Time> | undefined;
      price = dataPoint?.value;
      time = param.time;
    } else if (props.data && props.data.length > 0) {
      const lastData = props.data[props.data.length - 1];
      price = lastData.value;
      time = lastData.time;
    }
    updateLegend(price, time);
  });

  const resizeObserver = new ResizeObserver((entries) => {
    if (chart && entries[0]) {
      chart.applyOptions({ width: entries[0].contentRect.width });
    }
  });
  resizeObserver.observe(chartContainer.value);
});

watch(data, (newData) => {
  if (props.data && props.data.length > 0) {
    const lastData = props.data[props.data.length - 1];
    updateLegend(lastData.value, lastData.time);
  }
  if (lineSeries && newData) {
    lineSeries.setData(newData);
    chart?.timeScale().fitContent();
  }
}, { immediate: true });

defineExpose({ refresh });
</script>

<template>
  <div>
    <div class="x">
      <div ref="chartContainer" id="x" class="x" />
      <div ref="legendEl" class="l" />
    </div>
    <p class="f">Times shown are in your local timezone. Data points are recorded in UTC. Data is refreshed 17 minutes into the hour. Open source at <a href="https://github.com/3kh0/amp-spy">3kh0/amp-spy</a>.</p>
  </div>
</template>

<style scoped>
.x {
  position: relative;
}

.x {
  width: 100%;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #878b861f;
  background-color: #111311;
}

.l {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
  font-size: 14px;
  font-family: sans-serif;
  color: #d1d4dc;
  background: rgba(17, 19, 17, 0.8);
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #878b861f;
}

.l :deep(.legend-title) {
  color: #f34e3f;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
}

.l :deep(.legend-row) {
  display: flex;
  gap: 8px;
}

.l :deep(.legend-label) {
  color: #8b8f8a;
}

.l :deep(.legend-value) {
  color: #d1d4dc;
}

.f {
  margin-top: 8px;
  font-size: 12px;
  color: #8b8f8a;
  z-index: 1000;
}

a {
  color: #d1d4dc;
  text-decoration: underline;
}
</style>
