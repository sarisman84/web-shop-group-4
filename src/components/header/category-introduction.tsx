import Image from "next/image";

export interface CategoryIntroduction {
  title: string;
  subtitle: string;
}

export default function CategoryIntroduction({ title, subtitle }: CategoryIntroduction) {
  return (
    <section className="category-intro">
      <Image
        src="https://picsum.photos/1920/500"
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
