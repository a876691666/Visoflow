<template>
  <div class="debug-utils">
    <div class="debug-header">
      <h4>Debug Tools</h4>
    </div>

    <div class="debug-section">
      <label>Performance</label>
      <div class="debug-info">FPS: {{ fps }}</div>
    </div>

    <div class="debug-section">
      <label>Mouse Position</label>
      <div class="debug-info">
        Screen: ({{ mousePos.screen.x }}, {{ mousePos.screen.y }})
        <br />
        Tile: ({{ mousePos.tile.x }}, {{ mousePos.tile.y }})
      </div>
    </div>

    <div class="debug-section">
      <label>Zoom Level</label>
      <div class="debug-info">{{ Math.round(zoom * 100) }}%</div>
    </div>

    <div class="debug-section">
      <label>Mode</label>
      <div class="debug-info">
        {{ currentMode }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const fps = ref(60);
const mousePos = ref({
  screen: { x: 0, y: 0 },
  tile: { x: 0, y: 0 }
});
const zoom = ref(1.0);
const currentMode = ref('CURSOR');

// FPS counter
let frameCount = 0;
let lastTime = performance.now();
let fpsInterval: number;

const updateFPS = () => {
  frameCount++;
  const currentTime = performance.now();

  if (currentTime - lastTime >= 1000) {
    fps.value = Math.round((frameCount * 1000) / (currentTime - lastTime));
    frameCount = 0;
    lastTime = currentTime;
  }

  fpsInterval = requestAnimationFrame(updateFPS);
};

onMounted(() => {
  updateFPS();
});

onUnmounted(() => {
  if (fpsInterval) {
    cancelAnimationFrame(fpsInterval);
  }
});
</script>

<style scoped>
.debug-utils {
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 16px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
  max-width: 300px;
}

.debug-header {
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  padding-bottom: 8px;
}

.debug-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.debug-section {
  margin-bottom: 12px;
}

.debug-section label {
  display: block;
  font-weight: 600;
  margin-bottom: 4px;
  color: #90caf9;
}

.debug-info {
  color: #e0e0e0;
  line-height: 1.4;
}
</style>
