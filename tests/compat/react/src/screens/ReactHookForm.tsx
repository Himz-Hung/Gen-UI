// expect: pass
import { FormProvider, Controller, useForm } from 'react-hook-form';
import { Input } from '../../ui/Input';
export function ReactHookForm() {
  const form = useForm<{ email: string }>();
  return <FormProvider {...form}><Controller name="email" control={form.control} render={({ field, fieldState }) => <Input label="Email" value={field.value} onChange={field.onChange} error={fieldState.error?.message} />} /></FormProvider>;
}
