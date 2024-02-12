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
  postUrl: "https://build-onchain-apps.vercel.app/api/frame",
});

// Step 3. Add your metadata in the Next.js metadata utility
export const metadata: Metadata = {
  manifest: "/manifest.json",
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  return <></>;
}
