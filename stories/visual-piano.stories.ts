import type { Meta, StoryObj } from "@nuxtjs/storybook";

import VisualPiano from "../components/visual-piano.vue";

const meta: Meta<typeof VisualPiano> = {
  title: "Components/VisualPiano",
  component: VisualPiano,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "An interactive piano keyboard component with customizable octaves, themes, and note highlighting.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    octaves: {
      control: { type: "select" },
      options: [1, 2, 3, 4, 5, 6, 7],
      description: "Number of octaves to display",
    },
    startOctave: {
      control: { type: "select" },
      options: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      description: "Starting octave for the first rendered octave",
    },
    theme: {
      control: "select",
      options: ["light", "dark"],
      description: "Visual theme for the component",
    },
    labelStyle: {
      control: "select",
      options: ["letter", "do-re-mi", "none"],
      description: "Style of note labels to display",
    },
    colorMode: {
      control: "select",
      options: ["per-note", "mono"],
      description: "Color mapping mode for highlighted notes",
    },
    highlightedNotes: {
      control: "object",
      description: "Array of note IDs to highlight (e.g., [\"C1\", \"E1\", \"G1\"])",
    },
    activeNotes: {
      control: "object",
      description: "Array of note IDs that are currently active/pressed",
    },
    hintNotes: {
      control: "object",
      description: "Array of note IDs to show as hints (next expected notes)",
    },
    successNotes: {
      control: "object",
      description: "Array of note IDs that should show success animation",
    },
    showScaleHighlights: {
      control: "boolean",
      description: "Whether to show scale note highlights",
    },
    showNextNoteHint: {
      control: "boolean",
      description: "Whether to show hint for next note",
    },
    showSuccessAnimation: {
      control: "boolean",
      description: "Whether to show success ring animation",
    },
    disabled: {
      control: "boolean",
      description: "Whether the piano is disabled",
    },
    inputEnabled: {
      control: "boolean",
      description: "Whether the piano accepts input interactions",
    },
    showOctaveLabels: {
      control: "boolean",
      description: "Whether to show octave numbers in labels",
    },
    showKeyboardHints: {
      control: "boolean",
      description: "Show computer keyboard hints inside keys",
    },
    keyboardHints: {
      control: "object",
      description: "Map of noteId to keyboard key (e.g., { C1: 'A', D1: 'S' })",
    },
  },
  args: {
    octaves: 2,
    startOctave: 1,
    theme: "light",
    labelStyle: "none",
    colorMode: "per-note",
    highlightedNotes: [],
    activeNotes: [],
    disabled: false,
    inputEnabled: true,
    showOctaveLabels: false,
    showKeyboardHints: false,
    keyboardHints: {},
  },
};

export default meta;
type Story = StoryObj<typeof VisualPiano>;

// Default piano configuration
export const Default: Story = {
  args: {
    octaves: 2,
    theme: "light",
  },
};

// Single octave - tests C key visibility bug
export const SingleOctave: Story = {
  args: {
    octaves: 1,
    theme: "light",
    labelStyle: "letter",
  },
  parameters: {
    docs: {
      description: {
        story: "Single octave piano including trailing high C (next octave). Verifies first C and last trailing C visibility and interaction.",
      },
    },
  },
};

// Seven octaves - tests B key visibility bug
export const SevenOctaves: Story = {
  args: {
    octaves: 7,
    theme: "light",
  },
  parameters: {
    docs: {
      description: {
        story: "Full 7-octave piano to test last key (B) visibility and scrolling behavior. This story tests the fix for the last key cut-off issue.",
      },
    },
  },
};

// Black key alignment testing
export const BlackKeyAlignment: Story = {
  args: {
    octaves: 2,
    theme: "light",
    labelStyle: "letter",
  },
  parameters: {
    docs: {
      description: {
        story: "Story for testing black key alignment between white keys. Verify that all black keys are perfectly centered.",
      },
    },
  },
};

// Highlighted notes - per screenshot example 1 (C# and F#)
export const HighlightedSharpNotes: Story = {
  args: {
    octaves: 1,
    theme: "light",
    highlightedNotes: ["C#1", "F#1"],
    colorMode: "per-note",
  },
  parameters: {
    docs: {
      description: {
        story: "Piano with C# and F# highlighted, matching the first example from the user screenshot.",
      },
    },
  },
};

// Highlighted notes - per screenshot example 2 (D, G, B)
export const HighlightedNaturalNotes: Story = {
  args: {
    octaves: 1,
    theme: "light",
    highlightedNotes: ["D1", "G1", "B1"],
    colorMode: "per-note",
  },
  parameters: {
    docs: {
      description: {
        story: "Piano with D, G, and B highlighted, matching the second example from the user screenshot.",
      },
    },
  },
};

// Active notes demonstration
export const ActiveNotes: Story = {
  args: {
    octaves: 2,
    theme: "light",
    activeNotes: ["C1", "E1", "G1"],
    colorMode: "per-note",
  },
  parameters: {
    docs: {
      description: {
        story: "Piano with active notes (C, E, G major chord) to test the active state styling.",
      },
    },
  },
};

