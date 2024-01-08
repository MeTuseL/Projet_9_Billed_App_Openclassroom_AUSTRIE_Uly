/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import mockStore from "../__mocks__/store"
import router from "../app/Router"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import store from "../__mocks__/store.js";
import userEvent from "@testing-library/user-event"

beforeAll(() => {
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
    })
  );
});

beforeEach(() => {
  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.append(root);
  router();

  document.body.innerHTML = NewBillUI();

  window.onNavigate(ROUTES_PATH.NewBill);
});

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {

      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')

      const activeMailIcon = mailIcon.className;
      expect(activeMailIcon).toEqual('active-icon');

    })
    test("Then NewBill form should be displayed", async () => {
      await waitFor(() => screen.getAllByText("Envoyer une note de frais"))
      const firstInputLabelText = screen.getAllByText("Type de dépense")
      expect(firstInputLabelText).toBeTruthy()
    })
    test("Then when user click on submit, handleSubmit function should be called", () => {


      const newBill = new NewBill({ document, onNavigate, store, localStorage });

      newBill.isFormatValid = true;
      const newBillForm = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn(newBill.handleSubmit);
      newBillForm.addEventListener("submit", handleSubmit);
      fireEvent.submit(newBillForm);

      expect(handleSubmit).toHaveBeenCalled();
    })
    test("Then when a file with incorrect extension is selected, handleChangeFile should be called", async () => {

      const newBill = new NewBill({ document, onNavigate, store, localStorage });

      const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
      const fileInput = screen.getByTestId("file");
      fileInput.addEventListener("change", handleChangeFile);
      await waitFor(() => {
        fireEvent.change(fileInput, {
          target: {
            files: [new File(["test"], "test.txt", { type: "image/txt" })],
          },
        });
      });

      expect(handleChangeFile).toHaveBeenCalled();
      expect(fileInput.files[0].name).toBe("test.txt");

    });
    // test d'intégration POST
    describe("When I want to add a new bill", () => {
      test("Then create new bill from mock API POST", async () => {


        const logSpy = jest.spyOn(mockStore, "bills");
        const bill = {
          id: "47qAXb6fIm2zOKkLzMro",
          vat: "80",
          fileUrl: "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
          status: "pending",
          type: "Hôtel et logement",
          commentary: "séminaire billed",
          name: "encore",
          fileName: "preview-facture-free-201801-pdf-1.jpg",
          date: "2004-04-04",
          amount: 400,
          commentAdmin: "ok",
          email: "a@a",
          pct: 20,
        };
        const logBills = await mockStore.bills().update(bill);

        expect(logSpy).toHaveBeenCalled();
        expect(logBills).toStrictEqual(bill);
      })
    })
    describe("When an error occurs on API", () => {
      test("Then add bills from an API and fails with 404 message error", async () => {
        const logSpy = jest.spyOn(mockStore, "bills").mockImplementationOnce(() => {
            return {
              create: jest.fn().mockRejectedValue(new Error("Erreur 404")),
            }
          })

        await expect(logSpy().create).rejects.toThrow("Erreur 404");
        expect(logSpy).toHaveBeenCalled();
      })
      test("Then add bills from an API and fails with 500 message error", async () => {

        const logSpy = jest.spyOn(mockStore, "bills").mockImplementationOnce(() => {
          return {
            create: jest.fn().mockRejectedValue(new Error("Erreur 500")),
          };
        });

        await expect(logSpy().create).rejects.toThrow("Erreur 500");
        expect(logSpy).toHaveBeenCalled();

      })
    })
  })
})
