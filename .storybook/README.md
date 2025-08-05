# Storybook Organization & Configuration

This directory contains the Storybook configuration and documentation files for the PianoPal project, organized according to Storybook best practices.

## 📁 Directory Structure

```
.storybook/
├── README.md                 # This documentation
├── main.ts                   # Storybook configuration
├── preview.ts               # Global decorators and parameters
├── Configure.mdx            # Configuration documentation
└── assets/                  # Storybook-specific assets
    ├── accessibility.png
    ├── docs.png
    ├── figma-plugin.png
    └── ...                  # Template assets for documentation
```

## 🗂️ Story Organization

### Current Structure

Stories are **co-located** with components, following the pattern:

```
components/
├── visual-piano.vue         # Component implementation
├── visual-piano.stories.ts  # Component stories
├── auth-button.vue
└── app/
    ├── nav-bar.vue
    └── theme-toggle.vue
```

### Why Co-location?

Co-locating stories with components provides several benefits:

- **Easier maintenance**: Related files stay together
- **Better discoverability**: Stories are next to the components they test
- **Simpler imports**: Shorter relative import paths
- **Atomic organization**: Each component "owns" its stories

### Alternative: Dedicated Stories Directory

If the project grows larger, stories can be moved to a dedicated structure:

```
stories/
├── visual-piano.stories.ts
├── auth-button.stories.ts
└── app/
    ├── nav-bar.stories.ts
    └── theme-toggle.stories.ts
```

## 🧹 Cleanup Performed

### Removed Template Files

The following Storybook initialization template files were removed from `components/`:

- ❌ `MyNuxtWelcome.stories.ts` - Example story template
- ❌ `MyWelcome.vue` - Example component template
- ❌ `header.css` - Example CSS template
- ❌ `button.css` - Example CSS template
- ❌ `page.css` - Example CSS template

### Relocated Files

- ✅ `Configure.mdx` → `.storybook/Configure.mdx`
- ✅ `components/assets/` → `.storybook/assets/`

### Updated Configuration

- Updated `main.ts` to include `.storybook/` directory for MDX files
- Maintained component story detection in `components/` directory

## 📖 Documentation Strategy

### Introduction Pages

The project uses MDX documentation pages for:

- **Configure.mdx**: Setup and configuration guidance
- **Component Documentation**: Auto-generated from stories using Autodocs

### Story Categories

Stories are organized by functionality:

- **Visual Piano**: Core interactive component stories
- **UI Components**: General interface elements
- **App Components**: Application-specific components

## 🛠️ Configuration Details

### Main Configuration (`main.ts`)

```typescript
const config: StorybookConfig = {
  stories: [
    "./**/*.mdx", // MDX docs in .storybook/
    "../components/**/*.stories.@(js|jsx|ts|tsx|mdx)" // Component stories
  ],
  addons: [
    "@chromatic-com/storybook", // Visual testing
    "@storybook/addon-docs", // Documentation
    "@storybook/addon-a11y", // Accessibility testing
    "@storybook/addon-vitest" // Unit testing integration
  ],
  framework: {
    name: "@storybook-vue/nuxt" // Nuxt 3 + Vue 3 support
  }
};
```

### Preview Configuration (`preview.ts`)

Defines global decorators, parameters, and controls for all stories.

## 🚀 Running Storybook

### Development

```bash
pnpm storybook
```

### Build

```bash
pnpm build-storybook
```

### Testing Integration

- **Visual Tests**: Chromatic addon for screenshot comparisons
- **Accessibility Tests**: Built-in a11y testing with addon-a11y
- **Unit Tests**: Vitest integration for component testing

## 📝 Adding New Stories

### For New Components

1. Create your component in `components/`
2. Create a co-located `.stories.ts` file
3. Use consistent story structure:
   ```typescript
   export default {
     title: "Category/ComponentName",
     component: YourComponent,
   } satisfies Meta<typeof YourComponent>;
   ```

### Story Types to Include

- **Default**: Basic component showcase
- **Playground**: All props connected to controls
- **Feature Stories**: Different states and variants
- **Recipe Stories**: Real-world usage examples

## 🎨 Best Practices

### Naming Convention

- **Components**: PascalCase (`VisualPiano`)
- **Stories**: PascalCase with descriptive names (`DefaultPiano`, `HighlightedNotes`)
- **Categories**: Use forward slashes for grouping (`UI/Buttons`, `Features/Piano`)

### Story Organization

1. **Overview**: Component documentation
2. **Playground**: Interactive controls
3. **States**: Various component states
4. **Examples**: Real-world usage scenarios

### Asset Management

- Place Storybook-specific assets in `.storybook/assets/`
- Use relative imports for component assets
- Optimize images for documentation use

This organization follows Storybook best practices and provides a scalable foundation for component documentation and testing.
