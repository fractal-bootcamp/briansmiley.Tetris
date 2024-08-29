import { useBreakpoint } from 'use-breakpoint';
import { BREAKPOINTS } from '../App';
import MobileControls from './MobileControls';
import DesktopControls from './DesktopControls';

export default function ControlsInfo() {
  const { breakpoint } = useBreakpoint(BREAKPOINTS);
  const controls = () => {
    switch (breakpoint) {
      case 'mobile':
        return <MobileControls />;
      case 'desktop':
        return <DesktopControls />;
      default:
        return <></>;
    }
  };
  return controls();
}
