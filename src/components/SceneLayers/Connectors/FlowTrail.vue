<template>
  <defs>
    <!-- 渐变球体填充（可选用于高光头部） -->
    <radialGradient :id="ballGradId" cx="50%" cy="50%" r="50%">
      <stop offset="0%" :stop-color="headColor" />
      <stop offset="100%" :stop-color="tailColor" />
    </radialGradient>

    <!-- 运动路径 -->
    <path :id="trackId" :d="d" :stroke-width="baseStroke" fill="none" />

    <!-- 基础路径遮罩（限制在路径描边内） -->
    <mask :id="lineMaskId" maskUnits="userSpaceOnUse">
      <use
        :href="`#${trackId}`"
        stroke="white"
        stroke-linecap="round"
        stroke-linejoin="round"
        :stroke-width="baseStroke"
        fill="none"
      />
    </mask>

    <mask :id="trailMaskId" maskUnits="userSpaceOnUse">
      <g>
        <animateMotion :dur="duration" repeatCount="indefinite" rotate="auto">
          <mpath :href="`#${trackId}`" />
        </animateMotion>
        <!-- 缩放遮罩以与小球同步：0-0.05 由 0→1，0.05-0.95 保持 1，0.95-1 由 1→0 -->
        <animateTransform
          attributeName="transform"
          type="scale"
          additive="sum"
          :dur="duration"
          repeatCount="indefinite"
          calcMode="linear"
          keyTimes="0;0.05;0.95;1"
          values="0;1;1;0"
        />
        <circle :r="ballRadius - 1" fill="white" />
        <!-- 遮掉前进方向（球体前方）的窄区，避免前半部分可见 -->
        <rect
          x="0"
          :y="-(ballRadius - 1)"
          :width="ballRadius * 1.4"
          :height="(ballRadius + 3) * 2"
          fill="black"
        />
      </g>
    </mask>
  </defs>

  <!-- 底色路径 -->
  <path
    :d="d"
    :stroke="baseColor"
    fill="transparent"
    :stroke-width="baseStroke"
  />

  <!-- 球体，同时受基础路径遮罩与尾迹遮罩共同裁剪 -->
  <g :mask="`url(#${lineMaskId})`">
    <g :mask="`url(#${trailMaskId})`">
      <circle
        :r="ballRadius"
        :fill="useBallGradient ? `url(#${ballGradId})` : headColor"
      >
        <animateMotion :dur="duration" repeatCount="indefinite" rotate="auto">
          <mpath :href="`#${trackId}`" />
        </animateMotion>
        <!-- 小球自身缩放，与路径动画同步周期 -->
        <animateTransform
          attributeName="transform"
          type="scale"
          additive="sum"
          :dur="duration"
          repeatCount="indefinite"
          calcMode="linear"
          keyTimes="0;0.1;0.8;1"
          values="0;1;1;0"
        />
      </circle>
    </g>
  </g>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    d: string;
    baseColor?: string;
    headColor?: string;
    tailColor?: string;
    duration?: string;
    baseStroke?: number;
    ballRadius?: number;
    useBallGradient?: boolean;
  }>(),
  {
    baseColor: 'red',
    headColor: 'red',
    tailColor: '#ffd180',
    duration: '2s',
    baseStroke: 2,
    ballRadius: 10,
    useBallGradient: false
  }
);

// 生成唯一 id，避免多个组件实例冲突
const uid = Math.random().toString(36).slice(2);
const trackId = `trackPath-${uid}`;
const lineMaskId = `lineMask-${uid}`;
const trailMaskId = `trailMask-${uid}`;
const ballGradId = `ballGrad-${uid}`;
</script>

<style scoped>
.flow-trail {
  display: block;
}
</style>
