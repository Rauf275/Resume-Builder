import { Component } from 'react';

// Without this, any uncaught error during render (e.g. malformed imported
// data reaching a template that doesn't expect it) unmounts the whole React
// tree and leaves a blank white screen with no way back in short of clearing
// site data. This catches it and offers a way to recover instead.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Resume Builder Pro crashed:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: 24,
            textAlign: 'center',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <h1 style={{ fontSize: 20, margin: 0 }}>Something went wrong</h1>
          <p style={{ maxWidth: 420, color: '#666', margin: 0 }}>
            Resume Builder Pro hit an unexpected error and couldn't continue. This can happen with
            a corrupted or oversized save (for example, a very large photo). Going back to the
            start page won't lose your other data.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              background: '#B4813F',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Back to start
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
