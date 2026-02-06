import React, { Component } from "react";
import type { ReactNode } from "react";
import { Link } from "wouter";

type BookingRenderErrorBoundaryProps = {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  fallbackHref?: string;
  fallbackLinkLabel?: string;
};

type BookingRenderErrorBoundaryState = {
  hasError: boolean;
};

export default class BookingRenderErrorBoundary extends Component<
  BookingRenderErrorBoundaryProps,
  BookingRenderErrorBoundaryState
> {
  state: BookingRenderErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("[booking] Render error.", error);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const {
      fallbackTitle = "Book this tour",
      fallbackMessage = "We hit a snag while loading the booking page. You can head back to the tour details and try again.",
      fallbackHref = "/tours",
      fallbackLinkLabel = "Back to tour details",
    } = this.props;

    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">{fallbackTitle}</h1>
        <p className="mt-4 text-sm text-[#405040]">{fallbackMessage}</p>
        <div className="mt-6">
          <Link href={fallbackHref}>
            <a className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#294129]">
              {fallbackLinkLabel}
            </a>
          </Link>
        </div>
      </main>
    );
  }
}
