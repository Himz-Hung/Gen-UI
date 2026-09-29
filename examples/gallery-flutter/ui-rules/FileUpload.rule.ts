import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'FileUpload', category: 'input',
  purpose: 'Choose one or more files to attach, and see and remove what was chosen.',
  props: {
    label: t.text(),
    buttonLabel: t.text().desc('text of the choose button'),
    accept: t.string().opt().desc('file types, e.g. "image/*,.pdf"'),
    multiple: t.boolean().def(false),
    files: t.array(t.object({ name: t.string(), sizeLabel: t.string().desc('pre-formatted, e.g. "1.2 MB"') })).def([]),
    hint: t.text().opt(),
    error: t.text().opt(),
    disabled: t.boolean().def(false),
  },
  events: { select: t.void().desc('the user chose files; the platform file objects are handed to the handler in code'), remove: t.string().desc('name of the file to remove') },
  states: ['empty', 'hasFiles', 'dragOver', 'disabled', 'error'],
  rules: [
    'Shows a choose button; on pointer devices the whole area also accepts dropped files.',
    'Each chosen file is a row with name, sizeLabel and a remove control named "Remove <name>".',
    'multiple=false replaces the chosen file; the component never uploads by itself.',
  ],
  a11y: ['The choose button is a real button; the file list is a list.'],
  platform: { react: ['a hidden <input type="file"> triggered by the button'], flutter: ['file picking through the platform picker in the handler; this widget only renders and emits'] },
  examples: [{ label: 'Card photos', buttonLabel: 'Choose photos', accept: 'image/*', multiple: true, files: [{ name: 'front.jpg', sizeLabel: '1.2 MB' }] }],
});
