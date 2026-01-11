"use client";

import { trackEvent } from "@/lib/analytics";
import React from "react";

interface TrackedLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    eventName: string;
    metadata?: Record<string, any>;
}

export default function TrackedLink({ eventName, metadata, children, ...props }: TrackedLinkProps) {
    const handleClick = () => {
        trackEvent({
            type: "click",
            path: window.location.pathname,
            metadata: {
                ...metadata,
                label: eventName,
            },
        });
    };

    return (
        <a {...props} onClick={handleClick}>
            {children}
        </a>
    );
}
