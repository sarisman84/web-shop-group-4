import Image from "next/image";

const categories = [
  { label: "Tech & Electronics", active: true },
  { label: "Fashion & Accessories", active: false },
  { label: "Home & Kitchen", active: false },
  { label: "Beauty & Care", active: false },
];

export default function CategoryIntroduction() {
  return (
    <section className="relative w-full overflow-hidden bg-[#2D2D2D]">
      <Image
        src="https://picsum.photos/1920/500"
        alt="Category introduction background"
        fill
        quality={100}
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-16 pt-14 pb-10">
        <h2 className="text-4xl font-normal text-white">Kläder</h2>
        <p className="mt-3 max-w-2xl text-base leading-[1.55] text-white/90">
          Upptäck säsongens nyheter inom herr- och dammode. Från tidlösa klassiker till
          moderna favoriter – hitta din stil hos Nordisk Form.
        </p>

        <div className="mt-6 flex flex-row gap-2">
          {categories.map((cat) => (
            <button
              key={cat.label}
              type="button"
              className={`flex h-[172px] flex-1 flex-col items-center justify-center gap-3 rounded-[10px] px-4 ${
                cat.active
                  ? "bg-[#2D2D2D] text-white"
                  : "border border-[#DDE2DF] bg-[#F7F7F4] text-[#17201E]"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.38 3.46L16 2 12 5.5 8 2 3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
              </svg>
              <span className="text-sm font-semibold">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
