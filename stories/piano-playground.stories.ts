import type { Meta, StoryObj } from "@storybook/vue3";

import PianoPlayground from "~/components/piano-playground.vue";

const meta: Meta<typeof PianoPlayground> = {
  title: "Components/PianoPlayground",
  component: PianoPlayground,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A wrapper component around VisualPiano that adds computer keyboard input support with multi-octave handling and polyphony.",
      },
    },
  },
  argTypes: {
    octaveRange: {
      control: { type: "select" },
      options: [1, 2, 3, 4, 5, 6, 7],
      description: "Number of octaves to display (1-7)",
    },
    startOctave: {
      control: { type: "select" },
      options: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      description: "Starting octave (0-8)",
    },
    showKeyboardGuide: {
      control: "boolean",
      description: "Display keyboard mapping guide",
    },
    labelStyle: {
      control: { type: "select" },
      options: ["letter", "do-re-mi", "none"],
      description: "Note label style",
    },
    theme: {
      control: { type: "select" },
      options: ["light", "dark"],
      description: "Theme for the piano",
    },
    colorMode: {
      control: { type: "select" },
      options: ["per-note", "mono"],
      description: "Color mode for note highlighting",
    },
    showOctaveLabels: {
      control: "boolean",
      description: "Show octave numbers in labels",
    },
    highlightedNotes: {
      control: "object",
      description: "Array of notes to highlight",
    },
  },
  args: {
    octaveRange: 3,
    startOctave: 3,
    showKeyboardGuide: true,
    labelStyle: "letter",
    theme: "light",
    colorMode: "per-note",
    showOctaveLabels: false,
    highlightedNotes: [],
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    octaveRange: 3,
    startOctave: 3,
    showKeyboardGuide: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Default PianoPlayground with 3 octaves starting from octave 3. Click the component and press keyboard keys to play!",
      },
    },
  },
};

// Compact single octave
export const CompactSingleOctave: Story = {
  args: {
    octaveRange: 1,
    startOctave: 4,
    showKeyboardGuide: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Compact single octave view starting from octave 4. Perfect for focused practice on a specific octave.",
      },
    },
  },
};

// Full keyboard range
export const FullKeyboard: Story = {
  args: {
    octaveRange: 7,
    startOctave: 1,
    showKeyboardGuide: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Full 7-octave keyboard range. Keyboard guide hidden to focus on the piano interface.",
      },
    },
  },
};

// With highlighted notes
export const WithHighlightedNotes: Story = {
  args: {
    octaveRange: 3,
    startOctave: 3,
    showKeyboardGuide: true,
    highlightedNotes: ["C4", "E4", "G4", "C5"],
  },
  parameters: {
    docs: {
      description: {
        story: "PianoPlayground with highlighted C major chord notes. The highlighted notes show in different colors.",
      },
    },
  },
};

// Dark theme
export const DarkTheme: Story = {
  args: {
    octaveRange: 3,
    startOctave: 3,
    showKeyboardGuide: true,
    theme: "dark",
  },
  parameters: {
    docs: {
      description: {
        story: "PianoPlayground in dark theme. All colors and styling adapt to the dark theme.",
      },
    },
  },
};

// Mono color mode
export const MonoColorMode: Story = {
  args: {
    octaveRange: 3,
    startOctave: 3,
    showKeyboardGuide: true,
    colorMode: "mono",
    highlightedNotes: ["C4", "E4", "G4"],
  },
  parameters: {
    docs: {
      description: {
        story: "PianoPlayground in mono color mode. All highlighted notes use the same color family with different intensities.",
      },
    },
  },
};

// Do-Re-Mi labels
export const DoReMiLabels: Story = {
  args: {
    octaveRange: 3,
    startOctave: 3,
    showKeyboardGuide: true,
    labelStyle: "do-re-mi",
  },
  parameters: {
    docs: {
      description: {
        story: "PianoPlayground with Do-Re-Mi notation labels. Useful for solfège practice.",
      },
    },
  },
};

// With octave labels
export const WithOctaveLabels: Story = {
  args: {
    octaveRange: 2,
    startOctave: 4,
    showKeyboardGuide: true,
    showOctaveLabels: true,
  },
  parameters: {
    docs: {
      description: {
        story: "PianoPlayground with octave numbers displayed in labels. Shows notes like 'C4', 'D4', etc.",
      },
    },
  },
};

// Interactive demo
export const InteractiveDemo: Story = {
  args: {
    octaveRange: 3,
    startOctave: 3,
    showKeyboardGuide: true,
    highlightedNotes: ["C4", "E4", "G4"],
  },
  parameters: {
    docs: {
      description: {
        story: "Interactive demo with highlighted C major chord. Click the component, then press 'A' (C4), 'D' (E4), and 'G' (G4) to play the chord!",
      },
    },
  },
};
