"use client";

/** Outbound resource link that beacons a "click" event before navigating. */
export default function TrackedLink({
  href,
  resourceId,
  subjectId,
  className,
  children,
}: {
  href: string;
  resourceId: string;
  subjectId: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={className}
      onClick={() => {
        try {
          navigator.sendBeacon(
            "/api/events",
            new Blob([JSON.stringify({ kind: "click", resource_id: resourceId, subject_id: subjectId })], {
              type: "application/json",
            }),
          );
        } catch {
          // best effort — never block navigation
        }
      }}
    >
      {children}
    </a>
  );
}
