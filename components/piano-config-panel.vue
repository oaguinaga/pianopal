<script setup lang="ts">
import type { ColorMode, LabelStyle } from "~/types/piano";

type PianoConfig = {
  octaveRange: number;
  startOctave: number;
  labelStyle: LabelStyle;
  colorMode: ColorMode;
  showOctaveLabels: boolean;
  showKeyboardHints: boolean;
  showKeyboardGuide: boolean;
  enableMidi: boolean;
  // Practice mode visual options
  showScaleHighlights: boolean;
  showNextNoteHint: boolean;
  showSuccessAnimation: boolean;
};

type Props = {
  config: PianoConfig;
  // Control visibility of different sections
  showOctaveOptions?: boolean;
  showDisplayOptions?: boolean;
  showKeyboardOptions?: boolean;
  showAdvancedOptions?: boolean;
  showPracticeOptions?: boolean;
};

type Emits = {
  "update:config": [config: PianoConfig];
};

// Default to showing everything for backward compatibility
const _props = withDefaults(defineProps<Props>(), {
  showOctaveOptions: true,
  showDisplayOptions: true,
  showKeyboardOptions: true,
  showAdvancedOptions: true,
  showPracticeOptions: true,
});

defineEmits<Emits>();
</script>

<template>
  <div class="dropdown dropdown-end">
    <div
      tabindex="0"
      role="button"
      class="btn btn-ghost btn-square"
    >
      <Icon name="hugeicons:settings-02" size="24" />
    </div>

    <div tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-80 max-h-96 overflow-y-auto">
      <div class="p-4 space-y-4">
        <h3 class="text-lg font-semibold text-base-content">
          Piano Configuration
        </h3>

        <div class="space-y-4">
          <!-- Octave Settings -->
          <div v-if="showOctaveOptions" class="space-y-3">
            <h4 class="text-sm font-medium text-base-content/70 uppercase tracking-wide">
              Octave Options
            </h4>

            <!-- Octave Range -->
            <div class="form-control">
              <label class="label">
                <span class="label-text text-sm">Octave Range</span>
              </label>
              <select
                :value="config.octaveRange"
                class="select select-bordered select-sm w-full"
                @change="(event) => $emit('update:config', { ...config, octaveRange: Number((event.target as HTMLSelectElement).value) })"
              >
                <option :value="1">
                  1 Octave
                </option>
                <option :value="2">
                  2 Octaves
                </option>
                <option :value="3">
                  3 Octaves
                </option>
                <option :value="4">
                  4 Octaves
                </option>
                <option :value="7">
                  7 Octaves
                </option>
              </select>
            </div>

            <!-- Start Octave -->
            <div class="form-control">
              <label class="label">
                <span class="label-text text-sm">Start Octave</span>
              </label>
              <select
                :value="config.startOctave"
                class="select select-bordered select-sm w-full"
                @change="(event) => $emit('update:config', { ...config, startOctave: Number((event.target as HTMLSelectElement).value) })"
              >
                <option :value="1">
                  Octave 1
                </option>
                <option :value="2">
                  Octave 2
                </option>
                <option :value="3">
                  Octave 3
                </option>
                <option :value="4">
                  Octave 4
                </option>
                <option :value="5">
                  Octave 5
                </option>
              </select>
            </div>

            <!-- Show Octave Labels -->
            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-3">
                <input
                  :checked="config.showOctaveLabels"
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  @change="(event) => $emit('update:config', { ...config, showOctaveLabels: (event.target as HTMLInputElement).checked })"
                >
                <span class="label-text text-sm">Show Octave Numbers</span>
              </label>
            </div>
          </div>

          <!-- Display Settings -->
          <div v-if="showDisplayOptions" class="space-y-3">
            <h4 class="text-sm font-medium text-base-content/70 uppercase tracking-wide">
              Display
            </h4>
            <div class="flex gap-4">
              <!-- Label Style -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-sm">Label Style</span>
                </label>
                <select
                  :value="config.labelStyle"
                  class="select select-bordered select-sm w-full"
                  @change="(event) => $emit('update:config', { ...config, labelStyle: (event.target as HTMLSelectElement).value as LabelStyle })"
                >
                  <option value="letter">
                    Letter (C, D, E...)
                  </option>
                  <option value="do-re-mi">
                    Do Re Mi
                  </option>
                  <option value="none">
                    No Labels
                  </option>
                </select>
              </div>

              <!-- Color Mode -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-sm">Color Mode</span>
                </label>
                <select
                  :value="config.colorMode"
                  class="select select-bordered select-sm w-full"
                  @change="(event) => $emit('update:config', { ...config, colorMode: (event.target as HTMLSelectElement).value as ColorMode })"
                >
                  <option value="per-note">
                    Per-Note Colors
                  </option>
                  <option value="mono">
                    Mono Color
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Practice Mode Settings -->
          <div v-if="showPracticeOptions" class="space-y-3">
            <h4 class="text-sm font-medium text-base-content/70 uppercase tracking-wide">
              Practice Mode
            </h4>

            <!-- Show Scale Highlights -->
            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-3">
                <input
                  :checked="config.showScaleHighlights"
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  @change="(event) => $emit('update:config', { ...config, showScaleHighlights: (event.target as HTMLInputElement).checked })"
                >
                <span class="label-text text-sm">Highlight Scale Notes</span>
              </label>
            </div>

            <!-- Show Next Note Hint -->
            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-3">
                <input
                  :checked="config.showNextNoteHint"
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  @change="(event) => $emit('update:config', { ...config, showNextNoteHint: (event.target as HTMLInputElement).checked })"
                >
                <span class="label-text text-sm">Show Next Note Hint</span>
              </label>
            </div>

            <!-- Show Success Animation -->
            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-3">
                <input
                  :checked="config.showSuccessAnimation"
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  @change="(event) => $emit('update:config', { ...config, showSuccessAnimation: (event.target as HTMLInputElement).checked })"
                >
                <span class="label-text text-sm">Show Success Animation</span>
              </label>
            </div>
          </div>

          <!-- Keyboard Settings -->
          <div v-if="showKeyboardOptions" class="space-y-3">
            <h4 class="text-sm font-medium text-base-content/70 uppercase tracking-wide">
              Keyboard
            </h4>

            <!-- Show Keyboard Guide -->
            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-3">
                <input
                  :checked="config.showKeyboardGuide"
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  @change="(event) => $emit('update:config', { ...config, showKeyboardGuide: (event.target as HTMLInputElement).checked })"
                >
                <span class="label-text text-sm">Show Keyboard Guide</span>
              </label>
            </div>

            <!-- Show Keyboard Hints -->
            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-3">
                <input
                  :checked="config.showKeyboardHints"
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  @change="(event) => $emit('update:config', { ...config, showKeyboardHints: (event.target as HTMLInputElement).checked })"
                >
                <span class="label-text text-sm">Show Keyboard Hints</span>
              </label>
            </div>
          </div>

          <!-- Advanced Settings -->
          <div v-if="showAdvancedOptions" class="space-y-3">
            <h4 class="text-sm font-medium text-base-content/70 uppercase tracking-wide">
              Advanced
            </h4>

            <!-- Enable MIDI -->
            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-3">
                <input
                  :checked="config.enableMidi"
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  @change="(event) => $emit('update:config', { ...config, enableMidi: (event.target as HTMLInputElement).checked })"
                >
                <span class="label-text text-sm">Enable MIDI (if supported)</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
