import type { SatoriOptions } from "satori";
import { ImageResponse } from "@vercel/og";
import { ImageAspectRatio } from "frames.js";

export async function FrameImage(
  props: {
    /** 'fc:frame:aspect_ratio' (defaults to 1:91) */
    aspectRatio?: ImageAspectRatio;
  } & (
    | {
        src: string;
      }
    | {
        /** Children to pass to satori to render to PNG. [Supports tailwind](https://vercel.com/blog/introducing-vercel-og-image-generation-fast-dynamic-social-card-images#tailwind-css-support) via the `tw=` prop instead of `className` */
        children: React.ReactNode;
        options?: SatoriOptions;
      }
  )
) {
  let imgSrc: string;

  if ("children" in props) {
    const imageOptions = {
      ...(props.aspectRatio === "1:1"
        ? {
            width: 1146,
            height: 1146,
          }
        : {
            width: 1146,
            height: 600,
          }),
      ...(props.options ?? {}),
    };

    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            display: "flex", // Use flex layout
            flexDirection: "row", // Align items horizontally
            alignItems: "stretch", // Stretch items to fill the container height
            width: "100%",
            height: "100vh", // Full viewport height
            backgroundColor: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              lineHeight: 1.2,
              fontSize: 36,
              color: "black",
              flex: 1,
              overflow: "hidden",
            }}
          >
            {props.children}
          </div>
        </div>
      ),
      imageOptions
    );
    const imgBuffer = await imageResponse?.arrayBuffer();
    imgSrc = `data:image/png;base64,${Buffer.from(imgBuffer).toString(
      "base64"
    )}`;
  } else {
    imgSrc = props.src;
  }

  return (
    <>
      <meta name="fc:frame:image" content={imgSrc} />
      <meta property="og:image" content={imgSrc} />
      {props.aspectRatio && (
        <meta
          name="fc:frame:image:aspect_ratio"
          content={props.aspectRatio}
        ></meta>
      )}
    </>
  );
}
