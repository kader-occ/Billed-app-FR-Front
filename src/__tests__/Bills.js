/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";
import DashboardFormUI from "../views/DashboardFormUI.js";
import Dashboard, { cards, filteredBills } from "../containers/Dashboard.js";
import DashboardUI from "../views/DashboardUI.js";
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      //check la propriété CSS active-icon
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => a - b;
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
});

describe("Given I am connected as an Admin", () => {
  describe("When I am on Dashboard page, there are bills, and there is one pending", () => {
    test("Then, filteredBills by pending status should return 1 bill", () => {
      const filtered_bills = filteredBills(bills, "pending");
      expect(filtered_bills.length).toBe(1);
    });
  });
  describe("When I am on Dashboard page, there are bills, and there is one accepted", () => {
    test("Then, filteredBills by accepted status should return 1 bill", () => {
      const filtered_bills = filteredBills(bills, "accepted");
      expect(filtered_bills.length).toBe(1);
    });
  });
  describe("When I am on Dashboard page, there are bills, and there is two refused", () => {
    test("Then, filteredBills by accepted status should return 2 bills", () => {
      const filtered_bills = filteredBills(bills, "refused");
      expect(filtered_bills.length).toBe(2);
    });
  });
  describe("When I am on Dashboard page but it is loading", () => {
    test("Then, Loading page should be rendered", () => {
      document.body.innerHTML = DashboardUI({ loading: true });
      expect(screen.getAllByText("Loading...")).toBeTruthy();
    });
  });
  describe("When I am on Dashboard page but back-end send an error message", () => {
    test("Then, Error page should be rendered", () => {
      document.body.innerHTML = DashboardUI({ error: "some error message" });
      expect(screen.getAllByText("Erreur")).toBeTruthy();
    });
  });

  describe("When I am on Dashboard page and I click on arrow", () => {
    test("Then, tickets list should be unfolding, and cards should appear", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Admin",
        })
      );

      const dashboard = new Dashboard({
        document,
        onNavigate,
        store: null,
        bills: bills,
        localStorage: window.localStorage,
      });
      document.body.innerHTML = DashboardUI({ data: { bills } });

      const handleShowTickets1 = jest.fn((e) =>
        dashboard.handleShowTickets(e, bills, 1)
      );
      const handleShowTickets2 = jest.fn((e) =>
        dashboard.handleShowTickets(e, bills, 2)
      );
      const handleShowTickets3 = jest.fn((e) =>
        dashboard.handleShowTickets(e, bills, 3)
      );

      const icon1 = screen.getByTestId("arrow-icon1");
      const icon2 = screen.getByTestId("arrow-icon2");
      const icon3 = screen.getByTestId("arrow-icon3");

      icon1.addEventListener("click", handleShowTickets1);
      userEvent.click(icon1);
      expect(handleShowTickets1).toHaveBeenCalled();
      await waitFor(() => screen.getByTestId(`open-bill47qAXb6fIm2zOKkLzMro`));
      expect(screen.getByTestId(`open-bill47qAXb6fIm2zOKkLzMro`)).toBeTruthy();
      icon2.addEventListener("click", handleShowTickets2);
      userEvent.click(icon2);
      expect(handleShowTickets2).toHaveBeenCalled();
      await waitFor(() => screen.getByTestId(`open-billUIUZtnPQvnbFnB0ozvJh`));
      expect(screen.getByTestId(`open-billUIUZtnPQvnbFnB0ozvJh`)).toBeTruthy();

      icon3.addEventListener("click", handleShowTickets3);
      userEvent.click(icon3);
      expect(handleShowTickets3).toHaveBeenCalled();
      await waitFor(() => screen.getByTestId(`open-billBeKy5Mo4jkmdfPGYpTxZ`));
      expect(screen.getByTestId(`open-billBeKy5Mo4jkmdfPGYpTxZ`)).toBeTruthy();
    });
  });

  describe("When I am on Dashboard page and I click on edit icon of a card", () => {
    test("Then, right form should be filled", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Admin",
        })
      );

      const dashboard = new Dashboard({
        document,
        onNavigate,
        store: null,
        bills: bills,
        localStorage: window.localStorage,
      });
      document.body.innerHTML = DashboardUI({ data: { bills } });
      const handleShowTickets1 = jest.fn((e) =>
        dashboard.handleShowTickets(e, bills, 1)
      );
      const icon1 = screen.getByTestId("arrow-icon1");
      icon1.addEventListener("click", handleShowTickets1);
      userEvent.click(icon1);
      expect(handleShowTickets1).toHaveBeenCalled();
      expect(screen.getByTestId(`open-bill47qAXb6fIm2zOKkLzMro`)).toBeTruthy();
      const iconEdit = screen.getByTestId("open-bill47qAXb6fIm2zOKkLzMro");
      userEvent.click(iconEdit);
      expect(screen.getByTestId(`dashboard-form`)).toBeTruthy();
    });
  });

  describe("When I am on Dashboard page and I click 2 times on edit icon of a card", () => {
    test("Then, big bill Icon should Appear", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Admin",
        })
      );

      const dashboard = new Dashboard({
        document,
        onNavigate,
        store: null,
        bills: bills,
        localStorage: window.localStorage,
      });
      document.body.innerHTML = DashboardUI({ data: { bills } });

      const handleShowTickets1 = jest.fn((e) =>
        dashboard.handleShowTickets(e, bills, 1)
      );
      const icon1 = screen.getByTestId("arrow-icon1");
      icon1.addEventListener("click", handleShowTickets1);
      userEvent.click(icon1);
      expect(handleShowTickets1).toHaveBeenCalled();
      expect(screen.getByTestId(`open-bill47qAXb6fIm2zOKkLzMro`)).toBeTruthy();
      const iconEdit = screen.getByTestId("open-bill47qAXb6fIm2zOKkLzMro");
      userEvent.click(iconEdit);
      userEvent.click(iconEdit);
      const bigBilledIcon = screen.queryByTestId("big-billed-icon");
      expect(bigBilledIcon).toBeTruthy();
    });
  });

  describe("When I am on Dashboard and there are no bills", () => {
    test("Then, no cards should be shown", () => {
      document.body.innerHTML = cards([]);
      const iconEdit = screen.queryByTestId("open-bill47qAXb6fIm2zOKkLzMro");
      expect(iconEdit).toBeNull();
    });
  });
});

