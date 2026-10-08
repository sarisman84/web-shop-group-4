import Image from "next/image";

export interface CategoryIntroduction {
  title: string;
  subtitle: string;
  image?: string;
}

// Background shown when no category is selected, or when the selected
// category has no image of its own (T100, issue #149).
export const CATEGORY_INTRO_FALLBACK_IMAGE = "https://picsum.photos/1920/500";

export default function CategoryIntroduction({ title, subtitle, image }: CategoryIntroduction) {
  const background = image?.trim() ? image : CATEGORY_INTRO_FALLBACK_IMAGE;

  return (
    <section className="category-intro">
      <Image
        src={background}
        alt="Category introduction background"
        fill
        quality={100}
        priority
        className="object-cover"
      />
      <div className="category-intro-overlay" />

      <div className="relative z-10 w-full px-16">
        <div className="category-intro-container mx-auto w-full max-w-content">
          <h2
            className="category-intro-title"
            style={{ maxWidth: "840px" }}
          >
            {title}
          </h2>
          <p
            className="category-intro-body"
            style={{ maxWidth: "760px" }}
          >
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}
