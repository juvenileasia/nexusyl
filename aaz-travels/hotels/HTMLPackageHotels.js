(function () {
  const HOTEL_TYPE_SEARCH = "HOTELS";
  const HOTEL_SEARCH_PATH = "/hotels";
  const HOTEL_SORT = "MIN_PRICE_HOTEL";
  const HOTEL_MAX_ROOMS = 4;
  const HOTEL_ROOM_MAX_PASSENGERS = 9;
  const HOTEL_DEFAULT_CHILD_AGE = 0;

  let helpers = {};
  let hotelsActive = false;
  let paxNationalityDocumentClickHandler = null;

  function init(options) {
    helpers = options || {};

    ensureHotelStyles();
    configureHotelsTab();
    bindFlightTabs();

    if (
      new URLSearchParams(window.location.search).get("typeSearch") ===
        "hotels" ||
      isHotelOnlyTabs()
    ) {
      switchToHotels();
    }
  }

  function configureHotelsTab() {
    const tabs = document.querySelector(".header-search-form-tabs");
    const multipleTab = document.getElementById(
      "header-search-form-tab_MULTIPLE"
    );
    const hotelsTab = document.querySelector(".header-search-form-tab-hotels");

    if (!hotelsTab) {
      return;
    }

    if (!isHotelsEnabled()) {
      hotelsTab.remove();
      if (tabs) {
        tabs.classList.remove("header-search-form-tabs-with-hotels");
      }
      if (multipleTab) {
        multipleTab.classList.add("header-search-form-tab-last");
      }
      return;
    }

    if (tabs) {
      tabs.classList.add("header-search-form-tabs-with-hotels");
      tabs.classList.remove("header-search-form-tabs-hotels-only");
    }
    if (multipleTab) {
      multipleTab.classList.remove("header-search-form-tab-last");
    }

    hotelsTab.addEventListener("click", function (event) {
      event.preventDefault();
      switchToHotels();
    });
  }

  function isHotelOnlyTabs() {
    const tabs = document.querySelector(".header-search-form-tabs");
    const hotelsTab = document.querySelector(".header-search-form-tab-hotels");

    if (!tabs || !hotelsTab) {
      return false;
    }

    const visibleTabs = Array.from(
      tabs.querySelectorAll(".header-search-form-tab")
    ).filter((tab) => !tab.classList.contains("hidden"));

    return visibleTabs.length === 1 && visibleTabs[0] === hotelsTab;
  }

  function bindFlightTabs() {
    [
      "header-search-form-tab_ONE_WAY",
      "header-search-form-tab_RETURN",
      "header-search-form-tab_MULTIPLE",
    ].forEach((id) => {
      const tab = document.getElementById(id);
      if (tab) {
        tab.addEventListener("click", switchToFlights);
      }
    });
  }

  function isHotelsEnabled() {
    const config = GOL_Global.config || {};

    if (Array.isArray(config.module)) {
      return config.module.includes("Hotel");
    }

    return (
      config.hotelsEnabled === true ||
      config.hotelsEnabled === "true" ||
      config.hotelsEnabled === 1 ||
      config.hotelsEnabled === "1"
    );
  }

  function switchToHotels() {
    if (!isHotelsEnabled()) {
      return;
    }

    ensureHotelState();
    hotelsActive = true;
    GOL_Global.HTMLSearchForm.typeSearch = HOTEL_TYPE_SEARCH;

    showFormElement(document.getElementById("searchForm-standard"));
    hideFormElement(document.getElementById("searchForm-multiCity"));

    setActiveTab(document.querySelector(".header-search-form-tab-hotels"));
    setHotelCopy();
    setHotelLayout();
    setHotelDestinationPlaceholder();
    createPaxNationalitySelect();
    setHotelSearchButtons();
    setHotelPropertiesLayout();

    if (helpers.hideVariableDays) {
      helpers.hideVariableDays(true);
    }
  }

  function switchToFlights() {
    if (!hotelsActive) {
      return;
    }

    hotelsActive = false;

    restoreElement(document.getElementById("searchForm-standard"));
    restoreElement(document.getElementById("searchForm-multiCity"));
    restoreHotelCopy();
    restoreHotelLayout();
    restoreHotelDestinationPlaceholder();
    removePaxNationalitySelect();
    restoreHotelSearchButtons();
    restoreHotelPropertiesLayout();
    removeHotelDestinationError();
  }

  function setActiveTab(activeTab) {
    document
      .querySelectorAll(".header-search-form-tab--active")
      .forEach((tab) => tab.classList.remove("header-search-form-tab--active"));

    if (activeTab) {
      activeTab.classList.add("header-search-form-tab--active");
    }
  }

  function setHotelCopy() {
    setElementText(
      "GOL_package-textStorage-SearchForm.to",
      text("SearchForm.hotels.destinationLabel", "Where do you want to go?")
    );
    setElementText(
      "GOL_package-textStorage-SearchForm.departureDate",
      text("SearchForm.hotels.checkInDate", "Check in date")
    );
    setElementText(
      "GOL_package-textStorage-SearchForm.returnDate",
      text("SearchForm.hotels.checkOutDate", "Check out date")
    );
  }

  function restoreHotelCopy() {
    restoreElementText("GOL_package-textStorage-SearchForm.to");
    restoreElementText("GOL_package-textStorage-SearchForm.departureDate");
    restoreElementText("GOL_package-textStorage-SearchForm.returnDate");
  }

  function setHotelLayout() {
    const secondColumn = document.querySelector(
      "#searchForm-standard .header-search-form-inner-second-col"
    );

    if (secondColumn) {
      secondColumn.classList.add("header-search-form-inner-second-col--hotels");
    }

    hideElement(getAirportField("from"));
    showElement(getAirportField("to"));
    showFormElement(document.getElementById("return_date-container"));
    hideElement(
      document.getElementById("header-search-form-multiCity-redirect-container")
    );
    hideElement(
      document.querySelector(
        ".header-search-form-additional-desktop-one-only-direct"
      )
    );
    hideElement(
      document.querySelector(
        ".header-search-form-additional-desktop-one-airlines"
      )
    );
    hideElement(
      getClosestElement(
        document.getElementById("GOL_package-search-airlines"),
        ".header-search-form-additional-desktop-one"
      )
    );
    hideElement(document.getElementById("GOL_package-variableDays"));
    hideElement(
      getClosestElement(
        document.getElementById("header-search-form-only-direct-mobile"),
        ".header-search-form-additional-mobile-one"
      )
    );
    hideElement(
      getClosestElement(
        document.getElementById("GOL_package-search-airlines-mobile"),
        ".header-search-form-additional-top-second"
      )
    );
    hideElement(
      getClosestElement(
        document.getElementById("GOL_package-search-airlines-mobile"),
        ".header-search-form-additional-mobile-one"
      )
    );
    hideElement(document.getElementById("GOL_package-variableDays-mobile"));
  }

  function restoreHotelLayout() {
    const secondColumn = document.querySelector(
      "#searchForm-standard .header-search-form-inner-second-col"
    );

    if (secondColumn) {
      secondColumn.classList.remove(
        "header-search-form-inner-second-col--hotels"
      );
    }

    restoreElement(getAirportField("from"));
    restoreElement(getAirportField("to"));
    restoreElement(document.getElementById("return_date-container"));
    restoreElement(
      document.getElementById("header-search-form-multiCity-redirect-container")
    );
    restoreElement(
      document.querySelector(
        ".header-search-form-additional-desktop-one-only-direct"
      )
    );
    restoreElement(
      document.querySelector(
        ".header-search-form-additional-desktop-one-airlines"
      )
    );
    restoreElement(
      getClosestElement(
        document.getElementById("GOL_package-search-airlines"),
        ".header-search-form-additional-desktop-one"
      )
    );
    restoreElement(document.getElementById("GOL_package-variableDays"));
    restoreElement(
      getClosestElement(
        document.getElementById("header-search-form-only-direct-mobile"),
        ".header-search-form-additional-mobile-one"
      )
    );
    restoreElement(
      getClosestElement(
        document.getElementById("GOL_package-search-airlines-mobile"),
        ".header-search-form-additional-top-second"
      )
    );
    restoreElement(
      getClosestElement(
        document.getElementById("GOL_package-search-airlines-mobile"),
        ".header-search-form-additional-mobile-one"
      )
    );
    restoreElement(document.getElementById("GOL_package-variableDays-mobile"));
  }

  function setHotelDestinationPlaceholder() {
    const destinationSelect = document.getElementById("airport-select-to");
    const placeholder = destinationSelect?.querySelector(
      ".react-select-2-placeholder"
    );
    const input = destinationSelect?.querySelector("input");

    if (placeholder) {
      setInlineElementText(
        placeholder,
        text("HotelSelect.hotelPlaceholder", "City name")
      );
    }
    setInputPlaceholder(
      input,
      text("HotelSelect.hotelPlaceholder", "City name")
    );
  }

  function restoreHotelDestinationPlaceholder() {
    const destinationSelect = document.getElementById("airport-select-to");
    const placeholder = destinationSelect?.querySelector(
      ".react-select-2-placeholder"
    );
    const input = destinationSelect?.querySelector("input");

    restoreInlineElementText(placeholder);
    restoreInputPlaceholder(input);
  }

  function createPaxNationalitySelect() {
    if (document.getElementById("GOL_package-hotels-pax-nationality")) {
      return;
    }

    const preferencesField = document.querySelector(
      "#searchForm-standard .preferences"
    );
    if (!preferencesField) {
      return;
    }

    const nationalityField = document.createElement("div");
    nationalityField.className =
      "header-search-form-inner-field preferences pax-nationality-select";
    nationalityField.id = "GOL_package-hotels-pax-nationality";
    nationalityField.innerHTML = `
      <span class="header-search-form-inner-field-label pax">${text(
        "SearchForm.paxNationality",
        "Pax nationality"
      )}</span>
      <div
        id="GOL_package-hotels-pax-nationality-select"
        class="GOL_package-hotels-nationality-select"
        role="combobox"
        aria-expanded="false"
        tabindex="0"
      >
        <span id="GOL_package-hotels-pax-nationality-value"></span>
        <input
          id="GOL_package-hotels-pax-nationality-search"
          class="GOL_package-hotels-nationality-search"
          type="text"
          autocomplete="off"
          aria-label="${text("SearchForm.paxNationality", "Pax nationality")}"
        />
        <span class="GOL_package-hotels-nationality-arrow"></span>
      </div>
      <div id="GOL_package-hotels-pax-nationality-menu" class="GOL_package-hotels-nationality-menu hidden">
        <div id="GOL_package-hotels-pax-nationality-options" class="GOL_package-hotels-nationality-options"></div>
      </div>
    `;

    preferencesField.parentNode.insertBefore(
      nationalityField,
      preferencesField.nextSibling
    );

    const options = getCountryOptions();
    const selectedValue =
      getHotelState().paxNationality ||
      GOL_Global.config.defaultCountry ||
      "CZ";
    const control = document.getElementById(
      "GOL_package-hotels-pax-nationality-select"
    );
    const selectedLabel = document.getElementById(
      "GOL_package-hotels-pax-nationality-value"
    );
    const menu = document.getElementById(
      "GOL_package-hotels-pax-nationality-menu"
    );
    const search = document.getElementById(
      "GOL_package-hotels-pax-nationality-search"
    );

    getHotelState().paxNationality = selectedValue;
    renderPaxNationalityValue(selectedLabel, options, selectedValue);
    renderPaxNationalityOptions(options);

    control.addEventListener("click", function (event) {
      if (!menu.classList.contains("hidden")) {
        if (
          event.target.classList.contains(
            "GOL_package-hotels-nationality-arrow"
          )
        ) {
          closePaxNationalityMenu(menu, control, search);
        }

        return;
      }

      openPaxNationalityMenu(menu, control, search);
    });
    control.addEventListener("keydown", function (event) {
      if (
        event.key === "Enter" ||
        event.key === " " ||
        event.key === "ArrowDown"
      ) {
        event.preventDefault();
        openPaxNationalityMenu(menu, control, search);
      }
      if (event.key === "Escape") {
        closePaxNationalityMenu(menu, control, search);
      }
    });
    search.addEventListener("input", function () {
      renderPaxNationalityOptions(options, search.value);
    });
    search.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closePaxNationalityMenu(menu, control, search);
        control.focus();
      }
    });
    nationalityField.addEventListener("focusout", function () {
      setTimeout(function () {
        if (!nationalityField.contains(document.activeElement)) {
          closePaxNationalityMenu(menu, control, search);
        }
      }, 0);
    });

    if (paxNationalityDocumentClickHandler) {
      document.removeEventListener("click", paxNationalityDocumentClickHandler);
    }
    paxNationalityDocumentClickHandler = function (event) {
      if (!nationalityField.contains(event.target)) {
        closePaxNationalityMenu(menu, control, search);
      }
    };
    document.addEventListener("click", paxNationalityDocumentClickHandler);
  }

  function removePaxNationalitySelect() {
    const nationalityField = document.getElementById(
      "GOL_package-hotels-pax-nationality"
    );

    if (paxNationalityDocumentClickHandler) {
      document.removeEventListener("click", paxNationalityDocumentClickHandler);
      paxNationalityDocumentClickHandler = null;
    }

    if (nationalityField) {
      nationalityField.remove();
    }
  }

  function getCountryOptions() {
    const countries = normalizeCountries(GOL_Global.config.countries);
    const fallbackCountry = GOL_Global.config.defaultCountry || "CZ";
    const fallbackOptions = [
      {
        value: fallbackCountry,
        label: fallbackCountry,
      },
    ];

    if (!countries || Object.keys(countries).length === 0) {
      return fallbackOptions;
    }

    return Object.entries(countries)
      .filter(([code]) => !code.includes("_"))
      .map(([code, name]) => ({
        value: code,
        label: `${name} (${code})`,
      }));
  }

  function normalizeCountries(countries) {
    if (Array.isArray(countries) && countries[0]?.Code) {
      return Object.fromEntries(
        countries.map((country) => [country.Code, country.$t])
      );
    }

    if (Array.isArray(countries) && countries[0]) {
      return countries[0];
    }

    return countries || {};
  }

  function renderPaxNationalityValue(target, options, value) {
    const selectedOption = options.find((option) => option.value === value);
    target.textContent = selectedOption?.label || value;
  }

  function renderPaxNationalityOptions(options, searchValue = "") {
    const optionsElement = document.getElementById(
      "GOL_package-hotels-pax-nationality-options"
    );
    const selectedValue = getHotelState().paxNationality;
    const normalizedSearchValue = searchValue.trim().toLowerCase();

    if (!optionsElement) {
      return;
    }

    optionsElement.innerHTML = "";
    options
      .filter((option) =>
        option.label.toLowerCase().includes(normalizedSearchValue)
      )
      .forEach((option) => {
        const optionElement = document.createElement("div");
        optionElement.className = `GOL_package-hotels-nationality-option ${
          option.value === selectedValue
            ? "GOL_package-hotels-nationality-option-selected"
            : ""
        }`;
        optionElement.setAttribute("role", "option");
        optionElement.setAttribute(
          "aria-selected",
          String(option.value === selectedValue)
        );
        optionElement.tabIndex = 0;
        optionElement.textContent = option.label;
        optionElement.addEventListener("click", function () {
          selectPaxNationalityOption(option, options);
        });
        optionElement.addEventListener("keydown", function (event) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectPaxNationalityOption(option, options);
          }
        });
        optionsElement.appendChild(optionElement);
      });
  }

  function selectPaxNationalityOption(option, options) {
    const control = document.getElementById(
      "GOL_package-hotels-pax-nationality-select"
    );
    const selectedLabel = document.getElementById(
      "GOL_package-hotels-pax-nationality-value"
    );
    const menu = document.getElementById(
      "GOL_package-hotels-pax-nationality-menu"
    );
    const search = document.getElementById(
      "GOL_package-hotels-pax-nationality-search"
    );

    getHotelState().paxNationality = option.value;
    renderPaxNationalityValue(selectedLabel, options, option.value);
    renderPaxNationalityOptions(options);
    closePaxNationalityMenu(menu, control, search);
    control?.focus();
  }

  function openPaxNationalityMenu(menu, control, search) {
    menu.classList.remove("hidden");
    control.setAttribute("aria-expanded", "true");
    control.classList.add("GOL_package-hotels-nationality-select-open");
    if (search) {
      search.value = "";
    }
    renderPaxNationalityOptions(getCountryOptions());
    search?.focus();
  }

  function closePaxNationalityMenu(menu, control, search) {
    menu?.classList.add("hidden");
    control?.setAttribute("aria-expanded", "false");
    control?.classList.remove("GOL_package-hotels-nationality-select-open");
    if (search) {
      search.value = "";
    }
  }

  function setHotelSearchButtons() {
    const label = text("SearchForm.hotels.search", "Search hotels");
    setElementText("GOL_package-textStorage-SearchForm.searchFlights", label);
    setElementText(
      "GOL_package-textStorage-SearchForm.searchFlights-mobile",
      label
    );
  }

  function restoreHotelSearchButtons() {
    restoreElementText("GOL_package-textStorage-SearchForm.searchFlights");
    restoreElementText(
      "GOL_package-textStorage-SearchForm.searchFlights-mobile"
    );
  }

  function setHotelPropertiesLayout() {
    const classSummary = document.querySelector(
      "#searchForm-standard #header-search-form-div_toggle_properties .header-search-form-inner-field-additional"
    );
    const propertiesTable = document.querySelector(
      "#searchForm-standard .header-search-form-properties-table"
    );

    hideElement(classSummary);
    hideElement(propertiesTable);
    renderHotelRooms();
    updateHotelPropertiesSummary();
  }

  function restoreHotelPropertiesLayout() {
    const classSummary = document.querySelector(
      "#searchForm-standard #header-search-form-div_toggle_properties .header-search-form-inner-field-additional"
    );
    const propertiesTable = document.querySelector(
      "#searchForm-standard .header-search-form-properties-table"
    );

    restoreElement(classSummary);
    restoreElement(propertiesTable);
    removeHotelRooms();

    if (helpers.updateProperties) {
      helpers.updateProperties("#searchForm-standard");
    }
  }

  function ensureHotelState() {
    getHotelState();
  }

  function getHotelState() {
    GOL_Global.HTMLSearchForm.hotels = GOL_Global.HTMLSearchForm.hotels || {};

    const hotelState = GOL_Global.HTMLSearchForm.hotels;
    if (!Array.isArray(hotelState.rooms) || hotelState.rooms.length === 0) {
      hotelState.rooms = [createDefaultRoom()];
    }

    hotelState.rooms = hotelState.rooms.map(normalizeRoom);
    hotelState.collapsedRooms = normalizeCollapsedRooms(
      hotelState.collapsedRooms,
      hotelState.rooms.length
    );
    hotelState.paxNationality =
      hotelState.paxNationality || GOL_Global.config.defaultCountry || "CZ";

    return hotelState;
  }

  function createDefaultRoom() {
    return {
      ADT: 1,
      CHD: 0,
      guests: 0,
      childAges: [],
    };
  }

  function normalizeRoom(room) {
    const adults = Math.max(Number(room?.ADT) || 0, 1);
    const children = Math.max(Number(room?.CHD) || 0, 0);
    const childAges = Array.isArray(room?.childAges)
      ? room.childAges.slice(0, children).map((age) => Number(age) || 0)
      : [];

    while (childAges.length < children) {
      childAges.push(HOTEL_DEFAULT_CHILD_AGE);
    }

    return {
      ADT: adults,
      CHD: children,
      guests: 0,
      childAges,
    };
  }

  function normalizeCollapsedRooms(collapsedRooms, roomsCount) {
    if (!Array.isArray(collapsedRooms)) {
      return Array.from({ length: roomsCount }, () => false);
    }

    const normalized = collapsedRooms.slice(0, roomsCount);
    while (normalized.length < roomsCount) {
      normalized.push(false);
    }

    return normalized;
  }

  function renderHotelRooms() {
    const propertiesPanel = document.querySelector(
      "#searchForm-standard #header-search-form-properties"
    );

    if (!propertiesPanel) {
      return;
    }

    removeHotelRooms();
    propertiesPanel.classList.add("GOL_package-hotels-rooms-panel");
    propertiesPanel.parentElement?.classList.add(
      "GOL_package-hotels-rooms-panel-anchor"
    );

    const state = getHotelState();
    const container = document.createElement("div");
    container.id = "GOL_package-hotels-rooms";
    container.className = "hotel-passenger-select";

    state.rooms.forEach((room, roomIndex) => {
      container.appendChild(createRoomElement(room, roomIndex));
    });

    container.appendChild(createRoomActions());
    propertiesPanel.appendChild(container);
  }

  function removeHotelRooms() {
    const hotelRooms = document.getElementById("GOL_package-hotels-rooms");
    if (hotelRooms) {
      hotelRooms.remove();
    }

    document
      .querySelectorAll(".GOL_package-hotels-rooms-panel")
      .forEach((panel) =>
        panel.classList.remove("GOL_package-hotels-rooms-panel")
      );
    document
      .querySelectorAll(".GOL_package-hotels-rooms-panel-anchor")
      .forEach((anchor) =>
        anchor.classList.remove("GOL_package-hotels-rooms-panel-anchor")
      );
  }

  function createRoomElement(room, roomIndex) {
    const state = getHotelState();
    const roomElement = document.createElement("div");
    roomElement.className = "hotel-select-container";

    const summaryRow = document.createElement("div");
    summaryRow.className = `room-summary-row ${
      state.collapsedRooms[roomIndex] ? "collapsed" : ""
    }`;
    summaryRow.id = `GOL_package-room-summary-${roomIndex}${
      state.collapsedRooms[roomIndex] ? "-collapsed" : ""
    }`;
    summaryRow.setAttribute("role", "button");
    summaryRow.setAttribute("tabindex", "0");
    summaryRow.setAttribute(
      "aria-expanded",
      String(!state.collapsedRooms[roomIndex])
    );
    summaryRow.addEventListener("click", function () {
      toggleRoomCollapse(roomIndex);
    });
    summaryRow.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleRoomCollapse(roomIndex);
      }
    });

    if (state.rooms.length > 1) {
      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "remove-room-button";
      removeButton.setAttribute(
        "aria-label",
        `${text("SearchForm.remove", "Remove")} ${text(
          "SearchForm.room",
          "Room"
        )} ${roomIndex + 1}`
      );
      removeButton.innerHTML = "x";
      removeButton.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        removeRoom(roomIndex);
      });
      summaryRow.appendChild(removeButton);
    }

    const summaryText = document.createElement("div");
    summaryText.className = "room-summary-text";
    summaryText.innerHTML = `<span class="room-title">${text(
      "SearchForm.room",
      "Room"
    )} ${roomIndex + 1}:</span> ${travelerLabel("ADT")}: ${
      room.ADT
    }, ${travelerLabel("CHD")}: ${room.CHD}`;
    summaryRow.appendChild(summaryText);

    const collapseIcon = document.createElement("span");
    collapseIcon.className = "collapse-icon";
    collapseIcon.innerHTML = `<img src="static/images/ico-arrow-down.svg" alt="" style="padding:2px;margin-left:5px;transition:all .4s ease;transform:${
      state.collapsedRooms[roomIndex] ? "rotate(180deg)" : "none"
    }" />`;
    summaryRow.appendChild(collapseIcon);

    roomElement.appendChild(summaryRow);

    if (!state.collapsedRooms[roomIndex]) {
      const details = document.createElement("div");
      details.className = "room-details";
      details.id = `GOL_package-room-details-${roomIndex}`;

      const passengersRow = document.createElement("div");
      passengersRow.className = "passengers-config-row";

      const counters = document.createElement("div");
      counters.className = "counters-row";
      counters.appendChild(createCounter(roomIndex, "ADT"));
      counters.appendChild(createCounter(roomIndex, "CHD"));
      passengersRow.appendChild(counters);

      if (room.CHD > 0) {
        passengersRow.appendChild(createChildAges(room, roomIndex));
      }

      details.appendChild(passengersRow);
      roomElement.appendChild(details);
    }

    return roomElement;
  }

  function createCounter(roomIndex, travelerType) {
    const state = getHotelState();
    const room = state.rooms[roomIndex];
    const value = Number(room[travelerType]) || 0;
    const roomTotal = room.ADT + room.CHD;
    const disabledMinus = travelerType === "ADT" ? value <= 1 : value <= 0;
    const disabledPlus = roomTotal >= HOTEL_ROOM_MAX_PASSENGERS;

    const row = document.createElement("div");
    row.className = "counter-item";

    const label = document.createElement("div");
    label.className = "counter-label";
    label.innerHTML = travelerLabel(travelerType);

    const counter = document.createElement("div");
    counter.className = "counter-container";

    const minus = document.createElement("img");
    minus.src = "static/images/ico-minus.svg";
    minus.alt = "minus icon";
    minus.className = `counter-sign ${
      disabledMinus ? "counter-sign-disabled" : ""
    }`;
    minus.id = `GOL_package-room-${roomIndex}-${travelerType}-minus`;
    minus.addEventListener("click", function () {
      if (!disabledMinus) {
        changeRoomPassenger(roomIndex, travelerType, -1);
      }
    });

    const valueElement = document.createElement("span");
    valueElement.id = `GOL_package-room-${roomIndex}-${travelerType}-value`;
    valueElement.innerHTML = String(value);

    const plus = document.createElement("img");
    plus.src = "static/images/ico-plus.svg";
    plus.alt = "plus icon";
    plus.className = `counter-sign ${
      disabledPlus ? "counter-sign-disabled" : ""
    }`;
    plus.id = `GOL_package-room-${roomIndex}-${travelerType}-plus`;
    plus.addEventListener("click", function () {
      if (!disabledPlus) {
        changeRoomPassenger(roomIndex, travelerType, 1);
      }
    });

    counter.appendChild(minus);
    counter.appendChild(valueElement);
    counter.appendChild(plus);
    row.appendChild(label);
    row.appendChild(counter);

    return row;
  }

  function createChildAges(room, roomIndex) {
    const childAgesRow = document.createElement("div");
    childAgesRow.className = "child-ages-row";

    const label = document.createElement("div");
    label.className = "child-age-label";
    label.innerHTML = text("SearchForm.ageOfChildren", "Age of child(ren)");
    childAgesRow.appendChild(label);

    const selects = document.createElement("div");
    selects.className = "child-age-selects";

    for (let rowIndex = 0; rowIndex < Math.ceil(room.CHD / 4); rowIndex++) {
      const selectorRow = document.createElement("div");
      selectorRow.className = "age-selector-row";

      for (
        let childOffset = 0;
        childOffset < Math.min(4, room.CHD - rowIndex * 4);
        childOffset++
      ) {
        const childIndex = rowIndex * 4 + childOffset;
        selectorRow.appendChild(
          createChildAgeSelect(room, roomIndex, childIndex)
        );
      }

      selects.appendChild(selectorRow);
    }

    childAgesRow.appendChild(selects);
    return childAgesRow;
  }

  function createChildAgeSelect(room, roomIndex, childIndex) {
    const group = document.createElement("div");
    group.className = "age-selector-group";

    const select = document.createElement("select");
    select.className = "header-search-form-child-age-select";
    select.id = `GOL_package-room-${roomIndex}-child-age-${childIndex}`;

    for (let age = 0; age <= 18; age++) {
      const option = document.createElement("option");
      option.value = String(age);
      option.innerHTML = formatAge(age);
      select.appendChild(option);
    }

    select.value = String(
      room.childAges[childIndex] ?? HOTEL_DEFAULT_CHILD_AGE
    );
    select.addEventListener("change", function () {
      const state = getHotelState();
      state.rooms[roomIndex].childAges[childIndex] = Number(select.value);
      renderHotelRooms();
      updateHotelPropertiesSummary();
    });

    group.appendChild(select);
    return group;
  }

  function createRoomActions() {
    const state = getHotelState();
    const actions = document.createElement("div");
    actions.className = "action-buttons";

    const wrapper = document.createElement("div");
    wrapper.className = "buttons-section-wrapper";

    const managementButtons = document.createElement("div");
    managementButtons.className = "buttons-container";

    if (state.rooms.length < HOTEL_MAX_ROOMS) {
      const addButton = document.createElement("button");
      addButton.type = "button";
      addButton.id = "add-room-button";
      addButton.className = "button button-secondary-color";
      addButton.innerHTML = text("SearchForm.addRoom", "Add room");
      addButton.addEventListener("click", addRoom);
      managementButtons.appendChild(addButton);
    }

    const resetButton = document.createElement("button");
    resetButton.type = "button";
    resetButton.id = "reset-rooms-button";
    resetButton.className = "button button-secondary-color";
    resetButton.disabled = isDefaultRoomsState();
    resetButton.innerHTML =
      state.rooms.length > 1
        ? text("SearchForm.resetRooms", "Reset rooms")
        : text("SearchForm.resetRoom", "Reset room");
    resetButton.addEventListener("click", resetRooms);
    managementButtons.appendChild(resetButton);

    const doneButtons = document.createElement("div");
    doneButtons.className = "buttons-container done-button";
    const doneButton = document.createElement("button");
    doneButton.type = "button";
    doneButton.id = "done-room-button";
    doneButton.className = "button button-secondary-color";
    doneButton.title = text("PropertiesSelect.done", "Done");
    doneButton.innerHTML = text("PropertiesSelect.done", "Done");
    doneButton.addEventListener("click", closePropertiesPanel);
    doneButtons.appendChild(doneButton);

    wrapper.appendChild(managementButtons);
    wrapper.appendChild(doneButtons);
    actions.appendChild(wrapper);
    return actions;
  }

  function changeRoomPassenger(roomIndex, travelerType, diff) {
    const state = getHotelState();
    const room = state.rooms[roomIndex];
    const currentValue = Number(room[travelerType]) || 0;
    const minValue = travelerType === "ADT" ? 1 : 0;
    const newValue = currentValue + diff;

    if (newValue < minValue) {
      return;
    }

    if (diff > 0 && room.ADT + room.CHD >= HOTEL_ROOM_MAX_PASSENGERS) {
      return;
    }

    room[travelerType] = newValue;

    if (travelerType === "CHD") {
      room.childAges = room.childAges || [];
      if (diff > 0) {
        room.childAges.push(HOTEL_DEFAULT_CHILD_AGE);
      } else {
        room.childAges = room.childAges.slice(0, newValue);
      }
    }

    state.rooms[roomIndex] = normalizeRoom(room);
    renderHotelRooms();
    updateHotelPropertiesSummary();
  }

  function addRoom() {
    const state = getHotelState();
    if (state.rooms.length >= HOTEL_MAX_ROOMS) {
      return;
    }

    state.rooms = [...state.rooms, createDefaultRoom()];
    state.collapsedRooms = [...state.rooms.slice(0, -1).map(() => true), false];
    renderHotelRooms();
    updateHotelPropertiesSummary();
  }

  function removeRoom(roomIndex) {
    const state = getHotelState();
    if (state.rooms.length <= 1) {
      return;
    }

    state.rooms.splice(roomIndex, 1);
    state.collapsedRooms.splice(roomIndex, 1);
    renderHotelRooms();
    updateHotelPropertiesSummary();
  }

  function resetRooms() {
    const state = getHotelState();
    state.rooms = [createDefaultRoom()];
    state.collapsedRooms = [false];
    renderHotelRooms();
    updateHotelPropertiesSummary();
  }

  function toggleRoomCollapse(roomIndex) {
    const state = getHotelState();
    const isOpening = state.collapsedRooms[roomIndex];
    state.collapsedRooms = state.collapsedRooms.map((collapsed, index) => {
      if (index === roomIndex) {
        return !collapsed;
      }
      return isOpening ? true : collapsed;
    });
    renderHotelRooms();
  }

  function isDefaultRoomsState() {
    const rooms = getHotelState().rooms;
    return (
      rooms.length === 1 &&
      rooms[0].ADT === 1 &&
      rooms[0].CHD === 0 &&
      rooms[0].guests === 0
    );
  }

  function closePropertiesPanel() {
    const propertiesPanel = document.querySelector(
      "#searchForm-standard #header-search-form-properties"
    );
    const backdrop = document.querySelector(".loader-wrapper-mini");
    const arrow = document.querySelector(
      "#searchForm-standard #header-search-form-properties-arrow"
    );

    if (propertiesPanel) {
      propertiesPanel.classList.add("hidden");
    }
    if (backdrop) {
      backdrop.classList.add("hidden");
    }
    if (arrow) {
      arrow.style.transform = "rotate(0deg)";
    }
  }

  function updateHotelPropertiesSummary() {
    const summary = document.querySelector(
      "#searchForm-standard #header-search-form-properties-value"
    );

    if (!summary) {
      return;
    }

    const state = getHotelState();
    const totalPassengers = state.rooms.reduce(
      (sum, room) => sum + room.ADT + room.CHD,
      0
    );
    const totalRooms = state.rooms.length;

    summary.innerHTML = `${totalPassengers} ${correctGuestWording(
      totalPassengers
    )}, ${totalRooms} ${correctRoomWording(totalRooms)}`;
  }

  function correctGuestWording(count) {
    return count === 1
      ? text("General.guestsCountOne", "guest")
      : text("General.guestsCountOther", "guests");
  }

  function correctRoomWording(count) {
    if (count === 1) {
      return text("PropertiesSelect.OneRoom", "room");
    }

    if (count > 1 && count < 5) {
      return text("PropertiesSelect.TwoFourRooms", "rooms");
    }

    return text("PropertiesSelect.FivePlusRooms", "rooms");
  }

  function travelerLabel(travelerType) {
    return text(`PassengerCodes.${travelerType}`, travelerType);
  }

  function getAirportField(type) {
    return getClosestElement(
      document.getElementById(`airport-select-${type}`),
      ".header-search-form-inner-field"
    );
  }

  function ensureHotelStyles() {
    if (document.getElementById("GOL_package-hotels-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "GOL_package-hotels-styles";
    style.innerHTML = `
      #GOL_package-hotels-pax-nationality {
        flex: 0 0 auto;
        width: 250px;
        max-width: 250px;
        height: auto;
        margin-bottom: 8px;
      }

      #GOL_package-hotels-pax-nationality .header-search-form-inner-field-label.pax {
        margin-bottom: 0;
        font-size: 13px;
        line-height: 18px;
      }

      #GOL_package-hotels-pax-nationality {
        position: relative;
      }

      #GOL_package-hotels-pax-nationality .GOL_package-hotels-nationality-select {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        height: 38px;
        box-sizing: border-box;
        padding: 0 26px 0 0;
        border: 0;
        border-radius: 0;
        outline: none;
        background-color: transparent;
        color: #131f6b;
        font-family: inherit;
        font-size: 19px;
        font-weight: 700;
        line-height: 38px;
        cursor: pointer;
      }

      #GOL_package-hotels-pax-nationality .GOL_package-hotels-nationality-select:focus {
        outline: none;
      }

      #GOL_package-hotels-pax-nationality-value {
        display: block;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      #GOL_package-hotels-pax-nationality-search {
        display: none;
        width: 100%;
        min-width: 0;
        height: 38px;
        padding: 0;
        border: 0;
        outline: none;
        background: transparent;
        color: #131f6b;
        font-family: inherit;
        font-size: 19px;
        font-weight: 700;
        line-height: 38px;
      }

      #GOL_package-hotels-pax-nationality .GOL_package-hotels-nationality-select-open #GOL_package-hotels-pax-nationality-value {
        display: none;
      }

      #GOL_package-hotels-pax-nationality .GOL_package-hotels-nationality-select-open #GOL_package-hotels-pax-nationality-search {
        display: block;
      }

      #GOL_package-hotels-pax-nationality .GOL_package-hotels-nationality-arrow {
        position: absolute;
        right: 7px;
        top: 35px;
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 8px solid #f36f21;
        z-index: 1;
        cursor: pointer;
        transition: transform 0.2s ease;
      }

      #GOL_package-hotels-pax-nationality .GOL_package-hotels-nationality-select-open .GOL_package-hotels-nationality-arrow {
        transform: rotate(180deg);
      }

      #GOL_package-hotels-pax-nationality-menu {
        position: absolute;
        top: 60px;
        left: 0;
        z-index: 4;
        width: 250px;
        max-width: calc(100vw - 40px);
        padding: 0;
        border-radius: 0 0 5px 5px;
        background: #fff;
        box-shadow: 0 0 13px 0 rgba(158, 160, 172, 0.14);
        animation: fadeIn 0.2s ease;
      }

      #GOL_package-hotels-pax-nationality-menu.hidden {
        display: none;
      }

      #GOL_package-hotels-pax-nationality-options {
        max-height: 300px;
        overflow-y: auto;
      }

      #GOL_package-hotels-pax-nationality .GOL_package-hotels-nationality-option {
        min-height: 36px;
        padding: 8px 12px;
        color: #222;
        cursor: pointer;
        font-family: inherit;
        font-size: 16px;
        line-height: 20px;
      }

      #GOL_package-hotels-pax-nationality .GOL_package-hotels-nationality-option:hover,
      #GOL_package-hotels-pax-nationality .GOL_package-hotels-nationality-option:focus,
      #GOL_package-hotels-pax-nationality .GOL_package-hotels-nationality-option-selected {
        background: #e3edf4;
        outline: none;
      }

      .header-search-form-tab-hotels .header-search-form-tab-ico {
        display: block !important;
        flex: 0 0 22px;
        width: 22px;
        height: 16px;
        margin-right: 0 !important;
      }

      .header-search-form-tabs-with-hotels .header-search-form-tab-hotels {
        display: flex !important;
        align-items: center;
        justify-content: center;
        flex: 0 0 108px;
        gap: 6px;
        min-width: 108px;
        width: 108px;
        box-sizing: border-box;
        padding: 0 10px;
      }

      .header-search-form-tab-hotels .header-search-form-tab-text-ellipsis {
        flex: 0 0 auto;
        width: auto;
        overflow: visible;
        text-overflow: clip;
      }

      .header-search-form-inner-second-col--hotels > .header-search-form-desktop-line-one.preferences {
        flex: 0 0 75px;
        margin-bottom: 7px;
      }

      .header-search-form-inner-second-col--hotels #header-search-form-div_toggle_properties {
        align-items: center;
        width: 250px;
        box-sizing: border-box;
        padding-right: 7px;
        justify-content: space-between;
      }

      .header-search-form-inner-second-col--hotels #header-search-form-properties-arrow {
        flex: 0 0 auto;
        width: 0 !important;
        height: 0 !important;
        margin-left: 0 !important;
        padding: 0 !important;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 8px solid #f36f21;
        box-sizing: content-box;
      }

      .header-search-form-inner-second-col--hotels .GOL_package-hotels-rooms-panel-anchor {
        position: relative;
        width: 250px;
        max-width: 100%;
      }

      #GOL_package-hotels-rooms {
        width: 100%;
        max-width: none;
        margin: 0;
        padding: 0 0 10px;
        color: #131f6b;
        font-family: Muli, Arial, sans-serif;
      }

      #searchForm-standard #header-search-form-properties.GOL_package-hotels-rooms-panel {
        position: absolute;
        left: 0 !important;
        top: calc(100% + 8px);
        right: auto;
        width: 500px;
        max-width: calc(100vw - 40px);
        max-height: calc(100vh - 160px);
        margin: 0;
        box-sizing: border-box;
        overflow-y: auto;
        transform: none;
        z-index: 1001;
      }

      #GOL_package-hotels-rooms .hotel-select-container {
        margin: 0 10px 8px;
        border-bottom: 1px solid #e6ebf2;
        border-radius: 0;
      }

      #GOL_package-hotels-rooms .room-summary-row {
        min-height: 38px;
        padding: 8px 0;
        gap: 8px;
      }

      #GOL_package-hotels-rooms .room-title {
        font-size: 15px;
        line-height: 20px;
        margin-right: 4px;
      }

      #GOL_package-hotels-rooms .room-summary-text {
        font-size: 14px;
        line-height: 20px;
      }

      #GOL_package-hotels-rooms .collapse-icon {
        display: flex;
        align-items: center;
        margin-left: 6px;
      }

      #GOL_package-hotels-rooms .collapse-icon img {
        width: 12px;
        height: 12px;
      }

      #GOL_package-hotels-rooms .room-details {
        margin: 0;
        padding: 8px 0 12px;
        border-bottom: 0;
      }

      #GOL_package-hotels-rooms .passengers-config-row {
        align-items: flex-start;
        gap: 16px;
      }

      #GOL_package-hotels-rooms .counters-row {
        flex: 0 0 199px;
        width: 199px;
        min-width: 0;
        gap: 8px;
      }

      #GOL_package-hotels-rooms .counter-item {
        justify-content: flex-start;
        width: 100%;
        min-height: 28px;
        gap: 14px;
      }

      #GOL_package-hotels-rooms .counter-label {
        flex: 0 0 42px;
        min-width: 42px;
        font-size: 14px;
        line-height: 20px;
        font-weight: 500;
      }

      #GOL_package-hotels-rooms .counter-container {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        min-width: 0;
        gap: 10px;
        font-size: 15px;
        font-weight: 500;
      }

      #GOL_package-hotels-rooms [id^="GOL_package-room-"][id$="-value"] {
        min-width: 10px;
        text-align: center;
        font-weight: 500;
      }

      #GOL_package-hotels-rooms .counter-sign {
        width: 17px;
        height: 17px;
      }

      #GOL_package-hotels-rooms .remove-room-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        margin-right: 2px;
        padding: 0px 0px 2px 0px;
        border-radius: 4px;
        font-size: 15px;
        line-height: 1;
      }

      #GOL_package-hotels-rooms .action-buttons {
        margin-top: 12px;
        padding: 0 10px;
        justify-content: stretch;
      }

      #GOL_package-hotels-rooms .buttons-section-wrapper {
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        padding: 0;
      }

      #GOL_package-hotels-rooms .buttons-container {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      #GOL_package-hotels-rooms .buttons-section-wrapper > .buttons-container:not(.done-button) {
        flex: 1 1 auto;
      }

      #GOL_package-hotels-rooms .done-button {
        flex: 0 0 auto;
        justify-content: flex-end;
        margin-left: auto;
      }

      #GOL_package-hotels-rooms .button {
        min-height: 32px;
        padding: 0 12px;
        border-radius: 4px;
        font-size: 13px;
        line-height: 32px;
        white-space: nowrap;
      }

      #GOL_package-hotels-rooms .child-ages-row {
        flex: 1 1 112px;
        min-width: 112px;
        align-self: flex-start;
        margin-top: 2px;
      }

      #GOL_package-hotels-rooms .child-age-label {
        justify-content: flex-start;
        text-align: left;
        font-size: 13px;
      }

      #GOL_package-hotels-rooms .age-selector-row {
        gap: 8px;
        justify-content: flex-start;
      }

      #GOL_package-hotels-rooms .header-search-form-child-age-select {
        width: 112px;
        height: 32px;
        padding: 0 8px;
        border: 1px solid #dfe6ef;
        border-radius: 4px;
        background: #fff;
        color: #131f6b;
        font-family: Muli, Arial, sans-serif;
        font-size: 13px;
      }

      @media (max-width: 960px) {
        .header-search-form-inner-second-col--hotels #header-search-form-div_toggle_properties {
          width: 100%;
          max-width: none;
        }

        .header-search-form-inner-second-col--hotels .GOL_package-hotels-rooms-panel-anchor {
          width: 100%;
        }

        #searchForm-standard #header-search-form-properties.GOL_package-hotels-rooms-panel {
          left: 0 !important;
          right: auto;
          width: 100%;
          max-width: 100%;
          max-height: calc(100vh - 160px);
        }

        #GOL_package-hotels-pax-nationality,
        #GOL_package-hotels-rooms {
          flex-basis: auto;
          width: 100%;
          max-width: none;
        }

        #GOL_package-hotels-pax-nationality-menu {
          left: 0;
          width: 100%;
        }

        #GOL_package-hotels-rooms .passengers-config-row {
          flex-direction: column;
          align-items: stretch;
          gap: 12px;
        }

        #GOL_package-hotels-rooms .counters-row {
          flex: 0 0 auto;
          width: 100%;
          height: auto;
        }

        #GOL_package-hotels-rooms .counter-item {
          justify-content: space-between;
          gap: 10px;
        }

        #GOL_package-hotels-rooms .child-ages-row {
          flex: 0 0 auto;
          width: 100%;
          min-width: 0;
          margin-top: 0;
        }

        #GOL_package-hotels-rooms .buttons-section-wrapper {
          flex-direction: column;
          align-items: stretch;
        }

        #GOL_package-hotels-rooms .done-button {
          margin-left: 0;
          justify-content: flex-end;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function logHotelDebug(message, details = {}) {
    if (!window.console) {
      return;
    }

    const logMessage = `[HTMLPackage][Hotels] ${message}`;

    if (window.console.info) {
      window.console.info(logMessage, details);
      return;
    }

    window.console.log(logMessage, details);
  }

  function submit() {
    removeHotelDestinationError();

    const destination = getHotelDestination();
    if (!destination) {
      showHotelDestinationError();
      return;
    }

    const { HTMLSearchForm, config } = GOL_Global;
    const hotelState = getHotelState();
    const passengers = getHotelPassengers(hotelState.rooms);
    const query = {
      INF: passengers.INF,
      CHD: passengers.CHD,
      ADT: passengers.ADT,
      guests: 0,
      destination,
      departureDate: helpers.getBasicDate(
        HTMLSearchForm.flights[0].departure_date
      ),
      returnDate: helpers.getBasicDate(HTMLSearchForm.flights[0].return_date),
      typeSearch: "hotels",
      sort: HOTEL_SORT,
      paxNationality:
        hotelState.paxNationality || config.defaultCountry || "CZ",
      date: Date.now(),
    };

    hotelState.rooms.forEach((room, roomIndex) => {
      query[`room_${roomIndex}_ADT`] = room.ADT;
      query[`room_${roomIndex}_CHD`] = room.CHD;
      query[`room_${roomIndex}_guests`] = 0;
      room.childAges.forEach((age, ageIndex) => {
        query[`room_${roomIndex}_CHD_age_${ageIndex}`] = age;
      });
    });

    const lang = new URLSearchParams(window.location.search).get("lang");
    if (lang) {
      query.lang = lang;
    }

    const redirectUrl = `${getFrontendUrl()}${HOTEL_SEARCH_PATH}?${helpers.encodeQueryData(
      query
    )}`;

    logHotelDebug("hotel search redirect", {
      redirectUrl,
      destination,
      rooms: hotelState.rooms.length,
      passengers,
      paxNationality: query.paxNationality,
      lang: query.lang || GOL_Global.config?.lang,
    });

    window.location.href = redirectUrl;
  }

  function getHotelPassengers(rooms) {
    return rooms.reduce(
      (passengers, room) => ({
        INF: 0,
        CHD: passengers.CHD + room.CHD,
        ADT: passengers.ADT + room.ADT,
      }),
      {
        INF: 0,
        CHD: 0,
        ADT: 0,
      }
    );
  }

  function getHotelDestination() {
    const selectedDestination = GOL_Global.HTMLSearchForm.flights[0].to;
    return resolveParentDestination(selectedDestination);
  }

  function resolveParentDestination(destination) {
    if (!destination) {
      return "";
    }

    const destinationMatch = getKnownDestinations().find(
      (knownDestination) => knownDestination.Code === destination
    );

    return destinationMatch?.Parent || destination;
  }

  function getKnownDestinations() {
    return [
      ...(GOL_Global.foundAirports || []),
      ...(GOL_Global.config?.defaultAirports || []),
    ];
  }

  function showHotelDestinationError() {
    const field = getAirportField("to");
    if (
      !field ||
      document.getElementById("searchForm-error-hotel-destination")
    ) {
      return;
    }

    const error = document.createElement("div");
    error.className = "search-field-error";
    error.id = "searchForm-error-hotel-destination";
    error.innerHTML = text("SearchForm.fillInPlaces", "Fill in destination.");
    field.appendChild(error);
  }

  function removeHotelDestinationError() {
    const error = document.getElementById("searchForm-error-hotel-destination");
    if (error) {
      error.remove();
    }
  }

  function setElementText(id, value) {
    const element = document.getElementById(id);
    if (!element) {
      return;
    }

    if (element.dataset.golHotelsOriginalText === undefined) {
      element.dataset.golHotelsOriginalText = element.innerHTML;
    }

    element.innerHTML = value;
  }

  function restoreElementText(id) {
    const element = document.getElementById(id);
    if (!element || element.dataset.golHotelsOriginalText === undefined) {
      return;
    }

    element.innerHTML = element.dataset.golHotelsOriginalText;
    delete element.dataset.golHotelsOriginalText;
  }

  function setInlineElementText(element, value) {
    if (!element) {
      return;
    }

    if (element.dataset.golHotelsOriginalText === undefined) {
      element.dataset.golHotelsOriginalText = element.innerHTML;
    }

    element.innerHTML = value;
  }

  function restoreInlineElementText(element) {
    if (!element || element.dataset.golHotelsOriginalText === undefined) {
      return;
    }

    element.innerHTML = element.dataset.golHotelsOriginalText;
    delete element.dataset.golHotelsOriginalText;
  }

  function setInputPlaceholder(input, value) {
    if (!input) {
      return;
    }

    if (input.dataset.golHotelsOriginalPlaceholder === undefined) {
      input.dataset.golHotelsOriginalPlaceholder =
        input.getAttribute("placeholder") || "";
    }

    input.setAttribute("placeholder", value);
    input.setAttribute("aria-label", value);
  }

  function restoreInputPlaceholder(input) {
    if (!input || input.dataset.golHotelsOriginalPlaceholder === undefined) {
      return;
    }

    input.setAttribute(
      "placeholder",
      input.dataset.golHotelsOriginalPlaceholder
    );
    input.setAttribute(
      "aria-label",
      input.dataset.golHotelsOriginalPlaceholder
    );
    delete input.dataset.golHotelsOriginalPlaceholder;
  }

  function hideElement(element) {
    if (!element) {
      return;
    }

    if (element.dataset.golHotelsOriginalDisplay === undefined) {
      element.dataset.golHotelsOriginalDisplay = element.style.display || "";
    }

    element.style.display = "none";
  }

  function hideFormElement(element) {
    hideElement(element);
    element?.classList.add("hidden");
  }

  function showElement(element) {
    if (!element) {
      return;
    }

    if (element.dataset.golHotelsOriginalDisplay === undefined) {
      element.dataset.golHotelsOriginalDisplay = element.style.display || "";
    }

    element.style.display = "";
  }

  function showFormElement(element) {
    showElement(element);
    element?.classList.remove("hidden");
  }

  function restoreElement(element) {
    if (!element || element.dataset.golHotelsOriginalDisplay === undefined) {
      return;
    }

    element.style.display = element.dataset.golHotelsOriginalDisplay;
    delete element.dataset.golHotelsOriginalDisplay;
  }

  function getClosestElement(element, selector) {
    return element && element.closest ? element.closest(selector) : null;
  }

  function text(key, fallback) {
    return GOL_Global.textStorage?.[key] || fallback;
  }

  function formatAge(age) {
    const template = text("SearchForm.age", "");

    if (!template) {
      return `${age}`;
    }

    if (!template.includes("plural")) {
      return template.replace("{count}", age).replace("#", age);
    }

    const exactMatch = template.match(new RegExp(`=${age}\\s*\\{([^{}]+)\\}`));
    if (exactMatch) {
      return exactMatch[1].replace("#", age);
    }

    if (age === 1) {
      const oneMatch = template.match(/one\s*\{([^{}]+)\}/);
      if (oneMatch) {
        return oneMatch[1].replace("#", age);
      }
    }

    const otherMatch = template.match(/other\s*\{([^{}]+)\}/);
    if (otherMatch) {
      return otherMatch[1].replace("#", age);
    }

    return `${age}`;
  }

  function getFrontendUrl() {
    const config = GOL_Global.config || {};
    const url = config.feUrl || config.url || window.location.origin;

    return String(url)
      .replace(/\/index\.php$/, "")
      .replace(/\/$/, "");
  }

  window.GOL_HTMLPackageHotels = {
    init,
    isActive: function () {
      return (
        hotelsActive ||
        GOL_Global.HTMLSearchForm?.typeSearch === HOTEL_TYPE_SEARCH
      );
    },
    submit,
  };
})();
