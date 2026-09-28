import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'FormField', category: 'form',
  purpose: 'One label, hint and error shared by several related controls (an address, a date range, a phone with country code). A single control already has its own label — do not wrap it.',
  props: {
    label: t.text(),
    hint: t.text().opt(),
    error: t.text().opt().desc('when present the group is in error state and this text is shown'),
    required: t.boolean().def(false),
    direction: t.enum(['vertical', 'horizontal']).def('vertical').desc('how the controls inside are laid out'),
  },
  children: true,
  states: ['default', 'error', 'disabled'],
  rules: [
    'Label above the controls, hint or error below them; error replaces hint and uses tokens.color.danger.',
    'required=true shows the same marker as Input.',
    'Controls inside keep their own labels, rendered smaller, or visually hidden when the group label is enough.',
    'Gap between controls tokens.spacing[3].',
  ],
  a11y: ['Group semantics (fieldset / legend) labelled by label; error is announced and described on every control.'],
  composition: { canContain: ['Input', 'Textarea', 'Select', 'NumberInput', 'DatePicker', 'Slider', 'Switch', 'Checkbox', 'RadioGroup', 'Rating', 'FileUpload', 'Inline', 'Stack'], cannotBeInside: ['FormField'] },
  platform: { react: ['<fieldset> + <legend>; aria-describedby to the hint / error on each control'], flutter: ['Column with the label Text and a Semantics(container: true, label: …) wrapper'] },
  examples: [{ label: 'Shipping address', required: true }, { label: 'Stay', direction: 'horizontal', hint: 'Check-in and check-out' }],
});
