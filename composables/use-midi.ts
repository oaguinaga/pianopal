import { onMounted, onUnmounted, ref, watch } from "vue";

import { NOTE_NAMES, SEMITONES_PER_OCTAVE } from "~/constants/piano";

// MIDI status constants (hex) for clarity and DX
const MIDI_STATUS_MASK = 0xF0;
const MIDI_NOTE_ON = 0x90;
const MIDI_NOTE_OFF = 0x80;

const MIDI_OCTAVE_OFFSET = -1;

// Minimal types to avoid relying on DOM lib typings in all environments
type MidiAccess = {
  inputs: Map<string, MidiInput>;
  onstatechange: ((...args: any[]) => void) | null;
};

type MidiInput = {
  id: string;
  name?: string;
  onmidimessage: ((evt: MidiMessageEvent) => void) | null;
};

type MidiMessageEvent = { data: Uint8Array };

type MidiInputSummary = { id: string; name: string };

type MidiConfig = {
  enabled: { value: boolean };
  onNoteOn?: (noteId: string) => void;
  onNoteOff?: (noteId: string) => void;
};

function midiNoteToNoteId(midiNote: number): string {
  const octave = Math.floor(midiNote / SEMITONES_PER_OCTAVE) + MIDI_OCTAVE_OFFSET;
  const name = NOTE_NAMES[midiNote % NOTE_NAMES.length];
  return `${name}${octave}`;
}

export function useMidi(config: MidiConfig) {
  const isMidiSupported = ref<boolean>(false);
  const access = ref<MidiAccess | null>(null);
  const midiInputs = ref<MidiInputSummary[]>([]);
  const selectedMidiInputId = ref<string>("");
  const midiError = ref<string>("");

  let attachedInput: MidiInput | null = null;

  async function init() {
    if (!import.meta.client)
      return;

    isMidiSupported.value = typeof navigator !== "undefined" && typeof (navigator as any).requestMIDIAccess === "function";

    if (!isMidiSupported.value) {
      return;
    }
    try {
      const acc = await (navigator as any).requestMIDIAccess();
      access.value = acc;
      refreshInputs();
      acc.onstatechange = () => {
        refreshInputs();
      };
    }
    catch {
      midiError.value = "MIDI access denied";
    }
  }

  // Rebuild device list and keep selection consistent
  function refreshInputs() {
    if (!access.value)
      return;

    const map: Map<string, MidiInput> = access.value && access.value.inputs
      ? (access.value.inputs as Map<string, MidiInput>)
      : new Map<string, MidiInput>();

    midiInputs.value = Array
      .from(map.values())
      .map((input: MidiInput) => ({
        id: input.id,
        name: input.name ?? "Unknown MIDI Input",
      }));

    // Auto-select first input if none selected
    if (!selectedMidiInputId.value && midiInputs.value.length > 0) {
      selectedMidiInputId.value = midiInputs.value[0].id;
    }
    attachToSelected();
  }

  // Attach an onmidimessage handler to the currently selected device
  function attachToSelected() {
    if (!access.value)
      return;
    // Detach previous
    if (attachedInput) {
      attachedInput.onmidimessage = null;
      attachedInput = null;
    }

    const allInputs = Array.from((access.value.inputs as Map<string, MidiInput>).values());
    const selectedInput = allInputs.find((i: MidiInput) => i.id === midiSelectedId()) || null;

    if (!selectedInput)
      return;

    attachedInput = selectedInput;

    attachedInput.onmidimessage = (evt: MidiMessageEvent) => {
      const [status, note, velocity] = evt.data;
      const type = status & MIDI_STATUS_MASK;

      if (type === MIDI_NOTE_ON && velocity > 0) {
        const id = midiNoteToNoteId(note);
        config.onNoteOn?.(id);
      }

      else if (type === MIDI_NOTE_OFF || (type === MIDI_NOTE_ON && velocity === 0)) {
        const id = midiNoteToNoteId(note);
        config.onNoteOff?.(id);
      }
    };
  }

  function midiSelectedId(): string {
    return selectedMidiInputId.value;
  }

  watch(() => config.enabled.value, (en) => {
    if (en)
      init();
    else
      detach();
  }, { immediate: true });

  watch(selectedMidiInputId, () => {
    attachToSelected();
  });

  function detach() {
    if (attachedInput)
      attachedInput.onmidimessage = null;
    attachedInput = null;
  }

  onMounted(() => {
    if (config.enabled.value)
      init();
  });

  onUnmounted(() => {
    detach();
  });

  return {
    isMidiSupported,
    midiInputs,
    selectedMidiInputId,
    midiError,
  };
}
