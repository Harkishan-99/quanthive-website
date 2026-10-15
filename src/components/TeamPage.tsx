import { PageHead } from "./AboutPage";
import EngravedPortrait from "./EngravedPortrait";
import "./AboutPage.css";
import "./TeamPage.css";

// The Team page (frame 24:4168): the About page's head and copy, then the team in
// square boxes three to a row, as in the frame — each portrait engraved and cut into a grid (EngravedPortrait), with
// the person's name and role under it; a rule closes the column.
//
// To add a photo: put it in src/assets/images/team/ and set `photo` to
// "/images/team/<file>". Any ordinary photo works; a head-and-shoulders crop is
// best. Without one, the box shows the treatment on a placeholder shape.
// The photos are stand-ins (free stock portraits from Pexels) until the team's own.
const TEAM: { name: string; role: string; note?: string; photo?: string }[] = [
  { name: "Harkishan S Baniya", role: "CEO & Founder", photo: "/images/team/harkishan.jpg" },
  { name: "Neelesh Upadhaye", role: "Co-Founder", note: "Ex Quant Desk Head, Dolat Capital", photo: "/images/team/neelesh.jpg" },
  { name: "Chirag S J", role: "Founding Member, SDE", photo: "/images/team/chirag.jpg" },
  { name: "Mahati", role: "Founding Member, Founder's Office Associate", photo: "/images/team/mahati.jpg" },
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
          <p>
            A founding team from IIT Madras, combining deep engineering with quantitative finance to build
            research tools that scale.
          </p>
        </div>

        <ul className="team-page__grid">
          {TEAM.map((person, index) => (
            <li className="team-page__person" key={index}>
              <EngravedPortrait src={person.photo} seed={index + 3} alt={person.photo ? `Portrait of ${person.name}` : ""} />
              <p className="team-page__name">{person.name}</p>
              <p className="team-page__role">{person.role}</p>
              {person.note && <p className="team-page__role team-page__note">{person.note}</p>}
            </li>
          ))}
        </ul>

        <hr className="about-page__rule team-page__rule" />
      </article>
    </main>
  );
}