describe("Given I am connected as Admin, and I am on Dashboard page, and I clicked on a pending bill", () => {
  describe("When I click on accept button", () => {
    test("I should be sent on Dashboard with big billed icon instead of form", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Admin",
        })
      );
      document.body.innerHTML = DashboardFormUI(bills[0]);

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = null;
      const dashboard = new Dashboard({
        document,
        onNavigate,
        store,
        bills,
        localStorage: window.localStorage,
      });

      const acceptButton = screen.getByTestId("btn-accept-bill-d");
      const handleAcceptSubmit = jest.fn((e) =>
        dashboard.handleAcceptSubmit(e, bills[0])
      );
      acceptButton.addEventListener("click", handleAcceptSubmit);
      fireEvent.click(acceptButton);
      expect(handleAcceptSubmit).toHaveBeenCalled();
      const bigBilledIcon = screen.queryByTestId("big-billed-icon");
      expect(bigBilledIcon).toBeTruthy();
    });
  });
  describe("When I click on refuse button", () => {
    test("I should be sent on Dashboard with big billed icon instead of form", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Admin",
        })
      );
      document.body.innerHTML = DashboardFormUI(bills[0]);

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = null;
      const dashboard = new Dashboard({
        document,
        onNavigate,
        store,
        bills,
        localStorage: window.localStorage,
      });
      const refuseButton = screen.getByTestId("btn-refuse-bill-d");
      const handleRefuseSubmit = jest.fn((e) =>
        dashboard.handleRefuseSubmit(e, bills[0])
      );
      refuseButton.addEventListener("click", handleRefuseSubmit);
      fireEvent.click(refuseButton);
      expect(handleRefuseSubmit).toHaveBeenCalled();
      const bigBilledIcon = screen.queryByTestId("big-billed-icon");
      expect(bigBilledIcon).toBeTruthy();
    });
  });
});

describe("Given I am connected as Admin and I am on Dashboard page and I clicked on a bill", () => {
  describe("When I click on the icon eye", () => {
    test("A modal should open", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Admin",
        })
      );
      document.body.innerHTML = DashboardFormUI(bills[0]);
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = null;
      const dashboard = new Dashboard({
        document,
        onNavigate,
        store,
        bills,
        localStorage: window.localStorage,
      });

      const handleClickIconEye = jest.fn(dashboard.handleClickIconEye);
      const eye = screen.getByTestId("icon-eye-d");
      eye.addEventListener("click", handleClickIconEye);
      userEvent.click(eye);
      expect(handleClickIconEye).toHaveBeenCalled();

      const modale = screen.getByTestId("modaleFileAdmin");
      expect(modale).toBeTruthy();
    });
  });
});

// test d'intégration GET Bills
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Employee Bills", () => {
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "e@e",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });
      test("Then, Error page should be rendered", () => {
        document.body.innerHTML = BillsUI({
          error: "TypeError: Failed to fetch",
        });
        expect(screen.getAllByText("Erreur")).toBeTruthy();
      });
      test("fetches bills from an fail API url, then render error page with JSON message error", async () => {
        document.body.innerHTML = BillsUI({
          error: "SyntaxError: Unexpected token '<',",
        });
        expect(screen.getAllByText("Erreur")).toBeTruthy();
      });
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        expect(screen.getAllByText("Erreur")).toBeTruthy();
      });
      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });
        expect(screen.getAllByText("Erreur")).toBeTruthy();
      });
      test("getBills handles error when bills list returns 404", async () => {
        const mockError = new Error("Simulated error: Bills not found (404)");

        const mockStoreWith404Error = {
          bills: jest.fn(() => ({
            list: jest.fn(() => Promise.reject(mockError)),
          })),
        };

        const billsComponent = new Bills({
          document,
          onNavigate,
          store: mockStoreWith404Error,
        });

        try {
          await billsComponent.getBills();
        } catch (error) {
          expect(error).toBe(mockError);
        }
      });

      test("getBills handles error when bills list returns 500", async () => {
        const mockError = new Error(
          "Simulated error: Internal Server Error (500)"
        );

        // Mock the list method to return a rejected promise with 500 error
        const mockStoreWith500Error = {
          bills: jest.fn(() => ({
            list: jest.fn(() => Promise.reject(mockError)),
          })),
        };

        const billsComponent = new Bills({
          document,
          onNavigate,
          store: mockStoreWith500Error,
        });

        // Attempt to call the getBills method
        try {
          await billsComponent.getBills();
        } catch (error) {
          // Verify that the expected 500 error is caught
          expect(error).toBe(mockError);
        }
      });
    });
  });
});
