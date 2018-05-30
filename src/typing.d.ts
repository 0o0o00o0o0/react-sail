// typings.d.ts

declare module '*.less' {
  const content: any;
  export default content;
}

declare module 'enquire-js' {
  function enquireScreen(cb: Function, str?: string): void
}

declare module '*.svg'
declare module '*.png'
declare module '*.jpg'