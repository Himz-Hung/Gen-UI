// Mirrors examples/gallery-flutter/test/widget_test.dart: the same Home screen, the same assertions.
import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HomeScreen } from '../src/screens/HomeScreen';

afterEach(cleanup);

it('the gallery home renders and its demo button works', async () => {
  render(<HomeScreen />);
  expect(screen.getByText('Component gallery')).toBeTruthy();
  expect(screen.getByText('Pressed 0 times')).toBeTruthy();
  await userEvent.click(screen.getByRole('button', { name: 'Primary' }));
  expect(screen.getByText('Pressed 1 times')).toBeTruthy();
  await userEvent.click(screen.getByRole('tab', { name: 'Details' }));
  expect(screen.getByText('Details content')).toBeTruthy();
});
