import type { Meta, StoryObj } from "@nuxtjs/storybook";

import BlackKey from "../components/piano/black-key.vue";

const meta: Meta<typeof BlackKey> = {
  title: "Components/Piano/BlackKey",
  component: BlackKey,
  parameters: { layout: "centered" },
  args: {
    note: "C#",
    octave: 4,
    disabled: false,
    whiteKeyWidth: 48,
    colorClass: "bg-blue-900",
    labelText: "C#4",
    labelColorClass: "text-white",
    ariaLabel: "C#4 piano key",
    getBlackKeyPosition: () => ({ left: "50%", width: "24px", transform: "translateX(-50%)" }),
    onPress: () => {},
    onRelease: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof BlackKey>;

export const Default: Story = {};
