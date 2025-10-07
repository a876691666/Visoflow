<template>
  <div class="controls-container">
    <div class="controls-header">对象管理</div>
    <div class="controls-body">
      <p>这里将展示和管理画布中的对象（占位组件）。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// TODO: 后续在此实现对象（节点/连接/矩形/文本等）的批量管理与属性编辑
</script>

<style scoped>
.controls-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.controls-header {
  font-weight: bold;
  padding: 8px 12px;
  border-bottom: 1px solid #e0e0e0;
}
.controls-body {
  padding: 12px;
}
</style>
