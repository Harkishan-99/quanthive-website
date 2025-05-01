export default function Services() {
  const services = [
    {
      id: "01",
      title: "Automation",
      description:
        "Automation testing services include E2E testing, as well as integration and functionality API testing. API automated testing can start with shift-left testing. E2E automated tests are developed once the software reaches a stable state.",
    },
    {
      id: "02",
      title: "Functional testing",
      description:
        "Functional testing involves a thorough verification of features and user flows, ensuring smooth functionality and an optimal user experience in all application scenarios.",
    },
    {
      id: "03",
      title: "Security testing",
      description:
        "Security testing is integrated into the testing process, focusing on common vulnerabilities using automated methodologies. It includes API security testing and basic vulnerability demonstrations as proof of concept.",
    },
    {
      id: "04",
      title: "Game testing",
      description:
        "Game testing involves specialized testing for web and mobile applications on Android and iOS, focusing on functionality and cross-platform compatibility.",
    },
  ]

  return (
    <section id="what-we-do" className="section-bg px-4 md:px-8 py-20">
      <div className="max-w-7xl mx-auto">
        <h2 className="section-title">WHAT WE DO</h2>
        <h3 className="section-heading">Complete testing solutions for modern applications.</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service) => (
            <div key={service.id} className="space-y-4">
              <div className="text-sm text-black content-font font-medium">{service.id}</div>
              <h4 className="text-xl title-font font-medium">{service.title}</h4>
              <p className="section-description">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
