import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'PinInput', category: 'input',
  purpose: 'One-time code or PIN split into boxes (SMS verification, 2FA).',
  props: {
    label: t.text(),
    value: t.string(),
    length: t.number().def(6),
    type: t.enum(['numeric', 'alphanumeric']).def('numeric'),
    mask: t.boolean().def(false).desc('hide characters, for PINs'),
    error: t.text().opt(),
    disabled: t.boolean().def(false),
  },
  events: { change: t.string(), complete: t.string().desc('all boxes filled') },
  states: ['default', 'focused', 'complete', 'disabled', 'error'],
  rules: [
    'Typing a character moves focus to the next box; Backspace in an empty box moves back and clears it.',
    'Pasting a full code fills every box and emits complete.',
    'The code can be filled automatically from an SMS where the platform supports it.',
    'Boxes are 44×52 with tokens.radius.md; error turns every border tokens.color.danger and shows the text below.',
  ],
  a11y: ['Exposed as one field named by label that accepts the whole code (not length separate fields); error is announced.'],
  composition: { canContain: [] },
  platform: { react: ['one <input autocomplete="one-time-code" inputMode="numeric"> drawn as boxes'], flutter: ['one m.TextField (autofillHints: oneTimeCode) drawn as boxes'] },
  examples: [{ label: 'Verification code', value: '', length: 6 }],
});
