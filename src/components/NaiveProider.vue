<template>
  <NLoadingBarProvider>
    <NDialogProvider>
      <NNotificationProvider>
        <NMessageProvider>
          <slot />
          <NaiveProviderContent />
        </NMessageProvider>
      </NNotificationProvider>
    </NDialogProvider>
  </NLoadingBarProvider>
</template>
