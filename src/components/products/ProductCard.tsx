import Image from "next/image";
import type { DbProduct } from "@/types";

interface ProductCardProps {
  product: DbProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const categoryLabel: Record<string, string> = {
    top: "상의", bottom: "하의", outer: "아우터", accessory: "액세서리",
  };

  return (
    <div className="group relative rounded-2xl border border-border bg-white overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
      <div className="relative h-48 bg-muted overflow-hidden">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute bottom-3 left-3">
          <span className="rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {product.fit_type}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">
              {categoryLabel[product.category] ?? product.category}
            </p>
            <h3 className="font-semibold text-sm leading-snug">{product.name}</h3>
          </div>
          <p className="text-sm font-bold text-primary flex-shrink-0">
            {product.price.toLocaleString()}원
          </p>
        </div>

        <button className="mt-3 w-full rounded-lg bg-primary/10 py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
          구매하기
        </button>
      </div>
    </div>
  );
}
