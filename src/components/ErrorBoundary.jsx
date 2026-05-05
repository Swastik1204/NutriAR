import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, info) {
    if (typeof this.props.onError === 'function') {
      this.props.onError(error, info);
    }
  }

  handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert">
          <div className="error-boundary__panel">
            <p className="error-boundary__eyebrow">NutriAR crashed</p>
            <h1>Something went wrong</h1>
            <p className="error-boundary__copy">
              The scanner hit an unexpected error. You can reload the app to try again.
            </p>
            <button className="error-boundary__button" type="button" onClick={this.handleRetry}>
              Retry App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
