<template>
  <div class="flex flex-col w-full max-w-60 shadow-lg">
    <div class="bg-[#002d72] p-4 flex justify-center items-center h-64">
      <img :src="post.img" class="object-contain h-full w-full border border-gray-400" />
    </div>

    <div class="bg-[#ffeb00] p-4 text-[#002d72] font-sans">
      <div class="font-bold text-xs mb-2 uppercase tracking-widest text-center">
        {{ post.type }}
      </div>
      <div class="text-sm space-y-1">
        <p>
          <strong>Alcance:</strong>
          {{ post.reach }}
        </p>
        <p>
          <strong>Interactions:</strong>
          {{ post.interactions }}
        </p>
        <p>
          <strong>Shared o saved:</strong>
          {{ post.saved }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
  defineProps(['post'])
</script>
