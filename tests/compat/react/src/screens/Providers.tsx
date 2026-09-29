// expect: pass
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ApolloProvider } from '@apollo/client';
import { SWRConfig } from 'swr';
import { IntlProvider } from 'react-intl';
import { Button } from '../../ui/Button';
declare const store: never, client: never, apollo: never;
export function Providers() {
  return <Provider store={store}><QueryClientProvider client={client}><ApolloProvider client={apollo}><SWRConfig value={{}}><IntlProvider locale="en"><Button label="ok" /></IntlProvider></SWRConfig></ApolloProvider></QueryClientProvider></Provider>;
}
