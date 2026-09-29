import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Video', category: 'media',
  purpose: 'Plays a video file with the platform controls.',
  props: {
    src: t.string(),
    label: t.text().desc('accessible name, e.g. "Unboxing video"'),
    poster: t.string().opt(),
    ratio: t.enum(['16:9', '4:3', '1:1', '9:16']).def('16:9'),
    controls: t.boolean().def(true),
    autoplay: t.boolean().def(false).desc('only ever muted'),
    loop: t.boolean().def(false),
  },
  events: { ended: t.void() },
  states: ['loading', 'ready', 'playing', 'paused', 'error'],
  rules: [
    'Keeps its ratio before and after load, like Image.',
    'autoplay=true starts muted and respects reduced-motion settings (then it does not autoplay).',
    'error shows a neutral placeholder with a retry control.',
  ],
  a11y: ['Named by label; controls are keyboard operable; captions are shown when the file has them.'],
  composition: { canContain: [] },
  platform: { react: ['<video playsInline>'], flutter: ['the video_player package inside an AspectRatio (a dependency the project adds)'] },
  examples: [{ src: 'https://example.com/unboxing.mp4', label: 'Unboxing video', poster: 'https://example.com/poster.jpg' }],
});
