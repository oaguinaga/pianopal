import type { Meta, StoryObj } from "@nuxtjs/storybook";

import WhiteKey from "../components/piano/white-key.vue";

const meta: Meta<typeof WhiteKey> = {
  title: "Components/Piano/WhiteKey",
  component: WhiteKey,
  parameters: { layout: "centered" },
  args: {
    note: "C",
    octave: 4,
    disabled: false,
    colorClass: "bg-blue-200",
    labelText: "C4",
    labelColorClass: "text-gray-950",
    ariaLabel: "C4 piano key",
    onPress: () => {},
    onRelease: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof WhiteKey>;

export const Default: Story = {};
