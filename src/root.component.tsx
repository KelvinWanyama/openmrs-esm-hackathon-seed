import React from "react";
import dateFormat from "dateformat";

export default function Root(props: RootProps) {
  const [encounter, setEncounter] = React.useState(null);
  let encounterTypeUuid = "67a71486-1a54-468f-ac3e-7091a9a79584";
  let baseURL = "/openmrs/ws/rest/v1/encounter?patient=";

  React.useEffect(() => {
    const queryParams = `custom:(encounterType,obs,encounterDatetime)`.replace(
      /\s/g,
      ""
    );

    const abortController = new AbortController();

    fetch(`${baseURL}${props.patientUuid}&v=${queryParams}`, {
      signal: abortController.signal
    })
      .then(resp => {
        if (resp.ok) {
          return resp.json();
        } else {
          throw Error(
            `Cannot fetch patient ${props.patientUuid} vitals - server responded with '${resp.status}'`
          );
        }
      })
      .then(encounter => {
        let orderedEncounter = encounter.results
          .filter(enc => enc.encounterType.uuid === encounterTypeUuid)
          .sort(
            (a, b) =>
              new Date(b.encounterDatetime).getTime() -
              new Date(a.encounterDatetime).getTime()
          );
        if (orderedEncounter) {
          encounter = orderedEncounter[0];
          setEncounter(encounter);
        } else {
          renderNull();
        }
      });

    return () => abortController.abort();
  }, []);

  return renderEncounters();

  function renderEncounters() {
    if (encounter) {
      return displayVitals();
    } else {
      return loadingVitals();
    }
  }

  function displayVitals() {
    return (
      <div className="card">
        <div className="card-header">
          <h5 className="card-title">Vitals</h5>
        </div>
        <div className="card-body">
          <p className="font-weight-bold">
            Last Vitals:{" "}
            {dateFormat(encounter.encounterDatetime, "dd mmmm yyyy hh:mm TT")}
          </p>
          <div>
            {encounter.obs.map(obs => (
              <p className="list-group-item" key={obs.uuid}>
                {obs.display}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function loadingVitals() {
    return <div>Loading...</div>;
  }

  function renderNull() {
    return <div> No results found 404!</div>;
  }
}
type RootProps = {
  patientUuid: string;
};
