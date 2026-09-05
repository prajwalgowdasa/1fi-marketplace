"use client";

import type { Product } from "../domain/types";

export type VariantSelection = Record<string, string>;

type VariantSelectorProps = {
  product: Product;
  value: VariantSelection;
  onChange: (selection: VariantSelection) => void;
};

function title(attribute: string) {
  return attribute.charAt(0).toUpperCase() + attribute.slice(1);
}

export function VariantSelector({ product, value, onChange }: VariantSelectorProps) {
  const attributes = [...new Set(product.variants.flatMap((variant) => Object.keys(variant.attributes)))];
  return (
    <section aria-label="Product options" className="space-y-5">
      {attributes.map((attribute) => {
        const options = [...new Set(product.variants.map((variant) => variant.attributes[attribute]).filter((option): option is string => Boolean(option)))];
        return (
          <fieldset key={attribute}>
            <legend className="text-sm font-semibold text-[var(--ink-900)]">{title(attribute)}</legend>
            <div aria-label={title(attribute)} className="mt-3 flex flex-wrap gap-2" role="radiogroup">
              {options.map((option) => {
                const isAvailable = product.variants.some((variant) => variant.stockStatus === "in_stock" && variant.attributes[attribute] === option && Object.entries(value).every(([key, selected]) => key === attribute || variant.attributes[key] === selected));
                const selected = value[attribute] === option;
                return (
                  <label className={`flex min-h-11 cursor-pointer items-center rounded-xl border px-4 text-sm font-medium text-[var(--ink-900)] ${selected ? "border-[var(--brand-500)] bg-[var(--brand-050)]" : "border-[var(--line)]"} ${!isAvailable ? "cursor-not-allowed opacity-45" : ""}`} key={option}>
                    <input aria-disabled={!isAvailable} checked={selected} className="sr-only" disabled={!isAvailable} name={`variant-${attribute}`} onChange={() => onChange({ ...value, [attribute]: option })} type="radio" value={option} />
                    {option}
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </section>
  );
}
