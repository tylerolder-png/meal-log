import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * At the store or mid-cook, a blank screen from an unhandled render error is
 * the worst possible failure mode. This gives an actual way back. Nothing
 * here is lost either way: every change writes to localStorage before this
 * would ever trigger, not after some in-memory render step.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled error in app tree:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="crash">
          <p className="crash__title">Something broke.</p>
          <p className="crash__note">
            Your list and recipes are already saved &mdash; this is just a display error.
            Reloading should fix it.
          </p>
          <button type="button" className="crash__reload" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
