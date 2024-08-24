import { useBreakpoint } from 'use-breakpoint';
import MobileApp from './AppMobile';
import DesktopApp from './DesktopApp';

const BREAKPOINTS = { mobile: 0, desktop: 440 };
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
export default function App() {
  const { breakpoint } = useBreakpoint(BREAKPOINTS);
  return component(breakpoint);
}
