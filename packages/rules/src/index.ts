// Shipped contracts. `fw init` copies the *.rule.ts files into the project's ui-rules/.
export const SHIPPED = [
  // layout
  'Stack', 'Inline', 'Grid', 'Container', 'Spacer', 'Divider', 'PullToRefresh', 'SectionHeader', 'InfiniteScroll',
  // typography
  'Text', 'Heading',
  // action
  'Button', 'IconButton', 'Link',
  // input
  'Input', 'Textarea', 'Select', 'SearchBox', 'Checkbox', 'RadioGroup', 'Switch', 'Slider', 'NumberInput', 'DatePicker', 'FileUpload', 'Rating', 'Combobox', 'ChipGroup', 'PinInput',
  // form
  'FormField',
  // data
  'Card', 'Badge', 'Tag', 'Stat', 'List', 'ListItem', 'Table', 'Avatar', 'Accordion', 'DescriptionList', 'Timeline', 'SwipeActions',
  // media
  'Image', 'Icon', 'Carousel', 'Video',
  // feedback
  'EmptyState', 'Skeleton', 'Alert', 'Toast', 'Spinner', 'ProgressBar', 'Tooltip',
  // navigation
  'Pagination', 'Tabs', 'TopBar', 'BottomNav', 'SegmentedControl', 'Sidebar', 'Breadcrumbs', 'Stepper',
  // overlay
  'Modal', 'Drawer', 'Menu', 'ConfirmDialog',
  // chart
  'LineChart', 'BarChart', 'PieChart',
] as const;
