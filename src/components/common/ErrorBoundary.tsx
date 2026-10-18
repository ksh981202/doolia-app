import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-md p-6 text-center border border-slate-200">
            <div className="text-4xl mb-4" role="img" aria-label="warning">
              ⚠️
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">
              페이지를 불러오는 중 문제가 발생했습니다
            </h1>
            <p className="text-sm text-slate-500 mb-6">
              일시적인 오류일 수 있으니 페이지를 새로고침해 주세요.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
              >
                새로고침
              </button>
              <a
                href="/"
                className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors inline-block"
              >
                홈으로 이동
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
