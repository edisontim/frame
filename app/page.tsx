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

const HAPPY_URL = "https://i.ibb.co/Qmr7ChQ/happy.jpg";
const SAD_URL = "https://i.ibb.co/YP4YzvG/sad.jpg";

const HAPPY_IMG = "happy.jpeg";
const SAD_IMG = "sad.jpeg";

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

  const [state] = useFramesReducer<State>(reducer, initialState, previousFrame);

  let upEmoji = "";
  let downEmoji = "";
  let imgUrl = HAPPY_URL;
  let img = HAPPY_IMG;
  if (state.score > 420) {
    upEmoji = "😈";
    downEmoji = "😇";
    imgUrl = SAD_URL;
    img = SAD_IMG;
  } else if (state.score < 420) {
    upEmoji = "😇";
    downEmoji = "😈";
    imgUrl = SAD_URL;
    img = SAD_IMG;
  }

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
            style={{
              backgroundImage: `url(${imgUrl})`,
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
            }}
            tw="w-full h-full text-black flex flex-col justify-center items-center"
          >
            <p style={{ background: "white" }}>lets keep this at 420: </p>
            <p
              style={{
                fontSize: "1.5em",
                fontWeight: "bold",
                background: "white",
              }}
            >
              {state.score}
            </p>
          </div>
        </FrameImage>
        <FrameButton>{`🔽${downEmoji}`}</FrameButton>
        <FrameButton>{`🔼${upEmoji}`}</FrameButton>
      </FrameContainer>
    </div>
  );
}
