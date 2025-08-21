<script setup lang="ts">
const props = defineProps<{
  isMuted: boolean;
  volumeDb: number; // -60 .. 0
  reverbEnabled: boolean;
  reverbRoomSize: number; // 0..1
  lowLatency: boolean;
  instrument: "piano" | "polysynth" | "amsynth" | "fmsynth" | "membranesynth";
  enabled?: boolean;
  // New MIDI props
  isMidiSupported: boolean;
  midiInputs: Array<{ id: string; name: string }>;
  selectedMidiInputId: string;
  midiError?: string;
}>();

const emit = defineEmits<{
  (e: "update:is-muted", val: boolean): void;
  (e: "update:volume-db", val: number): void;
  (e: "update:reverb-enabled", val: boolean): void;
  (e: "update:reverb-room-size", val: number): void;
  (e: "update:low-latency", val: boolean): void;
  (e: "update:instrument", val: "piano" | "polysynth" | "amsynth" | "fmsynth" | "membranesynth"): void;
  (e: "enable-audio"): void;
  // New MIDI emit
  (e: "update:midi-input", val: string): void;
}>();

function onMuteToggle() {
  emit("update:is-muted", !props.isMuted);
}
function onVolume(e: Event) {
  const t = e.target as HTMLInputElement;
  emit("update:volume-db", Number(t.value));
}
function onReverbToggle() {
  emit("update:reverb-enabled", !props.reverbEnabled);
}
function onRoomSize(e: Event) {
  const t = e.target as HTMLInputElement;
  emit("update:reverb-room-size", Number(t.value));
}
function onLatencyToggle() {
  emit("update:low-latency", !props.lowLatency);
}
function onInstrument(e: Event) {
  const t = e.target as HTMLSelectElement;
  emit("update:instrument", t.value as any);
}
function onMidiInputChange(e: Event) {
  const t = e.target as HTMLSelectElement;
  emit("update:midi-input", t.value);
}
</script>

<template>
  <div class="dropdown dropdown-end">
    <div
      tabindex="0"
      role="button"
      class="btn btn-ghost btn-square"
    >
      <Icon name="hugeicons:settings-05" size="24" />
    </div>
    <div tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-80 max-h-96 overflow-y-auto">
      <div class="p-4 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-base-content">
            Sound Controls
          </h3>
          <button
            class="btn btn-sm"
            @click="$emit('enable-audio')"
          >
            {{ props.enabled ? 'Audio Enabled' : 'Enable Audio' }}
            <div
              class="inline-grid *:[grid-area:1/1]"
            >
              <div class="status animate-ping" :class="props.enabled ? 'status-primary' : 'status-error'" />
              <div class="status" :class="props.enabled ? 'status-primary' : 'status-error'" />
            </div>
          </button>
        </div>

        <div class="space-y-4">
          <!-- Basic Controls -->
          <div class="space-y-3">
            <h4 class="text-sm font-medium text-base-content/70 uppercase tracking-wide">
              Basic Controls
            </h4>

            <!-- Mute Toggle -->
            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  :checked="isMuted"
                  @change="onMuteToggle"
                >
                <span class="label-text text-sm">Mute</span>
              </label>
            </div>

            <!-- Instrument Selection -->
            <div class="form-control">
              <label class="label">
                <span class="label-text text-sm">Instrument</span>
              </label>
              <select
                class="select select-bordered select-sm w-full"
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
          </div>

          <!-- Volume & Effects -->
          <div class="space-y-3">
            <h4 class="text-sm font-medium text-base-content/70 uppercase tracking-wide">
              Volume & Effects
            </h4>

            <!-- Volume Control -->
            <div class="form-control">
              <label class="label">
                <span class="label-text text-sm">Volume (dB)</span>
                <span class="label-text-alt text-xs">{{ volumeDb }}</span>
              </label>
              <input
                type="range"
                min="-60"
                max="0"
                step="1"
                :value="volumeDb"
                class="range range-xs"
                @input="onVolume"
              >
            </div>

            <!-- Reverb Controls -->
            <div class="space-y-2">
              <div class="form-control">
                <label class="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    class="checkbox checkbox-sm"
                    :checked="reverbEnabled"
                    @change="onReverbToggle"
                  >
                  <span class="label-text text-sm">Reverb</span>
                </label>
              </div>

              <div v-if="reverbEnabled" class="form-control">
                <label class="label">
                  <span class="label-text text-sm">Room Size</span>
                  <span class="label-text-alt text-xs">{{ reverbRoomSize.toFixed(2) }}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  :value="reverbRoomSize"
                  class="range range-sm"
                  @input="onRoomSize"
                >
              </div>
            </div>
          </div>

          <!-- Advanced Settings -->
          <div class="space-y-3">
            <h4 class="text-sm font-medium text-base-content/70 uppercase tracking-wide">
              Advanced
            </h4>

            <!-- Low Latency Toggle -->
            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  :checked="lowLatency"
                  @change="onLatencyToggle"
                >
                <span class="label-text text-sm">Low Latency (mobile)</span>
              </label>
            </div>
          </div>

          <!-- MIDI Input Section -->
          <div class="space-y-3">
            <h4 class="text-sm font-medium text-base-content/70 uppercase tracking-wide">
              MIDI Input
            </h4>

            <div v-if="!isMidiSupported" class="text-sm text-warning">
              MIDI not supported in this browser.
            </div>
            <div v-else>
              <div v-if="midiInputs.length === 0" class="text-sm opacity-70">
                No MIDI devices detected.
              </div>
              <div v-else class="form-control">
                <label class="label">
                  <span class="label-text text-sm">Device</span>
                </label>
                <select
                  :value="selectedMidiInputId"
                  class="select select-bordered select-sm w-full"
                  @change="onMidiInputChange"
                >
                  <option
                    v-for="input in midiInputs"
                    :key="input.id"
                    :value="input.id"
                  >
                    {{ input.name }}
                  </option>
                </select>
              </div>
              <p v-if="midiError" class="text-error text-xs mt-1">
                {{ midiError }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
