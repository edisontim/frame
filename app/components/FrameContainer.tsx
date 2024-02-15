import { ActionIndex, getByteLength } from "frames.js";
import {
  FrameState,
  FrameElementType,
  PreviousFrame,
  RedirectMap,
  FrameButton,
  FrameButtonPostProvidedProps,
  FrameButtonAutomatedProps,
  FrameInput,
  FrameButtonPostRedirectProvidedProps,
} from "frames.js/next/server";
import React from "react";
import { FrameImage } from "./FrameImage";

/**
 * A React functional component that Wraps a Frame and processes it, validating certain properties of the Frames spec, as well as adding other props. It also generates the postUrl.
 * It throws an error if the Frame is invalid, which can be caught by using an error boundary.
 * @param param0
 * @returns React.JSXElement
 */
export function FrameContainer<T extends FrameState = FrameState>({
  postUrl,
  children,
  state,
  pathname,
  previousFrame,
}: {
  /** Either a relative e.g. "/frames" or an absolute path, e.g. "https://google.com/frames" */
  postUrl: string;
  /** The elements to include in the Frame */
  children: Array<React.ReactElement<FrameElementType> | null>;
  /** The current reducer state object, returned from useFramesReducer */
  state: T;
  previousFrame: PreviousFrame<T>;
  /** The absolute or relative path of the page that this frame is on, relative to root (/), defaults to (/) */
  pathname?: string;
}) {
  if (!pathname)
    console.warn(
      "frames.js: warning: You have not specified a `pathname` prop on your <FrameContainer>. This is not recommended, as it will default to the root path and not work if your frame is being rendered at a different path. Please specify a `pathname` prop on your <FrameContainer>."
    );

  const nextIndexByComponentType: Record<
    "button" | "image" | "input",
    ActionIndex
  > = {
    button: 1,
    image: 1,
    input: 1,
  };
  let redirectMap: RedirectMap = {};
  const newTree = (
    <>
      {React.Children.map(children, (child) => {
        if (child === null) return;
        switch (child.type) {
          case FrameButton:
            if (!React.isValidElement<typeof FrameButton>(child)) {
              return child;
            }

            if (nextIndexByComponentType.button > 4) {
              throw new Error("too many buttons");
            }

            // set redirect data for retrieval
            if ((child.props as any).action === "post_redirect") {
              redirectMap[nextIndexByComponentType.button] = (
                child.props as any as FrameButtonPostRedirectProvidedProps
              ).target!;
            }

            return (
              <FFrameButtonShim
                {...(child.props as any)}
                actionIndex={nextIndexByComponentType.button++ as ActionIndex}
              />
            );

          case FrameInput:
            if (nextIndexByComponentType.input > 1) {
              throw new Error("max one input allowed");
            }
            nextIndexByComponentType.input++;
            return child;
          case FrameImage:
            if (nextIndexByComponentType.image > 1) {
              throw new Error("max one image allowed");
            }
            nextIndexByComponentType.image++;
            return child;
          default:
            throw new Error(
              "invalid child of <Frame>, must be a <FrameButton> or <FrameImage>"
            );
        }
      })}
    </>
  );

  if (nextIndexByComponentType.image === 1)
    throw new Error("an <FrameImage> element inside a <Frame> is required");

  const searchParams = new URLSearchParams();

  // short for pathname
  searchParams.set("p", pathname ?? previousFrame.headers.pathname ?? "/");
  // short for state
  searchParams.set("s", JSON.stringify(state));
  // short for redirects
  searchParams.set("r", JSON.stringify(redirectMap));

  const postUrlRoute = postUrl.startsWith("/")
    ? `${previousFrame.headers.urlWithoutPathname}${postUrl}`
    : postUrl;

  const postUrlFull = `${postUrlRoute}?${searchParams.toString()}`;
  if (getByteLength(postUrlFull) > 256) {
    console.error(
      `post_url is too long. ${postUrlFull.length} bytes, max is 256. The url is generated to include your state and the redirect urls in <FrameButton href={s. In order to shorten your post_url, you could try storing less in state, or providing redirects via the POST handler's second optional argument instead, which saves url space. The generated post_url was: `,
      postUrlFull
    );
    throw new Error("post_url is more than 256 bytes");
  }
  return (
    <>
      <meta name="fc:frame" content="vNext" />
      <meta name="og:title" content="420 blazit"></meta>
      <meta property="og:description" content="Keep this at 420"></meta>
      <meta name="fc:frame:post_url" content={postUrlFull} />
      {newTree}
    </>
  );
}

/** An internal component that handles FrameButtons that have type: 'post' */
function FFrameButtonShim({
  actionIndex,
  target,
  action = "post",
  children,
}: FrameButtonPostProvidedProps & FrameButtonAutomatedProps) {
  return (
    <>
      <meta
        name={`fc:frame:button:${actionIndex}`}
        content={String(children)}
      />
      <meta name={`fc:frame:button:${actionIndex}:action`} content={action} />
      {target ? (
        <meta name={`fc:frame:button:${actionIndex}:target`} content={target} />
      ) : null}
    </>
  );
}
