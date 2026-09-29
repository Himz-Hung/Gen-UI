// expect: prop "className" is not in the Button contract
// expect: prop "style" is not in the Button contract
import { Button } from '../../ui/Button';
export function ClassName() { return <Button label="ok" className="mt-4" style={{ margin: 4 }} />; }
