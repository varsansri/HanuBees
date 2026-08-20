import Link from "next/link";
import { DesignPreview } from "@/components/design-preview";
import { ArrowRight } from "@/components/site-shell";
import type { DesignItem } from "@/lib/design-library";

export function DesignCard({ design }: { design: DesignItem }) {
  return (
    <article className="library-card">
      <div className="library-card__preview">
        <DesignPreview
          kind={design.preview}
          compact
          label={`${design.number} / ${design.component}`}
        />
      </div>
      <div className="library-card__body">
        <div className="library-card__meta">
          <span>Free build</span>
          <span>{design.buildTime}</span>
        </div>
        <h3>
          <Link href={`/design/${design.slug}`}>{design.shortTitle}</Link>
        </h3>
        <p>{design.description}</p>
        <Link className="text-link" href={`/design/${design.slug}`}>
          Preview &amp; build <ArrowRight />
        </Link>
      </div>
    </article>
  );
}
