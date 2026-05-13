import { WillowDark as WillowDarkCore } from '@svar-ui/react-core';
import './WillowDark.css';

export default function WillowDark({ fonts = true, children }) {
  if (children) {
    return <WillowDarkCore fonts={fonts}>{children}</WillowDarkCore>;
  } else {
    return <WillowDarkCore fonts={fonts} />;
  }
}
