import { LOREM_LONG, PageHead } from "./AboutPage";
import EngravedPortrait from "./EngravedPortrait";
import "./AboutPage.css";
import "./TeamPage.css";

// The Team page (frame 24:4168): the About page's head and copy, then the team in
// square boxes three to a row — the frame's three, and two more under them so all
// five fit — each portrait engraved and cut into a grid (EngravedPortrait), with
// the person's name and role under it; a rule closes the column.
//
// To add a photo: put it in src/assets/images/team/ and set `photo` to
// "/images/team/<file>". Any ordinary photo works; a head-and-shoulders crop is
// best. Without one, the box shows the treatment on a placeholder shape.
const TEAM: { name: string; role: string; photo?: string }[] = [
  { name: "Team member", role: "Role" },
  { name: "Team member", role: "Role" },
  { name: "Team member", role: "Role" },
  { name: "Team member", role: "Role" },
  { name: "Team member", role: "Role" },
];

export default function TeamPage() {
  return (
    <main className="about-page" aria-labelledby="team-page-title">
      <article className="about-page__column">
        <PageHead id="team-page-title">
          <span className="about-page__pp">Tea</span>
          <span className="about-page__bg">m</span>
        </PageHead>

        <div className="about-page__copy">
          <p>{LOREM_LONG}</p>
        </div>

        <ul className="team-page__grid">
          {TEAM.map((person, index) => (
            <li className="team-page__person" key={index}>
              <EngravedPortrait src={person.photo} seed={index + 3} alt={person.photo ? `Portrait of ${person.name}` : ""} />
              <p className="team-page__name">{person.name}</p>
              <p className="team-page__role">{person.role}</p>
            </li>
          ))}
        </ul>

        <hr className="about-page__rule team-page__rule" />
      </article>
    </main>
  );
}
