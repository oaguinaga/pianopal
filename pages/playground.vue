<script setup lang="ts">
// Test data for piano component
const highlightedNotes = ref(["C4", "E4", "G4", "C#4"]); // C Major chord
const activeNotes = ref<string[]>([]); // Active notes from keyboard input

// Test configuration options
const testOctaveRange = ref(3);
const testStartOctave = ref(3);
const testLabelStyle = ref<"letter" | "do-re-mi" | "none">("letter");
const testColorMode = ref<"per-note" | "mono">("per-note");
const testShowOctaveLabels = ref(false);
const testShowKeyboardGuide = ref(true);

function handleNoteOn(noteId: string) {
  if (!activeNotes.value.includes(noteId)) {
    activeNotes.value.push(noteId);
  }
  console.warn("Note on:", noteId);
}

function handleNoteOff(noteId: string) {
  activeNotes.value = activeNotes.value.filter(n => n !== noteId);
  console.warn("Note off:", noteId);
}

// Test function to manually trigger a note
function testVisualFeedback() {
  console.log("Testing visual feedback...");
  activeNotes.value = ["C4"];
  setTimeout(() => {
    activeNotes.value = [];
    console.log("Test completed");
  }, 2000);
}
</script>

<template>
  <div class="container mx-auto p-6 space-y-6">
    <div class="text-center">
      <h1 class="text-3xl font-bold mb-2">
        Piano Playground
      </h1>
      <p class="text-base-content/70">
        Interactive piano with keyboard input support
      </p>
    </div>

    <!-- Piano Component Test -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">
          PianoPlayground Component
        </h2>
        <div class="space-y-6">
          <!-- Interactive Test Controls -->
          <div class="bg-base-200 p-4 rounded-lg">
            <h3 class="text-lg font-semibold mb-4">
              Configuration
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Octave Range</span>
                </label>
                <select
                  v-model="testOctaveRange"
                  class="select select-bordered"
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
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Start Octave</span>
                </label>
                <select
                  v-model="testStartOctave"
                  class="select select-bordered"
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
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Label Style</span>
                </label>
                <select
                  v-model="testLabelStyle"
                  class="select select-bordered"
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
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Color Mode</span>
                </label>
                <select
                  v-model="testColorMode"
                  class="select select-bordered"
                >
                  <option value="per-note">
                    Per-Note Colors
                  </option>
                  <option value="mono">
                    Mono Color
                  </option>
                </select>
              </div>
              <div class="form-control">
                <label class="label cursor-pointer">
                  <span class="label-text">Show Keyboard Guide</span>
                  <input
                    v-model="testShowKeyboardGuide"
                    type="checkbox"
                    class="checkbox"
                  >
                </label>
              </div>
              <div class="form-control">
                <label class="label cursor-pointer">
                  <span class="label-text">Show Octave Numbers</span>
                  <input
                    v-model="testShowOctaveLabels"
                    type="checkbox"
                    class="checkbox"
                  >
                </label>
              </div>
            </div>
          </div>

          <!-- Interactive Piano -->
          <div>
            <h3 class="text-lg font-semibold mb-2">
              Interactive Piano ({{ testOctaveRange }} octave{{ testOctaveRange !== 1 ? 's' : '' }} starting from octave {{ testStartOctave }})
            </h3>
            <div class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p class="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>How to use:</strong> Click on the piano area, then press keyboard keys to play!
                Try pressing 'A' (C4), 'D' (E4), and 'G' (G4) to play a C major chord.
              </p>
            </div>
            <piano-playground
              :octave-range="testOctaveRange"
              :start-octave="testStartOctave"
              :label-style="testLabelStyle"
              :color-mode="testColorMode"
              :show-octave-labels="testShowOctaveLabels"
              :show-keyboard-guide="testShowKeyboardGuide"
              :highlighted-notes="highlightedNotes"
              @note-on="handleNoteOn"
              @note-off="handleNoteOff"
            />
          </div>

          <!-- Debug Info -->
          <div class="bg-base-200 p-4 rounded-lg">
            <h4 class="font-semibold mb-2">
              Debug Information:
            </h4>
            <p class="text-sm mb-1">
              <strong>Highlighted Notes:</strong> {{ highlightedNotes.join(', ') }} (C Major chord)
            </p>
            <p class="text-sm mb-1">
              <strong>Active Notes:</strong> {{ activeNotes.length > 0 ? activeNotes.join(', ') : 'None' }}
            </p>
            <p class="text-sm mb-2">
              <strong>Current Configuration:</strong> {{ testOctaveRange }} octaves starting from octave {{ testStartOctave }}, {{ testLabelStyle === 'none' ? 'no' : testLabelStyle }} labels, {{ testColorMode }} colors{{ testShowOctaveLabels ? ', with octave numbers' : '' }}
            </p>
            <p class="text-sm text-base-content/70">
              Press keyboard keys to interact with the piano. The component automatically handles focus management and prevents stuck keys.
            </p>

            <!-- Test Button -->
            <div class="mt-4">
              <button
                type="button"
                class="btn btn-primary btn-sm"
                @click="testVisualFeedback"
              >
                Test Visual Feedback (C4)
              </button>
              <p class="text-xs text-base-content/70 mt-1">
                Click this button to test if the visual feedback is working. C4 should highlight for 2 seconds.
              </p>
            </div>
          </div>

          <!-- Keyboard Mapping Reference -->
          <div class="bg-base-200 p-4 rounded-lg">
            <h4 class="font-semibold mb-2">
              Keyboard Mapping Reference:
            </h4>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <div><strong>A:</strong> C4</div>
              <div><strong>W:</strong> C#4</div>
              <div><strong>S:</strong> D4</div>
              <div><strong>E:</strong> D#4</div>
              <div><strong>D:</strong> E4</div>
              <div><strong>F:</strong> F4</div>
              <div><strong>T:</strong> F#4</div>
              <div><strong>G:</strong> G4</div>
              <div><strong>Y:</strong> G#4</div>
              <div><strong>H:</strong> A4</div>
              <div><strong>U:</strong> A#4</div>
              <div><strong>J:</strong> B4</div>
              <div><strong>K:</strong> C5</div>
              <div><strong>O:</strong> C#5</div>
              <div><strong>L:</strong> D5</div>
              <div><strong>P:</strong> D#5</div>
              <div><strong>;:</strong> E5</div>
              <div><strong>':</strong> F5</div>
              <div><strong>Z:</strong> C3</div>
              <div><strong>X:</strong> D3</div>
              <div><strong>C:</strong> E3</div>
              <div><strong>V:</strong> F3</div>
              <div><strong>B:</strong> G3</div>
              <div><strong>N:</strong> A3</div>
              <div><strong>M:</strong> B3</div>
            </div>
            <p class="text-sm text-base-content/70 mt-2">
              Use the octave shift buttons in the keyboard guide to change the octave range.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
