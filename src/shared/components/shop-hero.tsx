import Image from "next/image";

export function ShopHero() {
  return (
    <div className="relative aspect-[3/2] overflow-hidden bg-[var(--brand-600)]">
      <Image
        alt="Shop today, pay later using mutual funds."
        className="object-cover"
        fill
        priority
        sizes="(max-width: 500px) 100vw, 500px"
        src="/images/shop-hero.webp"
      />
    </div>
  );
}
