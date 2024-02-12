import Image from "next/image";

export default function Home() {
  return (
    <>
      <meta property="fc:frame" content="vNext" />
      <meta
        property="fc:frame:image"
        content="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyLTD-EEs8bxwuZtNSWPEROeaAu3FvGnlGQ6BhxGc4fuuphh9jJz1OWtJQII7BMUlrCHA&usqp=CAU"
      />
      <meta property="fc:frame:button:1" content="Green" />
      <meta property="fc:frame:button:2" content="Purple" />
      <meta property="fc:frame:button:3" content="Red" />
      <meta property="fc:frame:button:4" content="Blue" />
    </>
  );
}