// Dark theme
export const DarkTheme: Story = {
  args: {
    octaves: 2,
    theme: "dark",
    labelStyle: "letter",
    highlightedNotes: ["C1", "E1", "G1"],
  },
  parameters: {
    docs: {
      description: {
        story: "Piano in dark theme with highlighted notes to test theme compatibility.",
      },
    },
  },
};

// Label styles demonstration
export const WithLetterLabels: Story = {
  args: {
    octaves: 1,
    theme: "light",
    labelStyle: "letter",
    showOctaveLabels: true,
  },
};

export const WithDoReMiLabels: Story = {
  args: {
    octaves: 1,
    theme: "light",
    labelStyle: "do-re-mi",
    showOctaveLabels: true,
  },
};

// Color mode comparison
export const MonoColorMode: Story = {
  args: {
    octaves: 1,
    theme: "light",
    highlightedNotes: ["C1", "D#1", "F#1"],
    colorMode: "mono",
  },
  parameters: {
    docs: {
      description: {
        story: "Piano using mono color mode where all highlighted notes use the same color.",
      },
    },
  },
};

export const PerNoteColorMode: Story = {
  args: {
    octaves: 1,
    theme: "light",
    highlightedNotes: ["C1", "D#1", "F#1"],
    colorMode: "per-note",
  },
  parameters: {
    docs: {
      description: {
        story: "Piano using per-note color mode where each note has its unique color from the PRD specifications.",
      },
    },
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    octaves: 2,
    theme: "light",
    disabled: true,
    highlightedNotes: ["C1", "E1", "G1"],
  },
};

// Complex scenario - multiple octaves with various states
export const ComplexScenario: Story = {
  args: {
    octaves: 3,
    theme: "light",
    labelStyle: "letter",
    highlightedNotes: ["C1", "E1", "G1", "C2", "E2", "G2"],
    activeNotes: ["C3"],
    colorMode: "per-note",
    showOctaveLabels: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Complex scenario with multiple octaves, highlighted chords, active notes, and labels to test all features together.",
      },
    },
  },
};

// Test enharmonic equivalents (flats vs sharps)
export const EnharmonicEquivalents: Story = {
  args: {
    octaves: 1,
    labelStyle: "letter",
    colorMode: "per-note",
    highlightedNotes: ["Db1", "Eb1", "Gb1", "Ab1", "Bb1"], // All flats
  },
  parameters: {
    docs: {
      description: {
        story: "Tests flat notation and colors for enharmonic equivalents (Db, Eb, Gb, Ab, Bb).",
      },
    },
  },
};

export const EnharmonicEquivalentsActive: Story = {
  args: {
    octaves: 1,
    labelStyle: "letter",
    colorMode: "per-note",
    activeNotes: ["C#1", "D#1", "F#1", "G#1", "A#1"], // All sharps
  },
  parameters: {
    docs: {
      description: {
        story: "Tests sharp notation and colors for enharmonic equivalents (C#, D#, F#, G#, A#).",
      },
    },
  },
};

// Test persistent key press states
export const PersistentActiveStates: Story = {
  args: {
    octaves: 1,
    labelStyle: "letter",
    colorMode: "per-note",
    activeNotes: ["C1", "E1", "G1"], // Should remain active
    highlightedNotes: ["D1", "F1", "A1"],
  },
  parameters: {
    docs: {
      description: {
        story: "Tests that active keys maintain their pressed state color persistently.",
      },
    },
  },
};

// Test mono mode with different key types
export const MonoModeWhiteKeys: Story = {
  args: {
    octaves: 1,
    labelStyle: "letter",
    colorMode: "mono",
    highlightedNotes: ["C1", "E1", "G1"],
  },
  parameters: {
    docs: {
      description: {
        story: "Tests mono color mode with white keys using indigo-200.",
      },
    },
  },
};

export const MonoModeBlackKeys: Story = {
  args: {
    octaves: 1,
    labelStyle: "letter",
    colorMode: "mono",
    highlightedNotes: ["C#1", "F#1", "A#1"],
  },
  parameters: {
    docs: {
      description: {
        story: "Tests mono color mode with black keys using indigo-400.",
      },
    },
  },
};

export const MonoModeMixed: Story = {
  args: {
    octaves: 1,
    labelStyle: "letter",
    colorMode: "mono",
    highlightedNotes: ["C1", "C#1", "D1", "D#1"],
    activeNotes: ["E1", "F#1"],
  },
  parameters: {
    docs: {
      description: {
        story: "Tests mono color mode with mixed white/black keys and highlight/active states.",
      },
    },
  },
};

// Test label contrast on colored keys
export const LabelContrastTest: Story = {
  args: {
    octaves: 1,
    labelStyle: "letter",
    colorMode: "per-note",
    highlightedNotes: ["C1", "D1", "E1", "F1", "G1", "A1", "B1"],
    activeNotes: ["C#1", "D#1", "F#1", "G#1", "A#1"],
  },
  parameters: {
    docs: {
      description: {
        story: "Tests label contrast with dark text (text-gray-950) on highlighted/active keys.",
      },
    },
  },
};

