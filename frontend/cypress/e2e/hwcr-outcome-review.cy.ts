import COMPLAINT_TYPES from "../../src/app/types/app/complaint-types";

describe("HWCR File Review", () => {
  beforeEach(function () {
    cy.viewport("macbook-16");
    cy.kcLogout().kcLogin();
  });

  it("it requires valid user input", () => {
    cy.navigateToDetailsScreen(COMPLAINT_TYPES.HWCR, "23-030851", true);

    //This is required to make the tests re-runnable.  It's not great because it means it will only run the first time.
    //If we ever get the ability to remove an prevention and education this test suite should be rewritten to remove this conditional
    //and to add a test at the end to delete the prevention and education.
    cy.get(".comp-outcome-report-file-review").then(function ($review) {
      if ($review.find("#file-review-save-button").length > 0) {
        cy.validateComplaint("23-030851", "Black Bear");

        cy.get("#file-review-save-button").click();

        //validate error toast
        //cy.get(".Toastify__toast-body").then(($toast) => {
        //  expect($toast).to.contain.text("Unable to update file review");
        //});
      } else {
        cy.log("Test was previously run. Skip the Test");
        this.skip();
      }
    });
  });

  it("it can save review", () => {
    cy.navigateToDetailsScreen(COMPLAINT_TYPES.HWCR, "23-030851", true);

    //This is required to make the tests re-runnable.  It's not great because it means it will only run the first time.
    //If we ever get the ability to remove an assessment this test suite should be rewritten to remove this conditional
    //and to add a test at the end to delete the assessment.
    cy.get(".comp-outcome-report-file-review").then(function ($review) {
      if ($review.find("#file-review-save-button").length > 0) {
        cy.validateComplaint("23-030851", "Black Bear");

        cy.get("#review-required").check();

        cy.get("#file-review-save-button").click();

        //validate the checkboxes
        cy.get("#review-required").should("be.checked");

        //validate the toast
        cy.get(".Toastify__toast-body").then(($toast) => {
          expect($toast).to.contain.text("File review has been updated");
        });
      } else {
        cy.log("Test was previously run. Skip the Test");
        this.skip();
      }
    });
  });

  it("it can cancel review edits", () => {
    cy.navigateToDetailsScreen(COMPLAINT_TYPES.HWCR, "23-030851", true);

    cy.validateComplaint("23-030851", "Black Bear");

    cy.get(".comp-outcome-report-file-review").then(function ($review) {
      if ($review.find("#review-edit-button").length) {
        cy.get("#review-edit-button").click();

        cy.get("#review-required").uncheck();

        cy.get("#file-review-cancel-button").click();

        cy.get(".modal-footer > .btn-primary")
          .click()
          .then(function () {});

        cy.get("#review-required").should("be.checked");
      } else {
        cy.log("File Review Edit Button Not Found, did a previous test fail? Skip the Test");
        this.skip();
      }
    });
  });

  it("it can edit an existing review", () => {
    cy.navigateToDetailsScreen(COMPLAINT_TYPES.HWCR, "23-030851", true);

    cy.validateComplaint("23-030851", "Black Bear");

    cy.get(".comp-outcome-report-file-review").then(function ($review) {
      if ($review.find("#review-edit-button").length) {
        cy.get("#review-edit-button").click();

        cy.get("#review-required").uncheck();

        cy.get("#file-review-save-button").click();

        cy.get(".comp-outcome-report-file-review").should("not.be.checked");

        //validate the toast
        cy.get(".Toastify__toast-body").then(($toast) => {
          expect($toast).to.contain.text("File review has been updated");
        });
      } else {
        cy.log("File Review Edit Button Not Found, did a previous test fail? Skip the Test");
        this.skip();
      }
    });
  });

  it("it can save a complete review", () => {
    cy.navigateToDetailsScreen(COMPLAINT_TYPES.HWCR, "23-032439", true);

    //This is required to make the tests re-runnable.  It's not great because it means it will only run the first time.
    //If we ever get the ability to remove an assessment this test suite should be rewritten to remove this conditional
    //and to add a test at the end to delete the assessment.
    cy.get(".comp-outcome-report-file-review").then(function ($review) {
      if ($review.find("#file-review-save-button").length > 0) {
        cy.validateComplaint("23-032439", "Black Bear");

        cy.get("#review-required")
          .check()
          .then(() => {
            cy.get("#review-complete").check();
          });

        //validate the officer appeared
        cy.get("#file-review-officer-id").should(($div) => {
          expect($div).to.contain.text("ENV C&E Test Acct 1");
        });

        cy.get("#file-review-save-button").click();

        //validate the checkboxes
        cy.get("#review-required").should("be.checked");
        cy.get("#review-complete").should("be.checked");

        //validate the officer
        cy.get("#comp-review-required-officer").should(($div) => {
          expect($div).to.contain.text("ENV TestAcct");
        });

        //validate the toast
        cy.get(".Toastify__toast-body").then(($toast) => {
          expect($toast).to.contain.text("File review has been updated");
        });

        //validate the edit button is disabled
        cy.get("#review-edit-button").should("be.disabled");
      } else {
        cy.log("Test was previously run. Skip the Test");
        this.skip();
      }
    });
  });
});
