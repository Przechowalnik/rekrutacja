import { Component, type ReactNode } from "react";

type T_ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type T_ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<
  T_ErrorBoundaryProps,
  T_ErrorBoundaryState
> {
  constructor(properties: T_ErrorBoundaryProps) {
    super(properties);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): T_ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }

    return this.props.children;
  }
}