// Test do-re-mi labels with flats
export const DoReMiWithFlats: Story = {
  args: {
    octaves: 1,
    labelStyle: "do-re-mi",
    showOctaveLabels: true,
    colorMode: "per-note",
    highlightedNotes: ["Db1", "Eb1", "Gb1", "Ab1", "Bb1"],
  },
  parameters: {
    docs: {
      description: {
        story: "Tests do-re-mi labels with flat notation (Re♭, Mi♭, Sol♭, La♭, Si♭).",
      },
    },
  },
};

// Test disabled state without transparency
export const DisabledState: Story = {
  args: {
    octaves: 1,
    labelStyle: "letter",
    colorMode: "per-note",
    highlightedNotes: ["C1", "E1", "G1"],
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Tests disabled state without opacity/transparency effects.",
      },
    },
  },
};

// Color System Verification Stories
export const ColorVerificationC: Story = {
  name: "Color Verification - C Note",
  args: {
    octaves: 1,
    labelStyle: "letter",
    showOctaveLabels: true,
    colorMode: "per-note",
    highlightedNotes: ["C1"],
    activeNotes: [],
  },
  parameters: {
    docs: {
      description: {
        story: "Verifies that C notes display the correct blue color highlighting.",
      },
    },
  },
};

export const ColorVerificationFlat: Story = {
  name: "Color Verification - Flat Notation",
  args: {
    octaves: 1,
    labelStyle: "letter",
    showOctaveLabels: true,
    colorMode: "per-note",
    highlightedNotes: ["Db1", "Eb1"],
    activeNotes: [],
  },
  parameters: {
    docs: {
      description: {
        story: "Verifies that flat notation (Db, Eb) displays correct colors and labels.",
      },
    },
  },
};

export const ColorVerificationMono: Story = {
  name: "Color Verification - Mono Mode",
  args: {
    octaves: 1,
    labelStyle: "letter",
    showOctaveLabels: true,
    colorMode: "mono",
    highlightedNotes: ["C1", "C#1", "D1"],
    activeNotes: [],
  },
  parameters: {
    docs: {
      description: {
        story: "Verifies that mono color mode uses consistent indigo colors for all highlighted notes.",
      },
    },
  },
};

// Practice Mode Visual Feedback Stories
export const PracticeModeBasic: Story = {
  name: "Practice Mode - Basic Feedback",
  args: {
    octaves: 2,
    labelStyle: "letter",
    colorMode: "per-note",
    highlightedNotes: ["C1", "D1", "E1", "F1", "G1", "A1", "B1", "C2"], // C Major scale
    hintNotes: ["E1"], // Next note to play
    activeNotes: [],
    showScaleHighlights: true,
    showNextNoteHint: true,
    showSuccessAnimation: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Shows the practice mode with scale highlights and next note hint. The E1 key should appear with a hint color between highlight and active.",
      },
    },
  },
};

export const PracticeModeWithSuccess: Story = {
  name: "Practice Mode - Success Animation",
  args: {
    octaves: 2,
    labelStyle: "letter",
    colorMode: "per-note",
    highlightedNotes: ["C1", "D1", "E1", "F1", "G1", "A1", "B1", "C2"], // C Major scale
    hintNotes: ["F1"], // Next note to play
    successNotes: ["E1"], // Just played correctly
    activeNotes: [],
    showScaleHighlights: true,
    showNextNoteHint: true,
    showSuccessAnimation: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Shows the success animation on E1 after a correct note press, with F1 showing as the next hint.",
      },
    },
  },
};

export const PracticeModeRingAnimation: Story = {
  name: "Practice Mode - Ring Animation",
  args: {
    octaves: 2,
    labelStyle: "letter",
    colorMode: "per-note",
    highlightedNotes: ["C1", "D1", "E1", "F1", "G1", "A1", "B1", "C2"], // C Major scale
    hintNotes: ["F1"], // Next note to play
    successNotes: ["C1"], // Just played correctly
    activeNotes: [],
    showScaleHighlights: true,
    showNextNoteHint: true,
    showSuccessAnimation: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Shows the ring animation on C1 after a correct note press, with D1 showing as the next hint.",
      },
    },
  },
};

export const PracticeModeNoScaleHighlights: Story = {
  name: "Practice Mode - Hints Only",
  args: {
    octaves: 2,
    labelStyle: "letter",
    colorMode: "per-note",
    highlightedNotes: ["C1", "D1", "E1", "F1", "G1", "A1", "B1", "C2"], // C Major scale (still provided)
    hintNotes: ["G1"], // Next note to play
    activeNotes: [],
    showScaleHighlights: false, // Hide scale highlights
    showNextNoteHint: true,
    showSuccessAnimation: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Shows only the hint for the next note (G1) without displaying the full scale highlights. This is for users who prefer minimal visual guidance.",
      },
    },
  },
};
