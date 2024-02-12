import { getFrameMetadata } from "@coinbase/onchainkit";
import type { Metadata } from "next";

// Step 2. Use getFrameMetadata to shape your Frame metadata
const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: "We love BOAT",
    },
  ],
  image: "https://build-onchain-apps.vercel.app/release/v-0-17.png",
  postUrl: `https://frame-five-sigma.vercel.app/`,
});

// Step 3. Add your metadata in the Next.js metadata utility
export const metadata: Metadata = {
  title: "Cosmic Cowboys",
  description: "A frame telling the story of Cosmic Cowboys",
  openGraph: {
    title: "Cosmic Cowboys",
    description: "A frame telling the story of Cosmic Cowboys",
    images: [`https://build-onchain-apps.vercel.app/release/v-0-17.png`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  return (
    <>
      <h1>frame</h1>
    </>
  );
}
