import { useState } from "react";

function MinistryNews() {
const [showStatistics, setShowStatistics] = useState(false);
const [showAmbassador, setShowAmbassador] = useState(false);

return ( <section className="content-section ministry-section">

```
  <div className="section-heading">
    <h2>Ministry / Government News</h2>

    <p>
      Latest information and updates from the ministry.
    </p>
  </div>

  <div className="feature-grid">

    {/* =========================================
       STATISTICS
    ========================================= */}

    <article className="feature-card">

      <div className="feature-image-wrapper">
        <img
          src="/images/stat.jpg"
          alt="Statistics"
          className="feature-image"
        />
      </div>

      <div className="feature-card-content">

        <h3>Statistics</h3>

        <p>
          View the latest official statistics, reports, and key information
          related to expatriate employment and work permits. Access reliable
          data and updates to better understand workforce trends, registration
          activities, and work permit services.
        </p>

        <button
          type="button"
          onClick={() => setShowStatistics(true)}
        >
          View Statistics
        </button>

      </div>


      {/* =========================================
         STATIC STATISTICS PREVIEW
         ALWAYS VISIBLE ON THE PAGE
      ========================================= */}

      <div className="page-statistics-preview">

        <div className="page-statistics-header">

          <div>
            <span className="statistics-preview-label">
              OFFICIAL STATISTICS
            </span>

            <h4>Expatriate Employment Overview</h4>
          </div>

          <span className="statistics-preview-year">
            2026
          </span>

        </div>


        {/* SUMMARY */}

        <div className="page-statistics-summary">

          <div>
            <span>Total Registrations</span>
            <strong>12,480</strong>
          </div>

          <div>
            <span>Active Permits</span>
            <strong>9,735</strong>
          </div>

          <div>
            <span>Processed</span>
            <strong>11,260</strong>
          </div>

        </div>


        {/* SMALL BAR CHART */}

        <div className="page-statistics-chart">

          <div className="page-chart-title">
            Monthly Registrations
          </div>

          <div className="page-bars">

            <div className="page-bar-item">
              <strong>620</strong>
              <div
                className="page-bar"
                style={{ height: "45%" }}
              />
              <span>Jan</span>
            </div>

            <div className="page-bar-item">
              <strong>710</strong>
              <div
                className="page-bar"
                style={{ height: "55%" }}
              />
              <span>Feb</span>
            </div>

            <div className="page-bar-item">
              <strong>850</strong>
              <div
                className="page-bar"
                style={{ height: "68%" }}
              />
              <span>Mar</span>
            </div>

            <div className="page-bar-item">
              <strong>920</strong>
              <div
                className="page-bar"
                style={{ height: "76%" }}
              />
              <span>Apr</span>
            </div>

            <div className="page-bar-item">
              <strong>1,040</strong>
              <div
                className="page-bar"
                style={{ height: "88%" }}
              />
              <span>May</span>
            </div>

            <div className="page-bar-item">
              <strong>1,180</strong>
              <div
                className="page-bar"
                style={{ height: "100%" }}
              />
              <span>Jun</span>
            </div>

          </div>

        </div>


        {/* STATUS */}

        <div className="page-statistics-status">

          <div className="page-status-title">
            Application Status
          </div>

          <div className="page-status-row">

            <div className="page-status-item">

              <span className="page-status-dot approved"></span>

              <span>Approved</span>

              <strong>72%</strong>

            </div>


            <div className="page-status-item">

              <span className="page-status-dot pending"></span>

              <span>Pending</span>

              <strong>18%</strong>

            </div>


            <div className="page-status-item">

              <span className="page-status-dot review"></span>

              <span>Under Review</span>

              <strong>10%</strong>

            </div>

          </div>

        </div>

      </div>

    </article>


    {/* =========================================
       AMBASSADOR
    ========================================= */}

    <article className="feature-card">

      <div className="feature-image-wrapper">
        <img
          src="/images/the ambasador.jpg"
          alt="Ambassador"
          className="feature-image"
        />
      </div>

      <div className="feature-card-content">

        <h3>Ambassador</h3>

        <p>
          Information, official messages, and important updates from the
          Ambassador and government representatives, providing guidance and
          announcements related to visa registration, expatriate services,
          and cooperation between government institutions.
        </p>

        <button
          type="button"
          onClick={() => setShowAmbassador(true)}
        >
          Read More
        </button>

      </div>

    </article>

  </div>


  {/* =========================================
     STATISTICS FULL MODAL
  ========================================= */}

  {showStatistics && (
    <div
      className="ministry-modal-overlay"
      onClick={() => setShowStatistics(false)}
    >

      <div
        className="ministry-modal statistics-modal"
        onClick={(event) => event.stopPropagation()}
      >

        <button
          type="button"
          className="ministry-modal-close"
          onClick={() => setShowStatistics(false)}
          aria-label="Close statistics"
        >
          ×
        </button>

        <div className="ministry-modal-header">

          <span className="ministry-modal-label">
            OFFICIAL STATISTICS
          </span>

          <h2>Expatriate Employment Statistics</h2>

          <p>
            Overview of registration and work permit activities.
          </p>

        </div>


        <div className="statistics-summary">

          <div className="statistics-summary-card">
            <span>Total Registrations</span>
            <strong>12,480</strong>
            <small>+8.4% this year</small>
          </div>

          <div className="statistics-summary-card">
            <span>Active Work Permits</span>
            <strong>9,735</strong>
            <small>Currently active</small>
          </div>

          <div className="statistics-summary-card">
            <span>Applications Processed</span>
            <strong>11,260</strong>
            <small>Completed applications</small>
          </div>

          <div className="statistics-summary-card">
            <span>Registered Countries</span>
            <strong>42</strong>
            <small>Countries represented</small>
          </div>

        </div>


        <div className="statistics-charts">

          <div className="statistics-chart-card">

            <div className="statistics-chart-title">
              <h3>Monthly Registrations</h3>
              <span>2026</span>
            </div>

            <div className="statistics-bar-chart">

              <div className="statistics-bar-item">
                <div className="statistics-bar-value">620</div>
                <div
                  className="statistics-bar"
                  style={{ height: "52%" }}
                />
                <span>Jan</span>
              </div>

              <div className="statistics-bar-item">
                <div className="statistics-bar-value">710</div>
                <div
                  className="statistics-bar"
                  style={{ height: "60%" }}
                />
                <span>Feb</span>
              </div>

              <div className="statistics-bar-item">
                <div className="statistics-bar-value">850</div>
                <div
                  className="statistics-bar"
                  style={{ height: "72%" }}
                />
                <span>Mar</span>
              </div>

              <div className="statistics-bar-item">
                <div className="statistics-bar-value">920</div>
                <div
                  className="statistics-bar"
                  style={{ height: "78%" }}
                />
                <span>Apr</span>
              </div>

              <div className="statistics-bar-item">
                <div className="statistics-bar-value">1,040</div>
                <div
                  className="statistics-bar"
                  style={{ height: "88%" }}
                />
                <span>May</span>
              </div>

              <div className="statistics-bar-item">
                <div className="statistics-bar-value">1,180</div>
                <div
                  className="statistics-bar"
                  style={{ height: "100%" }}
                />
                <span>Jun</span>
              </div>

            </div>

          </div>


          <div className="statistics-chart-card">

            <div className="statistics-chart-title">
              <h3>Application Status</h3>
              <span>Current</span>
            </div>

            <div className="statistics-donut-area">

              <div className="statistics-donut">

                <div className="statistics-donut-center">
                  <strong>12,480</strong>
                  <span>Total</span>
                </div>

              </div>

              <div className="statistics-legend">

                <div>
                  <i className="legend-approved"></i>
                  <span>Approved</span>
                  <strong>72%</strong>
                </div>

                <div>
                  <i className="legend-pending"></i>
                  <span>Pending</span>
                  <strong>18%</strong>
                </div>

                <div>
                  <i className="legend-review"></i>
                  <span>Under Review</span>
                  <strong>10%</strong>
                </div>

              </div>

            </div>

          </div>


          <div className="statistics-chart-card statistics-full-chart">

            <div className="statistics-chart-title">
              <h3>Work Permit Categories</h3>
              <span>Current registrations</span>
            </div>

            <div className="statistics-horizontal-chart">

              <div className="horizontal-chart-row">
                <span>Domestic Employment</span>

                <div className="horizontal-chart-track">
                  <div
                    className="horizontal-chart-fill"
                    style={{ width: "82%" }}
                  />
                </div>

                <strong>82%</strong>
              </div>

              <div className="horizontal-chart-row">
                <span>Construction</span>

                <div className="horizontal-chart-track">
                  <div
                    className="horizontal-chart-fill"
                    style={{ width: "68%" }}
                  />
                </div>

                <strong>68%</strong>
              </div>

              <div className="horizontal-chart-row">
                <span>Services</span>

                <div className="horizontal-chart-track">
                  <div
                    className="horizontal-chart-fill"
                    style={{ width: "56%" }}
                  />
                </div>

                <strong>56%</strong>
              </div>

              <div className="horizontal-chart-row">
                <span>Manufacturing</span>

                <div className="horizontal-chart-track">
                  <div
                    className="horizontal-chart-fill"
                    style={{ width: "43%" }}
                  />
                </div>

                <strong>43%</strong>
              </div>

            </div>

          </div>

        </div>


        <div className="statistics-note">
          <strong>Note:</strong> The figures displayed in this preview are
          sample static statistics for presentation purposes.
        </div>

      </div>

    </div>
  )}


  {/* =========================================
     AMBASSADOR MODAL
  ========================================= */}

  {showAmbassador && (
    <div
      className="ministry-modal-overlay"
      onClick={() => setShowAmbassador(false)}
    >

      <div
        className="ministry-modal ambassador-modal"
        onClick={(event) => event.stopPropagation()}
      >

        <button
          type="button"
          className="ministry-modal-close"
          onClick={() => setShowAmbassador(false)}
          aria-label="Close ambassador message"
        >
          ×
        </button>


        <div className="ambassador-top">

          <div className="ambassador-photo">

            <img
              src="/images/the ambasador.jpg"
              alt="Ambassador"
            />

          </div>

          <div className="ambassador-heading">

            <span className="ministry-modal-label">
              OFFICIAL MESSAGE
            </span>

            <h2>Message from the Ambassador</h2>

            <p>
              Information and messages from the Ambassador and government
              representatives.
            </p>

          </div>

        </div>


        <div className="ambassador-divider"></div>


        <div className="ambassador-message">

          <h3>
            Welcome to the e-LMIS Visa Registration Portal
          </h3>

          <p>
            We are pleased to provide this platform to support transparent,
            accessible, and efficient visa registration and expatriate
            employment services.
          </p>

          <p>
            Applicants and employers are encouraged to provide complete and
            accurate information during the registration process. Proper
            documentation helps ensure that applications can be reviewed
            efficiently and that services are delivered in an organized
            manner.
          </p>

          <p>
            Government representatives and relevant institutions continue
            to work together to improve communication, registration
            procedures, and services for expatriate workers.
          </p>

          <p>
            We encourage all applicants to use the official registration
            channels, keep their information up to date, and follow the
            required procedures when submitting applications and documents.
          </p>

          <div className="ambassador-signature">

            <strong>Office of the Ambassador</strong>

            <span>
              Government Representative
            </span>

          </div>

        </div>


        <div className="ambassador-information">

          <div>
            <strong>Visa Registration</strong>
            <span>
              Follow the official application procedures and provide
              accurate information.
            </span>
          </div>

          <div>
            <strong>Expatriate Services</strong>
            <span>
              Access information and services related to employment and
              work permits.
            </span>
          </div>

          <div>
            <strong>Official Updates</strong>
            <span>
              Check the portal regularly for important announcements and
              service updates.
            </span>
          </div>

        </div>


        <button
          type="button"
          className="ambassador-close-button"
          onClick={() => setShowAmbassador(false)}
        >
          Close Message
        </button>

      </div>

    </div>
  )}

</section>


);
}

export default MinistryNews;
