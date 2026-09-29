// expect: pass
import { Formik } from 'formik';
import { Input } from '../../ui/Input';
export function FormikScreen() {
  return <Formik initialValues={{ email: '' }} onSubmit={() => {}}>{({ values, setFieldValue }) => <Input label="Email" value={values.email} onChange={(v) => setFieldValue('email', v)} />}</Formik>;
}
