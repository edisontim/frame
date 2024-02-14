import {
  FrameButton,
  FrameContainer,
  FrameImage,
  FrameReducer,
  NextServerPageProps,
  getFrameMessage,
  getPreviousFrame,
  useFramesReducer,
} from "frames.js/next/server";
import Link from "next/link";

type State = {
  score: number;
};

const initialState = { score: 420 };

const reducer: FrameReducer<State> = (state, action) => {
  return {
    score:
      action.postBody?.untrustedData.buttonIndex == 1
        ? state.score - 1
        : state.score + 1,
  };
};

// This is a react server component only
export default async function Home({
  params,
  searchParams,
}: NextServerPageProps) {
  const previousFrame = getPreviousFrame<State>(searchParams);

  const frameMessage = await getFrameMessage(previousFrame.postBody, {
    hubHttpUrl:
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000/debug/hub"
        : "https://www.noderpc.xyz/farcaster-mainnet-hub",
    fetchHubContext: true,
  });

  if (frameMessage && !frameMessage?.isValid) {
    throw new Error("Invalid frame payload");
  }

  const [state, dispatch] = useFramesReducer<State>(
    reducer,
    initialState,
    previousFrame
  );

  // Here: do a server side side effect either sync or async (using await), such as minting an NFT if you want.
  // example: load the users credentials & check they have an NFT
  console.log("info: state is:", state);

  return (
    <div>
      Hello data
      <FrameContainer
        postUrl="/frames"
        state={state}
        previousFrame={previousFrame}
        pathname="/"
      >
        <FrameImage>
          <div
            style={{ display: "flex", flexDirection: "column" }}
            tw="w-full h-full bg-slate-700 text-white justify-center items-center"
          >
            <p>lets keep this at 420: </p>
            <br />
            <p>{state.score}</p>
          </div>
        </FrameImage>
        <FrameButton>{`🔽${
          state.score >= 420 ? (state.score == 420 ? "" : "😇") : "😈"
        }`}</FrameButton>
        <FrameButton>{`🔼${
          state.score >= 420 ? (state.score == 420 ? "" : "😈") : "😇"
        }`}</FrameButton>
      </FrameContainer>
    </div>
  );
}
