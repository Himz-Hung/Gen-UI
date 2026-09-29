// expect: pass
import { useForm } from '@tanstack/react-form';
import { Input } from '../../ui/Input';
export function TanstackForm() {
  const form = useForm({ defaultValues: { email: '' } });
  return <form.Field name="email" children={(field) => <Input label="Email" value={field.state.value} onChange={field.handleChange} />} />;
}
