<template>
  <div class="navbar bg-base-300 shadow-sm md:px-24">
    <NuxtLink to="/" class="flex-1">
      <Logo />
    </NuxtLink>
    <div class="flex gap-x-4">
      <AppThemeToggle />
      <ul class="menu menu-horizontal px-1">
        <AuthButton />
      </ul>
    </div>
  </div>
</template>
