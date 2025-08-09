<script setup lang="ts">
const props = defineProps<{
  isMuted: boolean;
  volumeDb: number; // -60 .. 0
  reverbEnabled: boolean;
  roomSize: number; // 0..1
  lowLatency: boolean;
  instrument: "piano" | "polysynth" | "amsynth" | "fmsynth" | "membranesynth";
  enabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:isMuted", val: boolean): void;
  (e: "update:volumeDb", val: number): void;
  (e: "update:reverbEnabled", val: boolean): void;
  (e: "update:roomSize", val: number): void;
  (e: "update:lowLatency", val: boolean): void;
  (e: "update:instrument", val: "piano" | "polysynth" | "amsynth" | "fmsynth" | "membranesynth"): void;
  (e: "enable-audio"): void;
  (e: "play-test-beep"): void;
}>();

function onMuteToggle() {
  emit("update:isMuted", !props.isMuted);
}
function onVolume(e: Event) {
  const t = e.target as HTMLInputElement;
  emit("update:volumeDb", Number(t.value));
}
function onReverbToggle() {
  emit("update:reverbEnabled", !props.reverbEnabled);
}
function onRoomSize(e: Event) {
  const t = e.target as HTMLInputElement;
  emit("update:roomSize", Number(t.value));
}
function onLatencyToggle() {
  emit("update:lowLatency", !props.lowLatency);
}
function onInstrument(e: Event) {
  const t = e.target as HTMLSelectElement;
  emit("update:instrument", t.value as any);
}
</script>

<template>
  <div class="rounded-lg border border-base-300 bg-base-100 p-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-base font-semibold">
        Sound Controls
      </h3>
      <button
        class="btn btn-sm"
        :class="props.enabled ? 'btn-primary' : ''"
        @click="$emit('enable-audio')"
      >
        {{ props.enabled ? 'Audio Enabled' : 'Enable Audio' }}
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">Mute</span>
          <input
            type="checkbox"
            class="toggle"
            :checked="isMuted"
            @change="onMuteToggle"
          >
        </label>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Instrument</span>
        </label>
        <select
          class="select select-bordered select-sm"
          :value="instrument"
          @change="onInstrument"
        >
          <option value="piano">
            Piano (Sampler)
          </option>
          <option value="polysynth">
            PolySynth
          </option>
          <option value="amsynth">
            AMSynth
          </option>
          <option value="fmsynth">
            FMSynth
          </option>
          <option value="membranesynth">
            MembraneSynth
          </option>
        </select>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Volume (dB)</span>
          <span class="label-text-alt">{{ volumeDb }}</span>
        </label>
        <input
          type="range"
          min="-60"
          max="0"
          step="1"
          :value="volumeDb"
          class="range"
          @input="onVolume"
        >
      </div>

      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">Reverb</span>
          <input
            type="checkbox"
            class="toggle"
            :checked="reverbEnabled"
            @change="onReverbToggle"
          >
        </label>
        <label class="label">
          <span class="label-text">Room Size</span>
          <span class="label-text-alt">{{ roomSize.toFixed(2) }}</span>
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          :value="roomSize"
          class="range"
          @input="onRoomSize"
        >
      </div>

      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">Low Latency (mobile)</span>
          <input
            type="checkbox"
            class="toggle"
            :checked="lowLatency"
            @change="onLatencyToggle"
          >
        </label>
      </div>

      <!-- Debug / QA -->
      <div class="form-control">
        <button class="btn btn-outline btn-sm" @click="$emit('play-test-beep')">
          Play Test Beep
        </button>
      </div>
    </div>
  </div>
</template>
