import { Component } from 'react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="glass-card" style={{ margin: 32, textAlign: 'center' }}>
                    <h2 style={{ color: 'var(--accent-rose)', marginBottom: 12 }}>Something went wrong</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </p>
                    <button className="btn btn-primary" onClick={() => this.setState({ hasError: false, error: null })}>
                        Try Again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
