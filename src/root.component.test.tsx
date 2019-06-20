import React from "react";
import Root from "./root.component";
import {
  render,
  prettyDOM,
  cleanup,
  waitForDomChange,
  waitForElement
} from "@testing-library/react";
import { FetchMock } from "@react-mock/fetch";

describe(`<Root />`, () => {
  afterEach(cleanup);

  it(`renders Root without dying`, () => {
    const { getByText } = render(
      <FetchMock
        options={{
          matcher:
            "/openmrs/ws/rest/v1/encounter?patient=testPatientId&v=custom:(encounterType,obs,encounterDatetime)",
          response: {
            results: []
          }
        }}
      >
        <Root patientUuid="testPatientId" />
      </FetchMock>
    );
    expect(getByText("Loading...")).toBeTruthy();
  });

  it(`renders the vitals encounters from most recent to least recent`, () => {
    const results = [
      {
        encounterType: {
          uuid: "67a71486-1a54-468f-ac3e-7091a9a79584"
        },
        encounterDatetime: "2019-06-20T00:00:00.000Z",
        obs: [
          {
            display: "Obs 1",
            uuid: "1"
          }
        ]
      },
      {
        encounterType: {
          uuid: "different-encounter-uuid"
        },
        encounterDatetime: "2019-06-20T00:00:00.000Z",
        obs: [
          {
            display: "Obs 2",
            uuid: "2"
          }
        ]
      },
      {
        encounterType: {
          uuid: "67a71486-1a54-468f-ac3e-7091a9a79584"
        },
        encounterDatetime: "2019-06-22T00:00:00.000Z",
        obs: [{ display: "Obs 3", uuid: "3" }, { display: "Obs 4", uuid: "4" }]
      }
    ];

    const { baseElement, getByText } = render(
      <FetchMock
        options={{
          matcher:
            "/openmrs/ws/rest/v1/encounter?patient=testPatientId&v=custom:(encounterType,obs,encounterDatetime)",
          response: {
            results
          }
        }}
      >
        <Root patientUuid="testPatientId" />
      </FetchMock>
    );

    return waitForElement(() => getByText("Vitals")).then(() => {
      expect(() => getByText("Obs 1")).toThrow();
      expect(() => getByText("Obs 2")).toThrow();
      expect(getByText("Obs 3")).toBeTruthy();
      expect(getByText("Obs 4")).toBeTruthy();
    });
  });
});
