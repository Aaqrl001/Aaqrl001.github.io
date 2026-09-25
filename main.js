document.addEventListener('DOMContentLoaded', function () {

  /* =========================================
     MOBILE MAIN NAVIGATION
     ========================================= */

  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');

  if (toggle && links) {

    toggle.addEventListener('click', function () {

      links.classList.toggle('open');

      var expanded = links.classList.contains('open');

      toggle.setAttribute(
        'aria-expanded',
        expanded ? 'true' : 'false'
      );

    });

  }


  /* =========================================
     MOBILE DROPDOWN MENUS
     ========================================= */

  var dropdownItems =
    document.querySelectorAll('.has-dropdown');


  dropdownItems.forEach(function (item) {

    var link =
      item.querySelector(':scope > .nav-link');

    if (!link) {
      return;
    }


    link.addEventListener('click', function (event) {

      /*
       * Desktop:
       * Let the link behave normally.
       *
       * Mobile:
       * First tap opens the dropdown.
       * Second tap follows the main page.
       */

      if (window.innerWidth <= 760) {

        if (!item.classList.contains('dropdown-open')) {

          event.preventDefault();

          /*
           * Close any other open dropdowns.
           */

          dropdownItems.forEach(function (otherItem) {

            if (otherItem !== item) {
              otherItem.classList.remove(
                'dropdown-open'
              );
            }

          });

          /*
           * Open this dropdown.
           */

          item.classList.add('dropdown-open');

        }

      }

    });

  });


  /* =========================================
     RESET MOBILE DROPDOWNS WHEN RESIZING
     ========================================= */

  window.addEventListener('resize', function () {

    if (window.innerWidth > 760) {

      dropdownItems.forEach(function (item) {

        item.classList.remove('dropdown-open');

      });

    }

  });

});
