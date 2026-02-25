import { useEffect, useState } from "react";
import { serviceShiftAPI } from "../../api/serviceShift";
import { categorizeError } from "../../api/fetchClient";
import ServerError from "../ServerError";

function getMassEmailSubject(shift) {
  const start = new Date(shift.shift_start);
  const end = new Date(shift.shift_end);

  return `Volunteer Shift on ${start.getMonth() + 1}/${start.getDate()} ${start.getHours()}:${start.getMinutes()}-${end.getHours()}:${end.getMinutes()}`;
}

const ShiftUserInfoDisplay = ({ shift, onDismiss, isOpen }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userInfos, setUserInfos] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!shift || !shift._id) return;
    setIsLoading(true);
    setError(false);
    serviceShiftAPI.getUserInfosInShift(shift._id).then((infos) => {
      setUserInfos(infos);
      setIsLoading(false);
    }).catch((e) => {
      console.error("Error fetching user infos:", e);
      setError(categorizeError(e));
      setIsLoading(false);
    });
  }, [shift]);

  if (!shift) {
    return null;
  }

  if (error === true) return <ServerError />;

  if (error) {
    return (
      isOpen && (
        <div className={"modal-overlay"} onClick={onDismiss}>
          <div className={"modal-content d-flex flex-column align-items-center"}>
            <p className="message error">{error}</p>
          </div>
        </div>
      )
    );
  }

  const massEmailBccEncoded = encodeURIComponent(userInfos.map((x) => x.email).join(","));
  const massEmailSubjectEncoded = encodeURIComponent(getMassEmailSubject(shift));
  const massEmailHref = `https://mail.google.com/mail/?view=cm&fs=1&bcc=${massEmailBccEncoded}&su=${massEmailSubjectEncoded}`;

  return (
    isOpen &&
    shift?._id !== null && (
      <>
        <div className={"modal-overlay"} onClick={onDismiss}>
          <div
            className={"modal-content overflow-hidden d-flex flex-column align-items-center"}
            onClick={(e) => e.stopPropagation()}>
            <div className={"d-flex justify-content-between w-100 mx-5"}>
              <h1>Volunteer Info</h1>
              <div className={"d-flex align-items-end justify-content-start flex-column"}>
                <p>
                  Volunteers: {shift.volunteers.length}/{shift.required_volunteer_count}
                </p>
                {!isLoading && (
                  <a
                    className="btn btn-info d-flex align-items-center"
                    href={massEmailHref}
                    target="_blank"
                    title="Email all volunteers via Gmail"
                    rel="noreferrer">
                    Send Email to All
                    <span className="material-symbols-outlined ms-2">mail</span>
                  </a>
                )}
              </div>
            </div>
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <table className={"table mx-6 my-2"}>
                <thead>
                  <tr>
                    <td>Name</td>
                    <td>Phone#</td>
                    <td>Email</td>
                  </tr>
                </thead>
                <tbody>
                  {userInfos.map((userInfo) => (
                    <tr key={userInfo.email}>
                      <td>
                        {userInfo.first_name === null && userInfo.last_name === null
                          ? "EMPTY"
                          : userInfo.first_name + " " + userInfo.last_name}
                      </td>
                      <td>{userInfo.phone_number ?? "EMPTY"}</td>
                      <td>
                        <div className="d-flex">
                          {userInfo.email}
                          <a
                            className="btn btn-info ms-3"
                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(userInfo.email)}`}
                            target="_blank"
                            title="Send Email via Gmail"
                            rel="noreferrer">
                            <span className="material-symbols-outlined">mail</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </>
    )
  );
};

export default ShiftUserInfoDisplay;
