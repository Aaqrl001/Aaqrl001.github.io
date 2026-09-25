document.addEventListener("DOMContentLoaded", function () {

  /*
   ============================================================
   CURRENT PAGE
   ============================================================
  */

  const currentPage =
    window.location.pathname.split("/").pop() || "index.html";


  /*
   ============================================================
   HEADER + NAVIGATION
   ============================================================
  */

  const headerContainer =
    document.getElementById("site-header");


  if (headerContainer) {

    headerContainer.innerHTML = `

      <header class="site-header">

        <div class="wrap header-top">

          <a href="index.html" class="logo-box">

            <img
              src="images/VU_Centered_Black.png"
              alt="Vanderbilt University logo">

          </a>


          <div class="header-titles">

            <span class="college">
              SCHOOL OF ENGINEERING
            </span>

            <span class="lab-name">
              AEROSOL AND AIR QUALITY RESEARCH LABORATORY
            </span>

          </div>


          <a href="index.html" class="aaqrl-logo">

            <img
              src="images/AAQRL_Logo.jpg"
              alt="Aerosol and Air Quality Research Laboratory logo">

          </a>

        </div>

      </header>


      <nav class="site-nav">

        <div class="wrap nav-inner">

          <button
            class="nav-toggle"
            aria-label="Toggle navigation"
            aria-expanded="false">

            &#9776;

          </button>


          <ul class="nav-links">


            <!-- HOME -->

            <li>

              <a
                class="nav-link"
                href="index.html">

                Home

              </a>

            </li>


            <!-- RESEARCH -->

            <li class="has-dropdown">

              <a
                class="nav-link"
                href="research.html">

                Research
                <span class="dropdown-arrow">▾</span>

              </a>


              <ul class="dropdown">

                <li>
                  <a href="research-1.html">
                    Aerosol Instrumentation and Fundamentals
                  </a>
                </li>

                <li>
                  <a href="research-2.html">
                    Air Quality and Bioaerosols
                  </a>
                </li>

                <li>
                  <a href="research-3.html">
                    Research Area 3
                  </a>
                </li>

                <li>
                  <a href="research-4.html">
                    Research Area 4
                  </a>
                </li>

                <li>
                  <a href="research-5.html">
                    Research Area 5
                  </a>
                </li>

              </ul>

            </li>


            <!-- PEOPLE -->

            <li class="has-dropdown">

              <a
                class="nav-link"
                href="people.html">

                People
                <span class="dropdown-arrow">▾</span>

              </a>


              <ul class="dropdown">

                <li>
                  <a href="people-1.html">
                    People Category 1
                  </a>
                </li>

                <li>
                  <a href="people-2.html">
                    People Category 2
                  </a>
                </li>

              </ul>

            </li>


            <!-- PUBLICATIONS -->

            <li class="has-dropdown">

              <a
                class="nav-link"
                href="publications.html">

                Publications
                <span class="dropdown-arrow">▾</span>

              </a>


              <ul class="dropdown">

                <li>
                  <a href="publications-1.html">
                    Publication Category 1
                  </a>
                </li>

                <li>
                  <a href="publications-2.html">
                    Publication Category 2
                  </a>
                </li>

              </ul>

            </li>


            <!-- NEWS -->

            <li class="has-dropdown">

              <a
                class="nav-link"
                href="news.html">

                News and Events
                <span class="dropdown-arrow">▾</span>

              </a>


              <ul class="dropdown">

                <li>
                  <a href="news-1.html">
                    News
                  </a>
                </li>

                <li>
                  <a href="news-2.html">
                    Events
                  </a>
                </li>

              </ul>

            </li>


            <!-- EDUCATION -->

            <li class="has-dropdown">

              <a
                class="nav-link"
                href="education.html">

                Education
                <span class="dropdown-arrow">▾</span>

              </a>


              <ul class="dropdown">

                <li>
                  <a href="education-1.html">
                    Education Category 1
                  </a>
                </li>

                <li>
                  <a href="education-2.html">
                    Education Category 2
                  </a>
                </li>

                <li>
                  <a href="education-3.html">
                    Education Category 3
                  </a>
                </li>

              </ul>

            </li>


            <!-- FACILITIES -->

            <li class="has-dropdown">

              <a
                class="nav-link"
                href="facilities.html">

                Facilities
                <span class="dropdown-arrow">▾</span>

              </a>


              <ul class="dropdown">

                <li>
                  <a href="facilities-1.html">
                    Facility Category 1
                  </a>
                </li>

                <li>
                  <a href="facilities-2.html">
                    Facility Category 2
                  </a>
                </li>

                <li>
                  <a href="facilities-3.html">
                    Facility Category 3
                  </a>
                </li>

                <li>
                  <a href="facilities-4.html">
                    Facility Category 4
                  </a>
                </li>

              </ul>

            </li>


            <!-- STARTUPS -->

            <li class="has-dropdown">

              <a
                class="nav-link"
                href="startups.html">

                Startups
                <span class="dropdown-arrow">▾</span>

              </a>


              <ul class="dropdown">

                <li>
                  <a href="startups-1.html">
                    Startup Category 1
                  </a>
                </li>

                <li>
                  <a href="startups-2.html">
                    Startup Category 2
                  </a>
                </li>

              </ul>

            </li>

          </ul>

        </div>

      </nav>


      <div class="aqi-rule"></div>

    `;


    /*
     * Highlight current main navigation item
     */

    const navLinks =
      document.querySelectorAll(".nav-link");


    navLinks.forEach(function (link) {

      const href =
        link.getAttribute("href");


      if (href === currentPage) {

        link.classList.add("active");

      }


      /*
       * Highlight parent menu when
       * viewing a dropdown page
       */

      if (
        link.parentElement.classList.contains("has-dropdown")
      ) {

        const dropdownLinks =
          link.parentElement.querySelectorAll(".dropdown a");


        dropdownLinks.forEach(function (dropdownLink) {

          if (
            dropdownLink.getAttribute("href") === currentPage
          ) {

            link.classList.add("active");

          }

        });

      }

    });


    /*
     ============================================================
     MOBILE NAVIGATION
     ============================================================
    */

    const navToggle =
      document.querySelector(".nav-toggle");

    const navLinksContainer =
      document.querySelector(".nav-links");


    if (navToggle && navLinksContainer) {

      navToggle.addEventListener("click", function () {

        const open =
          navLinksContainer.classList.toggle("open");


        navToggle.setAttribute(
          "aria-expanded",
          open
        );

      });

    }


    /*
     * Mobile dropdowns
     */

    const dropdownParents =
      document.querySelectorAll(
        ".has-dropdown > .nav-link"
      );


    dropdownParents.forEach(function (link) {

      link.addEventListener("click", function (event) {

        if (window.innerWidth <= 760) {

          const parent =
            link.parentElement;


          if (parent.querySelector(".dropdown")) {

            event.preventDefault();

            parent.classList.toggle("open");

          }

        }

      });

    });

  }


  /*
   ============================================================
   FOOTER
   ============================================================
  */

  const footer = document.createElement("footer");

  footer.className = "site-footer";


  footer.innerHTML = `

    <div class="wrap footer-top">

      <a href="index.html" class="logo-box">

        <img
          src="images/VU_Centered_Black.png"
          alt="Vanderbilt University logo">

      </a>


      <span class="footer-lab-name">
        Aerosol and Air Quality Research Laboratory
      </span>

    </div>


    <div class="wrap footer-address">

      <span>
        Chemical and Biomolecular Engineering,
        The Engineering and Science Building,
        2414 Highland Ave, Nashville, TN 37212
      </span>


      <a
        class="map-link"
        href="https://www.google.com/maps/search/?api=1&query=Chemical+and+Biomolecular+Engineering%2C+The+Engineering+and+Science+Building%2C+2414+Highland+Ave%2C+Nashville%2C+TN+37212"
        target="_blank"
        rel="noopener">

        View on map &rarr;

      </a>

    </div>


    <div
      class="footer-bottom wrap"
      style="max-width:none;">

      &copy; 2026 Aerosol and Air Quality Research Laboratory.
      All rights reserved.

    </div>

  `;


  document.body.appendChild(footer);

});
