import {
  FrameButton,
  FrameContainer,
  FrameImage,
  FrameReducer,
  NextServerPageProps,
  getPreviousFrame,
  useFramesReducer,
  getFrameMessage,
} from "frames.js/next/server";

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
  console.log(`Hereeee !`, previousFrame);
  const frameMessage = await getFrameMessage(previousFrame.postBody, {});

  if (frameMessage) {
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

  if (frameMessage) {
    const { buttonIndex } = frameMessage;

    console.log("info: buttonIndex is:", buttonIndex);
  }
  // then, when done, return next frame
  return (
    <FrameContainer
      postUrl="/frames"
      state={state}
      previousFrame={previousFrame}
    >
      <FrameImage>
        <div
          style={{ display: "flex", flexDirection: "column" }}
          tw="w-full h-full bg-slate-700 text-white justify-center items-center"
        >
          <p>let's keep this at 420: </p>
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
  );
}
