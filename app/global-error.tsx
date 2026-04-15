"use client";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body style={{ background: "#0A0A0A", color: "#fff", margin: 0, fontFamily: "system-ui, sans-serif" }}>
                <div style={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "2rem",
                    textAlign: "center",
                }}>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        Something went wrong
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", marginBottom: "2rem", maxWidth: "400px" }}>
                        An unexpected error occurred. Please try again.
                    </p>
                    <button
                        onClick={() => reset()}
                        style={{
                            background: "#0088ff",
                            color: "#fff",
                            border: "none",
                            padding: "0.75rem 2rem",
                            borderRadius: "9999px",
                            fontWeight: 700,
                            fontSize: "0.875rem",
                            cursor: "pointer",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                        }}
                    >
                        Try Again
                    </button>
                </div>
            </body>
        </html>
    );
}
