import React from "react";

export default function ModalContainer({ modal, close }) {
  const { id, type, title, message } = modal;

  const stopClose = (e) => e.stopPropagation();

  return (
    <div className="modal-overlay open" onClick={() => close(id, type === "confirm" ? false : undefined)}>
      <div className="modal" onClick={stopClose}>
        <button
          className="modal-close-x"
          onClick={() => close(id, type === "confirm" ? false : undefined)}
        >
          ✕
        </button>
        <div className="modal-title">{title}</div>
        <div className="modal-sub">{message}</div>
        <div className="modal-actions">
          {type === "confirm" && (
            <button className="btn btn-outline" onClick={() => close(id, false)}>
              Cancel
            </button>
          )}
          <button
            className={`btn ${type === "confirm" ? "btn-danger" : "btn-primary"}`}
            onClick={() => close(id, type === "confirm" ? true : undefined)}
          >
            {type === "confirm" ? "Yes" : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
}