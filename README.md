# 🎹 Pianopal

**PianoPal** is your cheerful chord companion — a beginner-friendly, open-source playground for learning piano chords with color, sound, and joy! 🎶

Whether you're noodling through your first bluesy C7 or looping jazzy chords like a pro, PianoPal helps you **see, hear, and feel** your way through music. With a visual keyboard, playful labels (Do-Re-Mi or C-D-E!), and satisfying sound powered by Tone.js, it's like Guitar Hero met a music theory coloring book. ✨

Made with ❤️ for learners, dreamers, and tinkerers.

## Setup

Make sure to install dependencies:

```bash
# pnpm
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# pnpm
pnpm dev
```

## Production

Build the application for production:

```bash
# pnpm
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```

## 🎨 Icons

This project uses the [Nuxt Icon](https://nuxt.com/modules/icon) module with the [Hugeicons](https://icones.js.org/collection/hugeicons) collection for beautiful, consistent iconography.

### Usage

Use the `<Icon>` component with the `hugeicons:` prefix:

```vue
<template>
  <Icon name="hugeicons:apple-music" class="w-6 h-6" />
  <Icon name="hugeicons:piano" class="w-8 h-8 text-blue-500" />
  <Icon name="hugeicons:music-note-01" />
</template>
```

### Finding Icons

Browse and search for icons at [icones.js.org/collection/hugeicons](https://icones.js.org/collection/hugeicons). Simply copy the icon name and use it with the `hugeicons:` prefix.

### Styling

Icons inherit the current text color by default and can be styled with Tailwind CSS classes:

```vue
<Icon name="hugeicons:heart" class="w-5 h-5 text-red-500 hover:text-red-600" />
```

## 🧪 Testing

This project uses multiple testing approaches for comprehensive quality assurance:

### Unit Tests (Vitest)

Run unit tests for utilities, composables, and components:

```bash
# Run all unit tests
pnpm test:unit

# Run unit tests with UI
pnpm test:unit:ui

# Run unit tests with coverage
pnpm test:unit:coverage

# Run unit tests in watch mode
pnpm test:unit:watch
```

### Visual Tests (Playwright)

Run end-to-end and visual regression tests:

```bash
# Run all visual tests
pnpm test:visual

# Run visual tests with UI
pnpm test:visual:ui

# Run visual tests in debug mode
pnpm test:visual:debug
```

### Storybook

Interactive component development and testing:

```bash
# Start Storybook
pnpm storybook

# Build Storybook
pnpm build-storybook
```
