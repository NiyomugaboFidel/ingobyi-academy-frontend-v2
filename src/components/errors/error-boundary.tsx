'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { getErrorMessage } from '@/lib/api/errors';
import { PageError } from './page-error';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallbackTitle?: string;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <PageError
          title={this.props.fallbackTitle ?? 'Something went wrong'}
          message={getErrorMessage(
            this.state.error,
            'Something went wrong in this section. Please try again.',
          )}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
