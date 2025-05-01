export default function About() {
  const team = [
    {
      name: "Harkishan Singh Baniya",
      role: "Founder & CEO",
      bio: "Visionary leader with expertise in AI and financial modeling, dedicated to democratizing investment strategies through innovative technology solutions.",
      linkedin: "https://www.linkedin.com/in/harkishan/",
    },
    {
      name: "Dr. Neelesh S Upadhye",
      role: "Co-Founder & Advisor",
      bio: "Distinguished academic with extensive research in mathematical modeling and computational finance, providing strategic guidance on algorithm development and validation.",
      linkedin: "https://www.linkedin.com/in/neelesh-upadhye-3b031956/",
    },
  ]

  return (
    <section id="about" className="section bg-gray-100">
      <div className="container">
        <div className="mb-16">
          <h2 className="section-title">ABOUT US</h2>
          <h3 className="section-heading">Our Mission & Vision</h3>
          <p className="section-description mb-8">
            At QuantHive, we're on a mission to democratize access to sophisticated investment strategies through
            explainable AI and mathematical modeling. We believe that financial intelligence should be accessible to
            everyone, not just institutional investors.
          </p>
          <p className="section-description">
            Our vision is to create a world where individuals can make informed investment decisions based on
            transparent, data-driven insights, leveling the playing field in the financial markets.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-medium mb-8">Leadership Team</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white p-8 border border-gray-200">
                <h4 className="text-xl font-medium mb-2">
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-600 transition-colors flex items-center"
                  >
                    {member.name}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4 ml-2 text-gray-500"
                    >
                      <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
                    </svg>
                  </a>
                </h4>
                <p className="text-gray-500 mb-4">{member.role}</p>
                <p className="text-gray-700">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
