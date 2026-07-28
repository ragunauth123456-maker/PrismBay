import { createFileRoute, notFound } from "@tanstack/react-router";
import { getDemoBySlug } from "~/data/demos";
import { getProductBySlug } from "~/data/products";
import DemoWalkthroughPage from "~/components/DemoWalkthrough";

export const Route = createFileRoute("/demo/$slug")({
  loader: ({ params }) => {
    const demo = getDemoBySlug(params.slug);
    const product = getProductBySlug(params.slug);
    return { demo, product };
  },
  head: ({ loaderData }) => {
    const { demo, product } = loaderData;
    const title = `${demo.productName} — Product Demo | PrismBay`;
    const desc =
      product?.description ??
      `Interactive guided tour of ${demo.productName}. Step-by-step walkthrough covering features, architecture, pricing, and who it's built for.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        {
          property: "og:url",
          content: `https://prismbay.com/demo/${demo.productSlug}`,
        },
        {
          property: "og:image",
          content: `https://prismbay.com/images/products/${demo.productSlug}.png`,
        },
      ],
      links: [
        {
          rel: "canonical",
          href: `https://prismbay.com/demo/${demo.productSlug}`,
        },
      ],
    };
  },
  component: DemoSlugPage,
});

export default function DemoSlugPage() {
  const { demo, product } = Route.useLoaderData();
  const productImage = `/images/products/${demo.productSlug}.png`;
  return (
    <DemoWalkthroughPage demo={demo} productImage={productImage} />
  );
}
