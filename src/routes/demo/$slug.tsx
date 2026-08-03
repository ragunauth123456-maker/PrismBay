import { createFileRoute, notFound } from "@tanstack/react-router";
import { getDemoBySlug } from "~/data/demos";
import { getProductBySlug } from "~/data/products";
import DemoWalkthroughPage from "~/components/DemoWalkthrough";
import { breadcrumbListScript, twitterMeta } from "~/utils/seo";
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
    const videoUrl = `/videos/demos/${demo.productSlug}.webm`;
    const canonicalUrl = `https://www.prismbayai.com/demo/${demo.productSlug}`;
    const imageUrl = `https://www.prismbayai.com/images/products/${demo.productSlug}.png`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        {
          property: "og:url",
          content: canonicalUrl,
        },
        {
          property: "og:image",
          content: imageUrl,
        },
        {
          property: "og:video",
          content: `https://www.prismbayai.com${videoUrl}`,
        },
        {
          property: "og:video:type",
          content: "video/webm",
        },
        {
          property: "og:video:width",
          content: "1280",
        },
        {
          property: "og:video:height",
          content: "720",
        },
        ...twitterMeta(title, desc, imageUrl),
      ],
      links: [
        {
          rel: "canonical",
          href: canonicalUrl,
        },
      ],
      scripts: [
        breadcrumbListScript([
          { name: "Home", url: "https://www.prismbayai.com" },
          { name: "Demos", url: "https://www.prismbayai.com/demo" },
          { name: `${demo.productName} Demo`, url: canonicalUrl },
        ]),
      ],
    };
  },
  component: DemoSlugPage,
});
export default function DemoSlugPage() {
  const { demo, product } = Route.useLoaderData();
  const productImage = `/images/products/${demo.productSlug}.png`;
  const videoUrl = demo.videoUrl ?? `/videos/demos/${demo.productSlug}.webm`;
  return (
    <DemoWalkthroughPage demo={{ ...demo, videoUrl }} productImage={productImage} />
  );
}
