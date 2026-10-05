import Image from "next/image";

export default function CategoryIntroduction() {
  return (
    <section className="relative w-full overflow-hidden bg-[#2D2D2D]" style={{ height: "500px" }}>
      <Image
        src="https://picsum.photos/1920/500"
        alt="Category introduction background"
        fill
        quality={100}
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 mx-auto flex flex-col gap-8 px-16 py-14 max-w-[1440px]">
        <h2
          className="text-4xl leading-[1.08] text-white"
          style={{ maxWidth: "840px" }}
        >
          Teknik
        </h2>
        <p
          className="text-base leading-[1.55] text-white/90"
          style={{ maxWidth: "760px" }}
        >
          Lorem ipsum dolor sit amet consectetur. Risus risus vitae quam molestie dui. Rhoncus nec pellentesque tempus sit donec. Vitae massa porttitor integer quisque est augue tristique. Id consequat viverra tincidunt erat a malesuada nisl.
        </p>
      </div>
    </section>
  );
}
