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

import { OpenAI } from "openai";

const openAi = new OpenAI();

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
        : process.env.HUB_URL,
    fetchHubContext: true,
  });

  if (frameMessage && !frameMessage?.isValid) {
    throw new Error("Invalid frame payload");
  }

  const [state] = useFramesReducer<State>(reducer, initialState, previousFrame);

  //   let gptMsg =
  //     "At the pinnacle of existance, I stand at the perfect spot: 420.";
  //   if (previousFrame.prevState != null) {
  //     const gptCompletion = await await openAi.chat.completions.create({
  //       model: "gpt-4-turbo-preview",
  //       messages: [
  //         {
  //           role: "system",
  //           content: `Imagine that you're a number and your wellbeing depends on whether or not that you are at 420. I control a button that makes you go higher or lower. All you can do is output a dramatic sentence (do not go over 20 words) that expresses your wellbeing and state of mind. The user will give you the score you were before my press and the score you are after my press.`,
  //         },
  //         {
  //           role: "user",
  //           content: `The previous number was ${previousFrame.prevState?.score} and your current number is ${state.score}`,
  //         },
  //       ],
  //     });
  //     gptMsg = gptCompletion.choices[0]?.message.content ?? String(state.score);
  //   }

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
          <div tw="w-full h-full text-black flex flex-col justify-center items-center">
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
            {/* <p
              style={{
                maxWidth: "60vw",
                textAlign: "center",
                background: "white",
              }}
            >
              {gptMsg}
            </p> */}
          </div>
        </FrameImage>
        <FrameButton>{`🔽${downEmoji}`}</FrameButton>
        <FrameButton>{`🔼${upEmoji}`}</FrameButton>
      </FrameContainer>
    </div>
  );
}
