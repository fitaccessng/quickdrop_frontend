export const SectionHeading = ({ eyebrow, title, description }) => (
  <div className="max-w-2xl">
    <p className="text-sm uppercase tracking-[0.3em] text-black">{eyebrow}</p>
    <h2 className="mt-4 text-3xl font-bold tracking-tight text-black sm:text-4xl">{title}</h2>
    <p className="mt-4 text-base leading-7 text-black">{description}</p>
  </div>
);
