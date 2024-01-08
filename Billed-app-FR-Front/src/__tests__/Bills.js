/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import store from "../__mocks__/store.js";
import router from "../app/Router.js";
import mockStore from "../__mocks__/store"


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      const activeWindowIcon = windowIcon.className;

      expect(activeWindowIcon).toEqual('active-icon');

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)

      expect(dates).toEqual(datesSorted)
    })
    test("Then when I click on new bill button, location url should end with '#employee/bill/new'", () => {    //add new test 

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      const bills_ = new Bills({ document, onNavigate, store, localStorage });
      bills_.handleClickNewBill();

      expect(document.location.href.split("#")[1]).toEqual("employee/bill/new");
    })
    test("Then when a bill icon-eye is clicked, modal should open", async () => {    //add new test
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      document.body.innerHTML = BillsUI({ data: bills })
      const bills_ = new Bills({ document, onNavigate, store, localStorage })

      const modale = document.getElementById("modaleFile")
      $.fn.modal = jest.fn(() => modale.classList.add("show"))

      const iconEye = screen.getAllByTestId("icon-eye")[0]
      const handleClickIconEye = jest.fn(bills_.handleClickIconEye(iconEye))

      iconEye.addEventListener("click", handleClickIconEye)
      userEvent.click(iconEye)

      expect(handleClickIconEye).toHaveBeenCalled()
      expect(modale.classList).toContain("show")
      expect(screen.getByText("Justificatif")).toBeTruthy()
      expect(bills[0].fileUrl).toBeTruthy()

    })
    test("Then bills from database should be loaded", async () => { //add new test
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      const bills_ = new Bills({ document, onNavigate, store, localStorage });
      const data = await bills_.getBills();

      expect(typeof data).toBe("object");
      expect(data.length).toBeGreaterThanOrEqual(0);
    })
    //test d'intégration GET

    describe("When I navigate to Bills page", () => {
      test("fetch bills from mock API GET", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)

        expect(screen.getAllByText("Billed")).toBeTruthy();
        expect(screen.getByTestId("tbody")).toBeTruthy();
      })
    })
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
          window,
          'localStorage', { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "a@a"
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })
      test("fetches bills from an API and fails with 404 message error", async () => {
        const html = BillsUI({ error: 'Erreur 404' })
        document.body.innerHTML = html;
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      })

      test("fetches messages from an API and fails with 500 message error", async () => {
        const html = BillsUI({ error: 'Erreur 500' })
        document.body.innerHTML = html;
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      })
    })
  })
})


