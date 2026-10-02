import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative h-[80vh] w-full overflow-hidden">
     <Image
        src="https://picsum.photos/1920/500"
        alt="Hero Background"
        fill
        quality={100}
        priority
        className="absolute inset-0 z-0 object-cover"
      />
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 z-1 bg-linear-to-l from-black/60 to-black/20"></div>
      <div className="relative z-10 flex flex-col items-start justify-center h-full px-6 text-center text-white gap-2 pl-15">
        <h1 className="text-5xl">Nordisk Form</h1>
        <p className="text-2xl mb-8 wrap-normal w-3xl text-left">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
          luctus urna sed urna tempor, a fermentum mi consequat. Etiam non velit
          a nisi commodo consectetur.
        </p>
      </div>
    </section>
  );
}
