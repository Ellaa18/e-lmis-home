function NewsCards() {
  const news = [
    {
      id: 1,
      title: "Important System Update",
      text: "Stay informed about the latest system updates and announcements.",
    },
    {
      id: 2,
      title: "Work Permit Information",
      text: "Important information for expatriates regarding work permit services.",
    },
    {
      id: 3,
      title: "Government Announcement",
      text: "Read the latest government announcements and official information.",
    },
  ];

  return (
    <section className="content-section news-section">

      <div className="section-heading">

        <h2>News</h2>

        <p>
          Latest news and announcements.
        </p>

      </div>

      <div className="news-grid">

        {news.map((item) => (
          <article
            className="news-card"
            key={item.id}
          >

            <div className="news-card-icon">
              E
            </div>

            <div className="news-card-content">

              <span className="news-date">
                Latest News
              </span>

              <h3>{item.title}</h3>

              <p>{item.text}</p>

              <button type="button">
                Read More
              </button>

            </div>

          </article>
        ))}

      </div>

    </section>
  );
}

export default NewsCards;