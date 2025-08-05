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
      control: { type: "range", min: 1, max: 7, step: 1 },
      description: "Number of octaves to display",
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
  },
  args: {
    octaves: 2,
    theme: "light",
    labelStyle: "none",
    colorMode: "per-note",
    highlightedNotes: [],
    activeNotes: [],
    disabled: false,
    inputEnabled: true,
    showOctaveLabels: false,
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
        story: "Single octave piano to test first key (C) visibility. This story specifically tests the fix for the half-key visibility issue.",
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
