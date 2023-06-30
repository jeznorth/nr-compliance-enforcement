describe("COMPENF-37 Display ECR Details", () => {

  const callDetails = { 
    description: "Caller reporting potential dumping of skidder loader tires. Caller advised that a guy showed up to dump some tires and was upset at the price and told the caller he would dump them over the road embankment. Caller advised last seen at location noted below.",
    location: "Crystal Lake Rec Site",
    locationDescription: "tester call description 4", 
    incidentTime: "2023-04-07T07:24:00.000Z",
    community: "Crystal Lake",
    office: "Clearwater",
    zone: "Cariboo Thompson",
    region: "Thompson Cariboo",
    violationInProgress: true,
    violationObserved: false
  }

  beforeEach(function () {
    cy.viewport("macbook-16");
    cy.kcLogout().kcLogin();
  });

  it("it has records in table view", () => {
    //-- navigate to application root
    cy.visit("/");
    
    //-- click on Allegation tab
    cy.get("#ers-tab").click({ force: true });

    cy.wait(5000);

    //-- check to make sure there are items in the table
    cy.get("#comp-table")
      .find("tr")
      .then(({ length }) => {
        expect(length, "rows N").to.be.gt(0);
      });
  });

  it("it can select record", () => {
    //-- navigate to application root
    cy.visit("/");

    //-- click on HWCR tab
    cy.get("#ers-tab").click({ force: true });
    cy.wait(5000);

    //-- check to make sure there are items in the table
    cy.get("#comp-table")
      .find("tr")
      .then(({ length }) => {
        expect(length, "rows N").to.be.gt(0);
      });
    cy.wait(2000);
    cy.get("#comp-table > tbody > tr:nth-child(17) td.comp-violation-cell.comp-cell").click({ force: true });

    //-- verify the right complaint identifier is selected and the animal type
    cy.get(".comp-box-complaint-id").contains("23-006884")
    cy.get("#root > div > div.comp-main-content > div > div.comp-details-header > div.comp-nature-of-complaint").contains("Recreation sites/ trails")
  });

  it("it has correct call details", () => {
    //-- navigate to application root
    cy.visit("/");

    //-- click on HWCR tab
    cy.get("#ers-tab").click({ force: true });
    cy.wait(7000);

    //-- check to make sure there are items in the table
    cy.get("#comp-table")
      .find("tr")
      .then(({ length }) => {
        expect(length, "rows N").to.be.gt(0);
      });

    cy.get("#comp-table > tbody > tr:nth-child(17) td.comp-violation-cell.comp-cell").click({ force: true });

    //-- verify the call details block
    cy.get("#root > div > div.comp-main-content > div > div:nth-child(4) > div > div > div.comp-padding-right-28.col-md-6 > div:nth-child(1) > p").contains(callDetails.description)
    cy.get("#root > div > div.comp-main-content > div > div:nth-child(4) > div > div > div.comp-padding-left-28.col-md-6 > div:nth-child(1) > div.comp-details-content").contains(callDetails.location)
    cy.get("#root > div > div.comp-main-content > div > div:nth-child(4) > div > div > div.comp-padding-left-28.col-md-6 > div:nth-child(2) > p").contains(callDetails.locationDescription)
    cy.get("#root > div > div.comp-main-content > div > div:nth-child(4) > div > div > div.comp-padding-left-28.col-md-6 > div:nth-child(4) > span.comp-details-content").contains(callDetails.community)
    cy.get("#root > div > div.comp-main-content > div > div:nth-child(4) > div > div > div.comp-padding-right-28.col-md-6 > div:nth-child(3) > span.comp-details-content").contains(callDetails.violationInProgress ? "Yes" : "No")
    cy.get("#root > div > div.comp-main-content > div > div:nth-child(4) > div > div > div.comp-padding-left-28.col-md-6 > div:nth-child(5) > span.comp-details-content").contains(callDetails.office)
    cy.get("#root > div > div.comp-main-content > div > div:nth-child(4) > div > div > div.comp-padding-right-28.col-md-6 > div:nth-child(4) > span.comp-details-content").contains(callDetails.violationObserved ? "Yes" : "No")
    cy.get("#root > div > div.comp-main-content > div > div:nth-child(4) > div > div > div.comp-padding-left-28.col-md-6 > div:nth-child(6) > span.comp-details-content").contains(callDetails.zone)
    cy.get("#root > div > div.comp-main-content > div > div:nth-child(4) > div > div > div.comp-padding-left-28.col-md-6 > div:nth-child(7) > span.comp-details-content").contains(callDetails.region)
  });


});