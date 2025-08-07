<script setup lang="ts">
// const { user } = useAuthStore();

// Test data for piano component
const highlightedNotes = ref(["C1", "E1", "G1", "C#1", "D#1"]); // C Major chord + some sharps
const activeNotes = ref<string[]>(["F1", "A1"]); // Some active notes for testing

// Test configuration options
const testOctaves = ref(2);
const testLabelStyle = ref<"letter" | "do-re-mi" | "none">("none");
const testColorMode = ref<"per-note" | "mono">("per-note");
const testShowOctaveLabels = ref(false);

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
</script>

<template>
  <div class="container mx-auto p-6 space-y-6">
    <div class="text-center">
      <h1 class="text-3xl font-bold mb-2">
        Piano Component Playground
      </h1>
      <p class="text-base-content/70">
        Test the VisualPiano component features
      </p>
    </div>

    <!-- Piano Component Test -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">
          Visual Piano Component
        </h2>
        <div class="space-y-6">
          <!-- Interactive Test Controls -->
          <div class="bg-base-200 p-4 rounded-lg">
            <h3 class="text-lg font-semibold mb-4">
              Test Configuration
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Number of Octaves</span>
                </label>
                <select
                  v-model="testOctaves"
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
                  <span class="label-text">Label Style</span>
                </label>
                <select
                  v-model="testLabelStyle"
                  class="select select-bordered"
                >
                  <option value="none">
                    No Labels
                  </option>
                  <option value="letter">
                    Letter (C, D, E...)
                  </option>
                  <option value="do-re-mi">
                    Do Re Mi
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
              <div class="form-control col-span-full">
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
              Interactive Piano ({{ testOctaves }} octave{{ testOctaves !== 1 ? 's' : '' }})
            </h3>
            <div class="mb-2 text-sm">
              <strong>Debug Info:</strong><br>
              Highlighted: {{ JSON.stringify(highlightedNotes) }}<br>
              Active: {{ JSON.stringify(activeNotes) }}<br>
              Color Mode: {{ testColorMode }}
            </div>
            <visual-piano
              :octaves="testOctaves"
              :label-style="testLabelStyle"
              :color-mode="testColorMode"
              :show-octave-labels="testShowOctaveLabels"
              :highlighted-notes="highlightedNotes"
              :active-notes="activeNotes"
              @note-on="handleNoteOn"
              @note-off="handleNoteOff"
            />
          </div>

          <!-- Octave Configuration Examples -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">
              Octave Configuration Examples
            </h3>

            <!-- Minimalistic Design Examples -->
            <div class="space-y-4">
              <h4 class="font-medium mb-2">
                Minimalistic Piano Design
              </h4>
              <p class="text-sm text-base-content/70 mb-3">
                Clean, rounded design with subtle colors matching your reference:
              </p>

              <!-- Example 1: C# and F# highlighted (like screenshot) -->
              <div class="mb-4">
                <h5 class="text-sm font-medium mb-2">
                  Example 1: C# and F# Highlighted (Sharp notation)
                </h5>
                <visual-piano
                  :octaves="1"
                  color-mode="per-note"
                  :highlighted-notes="['C#1', 'F#1']"
                  :active-notes="activeNotes"
                  @note-on="handleNoteOn"
                  @note-off="handleNoteOff"
                />
              </div>

              <!-- Simple debug test with basic notes -->
              <div class="mb-4">
                <h5 class="text-sm font-medium mb-2">
                  DEBUG: Simple White Key Test (C1 highlighted, should be BLUE)
                </h5>
                <visual-piano
                  :octaves="1"
                  color-mode="per-note"
                  label-style="letter"
                  :highlighted-notes="['C1']"
                  :active-notes="[]"
                  @note-on="handleNoteOn"
                  @note-off="handleNoteOff"
                />
              </div>

              <!-- Simple debug test with black keys -->
              <div class="mb-4">
                <h5 class="text-sm font-medium mb-2">
                  DEBUG: Simple Black Key Test (C#1 highlighted, should be BLUE)
                </h5>
                <visual-piano
                  :octaves="1"
                  color-mode="per-note"
                  label-style="letter"
                  :highlighted-notes="['C#1']"
                  :active-notes="[]"
                  @note-on="handleNoteOn"
                  @note-off="handleNoteOff"
                />
              </div>

              <!-- Example 1b: Flat notation test -->
              <div class="mb-4">
                <h5 class="text-sm font-medium mb-2">
                  DEBUG: Flat notation test (Db1 highlighted, should highlight C# key with PURPLE color)
                </h5>
                <visual-piano
                  :octaves="1"
                  color-mode="per-note"
                  label-style="letter"
                  :highlighted-notes="['Db1']"
                  :active-notes="[]"
                  @note-on="handleNoteOn"
                  @note-off="handleNoteOff"
                />
              </div>

              <!-- Example 2: D, G, and B highlighted (like screenshot) -->
              <div class="mb-4">
                <h5 class="text-sm font-medium mb-2">
                  Example 2: D, G, and B Highlighted
                </h5>
                <visual-piano
                  :octaves="1"
                  color-mode="per-note"
                  :highlighted-notes="['D1', 'G1', 'B1']"
                  :active-notes="activeNotes"
                  @note-on="handleNoteOn"
                  @note-off="handleNoteOff"
                />
              </div>

              <!-- Multi-octave test to verify black key positioning fix -->
              <div class="mb-4">
                <h5 class="text-sm font-medium mb-2">
                  Multi-Octave Test (Black Key Bug Fix)
                </h5>
                <visual-piano
                  :octaves="2"
                  label-style="letter"
                  :show-octave-labels="true"
                  :highlighted-notes="['C#1', 'F#1', 'C#2', 'F#2']"
                  :active-notes="activeNotes"
                  @note-on="handleNoteOn"
                  @note-off="handleNoteOff"
                />
              </div>

              <!-- All notes showcase -->
              <div class="mb-4">
                <h5 class="text-sm font-medium mb-2">
                  All Notes Colored
                </h5>
                <visual-piano
                  :octaves="1"
                  label-style="letter"
                  color-mode="per-note"
                  :highlighted-notes="['C1', 'C#1', 'D1', 'D#1', 'E1', 'F1', 'F#1', 'G1', 'G#1', 'A1', 'A#1', 'B1']"
                  :active-notes="activeNotes"
                  @note-on="handleNoteOn"
                  @note-off="handleNoteOff"
                />
              </div>
            </div>

            <!-- Responsive Examples -->
            <div class="space-y-3">
              <h4 class="font-medium mb-2">
                Responsive Examples
              </h4>

              <!-- Single Octave -->
              <div>
                <h5 class="text-sm font-medium mb-2">
                  Single Octave (Centered)
                </h5>
                <visual-piano
                  :octaves="1"
                  label-style="letter"
                  :highlighted-notes="['C1', 'E1', 'G1']"
                  :active-notes="activeNotes"
                  @note-on="handleNoteOn"
                  @note-off="handleNoteOff"
                />
              </div>

              <!-- Multiple Octaves -->
              <div>
                <h5 class="text-sm font-medium mb-2">
                  Four Octaves (Scrollable)
                </h5>
                <visual-piano
                  :octaves="4"
                  :highlighted-notes="['C1', 'E2', 'G3', 'C4']"
                  :active-notes="activeNotes"
                  @note-on="handleNoteOn"
                  @note-off="handleNoteOff"
                />
              </div>
            </div>
          </div>

          <!-- Test info -->
          <div class="bg-base-200 p-4 rounded-lg">
            <h4 class="font-semibold mb-2">
              Test Information:
            </h4>
            <p class="text-sm mb-1">
              <strong>Highlighted Notes:</strong> {{ highlightedNotes.join(', ') }} (C Major chord)
            </p>
            <p class="text-sm mb-1">
              <strong>Active Notes:</strong> {{ activeNotes.length > 0 ? activeNotes.join(', ') : 'None' }}
            </p>
            <p class="text-sm mb-2">
              <strong>Current Configuration:</strong> {{ testOctaves }} octaves, {{ testLabelStyle === 'none' ? 'no' : testLabelStyle }} labels, {{ testColorMode }} colors{{ testShowOctaveLabels ? ', with octave numbers' : '' }}
            </p>
            <p class="text-sm text-base-content/70">
              Click on piano keys to interact with them. On mobile, scroll horizontally for larger configurations. Check browser console for event logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
