import FlashPartners from "./FlashPartners";
import Hero from "./Hero";

/** Flash's product page: its hero (frames 5:3615, 5:3695 — the landing hero's
 *  stage in Flash's colours), then the logo band (frame 11:3765). */
export default function FlashProductPage({
  recessed = false,
  handoff = false,
}: {
  recessed?: boolean;
  /** Arrived from the landing page by the page transition (App.tsx). */
  handoff?: boolean;
}) {
  return (
    <>
      <Hero variant="flash" recessed={recessed} handoff={handoff} />
      <FlashPartners />
    </>
  );
}
