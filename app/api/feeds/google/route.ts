import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/db";
import { getProductModel } from "@/lib/models/Product";
import { getProductSlug } from "@/utils/productUtils";

const SITE_URL = "https://firgomart.com";

export async function GET() {
  try {
    const conn = await connectDB();
    const Product = getProductModel(conn);

    const products = await Product.find({
      status: { $nin: ["draft", "inactive"] },
    }).lean();

    const rssItems = products
      .map((product: any) => {
        const slug = getProductSlug(product.name, product._id.toString());
        const url = `${SITE_URL}/product/${slug}`;
        const description =
          product.description ||
          product.about ||
          `Buy ${product.name} at FirgoMart.`;
        const price = product.price || 0;
        const currency = product.currencyCode || "INR";
        const availability =
          (product.stock ?? 0) > 0 ? "in_stock" : "out_of_stock";
        const brand = product.brand || "FirgoMart";
        const image = product.image?.startsWith("http")
          ? product.image
          : `${SITE_URL}${product.image}`;

        return `
        <item>
          <title><![CDATA[${product.name}]]></title>
          <link>${url}</link>
          <description><![CDATA[${description}]]></description>
          <g:id>${product._id}</g:id>
          <g:price>${price} ${currency}</g:price>
          <g:availability>${availability}</g:availability>
          <g:image_link>${image}</g:image_link>
          <g:brand><![CDATA[${brand}]]></g:brand>
          <g:condition>new</g:condition>
          <g:mpn>${product._id}</g:mpn>
          <g:sku>${product._id}</g:sku>
          <g:product_type><![CDATA[${product.category || "General"}]]></g:product_type>
          <g:google_product_category><![CDATA[${product.category || "General"}]]></g:google_product_category>
        </item>`;
      })
      .join("");

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>FirgoMart Product Feed</title>
    <link>${SITE_URL}</link>
    <description>Product feed for Google Merchant Center (Merchant ID: 10617649724)</description>
    ${rssItems}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("Failed to generate product feed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
