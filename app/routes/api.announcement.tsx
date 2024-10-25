import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
  console.log(request.method);

  // Correct `where` clause to use an object with the field to filter by
  const announmentData = await prisma.announcebarlist.findFirst({
    where: {
      shop: "codeconfigstore.myshopify.com", // Assuming 'shop' is the correct field in your schema
    },
  });

  return json({ announmentData });
};
