<template>
  <div class="navbar bg-base-300 shadow-sm md:px-24 px-2">
    <NuxtLink to="/" class="flex-1">
      <NuxtImg
        src="/logo/logo-white.svg"
        alt="logo"
        class="h-8"
      />
    </NuxtLink>
    <div class="flex-none">
      <ul class="menu menu-horizontal px-1">
        <li><a>Link</a></li>
        <li>
          <details>
            <summary>Parent</summary>
            <ul class="bg-base-100 rounded-t-none p-2">
              <li><a>Link 1</a></li>
              <li><a>Link 2</a></li>
            </ul>
          </details>
        </li>
        <li>
          <AppThemeToggle />
        </li>
      </ul>
    </div>
  </div>
</template>
