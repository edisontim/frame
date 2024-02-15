import {
  FrameButton,
  NextServerPageProps,
  getFrameMessage,
  getPreviousFrame,
  FrameImage,
  FrameInput,
} from "frames.js/next/server";

import { FrameContainer } from "./components/FrameContainer";

import { OpenAI } from "openai";

const openAi = new OpenAI();

const HAPPY_URL = "https://i.ibb.co/Qmr7ChQ/happy.jpg";
const SAD_URL = "https://i.ibb.co/YP4YzvG/sad.jpg";

type State = { firstClick: boolean };

let currentScore = 420;

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
  });

  if (frameMessage && !frameMessage?.isValid) {
    throw new Error("Invalid frame payload");
  }

  const previousScore = currentScore;
  if (previousFrame.prevState && !previousFrame.prevState.firstClick) {
    currentScore =
      previousFrame.postBody?.untrustedData.buttonIndex == 1
        ? currentScore - 1
        : currentScore + 1;
  }

  let gptMsg = "Perfection";

  let upEmoji = "";
  let downEmoji = "";
  let url = HAPPY_URL;
  if (currentScore > 420) {
    upEmoji = "😈";
    downEmoji = "😇";
    url = SAD_URL;
    gptMsg = "Oh no, bring me back to 420";
  } else if (currentScore < 420) {
    upEmoji = "😇";
    downEmoji = "😈";
    url = SAD_URL;
    gptMsg = "Oh no, bring me back to 420";
  }

  let content = [<FrameButton key={0}>Lets keep this at 420!</FrameButton>];
  if (previousFrame.prevState) {
    const gptCompletion = await await openAi.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `Imagine that you're a number and your wellbeing depends on whether or not that you are at 420. I control a button that makes you go higher or lower. All you can do is output a dramatic sentence (under no circumstance can you output more than 27 characters) that expresses your wellbeing and state of mind. The user will give you the score you were before my press and the score you are after my press.`,
        },
        {
          role: "user",
          content: `The previous number was ${previousScore} and your current number is ${currentScore}`,
        },
      ],
    });
    gptMsg = gptCompletion.choices[0]?.message.content ?? String(currentScore);
    gptMsg = gptMsg.slice(0, 27);
    content = [
      <FrameInput key={0} text={`${currentScore}: ${gptMsg}`} />,
      <FrameButton key={1}>{`🔽${downEmoji}`}</FrameButton>,
      <FrameButton key={2}>{`🔼${upEmoji}`}</FrameButton>,
    ];
  }

  return (
    <div>
      <p>Hello data</p>
      <FrameContainer
        postUrl="/frames"
        state={
          !previousFrame.prevState
            ? { firstClick: true }
            : { firstClient: false }
        }
        previousFrame={previousFrame}
        pathname="/"
      >
        <FrameImage src={url} aspectRatio="1.91:1" />
        {...content}
      </FrameContainer>
    </div>
  );
}
