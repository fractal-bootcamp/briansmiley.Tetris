import { useBreakpoint } from 'use-breakpoint';
import MobileApp from './AppMobile';
import DesktopApp from './DesktopApp';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const BREAKPOINTS = { mobile: 0, desktop: 440 };
const component = (breakpoint: string | null) => {
  switch (breakpoint) {
    case 'mobile':
      return <MobileApp />;
    case 'desktop':
      return <DesktopApp />;
    default:
      return <></>;
  }
};
const queryClient = new QueryClient();

export default function App() {
  const { breakpoint } = useBreakpoint(BREAKPOINTS);
  return (
    <QueryClientProvider client={queryClient}>
      {component(breakpoint)}
    </QueryClientProvider>
  );
}
